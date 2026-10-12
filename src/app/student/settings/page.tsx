"use client";

import { useRef, useState } from "react";
import { Download, Upload, Check } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { exportBackup, importBackup, isGuest, readGuest, startGuest } from "@/lib/guest";
import { cn } from "@/lib/utils";

const GRADES = [1, 2, 3, 4, 5, 6];

export default function StudentSettingsPage() {
  const { user, setUser } = useAuthStore();
  const guest = isGuest(user);
  const [grade, setGrade] = useState<number>(user?.grade ?? 1);
  const [semester, setSemester] = useState<number>(user?.semester ?? 1);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const changed = grade !== user.grade || semester !== user.semester;

  const saveGrade = () => {
    const u = startGuest(grade, semester);
    setUser(u);
    setMsg({ ok: true, text: `${grade}학년 ${semester}학기로 바꿨어요. 다음 세트부터 적용돼요.` });
  };

  const download = () => {
    const url = URL.createObjectURL(exportBackup());
    const a = document.createElement("a");
    const d = new Date();
    a.href = url;
    a.download = `아라하루-기록-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMsg({ ok: true, text: "기록 파일을 저장했어요. 다른 기기에서 «불러오기»로 이어서 할 수 있어요." });
  };

  const upload = async (f: File | undefined) => {
    if (!f) return;
    try {
      const n = await importBackup(f);
      const u = readGuest();
      if (u) setUser(u);
      setMsg({ ok: true, text: `기록을 불러왔어요(${n}개 항목). 잠시 뒤 새로 고칩니다.` });
      // 다른 스토어(진행·기록)가 메모리에 옛 값을 들고 있다가 다음 저장 때 불러온 기록을 덮어쓰지 않도록 통째로 다시 읽는다
      setTimeout(() => window.location.reload(), 900);
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "불러오지 못했어요." });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {guest ? "로그인 없이 쓰는 중이에요. 기록은 이 기기에만 있어요." : `${user.name} · ${user.grade}학년 ${user.semester}학기`}
        </p>
      </header>

      {msg && (
        <p role="status" className={cn("rounded-xl border px-4 py-3 text-sm", msg.ok ? "border-primary/30 bg-primary/5 text-foreground" : "border-destructive/40 bg-destructive/5 text-destructive")}>
          {msg.text}
        </p>
      )}

      {guest ? (
        <>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-bold">학년·학기</h2>
            <div className="mt-4 grid grid-cols-6 gap-2">
              {GRADES.map((g) => (
                <button key={g} type="button" aria-pressed={grade === g} onClick={() => setGrade(g)}
                  className={cn("h-12 rounded-xl border font-bold", grade === g ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/60")}>
                  {g}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[1, 2].map((s) => (
                <button key={s} type="button" aria-pressed={semester === s} onClick={() => setSemester(s)}
                  className={cn("h-12 rounded-xl border font-bold", semester === s ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/60")}>
                  {s}학기
                </button>
              ))}
            </div>
            <button type="button" disabled={!changed} onClick={saveGrade}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-40">
              <Check className="h-4 w-4" aria-hidden /> 바꾸기
            </button>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-bold">기록 옮기기</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              브라우저 데이터를 지우면 기록도 사라져요. 가끔 파일로 저장해 두세요.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={download} className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-4 font-semibold hover:bg-muted">
                <Download className="h-4 w-4" aria-hidden /> 파일로 저장
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-4 font-semibold hover:bg-muted">
                <Upload className="h-4 w-4" aria-hidden /> 불러오기
              </button>
              <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" data-testid="backup-input"
                onChange={(e) => upload(e.target.files?.[0])} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">불러오면 이 기기의 지금 기록은 파일 내용으로 바뀌어요.</p>
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          학년·학기는 선생님이 학급에서 정해요. 기록은 서버에 저장돼 다른 기기에서도 이어져요.
        </section>
      )}
    </div>
  );
}
