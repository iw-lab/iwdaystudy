/**
 * 영어 문항의 '밑줄 친 낱말' 판정 — 생성기(daily-set-generator)·화면(EnglishQuestion)·
 * 회귀 게이트(scripts/verify-underline.ts)가 **같은 함수**를 쓰게 하는 단일 정본.
 *
 * 왜 한 곳인가: 판정이 두 곳에 복제돼 있으면 한쪽만 고쳐져 "화면엔 밑줄이 있는데
 * 오답노트 지시문은 밑줄을 언급하지 않는" 식으로 어긋난다(2026-09-16 교차검증 지적).
 */

/** 화면에 실제로 보이는 뜻 문자열(번역문). translation 이 비면 meaning 으로 폴백. */
export function getMeaningText(src: {
  translation?: string | null;
  meaning?: string | null;
}): string {
  return String(src?.translation || src?.meaning || "");
}

/**
 * 밑줄이 실제로 그려지는가 = 밑줄 대상이 비어 있지 않고, 보이는 뜻 문자열 안에 그대로 있다.
 * (빈 문자열은 includes("") 가 항상 true 라 반드시 걸러야 한다.)
 */
export function canUnderline(src: {
  translation?: string | null;
  meaning?: string | null;
  targetKo?: string | null;
}): boolean {
  const target = String(src?.targetKo || "").trim();
  if (!target) return false;
  return getMeaningText(src).includes(target);
}

/** 'meaning' 변형의 지시문 — 밑줄이 그려질 때만 "밑줄 친"이라고 말한다. */
export function meaningPrompt(underlined: boolean): string {
  return underlined
    ? "밑줄 친 낱말에 해당하는 영단어를 고르세요"
    : "다음 뜻에 해당하는 영단어를 고르세요";
}
