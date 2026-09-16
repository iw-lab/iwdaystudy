import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/types/database";
import type { SignupData } from "@/lib/local-auth";
import { ensureLocalDataOwnership } from "@/lib/local-storage";
import { flushSyncQueue } from "@/lib/sync";

interface AuthState {
  user: Profile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    expectedRole?: "student" | "staff",
  ) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Profile>) => void;
  setUser: (user: Profile | null) => void;
}

async function apiLogin(
  email: string,
  password: string,
  expectedRole?: "student" | "staff",
): Promise<{ user: Profile; token: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, expected_role: expectedRole }),
  });
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ message: "로그인에 실패했습니다." }));
    throw new Error(err?.message || "로그인에 실패했습니다.");
  }
  return res.json();
}

async function apiSignup(
  data: SignupData,
): Promise<{ user: Profile; token: string | null }> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ message: "회원가입에 실패했습니다." }));
    throw new Error(err?.message || "회원가입에 실패했습니다.");
  }
  return res.json();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password, expectedRole) => {
        set({ isLoading: true });
        try {
          const result = await apiLogin(email, password, expectedRole);
          // 기기 공유(학급 공용 PC/태블릿) 대응: 마지막으로 이 기기에 로그인했던
          // 사용자와 다르면 이전 사용자의 학습 데이터를 지운다. 같은 학생이
          // 다시 로그인하는 경우엔 지우지 않아 기록이 보존된다.
          ensureLocalDataOwnership(result.user.id);
          localStorage.setItem("auth_token", result.token);
          localStorage.setItem(
            "araharu_current_user",
            JSON.stringify(result.user),
          );
          set({
            user: result.user,
            token: result.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (data) => {
        set({ isLoading: true });
        try {
          const result = await apiSignup(data);
          if (
            result.user.role === "teacher" &&
            result.user.approval_status === "pending"
          ) {
            set({
              user: result.user,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }
          if (result.token) {
            ensureLocalDataOwnership(result.user.id);
            localStorage.setItem("auth_token", result.token);
            localStorage.setItem(
              "araharu_current_user",
              JSON.stringify(result.user),
            );
          }
          set({
            user: result.user,
            token: result.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // 아직 서버에 못 올린 학습 결과가 있으면, 토큰이 살아 있는 지금이
        // 마지막 기회다(로그아웃 뒤엔 인증할 방법이 없다). 토큰을 인자로 넘겨
        // localStorage 를 지운 뒤에도 전송이 완료되게 한다.
        const { user, token } = get();
        if (token && user?.role === "student") {
          void flushSyncQueue(user.id, token);
        }
        localStorage.removeItem("auth_token");
        localStorage.removeItem("araharu_current_user");
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, ...data } });
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: "araharu-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
