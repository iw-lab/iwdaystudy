// GET /api/admin/users?role=&limit=&offset= - list all users (admin only)

import { verifyToken } from "../../lib/crypto";

interface Env {
  DB: D1Database;
  AUTH_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const authHeader = context.request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const tokenData = token ? await verifyToken(token, context.env.AUTH_SECRET) : null;
  if (!tokenData) return jsonResponse({ message: '인증이 필요합니다.' }, 401);
  const userId = tokenData.id;

  const caller = await context.env.DB.prepare(
    'SELECT role FROM profiles WHERE id = ?',
  ).bind(userId).first<{ role: string }>();
  if (!caller || caller.role !== 'admin') {
    return jsonResponse({ message: '관리자 권한이 필요합니다.' }, 403);
  }

  const url = new URL(context.request.url);
  const role = url.searchParams.get('role');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '200', 10), 500);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);

  // 참고: 이 베이스 문자열엔 WHERE/ORDER BY 가 없어 보이지만 아래서 항상 이어붙는다
  // (role 있으면 WHERE role=?, 그리고 항상 ORDER BY created_at DESC LIMIT ? OFFSET ?).
  // 실제 실행 SQL은 idx_profiles_role_created/idx_profiles_created 를 탄다 — 정적 분석기
  // (check-db-reads.mjs)는 이어붙이기 전의 이 조각만 본다. gb-scan-ok: 실행 SQL은 idx_profiles_role_created/idx_profiles_created
  let sql = 'SELECT id, email, name, role, grade, semester, school_name, class_name, student_number, approval_status, subscription_plan, streak_count, total_points, created_at FROM profiles';
  const binds: unknown[] = [];
  if (role && ['student', 'teacher', 'parent', 'admin'].includes(role)) {
    sql += ' WHERE role = ?';
    binds.push(role);
  }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  binds.push(limit, offset);

  const result = await context.env.DB.prepare(sql).bind(...binds).all();
  return jsonResponse({ users: result.results || [] });
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
