// @gb-frac-fn renderMath
// 분수 «3/4» 를 글자 그대로 찍지 않고 위아래로 쌓아(분자 위·가로선·분모 아래) 보여 준다 — 초등 교과서 표기.
// 학습 화면의 문제·보기·정답·해설·힌트는 전부 이 함수를 거친다(데이터는 «3/4» 그대로, 표시 지점에서만 바꾼다).
// 날짜·URL 의 슬래시(2026/10/13)는 건드리지 않는다(앞뒤가 글자·숫자·점·슬래시이면 분수가 아니다).
import type { ReactNode } from "react";

const FRAC = /((?<![\w./])\d{1,4}\/\d{1,4}(?![\w/]))/g;
const ONE = /^(\d{1,4})\/(\d{1,4})$/;

export function Frac({ n, d }: { n: string; d: string }) {
  return (
    <span
      role="img"
      aria-label={`${d}분의 ${n}`}
      className="frac mx-0.5 inline-flex flex-col items-center justify-center align-middle leading-none"
    >
      <span className="px-1 pb-0.5">{n}</span>
      <span className="block w-full border-t-2 border-current" />
      <span className="px-1 pt-0.5">{d}</span>
    </span>
  );
}

export function renderMath(text: unknown): ReactNode {
  if (text === null || text === undefined || text === "") return "";
  const s = String(text);
  if (!s.includes("/")) return s;
  return s.split(FRAC).map((p, i) => {
    const m = p.match(ONE);
    return m ? <Frac key={i} n={m[1]} d={m[2]} /> : <span key={i}>{p}</span>;
  });
}
