"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Menu,
  X,
  UserCheck,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/Logo";
import { useAuthStore } from "@/stores/authStore";

const sidebarLinks = [
  {
    href: "/admin",
    label: "대시보드",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/content",
    label: "콘텐츠 관리",
    icon: BookOpen,
  },
  {
    href: "/admin/content/generate",
    label: "AI 생성",
    icon: Sparkles,
    indent: true,
  },
  {
    href: "/admin/approvals",
    label: "승인 관리",
    icon: UserCheck,
  },
  {
    href: "/admin/users",
    label: "사용자 관리",
    icon: Users,
  },
  {
    href: "/admin/classes",
    label: "학급 관리",
    icon: School,
  },
  {
    href: "/admin/analytics",
    label: "분석",
    icon: BarChart3,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Wait for zustand persist to hydrate from localStorage before
  // making any auth decisions — otherwise refresh bounces to /login.
  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return () => unsub();
  }, []);

  // Protect admin routes
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [hydrated, isAuthenticated, user, router]);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b">
        <Link href="/admin" className="flex items-center gap-2 min-w-0">
          <Logo size={collapsed ? 28 : 24} showText={!collapsed} />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex h-8 w-8 shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Admin badge */}
      {!collapsed && (
        <div className="px-4 py-3">
          <Badge
            variant="secondary"
            className="w-full justify-center gap-1.5 py-1.5"
          >
            <Shield className="h-3.5 w-3.5" />
            관리자 모드
          </Badge>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              link.indent && !collapsed && "ml-6",
              isActive(link.href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <link.icon
              className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")}
            />
            {!collapsed && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t px-3 py-3">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
            collapsed && "justify-center",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>사이트로 돌아가기</span>}
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-4 bg-background/95 backdrop-blur-sm border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo size={24} />
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 text-xs">
            <Shield className="h-3 w-3" />
            관리자
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-14 left-0 bottom-0 z-40 w-64 bg-background border-r transform transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full pt-2">
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  link.indent && "ml-6",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
          <div className="border-t px-3 py-3">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>사이트로 돌아가기</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed top-0 left-0 bottom-0 z-30 flex-col border-r bg-background transition-all duration-200",
          collapsed ? "w-16" : "w-60",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "transition-all duration-200 pt-14 lg:pt-0",
          collapsed ? "lg:ml-16" : "lg:ml-60",
        )}
      >
        {/* Desktop header */}
        <header className="hidden lg:flex items-center justify-between h-14 px-6 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-medium text-muted-foreground">
              {sidebarLinks.find((l) => isActive(l.href))?.label || "관리자"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {user?.name || "관리자"}
            </span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
              {user?.name?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
