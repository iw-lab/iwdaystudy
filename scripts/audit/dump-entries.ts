/**
 * 원천 문항(풀 엔트리) 전수 덤프 — 세트가 문항을 꺼내 오는 «문제 은행» 자체를 뽑는다.
 * getGradeData 를 학년×학기×날짜시드 여러 개로 불러 엔트리를 합집합한다(은행은 고정, 시드는 섞는 순서만 바꾼다).
 * 수학처럼 숫자를 바꿔 끝없이 만드는 문항은 «숫자 틀»로 묶어 예시 2개만 남긴다.
 *
 *   npx tsx scripts/audit/dump-entries.ts   → scripts/audit/out/entries.jsonl  (+ 과목별 개수 출력)
 *   AUDIT_SEEDS=12 (기본)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { getGradeData } from "../../src/lib/daily-set-generator";

const SEEDS = Number(process.env.AUDIT_SEEDS || 12);
const OUT = new URL("./out/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

type E = { id: string; g: number; s: number; pool: string; entry: unknown };
const out = new Map<string, E>();
const skelCount = new Map<string, number>();
const skeleton = (x: string) => x.replace(/\d+(\.\d+)?/g, "#");

for (let g = 1; g <= 6; g++) {
  for (let s = 1; s <= 2; s++) {
    for (let k = 0; k < SEEDS; k++) {
      const seed = 1 + k * 31;
      const data = getGradeData(g, s, seed) as unknown as Record<string, unknown[]>;
      for (const [pool, arr] of Object.entries(data)) {
        if (!Array.isArray(arr)) continue;
        for (const e of arr) {
          const body = JSON.stringify(e);
          // 수학·숫자 틀은 같은 학년 안에서 틀 하나당 2개만
          const sk = pool === "math" ? skeleton(body) : body;
          const skKey = `${g}|${pool}|${sk}`;
          const n = skelCount.get(skKey) ?? 0;
          if (n >= (pool === "math" ? 2 : 1)) continue;
          skelCount.set(skKey, n + 1);
          // 학년 안에서 같은 엔트리는 한 번만(학기는 처음 본 학기로 기록 — 학기 범위는 따로 검사)
          const id = `${g}|${pool}|${body}`;
          if (out.has(id)) continue;
          out.set(id, { id: `e${out.size}`, g, s, pool, entry: e });
        }
      }
    }
    console.log(`g${g}s${s} 누적 ${out.size}`);
  }
}

writeFileSync(OUT + "entries.jsonl", [...out.values()].map((r) => JSON.stringify(r)).join("\n") + "\n");
const by: Record<string, number> = {};
for (const r of out.values()) by[`${r.pool}`] = (by[r.pool] || 0) + 1;
console.log("풀별 엔트리", by, "합계", out.size);
