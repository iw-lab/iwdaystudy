/**
 * 문항 콘텐츠 결정론 게이트.
 * 전 학년(1~6)×학기(1~2) 조합에서 대량 세트를 생성해 다음을 검사한다:
 *   ① 조사 플레이스홀더 잔존 (예: "정원을(를)")
 *   ② 숫자+조사 오류 (예: "6를", "3와")
 *   ③ 받침없음+'으로' 오류 (예: "배으로")
 *   ④ 4지선다 보기 중복
 *   ⑤ 정답이 보기 목록에 없음
 *   ⑥ undefined/NaN/[object Object] 노출
 * 결함이 0이 아니면 exit 1.
 *
 * 실행: npx tsx scripts/verify-content.ts
 * (환경변수 VERIFY_SETS_PER_COMBO로 세트 수 조절 가능, 기본 100)
 */
import { generateDailySet } from "../src/lib/daily-set-generator";
import { numberHasBatchim, hasBatchim, isRieul } from "../src/lib/korean-josa";

const SETS_PER_COMBO = Number(process.env.VERIFY_SETS_PER_COMBO || 100);

type Defect = { rule: string; where: string; snippet: string };
const defects: Defect[] = [];
const seenKeys = new Set<string>(); // 결함 중복 리포트 억제(같은 문항 반복 노출 방지)

function flag(rule: string, where: string, snippet: string) {
  const key = `${rule}|${where}|${snippet}`;
  if (seenKeys.has(key)) return;
  seenKeys.add(key);
  defects.push({ rule, where, snippet });
}

// ── ① 조사 플레이스홀더 잔존 ──────────────────────────────────
const PLACEHOLDER_RE =
  /[을를은는이가와과]\([을를은는이가와과]\)|으로\(로\)|로\(으로\)|이라고\(라고\)|이라는\(라는\)|이라도\(라도\)|이라\(라\)/g;

// ── ② 숫자 + 조사 오류 ────────────────────────────────────────
// 분수 a/b 는 «b분의 a» 로 읽으니 받침은 분자(a)로 본다(2/3가 · 3/4이)
const NUM_JOSA_RE = /(?:(\d+)\/)?(\d+)\s*(이|가|은|는|을|를|와|과)(?![가-힣])/g;

// ── ③ 받침없음 + '으로' 오류 ──────────────────────────────────
const NO_BATCHIM_EURO_RE = /([가-힣])으로(?![가-힣])/g;

// ── ⑥ undefined/NaN/[object Object] 노출 ─────────────────────
const GARBAGE_RE = /undefined|NaN|\[object Object\]/;

function scanText(text: string, where: string) {
  if (!text) return;

  for (const m of text.matchAll(PLACEHOLDER_RE)) {
    flag("①조사 플레이스홀더 잔존", where, `…${excerpt(text, m.index!)}…`);
  }

  for (const m of text.matchAll(NUM_JOSA_RE)) {
    const nb = numberHasBatchim(parseInt(m[1] ?? m[2], 10));
    const j = m[3];
    const bad =
      (nb && (j === "가" || j === "는" || j === "를" || j === "와")) ||
      (!nb && (j === "이" || j === "은" || j === "을" || j === "과"));
    if (bad) flag("②숫자+조사 오류", where, `…${excerpt(text, m.index!)}…`);
  }

  for (const m of text.matchAll(NO_BATCHIM_EURO_RE)) {
    if (hasBatchim(m[1])) continue;
    flag("③받침없음+으로 오류", where, `…${excerpt(text, m.index!)}…`);
  }

  if (GARBAGE_RE.test(text)) {
    flag("⑥undefined/NaN/[object Object] 노출", where, `…${excerpt(text, text.search(GARBAGE_RE))}…`);
  }
}

function excerpt(s: string, i: number, ctx = 20): string {
  return s.slice(Math.max(0, i - ctx), Math.min(s.length, i + ctx)).replace(/\n/g, " ");
}

function walkText(v: unknown, where: string) {
  if (typeof v === "string") scanText(v, where);
  else if (Array.isArray(v)) v.forEach((x, i) => walkText(x, `${where}[${i}]`));
  else if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v as Record<string, unknown>))
      walkText(x, `${where}.${k}`);
}

// ── ④ 보기 중복 / ⑤ 정답이 보기에 없음 ────────────────────────
function extractChoices(content: any): string[] | null {
  if (!content || typeof content !== "object") return null;
  const c = content.choices ?? content.options;
  if (Array.isArray(c) && c.every((x) => typeof x === "string")) return c;
  return null;
}

function extractCorrect(answer: any): string | null {
  if (answer == null) return null;
  if (typeof answer === "string") return answer;
  if (typeof answer === "object") {
    if (typeof answer.correct === "string") return answer.correct;
    if (typeof answer.text === "string") return answer.text;
  }
  return null;
}

let totalQuestions = 0;
let choiceQuestions = 0;

for (const grade of [1, 2, 3, 4, 5, 6]) {
  for (const semester of [1, 2] as const) {
    const seen = new Set<string>();
    for (let i = 0; i < SETS_PER_COMBO; i++) {
      const set = generateDailySet(grade, semester, new Set(seen));
      seen.add(set.set.id);
      for (const q of set.questions) {
        totalQuestions++;
        const where = `g${grade}s${semester}/${q.subject}/${q.question_type}`;
        walkText(q.title, `${where}.title`);
        walkText(q.content, `${where}.content`);
        walkText(q.answer, `${where}.answer`);
        walkText(q.explanation, `${where}.explanation`);
        walkText(q.hint, `${where}.hint`);

        // ⑥ O/X 단추(variant tf)인데 정답이 O/X 가 아니거나 문장에 빈칸이 남음 — 화면은 O/X 만 그려 못 맞힌다(2026-10-16)
        const qc = q.content as { variant?: string; text?: string };
        if (qc?.variant === "tf") {
          const ox = String((q.answer as { correct?: unknown })?.correct ?? "").trim();
          if (ox !== "O" && ox !== "X" || String(qc.text ?? "").includes("___"))
            flag("⑥O/X 단추·빈칸/낱말 정답", where, `${qc.text} → ${ox}`);
        }

        const choices = extractChoices(q.content);
        if (choices && choices.length > 0) {
          choiceQuestions++;
          const norm = choices.map((c) => c.trim());
          const uniq = new Set(norm);
          if (uniq.size !== norm.length) {
            flag("④보기 중복", where, JSON.stringify(choices));
          }
          const correct = extractCorrect(q.answer);
          if (correct != null && !norm.includes(correct.trim())) {
            flag(
              "⑤정답이 보기에 없음",
              where,
              `정답="${correct}" 보기=${JSON.stringify(choices)}`,
            );
          }
        }
      }
    }
  }
}

console.log(
  `검사 세트: ${SETS_PER_COMBO}개 × 학년6 × 학기2 = ${SETS_PER_COMBO * 12}세트`,
);
console.log(`검사 문항 ${totalQuestions}건 (4지선다형 ${choiceQuestions}건)`);

if (defects.length === 0) {
  console.log("✅ 결함 0");
} else {
  const byRule = new Map<string, number>();
  for (const d of defects) byRule.set(d.rule, (byRule.get(d.rule) ?? 0) + 1);
  console.log(`❌ 결함 ${defects.length}건 (유니크)\n`);
  for (const [rule, count] of [...byRule].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${rule}: ${count}건`);
  }
  console.log("\n─ 상세(최대 80건) ─");
  for (const d of defects.slice(0, 80)) {
    console.log(`[${d.rule}] ${d.where}\n    ${d.snippet}`);
  }
  process.exit(1);
}
