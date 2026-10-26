// Cloudflare Pages Function: POST /api/auth/signup

import { hashPassword, createToken } from "../../lib/crypto";
import { logAudit, clientIp } from "../../lib/audit";

interface Env {
  DB: D1Database;
  AUTH_SECRET: string;
}

interface SignupBody {
  email: string;
  password: string;
  name: string;
  role: "student" | "teacher" | "parent";
  grade?: number;
  semester?: number;
  school_name?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // 2026-10-26 사용자 «아라하루 개인정보 이제 안 받기로» — 새 계정(이름·이메일)은 받지 않는다. 화면은 10-13 에 이미 없앴는데 API 가 살아 있었다.
  // 🔒 tests/policy-pages.test.mjs «계정 만들기 API 닫힘»
  if (context) return jsonResponse({ message: "아라하루는 이제 가입 없이 씁니다. 회원가입은 닫혔어요." }, 410);
  try {
    const body = (await context.request.json()) as SignupBody;
    const { email, password, name, role, grade, semester, school_name } = body;

    if (!email || !password || !name || !role) {
      return jsonResponse({ message: "필수 항목을 모두 입력해주세요." }, 400);
    }

    if (!["student", "teacher", "parent"].includes(role)) {
      return jsonResponse({ message: "올바르지 않은 역할입니다." }, 400);
    }

    if (typeof email !== "string" || email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ message: "이메일 형식이 올바르지 않습니다." }, 400);
    }

    if (typeof name !== "string" || name.length < 1 || name.length > 60) {
      return jsonResponse({ message: "이름은 1~60자여야 합니다." }, 400);
    }

    if (typeof password !== "string" || password.length < 8 || password.length > 200) {
      return jsonResponse(
        { message: "비밀번호는 8자 이상 200자 이하여야 합니다." },
        400,
      );
    }

    if (grade !== undefined && grade !== null && (typeof grade !== "number" || grade < 1 || grade > 6)) {
      return jsonResponse({ message: "학년 값이 올바르지 않습니다." }, 400);
    }
    if (semester !== undefined && semester !== null && semester !== 1 && semester !== 2) {
      return jsonResponse({ message: "학기 값이 올바르지 않습니다." }, 400);
    }
    if (school_name !== undefined && school_name !== null && (typeof school_name !== "string" || school_name.length > 80)) {
      return jsonResponse({ message: "학교명이 너무 깁니다." }, 400);
    }

    const existing = await context.env.DB.prepare(
      "SELECT id FROM profiles WHERE email = ?",
    )
      .bind(email)
      .first();

    if (existing) {
      // Do not disclose whether the email is already registered (user enumeration)
      return jsonResponse({ message: "가입 요청을 처리할 수 없습니다." }, 409);
    }

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    // Teachers must be approved by admin before they can use privileged endpoints
    const approvalStatus = role === "teacher" ? "pending" : "approved";

    await context.env.DB.prepare(
      `INSERT INTO profiles (id, email, name, role, grade, semester, school_name, password_hash, approval_status, subscription_plan, streak_count, total_points, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'free', 0, 0, ?, ?)`,
    )
      .bind(
        id, email, name, role,
        grade ?? null, semester ?? null, school_name ?? null,
        passwordHash, approvalStatus, now, now,
      )
      .run();

    // An unapproved teacher must not receive a usable token — otherwise the
    // admin approval gate is bypassable by simply keeping the signup response.
    const token =
      approvalStatus === "approved"
        ? await createToken(
            { id, email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 },
            context.env.AUTH_SECRET,
          )
        : null;

    const user = {
      id, email, name, role,
      avatar_url: null, grade: grade ?? null, semester: semester ?? null,
      school_name: school_name ?? null, class_name: null,
      student_number: null, parent_id: null, teacher_id: null,
      subscription_plan: "free", subscription_expires_at: null,
      streak_count: 0, total_points: 0,
      approval_status: approvalStatus, created_at: now, updated_at: now,
    };

    await logAudit(context.env.DB, {
      actorId: id,
      actorRole: role,
      action: "signup",
      targetType: "user",
      targetId: id,
      ip: clientIp(context.request),
      metadata: { role, approval_status: approvalStatus },
    });

    return jsonResponse({ user, token }, 201);
  } catch {
    return jsonResponse(
      { message: "회원가입 처리 중 오류가 발생했습니다." },
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
