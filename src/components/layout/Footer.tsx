"use client";

import Link from "next/link";

// 2026-10-26 사용자 «밑에 서비스·지원·법적 이런 거 필요 없는 건 삭제 · 자주 묻는 질문 필요 없을 것 같다»
// → 첫 화면 꼬리말과 같은 한 줄(없는 쪽·앵커 링크와 없는 메일 주소를 뺐다)
export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-xs text-muted-foreground sm:px-6">
        <span>© 아라하루</span>
        <span className="flex gap-4">
          <Link href="/privacy/" className="hover:text-foreground">개인정보처리방침</Link>
          <Link href="/terms/" className="hover:text-foreground">이용약관</Link>
          <Link href="/contact/" className="hover:text-foreground">문의</Link>
        </span>
      </div>
    </footer>
  );
}
