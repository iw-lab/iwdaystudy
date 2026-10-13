"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { isGuest } from "@/lib/guest";
import { Logo } from "@/components/common/Logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  History,
  BarChart3,
  Award,
  Users,
  BookOpen,
  Settings,
  FileText,
  ClipboardList,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Heart,
  School,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type UserRole = "student" | "teacher" | "parent";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  student: [
    { href: "/student", label: "홈", icon: LayoutDashboard },
    { href: "/student/daily", label: "오늘의 학습", icon: BookOpen },
    { href: "/student/stats", label: "학습 통계", icon: BarChart3 },
    { href: "/student/history", label: "학습 기록", icon: History },
    { href: "/student/rewards", label: "뱃지/보상", icon: Award },
    { href: "/student/settings", label: "설정", icon: Settings },
  ],
  teacher: [
    { href: "/teacher", label: "대시보드", icon: LayoutDashboard },
    { href: "/teacher/classes", label: "학급 관리", icon: School },
    { href: "/teacher/students", label: "학생 관리", icon: Users },
    { href: "/teacher/assignments", label: "과제 관리", icon: ClipboardList },
    { href: "/teacher/reports", label: "리포트", icon: FileText },
    { href: "/teacher/settings", label: "설정", icon: Settings },
  ],
  parent: [
    { href: "/parent", label: "대시보드", icon: LayoutDashboard },
    { href: "/parent/children", label: "자녀 관리", icon: Heart },
    { href: "/parent/reports", label: "리포트", icon: FileText },
    { href: "/parent/settings", label: "시간 관리", icon: Settings },
  ],
};

interface SidebarProps {
  role: UserRole;
  userName?: string;
  className?: string;
}

export function Sidebar({
  role,
  userName = "사용자",
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const guest = isGuest(user);
  const [collapsed, setCollapsed] = useState(false);
  const items = NAV_ITEMS[role];

  const handleLogout = () => {
    logout();
    // 로그인 없이 쓰던 학생은 처음 화면으로(기록은 기기에 남아 «이어서 하기»가 된다)
    router.push("/");
  };

  const roleLabels: Record<UserRole, string> = {
    student: "학생",
    teacher: "선생님",
    parent: "학부모",
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r bg-sidebar transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-[68px]" : "w-[240px]",
        className,
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b",
          collapsed && "justify-center",
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          {collapsed ? (
            <GraduationCap className="h-7 w-7 text-primary shrink-0" />
          ) : (
            <Logo size={30} />
          )}
        </Link>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {items.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname === item.href + "/" ||
              (item.href !== "/student" &&
                item.href !== "/teacher" &&
                item.href !== "/parent" &&
                pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    collapsed && "justify-center px-0",
                    isActive &&
                      "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User info */}
      <div className={cn("p-3", collapsed && "flex justify-center")}>
        {collapsed ? (
          <Avatar size="sm">
            <AvatarFallback>{userName[0]}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback>{userName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground">
                {guest && user?.grade && user?.semester
                  ? `${user.grade}학년 ${user.semester}학기 · 이 기기`
                  : roleLabels[role]}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleLogout}
              aria-label={guest ? "처음 화면으로" : "로그아웃"}
              title={guest ? "처음 화면으로" : "로그아웃"}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2 text-xs">접기</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
