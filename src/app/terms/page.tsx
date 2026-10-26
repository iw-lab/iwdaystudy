"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CONTACT_EMAIL } from "@/lib/contact";

const ARTICLES: { t: string; p: string }[] = [
  { t: "목적", p: "이 약관은 아라하루(이하 «서비스»)를 쓰는 방법과 지킬 점을 정합니다." },
  {
    t: "서비스 내용",
    p: "서비스는 초등 1~6학년이 학년·학기를 골라 하루 한 세트씩 푸는 학습 연습 사이트입니다. 가입·로그인 없이 무료로 쓰며 결제는 없습니다.",
  },
  {
    t: "기록",
    p: "학습 기록은 쓰는 기기에만 저장됩니다. 브라우저 기록을 지우거나 기기를 바꾸면 기록이 사라질 수 있으니 필요하면 내보내기로 따로 보관해 주세요.",
  },

  {
    t: "쓰는 사람이 지킬 점",
    p: "서비스를 학습 목적으로 쓰고, 서버에 일부러 많은 요청을 보내는 등 다른 사람의 이용을 방해하지 않습니다.",
  },
  {
    t: "책임의 한계",
    p: "서비스는 학습을 돕는 보조 자료이며 학업 성과를 보장하지 않습니다. 문제와 해설에 잘못된 곳이 있으면 알려 주시는 대로 고칩니다.",
  },
  { t: "약관 변경", p: "약관을 바꾸면 이 쪽에 바뀐 날짜와 함께 알립니다." },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-bold mb-8">이용약관</h1>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            {ARTICLES.map((a, i) => (
              <section key={a.t}>
                <h2 className="text-lg font-semibold text-foreground">
                  제{i + 1}조 ({a.t})
                </h2>
                <p>{a.p}</p>
              </section>
            ))}
            <p>
              문의: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
            <p className="text-xs text-muted-foreground pt-8">시행일: 2026년 10월 26일</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
