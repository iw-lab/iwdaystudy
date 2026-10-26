/**
 * 전수검수용 문항 말뭉치 덤프.
 * 학년(1~6)×학기(1~2)마다 세트를 N개(기본 400) 만들어, 학생이 실제로 받을 수 있는 문항을
 * 중복 없이 모은다. 숫자만 다른 «같은 틀» 문항은 틀(skeleton) 단위로 묶어 예시 3개만 남긴다
 * — AI 검수는 틀 단위로, 기계 검사는 전 문항으로 한다.
 *
 *   npx tsx scripts/audit/dump-corpus.ts            → scripts/audit/out/corpus.jsonl · skeletons.jsonl
 *   AUDIT_SETS=100 npx tsx scripts/audit/dump-corpus.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { generateDailySet } from "../../src/lib/daily-set-generator";
import "./review/load-review-sync"; // 학생이 실제로 받는(검수 반영된) 문항을 뽑는다

const N = Number(process.env.AUDIT_SETS || 80);
const ONLY = process.env.AUDIT_GRADE ? Number(process.env.AUDIT_GRADE) : 0;
const TAG = ONLY ? `-g${ONLY}` : "";
const OUT = new URL("./out/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

type Row = {
  key: string;
  g: number;
  s: number;
  subject: string;
  type: string;
  title: string;
  content: unknown;
  answer: unknown;
  explanation: unknown;
  hint: unknown;
  standard: unknown;
  n: number;
};

const SKIP_TYPES = new Set(["emotion_check", "readiness_check"]);
const rows = new Map<string, Row>();
const skel = new Map<string, { skel: string; g: number; s: number; subject: string; type: string; examples: string[]; n: number }>();

const h = (x: string) => createHash("sha1").update(x).digest("hex").slice(0, 12);
// 숫자·연산 결과만 다른 문항을 같은 틀로 본다
const skeletonOf = (t: string) => t.replace(/\d+(\.\d+)?/g, "#").replace(/\s+/g, " ").trim();

for (let g = 1; g <= 6; g++) {
  if (ONLY && g !== ONLY) continue;
  for (let s = 1; s <= 2; s++) {
    const done = new Set<string>();
    for (let i = 0; i < N; i++) {
      if (i % 20 === 0) console.log(`g${g}s${s} ${i}/${N}`);
      const set = generateDailySet(g, s, done);
      done.add(set.set.id);
      for (const q of set.questions as any[]) {
        if (SKIP_TYPES.has(q.question_type)) continue;
        const body = JSON.stringify({ c: q.content, a: q.answer });
        const key = h(`${g}|${s}|${q.subject}|${body}`);
        const r = rows.get(key);
        if (r) { r.n++; continue; }
        rows.set(key, {
          key, g, s, subject: q.subject, type: q.question_type, title: q.title,
          content: q.content, answer: q.answer, explanation: q.explanation, hint: q.hint,
          standard: q.curriculum_standard_id, n: 1,
        });
        const sk = skeletonOf(`${q.subject}|${q.question_type}|${JSON.stringify(q.content)}`);
        const sid = h(`${g}|${s}|${sk}`);
        const e = skel.get(sid);
        if (e) { e.n++; if (e.examples.length < 3) e.examples.push(key); }
        else skel.set(sid, { skel: sid, g, s, subject: q.subject, type: q.question_type, examples: [key], n: 1 });
      }
    }
  }
}

writeFileSync(OUT + `corpus${TAG}.jsonl`, [...rows.values()].map((r) => JSON.stringify(r)).join("\n") + "\n");
writeFileSync(OUT + `skeletons${TAG}.jsonl`, [...skel.values()].map((r) => JSON.stringify(r)).join("\n") + "\n");
const by: Record<string, number> = {};
for (const r of rows.values()) by[r.subject] = (by[r.subject] || 0) + 1;
const sb: Record<string, number> = {};
for (const r of skel.values()) sb[r.subject] = (sb[r.subject] || 0) + 1;
console.log(`세트 ${N}×12 · 고유 문항 ${rows.size} · 틀 ${skel.size}`);
console.log("과목별 문항", by);
console.log("과목별 틀", sb);
