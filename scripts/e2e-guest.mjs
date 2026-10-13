#!/usr/bin/env node
// 로그인 없이(게스트) 처음 화면 → 학년·학기 고르기 → 오늘의 학습 한 세트를 끝까지 → 결과·설정까지 실제로 눌러 본다.
//   node scripts/e2e-guest.mjs [--url http://localhost:3917] [--out /tmp/ara-e2e] [--grade 4] [--sem 1] [--vp pc|m|all]
// 실패 조건: 콘솔 에러·페이지 에러 · 가로 스크롤 · 게스트 시작 실패 · 세트가 끝나지 않음 · 결과 화면 없음
//            · «밑줄 친»/«굵게 표시한» 지시문인데 화면에 밑줄/굵은 글씨가 없음 · 빗금 분수 노출
import { mkdirSync, writeFileSync } from 'node:fs';
import { installFracHooks, probeFractions } from './check-fraction-runtime.mjs';
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
  await installFracHooks(p);   // 보이는 글자(DOM·캔버스)의 빗금 분수를 잰다
  let fracSeen = 0;            // 쌓아 그린 분수(.frac)를 한 번이라도 봤는가 — «0곳» 이 «분수 화면을 안 봤음» 이면 무효
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

  // 로그인 화면은 없다(2026-10-13) — 옛 주소는 처음 화면으로 간다
  for (const old of ['/login/', '/signup/', '/forgot-password/']) {
    await p.goto(BASE + old, { waitUntil: 'load', timeout: 120000 });
    await p.waitForFunction(() => location.pathname === '/', { timeout: 15000 }).catch(() => fail(`${old} 가 처음 화면으로 가지 않는다`));
    if (await p.$('input[type=password]')) fail(`${old} 에 비밀번호 칸이 남아 있다`);
  }
  if (await p.$('a[href^="/login"], a[href^="/signup"]')) fail('처음 화면에 로그인·회원가입 링크가 남아 있다');

  // 우리 반 학생 기기(웨일북) — 로그인 없이 그 학생 기록을 그대로 이어받는다. 지워지면 안 된다.
  const REC = (sid) => JSON.stringify([{ id: 'rec-e2e', student_id: sid, daily_set_id: 'set-e2e', class_id: null, started_at: '2026-10-01T00:00:00Z', completed_at: '2026-10-01T00:10:00Z', total_score: 9, max_score: 10, time_spent_seconds: 600, is_completed: true, created_at: '2026-10-01T00:00:00Z' }]);
  for (const kind of ['live', 'expired']) {
    const sid = `stu-e2e-${kind}`;
    await p.evaluate((kind, sid, rec) => {
      localStorage.clear();
      if (kind === 'live') {
        localStorage.setItem('auth_token', 'e2e-fake-token');
        localStorage.setItem('araharu_current_user', JSON.stringify({ id: sid, role: 'student', name: '테스트학생', grade: 3, semester: 2 }));
      }
      localStorage.setItem('araharu_local_data_owner', sid);
      localStorage.setItem('araharu_learning_records', rec);
      localStorage.setItem('araharu_e2e_probe', 'keep');
    }, kind, sid, REC(sid));
    await p.goto(BASE + '/', { waitUntil: 'load', timeout: 120000 });
    await sleep(1200);
    if (!(await p.$('[data-adopt]'))) { fail(`[${kind}] 우리 반 학생 기기인데 «기록 이어서 하기» 카드가 없다`); continue; }
    if (await p.$('[data-testid="guest-start"]')) fail(`[${kind}] 우리 반 학생 기기에 새로 시작 단추가 보인다`);
    if (kind === 'expired') { await clickText(/^4$/); await clickText(/^1학기$/); }
    const label = await p.$eval('[data-testid="adopt-continue"]', (e) => e.textContent.trim()).catch(() => '');
    const want = kind === 'live' ? '3학년 2학기' : '4학년 1학기';
    if (!label.includes(want)) fail(`[${kind}] 이어하기 단추 학년·학기 이상: «${label}»`);
    await p.click('[data-testid="adopt-continue"]');
    await p.waitForFunction(() => location.pathname.startsWith('/student'), { timeout: 30000 }).catch(() => fail(`[${kind}] 이어하기 후 /student 로 가지 않았다`));
    await sleep(1500);
    const st = await p.evaluate(() => ({
      who: JSON.parse(localStorage.getItem('araharu_current_user') || 'null'),
      token: localStorage.getItem('auth_token'),
      adopted: localStorage.getItem('araharu_adopted_id'),
      recs: JSON.parse(localStorage.getItem('araharu_learning_records') || '[]').length,
      probe: localStorage.getItem('araharu_e2e_probe'),
    }));
    if (st.who?.id !== sid || st.adopted !== sid) fail(`[${kind}] 이어받은 학생 id 가 바뀌었다: ${JSON.stringify(st.who)?.slice(0, 100)}`);
    if (st.token) fail(`[${kind}] 이어받은 뒤에도 로그인 토큰이 남았다`);
    if (st.who?.name === '테스트학생') fail(`[${kind}] 실명이 그대로 남았다(별명으로 바꿔야 한다)`);
    if (st.recs < 1 || st.probe !== 'keep') fail(`[${kind}] 이어받다가 기기 기록이 지워졌다(기록 ${st.recs})`);
    await p.goto(BASE + '/', { waitUntil: 'load', timeout: 120000 });
    await sleep(800);
    if (await p.$('[data-adopt]')) fail(`[${kind}] 이어받은 뒤에도 또 이어받기 카드가 나온다`);
  }
  await p.evaluate(() => localStorage.clear());

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
    for (const h of await probeFractions(p)) fail(`빗금 분수(탐침) ${h.where}: «${h.text}»`);
    fracSeen += await p.evaluate(() => document.querySelectorAll('main .frac, body .frac').length);
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
      if (ta) { Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(ta, '나는 오늘 학교에서 친구와 함께 도서관에 가서 재미있는 책을 읽었다. 책 속 주인공처럼 용감해지고 싶다고 생각했다. 내일도 책을 읽을 것이다. 그리고 친구들에게도 그 책을 소개해 주고 함께 이야기를 나누고 싶다.'); ta.dispatchEvent(new Event('input', { bubbles: true })); return 'textarea'; }
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
  console.log(`  · 쌓은 분수 요소(누계) ${fracSeen}`);
  if (GRADE >= 3 && fracSeen === 0 && !process.env.E2E_NO_FRAC) fail('쌓은 분수(.frac)를 한 번도 못 봤다 — 분수 문제가 안 나왔거나 렌더러를 안 거친다(다른 학년/학기로 다시)');

  await p.goto(BASE + '/student/settings/', { waitUntil: 'load', timeout: 120000 });
  await sleep(1500);
  const st = await p.evaluate(() => document.body.innerText);
  if (!/기록 옮기기/.test(st)) fail('설정 화면에 기록 옮기기가 없다');
  await overflow('설정'); await shot('06-settings');

  // 기록 불러오기: 지금 기록을 파일로 만들고 학년만 바꿔 넣은 뒤 올린다 → 다시 읽혀 바뀐 학년이 보이고 기록 키가 그대로여야 한다
  const snap = await p.evaluate(() => { const d = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith('araharu_')) d[k] = localStorage.getItem(k); } return d; });
  const cu = JSON.parse(snap.araharu_current_user || '{}');
  const NG = GRADE === 6 ? 5 : GRADE + 1;
  snap.araharu_current_user = JSON.stringify({ ...cu, grade: NG, name: '홍길동', email: 'kid@example.com', school_name: '테스트초' });
  const bf = `${OUT}/backup-${vpName}.json`;
  writeFileSync(bf, JSON.stringify({ format: 'araharu-backup', version: 1, exportedAt: new Date().toISOString(), data: snap }));
  const inp = await p.$('[data-testid="backup-input"]');
  if (!inp) fail('불러오기 입력칸이 없다');
  else {
    await Promise.all([p.waitForNavigation({ waitUntil: 'load', timeout: 60000 }).catch(() => fail('불러온 뒤 다시 읽지 않았다')), inp.uploadFile(bf)]);
    await sleep(1500);
    const after = await p.evaluate(() => ({ u: JSON.parse(localStorage.getItem('araharu_current_user') || '{}'), n: Object.keys(localStorage).filter((k) => k.startsWith('araharu_')).length, t: [...document.querySelectorAll('button[aria-pressed="true"]')].map((x) => x.textContent.trim()).join(' ') }));
    if (after.u.name === '홍길동' || after.u.email || after.u.school_name) fail(`불러온 파일의 개인정보가 프로필에 들어왔다: ${JSON.stringify(after.u).slice(0, 120)}`);
    if (after.u.grade !== NG) fail(`불러온 뒤 학년이 ${after.u.grade} (기대 ${NG})`);
    if (after.n < Object.keys(snap).length) fail(`불러온 뒤 기록 키가 줄었다 ${after.n} < ${Object.keys(snap).length}`);
    if (!after.t.split(' ').includes(String(NG))) fail(`불러온 학년이 설정 화면에서 골라져 있지 않다: ${after.t}`);
  }

  for (const e of errs) fail(e);
  await ctx.close();
}
await b.close();
console.log(fails.length ? `❌ 실패 ${fails.length}건` : '✅ 게스트 e2e 통과');
process.exit(fails.length ? 1 : 0);
