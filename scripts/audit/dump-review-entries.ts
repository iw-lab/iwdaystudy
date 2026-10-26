/**
 * 전수검수 대상 덤프 — 앱과 똑같이 buildPools(검수 미반영)를 불러 «문제 은행 항목»을 학년마다 모은다.
 * 날짜 시드 전부(1~400) × 난이도 3단(정답률 30·60·90)을 돌려, 학생이 받을 수 있는 항목을 빠짐없이 모은다.
 * 키는 앱이 검수 판정을 찾는 키(reviewKey)와 같다.
 *
 *   npx tsx scripts/audit/dump-review-entries.ts [학년…]   → scripts/audit/review/entries-g<학년>.jsonl
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { buildPools } from "../../src/lib/daily-set-generator";
import { reviewKey } from "../../src/lib/content-review";

const OUT = new URL("./review/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const SEEDS = Number(process.env.REVIEW_SEEDS || 400);
const grades = process.argv.slice(2).map(Number).filter(Boolean);
const SUBJ = ["math", "korean", "english", "science", "social", "spelling", "vocabulary", "hanja", "general_knowledge", "safety", "writing", "creative"];
const accAll = (a: number) => Object.fromEntries(SUBJ.map((s) => [s, { accuracy: a }]));

for (const g of grades.length ? grades : [1, 2, 3, 4, 5, 6]) {
  const rows = new Map<string, { key: string; g: number; pool: string; sem: number[]; n: number; entry: unknown }>();
  for (const s of [1, 2]) {
    for (const acc of [undefined, accAll(30), accAll(90)]) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const data = buildPools(g, s, seed, acc, { review: false }) as unknown as Record<string, unknown>;
        for (const [pool, arr] of Object.entries(data)) {
          if (!Array.isArray(arr)) continue;
          for (const e of arr) {
            const key = reviewKey(g, pool, e);
            const r = rows.get(key);
            if (r) { r.n++; if (!r.sem.includes(s)) r.sem.push(s); continue; }
            rows.set(key, { key, g, pool, sem: [s], n: 1, entry: e });
          }
        }
      }
      console.log(`g${g} s${s} acc${acc ? Object.values(acc)[0].accuracy : "-"} 항목 ${rows.size}`);
    }
  }
  writeFileSync(OUT + `entries-g${g}.jsonl`, [...rows.values()].map((r) => JSON.stringify(r)).join("\n") + "\n");
  const by: Record<string, number> = {};
  for (const r of rows.values()) by[r.pool] = (by[r.pool] || 0) + 1;
  console.log(`g${g} 합계 ${rows.size}`, by);
}
