// Cloudflare Pages Function: POST /api/teacher/reset-password
//
// 담임 교사(또는 관리자)가 자기 학생의 비밀번호를 초기화한다.
// 초등학교 현장에서 학생이 비밀번호를 잊는 일은 상수에 가까운데, 학생 계정에는
// 본인 확인 수단(실메일·전화)이 없어서 셀프 재설정을 만들 수 없다. 그래서
// "담임이 초기화해 주는" 경로가 유일하게 성립하는 복구 수단이다.
//
// 기본값은 계정 생성 규칙과 같은 "아이디와 동일"(ara01@class.local → ara01).

import { authUserId } from '../../lib/ctx';
import { hashPassword } from '../../lib/crypto';
import { clearAccountRateLimit } from '../../lib/rate-limit';

interface Env {
  DB: D1Database;
}

interface Body {
  student_id?: string;
  new_password?: string;
}

const MIN_PASSWORD = 4;
const MAX_PASSWORD = 200;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const userId = authUserId(context.data);
    if (!userId) {
      return jsonResponse({ message: '인증이 필요합니다.' }, 401);
    }

    const body = (await context.request.json()) as Body;
    const studentId = body?.student_id;
    if (!studentId || typeof studentId !== 'string' || studentId.length > 64) {
      return jsonResponse({ message: '학생을 지정해주세요.' }, 400);
    }

    const requester = await context.env.DB.prepare(
      'SELECT role FROM profiles WHERE id = ?',
    )
      .bind(userId)
      .first<{ role: string }>();

    if (!requester || (requester.role !== 'teacher' && requester.role !== 'admin')) {
      return jsonResponse({ message: '비밀번호를 초기화할 권한이 없습니다.' }, 403);
    }

    const student = await context.env.DB.prepare(
      'SELECT id, email, name, role, teacher_id FROM profiles WHERE id = ?',
    )
      .bind(studentId)
      .first<{
        id: string;
        email: string;
        name: string;
        role: string;
        teacher_id: string | null;
      }>();

    if (!student) {
      return jsonResponse({ message: '학생을 찾을 수 없습니다.' }, 404);
    }
    if (student.role !== 'student') {
      return jsonResponse({ message: '학생 계정만 초기화할 수 있습니다.' }, 400);
    }

    // 담임은 자기 학생만. (관리자는 전체)
    if (requester.role !== 'admin' && student.teacher_id !== userId) {
      return jsonResponse(
        { message: '담당 학생이 아닙니다.' },
        403,
      );
    }

    // 기본값 = 아이디(이메일 로컬파트). 교사가 직접 지정할 수도 있다.
    const loginId = student.email.split('@')[0];
    const newPassword =
      typeof body.new_password === 'string' && body.new_password.length > 0
        ? body.new_password
        : loginId;

    if (newPassword.length < MIN_PASSWORD || newPassword.length > MAX_PASSWORD) {
      return jsonResponse(
        { message: `비밀번호는 ${MIN_PASSWORD}자 이상이어야 합니다.` },
        400,
      );
    }

    await context.env.DB.prepare(
      'UPDATE profiles SET password_hash = ?, updated_at = ? WHERE id = ?',
    )
      .bind(await hashPassword(newPassword), new Date().toISOString(), studentId)
      .run();

    // 비밀번호를 여러 번 틀려 계정 단위 제한에 걸려 있었다면 함께 풀어준다.
    // 그러지 않으면 초기화해 주고도 학생이 한동안 로그인하지 못한다.
    await clearAccountRateLimit(context.env.DB, student.email);

    return jsonResponse({
      ok: true,
      student_id: student.id,
      name: student.name,
      login_id: loginId,
      new_password: newPassword,
    });
  } catch {
    return jsonResponse(
      { message: '비밀번호 초기화 중 오류가 발생했습니다.' },
      500,
    );
  }
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
