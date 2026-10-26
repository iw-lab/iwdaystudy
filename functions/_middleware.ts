// Cloudflare Pages middleware: CORS headers, auth token validation, security headers, and dynamic route rewriting

import { verifyToken } from "./lib/crypto";
import { checkRateLimit } from "./lib/rate-limit";

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  AUTH_SECRET: string;
  ALLOWED_ORIGIN?: string;
  CRON_SECRET?: string;
}

interface MiddlewareData extends Record<string, unknown> {
  userId?: string;
  userEmail?: string | null;
  userRole?: string;
  cronAuthenticated?: boolean;
}

// 실제 운영 도메인은 araharu-ecp.pages.dev 다(araharu.pages.dev 는 갱신되지 않는
// 별개의 옛 Pages 프로젝트). 목록 첫 항목이 매칭 실패 시의 기본값이 되므로
// 운영 도메인을 앞에 둔다. 필요하면 ALLOWED_ORIGIN 환경변수로 덮어쓴다.
const DEFAULT_ORIGIN =
  "https://araharu-ecp.pages.dev,https://araharu.pages.dev";

function resolveAllowedOrigin(requestOrigin: string | null, env: Env): string {
  const allowed = env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  const allowList = allowed.split(",").map((o) => o.trim());
  if (requestOrigin && allowList.includes(requestOrigin)) return requestOrigin;
  return allowList[0];
}

function constantTimeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Paths that do NOT require authentication
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/version',
];

// Dynamic route patterns: prefix to match → placeholder base path
const DYNAMIC_ROUTE_PREFIXES: { pattern: RegExp; placeholder: string }[] = [
  { pattern: /^\/teacher\/classes\/(?!placeholder\b)[^/]+/, placeholder: '/teacher/classes/placeholder' },
  { pattern: /^\/teacher\/students\/(?!placeholder\b|bulk-create\b)[^/]+/, placeholder: '/teacher/students/placeholder' },
  { pattern: /^\/student\/daily\/(?!placeholder\b)[^/]+/, placeholder: '/student/daily/placeholder' },
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname === `${p}/`);
}

export const onRequest: PagesFunction<Env, string, MiddlewareData> = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const requestOrigin = request.headers.get('Origin');
  const allowedOrigin = resolveAllowedOrigin(requestOrigin, context.env);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Vary': 'Origin',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Sequential URL rewriting: dynamic route → RSC segment → fetch asset
  let assetPath = url.pathname;
  let needsRewrite = false;

  // Step 1: Replace dynamic route segments with placeholder
  for (const route of DYNAMIC_ROUTE_PREFIXES) {
    if (route.pattern.test(assetPath)) {
      const match = assetPath.match(route.pattern);
      if (match) {
        const matchedPart = match[0];
        const rest = assetPath.slice(matchedPart.length);
        if (!rest || rest === '/') {
          assetPath = route.placeholder + '/index.html';
        } else {
          assetPath = route.placeholder + rest;
        }
        needsRewrite = true;
        break;
      }
    }
  }

  // Step 2: Rewrite RSC segment files: __next.X.Y.Z.txt → __next.X/Y/Z.txt
  const rewriteParts = assetPath.split('/');
  const lastPart = rewriteParts[rewriteParts.length - 1];
  if (lastPart.startsWith('__next.') && lastPart.endsWith('.txt')) {
    const segments = lastPart.split('.');
    if (segments.length > 3) {
      const dirName = segments[0] + '.' + segments[1];
      const filePath = segments.slice(2, -1).join('/') + '.txt';
      const basePath = rewriteParts.slice(0, -1).join('/');
      assetPath = basePath + '/' + dirName + '/' + filePath;
      needsRewrite = true;
    }
  }

  // Fetch rewritten asset
  if (needsRewrite) {
    const assetUrl = new URL(assetPath, url.origin);
    return context.env.ASSETS.fetch(new Request(assetUrl.toString()));
  }

  // 아래 /api 처리 전체를 감싼다 — 레이트리밋·계정상태 조회에서 예외가 나도
  // 스택 트레이스가 아니라 일반 JSON 500 이 나가야 한다.
  try {
  // Rate limiting for sensitive endpoints (login, signup, generate)
  if (url.pathname.startsWith('/api')) {
    const rateCheck = await checkRateLimit(context.env.DB, request, url.pathname);
    if (!rateCheck.ok) {
      return new Response(
        JSON.stringify({ message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigin,
            'Vary': 'Origin',
            'Retry-After': String(rateCheck.retryAfter),
          },
        }
      );
    }
  }

  // Only apply auth checks to /api routes
  if (url.pathname.startsWith('/api') && !isPublicPath(url.pathname)) {
    // Cron endpoints accept a shared secret instead of a JWT
    const isCron = url.pathname.startsWith('/api/cron/');
    const cronHeader = request.headers.get('X-Cron-Secret');
    const cronOk =
      isCron &&
      !!context.env.CRON_SECRET &&
      !!cronHeader &&
      constantTimeStringEqual(cronHeader, context.env.CRON_SECRET);

    if (!cronOk) {
      const authHeader = request.headers.get('Authorization');
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      const tokenData = token ? await verifyToken(token, context.env.AUTH_SECRET) : null;
      if (!tokenData) {
        return new Response(
          JSON.stringify({ message: '인증이 필요합니다.' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': allowedOrigin,
              'Vary': 'Origin',
            },
          }
        );
      }
      // Central account-state gate: a signed token alone is not authorization.
      // Teachers stay locked out until an admin approves them, and a deleted
      // account's still-valid token stops working immediately.
      const account = await context.env.DB.prepare(
        'SELECT role, approval_status FROM profiles WHERE id = ?',
      )
        .bind(tokenData.id)
        .first<{ role: string; approval_status: string | null }>();

      if (!account) {
        return new Response(
          JSON.stringify({ message: '계정을 찾을 수 없습니다. 다시 로그인해주세요.' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': allowedOrigin,
              'Vary': 'Origin',
            },
          },
        );
      }

      if (account.role === 'teacher' && account.approval_status !== 'approved') {
        return new Response(
          JSON.stringify({
            message:
              account.approval_status === 'rejected'
                ? '승인이 거절된 계정입니다. 관리자에게 문의해주세요.'
                : '관리자 승인 대기 중인 계정입니다.',
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': allowedOrigin,
              'Vary': 'Origin',
            },
          },
        );
      }

      // Pages Functions pass values to downstream handlers via `context.data`,
      // NOT by mutating `context` (the handler receives a different context object).
      context.data.userId = tokenData.id;
      context.data.userEmail = tokenData.email ?? null;
      context.data.userRole = account.role;
    } else {
      context.data.cronAuthenticated = true;
    }
  }

  // Continue to the actual function handler.
  const response = await context.next();

  // CORS headers (origin-restricted)
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Vary', 'Origin');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  // CSP: allow self + api.anthropic (for server-side call only — CSP applies to client, so harmless)
  const ct0 = response.headers.get('Content-Type') || '';
  if (ct0.includes('text/html')) {
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://araharu-hub.simssijjang-a04.workers.dev", // 학교 순위 허브(직결) — 없으면 «불러오지 못했어요»
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "upgrade-insecure-requests",
      ].join('; ')
    );
  }
  response.headers.delete('X-Powered-By');

  // Prevent caching of HTML pages (JS/CSS with hashes are fine to cache)
  const ct = response.headers.get('Content-Type') || '';
  if (ct.includes('text/html') || url.pathname === '/' || (!url.pathname.includes('.') && !url.pathname.startsWith('/api'))) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  return response;
  } catch (err) {
    // 여기까지 온 예외는 클라이언트에게 스택 트레이스로 나가면 안 된다.
    if (url.pathname.startsWith('/api')) {
      console.error('[api-error]', url.pathname, err);
      return new Response(
        JSON.stringify({
          message: '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowedOrigin,
            'Vary': 'Origin',
          },
        },
      );
    }
    throw err;
  }
};
