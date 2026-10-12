// 학습 결과 서버 동기화.
//
// 이 앱은 세트를 브라우저에서 생성하고 결과도 localStorage 에 먼저 쓴다
// (오프라인·불안정한 학교 와이파이에서도 학습이 끊기지 않아야 하므로).
// 그러나 그것만으로는 **선생님·학부모 화면에 아무것도 보이지 않는다** —
// 기기마다 데이터가 갇히기 때문이다. 이 모듈이 그 간극을 메운다.
//
// 원칙
//  1) 학습을 절대 막지 않는다. 전송 실패는 조용히 큐에 쌓고 나중에 재시도한다.
//  2) 큐에는 payload 를 복사하지 않고 키(recordId·setId)만 넣는다.
//     본문은 전송 직전에 localStorage 에서 다시 만든다(용량·정합성).
//  3) 서버는 같은 (학생, 세트)에 대해 upsert 하므로 재전송이 안전하다.

import {
  getRecordForSet,
  getResponsesForRecord,
  getStoredDailySet,
  getLearningRecords,
  saveLearningRecord,
} from "./local-storage";
import type { LearningRecord } from "@/types/database";
import { isGuestId } from "./guest";

const QUEUE_KEY = "araharu_sync_queue";
const MAX_QUEUE = 60;
// 오프라인이 길어져도 포기하지 않도록 넉넉히 잡는다(앱 진입마다 1회 증가).
const MAX_ATTEMPTS = 50;

interface QueueItem {
  studentId: string;
  recordId: string;
  setId: string;
  queuedAt: string;
  attempts: number;
}

function getToken(explicit?: string | null): string | null {
  if (explicit) return explicit;
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

function readQueue(): QueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QueueItem[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueueItem[]): void {
  if (typeof window === "undefined") return;
  if (items.length > MAX_QUEUE) {
    // 조용히 자르면 "다 올라갔다"로 보인다. 버린 만큼은 남겨서 알린다.
    console.warn(
      `[sync] 대기열이 ${MAX_QUEUE}건을 넘어 오래된 ${items.length - MAX_QUEUE}건을 버립니다.`,
    );
  }
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-MAX_QUEUE)));
  } catch {
    // 용량 초과 등 — 큐 저장 실패가 학습을 막아서는 안 된다.
  }
}

export function clearSyncQueue(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch {
    /* noop */
  }
}

function enqueue(item: Omit<QueueItem, "queuedAt" | "attempts">): void {
  const queue = readQueue();
  const idx = queue.findIndex(
    (q) => q.studentId === item.studentId && q.setId === item.setId,
  );
  const next: QueueItem = {
    ...item,
    queuedAt: new Date().toISOString(),
    attempts: idx >= 0 ? queue[idx].attempts : 0,
  };
  if (idx >= 0) queue[idx] = next;
  else queue.push(next);
  writeQueue(queue);
}

/** 큐에서 빼고, 이 세트는 서버에 반영되었다고 기기에 기록한다. */
function dequeue(studentId: string, setId: string): void {
  writeQueue(
    readQueue().filter((q) => !(q.studentId === studentId && q.setId === setId)),
  );
  markSynced(studentId, setId);
}

interface SubmitOutcome {
  /** 서버가 받아들였다(또는 영구 거절이라 재시도할 필요가 없다) */
  settled: boolean;
  /** 일시적 실패 — 큐에 남겨 재시도해야 한다 */
  retryable: boolean;
  streak?: number;
  totalPoints?: number;
}

/**
 * 로컬에 저장된 기록을 읽어 서버로 보낸다.
 * 전송할 데이터가 로컬에 없으면 settled=true(더 시도할 것이 없음)로 돌려준다.
 */
async function postRecord(
  studentId: string,
  setId: string,
  explicitToken?: string | null,
): Promise<SubmitOutcome> {
  const token = getToken(explicitToken);
  if (!token) return { settled: false, retryable: true };

  const record = getRecordForSet(studentId, setId);
  const stored = getStoredDailySet(setId);
  if (!record || !stored || stored.questions.length === 0) {
    // 기록이나 세트가 사라졌다(기기 정리 등). 보낼 것이 없으므로 큐에서 뺀다.
    return { settled: true, retryable: false };
  }
  if (!record.is_completed) {
    return { settled: true, retryable: false };
  }

  const responses = getResponsesForRecord(record.id).map((r) => ({
    question_id: r.question_id,
    student_answer: safeParse(r.student_answer),
    is_correct: r.is_correct,
    score: clampInt(r.score, 0, 1000),
    time_spent_seconds: clampInt(r.time_spent_seconds, 0, 86400),
    attempts: clampInt(r.attempts ?? 1, 0, 100),
  }));

  // 서버는 total_score <= max_score 를 요구한다. max_score 를 먼저 확정한 뒤
  // 그 값으로 total 을 조인다(둘을 따로 조이면 total > max 가 되어 400 이 난다).
  const maxScore = clampInt(record.max_score, 1, 10000);
  const body = {
    daily_set_id: stored.set.id,
    total_score: clampInt(record.total_score, 0, maxScore),
    max_score: maxScore,
    time_spent_seconds: clampInt(record.time_spent_seconds, 0, 86400),
    emotion_before: record.emotion_before ?? null,
    emotion_after: record.emotion_after ?? null,
    readiness: record.readiness ?? null,
    set: {
      id: stored.set.id,
      grade: stored.set.grade,
      semester: stored.set.semester,
      title: stored.set.title,
      description: stored.set.description,
      estimated_minutes: stored.set.estimated_minutes,
      total_questions: stored.set.total_questions,
      total_points: stored.set.total_points,
    },
    questions: stored.questions.map((q) => ({
      id: q.id,
      order_index: q.order_index,
      subject: q.subject,
      question_type: q.question_type,
      title: q.title,
      content: q.content,
      answer: q.answer,
      explanation: q.explanation,
      points: q.points,
      hint: q.hint,
      metadata: q.metadata ?? null,
    })),
    responses,
  };

  let res: Response;
  try {
    res = await fetch("/api/daily-set/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    // 네트워크 단절 — 재시도 대상
    return { settled: false, retryable: true };
  }

  if (res.ok) {
    const data = (await res.json().catch(() => null)) as {
      streak?: number;
      total_points?: number;
    } | null;
    return {
      settled: true,
      retryable: false,
      streak: data?.streak,
      totalPoints: data?.total_points,
    };
  }

  // 401/403: 토큰 만료·권한 문제 → 다시 로그인하면 풀릴 수 있으므로 남긴다.
  // 429/5xx: 일시적 → 남긴다.
  // 그 밖의 4xx(검증 실패 등): 같은 본문을 다시 보내도 결과가 같으므로 버린다.
  const retryable =
    res.status === 401 ||
    res.status === 403 ||
    res.status === 429 ||
    res.status >= 500;
  if (!retryable) {
    console.warn(
      `[sync] 서버가 학습 결과를 거절했습니다(${res.status}). 재시도하지 않습니다.`,
    );
  }
  return { settled: !retryable, retryable };
}

function safeParse(value: unknown): unknown {
  if (typeof value !== "string") return value ?? null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function clampInt(value: unknown, min: number, max: number): number {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * 세션 완료 직후 호출. 즉시 한 번 보내고, 실패하면 큐에 넣는다.
 * 호출자는 결과를 기다릴 필요가 없다(학습 흐름을 막지 않는다).
 */
export async function syncCompletedSet(
  studentId: string,
  recordId: string,
  setId: string,
): Promise<void> {
  // 로그인 없이 쓰는 학생은 서버에 보내지 않는다(기기에만 남는다)
  if (isGuestId(studentId)) return;
  enqueue({ studentId, recordId, setId });
  const outcome = await postRecord(studentId, setId);
  if (outcome.settled) dequeue(studentId, setId);
}

/**
 * 앱 진입·재접속 시 호출. 큐에 남은 기록을 순서대로 보낸다.
 */
export async function flushSyncQueue(
  studentId?: string,
  explicitToken?: string | null,
): Promise<number> {
  if (typeof window === "undefined") return 0;
  if (!getToken(explicitToken)) return 0;

  const queue = readQueue();
  if (queue.length === 0) return 0;

  let sent = 0;
  for (const item of queue) {
    if (studentId && item.studentId !== studentId) continue;
    if (item.attempts >= MAX_ATTEMPTS) {
      console.warn(
        `[sync] ${item.setId} 전송을 ${MAX_ATTEMPTS}회 실패해 포기합니다.`,
      );
      dequeue(item.studentId, item.setId);
      continue;
    }
    const outcome = await postRecord(item.studentId, item.setId, explicitToken);
    if (outcome.settled) {
      dequeue(item.studentId, item.setId);
      sent++;
    } else {
      const current = readQueue();
      const idx = current.findIndex(
        (q) => q.studentId === item.studentId && q.setId === item.setId,
      );
      if (idx >= 0) {
        current[idx] = { ...current[idx], attempts: current[idx].attempts + 1 };
        writeQueue(current);
      }
      // 한 건이 막히면 대개 전부 막힌다(오프라인·토큰만료). 조용히 멈춘다.
      break;
    }
  }
  return sent;
}

/**
 * 아직 서버에 올라가지 않은 완료 기록을 찾아 큐에 채운다.
 * 동기화 기능이 없던 버전에서 쌓인 기록과, 전송 도중 앱이 닫힌 경우를 복구한다.
 */
export function backfillSyncQueue(studentId: string): void {
  if (typeof window === "undefined") return;
  const queued = new Set(
    readQueue()
      .filter((q) => q.studentId === studentId)
      .map((q) => q.setId),
  );
  const synced = getSyncedSetIds(studentId);
  const pending = getLearningRecords(studentId)
    .filter(
      (r: LearningRecord) =>
        r.is_completed && !queued.has(r.daily_set_id) && !synced.has(r.daily_set_id),
    )
    .slice(-MAX_QUEUE);

  for (const r of pending) {
    enqueue({ studentId, recordId: r.id, setId: r.daily_set_id });
  }
}

// ---------- 서버에 올라간 세트 기억 ----------
// 같은 기록을 매번 다시 보내지 않도록, 성공한 세트 id 를 기기에 남긴다.

const SYNCED_KEY = "araharu_synced_sets";

function getSyncedSetIds(studentId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(`${SYNCED_KEY}_${studentId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? (parsed as string[]) : []);
  } catch {
    return new Set();
  }
}

function markSynced(studentId: string, setId: string): void {
  if (typeof window === "undefined") return;
  try {
    const ids = getSyncedSetIds(studentId);
    ids.add(setId);
    // 최근 400개만 유지 — 한 학년도치보다 넉넉하다.
    const trimmed = Array.from(ids).slice(-400);
    localStorage.setItem(`${SYNCED_KEY}_${studentId}`, JSON.stringify(trimmed));
  } catch {
    /* noop */
  }
}

export function clearSyncedSets(studentId?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (studentId) {
      localStorage.removeItem(`${SYNCED_KEY}_${studentId}`);
      return;
    }
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith(SYNCED_KEY)) localStorage.removeItem(k);
    }
  } catch {
    /* noop */
  }
}

// ---------- 서버 기록 복원 ----------

export interface ServerHistory {
  records: Array<{
    id: string;
    daily_set_id: string;
    client_set_id: string;
    class_id: string | null;
    started_at: string;
    completed_at: string | null;
    total_score: number;
    max_score: number;
    time_spent_seconds: number;
    is_completed: boolean;
    created_at: string;
  }>;
  streak_count: number;
  total_points: number;
}

/**
 * 서버에 있는 내 학습 기록을 가져온다. 기기를 바꿨을 때 연속일수·포인트·
 * "이 세트는 이미 했음" 판정을 되살리는 용도다. 실패는 조용히 null.
 */
export async function fetchServerHistory(
  days = 180,
): Promise<ServerHistory | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`/api/daily-set/history?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as ServerHistory;
  } catch {
    return null;
  }
}

/**
 * 서버 기록을 로컬에 병합한다. 로컬에 이미 있는 세트는 건드리지 않는다
 * (로컬이 항상 더 자세하다 — 문항별 응답까지 갖고 있다).
 * 새 기기·데이터 삭제 후 로그인 시 연속일수·포인트·완료 판정을 되살린다.
 * @returns 새로 복원된 기록 수
 */
export async function restoreFromServer(studentId: string): Promise<number> {
  const history = await fetchServerHistory();
  if (!history || !Array.isArray(history.records)) return 0;

  let restored = 0;
  for (const r of history.records) {
    const setId = r.client_set_id || r.daily_set_id;
    if (getRecordForSet(studentId, setId)) continue;

    saveLearningRecord({
      id: r.id,
      student_id: studentId,
      daily_set_id: setId,
      class_id: r.class_id,
      started_at: r.started_at,
      completed_at: r.completed_at,
      total_score: r.total_score,
      max_score: r.max_score,
      time_spent_seconds: r.time_spent_seconds,
      is_completed: r.is_completed,
      emotion_before: null,
      emotion_after: null,
      readiness: null,
      created_at: r.created_at,
    });
    // 서버에서 온 기록이므로 다시 올릴 필요가 없다.
    markSynced(studentId, setId);
    restored++;
  }
  return restored;
}
