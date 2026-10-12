/**
 * 한국어 조사·계사 받침 규칙 자동 보정 유틸.
 *
 * 제너레이터 템플릿이 `을(를)`, `은(는)`, `이(가)`, `와(과)`, `으로(로)` 같은
 * 리터럴 플레이스홀더를 그대로 내보내던 버그(학생 화면에 "정원을(를)" 노출)를
 * 받침 유무 기준으로 올바른 조사 하나로 치환한다. 한글 음절과 숫자(한국어 읽기) 모두 처리.
 *
 * naturalizeKorean = 플레이스홀더(...을(를)...) 치환.
 * fixExistingJosa = 플레이스홀더 없이 이미 잘못 박힌 조사(예: "6를", "배으로")를 교정.
 */

/** 한글 음절의 받침(종성) 유무. 한글 음절이 아니면 false. */
export function hasBatchim(ch: string): boolean {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false; // 완성형 한글 음절만
  return (code - 0xac00) % 28 !== 0;
}

/** 한글 음절의 받침이 ㄹ인지 (으로/로 선택용). */
export function isRieul(ch: string): boolean {
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 === 8; // 종성 인덱스 8 = ㄹ
}

/**
 * 정수의 한국어 읽기 마지막 음절 받침 유무.
 * 1일ㄹ 3삼ㅁ 6육ㄱ 7칠ㄹ 8팔ㄹ → 받침 / 2이 4사 5오 9구 0영 → 없음.
 * 끝자리 0이면 십·백·천·만·억 단위 음절이 모두 받침을 가지므로 true.
 */
export function numberHasBatchim(n: number): boolean {
  const v = Math.abs(Math.trunc(n));
  if (v === 0) return false; // 영
  const last = v % 10;
  if (last === 0) return true; // 십(ㅂ)·백(ㄱ)·천(ㄴ)·만(ㄴ)·억(ㄱ)
  return last === 1 || last === 3 || last === 6 || last === 7 || last === 8;
}

/**
 * 정수의 한국어 읽기 마지막 음절 받침이 ㄹ인지 (으로/로 선택용).
 * 1일ㄹ 7칠ㄹ 8팔ㄹ만 참. 끝자리 0(십·백·천·만·억)은 전부 ㄹ 받침이 아니다.
 */
export function numberIsRieul(n: number): boolean {
  const v = Math.abs(Math.trunc(n));
  const last = v % 10;
  if (last === 0) return false;
  return last === 1 || last === 7 || last === 8;
}

function pick(anchor: string, withB: string, withoutB: string): string {
  // 빈칸이 그대로 노출되는 문항("___이라(라) 한다")은 받침을 알 수 없다.
  // 이때는 관형적으로 쓰는 받침형(을·은·이·과·이라)을 쓴다 — 플레이스홀더가
  // 학생 화면에 그대로 새는 것보다 낫다.
  if (anchor === "_") return withB;
  if (/^\d+$/.test(anchor)) {
    return numberHasBatchim(parseInt(anchor, 10)) ? withB : withoutB;
  }
  return hasBatchim(anchor.slice(-1)) ? withB : withoutB;
}

/** 앵커(한글 마지막 글자 또는 숫자 전체) 기준 '으로'/'로' 선택. */
function pickRo(anchor: string): string {
  if (anchor === "_") return "으로";
  if (/^\d+$/.test(anchor)) {
    const n = parseInt(anchor, 10);
    return numberHasBatchim(n) && !numberIsRieul(n) ? "으로" : "로";
  }
  const ch = anchor.slice(-1);
  return hasBatchim(ch) && !isRieul(ch) ? "으로" : "로";
}

// 앵커와 조사 플레이스홀더 사이에 끼어들 수 있는 것:
// ① 닫는 따옴표/괄호(예: "두렵다"과(와), '목적'은(는)) — 이 경우 실제 받침 판정은
//    따옴표 안쪽 마지막 글자(앵커)로 해야 하므로 따옴표 자체는 그대로 보존하고 건너뛴다.
// ② 괄호 음철 표기(예: "암탉 (h-e-n)을(를)").
// 두 가지를 반복 조합해도 매칭되도록 비귀속 그룹으로 구성한다.
const MIDDLE = `(?:["'”’)\\]]|\\s*\\([^)]*\\))*`;

// 앵커(한글/숫자) + MIDDLE(따옴표/괄호) + 조사 플레이스홀더.
const JOSA_PAIRS: Array<[RegExp, string, string]> = [
  [new RegExp(`([가-힣]|\\d+|_)(${MIDDLE})을\\(를\\)`, "g"), "을", "를"],
  [new RegExp(`([가-힣]|\\d+|_)(${MIDDLE})를\\(을\\)`, "g"), "을", "를"],
  [new RegExp(`([가-힣]|\\d+|_)(${MIDDLE})은\\(는\\)`, "g"), "은", "는"],
  [new RegExp(`([가-힣]|\\d+|_)(${MIDDLE})는\\(은\\)`, "g"), "은", "는"],
  [new RegExp(`([가-힣]|\\d+|_)(${MIDDLE})이\\(가\\)`, "g"), "이", "가"],
  [new RegExp(`([가-힣]|\\d+|_)(${MIDDLE})가\\(이\\)`, "g"), "이", "가"],
  [new RegExp(`([가-힣]|\\d+|_)(${MIDDLE})과\\(와\\)`, "g"), "과", "와"],
  [new RegExp(`([가-힣]|\\d+|_)(${MIDDLE})와\\(과\\)`, "g"), "과", "와"],
  // 서술격조사 '-이라' 계열. 커리큘럼 템플릿이 "___이라고 해요" 처럼 조사를
  // 하드코딩해 두어 받침 없는 정답이 오면 "명사이라고 해요" 같은 비문이 됐다.
  // 템플릿을 플레이스홀더로 바꾸고 여기서 받침 규칙으로 고른다.
  // (문자열 교정 방식은 쓸 수 없다 — "아이라고"의 '아'+'이라고' 와
  //  '아이'+'라고' 를 사전 없이 구별할 수 없기 때문.)
  [new RegExp(`([가-힣]|\\d+|_)(${MIDDLE})이라고\\(라고\\)`, "g"), "이라고", "라고"],
  [new RegExp(`([가-힣]|\\d+|_)(${MIDDLE})이라는\\(라는\\)`, "g"), "이라는", "라는"],
  [new RegExp(`([가-힣]|\\d+|_)(${MIDDLE})이라도\\(라도\\)`, "g"), "이라도", "라도"],
  [new RegExp(`([가-힣]|\\d+|_)(${MIDDLE})이라\\(라\\)`, "g"), "이라", "라"],
];

const RO_PLACEHOLDER = new RegExp(
  `([가-힣]|\\d+|_)(${MIDDLE})으로\\(로\\)|([가-힣]|\\d+|_)(${MIDDLE})로\\(으로\\)`,
  "g",
);

/**
 * 문자열 내 조사/계사 플레이스홀더를 받침 규칙으로 보정한다.
 * 플레이스홀더가 없으면 입력을 그대로 반환(no-op).
 */
export function naturalizeKorean(text: string): string {
  if (!text) return text;
  for (const [re, withB, withoutB] of JOSA_PAIRS) {
    text = text.replace(re, (_m, anchor: string, middle?: string) => {
      return anchor + (middle || "") + pick(anchor, withB, withoutB);
    });
  }
  // 으로(로) / 로(으로): 받침 있고 ㄹ 아니면 '으로', 그 외 '로'
  text = text.replace(
    RO_PLACEHOLDER,
    (_m, a?: string, am?: string, b?: string, bm?: string) => {
      const anchor = a ?? b ?? "";
      const middle = (a ? am : bm) || "";
      return anchor + middle + pickRo(anchor);
    },
  );
  // 계사 보정: 모음으로 끝나는 명사 + '이에요' → '예요' (예: 고양이이에요 → 고양이예요)
  text = text.replace(/([가-힣])이에요/g, (m, c: string) =>
    hasBatchim(c) ? m : c + "예요",
  );
  return text;
}

// ── 이미 잘못 박혀 있는 조사 교정 (플레이스홀더가 아니라 완성된 문장 텍스트 대상) ──
//
// 오탐 방지: "사과", "치과", "효과" 처럼 '과'로 끝나는 단어, "근로", "경로", "백로",
// "공로", "진로", "통로", "판로", "향로", "폭로", "선로" 처럼 '로'로 끝나는 단어는
// 조사가 아니라 단어의 일부이므로 절대 바꾸지 않는다. 그래서:
//   - 숫자 앵커가 아닌 한글 앵커의 와/과·이/가·은/는·을/를 교정은 하지 않는다
//     (오탐 위험이 이득보다 크다 — 숫자 앵커만 정확히 계산 가능하므로 숫자만 교정).
//   - '으로'→'로'(받침 없는 음절 뒤) 방향만 교정한다. 반대 방향('로'→'으로')은
//     하지 않는다: 사전 없이는 조사 '로'와 낱말의 일부('통학로'·'등산로'·'산책로'·
//     '진입로'·'순환로' 등)를 구별할 수 없고, 예외 목록은 2음절만 걸러 3음절 이상
//     낱말을 그대로 망가뜨린다(실측: "통학로" → "통학으로"). 교정 이득보다 콘텐츠
//     훼손 위험이 커서 제거했다.

// 조사 뒤에 오는 경계: 공백/문장부호/닫는 괄호·따옴표/문자열 끝.
const JOSA_BOUNDARY = `(?=[\\s.,!?;:)\\]"'”’」』]|$)`;

// 분수 «3/4과»는 «사분의 삼과»로 읽으니 분모(4) 뒤 조사는 건드리지 않는다(분자 기준은 withJosa 가 고른다).
const NUM_JOSA_RE = new RegExp(
  `(?<![\\d/])(\\d+)(이|가|은|는|을|를|와|과)${JOSA_BOUNDARY}`,
  "g",
);
const NO_BATCHIM_EURO_RE = new RegExp(`([가-힣])으로${JOSA_BOUNDARY}`, "g");

/**
 * 숫자 직후 조사(이/가·은/는·을/를·와/과)와 '으로/로'가 받침 규칙에 맞지 않게
 * 이미 박혀 있는 경우를 교정한다. 플레이스홀더가 없는 완성 문장 텍스트 대상.
 */
export function fixExistingJosa(text: string): string {
  if (!text) return text;

  // 1) 숫자 + 조사: numberHasBatchim 기준으로 교정
  text = text.replace(
    NUM_JOSA_RE,
    (m: string, num: string, particle: string) => {
      const b = numberHasBatchim(parseInt(num, 10));
      switch (particle) {
        case "이":
        case "가":
          return num + (b ? "이" : "가");
        case "은":
        case "는":
          return num + (b ? "은" : "는");
        case "을":
        case "를":
          return num + (b ? "을" : "를");
        case "와":
        case "과":
          return num + (b ? "과" : "와");
        default:
          return m;
      }
    },
  );

  // 2) 받침 없는 한글 + '으로' → '로' (실질적으로 오탐 위험 없음)
  text = text.replace(NO_BATCHIM_EURO_RE, (m: string, ch: string) =>
    hasBatchim(ch) ? m : ch + "로",
  );

  return text;
}

// ── 낱말 + 조사를 받침에 맞춰 붙인다 ─────────────────────────────────
// 문구를 만드는 코드가 `${word}는` 처럼 조사를 박아 두면 «命는»·«'우산'라는»·«'대'으로» 가
// 나온다(2026-10-12 전수검수 451건). 조사가 붙는 자리는 전부 이 함수를 쓴다.
// 한자처럼 한글이 아닌 낱말은 읽는 소리(reading)를 넘겨 그 받침으로 고른다.
export type JosaKind = "은/는" | "이/가" | "을/를" | "과/와" | "으로/로" | "이라/라" | "이라는/라는" | "이에요/예요";
export function withJosa(word: string, kind: JosaKind, readAs?: string): string {
  const basis = (readAs ?? word).replace(/[^가-힣0-9]+$/g, "");
  const num = basis.match(/\d+$/);
  const last = basis.slice(-1);
  const b = num ? numberHasBatchim(parseInt(num[0], 10)) : /[가-힣]/.test(last) ? hasBatchim(last) : false;
  const rieul = num ? numberIsRieul(parseInt(num[0], 10)) : /[가-힣]/.test(last) ? isRieul(last) : false;
  const [withB, withoutB] = kind.split("/");
  if (kind === "으로/로") return word + (b && !rieul ? "으로" : "로");
  return word + (b ? withB : withoutB);
}

// ── 빈칸(___) 바로 뒤 조사를 정답 받침에 맞춘다 ─────────────────────
// 원천 문장이 «강원도에는 ___가 높은 산» 처럼 조사를 박아 두면 정답 «태백산맥»을 넣어 «태백산맥가»가 된다
// (2026-10-12 전수검수 다수: 헬멧를·몸가·신라을·구르기으로). 표시 문장과 해설이 같은 문장을 쓰므로 여기서 한 번 고친다.
const BLANK_JOSA = /___(['’"”]?)(\(이\)라고|\(이\)라|\(으\)로|이라고\(라고\)|라고\(이라고\)|이라\(라\)|라\(이라\)|을\(를\)|를\(을\)|이\(가\)|가\(이\)|은\(는\)|는\(은\)|과\(와\)|와\(과\)|으로\(로\)|로\(으로\)|이라고|라고|이라는|라는|이라|라|이란|란|으로|로|은|는|이|가|을|를|과|와|이에요|예요|이었다|였다)(?=[\s.,!?'"’”)\]]|$)/g;
const BLANK_KIND: Record<string, JosaKind | "이에요" | "이었다"> = {
  "이라고": "이라/라", "라고": "이라/라", "이라": "이라/라", "라": "이라/라", "이란": "이라/라", "란": "이라/라",
  "이라는": "이라는/라는", "라는": "이라는/라는", "으로": "으로/로", "로": "으로/로",
  "은": "은/는", "는": "은/는", "이": "이/가", "가": "이/가", "을": "을/를", "를": "을/를", "과": "과/와", "와": "과/와",
  "이에요": "이에요", "예요": "이에요", "이었다": "이었다", "였다": "이었다",
};
export function fitBlankJosa(text: string, answer: string): string {
  if (!text || !text.includes("___") || !answer) return text;
  const a = String(answer).trim();
  const tail = a.replace(/[^가-힣0-9]+$/g, "");
  if (!/[가-힣0-9]$/.test(tail)) return text; // 영문 등 받침을 알 수 없으면 그대로
  const num = tail.match(/\d+$/);
  const b = num ? numberHasBatchim(parseInt(num[0], 10)) : hasBatchim(tail.slice(-1));
  const rieul = num ? numberIsRieul(parseInt(num[0], 10)) : isRieul(tail.slice(-1));
  return text.replace(BLANK_JOSA, (m: string, q: string, j: string) => {
    const base = j.replace(/\(.*?\)/g, "").replace(/^\(이\)|^\(으\)/, "") || j;
    const key = j.startsWith("(이)라고") ? "이라고" : j.startsWith("(이)라") ? "이라" : j.startsWith("(으)로") ? "으로" : base;
    const kind = BLANK_KIND[key];
    if (!kind) return m;
    let out: string;
    if (kind === "이에요") out = b ? "이에요" : "예요";
    else if (kind === "이었다") out = b ? "이었다" : "였다";
    else if (kind === "이라/라") out = (b ? "이" : "") + key.replace(/^이/, "");
    else if (kind === "이라는/라는") out = b ? "이라는" : "라는";
    else if (kind === "으로/로") out = b && !rieul ? "으로" : "로";
    else { const [w, wo] = kind.split("/"); out = b ? w : wo; }
    return "___" + q + out;
  });
}
