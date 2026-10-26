"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CONTACT_EMAIL, CONTACT_BOARD } from "@/lib/contact";

// 2026-10-26 사용자 «아라하루 개인정보 이제 안 받기로 했는데 — 개인정보처리방침·이용약관 확인하고 수정»
// 실제 동작 기준: 가입·로그인 없음(2026-10-13) · 기록은 기기 localStorage · 이용자 수 카운터(ssam-count)엔 기기 해시만(10-26 학교 대항 뺌).
// 🔒 tests/policy-pages.test.mjs — 옛 계정 시절 문구가 돌아오면 빨강.
const S = ({ n, t, children }: { n: number; t: string; children: React.ReactNode }) => (
  <section>
    <h2 className="text-lg font-semibold text-foreground">
      {n}. {t}
    </h2>
    {children}
  </section>
);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            <p>
              아라하루는 회원가입과 로그인이 없습니다. 이름·이메일·전화번호·생년월일·사진처럼 사람을 알아볼 수 있는
              정보는 받지 않습니다.
            </p>

            <S n={1} t="이 기기에만 저장하는 것">
              <p>
                고른 학년·학기, 푼 문제와 점수, 연속 학습·뱃지 기록은 쓰는 기기(브라우저) 안에만 저장되고 서버로
                보내지 않습니다. 브라우저 기록을 지우면 함께 지워집니다. 다른 기기로 옮기고 싶을 때는 직접 파일로
                내보내고 불러올 수 있습니다.
              </p>
            </S>

            <S n={2} t="이용자 수를 세는 데 쓰는 것">
              <p>
                첫 화면의 «오늘 ○명 · 누적 ○명»을 세려고, 기기마다 무작위로 만든 값 하나를 브라우저에 두고 서버에는 그 값을
                한 번 더 바꾼 값만 보냅니다(사람과 연결되지 않습니다). 같은 기기는 하루에 한 번만 셉니다. 서버에는 날마다의
                이용자 수 숫자만 남고, 지난 날짜의 값은 지웁니다. 접속 주소(IP)는 지나치게 많은 요청을 막는 데 그 순간만 쓰고
                저장하지 않습니다.
              </p>
            </S>

            <S n={3} t="쓰지 않는 것">
              <p>광고, 방문 분석 도구, 외부 로그인, 결제 기능을 쓰지 않습니다.</p>
            </S>

            <S n={4} t="제3자 제공과 처리 위탁">
              <p>
                위 정보를 다른 곳에 제공하지 않습니다. 사이트와 이용자 수 서버는 Cloudflare 가 운영하는 서버에서
                돌아갑니다.
              </p>
            </S>

            <S n={5} t="보관 기간">
              <p>이용자 수를 세는 데 쓴 기기 값은 그날만 보관하고, 날짜별 이용자 수 숫자만 남깁니다.</p>
            </S>

            <S n={6} t="예전 학급 계정">
              <p>
                2026년 10월 13일까지 있던 학급 계정 기능은 없앴고, 그때 서버에 남아 있던 계정과 학습 기록은
                2026년 10월 26일에 모두 삭제했습니다.
              </p>
            </S>

            <S n={7} t="문의">
              <p>
                <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> ·{" "}
                <a className="underline" href={CONTACT_BOARD} target="_blank" rel="noopener">
                  선행쌤 문의 쪽지판
                </a>
              </p>
            </S>

            <p className="text-xs text-muted-foreground pt-8">시행일: 2026년 10월 26일</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
