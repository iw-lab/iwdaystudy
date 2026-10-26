// 학교 순위 허브 직결 주소가 CSP connect-src 에 있어야 한다 — 2026-10-26 배포본이 «불러오지 못했어요»(connect-src 'self' 가 막음)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
test('CSP connect-src 에 SCHOOL_HUB', () => {
  const hub = read('src/lib/school-hub.ts').match(/SCHOOL_HUB = "([^"]+)"/)[1];
  const csp = read('functions/_middleware.ts').match(/"connect-src [^"]*"/)[0];
  assert.ok(csp.includes(hub), `${csp} 에 ${hub} 없음`);
});
