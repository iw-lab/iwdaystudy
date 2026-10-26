"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { adoptAccount, adoptableAccount, currentSemester, hasAccountSession, lastGuestChoice, readGuest, startGuest } from "@/lib/guest";
import { cn } from "@/lib/utils";

const GRADES = [1, 2, 3, 4, 5, 6];

/** 로그인 없이 학년·학기만 골라 바로 시작하는 카드(랜딩·/start 공용) */
export function StartCard({ className }: { className?: string }) {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const storeUser = useAuthStore((s) => s.user);
  const [account, setAccount] = useState<{ name: string; role: string } | null>(null);
  const [grade, setGrade] = useState<number | null>(null);
  const [semester, setSemester] = useState<1 | 2>(1);
  const [resume, setResume] = useState<{ grade: number; semester: number } | null>(null);
  const [error, setError] = useState("");
  // 이 기기에 남은 우리 반 학생 기록 — 로그인 없이 그대로 이어받는다
  const [adopt, setAdopt] = useState<{ name: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSemester(currentSemester());
    const a = adoptableAccount();
    if (a) {
      setAdopt({ name: a.name });
      if (a.grade) setGrade(a.grade);
      setSemester(a.semester ?? currentSemester());
      return;
    }
    if (hasAccountSession()) {
      try {
        const u = JSON.parse(localStorage.getItem("araharu_current_user") || "null");
        setAccount({ name: u?.name || "학급", role: u?.role || "student" });
      } catch {
        setAccount({ name: "학급", role: "student" });
      }
    }
    const g = readGuest();
    const c = g?.grade && g?.semester ? { grade: g.grade, semester: g.semester } : lastGuestChoice();
    if (c) {
      setResume(c);
      setGrade(c.grade);
      setSemester(c.semester === 2 ? 2 : 1);
    }
  }, []);

  const go = async (g: number, s: number) => {
    if (busy) return;
    setBusy(true);
    try {
      const user = adopt ? await adoptAccount(g, s) : startGuest(g, s);
      useAuthStore.setState({ token: null });
      setUser(user);
      router.push("/student/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "시작하지 못했어요.");
      setBusy(false);
    }
  };

  if (account) {
    const home = account.role === "teacher" ? "/teacher/" : account.role === "parent" ? "/parent/" : account.role === "admin" ? "/admin/" : "/student/";
    return (
      <div
        data-guest-ready
        data-account-session
        className={cn(
          "w-full rounded-3xl border border-border bg-card p-6 shadow-[0_12px_40px_-16px_rgba(16,24,40,0.18)] sm:p-8",
          className,
        )}
      >
        <h2 className="text-lg font-bold text-foreground">{storeUser?.name || account.name} 계정으로 로그인되어 있어요</h2>
        <p className="mt-1 text-sm text-muted-foreground">지금까지의 기록 그대로 이어서 해요.</p>
        <button
          type="button"
          data-testid="account-continue"
          data-gb="play"
          onClick={() => router.push(home)}
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          이어서 학습하기
          <ArrowRight className="h-5 w-5" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div
      data-guest-ready
      data-adopt={adopt ? "" : undefined}
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-6 shadow-[0_12px_40px_-16px_rgba(16,24,40,0.18)] sm:p-8",
        className,
      )}
    >
      {adopt ? (
        <>
          <h2 className="text-lg font-bold text-foreground">{adopt.name ? `${adopt.name}, ` : ""}지난 기록 그대로 이어서 해요</h2>
          <p className="mt-1 text-sm text-muted-foreground">이 기기에 있던 우리 반 학습 기록이에요. 로그인은 이제 필요 없어요.</p>
        </>
      ) : (
        <>
          <h2 className="text-lg font-bold text-foreground">로그인 없이 바로 시작</h2>
          <p className="mt-1 text-sm text-muted-foreground">기록은 이 기기에만 저장돼요.</p>
        </>
      )}

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
        data-testid={adopt ? "adopt-continue" : "guest-start"}
        data-gb="play"
        disabled={!grade || busy}
        onClick={() => grade && go(grade, semester)}
        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {busy ? "기록 불러오는 중…" : grade ? `${grade}학년 ${semester}학기 ${adopt ? "이어서 하기" : "시작하기"}` : "학년을 골라 주세요"}
        {grade && <ArrowRight className="h-5 w-5" aria-hidden />}
      </button>

      {resume && !adopt && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          지난번: {resume.grade}학년 {resume.semester}학기 — 같은 학년이면 기록이 이어져요
        </p>
      )}
    </div>
  );
}
