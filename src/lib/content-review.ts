/**
 * 문항 검수 반영 — 전수검수(scripts/audit/review/)가 문제 은행 항목마다 내린 판정을 풀에 적용한다.
 *   "D"             → 그 학년 풀에서 뺀다(정답 오류·풀 수 없음·학년에 안 맞음·고칠 수 없는 비문)
 *   { p, x }        → p 필드를 고친 값으로 덮고, x 를 그럴듯한 오답 보기(distractors)로 붙인다
 * 데이터는 scripts/audit/review/build-review-data.py 가 만든다(손으로 고치지 않는다).
 * 키 = 학년|풀|항목 JSON(수학은 숫자를 # 로 바꾼 틀) 의 FNV-1a 64비트. 덤프와 앱이 같은 buildPools 를 지나므로 키가 맞물린다.
 */
type Verdict = "D" | { p?: Record<string, unknown>; x?: string[] };
// 파일 꼴(학년마다 src/lib/content-review/g<학년>.json): { patches: [고침…], items: { 키: "D" | 고침 번호 } }
// 고침이 문자열 배열이면 보기(x)만 있는 것. 학년 파일은 세트를 만들기 «전에» loadContentReview(학년)로 불러 둔다
// (한 번에 다 넣으면 첫 화면 내려받기가 두 배가 된다 — 학년 하나는 약 1/6).
type ReviewData = { patches: (Verdict | string[])[]; items: Record<string, "D" | number> };
const LOADED: Record<number, ReviewData> = {};
let warned = false;

export function setContentReviewData(grade: number, data: ReviewData): void {
  LOADED[grade] = data;
}

export function isContentReviewLoaded(grade: number): boolean {
  return !!LOADED[grade];
}

export async function loadContentReview(grade: number): Promise<void> {
  if (LOADED[grade]) return;
  const m = await (grade === 1 ? import("./content-review/g1.json")
    : grade === 2 ? import("./content-review/g2.json")
    : grade === 3 ? import("./content-review/g3.json")
    : grade === 4 ? import("./content-review/g4.json")
    : grade === 5 ? import("./content-review/g5.json")
    : import("./content-review/g6.json"));
  LOADED[grade] = ((m as { default?: unknown }).default ?? m) as ReviewData;
}

function resolve(grade: number, v: "D" | number | undefined): Verdict | undefined {
  if (v === undefined || v === "D") return v;
  const p = LOADED[grade].patches[v];
  return Array.isArray(p) ? { x: p } : (p as Verdict);
}

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
  const d = LOADED[grade];
  if (!d) return undefined;
  return resolve(grade, d.items[reviewKey(grade, pool, entry)]);
}

const OPTIONAL_POOLS = new Set(["synonymPairs", "antonymPairs", "idioms", "multiMeaningWords", "wordPuzzles"]);

export function applyContentReview(data: Record<string, unknown>, grade: number): void {
  if (!LOADED[grade]) {
    if (!warned && typeof console !== "undefined") console.warn(`[content-review] ${grade}학년 검수 데이터를 안 불러온 채 세트를 만든다 — loadContentReview 를 먼저`);
    warned = true;
    return;
  }
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
    // 낱말 변형 풀은 비어도 된다(세트 만들 때 길이를 보고 그 변형을 건너뛴다 — 1학년 다의어가 전부 빠진 사례).
    // 핵심 풀이 통째로 비면 세트를 못 만든다 — 원본을 둔다(게이트 check-review 의 ③ 하한이 이 경우를 빨강으로 잡는다).
    // 변형 풀이 4개도 안 남으면 같은 문제가 매일 돌므로 그 변형을 아예 안 낸다.
    if (OPTIONAL_POOLS.has(pool)) data[pool] = out.length >= 4 ? out : [];
    else data[pool] = out.length ? out : arr;
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

/** 검사 스크립트용 — 여섯 학년 검수 데이터를 다 불러 둔다 */
export async function loadAllContentReview(): Promise<void> {
  for (let g = 1; g <= 6; g++) await loadContentReview(g);
}
