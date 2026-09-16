/**
 * "밑줄 친 …" 지시문 결정론 게이트.
 *
 * 배경(2026-09-16 실측): 영어 문항이 "밑줄 친 낱말에 해당하는 영단어를 고르세요"라고 하면서
 * 화면엔 밑줄이 하나도 없는 사례가 대량으로 있었다. 원인은 두 가지였다.
 *   ① targetKo(밑줄 대상)가 아예 없는 엔트리 — 정적 데이터 583건이 무라벨
 *   ② targetKo 는 있는데 템플릿이 글로스를 활용해 넣어("먹다"→"먹자") 번역문에 그 문자열이 없음
 * 또 'word' 변형은 지시문이 "밑줄 친 단어의 뜻을 쓰세요"인데 화면은 빈칸+4지선다였다.
 *
 * 이 게이트가 막는 것:
 *   ⓐ 밑줄을 언급하는 문항인데 강조할 대상이 없음
 *   ⓑ meaning 변형의 targetKo 가 번역문의 부분문자열이 아님
 *   ⓒ 수관형사 비문("영 개의", "첫 번째 마리의") 재발
 *
 * 실행: npx tsx scripts/verify-underline.ts   (VERIFY_SETS_PER_COMBO 로 세트 수 조절)
 */
import { generateDailySet } from "../src/lib/daily-set-generator";
import {
  generateEnglishPool,
  surfaceForm,
} from "../src/lib/curriculum/generators/english-generator";
import { naturalizeKorean } from "../src/lib/korean-josa";
import { grade3EnglishData } from "../src/lib/curriculum/grade3";
import { grade4EnglishData } from "../src/lib/curriculum/grade4";
import { grade5EnglishData } from "../src/lib/curriculum/grade5";
import { grade6EnglishData } from "../src/lib/curriculum/grade6";

const SETS_PER_COMBO = Number(process.env.VERIFY_SETS_PER_COMBO || 60);
// 게이트가 "아무것도 안 돌고 통과"하는 것을 막는다 — 0·NaN·음수면 즉시 실패.
if (!Number.isInteger(SETS_PER_COMBO) || SETS_PER_COMBO < 1) {
  console.error(`✗ VERIFY_SETS_PER_COMBO 가 양의 정수가 아님: ${process.env.VERIFY_SETS_PER_COMBO}`);
  process.exit(1);
}

// 밑줄 대상이 유효한가 — 빈 문자열은 includes("")가 항상 true 라 통과해 버린다(교차검증 지적).
// 부분문자열이기만 하면 통과시키면 "앉으세요"의 '으세'처럼 어절 한가운데를 자른 조각도
// 통과한다 → 밑줄은 반드시 **어절의 시작**에서 시작해야 한다(조사만 남기고 끝나는 건 허용:
// "레몬을"에서 "레몬"에 밑줄 긋는 것은 정상).
function hasValidTarget(target: unknown, shown: unknown): boolean {
  if (typeof target !== "string" || typeof shown !== "string") return false;
  const t = target.trim();
  if (!t) return false;
  const idx = shown.indexOf(t);
  if (idx === -1) return false;
  return idx === 0 || /[\s"'(]/.test(shown[idx - 1]);
}

type Defect = { rule: string; where: string; snippet: string };
const defects: Defect[] = [];
const seenKeys = new Set<string>();
function flag(rule: string, where: string, snippet: string) {
  const key = `${rule}|${where}|${snippet}`;
  if (seenKeys.has(key)) return;
  seenKeys.add(key);
  defects.push({ rule, where, snippet });
}

// 수관형사 비문(서수·0이 분류사 앞에 온 경우)
// 서수 목록을 고정 나열하면 '네 번째'가 다시 새는 클래스다 → 일반화(교차검증 MINOR 지적).
const COUNTER_NONSENSE =
  /(영|[가-힣]+\s*번째)\s+(개|권|명|마리|장|대|잔|그루|송이|켤레|자루)의/;

// [템플릿, 글로스, 기대 밑줄] — 명사(원형 유지)·동사(활용)·형용사(서술형) 각 1
const SURFACE_CASES: [{ s: (w: string) => string; t: (k: string) => string }, string, string][] = [
  [{ s: (w) => `I like ${w}.`, t: (k) => `나는 ${k}을(를) 좋아해요.` }, "사과", "사과"],
  [{ s: (w) => `Let's ${w}!`, t: (k) => `같이 ${k === "먹다" ? "먹자" : k}!` }, "먹다", "먹자"],
];

let total = 0;
let meaningTotal = 0;
let meaningUnderlined = 0;

for (let grade = 1; grade <= 6; grade++) {
  for (const semester of [1, 2]) {
    const seen = new Set<string>();
    for (let i = 0; i < SETS_PER_COMBO; i++) {
      const set = generateDailySet(grade, semester, new Set(seen));
      seen.add(set.set.id);
      // meaning→word 강등이 세트 구성을 깨지 않는지(문항 수·중복 없음) — 교차검증 지적 반영
      if (set.questions.length !== set.set.total_questions)
        flag(
          "세트 문항 수가 선언값과 다름",
          `g${grade}s${semester}`,
          `questions=${set.questions.length} total_questions=${set.set.total_questions}`,
        );
      const ids = new Set(set.questions.map((q) => q.id));
      if (ids.size !== set.questions.length)
        flag("세트 안에 중복 문항 id", `g${grade}s${semester}`, `unique=${ids.size}/${set.questions.length}`);
      for (const q of set.questions) {
        total++;
        const where = `g${grade}s${semester}/${q.subject}`;
        const c = (q.content ?? {}) as Record<string, unknown>;
        const texts = [q.title, c.text, c.prompt, c.question, q.explanation, q.hint].filter(
          (t): t is string => typeof t === "string",
        );

        // ⓒ 수관형사 비문
        for (const t of [...texts, String(c.translation ?? "")]) {
          const m = t.match(COUNTER_NONSENSE);
          if (m) flag("수관형사 비문", where, t.slice(0, 80));
        }

        if (q.subject === "english" && c.variant === "meaning") {
          meaningTotal++;
          const tr = String(c.translation ?? c.meaning ?? "");
          const tk = String(c.targetKo ?? "");
          // ⓑ meaning 변형은 화면이 "밑줄 친 낱말"을 가리키므로 밑줄이 반드시 그려져야 한다
          if (!tk.trim()) flag("meaning 변형에 밑줄 대상(targetKo) 없음", where, `"${tr}" word=${String(c.word)}`);
          else if (!tr.includes(tk))
            flag("targetKo 가 번역문에 없어 밑줄이 안 그려짐", where, `target='${tk}' tr="${tr}"`);
          else meaningUnderlined++;
        }

        // ⓐ 밑줄을 말하는데 강조 대상이 없는 문항(전 과목)
        const mentions = texts.find((t) => /밑줄 친/.test(t));
        if (mentions) {
          const hasTarget =
            hasValidTarget(c.targetKo, c.translation) ||
            hasValidTarget(c.underline, c.text);
          if (!hasTarget)
            flag("지시문은 '밑줄 친'인데 밑줄 대상이 없음", where, mentions.slice(0, 80));
        }
      }
    }
  }
}

// ── surfaceForm 추론 자체검사 ───────────────────────────────────────────────
// 밑줄 대상을 diff 로 추론하는 함수가 엉뚱한 어절을 잡는지 고정 입력으로 확인한다.
// (교차검증 CRITICAL 지적: 추론 함수의 정확성이 어디서도 검증되지 않았다)
for (const [tmpl, gloss, expect] of SURFACE_CASES) {
  const translation = naturalizeKorean(tmpl.t(gloss));
  const got = surfaceForm(tmpl, gloss, translation);
  if (got !== expect)
    flag(
      "surfaceForm 추론 결과가 기대와 다름",
      "english-generator.surfaceForm",
      `gloss='${gloss}' tr="${translation}" got='${got}' expect='${expect}'`,
    );
  else if (!hasValidTarget(got, translation))
    flag("surfaceForm 결과가 어절 경계에 안 맞음", "english-generator.surfaceForm", `${got} / ${translation}`);
}

// ── 풀 커버리지 ────────────────────────────────────────────────────────────
// 위 세트 검사만으로는 부족하다: 생성기가 밑줄 없는 엔트리를 'word'로 강등하므로
// 데이터에서 라벨이 통째로 사라져도 세트 검사는 늘 0결함으로 통과한다(교차검증 CRITICAL 지적).
// 그래서 엔트리 풀을 직접 열어 밑줄 대상 보유율의 바닥을 지킨다.
const MIN_COVERAGE = Number(process.env.VERIFY_UNDERLINE_MIN_COVERAGE || 0.9);
let poolTotal = 0;
let poolWithTarget = 0;
for (const grade of [3, 4, 5, 6]) {
  for (let seed = 1; seed <= 10; seed++) {
    for (const d of [1, 2, 3] as const) {
      for (const e of generateEnglishPool(grade, seed, d)) {
        poolTotal++;
        if (hasValidTarget(e.targetKo, e.translation)) poolWithTarget++;
        else if (e.targetKo && !(e.translation ?? "").includes(e.targetKo))
          flag(
            "풀 엔트리의 targetKo 가 번역문에 없음",
            `g${grade}`,
            `target='${e.targetKo}' tr="${e.translation}"`,
          );
      }
    }
  }
}
// 정적 학년별 데이터(grade3~6EnglishData)는 generateEnglishPool 를 거치지 않는 별도 경로다.
// 여기를 안 보면 라벨이 깨져도 게이트가 조용히 통과한다(2026-09-16 결함 주입으로 실증).
let staticTotal = 0;
let staticWithTarget = 0;
for (const [g, bank] of [
  [3, grade3EnglishData],
  [4, grade4EnglishData],
  [5, grade5EnglishData],
  [6, grade6EnglishData],
] as const) {
  for (const e of bank ?? []) {
    staticTotal++;
    if (hasValidTarget(e.targetKo, e.translation)) staticWithTarget++;
    else if (e.targetKo)
      flag(
        "정적 영어 데이터의 targetKo 가 번역문에 없음",
        `grade${g}EnglishData`,
        `target='${e.targetKo}' tr="${e.translation}"`,
      );
  }
}
if (staticTotal && staticWithTarget / staticTotal < MIN_COVERAGE)
  flag(
    "정적 영어 데이터의 밑줄 대상 보유율이 바닥 아래",
    "grade3~6EnglishData",
    `${((staticWithTarget / staticTotal) * 100).toFixed(1)}% (${staticWithTarget}/${staticTotal})`,
  );

const coverage = poolTotal ? poolWithTarget / poolTotal : 0;
if (coverage < MIN_COVERAGE)
  flag(
    "영어 엔트리 풀의 밑줄 대상 보유율이 바닥 아래",
    "english-pool",
    `${(coverage * 100).toFixed(1)}% < ${(MIN_COVERAGE * 100).toFixed(0)}% (${poolWithTarget}/${poolTotal})`,
  );

console.log(`검사 문항 ${total.toLocaleString()}건 (조합당 ${SETS_PER_COMBO}세트)`);
console.log(
  `정적 영어 데이터 밑줄 대상 보유율 ${((staticWithTarget / (staticTotal || 1)) * 100).toFixed(1)}% (${staticWithTarget}/${staticTotal})`,
);
console.log(
  `영어 엔트리 풀 밑줄 대상 보유율 ${(coverage * 100).toFixed(1)}% (${poolWithTarget.toLocaleString()}/${poolTotal.toLocaleString()}, 바닥 ${(MIN_COVERAGE * 100).toFixed(0)}%)`,
);
console.log(
  `영어 meaning 변형 ${meaningTotal}건 중 밑줄 정상 ${meaningUnderlined}건` +
    (meaningTotal ? ` (${((meaningUnderlined / meaningTotal) * 100).toFixed(1)}%)` : ""),
);
if (defects.length === 0) {
  console.log("✓ 결함 0 — 밑줄을 말하는 문항은 모두 실제 밑줄 대상을 가진다");
  process.exit(0);
}
console.error(`\n✗ 결함 ${defects.length}건`);
for (const d of defects.slice(0, 40)) console.error(`  [${d.rule}] ${d.where}\n    ${d.snippet}`);
process.exit(1);
