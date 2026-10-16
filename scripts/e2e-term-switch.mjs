#!/usr/bin/env node
// 학기 바꾸기 회귀(2026-10-16 «5학년 2학기로 들어갔는데 학습은 1학기»): 5-1 로 오늘의 학습을 연 뒤 5-2 로 바꾸면
// 학습 화면이 연 세트는 5-2 여야 한다. 오늘의 세트를 학생+순번으로만 저장해 옛 학기 세트를 다시 열던 결함.
//   node scripts/e2e-term-switch.mjs [URL=https://araharu-ecp.pages.dev]   (손님 모드 — 서버에 안 남는다)
const puppeteer = (await import('/Users/sim-insu/Documents/dev/iwpuzzle/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js')).default;
const BASE = (process.argv[2] || 'https://araharu-ecp.pages.dev').replace(/\/$/, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', pipe: true, headless: 'new' });
const p = await (await b.createBrowserContext()).newPage();
await p.setViewport({ width: 1280, height: 900 });
const click = (re) => p.evaluate((s) => { const r = new RegExp(s); const el = [...document.querySelectorAll('button, a')].find((e) => r.test(e.textContent.trim())); if (el) { el.click(); return true; } return false; }, re.source);
async function start(g, s) {
  await p.goto(BASE + '/', { waitUntil: 'load' }); await sleep(2000);
  await click(new RegExp(`^${g}$`)); await click(new RegExp(`^${s}학기$`)); await sleep(300);
  await p.click('[data-testid=guest-start]'); await sleep(2500);
}
async function daily(tag) {
  await p.goto(BASE + '/student/daily/', { waitUntil: 'load' }); await sleep(2500);
  await click(/시작|이어서|학습하기/); await sleep(3000);
  const t = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
  const set = await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('araharu_daily_sets') || '[]'); const id = location.pathname.split('/').filter(Boolean).pop(); const o = s.find((x) => x.id === id); return o ? `${o.grade}-${o.semester}` : '없음'; });

  return set;
}
await start(5, 1); const a = await daily('A');
await start(5, 2); const c = await daily('B');
await b.close();
console.log(`5-1 로 연 세트 ${a} → 5-2 로 바꾼 뒤 연 세트 ${c}`);
if (a !== '5-1' || c !== '5-2') { console.log('❌ 학기를 바꿨는데 학습 세트가 따라오지 않는다'); process.exit(1); }
console.log('✅ 학기 바꾸기 통과');
