/**
 * 문항 검수 반영 — 전수검수(scripts/audit/review/)가 문제 은행 항목마다 내린 판정을 풀에 적용한다.
 *   "D"             → 그 학년 풀에서 뺀다(정답 오류·풀 수 없음·학년에 안 맞음·고칠 수 없는 비문)
 *   { p, x }        → p 필드를 고친 값으로 덮고, x 를 그럴듯한 오답 보기(distractors)로 붙인다
 * 키 = 학년|풀|항목 JSON(수학은 숫자를 # 로 바꾼 틀) 의 FNV-1a 64비트. 덤프와 앱이 같은 buildPools 를 지나므로 키가 맞물린다.
 */
import REVIEW from "./content-review-data.json";

type Verdict = "D" | { p?: Record<string, unknown>; x?: string[] };
const ITEMS = (REVIEW as { items: Record<string, Verdict> }).items;

function fnv64(s: string): string {
  let h1 = 0x811c9dc5, h2 = 0x01000193 ^ 0x5bd1e995;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ c, 0x5bd1e995) >>> 0;
    h2 = (h2 ^ (h2 >>> 15)) >>> 0;
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}

// 독해 보기는 생성기가 다른 주제 문장에서 무작위로 뽑아 조합이 끝없다 — 키에서 빼고(지문·물음·정답이 항목), 검수가 보기를 통째로 정해 준다
const KEY_OMIT: Record<string, string[]> = { koreanReading: ["choices"] };

export function reviewText(pool: string, entry: unknown): string {
  const omit = KEY_OMIT[pool];
  const body = omit && entry && typeof entry === "object"
    ? JSON.stringify(entry, (k, v) => (omit.includes(k) ? undefined : v))
    : JSON.stringify(entry);
  return pool === "math" ? body.replace(/\d+(\.\d+)?/g, "#") : body;
}

export function reviewKey(grade: number, pool: string, entry: unknown): string {
  return fnv64(`${grade}|${pool}|${reviewText(pool, entry)}`);
}

export function verdictOf(grade: number, pool: string, entry: unknown): Verdict | undefined {
  return ITEMS[reviewKey(grade, pool, entry)];
}

export function applyContentReview(data: Record<string, unknown>, grade: number): void {
  for (const [pool, arr] of Object.entries(data)) {
    if (!Array.isArray(arr)) continue;
    const out: unknown[] = [];
    for (const e of arr) {
      const v = verdictOf(grade, pool, e);
      if (v === "D") continue;
      if (v && typeof e === "object" && e) {
        out.push({ ...(e as object), ...(v.p || {}), ...(v.x ? { distractors: v.x } : {}) });
      } else out.push(e);
    }
    // 풀이 통째로 비면 세트를 못 만든다 — 원본을 둔다(게이트 check-review-coverage 가 «빈 풀»을 따로 빨강으로 잡는다)
    data[pool] = out.length ? out : arr;
  }
}

/** 검수에서 붙인 오답 보기 — 항목의 정답과 지금 보기의 정답이 같을 때만 쓴다(같은 항목으로 다른 것을 묻는 변형 제외) */
export function presetDistractors(entry: unknown, correct: string): string[] | undefined {
  const e = entry as { answer?: unknown; word?: unknown; distractors?: unknown } | undefined;
  if (!e || !Array.isArray(e.distractors)) return undefined;
  const main = e.answer ?? e.word;
  if (main === undefined || String(main) !== String(correct)) return undefined;
  return (e.distractors as unknown[]).map(String);
}
