"use client";

// localStorage-based auth for static/offline mode
// Since this is a Next.js static export (output: "export"), we cannot use
// real API routes during development. This module provides a complete
// auth system backed by localStorage.

import { generateId } from "./utils";
import type { Profile, ApprovalStatus } from "@/types/database";

const USERS_KEY = "araharu_users";
const CURRENT_USER_KEY = "araharu_current_user";
const TOKEN_KEY = "auth_token";

// ---------- Internal Helpers ----------

function getStoredUsers(): (Profile & { password_hash: string })[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(USERS_KEY);
    const users = data ? JSON.parse(data) : [];
    // Migration: add approval_status for legacy users
    return users.map((u: any) => ({
      ...u,
      approval_status: u.approval_status || "approved",
    }));
  } catch {
    return [];
  }
}

function saveStoredUsers(users: (Profile & { password_hash: string })[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function createToken(userId: string): string {
  return btoa(
    JSON.stringify({
      id: userId,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    }),
  );
}

function stripPasswordHash(user: Profile & { password_hash: string }): Profile {
  const { password_hash, ...safe } = user;
  return safe as Profile;
}

// ---------- Public API ----------

export interface SignupData {
  email: string;
  password: string;
  name: string;
  role: "student" | "teacher" | "parent";
  grade?: number;
  semester?: number;
  school_name?: string;
}

export interface AuthResult {
  user: Profile;
  token: string;
}

/**
 * Get all registered users (profiles without password hashes).
 */
export function getUsers(): Profile[] {
  return getStoredUsers().map(stripPasswordHash);
}

/**
 * Register a new user with localStorage persistence.
 * Throws if the email is already registered.
 * Teachers get approval_status: 'pending', others get 'approved'.
 */
export function localSignup(data: SignupData): AuthResult {
  const users = getStoredUsers();

  if (users.find((u) => u.email === data.email)) {
    throw new Error("이미 등록된 이메일입니다.");
  }

  if (!data.email || !data.password || !data.name || !data.role) {
    throw new Error("필수 항목을 모두 입력해주세요.");
  }

  if (data.password.length < 4) {
    throw new Error("비밀번호는 최소 4자 이상이어야 합니다.");
  }

  const approvalStatus: ApprovalStatus =
    data.role === "teacher" ? "pending" : "approved";

  const now = new Date().toISOString();
  const newUser: Profile & { password_hash: string } = {
    id: generateId(),
    email: data.email,
    name: data.name,
    role: data.role,
    avatar_url: null,
    grade: data.grade ?? null,
    semester: data.semester ?? 1,
    school_name: data.school_name ?? null,
    class_name: null,
    student_number: null,
    parent_id: null,
    teacher_id: null,
    subscription_plan: "free",
    subscription_expires_at: null,
    streak_count: 0,
    total_points: 0,
    approval_status: approvalStatus,
    password_hash: simpleHash(data.password),
    created_at: now,
    updated_at: now,
  };

  users.push(newUser);
  saveStoredUsers(users);

  // For pending teachers, don't set current user (they can't use the app yet)
  if (approvalStatus === "pending") {
    const token = createToken(newUser.id);
    const safeUser = stripPasswordHash(newUser);
    return { user: safeUser, token };
  }

  const token = createToken(newUser.id);
  const safeUser = stripPasswordHash(newUser);

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  localStorage.setItem(TOKEN_KEY, token);

  return { user: safeUser, token };
}

/**
 * Log in an existing user.
 * Throws if email/password do not match or if teacher is not approved.
 */
export function localLogin(email: string, password: string): AuthResult {
  const users = getStoredUsers();
  // If no @ sign, assume student login ID → append @class.local
  const normalizedEmail = email.includes("@") ? email : `${email}@class.local`;
  const user = users.find((u) => u.email === normalizedEmail);

  if (!user || user.password_hash !== simpleHash(password)) {
    throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  }

  // Block pending/rejected teachers
  if (user.role === "teacher" && user.approval_status === "pending") {
    throw new Error(
      "승인 대기 중인 계정입니다. 관리자 승인 후 로그인할 수 있습니다.",
    );
  }
  if (user.role === "teacher" && user.approval_status === "rejected") {
    throw new Error("승인이 거절된 계정입니다. 관리자에게 문의해주세요.");
  }

  const token = createToken(user.id);
  const safeUser = stripPasswordHash(user);

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
  localStorage.setItem(TOKEN_KEY, token);

  return { user: safeUser, token };
}

/**
 * Get the currently signed-in user from localStorage.
 * Returns null if not signed in or token is expired.
 */
export function localGetCurrentUser(): Profile | null {
  if (typeof window === "undefined") return null;

  try {
    const tokenStr = localStorage.getItem(TOKEN_KEY);
    if (tokenStr) {
      // Support both old (base64) and new (base64url.hmac) token formats
      const payloadPart = tokenStr.includes(".") ? tokenStr.substring(0, tokenStr.lastIndexOf(".")) : tokenStr;
      // base64url → base64
      let b64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4 !== 0) b64 += "=";
      const tokenData = JSON.parse(atob(b64));
      if (tokenData.exp < Date.now()) {
        // Token expired - clean up
        localLogout();
        return null;
      }
    }

    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) return null;
    const user = JSON.parse(data);
    // Migration: ensure approval_status exists
    if (!user.approval_status) user.approval_status = "approved";
    return user;
  } catch {
    return null;
  }
}

/**
 * Sign out the current user.
 */
export function localLogout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Update the current user's profile fields.
 * Persists changes to both the users list and current user cache.
 */
export function localUpdateProfile(
  userId: string,
  updates: Partial<Profile>,
): Profile {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("사용자를 찾을 수 없습니다.");

  const updatedUser = {
    ...users[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // Don't allow overwriting sensitive fields through this function
  updatedUser.id = users[idx].id;
  updatedUser.password_hash = users[idx].password_hash;

  users[idx] = updatedUser;
  saveStoredUsers(users);

  const safeUser = stripPasswordHash(updatedUser);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

  return safeUser;
}

/**
 * Check if the environment should use local auth (i.e. static export / development).
 * Returns true when there is no real API server to connect to.
 */
export function shouldUseLocalAuth(): boolean {
  if (typeof window === "undefined") return false;
  // In static export mode, API routes won't work, so always use local auth.
  // This can be overridden by setting NEXT_PUBLIC_USE_API=true in env.
  const useApi =
    typeof process !== "undefined"
      ? process.env?.NEXT_PUBLIC_USE_API
      : undefined;
  return useApi !== "true";
}

/**
 * Get all registered users for admin/debug purposes.
 */
export function localGetAllUsers(): Profile[] {
  return getStoredUsers().map(stripPasswordHash);
}

// ---------- Admin: Teacher Approval ----------

/**
 * Get teachers filtered by approval status.
 */
export function localGetTeachersByStatus(status?: ApprovalStatus): Profile[] {
  const users = getStoredUsers();
  const teachers = users.filter((u) => u.role === "teacher");
  if (status) {
    return teachers
      .filter((u) => u.approval_status === status)
      .map(stripPasswordHash);
  }
  return teachers.map(stripPasswordHash);
}

/**
 * Approve a teacher's account.
 */
export function localApproveTeacher(teacherId: string): Profile {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === teacherId);
  if (idx === -1) throw new Error("사용자를 찾을 수 없습니다.");
  if (users[idx].role !== "teacher") throw new Error("교사 계정이 아닙니다.");

  users[idx].approval_status = "approved";
  users[idx].updated_at = new Date().toISOString();
  saveStoredUsers(users);
  return stripPasswordHash(users[idx]);
}

/**
 * Reject a teacher's account.
 */
export function localRejectTeacher(teacherId: string): Profile {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === teacherId);
  if (idx === -1) throw new Error("사용자를 찾을 수 없습니다.");
  if (users[idx].role !== "teacher") throw new Error("교사 계정이 아닙니다.");

  users[idx].approval_status = "rejected";
  users[idx].updated_at = new Date().toISOString();
  saveStoredUsers(users);
  return stripPasswordHash(users[idx]);
}

/**
 * Get count of pending teachers.
 */
export function localGetPendingTeacherCount(): number {
  return getStoredUsers().filter(
    (u) => u.role === "teacher" && u.approval_status === "pending",
  ).length;
}

// ---------- Teacher: Bulk Student Deletion ----------

/**
 * Delete all students belonging to a specific teacher.
 * Also removes their class_members entries and updates class studentCounts.
 */
export function localBulkDeleteStudents(teacherId: string): number {
  const users = getStoredUsers();
  const studentIds = new Set(
    users
      .filter((u) => u.role === "student" && u.teacher_id === teacherId)
      .map((u) => u.id),
  );

  if (studentIds.size === 0) return 0;

  // Remove students from users
  const remaining = users.filter((u) => !studentIds.has(u.id));
  saveStoredUsers(remaining);

  // Remove from class_members
  const members = getClassMembers();
  const remainingMembers = members.filter((m) => !studentIds.has(m.student_id));
  saveClassMembers(remainingMembers);

  // Update class studentCounts
  const classes = getLocalClasses();
  for (const cls of classes) {
    cls.studentCount = remainingMembers.filter(
      (m) => m.class_id === cls.id,
    ).length;
  }
  saveLocalClasses(classes);

  // Clean up learning records
  try {
    const recordsRaw = localStorage.getItem("araharu_learning_records");
    if (recordsRaw) {
      const records = JSON.parse(recordsRaw);
      const cleaned = records.filter(
        (r: any) => !studentIds.has(r.student_id),
      );
      localStorage.setItem(
        "araharu_learning_records",
        JSON.stringify(cleaned),
      );
    }
  } catch { /* ignore */ }

  return studentIds.size;
}

// ---------- Teacher: Bulk Student Creation ----------

export interface BulkCreateResult {
  nickname: string;
  loginId: string;
  password: string;
}

const CLASS_MEMBERS_KEY = "araharu-class-members";
const CLASSES_KEY = "araharu-classes";

interface ClassMemberLocal {
  id: string;
  class_id: string;
  student_id: string;
  joined_at: string;
}

interface ClassDataLocal {
  id: string;
  name: string;
  grade: number;
  semester: number;
  studentCount: number;
  inviteCode: string;
  isActive: boolean;
  completionRate: number;
  avgScore: number;
  createdAt: string;
}

function getClassMembers(): ClassMemberLocal[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CLASS_MEMBERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveClassMembers(members: ClassMemberLocal[]): void {
  localStorage.setItem(CLASS_MEMBERS_KEY, JSON.stringify(members));
}

function getLocalClasses(): ClassDataLocal[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CLASSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalClasses(classes: ClassDataLocal[]): void {
  localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
}

/**
 * Sync all classes: migrate students by class_name into class_members.
 * Call this on the class list page to ensure studentCount is correct.
 */
export function localSyncAllClassMembers(): void {
  const classes = getLocalClasses();
  if (classes.length === 0) return;

  const members = getClassMembers();
  const allUsers = getStoredUsers();
  const now = new Date().toISOString();
  let changed = false;

  for (const cls of classes) {
    const existingIds = new Set(
      members.filter((m) => m.class_id === cls.id).map((m) => m.student_id),
    );

    for (const u of allUsers) {
      if (
        u.role === "student" &&
        u.class_name === cls.name &&
        !existingIds.has(u.id)
      ) {
        members.push({
          id: generateId(),
          class_id: cls.id,
          student_id: u.id,
          joined_at: now,
        });
        existingIds.add(u.id);
        changed = true;
      }
    }

    // Update studentCount
    const newCount = members.filter((m) => m.class_id === cls.id).length;
    if (cls.studentCount !== newCount) {
      cls.studentCount = newCount;
      changed = true;
    }
  }

  if (changed) {
    saveClassMembers(members);
    saveLocalClasses(classes);
  }
}

/**
 * Get students belonging to a specific class.
 * Also auto-migrates students that were created before class_members existed
 * (matched by class_name and teacher_id).
 */
export function localGetClassStudents(classId: string): Profile[] {
  const members = getClassMembers();
  const allUsers = getStoredUsers();
  const classes = getLocalClasses();
  const cls = classes.find((c) => c.id === classId);

  // Find students already in class_members
  const memberStudentIds = new Set(
    members.filter((m) => m.class_id === classId).map((m) => m.student_id),
  );

  // Auto-migrate: find students with matching class_name that aren't in class_members yet
  if (cls) {
    const now = new Date().toISOString();
    let migrated = false;
    for (const u of allUsers) {
      if (
        u.role === "student" &&
        u.class_name === cls.name &&
        !memberStudentIds.has(u.id)
      ) {
        members.push({
          id: generateId(),
          class_id: classId,
          student_id: u.id,
          joined_at: now,
        });
        memberStudentIds.add(u.id);
        migrated = true;
      }
    }
    if (migrated) {
      saveClassMembers(members);
      // Update class studentCount
      const classIdx = classes.findIndex((c) => c.id === classId);
      if (classIdx !== -1) {
        classes[classIdx].studentCount = memberStudentIds.size;
        saveLocalClasses(classes);
      }
    }
  }

  return allUsers
    .filter((u) => memberStudentIds.has(u.id))
    .map(stripPasswordHash);
}

/**
 * Bulk create student accounts by count.
 * Generates ara01, ara02, ... style login IDs and passwords.
 * Automatically adds students to the specified class.
 * Returns the created accounts.
 */
export function localBulkCreateStudents(
  count: number,
  options: {
    prefix: string;
    grade: number;
    semester: number;
    class_name: string;
    class_id?: string;
    teacher_id: string;
  },
): BulkCreateResult[] {
  const users = getStoredUsers();
  const results: BulkCreateResult[] = [];
  const newStudentIds: string[] = [];
  const now = new Date().toISOString();
  const prefix = options.prefix || "ara";

  for (let i = 1; i <= count; i++) {
    const num = String(i).padStart(2, "0");
    const loginId = `${prefix}${num}`;
    const password = loginId; // ID와 비밀번호 동일
    const email = `${loginId}@class.local`;
    const nickname = `${i}번`;

    // Skip if already exists
    if (users.find((u) => u.email === email)) continue;

    const studentId = generateId();
    const newUser: Profile & { password_hash: string } = {
      id: studentId,
      email,
      name: nickname,
      role: "student",
      avatar_url: null,
      grade: options.grade,
      semester: options.semester,
      school_name: null,
      class_name: options.class_name,
      student_number: i,
      parent_id: null,
      teacher_id: options.teacher_id,
      subscription_plan: "free",
      subscription_expires_at: null,
      streak_count: 0,
      total_points: 0,
      approval_status: "approved",
      password_hash: simpleHash(password),
      created_at: now,
      updated_at: now,
    };

    users.push(newUser);
    newStudentIds.push(studentId);
    results.push({ nickname, loginId, password });
  }

  saveStoredUsers(users);

  // Add students to class members and update class studentCount
  if (options.class_id && newStudentIds.length > 0) {
    const members = getClassMembers();
    for (const studentId of newStudentIds) {
      members.push({
        id: generateId(),
        class_id: options.class_id,
        student_id: studentId,
        joined_at: now,
      });
    }
    saveClassMembers(members);

    // Update class studentCount
    const classes = getLocalClasses();
    const classIdx = classes.findIndex((c) => c.id === options.class_id);
    if (classIdx !== -1) {
      const totalMembers = members.filter(
        (m) => m.class_id === options.class_id,
      ).length;
      classes[classIdx].studentCount = totalMembers;
      saveLocalClasses(classes);
    }
  }

  return results;
}

/**
 * Initialize demo accounts for development/testing.
 * Creates sample student, teacher, parent, and admin accounts if none exist.
 */
const DEMO_EMAILS = [
  "student@demo.com",
  "student2@demo.com",
  "teacher@demo.com",
  "parent@demo.com",
  "admin@demo.com",
];

/**
 * 예전 버전이 기기마다 심어 두던 데모 계정을 지운다.
 *
 * 왜 시딩을 없앴나 — 이 계정들은 localStorage 에만 있어서 **로그인에 쓸 수
 * 없다**(로그인은 전부 /api/auth/login 을 탄다). 쓰이지도 않으면서 시딩
 * 과정이 localSignup 을 호출해 CURRENT_USER_KEY/TOKEN_KEY 를 덮어썼고,
 * 마지막에 둘 다 지웠다. 즉 **시딩이 일어날 때마다 로그인한 사용자의
 * auth_token 이 삭제**됐다.
 *
 * 이게 실제로 터지는 경로: 학급 공용 기기에서 다른 학생이 로그인하면
 * ensureLocalDataOwnership → clearAllLocalData 가 araharu_users 를 지운다.
 * 그러면 다음 화면 진입 때 "데모 계정이 없네" 하고 다시 시딩하면서 방금
 * 로그인한 학생의 토큰을 날렸다. zustand 쪽 상태는 로그인으로 남아 있어
 * 화면은 멀쩡해 보이지만 모든 API 호출이 401 이 된다(학습 결과 동기화·교사
 * 화면 조회 전부). 실측으로 재현했다.
 *
 * 세션(TOKEN_KEY·CURRENT_USER_KEY)은 어떤 경우에도 건드리지 않는다.
 */
export function cleanupDemoAccounts(): void {
  if (typeof window === "undefined") return;
  try {
    const users = getStoredUsers();
    const kept = users.filter((u) => !DEMO_EMAILS.includes(u.email));
    if (kept.length !== users.length) {
      saveStoredUsers(kept as (Profile & { password_hash: string })[]);
    }
  } catch {
    // 정리 실패가 앱 진입을 막아서는 안 된다.
  }
}
