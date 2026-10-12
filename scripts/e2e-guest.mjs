#!/usr/bin/env node
// 로그인 없이(게스트) 처음 화면 → 학년·학기 고르기 → 오늘의 학습 한 세트를 끝까지 → 결과·설정까지 실제로 눌러 본다.
//   node scripts/e2e-guest.mjs [--url http://localhost:3917] [--out /tmp/ara-e2e] [--grade 4] [--sem 1] [--vp pc|m|all]
// 실패 조건: 콘솔 에러·페이지 에러 · 가로 스크롤 · 게스트 시작 실패 · 세트가 끝나지 않음 · 결과 화면 없음
//            · «밑줄 친»/«굵게 표시한» 지시문인데 화면에 밑줄/굵은 글씨가 없음 · 빗금 분수 노출
import { mkdirSync } from 'node:fs';
let puppeteer;
try { puppeteer = (await import('puppeteer-core')).default; }
catch { puppeteer = (await import('/Users/sim-insu/Documents/dev/iwpuzzle/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js')).default; }

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const BASE = arg('--url', 'http://localhost:3917').replace(/\/$/, '');
const OUT = arg('--out', '/tmp/ara-e2e');
const GRADE = Number(arg('--grade', 4));
const SEM = Number(arg('--sem', 1));
const VPS = { pc: { width: 1440, height: 900 }, m: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
const which = arg('--vp', 'all');
mkdirSync(OUT, { recursive: true });

const fails = [];
const fail = (m) => { fails.push(m); console.log('  ✗ ' + m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', pipe: true, headless: 'new', protocolTimeout: 180000 });
for (const [vpName, vp] of Object.entries(VPS)) {
  if (which !== 'all' && which !== vpName) continue;
  console.log(`== ${vpName} ${vp.width}×${vp.height}`);
  const ctx = await b.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport(vp);
  const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/favicon|Download the React DevTools|net::ERR_|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  const shot = async (n) => p.screenshot({ path: `${OUT}/${vpName}-${n}.png` });
  const overflow = async (where) => {
    const w = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (w > 1) fail(`${where}: 가로 스크롤 ${w}px`);
  };
  const clickText = async (re, scope = 'button, a') => p.evaluate((src, flags, scope) => {
    const r = new RegExp(src, flags);
    const el = [...document.querySelectorAll(scope)].find((e) => r.test(e.textContent.trim()) && !e.disabled && e.offsetParent !== null);
    if (el) { el.click(); return el.textContent.trim().slice(0, 40); }
    return null;
  }, re.source, re.flags, scope);

  await p.goto(BASE + '/', { waitUntil: 'load', timeout: 120000 });
  await sleep(800);
  if (!(await p.$('[data-guest-ready]'))) fail('처음 화면에 «로그인 없이 시작» 카드가 없다');
  await overflow('처음 화면'); await shot('01-landing');

  await clickText(new RegExp(`^${GRADE}$`));
  await clickText(new RegExp(`^${SEM}학기$`));
  await p.click('[data-testid=guest-start]');
  await p.waitForFunction(() => location.pathname.startsWith('/student'), { timeout: 60000 }).catch(() => fail('게스트 시작 후 /student 로 가지 않았다'));
  await sleep(2500);
  const who = await p.evaluate(() => JSON.parse(localStorage.getItem('araharu_current_user') || 'null'));
  if (!who || !who.id?.startsWith('guest-') || who.grade !== GRADE || who.semester !== SEM) fail(`게스트 프로필 이상: ${JSON.stringify(who)?.slice(0, 120)}`);
  if (await p.evaluate(() => !!localStorage.getItem('auth_token'))) fail('게스트인데 auth_token 이 있다');
  await overflow('학생 홈'); await shot('02-home');

  await p.goto(BASE + '/student/daily/', { waitUntil: 'load', timeout: 120000 });
  await sleep(2500);
  await shot('03-daily');
  const started = await clickText(/시작|이어서|학습하기/);
  if (!started) fail('오늘의 학습 시작 단추를 못 찾았다');
  await p.waitForFunction(() => /\/student\/daily\/.+/.test(location.pathname), { timeout: 60000 }).catch(() => fail('세트 화면으로 가지 않았다'));
  await sleep(2500);

  const NAV = /^(나가기|이전|다음|제출하기|문제를 풀어주세요|모든 문제를 풀어주세요|일시정지|계속|🔊|듣기)/;
  let done = false;
  let lastSig = '', same = 0;
  for (let step = 0; step < 120 && !done; step++) {
    const state = await p.evaluate(() => {
      const main = document.querySelector('main') || document.body;
      const text = main.innerText;
      const underlineCue = /밑줄\s*친/.test(text);
      const hasU = !!main.querySelector('u, .underline, [class*="underline"]');
      const sm = [...text.matchAll(/(?<![\d/])\d+\/\d+(?![\d/])/g)];
      const slash = sm.map((m) => text.slice(Math.max(0, m.index - 40), m.index + 20).replace(/\s+/g, ' '));
      return { text: text.slice(0, 400), underlineCue, hasU, slash: slash.slice(0, 3), result: /과목별 결과/.test(text) };
    });
    if (state.result) { done = true; break; }
    if (state.underlineCue && !state.hasU) fail(`«밑줄 친» 지시문인데 밑줄이 없다: ${state.text.replace(/\s+/g, ' ').slice(0, 120)}`);
    if (state.slash.length) fail(`빗금 분수 노출: «${state.slash.join(' | ')}»`);
    if (step === 2) { await overflow('문항 화면'); await shot('04-question'); }
    if ([7, 11, 15, 19].includes(step)) { await overflow('문항 화면'); await shot(`04-q${step}`); }
    const sig = state.text.slice(0, 200);
    same = sig === lastSig ? same + 1 : 0; lastSig = sig;
    if (same >= 6) { await shot(`stuck-${step}`); fail(`진행이 멈췄다(step ${step}): ${state.text.replace(/\s+/g, ' ').slice(0, 160)}`); break; }

    // ① 다음/제출하기가 열려 있으면 누른다
    const nx = await clickText(/^(제출하기|다음|복습 완료)/);
    if (process.env.E2E_DEBUG) console.log(`  · step ${step} next=${nx} | ${state.text.replace(/\s+/g, ' ').slice(40, 110)}`);
    if (nx) { await sleep(900); continue; }
    // ② 답하기: 글쓰기 칸 → 입력칸 → 확인·완료류 → 보기
    const acted = await p.evaluate((navSrc) => {
      const nav = new RegExp(navSrc);
      const area = document.querySelector('main') || document.body;
      const vis = (x) => !x.disabled && x.offsetParent !== null;
      const ta = [...area.querySelectorAll('textarea')].find((t) => vis(t) && !t.value);
      if (ta) { Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(ta, '나는 오늘 학교에서 친구와 함께 도서관에 가서 재미있는 책을 읽었다. 책 속 주인공처럼 용감해지고 싶다고 생각했다. 내일도 책을 읽을 것이다.'); ta.dispatchEvent(new Event('input', { bubbles: true })); return 'textarea'; }
      const inp = [...area.querySelectorAll('input[type=text], input[type=number], input[inputmode], input:not([type])')].find((t) => vis(t) && !t.value);
      if (inp) { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(inp, '1'); inp.dispatchEvent(new Event('input', { bubbles: true })); return 'input'; }
      const btns = [...area.querySelectorAll('button')].filter((x) => vis(x) && x.textContent.trim() && !nav.test(x.textContent.trim()) && !x.closest('[class*="sticky"], [class*="fixed"]'));
      // 체크 목록(준비물): 안 누른 항목을 모두 한 번씩 누른다
      if (/준비물 확인/.test(area.innerText)) {
        const items = btns.filter((x) => !/(완료|준비됐어요|없어요)!?$/.test(x.textContent.trim()) && x.getAttribute('aria-pressed') !== 'true' && !x.dataset.e2eClicked);
        if (items.length) { items.forEach((x) => { x.dataset.e2eClicked = '1'; x.click(); }); return 'checklist'; }
      }
      const submit = btns.find((x) => /(정답 확인|확인하기|제출|완료|기록|다 썼어요|체크 완료|확인|준비됐어요|없어요)!?$/.test(x.textContent.trim()));
      if (submit) { submit.click(); return 'submit:' + submit.textContent.trim().slice(0, 12); }
      const choice = btns.find((x) => !/(힌트|소리|듣기|발음|읽어)/.test(x.textContent));
      if (choice) { choice.click(); return 'choice:' + choice.textContent.trim().slice(0, 12); }
      return null;
    }, NAV.source);
    if (process.env.E2E_DEBUG) console.log(`    acted=${acted}`);
    await sleep(acted ? 500 : 900);
  }
  await sleep(1500);
  await shot('05-result');
  await overflow('결과 화면');
  if (!done) fail('세트를 끝까지 풀지 못했다(결과 화면 미확인)');

  await p.goto(BASE + '/student/settings/', { waitUntil: 'load', timeout: 120000 });
  await sleep(1500);
  const st = await p.evaluate(() => document.body.innerText);
  if (!/기록 옮기기/.test(st)) fail('설정 화면에 기록 옮기기가 없다');
  await overflow('설정'); await shot('06-settings');

  for (const e of errs) fail(e);
  await ctx.close();
}
await b.close();
console.log(fails.length ? `❌ 실패 ${fails.length}건` : '✅ 게스트 e2e 통과');
process.exit(fails.length ? 1 : 0);
