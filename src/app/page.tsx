"use client";

import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { StartCard } from "@/components/landing/StartCard";

const SUBJECTS = ["수학", "국어 독해", "맞춤법", "어휘", "한자", "영어", "글쓰기", "상식", "과학·사회", "안전"];

const POINTS = [
  { t: "학년·학기 진도 그대로", d: "2022 개정 교육과정 단원 순서에 맞춰 그 학기에 배우는 것만 나와요." },
  { t: "하루 한 세트", d: "여러 과목을 조금씩. 끝나면 바로 채점하고 틀린 문제를 다시 봐요." },
  { t: "가입 없이, 기기에 저장", d: "이름도 이메일도 받지 않아요. 기록은 파일로 내보내 다른 기기로 옮길 수 있어요." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="아라하루 처음 화면">
          <Logo size={34} />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/about/" className="rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground">소개</Link>
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <a
          href="https://ssamzip.com"
          target="_blank"
          rel="noopener"
          data-gb="site-link"
          className="gb-site"
        >
          <span className="gb-site-ic">
            <svg className="gb-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>
          </span>
          <span className="gb-site-tx"><b>선행쌤</b><small>선생님이 만든 수업 놀이 더 보기</small></span>
          <span className="gb-site-go">
            가 보기
            <svg className="gb-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>
          </span>
        </a>
      </div>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-24 lg:pt-16">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot/ara-happy.svg" alt="" aria-hidden width={72} height={72} className="mb-4 h-16 w-16 sm:h-[72px] sm:w-[72px]" />
            <p className="text-sm font-semibold text-primary">초등 1~6학년 아침학습</p>
            <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              매일 아침,<br /><span className="text-primary">알아가는 즐거움</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              우리 학년 이번 학기 진도에 맞춘 문제를 매일 한 세트씩. 고르고 바로 시작하세요.
            </p>
            <ul className="mt-6 flex max-w-xl flex-wrap gap-2" aria-label="과목">
              {SUBJECTS.map((s) => (
                <li key={s} className="rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <StartCard className="mx-auto max-w-md lg:mx-0 lg:justify-self-end" />
        </section>

        <section className="border-t border-border bg-card/60">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3">
            {POINTS.map((p) => (
              <div key={p.t}>
                <h3 className="text-base font-bold">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-xs text-muted-foreground sm:px-6">
        <span>© 아라하루</span>
        <span className="flex gap-4">
          <Link href="/privacy/" className="hover:text-foreground">개인정보처리방침</Link>
          <Link href="/terms/" className="hover:text-foreground">이용약관</Link>
          <Link href="/contact/" className="hover:text-foreground">문의</Link>
        </span>
      </footer>
    </div>
  );
}
