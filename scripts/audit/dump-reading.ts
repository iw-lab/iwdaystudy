/**
 * 독해 전수검수 대상 — 조합형 생성기는 «틀(주제·인물 표)» 로, 손으로 쓴 지문은 항목으로 뽑는다.
 *   npx tsx scripts/audit/dump-reading.ts → scripts/audit/review/reading-static-g<학년>.jsonl · reading-topics.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { TOPICS_34, TOPICS_56, G12_SUBJECTS, G12_PLACES, G12_ACTIVITIES } from "../../src/lib/curriculum/generators/reading-generator";
import { grade1ReadingData, grade2ReadingData, grade3ReadingData, grade4ReadingData, grade5ReadingData, grade6ReadingData } from "../../src/lib/curriculum/korean-reading-data";
import { reviewKey } from "../../src/lib/content-review";

const OUT = new URL("./review/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const ST = [grade1ReadingData, grade2ReadingData, grade3ReadingData, grade4ReadingData, grade5ReadingData, grade6ReadingData];
ST.forEach((arr, i) => {
  const g = i + 1;
  const rows = arr.map((e) => ({ key: reviewKey(g, "koreanReading", e), g, pool: "koreanReading", sem: [1, 2], n: 1, entry: e }));
  writeFileSync(OUT + `reading-static-g${g}.jsonl`, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
  console.log(`g${g} 손지문 ${rows.length}`);
});
writeFileSync(OUT + "reading-topics.json", JSON.stringify({ TOPICS_34, TOPICS_56, G12_SUBJECTS, G12_PLACES, G12_ACTIVITIES }, null, 1));
console.log(`주제 34: ${TOPICS_34.length} · 56: ${TOPICS_56.length} · 1~2 인물 ${G12_SUBJECTS.length} 장소 ${G12_PLACES.length} 행동 ${G12_ACTIVITIES.length}`);
