// 개인정보·약관·소개·문의 문구가 실제 동작(가입·로그인 없음 · 기기 저장 · 학교 합계만)과 맞는지 — 2026-10-26
// 사용자 «아라하루 개인정보 이제 안 받기로 했는데 — 개인정보처리방침·이용약관 확인하고 수정»
// 실행: node --test tests/policy-pages.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const PAGES = ['src/app/privacy/page.tsx', 'src/app/terms/page.tsx', 'src/app/about/page.tsx', 'src/app/contact/page.tsx', 'src/components/layout/Footer.tsx', 'src/app/page.tsx', 'src/app/layout.tsx', 'public/manifest.json'];
// 옛 계정·요금 시절 문구 — 지금은 거짓이다
const BANNED = ['이메일 주소', '회원 탈퇴', '법정대리인의 동의', '회원가입 후', '무료 플랜', '요금제', '학부모 계정', 'AI가 아이의', '/faq', '/guide', 'araharu.com', 'araharu.kr', '아이 정보 등록',
  // 10-26 «소개 탭도 확실히 사실로만» — 재지 않은 시간·지어낸 숫자·없는 AI
  '30분', 'AI 맞춤', 'AI 분석', '50,000', '아라하루 팀'];

test('옛 계정·요금·없는 주소 문구가 없다', () => {
  for (const p of PAGES) {
    const s = read(p);
    for (const b of BANNED) assert.ok(!s.includes(b), `${p} 에 «${b}»`);
  }
});

test('개인정보처리방침이 실제로 하는 일을 적었다', () => {
  const s = read('src/app/privacy/page.tsx');
  for (const w of ['회원가입과 로그인이 없습니다', '기기(브라우저) 안에만', '학교 순위', 'IP 원래 값은 저장하지 않습니다', '예전 학급 계정']) assert.ok(s.includes(w), `개인정보처리방침에 «${w}» 없음`);
});

test('연락처는 실제로 받는 주소 한 곳', () => {
  assert.match(read('src/lib/contact.ts'), /CONTACT_EMAIL = "simssijjang@gmail\.com"/);
});

test('계정 만들기 API 닫힘 — 이름·이메일을 받는 길이 서버에도 없다', () => {
  for (const p of ['functions/api/auth/signup.ts', 'functions/api/auth/bulk-create.ts']) {
    const s = read(p);
    const body = s.slice(s.indexOf('onRequestPost'));
    assert.match(body.slice(0, 600), /410\)/, `${p} 가 맨 앞에서 410 으로 닫지 않는다`);
  }
});
