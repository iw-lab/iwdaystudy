"use client";

import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  Activity,
  BookOpen,
  FileQuestion,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  BarChart3,
  Sparkles,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { dbGet } from "@/lib/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types/database";

const quickActions = [
  {
    label: "콘텐츠 생성",
    href: "/admin/content/generate",
    icon: Sparkles,
    color: "text-primary",
  },
  {
    label: "사용자 관리",
    href: "/admin/users",
    icon: Users,
    color: "text-blue-500",
  },
  {
    label: "분석 보기",
    href: "/admin/analytics",
    icon: BarChart3,
    color: "text-purple-500",
  },
  {
    label: "콘텐츠 관리",
    href: "/admin/content",
    icon: BookOpen,
    color: "text-orange-500",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

interface OverviewCard {
  title: string;
  value: string;
  icon: typeof Users;
  color: string;
}

interface RecentActivity {
  action: string;
  detail: string;
  time: string;
}

export default function AdminDashboard() {
  const [pendingCount, setPendingCount] = useState(0);
  const [overviewCards, setOverviewCards] = useState<OverviewCard[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    [],
  );
  const [roleBreakdown, setRoleBreakdown] = useState<
    { role: string; count: number; color: string }[]
  >([]);

  useEffect(() => {
    loadFromApi();
  }, []);

  function formatTimeAgo(dateStr: string): string {
    const now = new Date();
    const created = new Date(dateStr);
    const diffMin = Math.round((now.getTime() - created.getTime()) / 60000);
    if (diffMin < 1) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}시간 전`;
    return `${Math.floor(diffMin / 1440)}일 전`;
  }

  function roleLabel(role: string): string {
    return role === "student" ? "학생" : role === "teacher" ? "교사" : role === "parent" ? "학부모" : "관리자";
  }

  function applyDashboardData(data: {
    totalUsers: number;
    paidSubscriptions: number;
    activeStudents: number;
    totalSets: number;
    pendingTeachers: number;
    roleCounts: { student: number; teacher: number; parent: number; admin: number };
    recentUsers: { id: string; name: string; role: string; grade: number | null; created_at: string }[];
    recentLearning: { studentName: string; setTitle: string; score: number; maxScore: number; completedAt: string }[];
  }) {
    setPendingCount(data.pendingTeachers);

    setOverviewCards([
      {
        title: "총 사용자",
        value: data.totalUsers.toLocaleString(),
        icon: Users,
        color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
      },
      {
        title: "유료 구독",
        value: data.paidSubscriptions.toLocaleString(),
        icon: CreditCard,
        color: "text-green-600 bg-green-100 dark:bg-green-900/30",
      },
      {
        title: "주간 활성 학생",
        value: data.activeStudents.toLocaleString(),
        icon: Activity,
        color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
      },
      {
        title: "학습 세트",
        value: data.totalSets.toLocaleString(),
        icon: BookOpen,
        color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
      },
    ]);

    setRoleBreakdown([
      { role: "학생", count: data.roleCounts.student, color: "bg-blue-400" },
      { role: "교사", count: data.roleCounts.teacher, color: "bg-green-400" },
      { role: "학부모", count: data.roleCounts.parent, color: "bg-purple-400" },
      { role: "관리자", count: data.roleCounts.admin, color: "bg-amber-400" },
    ]);

    const activities: RecentActivity[] = [];

    // Recent signups
    for (const u of data.recentUsers.slice(0, 5)) {
      const gradeInfo = u.grade ? ` (${u.grade}학년)` : "";
      activities.push({
        action: "사용자 가입",
        detail: `${u.name}${gradeInfo} (${roleLabel(u.role)})`,
        time: formatTimeAgo(u.created_at),
      });
    }

    // Recent learning completions
    for (const l of data.recentLearning.slice(0, 5)) {
      activities.push({
        action: "학습 완료",
        detail: `${l.studentName} - ${l.setTitle} (${l.score}/${l.maxScore}점)`,  // gb-frac-ok
        time: formatTimeAgo(l.completedAt),
      });
    }

    // Sort combined activities by time (most recent first)
    activities.sort((a, b) => {
      const timeOrder = (t: string) => {
        if (t === "방금 전") return 0;
        const m = t.match(/(\d+)(분|시간|일)/);
        if (!m) return 9999;
        const n = parseInt(m[1]);
        if (m[2] === "분") return n;
        if (m[2] === "시간") return n * 60;
        return n * 1440;
      };
      return timeOrder(a.time) - timeOrder(b.time);
    });

    setRecentActivities(
      activities.length > 0
        ? activities.slice(0, 10)
        : [{ action: "활동 없음", detail: "아직 등록된 활동이 없습니다", time: "-" }],
    );
  }

  async function loadFromApi() {
    try {
      const data = await dbGet<{
        totalUsers: number;
        paidSubscriptions: number;
        activeStudents: number;
        totalSets: number;
        pendingTeachers: number;
        roleCounts: { student: number; teacher: number; parent: number; admin: number };
        recentUsers: { id: string; name: string; role: string; grade: number | null; created_at: string }[];
        recentLearning: { studentName: string; setTitle: string; score: number; maxScore: number; completedAt: string }[];
      }>("/admin/stats");
      applyDashboardData(data);
    } catch {
      applyDashboardData({
        totalUsers: 0,
        paidSubscriptions: 0,
        activeStudents: 0,
        totalSets: 0,
        pendingTeachers: 0,
        roleCounts: { student: 0, teacher: 0, parent: 0, admin: 0 },
        recentUsers: [],
        recentLearning: [],
      });
    }
  }

  const maxRole = Math.max(...roleBreakdown.map((r) => r.count), 1);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">관리자 대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1">
            아라하루 서비스 현황을 한눈에 확인하세요.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/generate">
            <Plus className="h-4 w-4 mr-2" />
            콘텐츠 생성
          </Link>
        </Button>
      </div>

      {/* Pending Approval Banner */}
      {pendingCount > 0 && (
        <Link href="/admin/approvals">
          <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      승인 대기 중인 교사 {pendingCount}명
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      클릭하여 승인 관리 페이지로 이동
                    </p>
                  </div>
                </div>
                <Badge className="bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                  {pendingCount}건
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Overview cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {overviewCards.map((card) => (
          <motion.div key={card.title} variants={itemVariants}>
            <Card className="border shadow-sm">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}
                  >
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role breakdown chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">역할별 사용자 분포</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  현재
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {roleBreakdown.length > 0 &&
              roleBreakdown.some((r) => r.count > 0) ? (
                <div className="flex items-end gap-2 h-48 mt-4">
                  {roleBreakdown.map((d) => (
                    <div
                      key={d.role}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <span className="text-xs text-muted-foreground font-medium">
                        {d.count.toLocaleString()}
                      </span>
                      <div
                        className={`w-full rounded-t-lg ${d.color} transition-all duration-500`}
                        style={{
                          height: `${(d.count / maxRole) * 140}px`,
                          minHeight: d.count > 0 ? "8px" : "0px",
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {d.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  데이터 없음
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">빠른 작업</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-accent transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.detail}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
