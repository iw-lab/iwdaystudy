"use client";

import { useEffect, useRef } from "react";
import { mountSchoolRank, refreshSchoolRank } from "@/gb/gb-school.js";
import { initSchoolHub } from "@/lib/school-hub";
import "@/gb/gb-ui.css";

/** 첫 화면 맨 위 학교 순위 카드(참여 학교·기기·오늘 이용 + 우리 학교) — 선행쌤 배너는 키트가 이 카드 바로 밑에 붙인다 */
export function SchoolRank() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    initSchoolHub();
    if (!el.current) return;
    if (el.current.childElementCount === 0) mountSchoolRank(el.current);
    else void refreshSchoolRank();
  }, []);
  return (
    <div data-rank-host>
      <div ref={el} id="schoolRank" />
    </div>
  );
}
