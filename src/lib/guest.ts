// 로그인 없이 쓰는 «이 기기 학생».
//
// 학습 세트 생성·채점·기록은 원래 전부 브라우저(localStorage)에서 돈다. 그래서 계정이
// 없어도 학년·학기만 있으면 똑같이 쓸 수 있다. 게스트는 서버에 아무것도 보내지 않는다
// (토큰이 없으니 sync 가 큐에 쌓지도 않게 isGuestId 로 막는다). 이름·학교 같은 개인정보는
// 받지 않는다 — 화면에 보이는 이름은 기기마다 정해지는 별명이다.
//
// 기기를 바꿀 때를 위해 기록을 파일로 내보내고 불러오는 기능을 함께 둔다.

import type { Profile } from "@/types/database";
import { ensureLocalDataOwnership } from "@/lib/local-storage";

export const GUEST_PREFIX = "guest-";
const GUEST_ID_KEY = "araharu_guest_id";
const CURRENT_USER_KEY = "araharu_current_user";
const BACKUP_FORMAT = "araharu-backup";
const BACKUP_VERSION = 1;

const NICK_A = ["반짝", "씩씩한", "느긋한", "용감한", "꼼꼼한", "상냥한", "튼튼한", "산뜻한"];
const NICK_B = ["다람쥐", "고래", "부엉이", "판다", "수달", "펭귄", "여우", "거북이"];

export function isGuestId(id: string | null | undefined): boolean {
  return typeof id === "string" && id.startsWith(GUEST_PREFIX);
}

export function isGuest(user: Pick<Profile, "id"> | null | undefined): boolean {
  return !!user && isGuestId(user.id);
}

/** 3~8월은 1학기, 그 밖은 2학기 */
export function currentSemester(d = new Date()): 1 | 2 {
  const m = d.getMonth() + 1;
  return m >= 3 && m <= 8 ? 1 : 2;
}

function randomId(): string {
  const a = new Uint8Array(8);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

function nicknameFor(id: string): string {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `${NICK_A[h % NICK_A.length]} ${NICK_B[(h >>> 8) % NICK_B.length]}`;
}

export function readGuest(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    const u = raw ? (JSON.parse(raw) as Profile) : null;
    return u && isGuest(u) ? u : null;
  } catch {
    return null;
  }
}

/** 이 기기에 마지막으로 쓴 게스트(로그아웃했어도 학년·학기를 기억해 «이어서 하기»에 쓴다) */
export function lastGuestChoice(): { grade: number; semester: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${GUEST_ID_KEY}_choice`);
    if (!raw) return null;
    const c = JSON.parse(raw);
    return c && c.grade >= 1 && c.grade <= 6 && (c.semester === 1 || c.semester === 2) ? c : null;
  } catch {
    return null;
  }
}

/** 게스트로 시작(또는 학년·학기 변경). 같은 기기면 같은 id 를 다시 써서 기록이 이어진다. */
export function startGuest(grade: number, semester: number): Profile {
  if (!(grade >= 1 && grade <= 6) || !(semester === 1 || semester === 2)) {
    throw new Error("학년(1~6)과 학기(1·2)를 골라 주세요.");
  }
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!isGuestId(id)) {
    id = GUEST_PREFIX + randomId();
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  ensureLocalDataOwnership(id!);
  const now = new Date().toISOString();
  const prev = readGuest();
  const user: Profile = {
    id: id!,
    role: "student",
    email: "",
    name: nicknameFor(id!),
    avatar_url: null,
    grade,
    semester,
    school_name: null,
    class_name: null,
    student_number: null,
    parent_id: null,
    teacher_id: null,
    subscription_plan: "free",
    subscription_expires_at: null,
    streak_count: prev?.streak_count ?? 0,
    total_points: prev?.total_points ?? 0,
    approval_status: "approved",
    password_hash: "",
    created_at: prev?.created_at ?? now,
    updated_at: now,
  };
  localStorage.removeItem("auth_token");
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  localStorage.setItem(`${GUEST_ID_KEY}_choice`, JSON.stringify({ grade, semester }));
  return user;
}

// ── 기록 내보내기·불러오기 ─────────────────────────────────────────
// araharu_ 로 시작하는 키만 담는다(로그인 토큰은 제외).

export function exportBackup(): Blob {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (k.startsWith("araharu_") && k !== "auth_token") data[k] = localStorage.getItem(k)!;
  }
  const body = { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data };
  return new Blob([JSON.stringify(body)], { type: "application/json" });
}

/** 불러오기 — 지금 기기의 아라하루 기록을 파일 내용으로 바꾼다. 반환 = 불러온 키 수 */
export async function importBackup(file: File): Promise<number> {
  if (file.size > 20 * 1024 * 1024) throw new Error("파일이 너무 커요(20MB 이하).");
  let body: { format?: string; version?: number; data?: Record<string, unknown> };
  try {
    body = JSON.parse(await file.text());
  } catch {
    throw new Error("아라하루 기록 파일이 아니에요.");
  }
  if (body?.format !== BACKUP_FORMAT || typeof body.data !== "object" || !body.data) {
    throw new Error("아라하루 기록 파일이 아니에요.");
  }
  const entries = Object.entries(body.data).filter(
    ([k, v]) => k.startsWith("araharu_") && typeof v === "string",
  ) as [string, string][];
  const cur = entries.find(([k]) => k === CURRENT_USER_KEY);
  if (!cur || !isGuestId(JSON.parse(cur[1])?.id)) {
    throw new Error("로그인 없이 쓴 기록만 불러올 수 있어요.");
  }
  const old: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (k.startsWith("araharu_")) old.push(k);
  }
  old.forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem("auth_token");
  for (const [k, v] of entries) localStorage.setItem(k, v);
  const id = JSON.parse(cur[1]).id as string;
  localStorage.setItem(GUEST_ID_KEY, id);
  return entries.length;
}
