"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Flame,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  UserPlus,
  Trash2,
  Download,
  KeyRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/stores/authStore";
import { dbGet, dbPost, dbDelete } from "@/lib/db/client";
import { getLearningRecords, getStreakCount } from "@/lib/local-storage";

interface ServerStudent {
  id: string;
  email: string;
  name: string;
  grade: number | null;
  semester: number | null;
  class_name: string | null;
  student_number: number | null;
  streak_count: number | null;
  total_points: number | null;
  created_at: string;
  // 서버 집계(D1 learning_records) — 교사 기기엔 학생 기록이 없으므로 이게 진실원
  completed_sessions?: number | null;
  avg_percent?: number | null;
  last_completed_at?: string | null;
}

interface StudentRow {
  id: string;
  name: string;
  loginId: string;
  grade: number;
  className: string;
  streak: number;
  lastActive: string;
  lastActiveTs: number;
  avgScore: number;
  totalSessions: number;
}

type SortField = "name" | "streak" | "avgScore" | "lastActive";
type SortDirection = "asc" | "desc";

export default function TeacherStudentsPage() {
  const { user } = useAuthStore();
  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  // 비밀번호 초기화 — 두 번 눌러야 실행된다(브라우저 confirm 대화상자 대신).
  const [confirmResetId, setConfirmResetId] = useState<string | null>(null);
  const [resetBusyId, setResetBusyId] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{
    name: string;
    loginId: string;
    password: string;
  } | null>(null);
  const [resetError, setResetError] = useState("");

  async function handleResetPassword(studentId: string) {
    setResetError("");
    setResetBusyId(studentId);
    try {
      const res = await dbPost<{
        name: string;
        login_id: string;
        new_password: string;
      }>("/teacher/reset-password", { student_id: studentId });
      setResetResult({
        name: res.name,
        loginId: res.login_id,
        password: res.new_password,
      });
    } catch (err) {
      setResetError(
        err instanceof Error ? err.message : "비밀번호 초기화에 실패했습니다.",
      );
    } finally {
      setResetBusyId(null);
      setConfirmResetId(null);
    }
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      let myStudents: ServerStudent[] = [];
      try {
        const res = await dbGet<{ students: ServerStudent[] }>("/teacher/students");
        myStudents = res.students || [];
      } catch {
        myStudents = [];
      }
      if (cancelled) return;

      const rows: StudentRow[] = myStudents.map((student) => {
        // 서버 집계가 기본. 로컬 기록은 이 기기에서 그 학생이 직접 학습한
        // 경우에만 있으므로(교사 기기엔 보통 없다) 보조로만 쓴다.
        const records = getLearningRecords(student.id);
        const completedRecords = records.filter((r) => r.is_completed);
        const streak = student.streak_count ?? getStreakCount(student.id) ?? 0;

      const serverSessions = student.completed_sessions ?? 0;
      const totalSessions = Math.max(serverSessions, completedRecords.length);

      // Average score
      let avgScore = 0;
      if (serverSessions > 0 && typeof student.avg_percent === "number") {
        avgScore = Math.round(student.avg_percent);
      } else if (completedRecords.length > 0) {
        const totalPct = completedRecords.reduce((sum, r) => {
          return (
            sum + (r.max_score > 0 ? (r.total_score / r.max_score) * 100 : 0)
          );
        }, 0);
        avgScore = Math.round(totalPct / completedRecords.length);
      }

      // Last active
      let lastActive = "활동 없음";
      let lastActiveTs = 0;
      const localLatest =
        completedRecords.length > 0
          ? Math.max(
              ...completedRecords.map((r) =>
                new Date(r.completed_at || r.created_at).getTime(),
              ),
            )
          : 0;
      const serverLatest = student.last_completed_at
        ? new Date(student.last_completed_at).getTime()
        : 0;
      lastActiveTs = Math.max(
        Number.isFinite(localLatest) ? localLatest : 0,
        Number.isFinite(serverLatest) ? serverLatest : 0,
      );
      if (lastActiveTs > 0) {
        const diffDays = Math.floor(
          (Date.now() - lastActiveTs) / (1000 * 60 * 60 * 24),
        );
        if (diffDays <= 0) lastActive = "오늘";
        else if (diffDays === 1) lastActive = "어제";
        else lastActive = `${diffDays}일 전`;
      }

      // Extract login ID from email (e.g., ara01@class.local → ara01)
      const loginId = student.email?.includes("@class.local")
        ? student.email.split("@")[0]
        : "";

      return {
        id: student.id,
        name: student.name,
        loginId,
        grade: student.grade || 0,
        className: student.class_name || "-",
        streak,
        lastActive,
        lastActiveTs,
        avgScore,
        totalSessions,
      };
    });

      setStudentRows(rows);
      setIsLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const filteredStudents = useMemo(() => {
    let result = [...studentRows];

    if (search) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (classFilter !== "all") {
      result = result.filter((s) => s.className === classFilter);
    }

    result.sort((a, b) => {
      let compare = 0;
      switch (sortField) {
        case "name":
          compare = a.name.localeCompare(b.name, "ko");
          break;
        case "streak":
          compare = a.streak - b.streak;
          break;
        case "avgScore":
          compare = a.avgScore - b.avgScore;
          break;
        case "lastActive":
          compare = a.lastActiveTs - b.lastActiveTs;
          break;
      }
      return sortDirection === "asc" ? compare : -compare;
    });

    return result;
  }, [search, classFilter, sortField, sortDirection, studentRows]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  const classes = [
    ...new Set(studentRows.map((s) => s.className).filter((c) => c !== "-")),
  ];

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            학생 관리
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            전체 학생 목록 ({studentRows.length}명)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {studentRows.length > 0 && studentRows.some((s) => s.loginId) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const rows = studentRows.filter((s) => s.loginId);
                const header = "번호,이름,아이디,비밀번호\n";
                const csv = rows
                  .map(
                    (s, i) =>
                      `${i + 1},${s.name},${s.loginId},${s.loginId}`,
                  )
                  .join("\n");
                const blob = new Blob(["\uFEFF" + header + csv], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `학생계정_${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              계정 CSV
            </Button>
          )}
          {studentRows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (!user) return;
                if (
                  !confirm(
                    `내 학생 ${studentRows.length}명을 모두 삭제하시겠습니까?\n학습 기록도 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`,
                  )
                )
                  return;
                try {
                  const ids = studentRows.map((s) => s.id);
                  const res = await dbDelete<{ deleted: number }>(
                    "/teacher/students",
                    { student_ids: ids },
                  );
                  alert(`${res.deleted}명의 학생이 삭제되었습니다.`);
                  setStudentRows([]);
                } catch (e) {
                  alert(e instanceof Error ? e.message : "삭제에 실패했습니다.");
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              전체 삭제
            </Button>
          )}
          <Button asChild>
            <Link href="/teacher/students/bulk-create">
              <UserPlus className="h-4 w-4 mr-1" />
              학생 일괄 생성
            </Link>
          </Button>
        </div>
      </motion.div>

      {studentRows.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground text-lg font-medium">
                등록된 학생이 없습니다
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                학생 일괄 생성으로 학생을 추가하세요.
              </p>
              <Button asChild className="mt-4">
                <Link href="/teacher/students/bulk-create">
                  <UserPlus className="h-4 w-4 mr-1" />
                  학생 일괄 생성
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="학생 이름 검색..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {classes.length > 0 && (
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="w-[120px]">
                        <Filter className="h-3.5 w-3.5 mr-1.5" />
                        <SelectValue placeholder="반" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Students Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {resetResult && (
              <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm font-medium text-emerald-900">
                  {resetResult.name} 학생의 비밀번호를 초기화했습니다.
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  아이디{" "}
                  <span className="font-mono font-semibold">
                    {resetResult.loginId}
                  </span>{" "}
                  / 새 비밀번호{" "}
                  <span className="font-mono font-semibold">
                    {resetResult.password}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setResetResult(null)}
                  className="mt-2 text-xs text-emerald-700 underline"
                >
                  닫기
                </button>
              </div>
            )}
            {resetError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {resetError}
              </div>
            )}
            <Card>
              <CardContent className="p-0">
                {/* Table Header */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_100px_80px_80px_100px_80px_40px] gap-3 px-4 py-3 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors text-left"
                    onClick={() => toggleSort("name")}
                  >
                    이름 <SortIcon field="name" />
                  </button>
                  <span className="flex items-center gap-1">
                    <KeyRound className="h-3 w-3" />
                    계정
                  </span>
                  <span>반</span>
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => toggleSort("streak")}
                  >
                    연속 <SortIcon field="streak" />
                  </button>
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => toggleSort("lastActive")}
                  >
                    최근 활동 <SortIcon field="lastActive" />
                  </button>
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => toggleSort("avgScore")}
                  >
                    평균 <SortIcon field="avgScore" />
                  </button>
                  <span />
                </div>

                {/* Table Body */}
                <div className="divide-y">
                  {filteredStudents.length === 0 ? (
                    <div className="flex flex-col items-center py-12">
                      <Users className="h-10 w-10 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        검색 결과가 없습니다
                      </p>
                    </div>
                  ) : (
                    filteredStudents.map((student, idx) => (
                      <Link
                        key={student.id}
                        href={`/teacher/students/${student.id}`}
                      >
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.02 * idx }}
                          className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_100px_80px_80px_100px_80px_40px] gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer items-center group"
                        >
                          {/* Name */}
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarFallback>{student.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {student.name}
                              </p>
                              {student.loginId && (
                                <p className="text-[10px] font-mono text-primary/70 sm:hidden">
                                  ID: {student.loginId}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground sm:hidden">
                                {student.className} | {student.avgScore}점 |{" "}
                                {student.lastActive}
                              </p>
                            </div>
                          </div>

                          {/* Mobile: badges */}
                          <div className="flex items-center gap-2 sm:hidden">
                            {student.streak > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <Flame className="h-3 w-3 text-orange-500 mr-0.5" />
                                {student.streak}
                              </Badge>
                            )}
                            <ExternalLink className="h-4 w-4 text-muted-foreground/40" />
                          </div>

                          {/* Desktop columns */}
                          <span className="hidden sm:block text-xs font-mono text-muted-foreground">
                            {student.loginId || "-"}
                          </span>
                          <span className="hidden sm:block text-sm text-muted-foreground">
                            {student.className}
                          </span>
                          <span className="hidden sm:flex items-center gap-1 text-sm">
                            {student.streak > 0 ? (
                              <>
                                <Flame className="h-3.5 w-3.5 text-orange-500" />
                                {student.streak}일
                              </>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </span>
                          <span className="hidden sm:block text-sm text-muted-foreground">
                            {student.lastActive}
                          </span>
                          <span className="hidden sm:block text-sm font-medium">
                            {student.avgScore}점
                          </span>
                          <span className="hidden sm:flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="비밀번호 초기화"
                              disabled={resetBusyId === student.id}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (confirmResetId === student.id) {
                                  void handleResetPassword(student.id);
                                } else {
                                  setResetError("");
                                  setConfirmResetId(student.id);
                                }
                              }}
                              className={
                                confirmResetId === student.id
                                  ? "rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors"
                                  : "rounded p-1 text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-colors"
                              }
                            >
                              {confirmResetId === student.id ? (
                                "초기화?"
                              ) : (
                                <KeyRound className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </span>
                        </motion.div>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}
