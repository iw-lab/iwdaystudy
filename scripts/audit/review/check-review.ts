/**
 * 전수검수 게이트 — 배포 전에 돌린다. 하나라도 어기면 exit 1.
 *  ① 검수 안 된 항목 0: 앱이 낼 수 있는 문제 은행 항목(조합형 독해 제외)이 전부 reviewed-keys.txt 에 있다
 *  ② 뺀 항목("D")이 검수 반영 뒤 풀에 남아 있지 않다
 *  ③ 풀이 너무 작아지지 않았다(학년·풀마다 FLOOR 이상 — 매일 같은 문제가 도는 것을 막는다)
 *  ④ 조합형 독해: 정답이 보기에 있고 보기 4개가 서로 다르며, 3~6학년은 «다른 주제 문장» 보기가 없다
 *
 *   npx tsx scripts/audit/review/check-review.ts [--seeds 40] [--grade 4]
 *   REVIEW_INJECT=unreviewed|keepdrop|floor 로 일부러 깨 빨강을 본다(게이트 시험)
 */
import { readFileSync } from "node:fs";
import { buildPools } from "../../../src/lib/daily-set-generator";
import { reviewKey, verdictOf } from "../../../src/lib/content-review";
import "./load-review-sync";
import { TOPICS_34, TOPICS_56 } from "../../../src/lib/curriculum/generators/reading-generator";

const HERE = new URL("./", import.meta.url).pathname;
const args = process.argv.slice(2);
const SEEDS = Number(args[args.indexOf("--seeds") + 1] || 40) || 40;
const ONLY = args.includes("--grade") ? Number(args[args.indexOf("--grade") + 1]) : 0;
const INJECT = process.env.REVIEW_INJECT || "";
// 낱말 변형 풀(관용어·다의어·비슷한말·반대말·낱말 퍼즐)은 원래 15~40개짜리 곁가지라 하한을 낮게 — 1학년엔 관용어가 어려워 빠지는 게 맞다(2026-10-26)
const FLOOR: Record<string, number> = { default: 60, idioms: 4, multiMeaningWords: 4, synonymPairs: 4, antonymPairs: 4, wordPuzzles: 4, math: 10, korean: 40 };
const SUBJ = ["math", "korean", "english", "science", "social", "spelling", "vocabulary", "hanja", "general_knowledge", "safety", "writing", "creative"];
const acc = (a: number) => Object.fromEntries(SUBJ.map((s) => [s, { accuracy: a }]));

const reviewed = new Set(readFileSync(HERE + "verdicts/reviewed-keys.txt", "utf8").split("\n").filter(Boolean));
// unreviewed 주입은 검사하는 학년 안의 키를 지운다(다른 학년 키를 지우면 그 학년을 안 볼 때 초록이 된다)
let injectedUnreviewed = INJECT !== "unreviewed";
const staticReading = new Set<string>();
for (let g = 1; g <= 6; g++) {
  for (const l of readFileSync(HERE + `reading-static-g${g}.jsonl`, "utf8").split("\n").filter(Boolean)) staticReading.add(JSON.parse(l).key);
}
const otherTopicSentences = new Map<string, Set<string>>(); // 주제 → 다른 주제들의 정의·특징
const all34 = TOPICS_34.flatMap((t) => [t.definition, ...t.features]);
for (const t of TOPICS_34) otherTopicSentences.set(t.subject, new Set(all34.filter((x) => x !== t.definition && !t.features.includes(x))));

const fails: string[] = [];
const fail = (m: string) => { if (fails.length < 200) fails.push(m); };
const unrev: Record<string, number> = {};
const sizes: Record<string, number> = {};

for (let g = 1; g <= 6; g++) {
  if (ONLY && g !== ONLY) continue;
  const seenRaw = new Set<string>();
  const minSize: Record<string, number> = {};
  const rawMax: Record<string, number> = {};
  for (const s of [1, 2]) {
    for (const a of [undefined, acc(30), acc(90)]) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const raw = buildPools(g, s, seed, a, { review: false }) as unknown as Record<string, unknown[]>;
        if (!injectedUnreviewed && raw.knowledge?.length) { reviewed.delete(reviewKey(g, "knowledge", raw.knowledge[0])); injectedUnreviewed = true; }
        for (const [pool, arr] of Object.entries(raw)) {
          if (!Array.isArray(arr)) continue;
          for (const e of arr) {
            const k = reviewKey(g, pool, e);
            if (seenRaw.has(k)) continue;
            seenRaw.add(k);
            if (pool === "koreanReading" && !staticReading.has(k)) continue; // 조합형 = 주제 표 검수
            if (!reviewed.has(k)) unrev[`g${g}/${pool}`] = (unrev[`g${g}/${pool}`] || 0) + 1;
          }
        }
        for (const [pool, arr] of Object.entries(raw)) if (Array.isArray(arr)) rawMax[pool] = Math.max(rawMax[pool] ?? 0, arr.length);
        const done = buildPools(g, s, seed, a) as unknown as Record<string, unknown[]>;
        if (INJECT === "keepdrop") done.knowledge = [...(done.knowledge || []), ...((raw.knowledge || []).filter((e) => verdictOf(g, "knowledge", e) === "D").slice(0, 1))];
        if (INJECT === "floor") done.idioms = (done.idioms || []).slice(0, 2);
        for (const [pool, arr] of Object.entries(done)) {
          if (!Array.isArray(arr)) continue;
          minSize[pool] = Math.min(minSize[pool] ?? Infinity, arr.length);
          for (const e of arr) {
            if (pool !== "koreanReading" || staticReading.has(reviewKey(g, pool, e))) {
              if (verdictOf(g, pool, e) === "D") fail(`② g${g} ${pool} 뺀 항목이 남음: ${JSON.stringify(e).slice(0, 80)}`);
            }
            if (pool === "koreanReading") {
              const r = e as { passage: string; question: string; choices: string[]; correct: string };
              if (!r.choices?.includes(r.correct)) fail(`④ g${g} 정답이 보기에 없음: ${r.question}`);
              if (new Set(r.choices).size !== r.choices?.length || r.choices.length !== 4) fail(`④ g${g} 보기 4개·서로 다름 아님: ${r.question} ${r.choices}`);
              if (g >= 3 && g <= 4) {
                const subj = TOPICS_34.find((t) => r.passage.includes(t.definition) && r.question.startsWith(t.subject));
                if (subj && r.choices.some((c) => otherTopicSentences.get(subj.subject)!.has(c))) fail(`④ g${g} 다른 주제 문장 보기: ${r.question} ${r.choices}`);
              }
              if (g >= 5 && r.question === "이 글의 전개 방식으로 알맞은 것은?") fail(`④ g${g} 전개 방식 물음(답 둘)`);
            }
          }
        }
      }
    }
  }
  for (const [pool, n] of Object.entries(minSize)) {
    sizes[`g${g}/${pool}`] = n;
    if (!rawMax[pool]) continue; // 그 학년엔 원래 없는 풀
    if (n === 0 && ["synonymPairs", "antonymPairs", "idioms", "multiMeaningWords", "wordPuzzles"].includes(pool)) continue; // 변형 풀은 비면 그 변형을 안 낸다
    if (n < Math.min(FLOOR[pool] ?? FLOOR.default, rawMax[pool])) fail(`③ g${g} ${pool} 풀이 ${n}개뿐(하한 ${FLOOR[pool] ?? FLOOR.default})`);
  }
}
const unrevTotal = Object.values(unrev).reduce((a, b) => a + b, 0);
if (unrevTotal) fail(`① 검수 안 된 항목 ${unrevTotal}: ${JSON.stringify(unrev)}`);
void TOPICS_56;
console.log("풀 최소 크기", JSON.stringify(sizes));
if (fails.length) {
  console.log(`CHECK-REVIEW FAIL ${fails.length}\n` + fails.slice(0, 40).join("\n"));
  process.exit(1);
}
console.log("CHECK-REVIEW OK");
