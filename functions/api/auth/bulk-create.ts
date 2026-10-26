// Cloudflare Pages Function: POST /api/auth/bulk-create
// Creates multiple student accounts in D1 for cross-device login

import { authUserId } from '../../lib/ctx';
import { hashPassword } from "../../lib/crypto";
import { logAudit, clientIp } from "../../lib/audit";

interface Env {
  DB: D1Database;
  AUTH_SECRET: string;
}

interface BulkCreateBody {
  students: {
    email: string;
    name: string;
    password: string;
    grade: number;
    semester: number;
    class_name: string;
    teacher_id: string;
    student_number: number;
  }[];
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // 2026-10-26 사용자 «아라하루 개인정보 이제 안 받기로» — 새 계정(이름·이메일)은 받지 않는다. 화면은 10-13 에 이미 없앴는데 API 가 살아 있었다.
  // 🔒 tests/policy-pages.test.mjs «계정 만들기 API 닫힘»
  if (context) return jsonResponse({ message: "아라하루는 이제 가입 없이 씁니다. 학생 계정 일괄 만들기는 닫혔어요." }, 410);
  try {
    const callerId = authUserId(context.data) as string | undefined;
    if (!callerId) {
      return jsonResponse({ message: "인증이 필요합니다." }, 401);
    }

    const caller = await context.env.DB.prepare(
      "SELECT role, approval_status FROM profiles WHERE id = ?",
    ).bind(callerId).first<{ role: string; approval_status: string | null }>();

    if (!caller || (caller.role !== "teacher" && caller.role !== "admin")) {
      return jsonResponse({ message: "교사 또는 관리자 권한이 필요합니다." }, 403);
    }
    if (caller.role === "teacher" && caller.approval_status !== "approved") {
      return jsonResponse({ message: "승인되지 않은 교사 계정입니다." }, 403);
    }

    const { students } = (await context.request.json()) as BulkCreateBody;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return jsonResponse({ message: "학생 데이터가 필요합니다." }, 400);
    }

    if (students.length > 100) {
      return jsonResponse({ message: "한 번에 최대 100명까지 생성 가능합니다." }, 400);
    }

    for (const s of students) {
      if (!s.email || !s.name || !s.password || typeof s.grade !== "number" || typeof s.semester !== "number") {
        return jsonResponse({ message: "학생 정보가 올바르지 않습니다." }, 400);
      }
      if (s.email.length > 120 || s.name.length > 60 || s.password.length < 4 || s.password.length > 200) {
        return jsonResponse({ message: "입력값 길이가 허용 범위를 벗어났습니다." }, 400);
      }
      if (s.grade < 1 || s.grade > 6 || (s.semester !== 1 && s.semester !== 2)) {
        return jsonResponse({ message: "학년/학기 값이 올바르지 않습니다." }, 400);
      }
    }

    const now = new Date().toISOString();
    const created: string[] = [];
    const skipped: string[] = [];
    const isAdmin = caller.role === "admin";

    for (const s of students) {
      // Teachers can only create students under themselves.
      // Admins may pass an explicit teacher_id, which must reference an existing approved teacher.
      const teacherId = isAdmin && s.teacher_id ? s.teacher_id : callerId;
      if (isAdmin && s.teacher_id && s.teacher_id !== callerId) {
        const t = await context.env.DB.prepare(
          "SELECT role, approval_status FROM profiles WHERE id = ?",
        ).bind(s.teacher_id).first<{ role: string; approval_status: string | null }>();
        if (!t || t.role !== "teacher" || t.approval_status !== "approved") {
          return jsonResponse({ message: "지정한 교사 ID가 유효하지 않습니다." }, 400);
        }
      }
      // Check if email already exists
      const existing = await context.env.DB.prepare(
        "SELECT id FROM profiles WHERE email = ?",
      )
        .bind(s.email)
        .first();

      if (existing) {
        skipped.push(s.email);
        continue;
      }

      const id = crypto.randomUUID();
      await context.env.DB.prepare(
        `INSERT INTO profiles (id, email, name, role, grade, semester, class_name, teacher_id, student_number, password_hash, approval_status, subscription_plan, streak_count, total_points, created_at, updated_at)
         VALUES (?, ?, ?, 'student', ?, ?, ?, ?, ?, ?, 'approved', 'free', 0, 0, ?, ?)`,
      )
        .bind(
          id,
          s.email,
          s.name,
          s.grade,
          s.semester,
          s.class_name,
          teacherId,
          s.student_number,
          await hashPassword(s.password),
          now,
          now,
        )
        .run();

      created.push(s.email);
    }

    await logAudit(context.env.DB, {
      actorId: callerId,
      actorRole: caller.role,
      action: "bulk_create_students",
      targetType: "students",
      ip: clientIp(context.request),
      metadata: { created: created.length, skipped: skipped.length },
    });

    return jsonResponse({
      created: created.length,
      skipped: skipped.length,
      message: `${created.length}명 생성, ${skipped.length}명 이미 존재`,
    }, 201);
  } catch {
    return jsonResponse(
      { message: "학생 일괄생성 중 오류가 발생했습니다." },
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
