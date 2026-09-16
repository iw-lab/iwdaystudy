"use client";

import { useEffect } from "react";
import { UpdateNotification } from "./UpdateNotification";
import { IOSInstallBanner } from "./IOSInstallBanner";
import { cleanupDemoAccounts } from "@/lib/local-auth";
import { useAuthStore } from "@/stores/authStore";
import {
  backfillSyncQueue,
  flushSyncQueue,
  restoreFromServer,
} from "@/lib/sync";

// 서버 기록 복원은 브라우저 세션당 한 번이면 충분하다(기기 교체·데이터 삭제
// 복구용). 페이지를 옮길 때마다 부르지 않도록 sessionStorage 로 표시한다.
function markRestoredOnce(userId: string): boolean {
  try {
    const key = `araharu_restored_${userId}`;
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return false;
  }
}

export function ClientProviders() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = user?.id;
  const role = user?.role;

  useEffect(() => {
    // 예전 버전이 심어 둔 데모 계정 정리(세션은 건드리지 않는다)
    cleanupDemoAccounts();

    // Unregister any existing service worker and clear caches
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
      }
    }
  }, []);

  // 학습 결과 서버 동기화. 학습 자체는 오프라인에서도 되지만, 결과가 서버에
  // 올라가야 선생님·학부모 화면에 보이고 다른 기기에서도 이어진다.
  useEffect(() => {
    if (!isAuthenticated || !userId || role !== "student") return;

    let cancelled = false;
    const run = async () => {
      // 복원은 오늘의 세트 생성과 경쟁할 수 있다(둘 다 마운트 직후 시작).
      // 새 기기에서 첫 진입 시 이미 다른 기기에서 푼 세트를 한 번 더 받을 수
      // 있는데, 다음 진입부터는 복원된 기록이 반영되므로 자연히 사라진다.
      // 여기서 서로 기다리게 만들면 학습 시작이 네트워크에 묶이므로 그대로 둔다.
      if (markRestoredOnce(userId)) {
        await restoreFromServer(userId);
      }
      if (cancelled) return;
      backfillSyncQueue(userId);
      await flushSyncQueue(userId);
    };
    void run();

    const onOnline = () => {
      void flushSyncQueue(userId);
    };
    window.addEventListener("online", onOnline);
    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
    };
  }, [isAuthenticated, userId, role]);

  return (
    <>
      <UpdateNotification />
      <IOSInstallBanner />
    </>
  );
}
