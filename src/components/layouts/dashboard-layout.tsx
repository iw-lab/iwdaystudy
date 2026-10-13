"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { localGetCurrentUser } from "@/lib/local-auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { UpdateNotification } from "@/components/common/UpdateNotification";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import NicknameModal from "@/components/common/NicknameModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  // Restore user from localStorage on mount
  useEffect(() => {
    const storedUser = localGetCurrentUser();
    if (storedUser) {
      // Block unapproved teachers from accessing dashboard
      if (
        storedUser.role === "teacher" &&
        storedUser.approval_status !== "approved"
      ) {
        router.push("/");
        return;
      }
      setUser(storedUser);
      setIsReady(true);
    } else {
      router.push("/");
    }
  }, [setUser, router]);

  // Role-based route protection
  useEffect(() => {
    if (isReady && user) {
      const role = user.role;
      if (
        pathname.startsWith("/teacher") &&
        role !== "teacher" &&
        role !== "admin"
      ) {
        router.push("/student/");
      } else if (
        pathname.startsWith("/parent") &&
        role !== "parent" &&
        role !== "admin"
      ) {
        router.push("/student/");
      }
    }
  }, [isReady, user, pathname, router]);

  if (!isReady || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="로딩 중..." />
      </div>
    );
  }

  // Map admin role to teacher for sidebar/nav
  const navRole: "student" | "teacher" | "parent" =
    user.role === "admin"
      ? "teacher"
      : (user.role as "student" | "teacher" | "parent");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <Sidebar role={navRole} userName={user.name} />

      {/* Main content area */}
      <main className="flex-1 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto p-4 md:p-6 lg:p-8">{children}</div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav role={navRole} />

      {/* Update notification banner */}
      <UpdateNotification />

      {/* Nickname setup for bulk-created students */}
      <NicknameModal />
    </div>
  );
}
