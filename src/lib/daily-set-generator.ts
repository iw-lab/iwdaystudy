// 시그니처는 커리큘럼 데이터에 의존하지 않는 별도 모듈에 있다.
// (local-storage 등이 이 무거운 파일을 통째로 끌어오지 않도록 분리)
import {
  canUnderline,
  getMeaningText,
  meaningPrompt,
} from "./english-underline";
import {
  getQuestionSignature,
  NON_REPEATABLE_QUESTION_TYPES,
} from "./question-signature";

import { getDayOfYear, getGradeGroup } from "@/lib/utils";
import { lookupStandardCode } from "@/lib/curriculum/standard-mapping";
import { applyContentReview, presetDistractors } from "@/lib/content-review";
import { naturalizeKorean, fixExistingJosa, hasBatchim, withJosa, fitBlankJosa } from "@/lib/korean-josa";
import {
  GRADE_SET_COMPOSITION,
  DEFAULT_READINESS_ITEMS,
  EMOTION_CATEGORIES,
} from "@/lib/constants";
import type {
  DailySet,
  Question,
  SubjectType,
  QuestionType,
} from "@/types/database";
import type { DailySetWithQuestions } from "@/types/learning";
import type {
  SpellingEntry,
  VocabEntry,
  KnowledgeEntry,
  ReadingEntry,
  SafetyEntry,
  MathEntry,
  HanjaEntry,
  EnglishEntry,
} from "@/types/curriculum";
import {
  grade1ReadingData,
  grade2ReadingData,
  grade3ReadingData,
  grade4ReadingData,
  grade5ReadingData,
  grade6ReadingData,
} from "@/lib/curriculum/korean-reading-data";
import { generateMathPool } from "@/lib/curriculum/generators/math-generator";
import {
  getAvailableMathUnits,
  getAvailableScienceUnits,
  getAvailableEnglishUnits,
  getAvailableSocialUnits,
} from "@/lib/curriculum/curriculum-sequence";
import { generateSpellingPool } from "@/lib/curriculum/generators/spelling-generator";
import {
  generateVocabPool,
  getSynonymPairs,
  getAntonymPairs,
  getIdiomEntries,
  getMultiMeaningWords,
  getWordPuzzles,
} from "@/lib/curriculum/generators/vocab-generator";
import type {
  SynonymPair,
  AntonymPair,
  IdiomEntry as VocabIdiomEntry,
  MultiMeaningWord,
  WordPuzzleEntry,
} from "@/lib/curriculum/generators/vocab-generator";
import { generateKnowledgePool } from "@/lib/curriculum/generators/knowledge-generator";
import { generateSafetyPool } from "@/lib/curriculum/generators/safety-generator";
import { generateHanjaPool } from "@/lib/curriculum/generators/hanja-generator";
import { generateEnglishPool } from "@/lib/curriculum/generators/english-generator";
import {
  generateWritingPool,
  generateCreativePool,
} from "@/lib/curriculum/generators/writing-creative-generator";
import {
  generateSciencePool,
  generateSocialPool,
} from "@/lib/curriculum/generators/science-social-generator";
import { generateReadingPool } from "@/lib/curriculum/generators/reading-generator";

import {
  grade1SpellingData,
  grade1VocabData,
  grade1MathData,
  grade1KnowledgeData,
  grade1SafetyData,
  grade1WritingPrompts,
  grade1KoreanData,
  grade1CreativeData,
} from "@/lib/curriculum/grade1";

import {
  grade2SpellingData,
  grade2VocabData,
  grade2MathData,
  grade2KnowledgeData,
  grade2SafetyData,
  grade2WritingPrompts,
  grade2KoreanData,
  grade2CreativeData,
} from "@/lib/curriculum/grade2";

import {
  grade3SpellingData,
  grade3VocabData,
  grade3MathData,
  grade3KnowledgeData,
  grade3SafetyData,
  grade3WritingPrompts,
  grade3EnglishData,
  grade3CreativeData,
} from "@/lib/curriculum/grade3";
import {
  grade3KnowledgeDataExtra,
  grade3SafetyDataExtra,
} from "@/lib/curriculum/grade3_suffix";

import {
  grade4SpellingData,
  grade4VocabData,
  grade4MathData,
  grade4KnowledgeData,
  grade4SafetyData,
  grade4WritingPrompts,
  grade4EnglishData,
  grade4CreativeData,
} from "@/lib/curriculum/grade4";

import {
  grade5SpellingData,
  grade5VocabData,
  grade5MathData,
  grade5KnowledgeData,
  grade5SafetyData,
  grade5WritingPrompts,
  grade5EnglishData,
  grade5CreativeData,
  grade5ScienceData,
  grade5SocialData,
} from "@/lib/curriculum/grade5";

import {
  grade6SpellingData,
  grade6VocabData,
  grade6MathData,
  grade6KnowledgeData,
  grade6SafetyData,
  grade6WritingPrompts,
  grade6EnglishData,
  grade6CreativeData,
  grade6ScienceData,
  grade6SocialData,
} from "@/lib/curriculum/grade6";


// Seeded PRNG for reproducible daily sets (same seed = same set per day)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ── 큐레이션 distractor 뱅크 (고빈도 타입) ──────────────────────
// 정답이 어느 뱅크의 원소이면, 같은 뱅크에서 그럴듯한 오답을 채운다.
// (category 필터로 대부분 해결되나, "가장 큰 나라=러시아" 같은 케이스 보강)
const DISTRACTOR_BANKS: string[][] = [
  // 나라
  ["러시아", "캐나다", "미국", "중국", "브라질", "인도", "호주", "독일",
   "프랑스", "일본", "영국", "이집트", "멕시코", "이탈리아", "스페인", "튀르키예"],
  // 대륙
  ["아시아", "유럽", "아프리카", "아메리카", "오세아니아",
   "북아메리카", "남아메리카"],
  // 우리나라 주요 도시·지명
  ["서울", "부산", "대구", "인천", "광주", "대전", "울산", "제주",
   "경주", "수원", "춘천", "전주"],
  // 행성
  ["수성", "금성", "지구", "화성", "목성", "토성", "천왕성", "해왕성"],
  // 방위
  ["동쪽", "서쪽", "남쪽", "북쪽", "동", "서", "남", "북"],
  // 계절
  ["봄", "여름", "가을", "겨울"],
  // 바다
  ["동해", "서해", "남해", "황해", "태평양", "대서양", "인도양"],
  // 측정 단위(길이·무게·부피 — "무엇을 재는 단위?"에 교차차원 오답)
  ["미터", "센티미터", "킬로미터", "밀리미터", "그램", "킬로그램", "리터", "밀리리터"],
  // 평면도형
  ["삼각형", "사각형", "오각형", "육각형", "직사각형", "정사각형",
   "마름모", "사다리꼴", "평행사변형"],
  // 입체도형
  ["직육면체", "정육면체", "원기둥", "원뿔", "각기둥", "각뿔"],
  // 한국사 나라·시대
  ["고조선", "고구려", "백제", "신라", "가야", "발해", "고려", "조선"],
  // 강
  ["한강", "낙동강", "금강", "영산강", "섬진강", "대동강", "압록강", "두만강"],
  // 산
  ["백두산", "한라산", "지리산", "설악산", "금강산", "북한산", "태백산"],
  // 품사
  ["명사", "동사", "형용사", "부사", "관형사", "대명사", "감탄사", "수사"],
];
function bankFor(answer: string): string[] | null {
  for (const b of DISTRACTOR_BANKS) if (b.includes(answer)) return b;
  return null;
}
function isNumericAnswer(s: string): boolean {
  return s.trim() !== "" && !isNaN(Number(s.replace(/,/g, "")));
}
// 정답과 형식(숫자/한글단어)·길이가 비슷한 오답인가
function sameFormat(correct: string, cand: string): boolean {
  if (isNumericAnswer(correct) !== isNumericAnswer(cand)) return false;
  // 숫자는 자릿수(정수부 길이)가 비슷해야 "딱 봐도 답"을 막음
  if (isNumericAnswer(correct)) {
    const di = (s: string) => s.replace(/[,.\-]/g, "").length;
    return Math.abs(di(correct) - di(cand)) <= 1;
  }
  const tol = Math.max(2, Math.ceil(correct.length * 0.5));
  return Math.abs(correct.length - cand.length) <= tol;
}
// 비교용 정규화(공백·문장부호 제거) — "정답" vs "정답." 같은 사실상 중복 방지
function normForDup(s: string): string {
  return s.replace(/[\s.,!?·]/g, "");
}
// 정답과 길이가 가까운 순으로 정렬(동일 거리 내 셔플 유지). 정답만 길이가
// 튀어 한눈에 보이는 것을 막아 추측 난이도를 높인다. (V8 sort는 stable)
function rankByCloseLength(
  cands: string[],
  correctLen: number,
  random: () => number,
): string[] {
  const arr = [...cands];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  arr.sort(
    (a, b) =>
      Math.abs(a.length - correctLen) - Math.abs(b.length - correctLen),
  );
  return arr;
}
// 스케일·포맷(콤마·소수) 인지 숫자 오답. 큰 수는 자리수에 맞춘 오프셋을,
// 소수는 소수 단위 오프셋을 쓰고, 콤마/소수자리 포맷을 정답과 동일하게 맞춘다.
function numericOffsets(n: number, decimals: number): number[] {
  if (decimals > 0) {
    const u = Math.pow(10, -decimals);
    return [u, 2 * u, 3 * u, 5 * u, 10 * u];
  }
  const abs = Math.abs(n);
  if (abs < 20) return [1, 2, 3, 4, 5];
  if (abs < 100) return [1, 2, 3, 5, 10];
  const digits = Math.floor(Math.log10(abs)) + 1;
  const u = Math.pow(10, digits - 2); // 50000(5자리)→1000
  return [u, 2 * u, 3 * u, 5 * u, 10 * u];
}
function formatNum(n: number, hadComma: boolean, decimals: number): string {
  const fixed = decimals > 0 ? n.toFixed(decimals) : String(n);
  if (!hadComma) return fixed;
  const [int, dec] = fixed.split(".");
  const withComma = Number(int).toLocaleString("en-US");
  return dec ? `${withComma}.${dec}` : withComma;
}

/**
 * 4지선다 보기 생성. 오답(distractor)을 같은 category·형식에서 우선 추출해
 * 정답만 빈칸에 맞는 "터무니없는 보기" 문제를 방지한다.
 */
function generateChoices<T>(
  correct: string,
  pool: T[],
  extractAnswer: (item: T) => string,
  random: () => number,
  category?: string,
  extractCategory?: (item: T) => string,
  entry?: unknown,
): string[] {
  const correctStr = String(correct);
  const distractors: string[] = [];
  const used = new Set<string>([correctStr]);
  const normCorrect = normForDup(correctStr);
  const isBad = (a: string): boolean =>
    !a ||
    used.has(a) ||
    a === correctStr ||
    (correctStr.length >= 2 && a.includes(correctStr)) ||
    (a.length >= 2 && correctStr.includes(a)) ||
    (normCorrect !== "" && normForDup(a) === normCorrect); // 사실상 중복
  // 길이 근접 순으로 추가(정답만 길이가 튀어 보이는 것을 방지)
  const tryAdd = (cands: string[]): void => {
    const arr = rankByCloseLength(
      [...new Set(cands)].filter((a) => !isBad(a)),
      correctStr.length,
      random,
    );
    for (const a of arr) {
      if (distractors.length >= 3) break;
      if (isBad(a)) continue;
      distractors.push(a);
      used.add(a);
    }
  };

  const numeric = isNumericAnswer(correctStr);

  // 00) 전수검수가 이 항목에 붙인 오답 보기(같은 종류·그럴듯함·정답 아님을 사람이 보듯 고른 것)
  const preset = presetDistractors(entry, correctStr);
  if (preset) tryAdd(preset);

  // 0) 큐레이션 뱅크 (나라·행성·도시 등)
  const bank = bankFor(correctStr);
  if (bank) tryAdd(bank);

  // 1) 같은 category + 형식 일치
  let same: string[] = [];
  if (distractors.length < 3 && category && extractCategory) {
    same = pool
      .filter((it) => extractCategory(it) === category)
      .map(extractAnswer);
    tryAdd(same.filter((a) => sameFormat(correctStr, a)));
  }

  // 2) 전체 풀에서 형식 일치
  if (distractors.length < 3) {
    tryAdd(pool.map(extractAnswer).filter((a) => sameFormat(correctStr, a)));
  }

  // 3) 숫자 정답이면 형식 무관 fallback 전에 근접 숫자 생성(단어 오답 혼입 방지)
  if (distractors.length < 3 && numeric) {
    const raw = correctStr.replace(/,/g, "");
    const n = Number(raw);
    const hadComma = correctStr.includes(",");
    const dot = raw.indexOf(".");
    const decimals = dot >= 0 ? raw.length - dot - 1 : 0;
    // 자연수(정답 2 이상)면 0·음수 오답을 피해 소거법을 막음
    const floor = decimals === 0 && n >= 2 ? 1 : 0;
    for (const d of numericOffsets(n, decimals)) {
      for (const s of [1, -1]) {
        const v = Number((n + d * s).toFixed(decimals));
        if (v < floor) continue;
        const c = formatNum(v, hadComma, decimals);
        if (!used.has(c) && c !== correctStr) {
          distractors.push(c);
          used.add(c);
        }
        if (distractors.length >= 3) break;
      }
      if (distractors.length >= 3) break;
    }
  }

  // 4) 비숫자: 형식 무관 fallback (같은 category 원형 → 전체 풀 원형)
  if (distractors.length < 3 && !numeric && same.length) tryAdd(same);
  if (distractors.length < 3 && !numeric) tryAdd(pool.map(extractAnswer));

  // 5) 정말 부족하면 패딩(거의 발생 안 함)
  let pad = 1;
  while (distractors.length < 3) {
    const c = `보기 ${pad++}`;
    if (!used.has(c)) {
      distractors.push(c);
      used.add(c);
    }
  }

  const choices = [correctStr, ...distractors.slice(0, 3)];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}

function shuffleChoices<T>(choices: T[], random: () => number): T[] {
  const next = [...choices];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function shuffleArrayInPlace<T>(arr: T[], random: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ── 조사 후처리 choke point ──────────────────────────────────────
// 제너레이터가 만든 문항의 모든 문자열(중첩 배열·객체 포함)에 조사 플레이스홀더
// 치환(naturalizeKorean)과 기존 오류 조사 교정(fixExistingJosa)을 한 번씩 통과시킨다.
// generateDailySet의 questions 조립이 끝나는 단일 choke point에서만 호출한다.
function polishKoreanText(s: string): string {
  return fixExistingJosa(naturalizeKorean(s));
}

function deepPolishKorean<T>(value: T): T {
  if (typeof value === "string") {
    return polishKoreanText(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => deepPolishKorean(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = deepPolishKorean(v);
    }
    return out as T;
  }
  return value;
}

function polishQuestionsKorean(qs: Question[]): Question[] {
  return qs.map((q) => ({
    ...q,
    title: q.title != null ? polishKoreanText(q.title) : q.title,
    content: deepPolishKorean(q.content),
    answer: deepPolishKorean(q.answer),
    explanation:
      q.explanation != null ? polishKoreanText(q.explanation) : q.explanation,
    hint: q.hint != null ? polishKoreanText(q.hint) : q.hint,
  }));
}

// ── 초등 교육과정 초과(중등 개념) 문항 필터 ──────────────────────
// 뉴턴·관성·원소기호·화학식·pH·원자핵·유전자·옴의법칙 등은 중학 과정.
// 분명한 마커만 골라 제거(고기압·볼트(나사) 등 초등 어휘 오제거 방지).
const ABOVE_GRADE_PHRASES = [
  "힘의 단위", "힘의 크기를 나타내는 단위", "뉴턴의 법칙", "만유인력",
  "작용과 반작용", "작용반작용", "관성", "가속도", "원소 기호", "원소기호",
  "화학식", "주기율표", "멘델레예프", "멘델", "전기분해", "중화 반응", "중화반응",
  "질량 보존", "질량은", "촉매", "과산화수소", "이산화망간", "이산화 망가니즈",
  "pH", "양성자", "중성자", "원자핵", "아원자", "원자의 중심", "원자보다",
  "유전자", "유전 물질", "세포 분열", "세포분열", "DNA", "미토콘드리아",
  "역학적 에너지", "역학적에너지", "옴의 법칙", "전압의 단위", "전류의 단위",
  "저항의 단위", "허파꽈리", "도플러", "BTB", "이산화황", "자기장",
];
const ABOVE_GRADE_ANSWERS = new Set([
  "뉴턴", "뉴턴(N)", "H₂O", "CO₂", "NaCl", "원자핵", "양성자", "중성자",
  "아원자", "유전자", "미토콘드리아", "멘델레예프", "이산화황", "역학적",
]);
function blobIsAboveGrade(blob: string): boolean {
  if (!blob) return false;
  if (ABOVE_GRADE_PHRASES.some((p) => blob.includes(p))) return true;
  for (const a of ABOVE_GRADE_ANSWERS) {
    if (blob.includes(a)) return true;
  }
  return false;
}

function isAboveGrade(text: string, answer: string): boolean {
  return blobIsAboveGrade(`${text || ""} ${(answer || "").trim()}`);
}

/**
 * above-grade(중등 개념) 필터. 필터 후 결과가 비면(폴백) 원본 풀을 그대로 반환해
 * "필터로 문항이 부족해짐" 문제를 방지한다(filterMathByProgress와 동일한 관례).
 */
function filterAboveGrade<T>(items: T[], blobOf: (item: T) => string): T[] {
  if (!items || items.length === 0) return items;
  const filtered = items.filter((item) => !blobIsAboveGrade(blobOf(item)));
  return filtered.length > 0 ? filtered : items;
}

// OX(true_false) false문용 오답: 정답과 길이·형식이 가장 비슷한 보기를 우선 선택해
// "농촌에는 넓은 낮이 있다" 같은 비문을 줄인다. (choices는 이미 category 일치)
/**
 * O/X 문항에서 '거짓 문장'을 만들 때 빈칸에 넣을 오답을 고른다.
 *
 * 문장 템플릿은 정답 낱말에 맞춰 조사·어미가 이미 박혀 있다("___로 나뉜다",
 * "___이다"). 아무 낱말이나 넣으면 "물이 도다", "회복개이다", "다칠을" 같은
 * 비문이 학생 화면에 그대로 나간다. 그래서 (1) 받침 유무가 같고 (2) 길이가
 * 비슷한 후보만 쓴다. 조건을 만족하는 후보가 없으면 null 을 돌려주고,
 * 호출부는 '참인 문장'으로 출제한다 — 비문을 내보내는 것보다 낫다.
 */
// O/X 로 낼 수 있는 빈칸인가 — 빈칸이 낱말 중간에 붙어 있으면(«___한 수», «___하다»)
// 오답을 끼운 거짓 문장이 «같한»·«먼저 대피하다» 같은 없는 말이 된다(2026-10-12 전수검수).
// 앞은 문장 시작·띄어쓰기·여는 따옴표, 뒤는 띄어쓰기·문장부호·조사일 때만 O/X 를 허용한다.
const TF_AFTER_OK = /^(?:[\s.,!?'"’”)]|$|(?:이|가|은|는|을|를|의|에|에서|에게|로|으로|와|과|도|만|라고|이라고|란|이란|라는|이라는|이다|입니다|이에요|예요|였다|이었다|이며|이고|처럼|보다|부터|까지)(?=[\s.,!?'"’”)]|$))/;
function tfBlankSafe(text: string): boolean {
  const i = text.indexOf("___");
  if (i < 0 || text.indexOf("___", i + 3) >= 0) return false;
  const before = text.slice(0, i).slice(-1);
  const after = text.slice(i + 3);
  return (before === "" || /[\s'"‘“(]/.test(before)) && TF_AFTER_OK.test(after);
}

// 빈칸·O/X 문항 힌트 — 분야 이름(«수학 분야의 문제예요»)은 도움이 안 되고, 분야 이름이 정답이면 답을 알려 준다.
function fillHint(answer: string): string {
  const a = String(answer ?? "").trim();
  if (!a) return "문장을 천천히 다시 읽어 보세요.";
  if (/^\d+(\.\d+)?$/.test(a)) return "숫자로 답하는 문제예요. 문장 속 단서를 찾아보세요.";
  const len = a.replace(/\s/g, "").length;
  return len <= 1 ? "한 글자 낱말이에요." : `첫 글자는 '${a[0]}', 모두 ${len}글자예요.`;
}

function pickTfWrong(
  answer: string,
  choices: string[],
  rng: () => number,
): string | null {
  const wrong = choices.filter((c) => c !== answer && c.trim().length > 0);
  if (wrong.length === 0) return null;

  const aLast = answer.slice(-1);
  const aBatchim = hasBatchim(aLast);
  const safe = wrong.filter(
    (c) =>
      sameFormat(answer, c) &&
      hasBatchim(c.slice(-1)) === aBatchim &&
      Math.abs(c.length - answer.length) <= 1,
  );
  if (safe.length === 0) return null;
  return safe[Math.floor(rng() * safe.length)];
}

function generateMathChoices(correct: number, random: () => number): string[] {
  // 비정상 값 가드(무한루프·NaN 보기 방지)
  if (!Number.isFinite(correct)) correct = 0;
  const distractors = new Set<string>();
  // 소수 정답이면 같은 소수 단위로 오답 생성(0.2→0.1/0.3, 1.2/5.2 같은 스케일 tell 방지)
  const decimals = Number.isInteger(correct)
    ? 0
    : String(correct).split(".")[1]?.length || 0;
  const unit = decimals > 0 ? Math.pow(10, -decimals) : 1;
  const offsets = shuffleChoices(numericOffsets(correct, decimals), random);
  // 정답이 2 이상인 자연수면 0 오답을 피해 소거법을 막음
  const floor = decimals === 0 && correct >= 2 ? 1 : 0;

  for (const offset of offsets) {
    const sign = random() > 0.5 ? 1 : -1;
    const candidate = Number((correct + offset * sign).toFixed(decimals));
    if (candidate >= floor && candidate !== correct) {
      distractors.add(String(candidate));
    }
    if (distractors.size === 3) break;
  }

  let step = 1;
  while (distractors.size < 3) {
    const candidate = Number((correct + step * unit).toFixed(decimals));
    if (candidate !== correct) {
      distractors.add(String(candidate));
    }
    step++;
  }

  return shuffleChoices([String(correct), ...distractors], random);
}

// ── 맞춤법 "고치기" 보기: 같은 문장의 그럴듯한 오표기 변형 ──────────
// 무관한 다른 문장을 오답으로 쓰면 정답이 한눈에 보이므로, 타깃 어절을
// 흔한 맞춤법 혼동으로 바꿔 4지를 모두 같은 문장 변형으로 만든다.
const SPELL_CONFUSION: [string, string][] = [
  ["로서", "로써"], ["되", "돼"], ["안", "않"], ["낫", "낮"], ["낮", "낳"],
  ["며칠", "몇일"], ["왠", "웬"], ["예요", "에요"], ["이에요", "이예요"],
  ["깨끗이", "깨끗히"], ["곰곰이", "곰곰히"], ["오랜만", "오랫만"], ["역할", "역활"],
  ["설거지", "설겆이"], ["같", "갖"], ["빛", "빗"], ["붙", "붓"], ["맞", "맏"],
  ["든지", "던지"], ["바라", "바래"], ["할게", "할께"], ["거예요", "거에요"],
];
// 마지막 한글 음절의 받침을 살짝 바꿔 오타처럼 보이게 (폴백)
// 아이들이 실제로 헷갈리는 표기로만 오답을 만든다(2026-10-12 전수검수: «떨어젔어욧»·«할숫 수»처럼
// 받침을 아무거나 붙이면 아무도 쓰지 않는 글자가 보기로 나왔다).
//   받침: 소리가 같은 것끼리(ㄱ·ㄲ·ㅋ / ㄷ·ㅅ·ㅆ·ㅈ·ㅊ·ㅌ·ㅎ / ㅂ·ㅍ) · 겹받침↔홑받침(값/갑, 닭/닥, 넓/널)
//   모음: ㅐ↔ㅔ · ㅒ↔ㅖ · ㅚ↔ㅙ↔ㅞ · ㅢ↔ㅣ
const JONG_ALIKE: number[][] = [
  [1, 2, 24], [7, 19, 20, 22, 23, 25], [17, 26],
  [18, 17], [9, 1], [10, 16], [11, 8], [3, 1], [6, 4], [15, 8], [12, 8], [13, 8],
];
const JUNG_ALIKE: number[][] = [[1, 5], [3, 7], [11, 10, 15], [19, 20]];
function plausibleMisspellings(part: string): string[] {
  const out: string[] = [];
  const push = (v: string) => { if (v !== part && !out.includes(v)) out.push(v); };
  for (let i = part.length - 1; i >= 0; i--) {
    const code = part.charCodeAt(i);
    if (code < 0xac00 || code > 0xd7a3) continue;
    const base = code - 0xac00;
    const jong = base % 28;
    const jung = Math.floor(base / 28) % 21;
    const cho = Math.floor(base / 28 / 21);
    const mk = (ju: number, jo: number) => part.slice(0, i) + String.fromCharCode(0xac00 + (cho * 21 + ju) * 28 + jo) + part.slice(i + 1);
    for (const g of JONG_ALIKE) if (g.includes(jong)) for (const nj of g) if (nj !== jong) push(mk(jung, nj));
    for (const g of JUNG_ALIKE) if (g.includes(jung)) for (const nv of g) if (nv !== jung) push(mk(nv, jong));
  }
  return out;
}
function perturbSyllable(word: string): string | null {
  return plausibleMisspellings(word)[0] ?? null;
}
function spellPerturbations(part: string): string[] {
  return plausibleMisspellings(part);
}
function diffSpellingPart(
  correctSentence: string,
  wrongSentence: string,
): { correctPart: string; wrongPart: string } {
  const cw = correctSentence.split(/\s+/);
  const ww = wrongSentence.split(/\s+/);
  for (let i = 0; i < ww.length; i++) {
    if (i >= cw.length || ww[i] !== cw[i]) {
      return { correctPart: cw[i] || cw[0], wrongPart: ww[i] || ww[0] };
    }
  }
  return { correctPart: cw[0], wrongPart: ww[0] };
}
// 정답 문장 기준, 같은 문장의 오표기 변형 3개 생성
function spellingVariantDistractors(
  correctSentence: string,
  wrongSentence: string,
  correctPart: string,
  wrongPart: string,
  rng: () => number,
): string[] {
  const exclude = new Set([correctPart, wrongPart]);
  const variantParts: string[] = [];
  for (const [a, b] of SPELL_CONFUSION) {
    for (const [from, to] of [
      [a, b],
      [b, a],
    ] as [string, string][]) {
      if (correctPart.includes(from)) {
        const v = correctPart.replace(from, to);
        if (!exclude.has(v) && !variantParts.includes(v)) variantParts.push(v);
      }
    }
  }
  const p = perturbSyllable(correctPart);
  if (p && !exclude.has(p) && !variantParts.includes(p)) variantParts.push(p);

  const sentences = new Set<string>();
  // 원래 오답 문장 우선(단, 정답과 같으면 제외)
  if (wrongSentence && wrongSentence !== correctSentence)
    sentences.add(wrongSentence);
  for (const v of variantParts) {
    if (sentences.size >= 3) break;
    const s = correctSentence.replace(correctPart, v);
    if (s !== correctSentence) sentences.add(s); // 정답 문장 절대 미포함
  }
  let guard = 0;
  while (sentences.size < 3 && guard++ < 8) {
    const p2 = perturbSyllable(guard % 2 ? wrongPart : correctPart);
    if (!p2) break;
    const s = correctSentence.replace(correctPart, p2);
    if (s !== correctSentence) sentences.add(s);
  }
  return shuffleChoices([...sentences], rng).slice(0, 3);
}

// 맞춤법 sentence/correct variant 공용: 정답 + 서로 다른 오표기 변형 3개(중복·정답중복 0)
function buildSpellingSentenceChoices(
  correctSentence: string,
  wrongSentence: string,
  rng: () => number,
): string[] {
  const { correctPart, wrongPart } = diffSpellingPart(
    correctSentence,
    wrongSentence,
  );
  const distinct = new Set<string>();
  for (const d of spellingVariantDistractors(
    correctSentence,
    wrongSentence,
    correctPart,
    wrongPart,
    rng,
  )) {
    if (distinct.size >= 3) break;
    if (d && d !== correctSentence) distinct.add(d);
  }
  // 짧은 문장도 보기 3개 확보: ① correctPart 받침 다중 변형 → ② 문장 전체 음절 변형
  if (distinct.size < 3) {
    for (const pv of spellPerturbations(correctPart)) {
      if (distinct.size >= 3) break;
      const cand = correctSentence.replace(correctPart, pv);
      if (cand !== correctSentence) distinct.add(cand);
    }
  }
  // 문장 전체(문장 끝 «요»까지) 를 흔들면 «욧» 같은 엉터리 보기가 나온다 → 틀린 자리 어절만 변형한다.
  // 그래도 모자라면 보기 수를 줄인다(정답 + 오답 2개 이상).
  return shuffleChoices([correctSentence, ...[...distinct].slice(0, 3)], rng);
}

function generateSpellingChoices(
  entry: SpellingEntry,
  pool: SpellingEntry[],
  random: () => number,
): string[] {
  const correctSentence = entry.answer === 1 ? entry.q1 : entry.q2;
  const wrongPool = pool.flatMap((item) => {
    const wrongSentence = item.answer === 1 ? item.q2 : item.q1;
    return wrongSentence === correctSentence ? [] : [wrongSentence];
  });
  const distractors = shuffleChoices([...new Set(wrongPool)], random).slice(
    0,
    3,
  );

  while (distractors.length < 3) {
    distractors.push(`${correctSentence} (오답)`);
  }

  return shuffleChoices([correctSentence, ...distractors], random);
}

function takeExpandedPortion<T>(items: T[], ratio = 0.5): T[] {
  if (items.length === 0) return [];
  const count = Math.max(1, Math.floor(items.length * ratio));
  return items.slice(0, count);
}

// ── 적응형 난이도 (Adaptive Difficulty) ──────────────────────────
// 같은 학년 + 성취기준 내에서 쉬움/보통/어려움 3단계
// 학년을 바꾸지 않고 문제 난이도만 조정

/** 과목별 정답률에 따라 난이도 결정 (1=쉬움, 2=보통, 3=어려움) */
function getDifficultyLevel(accuracy: number | undefined): 1 | 2 | 3 {
  if (accuracy === undefined) return 2; // 데이터 없으면 보통
  if (accuracy >= 85) return 3; // 잘 맞추면 어려운 문제
  if (accuracy <= 45) return 1; // 많이 틀리면 쉬운 문제
  return 2;
}

interface GradeData {
  spelling: SpellingEntry[];
  vocab: VocabEntry[];
  math: MathEntry[];
  knowledge: KnowledgeEntry[];
  safety: SafetyEntry[];
  writing: string[];
  korean?: KnowledgeEntry[];
  koreanReading?: ReadingEntry[];
  creative?: KnowledgeEntry[];
  hanja?: HanjaEntry[];
  english?: EnglishEntry[];
  science?: KnowledgeEntry[];
  social?: KnowledgeEntry[];
  synonymPairs?: SynonymPair[];
  antonymPairs?: AntonymPair[];
  idioms?: VocabIdiomEntry[];
  multiMeaningWords?: MultiMeaningWord[];
  wordPuzzles?: WordPuzzleEntry[];
}

/**
 * Filter math items to only include units unlocked so far this semester.
 * Uses week-based curriculum sequencing for all grades.
 * Falls back to no filtering if no sequence is defined.
 */
function filterMathByProgress(
  items: MathEntry[],
  grade: number,
  semester: number,
): MathEntry[] {
  const available = getAvailableMathUnits(grade, semester);
  if (available.size === 0) return items; // no sequence defined for this grade/semester

  // Return only items matching unlocked units. Items without a unit field pass through.
  // If nothing matches after filtering, return all items to avoid empty data errors.
  const filtered = items.filter((m) => !m.unit || available.has(m.unit));
  return filtered.length > 0 ? filtered : items;
}

/**
 * Filter science items to only include units unlocked so far this semester.
 * Uses week-based curriculum sequencing for grades 3-6.
 * Returns all items for grades 1-2 (no science curriculum).
 */
function filterScienceByProgress(
  items: KnowledgeEntry[],
  grade: number,
  semester: number,
): KnowledgeEntry[] {
  const available = getAvailableScienceUnits(grade, semester);
  if (available.size === 0) return items; // grades 1-2 or no sequence defined
  const filtered = items.filter((m) => !m.unit || available.has(m.unit));
  return filtered.length > 0 ? filtered : items;
}

/**
 * Filter English items to only include units unlocked so far this semester.
 * Uses week-based curriculum sequencing for grades 3-6.
 * Returns all items for grades 1-2 (no English curriculum).
 */
function filterEnglishByProgress(
  items: EnglishEntry[],
  grade: number,
  semester: number,
): EnglishEntry[] {
  const available = getAvailableEnglishUnits(grade, semester);
  if (available.size === 0) return items; // grades 1-2 or no sequence defined
  const filtered = items.filter((m) => !m.unit || available.has(m.unit));
  return filtered.length > 0 ? filtered : items;
}

/**
 * Filter social studies items to only include units unlocked so far this semester.
 * Uses week-based curriculum sequencing for grades 5-6.
 * Returns all items for grades 1-4 (no social curriculum).
 */
function filterSocialByProgress(
  items: KnowledgeEntry[],
  grade: number,
  semester: number,
): KnowledgeEntry[] {
  const available = getAvailableSocialUnits(grade, semester);
  if (available.size === 0) return items; // grades 1-4 or no sequence defined
  const filtered = items.filter((m) => !m.unit || available.has(m.unit));
  return filtered.length > 0 ? filtered : items;
}

// ============================================================
// Static data accessors for core subjects (used for grade offset)
// ============================================================
function getStaticMathData(g: number): MathEntry[] {
  switch (g) {
    case 1:
      return grade1MathData;
    case 2:
      return grade2MathData;
    case 3:
      return grade3MathData;
    case 4:
      return grade4MathData;
    case 5:
      return grade5MathData;
    case 6:
      return grade6MathData;
    default:
      return grade1MathData;
  }
}

function getStaticEnglishData(g: number): EnglishEntry[] {
  switch (g) {
    case 3:
      return grade3EnglishData ?? [];
    case 4:
      return grade4EnglishData ?? [];
    case 5:
      return grade5EnglishData ?? [];
    case 6:
      return grade6EnglishData ?? [];
    default:
      return [];
  }
}

function getStaticScienceData(g: number): KnowledgeEntry[] {
  switch (g) {
    case 5:
      return grade5ScienceData ?? [];
    case 6:
      return grade6ScienceData ?? [];
    default:
      return [];
  }
}

function getStaticSocialData(g: number): KnowledgeEntry[] {
  switch (g) {
    case 5:
      return grade5SocialData ?? [];
    case 6:
      return grade6SocialData ?? [];
    default:
      return [];
  }
}

function getStaticKoreanData(g: number): KnowledgeEntry[] {
  switch (g) {
    case 1:
      return grade1KoreanData ?? [];
    case 2:
      return grade2KoreanData ?? [];
    default:
      return [];
  }
}

function getStaticKoreanReadingData(g: number): ReadingEntry[] {
  switch (g) {
    case 1:
      return grade1ReadingData ?? [];
    case 2:
      return grade2ReadingData ?? [];
    case 3:
      return grade3ReadingData ?? [];
    case 4:
      return grade4ReadingData ?? [];
    case 5:
      return grade5ReadingData ?? [];
    case 6:
      return grade6ReadingData ?? [];
    default:
      return [];
  }
}

// Get curriculum data per grade (merges static + procedurally generated)
// 선행학습법 준수: 주지과목(수학·국어·영어·과학)은 전 학년 내용을 제공합니다.
export function getGradeData(
  grade: number,
  semester: number,
  daySeed?: number,
  subjectAccuracy?: Record<string, { accuracy: number }>,
): GradeData {
  const dayOfYear = daySeed ?? getDayOfYear();
  const expandedDayOfYear = dayOfYear + 10000;
  const expandedDayOfYearBonus = dayOfYear + 20000;

  // 적응형 난이도: 같은 학년·성취기준 내에서 난이도만 조정 (학년 변경 없음)
  const diff = (subject: string) =>
    getDifficultyLevel(subjectAccuracy?.[subject]?.accuracy);
  const mathDiff = diff("math");
  const spellingDiff = diff("spelling");
  const vocabDiff = diff("vocabulary");
  const knowledgeDiff = diff("general_knowledge");
  const safetyDiff = diff("safety");
  const hanjaDiff = diff("hanja");
  const englishDiff = diff("english");
  const scienceDiff = diff("science");
  const socialDiff = diff("social");

  // 주지과목도 현재 학년 기준으로 배정 (2026-07-04: 기존 grade-1 매핑 제거 —
  // 상한 없는 grade-1이라 6학년이 항상 5학년 콘텐츠만 받고 grade6 데이터가 도달 불가능한
  // dead code가 되던 버그 수정. 이제 각 학년이 자기 학년 콘텐츠를 받는다.)
  const coreMathGrade = grade;
  const coreEnglishGrade = grade;
  const coreScienceGrade = grade;
  const coreSocialGrade = grade;

  // ---- 주지과목 풀 생성 (전 학년 기준 + 난이도 적용) ----
  const generatedMath = generateMathPool(
    coreMathGrade,
    dayOfYear,
    semester,
    mathDiff,
  );
  const generatedMathExtra = generateMathPool(
    coreMathGrade,
    expandedDayOfYear,
    semester,
    mathDiff,
  );
  const generatedMathBonus = takeExpandedPortion(
    generateMathPool(coreMathGrade, expandedDayOfYearBonus, semester, mathDiff),
  );
  const generatedEnglish = generateEnglishPool(
    coreEnglishGrade,
    dayOfYear,
    englishDiff,
  );
  const generatedEnglishExtra = generateEnglishPool(
    coreEnglishGrade,
    expandedDayOfYear,
    englishDiff,
  );
  const generatedEnglishBonus = takeExpandedPortion(
    generateEnglishPool(coreEnglishGrade, expandedDayOfYearBonus, englishDiff),
  );
  const generatedScience = generateSciencePool(
    coreScienceGrade,
    dayOfYear,
    scienceDiff,
  );
  const generatedScienceExtra = generateSciencePool(
    coreScienceGrade,
    expandedDayOfYear,
    scienceDiff,
  );
  const generatedScienceBonus = takeExpandedPortion(
    generateSciencePool(coreScienceGrade, expandedDayOfYearBonus, scienceDiff),
  );

  // ---- 비주지과목 풀 생성 (같은 학년 + 난이도 적용) ----
  const generatedSpelling = generateSpellingPool(
    grade,
    dayOfYear,
    spellingDiff,
  );
  const generatedSpellingExtra = generateSpellingPool(
    grade,
    expandedDayOfYear,
    spellingDiff,
  );
  const generatedSpellingBonus = takeExpandedPortion(
    generateSpellingPool(grade, expandedDayOfYearBonus, spellingDiff),
  );
  const generatedVocab = generateVocabPool(grade, dayOfYear, vocabDiff);
  const generatedVocabExtra = generateVocabPool(
    grade,
    expandedDayOfYear,
    vocabDiff,
  );
  const generatedVocabBonus = takeExpandedPortion(
    generateVocabPool(grade, expandedDayOfYearBonus, vocabDiff),
  );
  const generatedKnowledge = generateKnowledgePool(
    grade,
    dayOfYear,
    knowledgeDiff,
  );
  const generatedKnowledgeExtra = generateKnowledgePool(
    grade,
    expandedDayOfYear,
    knowledgeDiff,
  );
  const generatedKnowledgeBonus = takeExpandedPortion(
    generateKnowledgePool(grade, expandedDayOfYearBonus, knowledgeDiff),
  );
  const generatedSafety = generateSafetyPool(grade, dayOfYear, safetyDiff);
  const generatedSafetyExtra = generateSafetyPool(
    grade,
    expandedDayOfYear,
    safetyDiff,
  );
  const generatedSafetyBonus = takeExpandedPortion(
    generateSafetyPool(grade, expandedDayOfYearBonus, safetyDiff),
  );
  const generatedHanja = generateHanjaPool(grade, dayOfYear, hanjaDiff);
  const generatedHanjaExtra = generateHanjaPool(
    grade,
    expandedDayOfYear,
    hanjaDiff,
  );
  const generatedHanjaBonus = takeExpandedPortion(
    generateHanjaPool(grade, expandedDayOfYearBonus, hanjaDiff),
  );
  const generatedWriting = generateWritingPool(grade, dayOfYear);
  const generatedWritingExtra = generateWritingPool(grade, expandedDayOfYear);
  const generatedWritingBonus = takeExpandedPortion(
    generateWritingPool(grade, expandedDayOfYearBonus),
  );
  const generatedCreative = generateCreativePool(grade, dayOfYear);
  const generatedCreativeExtra = generateCreativePool(grade, expandedDayOfYear);
  const generatedCreativeBonus = takeExpandedPortion(
    generateCreativePool(grade, expandedDayOfYearBonus),
  );
  const generatedSocial = generateSocialPool(
    coreSocialGrade,
    dayOfYear,
    socialDiff,
  );
  const generatedSocialExtra = generateSocialPool(
    coreSocialGrade,
    expandedDayOfYear,
    socialDiff,
  );
  const generatedSocialBonus = takeExpandedPortion(
    generateSocialPool(coreSocialGrade, expandedDayOfYearBonus, socialDiff),
  );

  // ---- 독해(국어 지문) 풀 ----
  const generatedReading = generateReadingPool(grade, dayOfYear);
  const generatedReadingExtra = generateReadingPool(grade, expandedDayOfYear);
  const generatedReadingBonus = takeExpandedPortion(
    generateReadingPool(grade, expandedDayOfYearBonus),
  );

  // ---- 주지과목 단원 진도 필터링 (전 학년 기준) ----
  const filtMath = filterMathByProgress(
    [...generatedMath, ...generatedMathExtra, ...generatedMathBonus],
    coreMathGrade,
    semester,
  );
  const filtScience = filterScienceByProgress(
    [...generatedScience, ...generatedScienceExtra, ...generatedScienceBonus],
    coreScienceGrade,
    semester,
  );
  const filtEnglish = filterEnglishByProgress(
    [...generatedEnglish, ...generatedEnglishExtra, ...generatedEnglishBonus],
    coreEnglishGrade,
    semester,
  );
  const filtSocial = filterSocialByProgress(
    [...generatedSocial, ...generatedSocialExtra, ...generatedSocialBonus],
    coreSocialGrade,
    semester,
  );

  // ---- 주지과목 정적 데이터 (전 학년 기준) ----
  const staticMathData = getStaticMathData(coreMathGrade);
  const staticEnglishData = getStaticEnglishData(coreEnglishGrade);
  const staticScienceData = getStaticScienceData(coreScienceGrade);
  const staticSocialData = getStaticSocialData(coreSocialGrade);
  const staticKoreanData = getStaticKoreanData(coreMathGrade);
  const staticKoreanReadingData = getStaticKoreanReadingData(coreMathGrade);

  switch (grade) {
    case 1:
      return {
        spelling: [
          ...grade1SpellingData,
          ...generatedSpelling,
          ...generatedSpellingExtra,
          ...generatedSpellingBonus,
        ],
        vocab: [
          ...grade1VocabData,
          ...generatedVocab,
          ...generatedVocabExtra,
          ...generatedVocabBonus,
        ],
        math: [
          ...filterMathByProgress(staticMathData, coreMathGrade, semester),
          ...filtMath,
        ],
        knowledge: [
          ...grade1KnowledgeData,
          ...generatedKnowledge,
          ...generatedKnowledgeExtra,
          ...generatedKnowledgeBonus,
        ],
        safety: [
          ...grade1SafetyData,
          ...generatedSafety,
          ...generatedSafetyExtra,
          ...generatedSafetyBonus,
        ],
        writing: [
          ...grade1WritingPrompts,
          ...generatedWriting,
          ...generatedWritingExtra,
          ...generatedWritingBonus,
        ],
        // 독해 퀴즈용 국어 풀. 창의(creative) 풀과 공유하지 않는다 —
        // 공유하면 pickUnused가 korean/creative 인덱스를 독립 추적해
        // 같은 문항이 한 세트의 독해·창의 양쪽에 중복 노출됨(2026-07-04 수정).
        korean: [...staticKoreanData],
        koreanReading: [
          ...staticKoreanReadingData,
          ...generatedReading,
          ...generatedReadingExtra,
          ...generatedReadingBonus,
        ],
        creative: [
          ...(grade1CreativeData || []),
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
      };
    case 2:
      return {
        spelling: [
          ...grade2SpellingData,
          ...generatedSpelling,
          ...generatedSpellingExtra,
          ...generatedSpellingBonus,
        ],
        vocab: [
          ...grade2VocabData,
          ...generatedVocab,
          ...generatedVocabExtra,
          ...generatedVocabBonus,
        ],
        math: [
          ...filterMathByProgress(staticMathData, coreMathGrade, semester),
          ...filtMath,
        ],
        knowledge: [
          ...grade2KnowledgeData,
          ...generatedKnowledge,
          ...generatedKnowledgeExtra,
          ...generatedKnowledgeBonus,
        ],
        safety: [
          ...grade2SafetyData,
          ...generatedSafety,
          ...generatedSafetyExtra,
          ...generatedSafetyBonus,
        ],
        writing: [
          ...grade2WritingPrompts,
          ...generatedWriting,
          ...generatedWritingExtra,
          ...generatedWritingBonus,
        ],
        // 독해 퀴즈용 국어 풀. 창의(creative) 풀과 공유하지 않는다 —
        // 공유하면 pickUnused가 korean/creative 인덱스를 독립 추적해
        // 같은 문항이 한 세트의 독해·창의 양쪽에 중복 노출됨(2026-07-04 수정).
        korean: [...staticKoreanData],
        koreanReading: [
          ...staticKoreanReadingData,
          ...generatedReading,
          ...generatedReadingExtra,
          ...generatedReadingBonus,
        ],
        creative: [
          ...(grade2CreativeData || []),
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
      };
    case 3:
      return {
        spelling: [
          ...grade3SpellingData,
          ...generatedSpelling,
          ...generatedSpellingExtra,
          ...generatedSpellingBonus,
        ],
        vocab: [
          ...grade3VocabData,
          ...generatedVocab,
          ...generatedVocabExtra,
          ...generatedVocabBonus,
        ],
        math: [
          ...filterMathByProgress(staticMathData, coreMathGrade, semester),
          ...filtMath,
        ],
        knowledge: [
          ...grade3KnowledgeData,
          ...grade3KnowledgeDataExtra,
          ...generatedKnowledge,
          ...generatedKnowledgeExtra,
          ...generatedKnowledgeBonus,
        ],
        safety: [
          ...grade3SafetyData,
          ...grade3SafetyDataExtra,
          ...generatedSafety,
          ...generatedSafetyExtra,
          ...generatedSafetyBonus,
        ],
        writing: [
          ...grade3WritingPrompts,
          ...generatedWriting,
          ...generatedWritingExtra,
          ...generatedWritingBonus,
        ],
        hanja: [
          // grade3HanjaData 제거: 예시단어/획수/예문 결함(한자 날치환) → 제너레이터 단일 양질 소스 사용
          ...generatedHanja,
          ...generatedHanjaExtra,
          ...generatedHanjaBonus,
        ],
        english: [...staticEnglishData, ...filtEnglish],
        korean: [...staticKoreanData],
        koreanReading: [
          ...staticKoreanReadingData,
          ...generatedReading,
          ...generatedReadingExtra,
          ...generatedReadingBonus,
        ],
        creative: [
          ...(grade3CreativeData || []),
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
      };
    case 4:
      return {
        spelling: [
          ...grade4SpellingData,
          ...generatedSpelling,
          ...generatedSpellingExtra,
          ...generatedSpellingBonus,
        ],
        vocab: [
          ...grade4VocabData,
          ...generatedVocab,
          ...generatedVocabExtra,
          ...generatedVocabBonus,
        ],
        math: [
          ...filterMathByProgress(staticMathData, coreMathGrade, semester),
          ...filtMath,
        ],
        knowledge: [
          ...grade4KnowledgeData,
          ...generatedKnowledge,
          ...generatedKnowledgeExtra,
          ...generatedKnowledgeBonus,
        ],
        safety: [
          ...grade4SafetyData,
          ...generatedSafety,
          ...generatedSafetyExtra,
          ...generatedSafetyBonus,
        ],
        writing: [
          ...grade4WritingPrompts,
          ...generatedWriting,
          ...generatedWritingExtra,
          ...generatedWritingBonus,
        ],
        hanja: [
          ...generatedHanja,
          ...generatedHanjaExtra,
          ...generatedHanjaBonus,
        ],
        english: [...staticEnglishData, ...filtEnglish],
        korean: [...staticKoreanData],
        koreanReading: [
          ...staticKoreanReadingData,
          ...generatedReading,
          ...generatedReadingExtra,
          ...generatedReadingBonus,
        ],
        creative: [
          ...(grade4CreativeData || []),
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
      };
    case 5:
      return {
        spelling: [
          ...grade5SpellingData,
          ...generatedSpelling,
          ...generatedSpellingExtra,
          ...generatedSpellingBonus,
        ],
        vocab: [
          ...grade5VocabData,
          ...generatedVocab,
          ...generatedVocabExtra,
          ...generatedVocabBonus,
        ],
        math: [
          ...filterMathByProgress(staticMathData, coreMathGrade, semester),
          ...filtMath,
        ],
        knowledge: [
          ...grade5KnowledgeData,
          ...generatedKnowledge,
          ...generatedKnowledgeExtra,
          ...generatedKnowledgeBonus,
        ],
        safety: [
          ...grade5SafetyData,
          ...generatedSafety,
          ...generatedSafetyExtra,
          ...generatedSafetyBonus,
        ],
        writing: [
          ...grade5WritingPrompts,
          ...generatedWriting,
          ...generatedWritingExtra,
          ...generatedWritingBonus,
        ],
        hanja: [
          ...generatedHanja,
          ...generatedHanjaExtra,
          ...generatedHanjaBonus,
        ],
        english: [...staticEnglishData, ...filtEnglish],
        korean: [...staticKoreanData],
        koreanReading: [
          ...staticKoreanReadingData,
          ...generatedReading,
          ...generatedReadingExtra,
          ...generatedReadingBonus,
        ],
        creative: [
          ...(grade5CreativeData || []),
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
        science: [...staticScienceData, ...filtScience],
        social: [
          ...filterSocialByProgress(
            staticSocialData,
            coreSocialGrade,
            semester,
          ),
          ...filtSocial,
        ],
      };
    case 6:
      return {
        spelling: [
          ...grade6SpellingData,
          ...generatedSpelling,
          ...generatedSpellingExtra,
          ...generatedSpellingBonus,
        ],
        vocab: [
          ...grade6VocabData,
          ...generatedVocab,
          ...generatedVocabExtra,
          ...generatedVocabBonus,
        ],
        math: [
          ...filterMathByProgress(staticMathData, coreMathGrade, semester),
          ...filtMath,
        ],
        knowledge: [
          ...grade6KnowledgeData,
          ...generatedKnowledge,
          ...generatedKnowledgeExtra,
          ...generatedKnowledgeBonus,
        ],
        safety: [
          ...grade6SafetyData,
          ...generatedSafety,
          ...generatedSafetyExtra,
          ...generatedSafetyBonus,
        ],
        writing: [
          ...grade6WritingPrompts,
          ...generatedWriting,
          ...generatedWritingExtra,
          ...generatedWritingBonus,
        ],
        hanja: [
          ...generatedHanja,
          ...generatedHanjaExtra,
          ...generatedHanjaBonus,
        ],
        english: [...staticEnglishData, ...filtEnglish],
        korean: [...staticKoreanData],
        koreanReading: [
          ...staticKoreanReadingData,
          ...generatedReading,
          ...generatedReadingExtra,
          ...generatedReadingBonus,
        ],
        creative: [
          ...(grade6CreativeData || []),
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
        science: [...staticScienceData, ...filtScience],
        social: [
          ...filterSocialByProgress(
            staticSocialData,
            coreSocialGrade,
            semester,
          ),
          ...filtSocial,
        ],
      };
    default:
      return {
        spelling: [
          ...grade1SpellingData,
          ...generatedSpelling,
          ...generatedSpellingExtra,
          ...generatedSpellingBonus,
        ],
        vocab: [
          ...grade1VocabData,
          ...generatedVocab,
          ...generatedVocabExtra,
          ...generatedVocabBonus,
        ],
        math: [
          ...filterMathByProgress(staticMathData, coreMathGrade, semester),
          ...filtMath,
        ],
        knowledge: [
          ...grade1KnowledgeData,
          ...generatedKnowledge,
          ...generatedKnowledgeExtra,
          ...generatedKnowledgeBonus,
        ],
        safety: [
          ...grade1SafetyData,
          ...generatedSafety,
          ...generatedSafetyExtra,
          ...generatedSafetyBonus,
        ],
        writing: [
          ...grade1WritingPrompts,
          ...generatedWriting,
          ...generatedWritingExtra,
          ...generatedWritingBonus,
        ],
        // 독해 퀴즈용 국어 풀. 창의(creative) 풀과 공유하지 않는다 —
        // 공유하면 pickUnused가 korean/creative 인덱스를 독립 추적해
        // 같은 문항이 한 세트의 독해·창의 양쪽에 중복 노출됨(2026-07-04 수정).
        korean: [...staticKoreanData],
        koreanReading: [
          ...staticKoreanReadingData,
          ...generatedReading,
          ...generatedReadingExtra,
          ...generatedReadingBonus,
        ],
        creative: [
          ...(grade1CreativeData || []),
          ...generatedCreative,
          ...generatedCreativeExtra,
          ...generatedCreativeBonus,
        ],
      };
  }
}

// Build an emotion_check question
function buildEmotionQuestion(
  setId: string,
  orderIndex: number,
  title: string,
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "creative" as SubjectType,
    question_type: "emotion_check" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: "오늘 아침 나의 기분은 어떤가요?",
      categories: [...EMOTION_CATEGORIES],
    },
    answer: { type: "emotion_bar" },
    explanation: null,
    points: 10,
    hint: "솔직하게 표시해 주세요!",
    metadata: null,
    created_at: new Date().toISOString(),
  };
}

// Build a readiness_check question
function buildReadinessQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  gradeGroup: "1-2" | "3-4" | "5-6",
): Question {
  const items = [...DEFAULT_READINESS_ITEMS[gradeGroup]];
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "creative" as SubjectType,
    question_type: "readiness_check" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      text: "오늘 준비물을 확인해 볼까요?",
      items,
    },
    answer: { type: "checklist" },
    explanation: null,
    points: 10,
    hint: "하나씩 확인하면서 체크해요!",
    metadata: null,
    created_at: new Date().toISOString(),
  };
}

// Build a math question from real curriculum data
// ── reverse(빈칸 역산) 안전성 검증 ────────────────────────────────
// 식의 첫 수를 ?로 가리고 결과(result)를 보여주는 변형. 단, 그 첫 수가
// 결과로부터 '유일하게' 복원되는 식만 허용한다. 몫/나머지(여러 피제수가
// 같은 몫)·소수(자리 깨짐)·다항·문장형은 제외하고 choice로 폴백한다.
// 허용 시 검증된 첫 수(문자열)를, 불가하면 null을 돌려준다.
function reverseFirstOperand(expr: string, answerNum: number): string | null {
  if (!expr || !Number.isFinite(answerNum)) return null;
  if (/몫|나머지/.test(expr)) return null; // 몫: 피제수가 유일하지 않음
  if (/\d\.\d/.test(expr)) return null; // 소수: 정수부만 잘려 식·정답이 깨짐
  const head = expr.match(/^\s*(\d+)/);
  if (!head) return null;
  const a = Number(head[1]);
  if (!Number.isInteger(a) || a < 0) return null;

  // ① 이진 등식 "a op b" — 결과로 a를 재계산해 첫 수와 일치할 때만 허용
  const bin = expr.match(/^\s*(\d+)\s*([+\-×x*÷/])\s*(\d+)/);
  if (bin) {
    const op = bin[2];
    const b = Number(bin[3]);
    let rec: number;
    if (op === "+") rec = answerNum - b;
    else if (op === "-") rec = answerNum + b;
    else if (op === "×" || op === "x" || op === "*")
      rec = b !== 0 ? answerNum / b : NaN;
    else {
      if (b === 0) return null; // 0으로 나누기 방어(0÷0 등 비정의 식 차단)
      rec = answerNum * b; // ÷ (몫/나머지는 위에서 제외 → 나누어떨어지는 경우만)
    }
    return Number.isInteger(rec) && rec >= 0 && rec === a ? String(a) : null;
  }

  // ② 뛰어 세기 "X부터 N씩 K번 뛰어 세면?" — 시작값 = 결과 − N×K
  const skip = expr.match(/^\s*(\d+)부터\s*(\d+)씩\s*(\d+)번/);
  if (skip) {
    const start = answerNum - Number(skip[2]) * Number(skip[3]);
    return start === a && start >= 0 ? String(a) : null;
  }

  // ③ "X의 N배는?" — 기준값 = 결과 ÷ N
  const mul = expr.match(/^\s*(\d+)의\s*(\d+)배/);
  if (mul) {
    const m = Number(mul[2]);
    const base = m !== 0 ? answerNum / m : NaN;
    return Number.isInteger(base) && base === a && base >= 0 ? String(a) : null;
  }

  return null; // 그 외 문장형(비교·분수·약수·시각 등)은 reverse 비허용
}

// ── 시각(H시 M분) 보기: 12시간 순환으로 유효한 시각만 생성 ──────────
// time 문항의 answer는 H*100+M로 인코딩됨(예: 300=3시 0분). "300"처럼
// 보이지 않게 보기·정답을 'H시 M분' 라벨로 만들고, 60분 넘는 비정상 시각을 배제.
function clockLabel(totalMin: number): string {
  const t = ((totalMin % 720) + 720) % 720; // 12시간 = 720분 순환
  const m = t % 60;
  const h = Math.floor(t / 60) || 12;
  return `${h}시 ${m}분`;
}
function timeMathChoices(
  answerEncoded: number,
  random: () => number,
): { choices: string[]; correct: string } {
  const correctTotal =
    Math.floor(answerEncoded / 100) * 60 + (answerEncoded % 100);
  const correct = clockLabel(correctTotal);
  const seen = new Set<string>([correct]);
  const distractors: string[] = [];
  const offsets = shuffleChoices(
    [5, 10, 15, 20, 30, 45, 60, -5, -10, -15, -20, -30],
    random,
  );
  for (const off of offsets) {
    if (distractors.length === 3) break;
    const label = clockLabel(correctTotal + off);
    if (!seen.has(label)) {
      seen.add(label);
      distractors.push(label);
    }
  }
  let k = 1;
  while (distractors.length < 3) {
    const label = clockLabel(correctTotal + 65 * k);
    if (!seen.has(label)) {
      seen.add(label);
      distractors.push(label);
    }
    k++;
  }
  return { choices: shuffleChoices([correct, ...distractors], random), correct };
}

// ── 번호 범례 "(1: 연필, 2: 귤, 0: 같음)" → 실제 라벨 보기로 ─────────
// 답이 번호(1/2/0)라 generateMathChoices가 3·4 같은 무의미 보기를 섞던 문제.
// 범례를 파싱해 보기를 라벨로, 정답을 해당 라벨로 바꾸고 식에서 범례를 제거.
function parseLegendChoices(
  expr: string,
  answerNum: number,
): { choices: string[]; correct: string; expression: string } | null {
  const m = expr.match(/\s*\(([^()]*?\d+\s*:[^()]*?)\)\s*[?.]?\s*$/);
  if (!m) return null;
  const pairs = m[1]
    .split(/\s*,\s*/)
    .map((p) => p.match(/^(-?\d+)\s*:\s*(.+?)\s*$/))
    .filter((x): x is RegExpMatchArray => x != null);
  if (pairs.length < 2) return null;
  const byIndex: Record<string, string> = {};
  const labels: string[] = [];
  for (const p of pairs) {
    byIndex[p[1]] = p[2];
    labels.push(p[2]);
  }
  const correct = byIndex[String(answerNum)];
  if (correct == null) return null;
  const expression = expr.slice(0, expr.length - m[0].length).trim();
  return { choices: labels, correct, expression };
}

// ── 수학 힌트: 단원별 풀이 전략 ─────────────────────────────────
// "차근차근 계산해 보세요!" 같은 무의미한 범용 힌트 대신 단원에 맞는
// 실제 풀이 전략을 알려준다. 정답 자체는 노출하지 않는다.
function mathHintForUnit(unit: string): string {
  const rules: Array<[RegExp, string]> = [
    [/약분|통분/, "분모와 분자를 같은 수(최대공약수)로 나누어 보세요!"],
    [/동분모/, "분모가 같으면 분자끼리만 계산해요!"],
    [/분수의 덧셈|분수의 뺄셈/, "먼저 두 분모의 최소공배수로 통분한 다음, 분자끼리 계산해요!"],
    [/분수의 곱셈/, "분자끼리, 분모끼리 곱한 다음 약분해요!"],
    [/분수의 나눗셈/, "나누는 분수를 뒤집어서(역수) 곱하면 돼요!"],
    [/분수/, "분모(아래)와 분자(위)가 무엇을 뜻하는지 떠올려 보세요!"],
    [/서술형 소수|소수/, "소수점 자리를 잘 맞추는 게 핵심이에요!"],
    [/혼합 계산/, "괄호 → 곱셈·나눗셈 → 덧셈·뺄셈 순서로 계산해요!"],
    [/최대공약수|최소공배수|약수와 배수/, "곱해서 그 수가 되는 수의 짝을 차례로 찾아보세요!"],
    [/곱셈구구|곱셈/, "곱셈구구를 떠올려 보세요!"],
    [/나눗셈/, "나누는 수의 곱셈구구를 거꾸로 생각해 보세요!"],
    [/뺄셈/, "큰 수에서 작은 수를 자리별로 빼요. 받아내림에 주의!"],
    [/덧셈/, "일의 자리부터 차례로 더해요. 받아올림에 주의!"],
    [/백분율/, "(부분 ÷ 전체) × 100으로 구해요!"],
    [/비와 비율|비례식|서술형 비율/, "비의 두 수를 같은 수로 나누거나 곱해도 비는 같아요!"],
    [/원의 넓이/, "원의 넓이 = 반지름 × 반지름 × 3.14, 둘레 = 지름 × 3.14예요!"],
    [/원기둥/, "원기둥 부피 = 밑면(원)의 넓이 × 높이예요!"],
    [/겉넓이/, "여섯 면의 넓이를 모두 더해요. 마주 보는 면은 넓이가 같아요!"],
    [/부피/, "직육면체 부피 = 가로 × 세로 × 높이예요!"],
    [/사다리꼴/, "사다리꼴 넓이 = (윗변 + 아랫변) × 높이 ÷ 2예요!"],
    [/평행사변형/, "평행사변형 넓이 = 밑변 × 높이예요!"],
    [/넓이/, "직사각형 넓이 = 가로 × 세로예요!"],
    [/둘레/, "둘레는 모든 변의 길이를 더한 거예요!"],
    [/평균/, "모두 더한 값을 개수로 나누면 평균이에요!"],
    [/시각과 시간|시간 계산/, "60분이 되면 1시간으로 바꾸어 계산해요!"],
    [/각도/, "직선은 180°, 직각은 90°라는 걸 이용해요!"],
    [/규칙/, "이웃한 수끼리 얼마나 커지는지(작아지는지) 살펴보세요!"],
    [/단위변환/, "단위 사이의 관계(1m=100cm 등)를 먼저 떠올려 보세요!"],
    [/크기 ?비교|순서/, "같은 기준으로 만든 다음(통분·자릿수 맞추기) 비교해요!"],
    [/대칭/, "반으로 접었을 때 완전히 겹치는 선을 찾아보세요!"],
    [/경우의 수/, "빠뜨리거나 겹치지 않게 차례대로 세어 보세요!"],
  ];
  for (const [re, hint] of rules) if (re.test(unit)) return hint;
  return "식을 작은 단계로 나누어 하나씩 계산해 보세요!";
}

// 단원 이름만 보면 «1 + 1»에 «받아올림에 주의!»가 붙는다(2026-10-12 전수검수 60건).
// 식을 직접 보고 받아올림·받아내림 유무, 삼각형/사각형 각도처럼 문제에 맞는 힌트를 고른다.
function mathHint(unit: string, expr: string, entry?: MathEntry): string {
  const e = expr.replace(/\s+/g, " ");
  const bin = e.match(/^\s*(\d+)\s*([+-])\s*(\d+)\s*(=|$)/);
  if (bin) {
    const a = Number(bin[1]);
    const b = Number(bin[3]);
    const digits = (n: number) => String(n).split("").reverse().map(Number);
    const da = digits(a);
    const db = digits(b);
    if (bin[2] === "+") {
      const carry = entry?.hasCarry ?? da.some((d, i) => d + (db[i] ?? 0) >= 10);
      return carry
        ? "일의 자리부터 더하고, 합이 10이거나 10보다 크면 윗자리로 받아올려요!"
        : a < 10 && b < 10
          ? "손가락이나 수직선으로 이어 세어 보세요!"
          : "일의 자리끼리, 십의 자리끼리 차례로 더해요!";
    }
    const borrow = entry?.hasBorrow ?? da.some((d, i) => d < (db[i] ?? 0));
    return borrow
      ? "일의 자리부터 빼고, 모자라면 윗자리에서 10을 받아내려요!"
      : a < 10
        ? "큰 수에서 작은 수만큼 거꾸로 세어 보세요!"
        : "일의 자리끼리, 십의 자리끼리 차례로 빼요!";
  }
  if (/각도/.test(unit) || /°/.test(e)) {
    if (/삼각형/.test(e)) return "삼각형 세 각의 크기를 더하면 180°예요!";
    if (/사각형/.test(e)) return "사각형 네 각의 크기를 더하면 360°예요!";
    if (/직선/.test(e)) return "직선이 이루는 각은 180°예요!";
  }
  return mathHintForUnit(unit);
}

function buildMathQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: MathEntry,
  choices: string[],
  variant: "choice" | "input" | "reverse" = "choice",
  override?: { expression?: string; correct?: string },
  grade?: number,
): Question {
  const expr = override?.expression ?? entry.expression ?? "";
  const reverseAnswer =
    !override && variant === "reverse"
      ? reverseFirstOperand(expr, Number(entry.answer))
      : null;
  const isReverse = reverseAnswer != null;
  const reverseExpression = isReverse ? expr.replace(/^\s*\d+/, "?") : expr;
  const correctAnswer =
    override?.correct ?? reverseAnswer ?? String(entry.answer);

  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id:
      grade != null ? lookupStandardCode("math", grade, entry.unit) : null,
    subject: "math" as SubjectType,
    question_type: (variant === "input"
      ? "short_answer"
      : "multiple_choice") as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      // 문장으로 된 문제(«피자를 … 먹은 양은?»)에 «계산하세요»를 붙이면 지시와 문제가 어긋난다
      text: override
        ? "알맞은 답을 고르세요."
        : variant === "reverse"
          ? "빈칸(?)에 들어갈 수를 구하세요."
          : /[가-힣]{2,}/.test(expr.replace(/\([^)]*\)/g, ""))
            ? "다음 물음에 답하세요."
            : "다음을 계산하세요.",
      expression: isReverse ? reverseExpression : expr,
      unit: entry.unit,
      choices: variant === "input" ? [] : choices,
      variant,
      ...(isReverse ? { result: entry.answer } : {}),
    },
    answer: {
      correct: correctAnswer,
      text: correctAnswer,
      steps: entry.steps || [],
    },
    explanation: entry.steps
      ? entry.steps.join(" -> ")
      : `정답: ${correctAnswer}`,
    points: 10,
    hint: mathHint(entry.unit, expr, entry),
    metadata: {
      unit: entry.unit,
      hasCarry: entry.hasCarry,
      hasBorrow: entry.hasBorrow,
    },
    created_at: new Date().toISOString(),
  };
}

// 맞춤법 문항의 «종류» — 높임말·띄어쓰기·문장부호는 맞춤법(철자)이 아니라서
// «맞춤법이 틀린 부분»이라고 물으면 지시가 틀린다(2026-10-12 전수검수: «있어?» → «맞춤법이 틀린 부분»).
type SpellKind = "spelling" | "honorific" | "spacing" | "punct";
function spellKind(explanation: string | undefined): SpellKind {
  const m = String(explanation ?? "").match(/^\[([^\]]+)\]/);
  const k = m?.[1] ?? "";
  if (/존댓말|높임/.test(k)) return "honorific";
  if (/띄어쓰기/.test(k) && !/의존명사/.test(k)) return "spacing";
  if (/문장부호|문장 부호/.test(k)) return "punct";
  return "spelling";
}
const SPELL_TEXT: Record<SpellKind, { sentence: string; correct: string }> = {
  spelling: { sentence: "다음 중 맞춤법이 올바른 문장을 고르세요.", correct: "다음 문장을 올바르게 고치면?" },
  honorific: { sentence: "어른께 알맞게 말한 문장을 고르세요.", correct: "다음 말을 어른께 알맞게 고치면?" },
  spacing: { sentence: "띄어쓰기가 바른 문장을 고르세요.", correct: "다음 문장의 띄어쓰기를 바르게 고치면?" },
  punct: { sentence: "문장 부호를 바르게 쓴 문장을 고르세요.", correct: "다음 문장의 문장 부호를 바르게 고치면?" },
};
// 띄어쓰기·문장부호는 «한 군데만 틀린» 문장이 진짜 헷갈리는 오답이다
function kindDistractors(kind: SpellKind, correct: string, wrong: string): string[] {
  const out = new Set<string>([wrong]);
  if (kind === "spacing") {
    const sp = [...correct.matchAll(/ /g)].map((m) => m.index!);
    for (const i of sp) out.add(correct.slice(0, i) + correct.slice(i + 1));
  } else if (kind === "punct") {
    // «!»↔«.» 는 둘 다 맞는 문장이 될 수 있다(정말 멋지다! / 정말 멋지다.) — 분명히 틀리는 바꿈만 쓴다
    const alt: Record<string, string[]> = { "!": ["?"], ".": ["?"], "?": ["."], ",": [""] };
    for (let i = 0; i < correct.length; i++) {
      for (const a of alt[correct[i]] ?? []) out.add(correct.slice(0, i) + a + correct.slice(i + 1));
    }
  }
  out.delete(correct);
  return [...out];
}

// Build a spelling question from real curriculum data
function buildSpellingQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: SpellingEntry,
  choices: string[],
  variant: "sentence" | "word" | "correct" = "sentence",
  pool?: SpellingEntry[],
  random?: () => number,
): Question {
  const correctSentence = entry.answer === 1 ? entry.q1 : entry.q2;
  const wrongSentence = entry.answer === 1 ? entry.q2 : entry.q1;
  const kind = spellKind(entry.explanation);
  // «틀린 부분 찾기»는 철자 문항에서만 — 높임말·띄어쓰기·문장부호는 어절 하나를 고를 수 없다
  if (variant === "word" && kind !== "spelling") variant = "sentence";
  const sentenceOptions = (rng: () => number) =>
    kind === "spelling"
      ? buildSpellingSentenceChoices(correctSentence, wrongSentence, rng)
      : shuffleChoices([correctSentence, ...kindDistractors(kind, correctSentence, wrongSentence).slice(0, 3)], rng);

  if (variant === "word") {
    // Find differing words between correct and wrong sentences
    const correctWords = correctSentence.split(/\s+/);
    const wrongWords = wrongSentence.split(/\s+/);
    let diffIndex = 0;
    for (let i = 0; i < wrongWords.length; i++) {
      if (i >= correctWords.length || wrongWords[i] !== correctWords[i]) {
        diffIndex = i;
        break;
      }
    }
    // 어절에 붙은 문장부호 제거(.,!? 등) — "사과"/"사과," 같은 유사중복 방지
    const stripPunc = (w: string) =>
      w.replace(
        /^[^가-힣A-Za-z0-9]+|[^가-힣A-Za-z0-9]+$/g,
        "",
      );
    const wrongPart = stripPunc(wrongWords[diffIndex] || wrongWords[0]);
    const correctPart = stripPunc(correctWords[diffIndex] || correctWords[0]);
    const rng = random || Math.random;
    // 보기: 정답(틀린 어절) + 같은 문장의 다른 올바른 어절 — 중복·부분중복 제거,
    // 길이 근접 정렬로 정답만 길이가 튀어 보이는 것 방지
    const isDupPart = (w: string) =>
      !w ||
      w === wrongPart ||
      (w.length >= 2 && (w.includes(wrongPart) || wrongPart.includes(w)));
    const others = [
      ...new Set(
        // 화면에 보이는 건 틀린 문장이다 — 띄어쓰기 문항(그칠듯 하다)은 어절 수가 달라 바른 문장의 어절(듯하다)이
        // 문장에 없는 보기가 된다. 두 문장에 다 있는 어절만 쓴다.
        wrongWords
          .filter((_, i) => i !== diffIndex)
          .map(stripPunc)
          .filter((w) => correctWords.map(stripPunc).includes(w))
          .filter((w) => w.length > 1 && !isDupPart(w)),
      ),
    ];
    const parts = rankByCloseLength(others, wrongPart.length, rng).slice(0, 3);
    // 보기는 «그 문장 속 어절»이어야 한다 — 문장에 없는 «우리·오늘» 을 채우면 지시가 거짓이 된다.
    // 어절이 모자라면(짧은 문장) 문장 고르기로 낸다.
    if (parts.length < 2) {
      return buildSpellingQuestion(setId, orderIndex, title, entry, choices, "sentence", pool, random);
    }
    const wordChoices = shuffleChoices([wrongPart, ...parts.slice(0, 3)], rng);

    return {
      id: `q-${setId}-${orderIndex}`,
      daily_set_id: setId,
      curriculum_standard_id: null,
      subject: "spelling" as SubjectType,
      question_type: "multiple_choice" as QuestionType,
      order_index: orderIndex,
      title,
      content: {
        variant: "word",
        text: "다음 문장에서 맞춤법이 틀린 부분을 찾으세요.",
        wrongSentence,
        correctPart,
        options: wordChoices,
      },
      answer: {
        correct: wrongPart,
        text: wrongPart,
      },
      explanation: entry.explanation,
      points: 10,
      // correctPart를 힌트로 주면 비슷하게 생긴 보기(=정답)가 바로 드러난다 → 전략 힌트로
      hint: "문장을 소리 내어 읽으며 평소 쓰던 표현과 다른 곳을 찾아보세요!",
      metadata: null,
      created_at: new Date().toISOString(),
    };
  }

  if (variant === "correct") {
    // 오답은 같은 문장의 그럴듯한 오표기 변형으로 (무관한 다른 문장 X, 중복 0)
    const correctChoices = sentenceOptions(random || Math.random);

    return {
      id: `q-${setId}-${orderIndex}`,
      daily_set_id: setId,
      curriculum_standard_id: null,
      subject: "spelling" as SubjectType,
      question_type: "multiple_choice" as QuestionType,
      order_index: orderIndex,
      title,
      content: {
        variant: "correct",
        text: SPELL_TEXT[kind].correct,
        wrongSentence,
        options: correctChoices,
      },
      answer: {
        correct: correctSentence,
        text: correctSentence,
      },
      explanation: entry.explanation,
      points: 10,
      hint: "소리 내어 읽어보면 구별이 쉬워요!",
      metadata: null,
      created_at: new Date().toISOString(),
    };
  }

  // Default: 'sentence' variant — 같은 문장의 오표기 변형으로 보기 구성
  // (무관한 다른 문장을 보기로 쓰면 맞춤법을 몰라도 정답이 한눈에 보임)
  const sentenceChoices = sentenceOptions(random || Math.random);
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "spelling" as SubjectType,
    question_type: "multiple_choice" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      variant: "sentence",
      text: SPELL_TEXT[kind].sentence,
      options: sentenceChoices,
    },
    answer: {
      correct: correctSentence,
      text: correctSentence,
    },
    explanation: entry.explanation,
    points: 10,
    hint: "소리 내어 읽어보면 구별이 쉬워요!",
    metadata: null,
    created_at: new Date().toISOString(),
  };
}

// Build a vocabulary question from real curriculum data
function buildVocabQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: VocabEntry,
  choices: string[],
  variant: string = "clue",
): Question {
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "vocabulary" as SubjectType,
    question_type:
      variant === "input"
        ? ("short_answer" as QuestionType)
        : ("multiple_choice" as QuestionType),
    order_index: orderIndex,
    title,
    content: {
      variant,
      text:
        variant === "reverse"
          ? "낱말을 보고 알맞은 뜻을 고르세요."
          : variant === "input"
            ? "다음 뜻풀이를 보고 알맞은 낱말을 입력하세요."
            : variant === "synonym"
              ? "다음 낱말과 뜻이 비슷한 말(유의어)을 고르세요."
              : variant === "antonym"
                ? "다음 낱말과 반대되는 말(반의어)을 고르세요."
                : variant === "idiom"
                  ? "다음 관용어/속담의 뜻을 고르세요."
                  : variant === "multi_meaning"
                    ? "다음 뜻풀이와 예문에 해당하는 다의어를 고르세요."
                    : variant === "word_puzzle"
                      ? "힌트를 보고 알맞은 낱말을 고르세요."
                      : "다음 뜻풀이를 보고 알맞은 낱말을 고르세요.",
      clues: entry.meanings,
      meanings: entry.meanings,
      choices,
    },
    answer: {
      correct: variant === "reverse" ? entry.meanings[0] : entry.answer,
      text: entry.answer,
    },
    explanation: `정답은 "${entry.answer}"입니다. ${entry.meanings.join(", ")}`,
    points: 10,
    // 힌트가 정답·이미 보이는 뜻풀이를 그대로 반복하지 않도록 variant별 구성.
    // (기존엔 meanings[0]를 그대로 써서 reverse에선 정답이 힌트로 노출됐음)
    hint: vocabHint(variant, String(entry.answer ?? "")),
    metadata: null,
    created_at: new Date().toISOString(),
  };
}

function vocabHint(variant: string, answerWord: string): string {
  if (variant === "reverse")
    return "이 낱말을 넣어 짧은 문장을 만들어 보면 뜻이 떠올라요!";
  if (variant === "idiom")
    return "예문의 상황을 떠올려 보면 뜻을 짐작할 수 있어요!";
  if (variant === "word_puzzle")
    return "글자 수와 첫·끝 글자 힌트를 다시 살펴보세요!";
  if (answerWord.length > 0)
    return `첫 글자는 '${answerWord[0]}', 모두 ${answerWord.length}글자예요.`;
  return "뜻풀이를 다시 한번 천천히 읽어 보세요!";
}

// Build a knowledge question from real curriculum data
function buildKnowledgeQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: KnowledgeEntry,
  choices: string[],
  variant: string = "fill",
  random?: () => number,
): Question {
  const rng = random || Math.random;
  if (variant === "tf" && tfBlankSafe(entry.text)) {
    let isCorrectStatement = rng() > 0.5;
    const filledText = entry.text.replace("___", entry.answer);
    let displayText = filledText;
    if (!isCorrectStatement) {
      const wrongAnswer = pickTfWrong(entry.answer, choices, rng);
      if (wrongAnswer === null) {
        // 문법이 깨지지 않는 오답 후보가 없으면 참인 문장으로 낸다.
        isCorrectStatement = true;
      } else {
        displayText = entry.text.replace("___", wrongAnswer);
      }
    }
    return {
      id: `q-${setId}-${orderIndex}`,
      daily_set_id: setId,
      curriculum_standard_id: null,
      subject: "general_knowledge" as SubjectType,
      question_type: "true_false" as QuestionType,
      order_index: orderIndex,
      title,
      content: {
        variant: "tf",
        text: displayText,
        category: entry.category,
        choices: [],
      },
      answer: { correct: isCorrectStatement ? "O" : "X", text: entry.answer },
      explanation: filledText,
      points: 10,
      hint: "문장을 천천히 읽고 사실과 맞는지 따져 보세요.",
      metadata: { category: entry.category },
      created_at: new Date().toISOString(),
    };
  }
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "general_knowledge" as SubjectType,
    question_type:
      variant === "input"
        ? ("short_answer" as QuestionType)
        : ("multiple_choice" as QuestionType),
    order_index: orderIndex,
    title,
    // tf 로 뽑혔어도 O/X 문장으로 못 바꾼 빈칸 문항은 4지선다로 낸다 — variant 를 «tf» 로 두면 화면이 O/X 단추를 그려 정답(낱말)을 고를 수 없다.
    content: { variant: variant === "tf" ? "fill" : variant, text: entry.text, category: entry.category, choices },
    answer: { correct: entry.answer, text: entry.answer },
    explanation: `${entry.text.replace("___", entry.answer)}`,
    points: 10,
    hint: fillHint(entry.answer),
    metadata: { category: entry.category },
    created_at: new Date().toISOString(),
  };
}

// Build a safety question from real curriculum data
function buildSafetyQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: SafetyEntry,
  choices: string[],
  variant: string = "fill",
  random?: () => number,
): Question {
  const rng = random || Math.random;
  if (variant === "tf" && tfBlankSafe(entry.text)) {
    let isCorrectStatement = rng() > 0.5;
    const filledText = entry.text.replace("___", entry.answer);
    let displayText = filledText;
    if (!isCorrectStatement) {
      const wrongAnswer = pickTfWrong(entry.answer, choices, rng);
      if (wrongAnswer === null) {
        // 문법이 깨지지 않는 오답 후보가 없으면 참인 문장으로 낸다.
        isCorrectStatement = true;
      } else {
        displayText = entry.text.replace("___", wrongAnswer);
      }
    }
    return {
      id: `q-${setId}-${orderIndex}`,
      daily_set_id: setId,
      curriculum_standard_id: null,
      subject: "safety" as SubjectType,
      question_type: "true_false" as QuestionType,
      order_index: orderIndex,
      title,
      content: {
        variant: "tf",
        text: displayText,
        category: entry.category,
        choices: [],
      },
      answer: { correct: isCorrectStatement ? "O" : "X", text: entry.answer },
      explanation: filledText,
      points: 10,
      hint: "문장을 천천히 읽고 사실과 맞는지 따져 보세요.",
      metadata: { category: entry.category },
      created_at: new Date().toISOString(),
    };
  }
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "safety" as SubjectType,
    question_type:
      variant === "input"
        ? ("short_answer" as QuestionType)
        : ("multiple_choice" as QuestionType),
    order_index: orderIndex,
    title,
    // tf 로 뽑혔어도 O/X 문장으로 못 바꾼 빈칸 문항은 4지선다로 낸다 — variant 를 «tf» 로 두면 화면이 O/X 단추를 그려 정답(낱말)을 고를 수 없다.
    content: { variant: variant === "tf" ? "fill" : variant, text: entry.text, category: entry.category, choices },
    answer: { correct: entry.answer, text: entry.answer },
    explanation: `${entry.text.replace("___", entry.answer)}`,
    points: 10,
    hint: fillHint(entry.answer),
    metadata: { category: entry.category },
    created_at: new Date().toISOString(),
  };
}

// Build a writing prompt question
function buildWritingQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  prompt: string,
  grade: number,
): Question {
  const minChars = grade <= 2 ? 20 : grade <= 4 ? 50 : 100;
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "writing" as SubjectType,
    question_type: "writing_prompt" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      prompt,
      min_chars: minChars,
    },
    answer: { type: "free_text" },
    explanation: null,
    points: 10,
    hint: "떠오르는 생각을 자유롭게 써 보세요!",
    metadata: { minChars },
    created_at: new Date().toISOString(),
  };
}

// Build a hanja question with variant types
type HanjaVariant = "reading" | "meaning" | "character" | "word" | "writing";

// 한자 뜻(훈) 정규화: "쇠 철"(meaning) + reading"철" → "쇠"
// (음 맞추기/뜻 맞추기에서 답이 노출되던 문제 + 정답/보기 형식 불일치 차단)
function cleanHanjaMeaning(meaning: string, reading: string): string {
  return (
    meaning.replace(new RegExp("\\s*" + reading + "\\s*$"), "").trim() || meaning
  );
}

function buildHanjaQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: HanjaEntry,
  choices: string[],
  variant: HanjaVariant = "reading",
): Question {
  // 뜻(훈) 필드에 음이 섞여 들어간 데이터 정규화 (보기 풀도 호출부에서 동일 정규화)
  entry = { ...entry, meaning: cleanHanjaMeaning(entry.meaning, entry.reading) };

  const base = {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "hanja" as SubjectType,
    order_index: orderIndex,
    title,
    points: 10,
    metadata: { strokes: entry.strokes, sentence: entry.sentence, variant },
    created_at: new Date().toISOString(),
  };

  const q = (w: string) => `'${w}'`;
  const explanation = `${withJosa(entry.character, "은/는", entry.reading)} ${withJosa(q(entry.meaning), "으로/로", entry.meaning)} ${withJosa(q(entry.reading), "이라/라", entry.reading)} 읽습니다. 예: ${entry.words.join(", ")}`;
  // 힌트에 쓸 예시 낱말 — 정답(뜻·음)과 같은 낱말은 답을 그대로 알려 주므로 피한다
  const hintWord = entry.words.find((w) => w !== entry.meaning && !w.includes(entry.meaning)) ?? null;

  switch (variant) {
    case "reading": // 음 맞추기 (4지선다)
      return {
        ...base,
        question_type: "multiple_choice" as QuestionType,
        content: {
          variant: "reading",
          text: `${entry.character}(${entry.meaning}): 이 한자의 음(소리)은?`,
          character: entry.character,
          meaning: entry.meaning,
          reading: entry.reading,
          strokes: entry.strokes,
          words: entry.words,
          sentence: entry.sentence,
          choices,
        },
        answer: { correct: entry.reading, text: entry.reading },
        explanation,
        // 뜻은 문제에 이미 표시됨 → 예시 낱말로 음을 유추하게 한다
        hint: `${withJosa(q(entry.words[0]), "이라는/라는", entry.words[0])} 낱말에 이 한자가 들어가요.`,
      };

    case "meaning": // 뜻 맞추기 (4지선다)
      return {
        ...base,
        question_type: "multiple_choice" as QuestionType,
        content: {
          variant: "meaning",
          text: `${entry.character}(${entry.reading}): 이 한자의 뜻(훈)은?`,
          character: entry.character,
          meaning: entry.meaning,
          reading: entry.reading,
          strokes: entry.strokes,
          words: entry.words,
          choices,
        },
        answer: { correct: entry.meaning, text: entry.meaning },
        explanation,
        hint: hintWord
          ? `${withJosa(q(hintWord), "이라는/라는", hintWord)} 낱말에 쓰이는 한자예요. 낱말의 뜻을 떠올려 보세요.`
          : `획수가 ${entry.strokes}획인 글자예요. 이 한자가 쓰인 낱말을 떠올려 보세요.`,
      };

    case "character": // 한자 맞추기 (4지선다)
      return {
        ...base,
        question_type: "multiple_choice" as QuestionType,
        content: {
          variant: "character",
          text: `'${entry.meaning}' = '${entry.reading}': 맞는 한자는?`,
          character: entry.character,
          meaning: entry.meaning,
          reading: entry.reading,
          strokes: entry.strokes,
          words: entry.words,
          choices,
        },
        answer: { correct: entry.character, text: entry.character },
        explanation,
        hint: `획수가 ${entry.strokes}획인 글자예요.`,
      };

    case "word": // 단어 맞추기 (4지선다)
      return {
        ...base,
        question_type: "multiple_choice" as QuestionType,
        content: {
          variant: "word",
          text: `${withJosa(`${entry.character}(${entry.meaning}/${entry.reading})`, "이/가", entry.reading)} 들어간 단어는?`,
          character: entry.character,
          meaning: entry.meaning,
          reading: entry.reading,
          strokes: entry.strokes,
          words: entry.words,
          choices,
        },
        answer: {
          correct:
            choices.find((c) => entry.words.includes(c)) || entry.words[0],
          text: entry.words[0],
        },
        explanation: `${withJosa(`${entry.character}(${entry.reading})`, "이/가", entry.reading)} 들어간 단어: ${entry.words.join(", ")}`,
        hint: `${withJosa(q(entry.reading), "이/가", entry.reading)} 들어간 단어를 찾아보세요.`,
      };

    case "writing": // 따라쓰기 (직접 입력)
      return {
        ...base,
        question_type: "short_answer" as QuestionType,
        content: {
          variant: "writing",
          text: `${entry.character}(${entry.meaning}): 음을 직접 써보세요`,
          character: entry.character,
          meaning: entry.meaning,
          reading: entry.reading,
          strokes: entry.strokes,
          words: entry.words,
          sentence: entry.sentence,
          choices: [],
        },
        answer: { correct: entry.reading, text: entry.reading },
        explanation,
        // 기존 힌트는 정답 음('안' 등)을 그대로 노출했음 → 낱말 힌트로 교체
        hint: `${withJosa(q(entry.words[0]), "이라는/라는", entry.words[0])} 낱말에 이 한자의 음이 들어 있어요.`,
      };
  }
}

// Build an english question from EnglishEntry data
function buildEnglishQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  entry: EnglishEntry,
  choices: string[],
  variant: string = "word",
): Question {
  // 결과·오답노트 화면(ResultScreen)은 content.text 를 보여준다. 학습 화면이 밑줄을 그릴 때
  // text 만 다른 문구면 같은 문제가 두 지시문으로 보인다 → 밑줄 여부에 맞춰 문구를 맞춘다.
  const underlined = canUnderline(entry);
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject: "english" as SubjectType,
    question_type:
      variant === "input"
        ? ("short_answer" as QuestionType)
        : ("multiple_choice" as QuestionType),
    order_index: orderIndex,
    title,
    content: {
      variant,
      text:
        variant === "meaning"
          ? `${meaningPrompt(underlined)}.\n"${getMeaningText(entry)}"${
              underlined ? ` (밑줄: ${entry.targetKo})` : ""
            }`
          : variant === "input"
            ? `다음 문장의 빈칸에 알맞은 영단어를 입력하세요.\n"${entry.sentence}"`
            : `다음 문장의 빈칸에 알맞은 영단어를 고르세요.\n"${entry.sentence.replace(
                new RegExp(
                  `\\b${entry.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
                  "i",
                ),
                "_____",
              )}"\n뜻: ${entry.translation}`,
      sentence: entry.sentence,
      word: entry.word,
      translation: entry.translation,
      targetKo: entry.targetKo,
      pronunciation: entry.pronunciation,
      practice: entry.practice,
      choices,
    },
    answer: { correct: entry.word, text: entry.word },
    explanation: `"${entry.sentence}" → ${entry.translation}`,
    points: 10,
    // 발음 힌트는 화면에 이미 표시되거나(word/input) 정답 단어를 사실상
    // 읽어주는 것(meaning)이라 변형별로 다르게 준다.
    hint:
      variant === "word"
        ? `문장의 뜻: ${entry.translation}`
        : `'${entry.word[0]}'(으)로 시작하는 단어예요.`,
    metadata: { word: entry.word },
    created_at: new Date().toISOString(),
  };
}

function buildReadingQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  subject: SubjectType,
  entry: ReadingEntry,
  random?: () => number,
): Question {
  const rng = random || Math.random;
  const shuffled = [...entry.choices].sort(() => rng() - 0.5);
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject,
    question_type: "multiple_choice" as QuestionType,
    order_index: orderIndex,
    title,
    content: {
      variant: "reading",
      passage: entry.passage,
      text: entry.question,
      category: entry.category,
      choices: shuffled,
    },
    answer: { correct: entry.correct, text: entry.correct },
    explanation: `지문: ${entry.passage.substring(0, 50)}...`,
    points: 10,
    hint: `지문을 다시 한번 읽어보세요!`,
    metadata: { category: entry.category },
    created_at: new Date().toISOString(),
  };
}

// Generic builder for subject-specific KnowledgeEntry data (korean, creative, science, social)
function buildSubjectQuestion(
  setId: string,
  orderIndex: number,
  title: string,
  subject: SubjectType,
  entry: KnowledgeEntry,
  hintPrefix: string,
  choices: string[],
  variant: string = "fill",
  random?: () => number,
): Question {
  const rng = random || Math.random;
  if (variant === "tf" && tfBlankSafe(entry.text)) {
    let isCorrectStatement = rng() > 0.5;
    const filledText = entry.text.replace("___", entry.answer);
    let displayText = filledText;
    if (!isCorrectStatement) {
      const wrongAnswer = pickTfWrong(entry.answer, choices, rng);
      if (wrongAnswer === null) {
        // 문법이 깨지지 않는 오답 후보가 없으면 참인 문장으로 낸다.
        isCorrectStatement = true;
      } else {
        displayText = entry.text.replace("___", wrongAnswer);
      }
    }
    return {
      id: `q-${setId}-${orderIndex}`,
      daily_set_id: setId,
      curriculum_standard_id: null,
      subject,
      question_type: "true_false" as QuestionType,
      order_index: orderIndex,
      title,
      content: {
        variant: "tf",
        text: displayText,
        category: entry.category,
        choices: [],
      },
      answer: { correct: isCorrectStatement ? "O" : "X", text: entry.answer },
      explanation: filledText,
      points: 10,
      hint: "문장을 천천히 읽고 사실과 맞는지 따져 보세요.",
      metadata: { category: entry.category },
      created_at: new Date().toISOString(),
    };
  }
  return {
    id: `q-${setId}-${orderIndex}`,
    daily_set_id: setId,
    curriculum_standard_id: null,
    subject,
    question_type:
      variant === "input"
        ? ("short_answer" as QuestionType)
        : ("multiple_choice" as QuestionType),
    order_index: orderIndex,
    title,
    // tf 로 뽑혔어도 O/X 문장으로 못 바꾼 빈칸 문항은 4지선다로 낸다 — variant 를 «tf» 로 두면 화면이 O/X 단추를 그려 정답(낱말)을 고를 수 없다.
    content: { variant: variant === "tf" ? "fill" : variant, text: entry.text, category: entry.category, choices },
    answer: { correct: entry.answer, text: entry.answer },
    explanation: entry.text.replace("___", entry.answer),
    points: 10,
    hint: fillHint(entry.answer),
    metadata: { category: entry.category },
    created_at: new Date().toISOString(),
  };
}


function countRepeatedQuestions(
  questions: Question[],
  usedQuestionSignatures?: Set<string>,
): number {
  if (!usedQuestionSignatures || usedQuestionSignatures.size === 0) {
    return 0;
  }

  return questions.reduce((count, question) => {
    const signature = getQuestionSignature(question);
    if (!signature || !usedQuestionSignatures.has(signature)) {
      return count;
    }
    return count + 1;
  }, 0);
}

/**
 * Generate a daily set that the student has NOT completed yet.
 * @param completedSetIds - set IDs the student already completed (from learning records)
 */
/**
 * 세트가 문항을 꺼내 오는 풀(문제 은행)을 만든다 — 생성 + 조사 맞춤 + 학년 초과 거르기 + 낱말 변형 풀 + 문항 검수 반영.
 * 전수검수 덤프(scripts/audit/dump-review-entries.ts)도 이 함수를 그대로 부른다(앱과 덤프가 같은 길을 지나야 검수가 맞물린다).
 */
export function buildPools(
  grade: number,
  semester: number,
  finalSeed: number,
  subjectAccuracy?: Record<string, { accuracy: number }>,
  opts: { review?: boolean } = {},
): GradeData {
  const data = getGradeData(grade, semester, finalSeed, subjectAccuracy);
  // 빈칸 문장의 «___ 뒤 조사»를 정답 받침에 맞춘다(표시 문장·해설·O/X 가 모두 이 text 를 쓴다)
  const fitJosa = <T extends { text: string; answer: string }>(arr?: T[]) =>
    arr?.map((e) => (e && typeof e.text === "string" && typeof e.answer === "string" ? { ...e, text: fitBlankJosa(e.text, e.answer) } : e));
  data.knowledge = fitJosa(data.knowledge)!;
  data.safety = fitJosa(data.safety as unknown as { text: string; answer: string }[]) as unknown as typeof data.safety;
  data.science = fitJosa(data.science);
  data.social = fitJosa(data.social);
  data.creative = fitJosa(data.creative);
  data.korean = fitJosa(data.korean);

  // 초등 교육과정 초과(중등) 개념 문항 제거 — 전 과목 풀 적용(저학년엔 해당 없음).
  // 필터 후 풀이 비면(폴백) 원본을 유지해 문항 부족을 방지(filterAboveGrade 내부 처리).
  if (data.science)
    data.science = filterAboveGrade(data.science, (e) => `${e.text} ${e.answer}`);
  if (data.social)
    data.social = filterAboveGrade(data.social, (e) => `${e.text} ${e.answer}`);
  if (data.creative)
    data.creative = filterAboveGrade(data.creative, (e) => `${e.text} ${e.answer}`);
  data.knowledge = filterAboveGrade(data.knowledge, (e) => `${e.text} ${e.answer}`);

  if (data.korean)
    data.korean = filterAboveGrade(data.korean, (e) => `${e.text} ${e.answer}`);
  if (data.koreanReading)
    data.koreanReading = filterAboveGrade(
      data.koreanReading,
      (e) =>
        `${e.passage} ${e.question} ${(e.choices || []).join(" ")} ${e.correct}`,
    );
  data.vocab = filterAboveGrade(
    data.vocab,
    (e) => `${(e.meanings || []).join(" ")} ${e.answer}`,
  );
  data.safety = filterAboveGrade(data.safety, (e) => `${e.text} ${e.answer}`);
  if (data.english)
    data.english = filterAboveGrade(
      data.english,
      (e) =>
        `${e.sentence} ${e.translation} ${e.word} ${e.targetKo || ""}`,
    );
  if (data.hanja)
    data.hanja = filterAboveGrade(
      data.hanja,
      (e) => `${e.meaning} ${e.sentence} ${(e.words || []).join(" ")}`,
    );
  data.spelling = filterAboveGrade(
    data.spelling,
    (e) => `${e.q1} ${e.q2} ${e.explanation}`,
  );
  data.writing = filterAboveGrade(data.writing, (e) => e);

  // Attach new vocab variant pools
  data.synonymPairs = getSynonymPairs(grade, finalSeed);
  data.antonymPairs = getAntonymPairs(grade, finalSeed);
  data.idioms = getIdiomEntries(grade, finalSeed);
  data.multiMeaningWords = getMultiMeaningWords(grade, finalSeed);
  data.wordPuzzles = getWordPuzzles(grade, finalSeed);
  if (opts.review !== false) applyContentReview(data as unknown as Record<string, unknown>, grade);
  return data;
}

export function generateDailySet(
  grade: number,
  semester: number,
  completedSetIds?: Set<string>,
  subjectAccuracy?: Record<string, { accuracy: number }>,
): DailySetWithQuestions {
  const dayOfYear = getDayOfYear();

  // Try current day's seed first, then increment to find an unused set
  let attempt = 0;
  const baseSeed = dayOfYear;
  let setId = "";

  // Try up to 1000 different seeds to find a set the student hasn't done
  while (attempt < 1000) {
    const candidateSeed = baseSeed + attempt;
    setId = `set-${grade}-${semester}-${candidateSeed}`;
    if (!completedSetIds || !completedSetIds.has(setId)) {
      break;
    }
    attempt++;
  }

  const finalSeed = baseSeed + attempt;
  const seed = finalSeed * 1000 + grade * 100 + semester;
  const random = seededRandom(seed);
  const gradeGroup = getGradeGroup(grade);
  const composition = GRADE_SET_COMPOSITION[gradeGroup];
  const data = buildPools(grade, semester, finalSeed, subjectAccuracy);

  const setNumber = (finalSeed % 10000) + 1;

  const dailySet: DailySet = {
    id: setId,
    grade,
    semester,
    set_number: setNumber,
    title: `${grade}학년 ${semester}학기 #${setNumber}`,
    description: "오늘의 아침학습",
    estimated_minutes: Math.round(composition.totalQuestions * 2),
    total_questions: composition.totalQuestions,
    total_points: composition.totalQuestions * 10,
    is_published: true,
    created_at: new Date().toISOString(),
  };

  const questions: Question[] = [];
  let orderIndex = 0;

  // Track which items have been used so we don't pick duplicates within a set
  const usedIndices: Record<string, Set<number>> = {};

  function pickUnused<T>(arr: T[], key: string): T {
    if (!arr || arr.length === 0) {
      throw new Error(`No data available for ${key}`);
    }
    if (!usedIndices[key]) usedIndices[key] = new Set();
    const used = usedIndices[key];
    const available = arr
      .map((item, i) => ({ item, i }))
      .filter(({ i }) => !used.has(i));
    if (available.length === 0) {
      const idx = Math.floor(random() * arr.length);
      return arr[idx];
    }
    const pick = available[Math.floor(random() * available.length)];
    used.add(pick.i);
    return pick.item;
  }

  for (const section of composition.sections) {
    for (let i = 0; i < section.count; i++) {
      const subject = section.subject;

      if (subject === "emotion_check") {
        questions.push(buildEmotionQuestion(setId, orderIndex, section.title));
      } else if (subject === "readiness_check") {
        questions.push(
          buildReadinessQuestion(setId, orderIndex, section.title, gradeGroup),
        );
      } else if (subject === "math") {
        const entry = pickUnused(data.math, "math");
        const rawExpr = entry.expression || "";
        const legend = parseLegendChoices(rawExpr, Number(entry.answer));
        if (entry.type === "time") {
          // 시각: 보기·정답을 'H시 M분' 라벨로("300" 인코딩 비표시·비정상 시각 차단)
          const t = timeMathChoices(Number(entry.answer), random);
          questions.push(
            buildMathQuestion(
              setId,
              orderIndex,
              section.title,
              entry,
              t.choices,
              "choice",
              { correct: t.correct },
              grade,
            ),
          );
        } else if (legend) {
          // 번호 범례 "(1: 연필, 2: 귤)" → 실제 라벨 보기(무의미 번호 보기 제거)
          questions.push(
            buildMathQuestion(
              setId,
              orderIndex,
              section.title,
              entry,
              legend.choices,
              "choice",
              { correct: legend.correct, expression: legend.expression },
              grade,
            ),
          );
        } else {
          const mathVariants: Array<
            "choice" | "choice" | "input" | "reverse"
          > = ["choice", "choice", "input", "reverse"];
          const mv = mathVariants[Math.floor(random() * mathVariants.length)];
          // reverse는 첫 수가 결과로부터 유일하게 복원되는 식만 허용(몫/나머지·소수·문장형 제외).
          // 불가하면 choice로 폴백 → 정답이 보기에 없거나 다른 수가 정답으로 표기되는 결함 방지.
          const revFirst =
            mv === "reverse"
              ? reverseFirstOperand(rawExpr, Number(entry.answer))
              : null;
          const effVariant: "choice" | "input" | "reverse" =
            mv === "reverse" && revFirst == null ? "choice" : mv;
          const choiceBase =
            effVariant === "reverse" && revFirst
              ? Number(revFirst)
              : Number(entry.answer);
          const choices =
            effVariant === "input"
              ? []
              : generateMathChoices(choiceBase, random);
          questions.push(
            buildMathQuestion(
              setId,
              orderIndex,
              section.title,
              entry,
              choices,
              effVariant,
              undefined,
              grade,
            ),
          );
        }
      } else if (subject === "spelling") {
        const entry = pickUnused(data.spelling, "spelling");
        const spellingVariants: Array<"sentence" | "word" | "correct"> = [
          "sentence",
          "sentence",
          "word",
          "correct",
        ];
        const variant =
          spellingVariants[Math.floor(random() * spellingVariants.length)];
        const choices = generateSpellingChoices(entry, data.spelling, random);
        questions.push(
          buildSpellingQuestion(
            setId,
            orderIndex,
            section.title,
            entry,
            choices,
            variant,
            data.spelling,
            random,
          ),
        );
      } else if (subject === "vocabulary") {
        // Expanded variant pool with new question types
        const vvariants = [
          "clue",
          "clue",
          "reverse",
          "input",
          "synonym",
          "antonym",
          "idiom",
          "multi_meaning",
          "word_puzzle",
        ];
        const vv = vvariants[Math.floor(random() * vvariants.length)];

        // Handle new variant types
        if (
          vv === "synonym" &&
          data.synonymPairs &&
          data.synonymPairs.length > 0
        ) {
          const idx = Math.floor(random() * data.synonymPairs.length);
          const pair = data.synonymPairs[idx];
          const askWord1 = random() > 0.5;
          const questionWord = askWord1 ? pair.word1 : pair.word2;
          const answerWord = askWord1 ? pair.word2 : pair.word1;
          // Generate wrong choices from other synonym pairs
          const wrongChoices = data.synonymPairs
            .filter((_, i) => i !== idx)
            .map((p) => (random() > 0.5 ? p.word1 : p.word2))
            .filter((w) => w !== answerWord);
          const choices = [
            answerWord,
            ...rankByCloseLength(wrongChoices, answerWord.length, random).slice(
              0,
              3,
            ),
          ];
          shuffleArrayInPlace(choices, random);
          questions.push(
            buildVocabQuestion(
              setId,
              orderIndex,
              section.title,
              {
                meanings: [
                  pair.meaning,
                  `"${questionWord}"과(와) 뜻이 비슷한 말`,
                ],
                answer: answerWord,
              },
              choices,
              "synonym",
            ),
          );
        } else if (
          vv === "antonym" &&
          data.antonymPairs &&
          data.antonymPairs.length > 0
        ) {
          const idx = Math.floor(random() * data.antonymPairs.length);
          const pair = data.antonymPairs[idx];
          const askWord1 = random() > 0.5;
          const questionWord = askWord1 ? pair.word1 : pair.word2;
          const answerWord = askWord1 ? pair.word2 : pair.word1;
          const wrongChoices = data.antonymPairs
            .filter((_, i) => i !== idx)
            .map((p) => (random() > 0.5 ? p.word1 : p.word2))
            .filter((w) => w !== answerWord);
          const choices = [
            answerWord,
            ...rankByCloseLength(wrongChoices, answerWord.length, random).slice(
              0,
              3,
            ),
          ];
          shuffleArrayInPlace(choices, random);
          questions.push(
            buildVocabQuestion(
              setId,
              orderIndex,
              section.title,
              {
                meanings: [
                  // 정답어(answerWord)의 뜻을 보여야 함 (질문어 뜻이 아니라)
                  askWord1 ? pair.meaning2 : pair.meaning1,
                  `"${questionWord}"의 반대말`,
                ],
                answer: answerWord,
              },
              choices,
              "antonym",
            ),
          );
        } else if (vv === "idiom" && data.idioms && data.idioms.length > 0) {
          const idx = Math.floor(random() * data.idioms.length);
          const idiom = data.idioms[idx];
          const wrongChoices = data.idioms
            .filter((_, i) => i !== idx)
            .map((id) => id.meaning);
          const choices = [
            idiom.meaning,
            ...rankByCloseLength(
              wrongChoices,
              idiom.meaning.length,
              random,
            ).slice(0, 3),
          ];
          shuffleArrayInPlace(choices, random);
          questions.push(
            buildVocabQuestion(
              setId,
              orderIndex,
              section.title,
              {
                meanings: [idiom.expression, idiom.example],
                answer: idiom.meaning,
              },
              choices,
              "idiom",
            ),
          );
        } else if (
          vv === "multi_meaning" &&
          data.multiMeaningWords &&
          data.multiMeaningWords.length > 0
        ) {
          const idx = Math.floor(random() * data.multiMeaningWords.length);
          const mmw = data.multiMeaningWords[idx];
          // Pick one meaning and ask which word has this meaning
          const mIdx = Math.floor(random() * mmw.meanings.length);
          const correctMeaning = mmw.meanings[mIdx];
          // generateChoices는 normForDup 기반 근사중복까지 걸러내므로 4지선다
          // 중복 보기(같은 오답이 2~3번 노출)를 막는다(수동 filter로는 부족했음).
          const choices = generateChoices(
            mmw.word,
            data.vocab,
            (v) => v.answer,
            random, undefined, undefined, mmw,
          );
          questions.push(
            buildVocabQuestion(
              setId,
              orderIndex,
              section.title,
              {
                meanings: [
                  correctMeaning.meaning,
                  // 예문에 정답 낱말이 그대로 있으면 답을 보여 주는 셈이다 → 그 자리를 빈칸으로 가린다
                  `예문: ${correctMeaning.example.replace(new RegExp(`(?<![가-힣])${mmw.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g"), "___")}`,
                ],
                answer: mmw.word,
              },
              choices,
              "multi_meaning",
            ),
          );
        } else if (
          vv === "word_puzzle" &&
          data.wordPuzzles &&
          data.wordPuzzles.length > 0
        ) {
          const idx = Math.floor(random() * data.wordPuzzles.length);
          const puzzle = data.wordPuzzles[idx];
          // generateChoices는 normForDup 기반 근사중복까지 걸러내므로 4지선다
          // 중복 보기(같은 오답이 2~3번 노출)를 막는다(수동 filter로는 부족했음).
          const choices = generateChoices(
            puzzle.word,
            data.vocab,
            (v) => v.answer,
            random, undefined, undefined, puzzle,
          );
          questions.push(
            buildVocabQuestion(
              setId,
              orderIndex,
              section.title,
              {
                meanings: [
                  puzzle.meaning,
                  `${puzzle.letterCount}글자, 첫 글자: ${puzzle.firstLetter}, 끝 글자: ${puzzle.lastLetter}`,
                ],
                answer: puzzle.word,
              },
              choices,
              "word_puzzle",
            ),
          );
        } else {
          // Fallback to existing variants
          const fallbackVv = ["clue", "clue", "reverse"][
            Math.floor(random() * 3)
          ];
          const entry = pickUnused(data.vocab, "vocab");
          let choices: string[];
          if (fallbackVv === "reverse") {
            choices = generateChoices(
              entry.meanings[0],
              data.vocab,
              (v) => v.meanings[0],
              random, undefined, undefined, entry,
            );
          } else if (fallbackVv === "input") {
            choices = [];
          } else {
            choices = generateChoices(
              entry.answer,
              data.vocab,
              (v) => v.answer,
              random, undefined, undefined, entry,
            );
          }
          questions.push(
            buildVocabQuestion(
              setId,
              orderIndex,
              section.title,
              entry,
              choices,
              fallbackVv,
            ),
          );
        }
      } else if (subject === "general_knowledge") {
        const entry = pickUnused(data.knowledge, "knowledge");
        const kvariants = ["fill", "fill", "fill", "tf"];
        const kv = kvariants[Math.floor(random() * kvariants.length)];
        const choices = generateChoices(
          entry.answer,
          data.knowledge,
          (k) => k.answer,
          random,
          entry.category,
          (k) => k.category, entry,
        );
        questions.push(
          buildKnowledgeQuestion(
            setId,
            orderIndex,
            section.title,
            entry,
            choices,
            kv,
            random,
          ),
        );
      } else if (subject === "safety") {
        const entry = pickUnused(data.safety, "safety");
        const svariants = ["fill", "fill", "fill", "tf"];
        const sv = svariants[Math.floor(random() * svariants.length)];
        const choices = generateChoices(
          entry.answer,
          data.safety,
          (s) => s.answer,
          random,
          entry.category,
          (s) => s.category, entry,
        );
        questions.push(
          buildSafetyQuestion(
            setId,
            orderIndex,
            section.title,
            entry,
            choices,
            sv,
            random,
          ),
        );
      } else if (subject === "writing") {
        const prompt = pickUnused(data.writing, "writing");
        questions.push(
          buildWritingQuestion(setId, orderIndex, section.title, prompt, grade),
        );
      } else if (subject === "hanja" && data.hanja && data.hanja.length > 0) {
        const entry = pickUnused(data.hanja, "hanja");
        const hvariants: HanjaVariant[] = [
          "reading",
          "meaning",
          "character",
          "word",
          "writing",
        ];
        const hvariant = hvariants[Math.floor(random() * hvariants.length)];
        let hchoices: string[];
        if (hvariant === "meaning") {
          // 정답·보기 모두 동일 정규화(훈만) → 정답이 보기에 반드시 포함되고
          // "있을 유" 같은 음 노출도 차단
          hchoices = generateChoices(
            cleanHanjaMeaning(entry.meaning, entry.reading),
            data.hanja,
            (h) => cleanHanjaMeaning(h.meaning, h.reading),
            random, undefined, undefined, entry,
          );
        } else if (hvariant === "character") {
          hchoices = generateChoices(
            entry.character,
            data.hanja,
            (h) => h.character,
            random, undefined, undefined, entry,
          );
        } else if (hvariant === "word") {
          const cw = entry.words[Math.floor(random() * entry.words.length)];
          const ow = [
            ...new Set(
              data.hanja
                .filter((h) => h.character !== entry.character)
                .flatMap((h) => h.words)
                .filter((w) => !entry.words.includes(w)),
            ),
          ];
          for (let i = ow.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [ow[i], ow[j]] = [ow[j], ow[i]];
          }
          const ds = ow.slice(0, 3);
          while (ds.length < 3) ds.push(`${cw}(아님)`);
          hchoices = [cw, ...ds];
          for (let i = hchoices.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [hchoices[i], hchoices[j]] = [hchoices[j], hchoices[i]];
          }
        } else if (hvariant === "writing") {
          hchoices = [];
        } else {
          hchoices = generateChoices(
            entry.reading,
            data.hanja,
            (h) => h.reading,
            random, undefined, undefined, entry,
          );
        }
        questions.push(
          buildHanjaQuestion(
            setId,
            orderIndex,
            section.title,
            entry,
            hchoices,
            hvariant,
          ),
        );
      } else if (
        subject === "english" &&
        data.english &&
        data.english.length > 0
      ) {
        // 빈칸 문제는 정답 낱말이 문장에 «그대로» 있어야 빈칸이 생긴다(animal ↔ animals 면 빈칸 없는 문제가 된다).
        const hasWholeWord = (e: EnglishEntry) =>
          new RegExp(`\\b${e.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(e.sentence);
        let entry = pickUnused(data.english, "english");
        for (let k = 0; k < 6 && !hasWholeWord(entry) && !canUnderline(entry); k++) {
          entry = pickUnused(data.english, "english");
        }
        // 'meaning' 변형은 번역문의 낱말에 밑줄을 긋고 "밑줄 친 낱말"을 가리킨다.
        // 밑줄 대상(targetKo)이 번역문에 실제로 없는 엔트리(대화·문장완성 등 통문장 항목)는
        // 밑줄이 하나도 안 그려져 지시문이 거짓말이 된다 → 그런 엔트리는 'word'로 돌린다.
        const entryCanUnderline = canUnderline(entry);
        const evariants = ["word", "word", "word", "meaning"];
        let ev = evariants[Math.floor(random() * evariants.length)];
        if (ev === "meaning" && !entryCanUnderline) ev = "word";
        if (ev === "word" && !hasWholeWord(entry) && entryCanUnderline) ev = "meaning";
        const choices = generateChoices(
          entry.word,
          data.english,
          (e) => e.word,
          random, undefined, undefined, entry,
        );
        questions.push(
          buildEnglishQuestion(
            setId,
            orderIndex,
            section.title,
            entry,
            choices,
            ev,
          ),
        );
      } else if (subject === "korean") {
        // 독해(reading) variant: 지문 읽고 4지선다
        const hasKorean = data.korean && data.korean.length > 0;
        const hasReading = data.koreanReading && data.koreanReading.length > 0;

        if (!hasKorean && !hasReading) {
          throw new Error(`No korean data available for grade ${grade}`);
        }

        const skv = hasKorean
          ? ["fill", "fill", "tf", "input", "reading", "reading"]
          : ["reading"];
        const skvar = skv[Math.floor(random() * skv.length)];

        if (skvar === "reading" && hasReading) {
          const readingEntry = pickUnused(data.koreanReading!, "koreanReading");
          questions.push(
            buildReadingQuestion(
              setId,
              orderIndex,
              section.title,
              "korean" as SubjectType,
              readingEntry,
              random,
            ),
          );
        } else if (hasKorean) {
          const entry = pickUnused(data.korean!, "korean");
          const pool = data.korean!;
          const fallbackVar = ["fill", "fill", "fill", "tf"];
          const fv = fallbackVar[Math.floor(random() * fallbackVar.length)];
          const choices = generateChoices(
            entry.answer,
            pool,
            (k) => k.answer,
            random, undefined, undefined, entry,
          );
          questions.push(
            buildSubjectQuestion(
              setId,
              orderIndex,
              section.title,
              "korean" as SubjectType,
              entry,
              "국어",
              choices,
              fv,
              random,
            ),
          );
        } else if (hasReading) {
          const readingEntry = pickUnused(data.koreanReading!, "koreanReading");
          questions.push(
            buildReadingQuestion(
              setId,
              orderIndex,
              section.title,
              "korean" as SubjectType,
              readingEntry,
              random,
            ),
          );
        } else {
          // 이 분기는 위의 early return으로 인해 도달할 수 없지만 안전장치로 유지
          throw new Error(
            `Unable to generate korean question for grade ${grade}`,
          );
        }
      } else if (
        subject === "creative" &&
        data.creative &&
        data.creative.length > 0
      ) {
        const entry = pickUnused(data.creative, "creative");
        const pool = data.creative!;
        const skv = ["fill", "fill", "fill", "tf"];
        const skvar = skv[Math.floor(random() * skv.length)];
        const choices = generateChoices(
          entry.answer,
          pool,
          (k) => k.answer,
          random,
          entry.category,
          (k) => k.category, entry,
        );
        questions.push(
          buildSubjectQuestion(
            setId,
            orderIndex,
            section.title,
            "creative" as SubjectType,
            entry,
            "창의",
            choices,
            skvar,
            random,
          ),
        );
      } else if (
        subject === "science" &&
        data.science &&
        data.science.length > 0
      ) {
        const entry = pickUnused(data.science, "science");
        const pool = data.science!;
        const skv = ["fill", "fill", "fill", "tf"];
        const skvar = skv[Math.floor(random() * skv.length)];
        const choices = generateChoices(
          entry.answer,
          pool,
          (k) => k.answer,
          random,
          entry.category,
          (k) => k.category, entry,
        );
        questions.push(
          buildSubjectQuestion(
            setId,
            orderIndex,
            section.title,
            "science" as SubjectType,
            entry,
            "과학",
            choices,
            skvar,
            random,
          ),
        );
      } else if (
        subject === "social" &&
        data.social &&
        data.social.length > 0
      ) {
        const entry = pickUnused(data.social, "social");
        const pool = data.social!;
        const skv = ["fill", "fill", "fill", "tf"];
        const skvar = skv[Math.floor(random() * skv.length)];
        const choices = generateChoices(
          entry.answer,
          pool,
          (k) => k.answer,
          random,
          entry.category,
          (k) => k.category, entry,
        );
        questions.push(
          buildSubjectQuestion(
            setId,
            orderIndex,
            section.title,
            "social" as SubjectType,
            entry,
            "사회",
            choices,
            skvar,
            random,
          ),
        );
      } else {
        // Fallback: use knowledge data as generic question
        const entry = pickUnused(data.knowledge, "knowledge_fallback");
        const skv = ["fill", "fill", "fill", "tf"];
        const skvar = skv[Math.floor(random() * skv.length)];
        const choices = generateChoices(
          entry.answer,
          data.knowledge,
          (k) => k.answer,
          random,
          entry.category,
          (k) => k.category, entry,
        );
        questions.push(
          buildSubjectQuestion(
            setId,
            orderIndex,
            section.title,
            (subject as SubjectType) || ("general_knowledge" as SubjectType),
            entry,
            "",
            choices,
            skvar,
            random,
          ),
        );
      }

      orderIndex++;
    }
  }

  return { set: dailySet, questions: polishQuestionsKorean(questions) };
}

export function generateDailySetWithoutRepeats(
  grade: number,
  semester: number,
  completedSetIds?: Set<string>,
  usedQuestionSignatures?: Set<string>,
  maxAttempts = 200,
  subjectAccuracy?: Record<string, { accuracy: number }>,
): DailySetWithQuestions {
  if (!usedQuestionSignatures || usedQuestionSignatures.size === 0) {
    return generateDailySet(grade, semester, completedSetIds, subjectAccuracy);
  }

  const triedSetIds = new Set(completedSetIds ?? []);
  let bestCandidate: DailySetWithQuestions | null = null;
  let bestRepeatCount = Number.POSITIVE_INFINITY;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateDailySet(
      grade,
      semester,
      triedSetIds,
      subjectAccuracy,
    );
    triedSetIds.add(candidate.set.id);

    const repeatCount = countRepeatedQuestions(
      candidate.questions,
      usedQuestionSignatures,
    );

    if (repeatCount < bestRepeatCount) {
      bestCandidate = candidate;
      bestRepeatCount = repeatCount;
    }

    if (repeatCount === 0) {
      return candidate;
    }
  }

  return (
    bestCandidate ??
    generateDailySet(grade, semester, completedSetIds, subjectAccuracy)
  );
}

export { getQuestionSignature };
