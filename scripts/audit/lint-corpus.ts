/**
 * 전수검수 기계 게이트 — dump-corpus 가 뽑은 «학생이 실제로 받는 문항» 전부를 규칙으로 검사한다.
 *   npx tsx scripts/audit/lint-corpus.ts [--json out.json] [--show 5] [--rule R]
 * 규칙마다 «사례»를 남기고, 하나라도 있으면 exit 1.
 * 규칙은 «2026-10-12 전수 표본에서 실제로 나온 결함»에서 만들었다(각 규칙 옆 예시).
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { hasBatchim, isRieul, numberHasBatchim } from "../../src/lib/korean-josa";

const OUT = new URL("./out/", import.meta.url).pathname;
const argv = process.argv.slice(2);
const opt = (k: string, d?: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const SHOW = Number(opt("--show", "4"));
const ONLY_RULE = opt("--rule");

type Row = { key: string; g: number; s: number; subject: string; type: string; content: any; answer: any; hint: any; explanation: any; title: string };
const files = readdirSync(OUT).filter((f) => /^corpus(-g\d)?\.jsonl$/.test(f));
const rows: Row[] = [];
const seen = new Set<string>();
for (const f of files) for (const l of readFileSync(OUT + f, "utf8").split("\n")) {
  if (!l.trim()) continue;
  const r = JSON.parse(l) as Row;
  if (seen.has(r.key)) continue;
  seen.add(r.key);
  rows.push(r);
}

const hits = new Map<string, { n: number; ex: string[] }>();
function flag(rule: string, r: Row, why: string) {
  if (ONLY_RULE && !rule.startsWith(ONLY_RULE)) return;
  const h = hits.get(rule) ?? { n: 0, ex: [] };
  h.n++;
  if (h.ex.length < SHOW) h.ex.push(`[g${r.g}s${r.s} ${r.subject}/${r.type}/${r.content?.variant ?? ""}] ${why}`.replace(/\s+/g, " ").slice(0, 260));
  hits.set(rule, h);
}

const str = (x: unknown) => (typeof x === "string" ? x : "");
const choicesOf = (r: Row): string[] => (Array.isArray(r.content?.choices) && r.content.choices.length ? r.content.choices : Array.isArray(r.content?.options) ? r.content.options : []).map(String);
// 화면이 실제로 그리는 수식(MathQuestion 과 같게): reverse 는 «= 결과»를 붙여 보여 준다
const mathShown = (c: any) => {
  const e = str(c?.expression);
  if (c?.variant === "reverse" && c?.result != null) return e.replace(/\s*=\s*\?\s*$/, "").replace(/\?\s*$/, "").trimEnd() + (e.trim().endsWith("?") && !/=\s*\?\s*$/.test(e) ? " " : " = ") + c.result;
  return e;
};
const shown = (r: Row) => [r.content?.passage, r.content?.text, r.subject === "math" ? mathShown(r.content) : r.content?.expression, r.content?.sentence && r.subject !== "english" ? r.content.sentence : "", r.content?.wrongSentence, r.content?.prompt, r.subject === "english" ? r.content?.translation : ""].map(str).filter(Boolean).join("\n");
const allText = (r: Row) => [shown(r), ...choicesOf(r), str(r.hint), str(r.explanation), str(r.answer?.text)].join("\n");

// ── 조사 ───────────────────────────────────────────────────────────
// 따옴표로 감싼 낱말·한자 뒤 조사: '생명'라는 · 命는 · '검사할'으로
const QUOTED_JOSA = /(['"‘’“”])([^'"‘’“”\n]{1,20})\1\s?(이라는|라는|이라고|라고|이란|란|으로|로|은|는|이|가|을|를|과|와)(?![가-힣])/g;
const HANJA_JOSA = /([一-鿿])(은|는|이|가|을|를|과|와|으로|로)(?![가-힣])/g;
function josaOk(word: string, j: string): boolean {
  const w = word.replace(/[^가-힣0-9]+$/g, "");
  const last = w.slice(-1);
  if (!last) return true;
  const num = w.match(/\d+$/);
  const b = num ? numberHasBatchim(Number(num[0])) : hasBatchim(last);
  const rieul = /[가-힣]/.test(last) && isRieul(last);
  switch (j) {
    case "이라는": case "이라고": case "이란": return b;
    case "라는": case "라고": case "란": return !b;
    case "으로": return b && !rieul;
    case "로": return !b || rieul;
    case "은": case "이": case "을": case "과": return b;
    case "는": case "가": case "를": case "와": return !b;
  }
  return true;
}

// ── 구조 지시어 ────────────────────────────────────────────────────
const CUE_NEEDS_IMAGE = /(그림|사진|그래프|지도|도표|표)를?\s*(을\s*)?보고|다음\s*(그림|사진|그래프|지도|도표)|아래\s*(그림|사진|그래프|표)/;
const CUE_PASSAGE = /(다음|아래|위)\s*(글|지문|이야기|시|대화)/;
const CUE_BLANK = /빈칸|___|\(\s*\)|□/;

for (const r of rows) {
  const c = r.content ?? {};
  const text = str(c.text);
  const ch = choicesOf(r);
  const ans = str(r.answer?.correct ?? r.answer?.text);
  const disp = shown(r);

  // R01 정답이 보기에 없다 / 보기 중복 / 보기 부족
  if (ch.length && r.type === "multiple_choice") {
    if (ans && !ch.includes(ans)) flag("R01 정답이 보기에 없음", r, `${disp} | 보기 ${ch.join(" / ")} | 정답 ${ans}`);
    if (new Set(ch.map((x) => x.trim())).size !== ch.length) flag("R02 보기 중복", r, `${disp} | ${ch.join(" / ")}`);
    // 둘 중 하나가 문제 자체인 꼴(맞춤법 A/B · 배수 예/아니오)은 2개가 맞다
    const binary = ch.length === 2 && (r.subject === "spelling" || ch.slice().sort().join("/") === "아니오/예");
    if (ch.length < 3 && !binary) flag("R03 보기 3개 미만", r, `${disp} | ${ch.join(" / ")}`);
    if (ch.some((x) => !x.trim())) flag("R04 빈 보기", r, `${disp} | ${ch.join(" / ")}`);
  }
  if (r.type !== "writing_prompt" && !ans) flag("R05 정답 없음", r, disp);

  // R10 조사(따옴표·한자·숫자)
  for (const m of allText(r).matchAll(QUOTED_JOSA)) if (!m[2].includes("___") && !josaOk(m[2], m[3])) flag("R10 조사 오류(따옴표 낱말)", r, `«${m[0]}» ← ${disp.slice(0, 80)}`);
  if (r.subject === "hanja") for (const m of allText(r).matchAll(HANJA_JOSA)) {
    const reading = str(c.reading);
    if (reading && !josaOk(reading, m[2])) flag("R11 조사 오류(한자 뒤 — 음 기준)", r, `«${m[0]}» (음 ${reading}) ← ${str(r.explanation).slice(0, 80)}`);
  }
  for (const m of allText(r).matchAll(/(?<![\d/])(\d+)\s?(은|는|이|가|을|를|과|와)(?=[\s?.!,]|$)/g)) {
    if (!josaOk(m[1], m[2])) flag("R12 조사 오류(숫자)", r, `«${m[0]}» ← ${disp.slice(0, 80)}`);
  }

  // R20 빈칸 지시인데 빈칸이 없다 / 빈칸 문항이 아닌데 ___ 가 남았다
  if (/빈칸/.test(text) && !CUE_BLANK.test(disp.replace(/빈칸/g, "")) && !(r.subject === "math" && /\?/.test(disp))) flag("R20 «빈칸» 지시인데 빈칸 없음", r, disp);
  if ((CUE_NEEDS_IMAGE.test(text.slice(0, 20)) && !/것을\s*___/.test(text)) || /다음\s*(그림|사진|그래프|지도|도표)/.test(text)) flag("R21 그림·표를 보라는데 그림·표가 없음", r, disp);
  if (CUE_PASSAGE.test(text) && !str(c.passage) && !/\n/.test(text)) flag("R22 «다음 글»인데 글이 없음", r, disp);
  if (/밑줄\s*친/.test(disp) && !(r.subject === "english" && c.targetKo && str(c.translation).includes(c.targetKo))) flag("R23 «밑줄 친»인데 밑줄 대상 없음", r, disp);
  if (/(굵게|진하게)\s*(표시한|쓴|나타낸)|색칠한\s*(부분|칸|곳|낱말)|굵은\s*글씨로\s*(쓴|된|표시한)/.test(disp)) flag("R24 굵게/색칠 표시 지시(표시 수단 없음)", r, disp);

  // R30 O/X 문항이 문장을 망가뜨림 — 해설(정답문)·문제문이 «바꿔 끼운 흔적»
  if (r.type === "true_false") {
    const e = str(r.explanation);
    if (/[가-힣]\s수하다|되하다|하하다|를를|은은|는는/.test(text + e)) flag("R30 O/X 비문(어미 붙임 깨짐)", r, `문 ${text} | 해설 ${e}`);
    if (str(r.answer?.correct) === "X" && e && text === e) flag("R31 X 문항인데 해설이 문제문 그대로", r, text);
  }

  // R40 지시문-문제 어긋남(수학): «계산하세요»인데 문장형 질문
  if (r.subject === "math") {
    const ex = mathShown(c);
    if (/계산하세요/.test(text) && /[가-힣]{2,}.*\?$/.test(ex) && !/^[\d\s+\-×÷*/().=?□<>,%]+/.test(ex)) flag("R40 «계산하세요» 밑에 문장형 문제", r, ex);
    const h = str(r.hint);
    if (/받아올림/.test(h) && /^\s*(\d)\s*\+\s*(\d)\s*=/.test(ex)) {
      const m = ex.match(/^\s*(\d)\s*\+\s*(\d)/)!;
      if (Number(m[1]) + Number(m[2]) < 10) flag("R41 받아올림 없는 덧셈에 «받아올림 주의» 힌트", r, `${ex} | ${h}`);
    }
    if (/(\d+)명 중 \1명/.test(ex)) flag("R42 자명한 문항(N 중 N)", r, ex);
    // R43 비현실 수치: 과일·채소 무게
    for (const m of ex.matchAll(/(수박|참외|사과|배|귤|딸기|포도|감|복숭아|토마토|오이|당근|호박)\s?(\d+)\s?kg/g)) {
      const w = Number(m[2]);
      const max: Record<string, number> = { 수박: 12, 호박: 15 };
      if (w > (max[m[1]] ?? 3)) flag("R43 비현실 수치(과일·채소 무게)", r, ex);
    }
    // R44 정답 해설 숫자와 정답 불일치(마지막 = 뒤 숫자)
    const steps: string[] = Array.isArray(r.answer?.steps) ? r.answer.steps : [];
    const last = steps.length ? steps[steps.length - 1] : "";
    const mm = last.match(/=\s*(-?\d+(?:\.\d+)?)\s*[^\d/]*$/);
    if (c.variant !== "reverse" && !/×/.test(last) && mm && ans && /^-?\d+(\.\d+)?$/.test(ans) && Number(mm[1]) !== Number(ans) && !/나머지|몫/.test(last)) flag("R44 풀이 끝 값 ≠ 정답", r, `${ex} | ${last} | 정답 ${ans}`);
  }

  // R50 힌트 이상: 같은 낱말 반복(«국어 국어») · 정답 노출
  const hint = str(r.hint);
  if (/(^|\s)([가-힣]{2,})\s\2(\s|$)/.test(hint)) flag("R50 힌트 낱말 반복", r, hint);
  if (ans && ans.length >= 2 && r.type === "multiple_choice" && hint.includes(ans) && !/첫 글자/.test(hint) && r.subject !== "english" && r.subject !== "math") flag("R51 힌트가 정답을 그대로 노출", r, `${hint} | 정답 ${ans}`);

  // R52 낱말 뜻(단서)에 정답이 그대로 있음(«택시라고도 해요» → 택시)
  if (r.subject === "vocabulary" && c.variant !== "reverse" && Array.isArray(c.clues) && ans) { // reverse 는 화면에 낱말만 보이고 뜻은 보기다
    const esc = ans.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|[\\s'"(])${esc}(?=[\\s.,!?)'"]|이|가|은|는|을|를|과|와|도|로|으로|에|의|라고|이라고|예요|이에요|$)`);
    const leak = (c.clues as string[]).find((x) => re.test(String(x)) && !/반대말|비슷한 말/.test(String(x)));
    if (leak) flag("R52 낱말 뜻에 정답 노출", r, `${leak} | 정답 ${ans}`);
  }

  // R60 맞춤법: «문장에서 틀린 부분» 인데 보기가 문장에 없다
  if (r.subject === "spelling" && /틀린 부분|틀린 낱말/.test(text) && str(c.wrongSentence)) {
    const ws = str(c.wrongSentence);
    const notIn = ch.filter((o) => !ws.includes(o));
    if (notIn.length) flag("R60 맞춤법 «틀린 부분 찾기» 보기가 문장에 없음", r, `${ws} | 보기 ${ch.join(" / ")}`);
    if (ws.replace(/[^가-힣]/g, "").length < 4) flag("R61 맞춤법 문장이 너무 짧음", r, ws);
  }

  // R70 영어: 비문 패턴
  if (r.subject === "english") {
    const s = str(c.sentence);
    if (/\bLet's\s+(\w+ed|chose|went|ate|saw|took|made|ran|got|came|did|was|were)\b/i.test(s)) flag("R70 영어 비문(Let's + 과거형)", r, s);
    if (/[가-힣]+았자|었자/.test(str(c.translation))) flag("R71 한국어 뜻 비문(-았자)", r, str(c.translation));
    if (/\b(a)\s+[aeiou]/i.test(s) && !/\ba\s+(one|uni|use|eu)/i.test(s)) flag("R72 영어 관사 a+모음", r, s);
  }

  // R82 정답·보기에 «A(B)» 겹정답(정오(남중)·유엔(UN)) — 빈칸에 넣으면 문장이 깨지고 정답이 둘이 된다
  for (const t of [str(r.answer?.text), ...choicesOf(r)]) if (/^[가-힣 ]+\([가-힣A-Za-z ]+\)$/.test(t.trim()) && r.subject !== "hanja" && str(c.text).includes("___")) { flag("R82 정답·보기 겹정답 A(B)", r, t); break; }
  // R83 독해 두루뭉술 물음 — 원래 물음의 보기·정답을 그대로 달고 있던 변형(2026-10-12 620건). 남아 있으면 안 된다
  if (r.subject === "korean" && /^(이 글에서 알 수 있는 것은\?|이 글에 대한 설명으로 맞는 것은\?|이 글의 내용으로 맞는 것은\?)$/.test(str(c.question).trim())) flag("R83 독해 두루뭉술 물음", r, str(c.question));
  // R84 한자 예문 속 읽기 없는 한자(火가 나면 · 學校에서) — 아이가 못 읽는다. «불(火)» 또는 «學校(학교)» 꼴이어야
  if (r.subject === "hanja") { const hs = str(c.sentence); if (/(?<![(一-鿿])[一-鿿]+(?![(一-鿿)])/.test(hs.replace(/\([^)]*\)/g, (m) => m.replace(/[一-鿿]/g, "")))) flag("R84 한자 예문 읽기 없음", r, hs); }
  // R80 공통 쓰레기
  if (/undefined|NaN|\[object Object\]|\{\w+\}/.test(allText(r))) flag("R80 치환 안 된 자리표시", r, disp);
  if (/\s{2,}\S/.test(disp.replace(/\n/g, " ").replace(/\s{2,}(?=\S)/g, (m) => (m.includes("  ") ? m : m)))) { /* 공백 2칸은 렌더에서 접힌다 — 생략 */ }
  if (/([가-힣])\1{3,}/.test(disp)) flag("R81 같은 글자 4번+ 반복", r, disp);
}

const sorted = [...hits.entries()].sort((a, b) => a[0].localeCompare(b[0]));
let total = 0;
for (const [rule, h] of sorted) {
  total += h.n;
  console.log(`\n${rule} — ${h.n}건`);
  for (const e of h.ex) console.log("   · " + e);
}
console.log(`\n검사 문항 ${rows.length} · 결함 ${total}건 · 규칙 ${sorted.length}종`);
const jo = opt("--json");
if (jo) writeFileSync(jo, JSON.stringify(Object.fromEntries(sorted.map(([k, v]) => [k, v.n])), null, 1));
process.exit(total ? 1 : 0);
