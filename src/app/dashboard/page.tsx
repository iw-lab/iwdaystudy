"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { localGetCurrentUser } from "@/lib/local-auth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const user = localGetCurrentUser();
    if (!user) {
      router.replace("/");
      return;
    }

    switch (user.role) {
      case "teacher":
      case "admin":
        router.replace("/teacher/");
        break;
      case "parent":
        router.replace("/parent/");
        break;
      default:
        router.replace("/student/");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner size="lg" text="대시보드로 이동 중..." />
    </div>
  );
}
