// Cloudflare Pages Function: GET /api/admin/stats
// Returns admin dashboard statistics from D1 database

import { verifyToken } from "../../lib/crypto";

interface Env {
  DB: D1Database;
  AUTH_SECRET: string;
  CRON_SECRET?: string;
  ANTHROPIC_API_KEY?: string;
  ALLOWED_ORIGIN?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // Verify admin role from signed token
    const authHeader = context.request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ message: "인증이 필요합니다." }, 401);
    }

    const tokenData = await verifyToken(authHeader.slice(7), context.env.AUTH_SECRET);
    if (!tokenData) {
      return jsonResponse({ message: "유효하지 않은 토큰입니다." }, 401);
    }
    const userId = tokenData.id;

    const requester = await context.env.DB.prepare(
      "SELECT role FROM profiles WHERE id = ?"
    ).bind(userId).first<{ role: string }>();

    if (!requester || requester.role !== "admin") {
      return jsonResponse({ message: "관리자 권한이 필요합니다." }, 403);
    }

    // 1. Total users count
    const totalUsersRow = await context.env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM profiles"
    ).first<{ cnt: number }>();
    const totalUsers = totalUsersRow?.cnt || 0;

    // 2. Role breakdown
    const roleRows = await context.env.DB.prepare(
      `SELECT role, COUNT(*) as cnt FROM profiles
       WHERE NOT (role = 'teacher' AND approval_status != 'approved')
       GROUP BY role`
    ).all();

    const roleCounts: Record<string, number> = {};
    for (const row of (roleRows.results || []) as any[]) {
      roleCounts[row.role] = row.cnt;
    }

    // 3. Paid subscriptions
    const paidRow = await context.env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM profiles WHERE subscription_plan != 'free' AND subscription_plan IS NOT NULL"
    ).first<{ cnt: number }>();
    const paidSubscriptions = paidRow?.cnt || 0;

    // 4. Active students in last 7 days
    const activeRow = await context.env.DB.prepare(
      `SELECT COUNT(DISTINCT student_id) as cnt FROM learning_records
       WHERE date(created_at) >= date('now', '-7 days')`
    ).first<{ cnt: number }>();
    const activeStudents = activeRow?.cnt || 0;

    // 5. Total daily sets
    // 학생 기기에서 올라온 세트 스냅샷(is_published = 0)은 배포 콘텐츠가 아니므로
    // 세지 않는다 — functions/lib/client-set.ts 참고.
    const setsRow = await context.env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM daily_sets WHERE is_published = 1"
    ).first<{ cnt: number }>();
    const totalSets = setsRow?.cnt || 0;

    // 6. Pending teacher count
    const pendingRow = await context.env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM profiles WHERE role = 'teacher' AND approval_status = 'pending'"
    ).first<{ cnt: number }>();
    const pendingTeachers = pendingRow?.cnt || 0;

    // 7. Recent signups (latest 10)
    const recentUsersResult = await context.env.DB.prepare(
      `SELECT id, name, role, grade, created_at FROM profiles
       ORDER BY created_at DESC LIMIT 10`
    ).all();

    const recentUsers = (recentUsersResult.results || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      grade: row.grade,
      created_at: row.created_at,
    }));

    // 8. Recent learning activity (latest 10 completed sessions)
    const recentLearningResult = await context.env.DB.prepare(
      `SELECT lr.student_id, p.name as student_name, lr.total_score, lr.max_score,
              lr.completed_at, ds.title as set_title
       FROM learning_records lr
       JOIN profiles p ON lr.student_id = p.id
       JOIN daily_sets ds ON lr.daily_set_id = ds.id
       WHERE lr.is_completed = 1
       ORDER BY lr.completed_at DESC LIMIT 10`
    ).all();

    const recentLearning = (recentLearningResult.results || []).map((row: any) => ({
      studentName: row.student_name,
      setTitle: row.set_title,
      score: row.total_score,
      maxScore: row.max_score,
      completedAt: row.completed_at,
    }));

    return jsonResponse({
      totalUsers,
      paidSubscriptions,
      activeStudents,
      totalSets,
      pendingTeachers,
      roleCounts: {
        student: roleCounts.student || 0,
        teacher: roleCounts.teacher || 0,
        parent: roleCounts.parent || 0,
        admin: roleCounts.admin || 0,
      },
      recentUsers,
      recentLearning,
      // 운영 점검용: 어떤 시크릿이 설정돼 있는지 **여부만** 노출한다(값은 절대
      // 나가지 않는다). 대시보드에서 wrangler 없이 설정 누락을 확인하려는 것.
      config: {
        cronSecret: !!context.env.CRON_SECRET,
        anthropicApiKey: !!context.env.ANTHROPIC_API_KEY,
        allowedOrigin: context.env.ALLOWED_ORIGIN || null,
      },
    });
  } catch {
    return jsonResponse(
      { message: "관리자 통계 조회 중 오류가 발생했습니다." },
      500,
    );
  }
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
