// GET /api/teacher/students - list own students
// DELETE /api/teacher/students - bulk delete (requires body.student_ids)

import { authUserId } from '../../lib/ctx';
import { logAudit, clientIp } from '../../lib/audit';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const userId = authUserId(context.data) as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  const caller = await context.env.DB.prepare(
    'SELECT role FROM profiles WHERE id = ?',
  ).bind(userId).first<{ role: string }>();
  if (!caller || (caller.role !== 'teacher' && caller.role !== 'admin')) {
    return jsonResponse({ message: '교사 또는 관리자 권한이 필요합니다.' }, 403);
  }

  // 학습 집계를 함께 돌려준다. 이게 없으면 교사 화면이 자기 기기의 localStorage
  // 를 학생 id 로 뒤지게 되는데, 학생 기록은 **학생 기기**에 있으므로 전원이
  // "활동 없음"으로 보였다. 집계는 D1 의 learning_records 가 진실원이다.
  const columns = `p.id, p.email, p.name, p.grade, p.semester, p.class_name,
       p.student_number, p.streak_count, p.total_points, p.created_at,
       COUNT(lr.id) AS completed_sessions,
       AVG(CASE WHEN lr.max_score > 0
                THEN CAST(lr.total_score AS FLOAT) / lr.max_score * 100 END) AS avg_percent,
       MAX(lr.completed_at) AS last_completed_at`;
  const joinAndGroup = `FROM profiles p
       LEFT JOIN learning_records lr
         ON lr.student_id = p.id AND lr.is_completed = 1`;

  const sql = caller.role === 'admin'
    ? `SELECT ${columns} ${joinAndGroup}
       WHERE p.role = 'student'
       GROUP BY p.id ORDER BY p.created_at DESC LIMIT 1000`
    : `SELECT ${columns} ${joinAndGroup}
       WHERE p.role = 'student' AND p.teacher_id = ?
       GROUP BY p.id ORDER BY p.created_at DESC LIMIT 1000`;

  const stmt = caller.role === 'admin'
    ? context.env.DB.prepare(sql)
    : context.env.DB.prepare(sql).bind(userId);

  const result = await stmt.all();
  return jsonResponse({ students: result.results || [] });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const userId = authUserId(context.data) as string | undefined;
  if (!userId) return jsonResponse({ message: '인증이 필요합니다.' }, 401);

  const caller = await context.env.DB.prepare(
    'SELECT role FROM profiles WHERE id = ?',
  ).bind(userId).first<{ role: string }>();
  if (!caller || (caller.role !== 'teacher' && caller.role !== 'admin')) {
    return jsonResponse({ message: '교사 또는 관리자 권한이 필요합니다.' }, 403);
  }

  const body = (await context.request.json()) as { student_ids?: string[] };
  const ids = body.student_ids;
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 200) {
    return jsonResponse({ message: 'student_ids가 올바르지 않습니다. (1~200)' }, 400);
  }
  for (const id of ids) {
    if (typeof id !== 'string' || id.length > 64) {
      return jsonResponse({ message: 'student_ids 형식이 올바르지 않습니다.' }, 400);
    }
  }

  const placeholders = ids.map(() => '?').join(',');
  const whereTeacher = caller.role === 'admin' ? '' : ' AND teacher_id = ?';
  const binds = caller.role === 'admin' ? ids : [...ids, userId];

  const result = await context.env.DB
    .prepare(`DELETE FROM profiles WHERE role = 'student' AND id IN (${placeholders})${whereTeacher}`)
    .bind(...binds)
    .run();

  const deleted = result.meta?.changes ?? 0;

  await logAudit(context.env.DB, {
    actorId: userId,
    actorRole: caller.role,
    action: 'bulk_delete_students',
    targetType: 'students',
    ip: clientIp(context.request),
    metadata: { requested: ids.length, deleted },
  });

  return jsonResponse({ deleted });
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
