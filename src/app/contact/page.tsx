"use client";

import { Mail, MessageCircle } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_BOARD } from "@/lib/contact";

// 2026-10-26 사용자 «자주 묻는 질문 이런 건 필요 없을 것 같다» — 옛 FAQ(계정·결제 시절 문답)와
// 이름·이메일 입력 칸을 뺐다. 메일은 쓰는 사람의 메일 앱에서 바로 보내고, 이 사이트는 아무것도 받지 않는다.
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold">문의</h1>
      <p className="mt-3 text-muted-foreground">
        문제가 틀렸거나, 쓰다가 막히거나, 바랐으면 하는 점이 있으면 알려 주세요.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("[아라하루] 문의")}`}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 hover:border-primary"
        >
          <Mail className="h-6 w-6 text-primary" aria-hidden />
          <span>
            <b className="block text-foreground">이메일</b>
            <span className="text-sm text-muted-foreground">{CONTACT_EMAIL}</span>
          </span>
        </a>
        <a
          href={CONTACT_BOARD}
          target="_blank"
          rel="noopener"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 hover:border-primary"
        >
          <MessageCircle className="h-6 w-6 text-primary" aria-hidden />
          <span>
            <b className="block text-foreground">선행쌤 쪽지판</b>
            <span className="text-sm text-muted-foreground">로그인 없이 한 마디 남기기</span>
          </span>
        </a>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        학생은 이름·학교·전화번호 같은 개인정보를 적지 말아 주세요.
      </p>
    </div>
  );
}
