"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 로그인·회원가입은 없앴다(2026-10-13 — 우리 반 전용, 기록은 기기에 저장). 옛 주소로 오면 처음 화면으로 보낸다.
export default function Redirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}
