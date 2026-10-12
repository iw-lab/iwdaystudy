"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { currentSemester, lastGuestChoice, readGuest, startGuest } from "@/lib/guest";
import { cn } from "@/lib/utils";

const GRADES = [1, 2, 3, 4, 5, 6];

/** 로그인 없이 학년·학기만 골라 바로 시작하는 카드(랜딩·/start 공용) */
export function StartCard({ className }: { className?: string }) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [grade, setGrade] = useState<number | null>(null);
  const [semester, setSemester] = useState<1 | 2>(1);
  const [resume, setResume] = useState<{ grade: number; semester: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setSemester(currentSemester());
    const g = readGuest();
    const c = g?.grade && g?.semester ? { grade: g.grade, semester: g.semester } : lastGuestChoice();
    if (c) {
      setResume(c);
      setGrade(c.grade);
      setSemester(c.semester as 1 | 2);
    }
  }, []);

  const go = (g: number, s: number) => {
    try {
      const user = startGuest(g, s);
      setUser(user);
      router.push("/student/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "시작하지 못했어요.");
    }
  };

  return (
    <div
      data-guest-ready
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-6 shadow-[0_12px_40px_-16px_rgba(16,24,40,0.18)] sm:p-8",
        className,
      )}
    >
      <h2 className="text-lg font-bold text-foreground">로그인 없이 바로 시작</h2>
      <p className="mt-1 text-sm text-muted-foreground">기록은 이 기기에만 저장돼요.</p>

      <fieldset className="mt-6">
        <legend className="mb-2 text-sm font-semibold text-foreground">학년</legend>
        <div className="grid grid-cols-6 gap-2">
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={grade === g}
              onClick={() => { setGrade(g); setError(""); }}
              className={cn(
                "h-12 rounded-xl border text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                grade === g
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/60",
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="mb-2 text-sm font-semibold text-foreground">학기</legend>
        <div className="grid grid-cols-2 gap-2">
          {([1, 2] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={semester === s}
              onClick={() => setSemester(s)}
              className={cn(
                "h-12 rounded-xl border text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                semester === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/60",
              )}
            >
              {s}학기
            </button>
          ))}
        </div>
      </fieldset>

      {error && <p role="alert" className="mt-4 text-sm font-medium text-destructive">{error}</p>}

      <button
        type="button"
        data-testid="guest-start"
        disabled={!grade}
        onClick={() => grade && go(grade, semester)}
        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {grade ? `${grade}학년 ${semester}학기 시작하기` : "학년을 골라 주세요"}
        {grade && <ArrowRight className="h-5 w-5" aria-hidden />}
      </button>

      {resume && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          지난번: {resume.grade}학년 {resume.semester}학기 — 같은 학년이면 기록이 이어져요
        </p>
      )}
    </div>
  );
}
