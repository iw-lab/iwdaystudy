// Cloudflare Pages Function: GET /api/daily-set/history?days=180
//
// 로그인한 학생 본인의 학습 기록을 돌려준다. 기기를 바꾸거나 브라우저 데이터를
// 지워도 연속일수·포인트·"오늘 이 세트 이미 했음" 판정이 살아나게 하는 용도다.
// (문항 중복 방지 시그니처는 복원 대상이 아니다 — 문항 본문 전체를 내려받아야
//  해서 비용이 크다. 새 기기에서 일부 문항이 다시 나올 수 있다.)

import { authUserId } from '../../lib/ctx';

interface Env {
  DB: D1Database;
}

const DEFAULT_DAYS = 180;
const MAX_DAYS = 400;
const MAX_ROWS = 1000;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const userId = authUserId(context.data);
    if (!userId) {
      return jsonResponse({ message: '인증이 필요합니다.' }, 401);
    }

    const url = new URL(context.request.url);
    const rawDays = parseInt(url.searchParams.get('days') || '', 10);
    const days =
      Number.isFinite(rawDays) && rawDays > 0
        ? Math.min(rawDays, MAX_DAYS)
        : DEFAULT_DAYS;

    const from = new Date();
    from.setDate(from.getDate() - days);
    const fromStr = from.toISOString().split('T')[0];

    const result = await context.env.DB.prepare(
      `SELECT id, daily_set_id, class_id, started_at, completed_at,
              total_score, max_score, time_spent_seconds, is_completed, created_at
       FROM learning_records
       WHERE student_id = ? AND date(created_at) >= ?
       ORDER BY created_at DESC
       LIMIT ?`,
    )
      .bind(userId, fromStr, MAX_ROWS)
      .all<{
        id: string;
        daily_set_id: string;
        class_id: string | null;
        started_at: string;
        completed_at: string | null;
        total_score: number;
        max_score: number;
        time_spent_seconds: number;
        is_completed: number;
        created_at: string;
      }>();

    const profile = await context.env.DB.prepare(
      'SELECT streak_count, total_points FROM profiles WHERE id = ?',
    )
      .bind(userId)
      .first<{ streak_count: number; total_points: number }>();

    const records = (result.results || []).map((r) => ({
      ...r,
      is_completed: r.is_completed === 1,
      // 저장 id 는 `<클라이언트 세트id>~<내용해시>` 형태다. 클라이언트는 앞부분만
      // 알기 때문에 잘라서 함께 돌려준다(functions/lib/client-set.ts 참고).
      client_set_id: r.daily_set_id.split('~')[0],
    }));

    return jsonResponse({
      records,
      streak_count: profile?.streak_count ?? 0,
      total_points: profile?.total_points ?? 0,
    });
  } catch {
    return jsonResponse({ message: '학습 기록 조회 중 오류가 발생했습니다.' }, 500);
  }
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
