'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

// 토큰 형식: base64url(JSON payload) + "." + hex(HMAC 서명) (구버전 토큰은 "."
// 없이 payload만 base64). payload.exp는 ms epoch. 서명 검증은 서버 몫이므로
// 클라이언트는 exp만 확인한다 — src/lib/local-auth.ts의 파싱 방식과 동일하게
// base64url → base64 변환 후 atob으로 디코딩한다.
function decodeTokenExpiry(token: string): number | null {
  try {
    const payloadPart = token.includes('.')
      ? token.slice(0, token.lastIndexOf('.'))
      : token;
    let b64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    const payload = JSON.parse(atob(b64));
    return typeof payload?.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

// exp를 읽을 수 없는(손상된) 토큰도 만료로 취급 — 서버에서도 어차피 인증되지 않는다.
function isTokenExpired(token: string): boolean {
  const exp = decodeTokenExpiry(token);
  return exp === null || exp < Date.now();
}

export function useAuth(requireAuth = false) {
  const { user, token, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [requireAuth, isAuthenticated, isLoading, router]);

  // (v2) 토큰 만료 감지: JWT가 7일 후 만료되는데 감지가 없어 만료 후 조용히
  // 깨진 화면이 뜨던 문제. 앱 진입 시 + 창 포커스/탭 복귀 시 exp를 확인해
  // 만료면 로그아웃하고 처음 화면으로 보낸다(로그인 화면은 없앴다 — 기기 기록을 그대로 이어받는다).
  const checkTokenExpiry = useCallback(() => {
    if (!isAuthenticated || !token) return;
    if (isTokenExpired(token)) {
      logout();
      router.push('/');
    }
  }, [isAuthenticated, token, logout, router]);

  useEffect(() => {
    checkTokenExpiry();
    window.addEventListener('focus', checkTokenExpiry);
    document.addEventListener('visibilitychange', checkTokenExpiry);
    return () => {
      window.removeEventListener('focus', checkTokenExpiry);
      document.removeEventListener('visibilitychange', checkTokenExpiry);
    };
  }, [checkTokenExpiry]);

  return { user, isAuthenticated, isLoading, logout };
}

export function useRequireRole(role: string) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user && user.role !== role && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, isAuthenticated, role, router]);

  return { user, isAuthenticated };
}
