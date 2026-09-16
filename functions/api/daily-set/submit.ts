// Cloudflare Pages Function: POST /api/daily-set/submit
// Submit learning results for a daily set

import { authUserId } from '../../lib/ctx';
import {
  upsertClientSet,
  ClientSetError,
  type ClientQuestion,
  type ClientSetMeta,
} from '../../lib/client-set';

interface Env {
  DB: D1Database;
}

interface SubmitBody {
  daily_set_id: string;
  class_id?: string;
  total_score: number;
  max_score: number;
  time_spent_seconds: number;
  emotion_before?: unknown;
  emotion_after?: unknown;
  readiness?: unknown;
  /**
   * 브라우저에서 생성한 세트를 함께 보낼 때만 채운다. 있으면 서버가 세트/문항을
   * 내용주소로 적재한 뒤 그 id 로 기록을 남긴다(functions/lib/client-set.ts).
   * 없으면 기존처럼 서버에 게시된 커리큘럼 세트로 간주한다.
   */
  set?: ClientSetMeta;
  questions?: ClientQuestion[];
  responses: {
    question_id: string;
    student_answer: unknown;
    is_correct: boolean | null;
    score: number;
    time_spent_seconds: number;
    attempts: number;
  }[];
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const userId = authUserId(context.data);
    if (!userId) {
      return jsonResponse({ message: '인증이 필요합니다.' }, 401);
    }

    const body = await context.request.json() as SubmitBody;
    const {
      daily_set_id,
      total_score,
      max_score,
      time_spent_seconds,
      emotion_before,
      emotion_after,
      readiness,
      responses,
    } = body;

    if (!daily_set_id || typeof daily_set_id !== 'string' || daily_set_id.length > 64) {
      return jsonResponse({ message: '올바르지 않은 학습 세트입니다.' }, 400);
    }
    if (!responses || !Array.isArray(responses) || responses.length > 50) {
      return jsonResponse({ message: '응답 데이터가 올바르지 않습니다.' }, 400);
    }
    if (
      typeof total_score !== 'number' ||
      typeof max_score !== 'number' ||
      typeof time_spent_seconds !== 'number' ||
      total_score < 0 ||
      max_score <= 0 ||
      max_score > 10000 ||
      total_score > max_score ||
      time_spent_seconds < 0 ||
      time_spent_seconds > 86400
    ) {
      return jsonResponse({ message: '점수/시간 값이 올바르지 않습니다.' }, 400);
    }
    for (const r of responses) {
      if (!r.question_id || typeof r.question_id !== 'string' || r.question_id.length > 64) {
        return jsonResponse({ message: '응답 형식이 올바르지 않습니다.' }, 400);
      }
      if (typeof r.score !== 'number' || r.score < 0 || r.score > 1000) {
        return jsonResponse({ message: '응답 점수가 올바르지 않습니다.' }, 400);
      }
      if (typeof r.attempts !== 'number' || r.attempts < 0 || r.attempts > 100) {
        return jsonResponse({ message: '시도 횟수가 올바르지 않습니다.' }, 400);
      }
    }

    // 세트 확정 — 두 경로가 있다.
    //  (a) 브라우저 생성 세트: set/questions 스냅샷이 함께 오면 내용주소로 적재한다.
    //  (b) 서버 커리큘럼 세트: 스냅샷이 없으면 게시된 세트여야 한다.
    let storageSetId = daily_set_id;
    let questionIdMap: Map<string, string> | null = null;

    if (body.set && body.questions) {
      if (body.set.id !== daily_set_id) {
        return jsonResponse({ message: '세트 정보가 일치하지 않습니다.' }, 400);
      }
      try {
        const prepared = await upsertClientSet(
          context.env.DB,
          body.set,
          body.questions,
        );
        storageSetId = prepared.storageSetId;
        questionIdMap = prepared.questionIdMap;
      } catch (err) {
        if (err instanceof ClientSetError) {
          return jsonResponse({ message: err.message }, 400);
        }
        throw err;
      }
    } else {
      const setExists = await context.env.DB.prepare(
        'SELECT id FROM daily_sets WHERE id = ? AND is_published = 1'
      ).bind(daily_set_id).first();
      if (!setExists) {
        return jsonResponse({ message: '존재하지 않는 학습 세트입니다.' }, 404);
      }
    }

    // 응답의 문항 id 를 D1 문항 id 로 옮긴다. 매핑에 없는 id 는 이 세트의
    // 문항이 아니므로(다른 세트 문항에 기록을 붙이려는 시도 포함) 거절한다.
    const mappedResponses = responses.map((r) => ({
      ...r,
      question_id: questionIdMap
        ? questionIdMap.get(r.question_id) ?? null
        : r.question_id,
    }));
    if (mappedResponses.some((r) => r.question_id === null)) {
      return jsonResponse({ message: '세트에 없는 문항이 포함되어 있습니다.' }, 400);
    }

    // class_id 는 클라이언트 값을 믿지 않고 서버에서 학급 소속으로 해석한다.
    const membership = await context.env.DB.prepare(
      'SELECT class_id FROM class_members WHERE student_id = ? ORDER BY joined_at DESC LIMIT 1'
    ).bind(userId).first<{ class_id: string }>();
    const class_id = membership?.class_id ?? null;

    // Check for existing record (upsert)
    const existing = await context.env.DB.prepare(
      'SELECT id FROM learning_records WHERE student_id = ? AND daily_set_id = ?'
    ).bind(userId, storageSetId).first<{ id: string }>();

    const now = new Date().toISOString();
    let recordId: string;

    if (existing) {
      // Update existing record
      recordId = existing.id;
      await context.env.DB.prepare(
        `UPDATE learning_records SET
          completed_at = ?, total_score = ?, max_score = ?,
          time_spent_seconds = ?, is_completed = 1,
          emotion_before = ?, emotion_after = ?, readiness = ?
        WHERE id = ?`
      ).bind(
        now, total_score, max_score, time_spent_seconds,
        emotion_before ? JSON.stringify(emotion_before) : null,
        emotion_after ? JSON.stringify(emotion_after) : null,
        readiness ? JSON.stringify(readiness) : null,
        recordId
      ).run();

      // Delete old responses before inserting new ones
      await context.env.DB.prepare(
        'DELETE FROM question_responses WHERE learning_record_id = ?'
      ).bind(recordId).run();
    } else {
      // Create new learning record
      recordId = crypto.randomUUID();
      await context.env.DB.prepare(
        `INSERT INTO learning_records
          (id, student_id, daily_set_id, class_id, started_at, completed_at,
           total_score, max_score, time_spent_seconds, is_completed,
           emotion_before, emotion_after, readiness, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`
      ).bind(
        recordId, userId, storageSetId, class_id,
        now, now, total_score, max_score, time_spent_seconds,
        emotion_before ? JSON.stringify(emotion_before) : null,
        emotion_after ? JSON.stringify(emotion_after) : null,
        readiness ? JSON.stringify(readiness) : null,
        now
      ).run();
    }

    // Insert question responses
    const stmts = mappedResponses.map((r) => {
      const respId = crypto.randomUUID();
      return context.env.DB.prepare(
        `INSERT INTO question_responses
          (id, learning_record_id, question_id, student_answer, is_correct, score, time_spent_seconds, attempts, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        respId, recordId, r.question_id,
        r.student_answer != null ? JSON.stringify(r.student_answer) : null,
        r.is_correct === true ? 1 : r.is_correct === false ? 0 : null,
        r.score, r.time_spent_seconds, r.attempts, now
      );
    });

    // Execute all response inserts in batch
    if (stmts.length > 0) {
      await context.env.DB.batch(stmts);
    }

    // 포인트는 **최초 완료 때만** 적립한다. 같은 세트를 반복 제출하면
    // total_points 가 계속 누적되어 포인트·배지를 무한히 불릴 수 있었다.
    // (existing 이 있었다는 건 이미 한 번 제출·적립했다는 뜻)
    const streakResult = await updateStreakAndPoints(
      context.env.DB,
      userId,
      existing ? 0 : total_score,
    );

    // Check badge conditions
    const newBadges = await checkBadgeConditions(context.env.DB, userId, {
      total_score,
      max_score,
      streak: streakResult.streak,
      totalPoints: streakResult.totalPoints,
      time_spent_seconds,
    });

    return jsonResponse({
      record_id: recordId,
      daily_set_id: storageSetId,
      streak: streakResult.streak,
      total_points: streakResult.totalPoints,
      new_badges: newBadges,
    });
  } catch {
    return jsonResponse({ message: '결과 제출 중 오류가 발생했습니다.' }, 500);
  }
};

async function updateStreakAndPoints(
  db: D1Database,
  userId: string,
  scoreEarned: number
): Promise<{ streak: number; totalPoints: number }> {
  // Get current profile data
  const profile = await db.prepare(
    'SELECT streak_count, total_points FROM profiles WHERE id = ?'
  ).bind(userId).first<{ streak_count: number; total_points: number }>();

  if (!profile) return { streak: 0, totalPoints: 0 };

  // Check consecutive days: find the most recent completed learning record
  // If yesterday also had a completed record, increment streak; otherwise reset to 1
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const yesterdayRecord = await db.prepare(
    `SELECT id FROM learning_records
     WHERE student_id = ? AND is_completed = 1 AND date(completed_at) = ?`
  ).bind(userId, yesterdayStr).first();

  // Also check if there was already a record today (to avoid double counting)
  const todayRecordCount = await db.prepare(
    `SELECT COUNT(*) as count FROM learning_records
     WHERE student_id = ? AND is_completed = 1 AND date(completed_at) = ?`
  ).bind(userId, todayStr).first<{ count: number }>();

  let newStreak: number;
  if ((todayRecordCount?.count || 0) > 1) {
    // Already counted for today
    newStreak = profile.streak_count;
  } else if (yesterdayRecord) {
    newStreak = profile.streak_count + 1;
  } else {
    newStreak = 1;
  }

  const newTotalPoints = profile.total_points + scoreEarned;

  await db.prepare(
    'UPDATE profiles SET streak_count = ?, total_points = ?, updated_at = ? WHERE id = ?'
  ).bind(newStreak, newTotalPoints, new Date().toISOString(), userId).run();

  return { streak: newStreak, totalPoints: newTotalPoints };
}

async function checkBadgeConditions(
  db: D1Database,
  userId: string,
  data: {
    total_score: number;
    max_score: number;
    streak: number;
    totalPoints: number;
    time_spent_seconds: number;
  }
): Promise<Array<{ id: string; name: string; icon: string; rarity: string }>> {
  const newBadges: Array<{ id: string; name: string; icon: string; rarity: string }> = [];

  // Get all badges the user does NOT yet have
  const unearnedResult = await db.prepare(
    `SELECT b.* FROM badges b
     WHERE b.id NOT IN (SELECT badge_id FROM student_badges WHERE student_id = ?)`
  ).bind(userId).all();

  const unearnedBadges = unearnedResult.results || [];

  // Count total completed records for this user
  const completedCount = await db.prepare(
    'SELECT COUNT(*) as count FROM learning_records WHERE student_id = ? AND is_completed = 1'
  ).bind(userId).first<{ count: number }>();
  const totalCompleted = completedCount?.count || 0;

  // Current hour (UTC, Cloudflare Workers run in UTC)
  const currentHourKST = (new Date().getUTCHours() + 9) % 24;
  const dayOfWeek = new Date().getUTCDay(); // 0=Sun, 6=Sat

  for (const badge of unearnedBadges as any[]) {
    let earned = false;

    switch (badge.condition_type) {
      case 'first_complete':
        earned = totalCompleted >= 1;
        break;
      case 'streak_3':
        earned = data.streak >= 3;
        break;
      case 'streak_7':
        earned = data.streak >= 7;
        break;
      case 'streak_30':
        earned = data.streak >= 30;
        break;
      case 'streak_100':
        earned = data.streak >= 100;
        break;
      case 'perfect_score':
        earned = data.total_score >= data.max_score && data.max_score > 0;
        break;
      case 'points_1000':
        earned = data.totalPoints >= 1000;
        break;
      case 'points_10000':
        earned = data.totalPoints >= 10000;
        break;
      case 'early_bird':
        earned = currentHourKST < 7;
        break;
      case 'weekend_learner':
        earned = dayOfWeek === 0 || dayOfWeek === 6;
        break;
      case 'math_streak_10': {
        const mathCorrect = await db.prepare(
          `SELECT COUNT(*) as count FROM question_responses qr
           JOIN questions q ON qr.question_id = q.id
           JOIN learning_records lr ON qr.learning_record_id = lr.id
           WHERE lr.student_id = ? AND q.subject = 'math' AND qr.is_correct = 1
           ORDER BY qr.created_at DESC LIMIT 10`
        ).bind(userId).first<{ count: number }>();
        earned = (mathCorrect?.count || 0) >= 10;
        break;
      }
      case 'spelling_streak_20': {
        const spellingCorrect = await db.prepare(
          `SELECT COUNT(*) as count FROM question_responses qr
           JOIN questions q ON qr.question_id = q.id
           JOIN learning_records lr ON qr.learning_record_id = lr.id
           WHERE lr.student_id = ? AND q.subject = 'spelling' AND qr.is_correct = 1
           ORDER BY qr.created_at DESC LIMIT 20`
        ).bind(userId).first<{ count: number }>();
        earned = (spellingCorrect?.count || 0) >= 20;
        break;
      }
      case 'hanja_50': {
        const hanjaCorrect = await db.prepare(
          `SELECT COUNT(*) as count FROM question_responses qr
           JOIN questions q ON qr.question_id = q.id
           JOIN learning_records lr ON qr.learning_record_id = lr.id
           WHERE lr.student_id = ? AND q.subject = 'hanja' AND qr.is_correct = 1`
        ).bind(userId).first<{ count: number }>();
        earned = (hanjaCorrect?.count || 0) >= 50;
        break;
      }
      case 'english_streak_30': {
        const engCorrect = await db.prepare(
          `SELECT COUNT(*) as count FROM question_responses qr
           JOIN questions q ON qr.question_id = q.id
           JOIN learning_records lr ON qr.learning_record_id = lr.id
           WHERE lr.student_id = ? AND q.subject = 'english' AND qr.is_correct = 1
           ORDER BY qr.created_at DESC LIMIT 30`
        ).bind(userId).first<{ count: number }>();
        earned = (engCorrect?.count || 0) >= 30;
        break;
      }
      case 'all_subject_90': {
        // Check all subjects have >= 90% correct rate
        const subjectStats = await db.prepare(
          `SELECT q.subject,
            SUM(CASE WHEN qr.is_correct = 1 THEN 1 ELSE 0 END) as correct,
            COUNT(*) as total
           FROM question_responses qr
           JOIN questions q ON qr.question_id = q.id
           JOIN learning_records lr ON qr.learning_record_id = lr.id
           WHERE lr.student_id = ? AND q.subject NOT IN ('emotion_check', 'readiness_check')
           GROUP BY q.subject`
        ).bind(userId).all();
        const stats = subjectStats.results || [];
        if (stats.length >= 5) { // At least 5 different subjects attempted
          earned = stats.every((s: any) => s.total > 0 && (s.correct / s.total) >= 0.9);
        }
        break;
      }
      default:
        break;
    }

    if (earned) {
      const sbId = crypto.randomUUID();
      await db.prepare(
        'INSERT OR IGNORE INTO student_badges (id, student_id, badge_id, earned_at) VALUES (?, ?, ?, ?)'
      ).bind(sbId, userId, badge.id, new Date().toISOString()).run();
      newBadges.push({
        id: badge.id,
        name: badge.name,
        icon: badge.icon,
        rarity: badge.rarity,
      });
    }
  }

  return newBadges;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
