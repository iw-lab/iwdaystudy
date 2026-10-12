"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  History,
  BarChart3,
  Award,
  Users,
  FileText,
  Heart,
  School,
  ClipboardList,
  BookOpen,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type UserRole = "student" | "teacher" | "parent";

interface MobileNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const MOBILE_NAV: Record<UserRole, MobileNavItem[]> = {
  student: [
    { href: "/student", label: "\uD648", icon: LayoutDashboard },
    { href: "/student/daily", label: "\uD559\uC2B5", icon: BookOpen },
    { href: "/student/stats", label: "\uD1B5\uACC4", icon: BarChart3 },
    { href: "/student/history", label: "\uAE30\uB85D", icon: History },
    { href: "/student/rewards", label: "\uBCA7\uC9C0", icon: Award },
    { href: "/student/settings", label: "설정", icon: Settings },
  ],
  teacher: [
    { href: "/teacher", label: "\uD648", icon: LayoutDashboard },
    { href: "/teacher/classes", label: "\uD559\uAE09", icon: School },
    { href: "/teacher/students", label: "\uD559\uC0DD", icon: Users },
    {
      href: "/teacher/assignments",
      label: "\uACFC\uC81C",
      icon: ClipboardList,
    },
    { href: "/teacher/reports", label: "\uB9AC\uD3EC\uD2B8", icon: FileText },
  ],
  parent: [
    { href: "/parent", label: "\uD648", icon: LayoutDashboard },
    { href: "/parent/children", label: "\uC790\uB140", icon: Heart },
    { href: "/parent/reports", label: "\uB9AC\uD3EC\uD2B8", icon: FileText },
    { href: "/parent/settings", label: "\uC124\uC815", icon: Settings },
  ],
};

interface MobileNavProps {
  role: UserRole;
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const items = MOBILE_NAV[role];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname === item.href + "/" ||
            (item.href !== "/student" &&
              item.href !== "/teacher" &&
              item.href !== "/parent" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[52px] min-h-[44px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="relative">
                <motion.div
                  animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <item.icon className="h-5 w-5" />
                </motion.div>
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive && "font-bold",
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-indicator"
                  className="absolute -bottom-0.5 h-1 w-8 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
