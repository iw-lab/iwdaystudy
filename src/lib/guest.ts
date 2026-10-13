// 로그인 없이 쓰는 «이 기기 학생».
//
// 학습 세트 생성·채점·기록은 원래 전부 브라우저(localStorage)에서 돈다. 그래서 계정이
// 없어도 학년·학기만 있으면 똑같이 쓸 수 있다. 게스트는 서버에 아무것도 보내지 않는다
// (토큰이 없으니 sync 가 큐에 쌓지도 않게 isGuestId 로 막는다). 이름·학교 같은 개인정보는
// 받지 않는다 — 화면에 보이는 이름은 기기마다 정해지는 별명이다.
//
// 기기를 바꿀 때를 위해 기록을 파일로 내보내고 불러오는 기능을 함께 둔다.

import type { Profile } from "@/types/database";
import { ensureLocalDataOwnership, getLearningRecords } from "@/lib/local-storage";
import { flushSyncQueue, restoreFromServer } from "@/lib/sync";

export const GUEST_PREFIX = "guest-";
const GUEST_ID_KEY = "araharu_guest_id";
const CURRENT_USER_KEY = "araharu_current_user";
// 학급 계정에서 «이 기기 학생»으로 옮겨 온 id. 기록이 이 id 로 쌓여 있어서 id 를 바꾸지 않고 그대로 쓴다.
const ADOPTED_KEY = "araharu_adopted_id";
const OWNER_KEY = "araharu_local_data_owner";
const BACKUP_FORMAT = "araharu-backup";
const BACKUP_VERSION = 1;

const NICK_A = ["반짝", "씩씩한", "느긋한", "용감한", "꼼꼼한", "상냥한", "튼튼한", "산뜻한"];
const NICK_B = ["다람쥐", "고래", "부엉이", "판다", "수달", "펭귄", "여우", "거북이"];

export function isGuestId(id: string | null | undefined): boolean {
  if (typeof id !== "string" || !id) return false;
  if (id.startsWith(GUEST_PREFIX)) return true;
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ADOPTED_KEY) === id;
  } catch {
    return false;
  }
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
/** 학급·선생님 계정(손님 아님)으로 로그인돼 있나 */
export function hasAccountSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (!localStorage.getItem("auth_token")) return false;
    const u = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
    return !!u?.id && !isGuestId(u.id);
  } catch {
    return false;
  }
}

/**
 * 이 기기에 남은 학급 계정 학생 기록(로그인 없이 이어받을 수 있는 것).
 * 지금 로그인된 학생이거나, 로그인은 풀렸어도 이 기기에 그 학생의 학습 기록이 남아 있으면 해당한다.
 * 선생님·관리자 계정은 학습 기록이 없으니 해당하지 않는다.
 */
export function adoptableAccount(): { id: string; name: string; grade: number | null; semester: 1 | 2 | null } | null {
  if (typeof window === "undefined") return null;
  try {
    const owner = localStorage.getItem(OWNER_KEY);
    if (!owner || isGuestId(owner)) return null;
    const u = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null") as Profile | null;
    const me = u?.id === owner ? u : null;
    if (me && me.role !== "student") return null;
    if (!me && getLearningRecords(owner).length === 0) return null;
    const g = Number(me?.grade);
    const sem = Number(me?.semester);
    return {
      id: owner,
      name: me?.name || "",
      grade: Number.isInteger(g) && g >= 1 && g <= 6 ? g : null,
      semester: sem === 1 || sem === 2 ? sem : null,
    };
  } catch {
    return null;
  }
}

/**
 * 학급 계정 기록을 이 기기 학생으로 옮겨 로그인 없이 이어서 쓴다.
 * 로그인이 살아 있으면 마지막으로 서버와 맞춘다(못 올린 결과 올리기 + 서버 기록 내려받기).
 * id 는 그대로 두므로 기록·오늘의 세트·연속 기록이 그대로 이어진다. 이후로는 서버에 보내지 않는다.
 */
export async function adoptAccount(grade: number, semester: number): Promise<Profile> {
  const acc = adoptableAccount();
  if (!acc) throw new Error("이 기기에 이어받을 학급 기록이 없어요.");
  const token = localStorage.getItem("auth_token");
  let cur: Profile | null = null;
  try {
    cur = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
  } catch {
    /* 없으면 기록만 이어받는다 */
  }
  if (token && cur?.id === acc.id) {
    const last = Promise.all([flushSyncQueue(acc.id, token), restoreFromServer(acc.id)]).catch(() => null);
    await Promise.race([last, new Promise((r) => setTimeout(r, 8000))]);
  }
  localStorage.setItem(ADOPTED_KEY, acc.id);
  localStorage.setItem(GUEST_ID_KEY, acc.id);
  if (cur?.id === acc.id) localStorage.setItem("araharu_guest_last", JSON.stringify(cur));
  localStorage.removeItem("auth_token");
  localStorage.removeItem(CURRENT_USER_KEY);
  return startGuest(grade, semester);
}

export function startGuest(grade: number, semester: number): Profile {
  if (!Number.isInteger(grade) || !(grade >= 1 && grade <= 6) || !(semester === 1 || semester === 2)) {
    throw new Error("학년(1~6)과 학기(1·2)를 골라 주세요.");
  }
  // 학급 계정으로 로그인된 기기에서는 손님으로 바꾸지 않는다 — 바꾸면 아래 ensureLocalDataOwnership 이
  // 그 학생의 기기 기록(아직 서버에 못 올린 결과 포함)을 지운다(2026-10-13).
  if (hasAccountSession()) {
    throw new Error("학급 계정으로 로그인되어 있어요. 먼저 로그아웃한 뒤 시작해 주세요.");
  }
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!isGuestId(id)) {
    id = GUEST_PREFIX + randomId();
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  ensureLocalDataOwnership(id!);
  const now = new Date().toISOString();
  let prev = readGuest();
  if (!prev) {
    try {
      const last = JSON.parse(localStorage.getItem("araharu_guest_last") || "null");
      if (last?.id === id) prev = last;
    } catch {
      /* 남은 프로필이 깨졌으면 새로 시작 */
    }
  }
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
function safeCount(x: unknown): number {
  const n = Number(x);
  return Number.isSafeInteger(n) && n >= 0 ? n : 0;
}

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
  if (typeof body.version === "number" && body.version > BACKUP_VERSION) {
    throw new Error("더 새 버전에서 만든 기록 파일이에요. 앱을 새로 고친 뒤 다시 불러와 주세요.");
  }
  const entries = Object.entries(body.data).filter(
    ([k, v]) => k.startsWith("araharu_") && typeof v === "string",
  ) as [string, string][];
  const cur = entries.find(([k]) => k === CURRENT_USER_KEY);
  let src: Partial<Profile> | null = null;
  try {
    src = cur ? JSON.parse(cur[1]) : null;
  } catch {
    src = null;
  }
  const id = src?.id;
  const g = Number(src?.grade);
  const sem = Number(src?.semester);
  // 학급 계정에서 옮겨 온 기록은 파일 안의 «옮겨 온 id» 표시로 알아본다(이 기기 표시가 아니라)
  const adoptedInFile = entries.find(([k]) => k === ADOPTED_KEY)?.[1];
  const localId = typeof id === "string" && !!id && (id.startsWith(GUEST_PREFIX) || adoptedInFile === id);
  if (!localId || !Number.isInteger(g) || g < 1 || g > 6 || !(sem === 1 || sem === 2)) {
    throw new Error("로그인 없이 쓴 기록만 불러올 수 있어요.");
  }
  // 프로필은 파일 그대로 믿지 않고 다시 만든다 — 이름은 생성 닉네임, 개인정보 칸은 비운다(손님 불변식)
  const now = new Date().toISOString();
  const profile: Profile = {
    id: id!, role: "student", email: "", name: nicknameFor(id!), avatar_url: null, grade: g, semester: sem,
    school_name: null, class_name: null, student_number: null, parent_id: null, teacher_id: null,
    subscription_plan: "free", subscription_expires_at: null,
    streak_count: safeCount(src?.streak_count),
    total_points: safeCount(src?.total_points),
    approval_status: "approved", password_hash: "", created_at: now, updated_at: now,
  };
  // 프로필 사본·손님 id 는 파일 것을 쓰지 않는다(검증 안 된 프로필이 다시 살아나는 길을 막는다)
  const next = entries
    .filter(([k, v]) => k !== "araharu_guest_last" && k !== GUEST_ID_KEY && (k !== ADOPTED_KEY || v === id))
    .map(([k, v]) => (k === CURRENT_USER_KEY ? ([k, JSON.stringify(profile)] as [string, string]) : [k, v]));
  // 지우기 전에 지금 기록을 떠 둔다 — 쓰다가 용량 초과 등으로 실패하면 그대로 되돌린다
  const backup: [string, string][] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (k.startsWith("araharu_")) backup.push([k, localStorage.getItem(k)!]);
  }
  const token = localStorage.getItem("auth_token");
  try {
    backup.forEach(([k]) => localStorage.removeItem(k));
    localStorage.removeItem("auth_token");
    for (const [k, v] of next) localStorage.setItem(k, v);
    localStorage.setItem(GUEST_ID_KEY, id!);
  } catch {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)!;
      if (k.startsWith("araharu_")) localStorage.removeItem(k);
    }
    // 되돌리기는 지운 만큼만 다시 쓰니 공간이 모자랄 일이 없지만, 그래도 한 항목 실패가 나머지를 막지 않게 하나씩
    for (const [k, v] of backup) {
      try {
        localStorage.setItem(k, v);
      } catch {
        /* 다음 항목 계속 */
      }
    }
    if (token) localStorage.setItem("auth_token", token);
    throw new Error("기기 저장 공간이 모자라 불러오지 못했어요. 지금 기록은 그대로예요.");
  }
  return next.length;
}
