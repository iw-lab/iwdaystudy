/** 검사 스크립트용 — 학년 검수 데이터(src/lib/content-review/g*.json)를 디스크에서 바로 읽어 넣는다(CJS 라 top-level await 를 못 쓴다) */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { setContentReviewData } from "../../../src/lib/content-review";

export function loadReviewSync(): void {
  const dir = join(__dirname, "../../../src/lib/content-review");
  for (let g = 1; g <= 6; g++) setContentReviewData(g, JSON.parse(readFileSync(join(dir, `g${g}.json`), "utf8")));
}
loadReviewSync();
