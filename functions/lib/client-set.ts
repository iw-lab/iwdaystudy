// 클라이언트에서 생성한 학습 세트를 D1에 적재하기 위한 헬퍼.
//
// 배경: 문항 생성기(src/lib/daily-set-generator.ts)는 커리큘럼 데이터가
// 13만 줄 규모라 Worker 스크립트 용량 한도에 들어가지 않는다. 그래서 세트는
// 계속 브라우저에서 생성하고, 결과를 제출할 때 세트/문항 스냅샷을 함께 보내
// 서버가 적재한다.
//
// 핵심 설계 = 내용주소(content-addressed) id
//   storage_set_id = `${클라이언트 세트id}~${내용해시8}`
// 세트 메타 + 전 문항 내용을 해시에 넣으므로,
//   · 내용이 완전히 같은 학생들은 같은 행을 공유한다(21명 학급에서 중복 제거)
//   · 난이도 개인화로 내용이 다르면 자동으로 다른 행이 된다
//   · 내용이 1비트라도 다르면 id가 달라지므로 다른 학생 행을 덮어쓸 수 없다
//     → INSERT OR IGNORE 만으로 안전하다(먼저 쓴 쪽이 이기는 경합이 무해).
//
// 적재된 세트는 is_published = 0 이다. GET /api/daily-set 과 cron 배정은
// is_published = 1 만 보므로, 학생이 올린 스냅샷이 배포용 커리큘럼 세트로
// 둔갑해 다른 학생에게 제공되는 경로가 원천 차단된다.

export interface ClientSetMeta {
  id: string;
  grade: number;
  semester: number;
  title?: string | null;
  description?: string | null;
  estimated_minutes?: number | null;
  total_questions?: number | null;
  total_points?: number | null;
}

export interface ClientQuestion {
  id: string;
  order_index: number;
  subject: string;
  question_type: string;
  title?: string | null;
  content: unknown;
  answer: unknown;
  explanation?: string | null;
  points?: number | null;
  hint?: string | null;
  metadata?: unknown;
}

export interface PreparedClientSet {
  storageSetId: string;
  /** 클라이언트 문항 id → D1 문항 id */
  questionIdMap: Map<string, string>;
}

// 한도: 학생이 보내는 값이므로 전부 상한을 둔다.
const MAX_SET_ID_LEN = 40;
const MAX_QUESTIONS = 60;
const MAX_TEXT_LEN = 2000;
const MAX_JSON_LEN = 8000;
const MAX_TOTAL_JSON_LEN = 400000;

const SET_ID_RE = /^[A-Za-z0-9_-]{1,40}$/;
const QUESTION_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const SLUG_RE = /^[a-z_]{1,32}$/;

export class ClientSetError extends Error {}

function fail(message: string): never {
  throw new ClientSetError(message);
}

/** FNV-1a 32비트. 암호학적 용도가 아니라 내용 동일성 판별용이다. */
function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

/** 키 순서와 무관하게 같은 문자열을 내도록 정렬해 직렬화한다. */
function stableJson(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${stableJson(obj[k])}`)
    .join(",")}}`;
}

function text(v: unknown, field: string, max = MAX_TEXT_LEN): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") fail(`${field} 형식이 올바르지 않습니다.`);
  if (v.length > max) fail(`${field} 길이가 너무 깁니다.`);
  return v;
}

function int(
  v: unknown,
  field: string,
  min: number,
  max: number,
  fallback?: number,
): number {
  if (v === null || v === undefined) {
    if (fallback !== undefined) return fallback;
    fail(`${field} 값이 필요합니다.`);
  }
  if (typeof v !== "number" || !Number.isFinite(v) || !Number.isInteger(v)) {
    fail(`${field} 형식이 올바르지 않습니다.`);
  }
  if (v < min || v > max) fail(`${field} 범위를 벗어났습니다.`);
  return v;
}

/**
 * 클라이언트가 보낸 세트/문항 스냅샷을 검증하고 D1에 적재한다.
 * 이미 같은 내용의 세트가 있으면 아무것도 쓰지 않고 id만 돌려준다.
 */
export async function upsertClientSet(
  db: D1Database,
  set: ClientSetMeta,
  questions: ClientQuestion[],
): Promise<PreparedClientSet> {
  if (!set || typeof set !== "object") fail("세트 정보가 없습니다.");
  if (!Array.isArray(questions) || questions.length === 0) {
    fail("문항 정보가 없습니다.");
  }
  if (questions.length > MAX_QUESTIONS) fail("문항 수가 너무 많습니다.");

  const clientSetId = text(set.id, "세트 id", MAX_SET_ID_LEN);
  if (!clientSetId || !SET_ID_RE.test(clientSetId)) {
    fail("세트 id 형식이 올바르지 않습니다.");
  }

  const grade = int(set.grade, "학년", 1, 6);
  const semester = int(set.semester, "학기", 1, 2);
  const title =
    text(set.title, "세트 제목", 200) ?? `${grade}학년 ${semester}학기`;
  const description = text(set.description, "세트 설명", 500);
  const estimatedMinutes = int(set.estimated_minutes, "예상 시간", 0, 600, 30);
  const totalQuestions = int(
    set.total_questions,
    "문항 수",
    0,
    MAX_QUESTIONS,
    questions.length,
  );
  const totalPoints = int(
    set.total_points,
    "총점",
    0,
    10000,
    questions.length * 10,
  );

  let jsonBudget = 0;
  const seenOrder = new Set<number>();
  const seenClientId = new Set<string>();
  const normalized = questions.map((q, i) => {
    if (!q || typeof q !== "object") fail(`문항 ${i + 1} 형식이 올바르지 않습니다.`);
    const qid = text(q.id, `문항 ${i + 1} id`, 64);
    if (!qid || !QUESTION_ID_RE.test(qid)) {
      fail(`문항 ${i + 1} id 형식이 올바르지 않습니다.`);
    }
    if (seenClientId.has(qid)) fail(`문항 id가 중복되었습니다.`);
    seenClientId.add(qid);

    const orderIndex = int(
      q.order_index,
      `문항 ${i + 1} 순서`,
      0,
      MAX_QUESTIONS - 1,
    );
    if (seenOrder.has(orderIndex)) fail(`문항 순서가 중복되었습니다.`);
    seenOrder.add(orderIndex);

    const subject = text(q.subject, `문항 ${i + 1} 과목`, 32);
    if (!subject || !SLUG_RE.test(subject)) {
      fail(`문항 ${i + 1} 과목이 올바르지 않습니다.`);
    }
    const questionType = text(q.question_type, `문항 ${i + 1} 유형`, 32);
    if (!questionType || !SLUG_RE.test(questionType)) {
      fail(`문항 ${i + 1} 유형이 올바르지 않습니다.`);
    }

    const contentJson = stableJson(q.content ?? null);
    const answerJson = stableJson(q.answer ?? null);
    const metadataJson =
      q.metadata === undefined || q.metadata === null
        ? null
        : stableJson(q.metadata);
    if (contentJson.length > MAX_JSON_LEN) fail(`문항 ${i + 1} 내용이 너무 깁니다.`);
    if (answerJson.length > MAX_JSON_LEN) fail(`문항 ${i + 1} 정답이 너무 깁니다.`);
    if (metadataJson && metadataJson.length > MAX_JSON_LEN) {
      fail(`문항 ${i + 1} 메타데이터가 너무 깁니다.`);
    }
    jsonBudget +=
      contentJson.length + answerJson.length + (metadataJson?.length ?? 0);
    if (jsonBudget > MAX_TOTAL_JSON_LEN) fail("세트 데이터가 너무 큽니다.");

    return {
      clientId: qid,
      orderIndex,
      subject,
      questionType,
      title: text(q.title, `문항 ${i + 1} 제목`, 500),
      contentJson,
      answerJson,
      explanation: text(q.explanation, `문항 ${i + 1} 해설`, MAX_TEXT_LEN),
      points: int(q.points, `문항 ${i + 1} 배점`, 0, 1000, 10),
      hint: text(q.hint, `문항 ${i + 1} 힌트`, MAX_TEXT_LEN),
      metadataJson,
    };
  });

  normalized.sort((a, b) => a.orderIndex - b.orderIndex);

  // 내용 해시 — 세트 메타 + 전 문항. 여기 들어간 값이 다르면 id 가 달라진다.
  const hashInput = [
    clientSetId,
    grade,
    semester,
    title,
    description ?? "",
    estimatedMinutes,
    totalQuestions,
    totalPoints,
    ...normalized.map((q) =>
      [
        q.clientId,
        q.orderIndex,
        q.subject,
        q.questionType,
        q.title ?? "",
        q.contentJson,
        q.answerJson,
        q.explanation ?? "",
        q.points,
        q.hint ?? "",
        q.metadataJson ?? "",
      ].join(" "),
    ),
  ].join("");
  const hash = fnv1a32(hashInput);
  const storageSetId = `${clientSetId}~${hash.toString(16).padStart(8, "0")}`;

  const questionIdMap = new Map<string, string>();
  for (const q of normalized) {
    questionIdMap.set(q.clientId, `q-${storageSetId}-${q.orderIndex}`);
  }

  // 이미 있으면(다른 학생이 먼저 올렸거나 재제출) 아무것도 쓰지 않는다.
  const existingSet = await db
    .prepare("SELECT id FROM daily_sets WHERE id = ?")
    .bind(storageSetId)
    .first<{ id: string }>();

  if (!existingSet) {
    // set_number 는 UNIQUE(grade, semester, set_number) 라 충돌할 수 있다.
    // 커리큘럼 세트(작은 번호)와 겹치지 않도록 1,000,000 이상 구간을 쓰고,
    // 충돌하면 +1 씩 밀어 빈 번호를 찾는다.
    let setNumber = 1000000 + (hash % 1000000000);
    let stored = false;
    for (let attempt = 0; attempt < 8; attempt++) {
      await db
        .prepare(
          `INSERT OR IGNORE INTO daily_sets
             (id, grade, semester, set_number, title, description,
              estimated_minutes, total_questions, total_points, is_published, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        )
        .bind(
          storageSetId,
          grade,
          semester,
          setNumber,
          title,
          description,
          estimatedMinutes,
          totalQuestions,
          totalPoints,
          new Date().toISOString(),
        )
        .run();

      const check = await db
        .prepare("SELECT id FROM daily_sets WHERE id = ?")
        .bind(storageSetId)
        .first<{ id: string }>();
      if (check) {
        stored = true;
        break;
      }
      setNumber += 1;
    }
    if (!stored) fail("학습 세트를 저장하지 못했습니다.");
  }

  // 문항도 내용주소이므로 INSERT OR IGNORE 로 충분하다.
  const now = new Date().toISOString();
  const stmts = normalized.map((q) =>
    db
      .prepare(
        `INSERT OR IGNORE INTO questions
           (id, daily_set_id, curriculum_standard_id, subject, question_type,
            order_index, title, content, answer, explanation, points, hint, metadata, created_at)
         VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        questionIdMap.get(q.clientId),
        storageSetId,
        q.subject,
        q.questionType,
        q.orderIndex,
        q.title,
        q.contentJson,
        q.answerJson,
        q.explanation,
        q.points,
        q.hint,
        q.metadataJson,
        now,
      ),
  );
  if (stmts.length > 0) await db.batch(stmts);

  return { storageSetId, questionIdMap };
}
