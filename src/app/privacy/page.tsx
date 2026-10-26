"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CONTACT_EMAIL, CONTACT_BOARD } from "@/lib/contact";

// 2026-10-26 사용자 «아라하루 개인정보 이제 안 받기로 했는데 — 개인정보처리방침·이용약관 확인하고 수정»
// 실제 동작 기준: 가입·로그인 없음(2026-10-13) · 기록은 기기 localStorage · 학교 순위 허브엔 기기 해시·고른 학교·합계만.
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

            <S n={2} t="학교 순위에 쓰는 것">
              <p>
                첫 화면의 학교 순위에 참여하려고 학교를 고르면 서버에는 다음만 저장됩니다.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>기기마다 무작위로 만든 값을 한 번 더 바꾼 식별값(사람과 연결되지 않습니다)</li>
                <li>고른 학교(교육부 나이스 공개 학교 목록의 이름·지역)</li>
                <li>오늘의 학습을 끝낸 횟수와 학교별 점수 합계</li>
              </ul>
              <p>
                같은 기기·같은 인터넷에서 점수를 지나치게 올리는 것을 막으려고 접속 주소(IP)를 날마다 바뀌는 값으로
                변환해 하루 동안만 셉니다. IP 원래 값은 저장하지 않습니다. 학교를 고르지 않으면 학교 순위에는 아무것도
                보내지 않습니다.
              </p>
            </S>

            <S n={3} t="쓰지 않는 것">
              <p>광고, 방문 분석 도구, 외부 로그인, 결제 기능을 쓰지 않습니다.</p>
            </S>

            <S n={4} t="제3자 제공과 처리 위탁">
              <p>
                위 정보를 다른 곳에 제공하지 않습니다. 사이트와 학교 순위 서버는 Cloudflare 가 운영하는 서버에서
                돌아갑니다.
              </p>
            </S>

            <S n={5} t="보관 기간">
              <p>
                학교별 점수 합계는 순위(오늘·이번 주)를 보여 주는 동안 보관합니다. 하루 횟수 제한에 쓰는 변환한 IP 값은
                그날만 씁니다.
              </p>
            </S>

            <S n={6} t="예전 학급 계정">
              <p>
                2026년 10월 13일까지 있던 학급 계정 기능은 없앴습니다. 그때 만든 기록은 이 기기로 옮겨 쓰도록 바뀌었고,
                그 뒤로는 서버로 보내지 않습니다. 예전 계정 정보 삭제를 원하시면 아래로 연락해 주세요.
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
