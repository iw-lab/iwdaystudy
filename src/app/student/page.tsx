"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Star, Trophy, BookOpen, TrendingUp, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useDailySet } from "@/hooks/useDailySet";
import {
  getStreakCount,
  getTotalPoints,
  getCompletedDates,
  getRecordForSet,
  getEarnedBadges,
} from "@/lib/local-storage";
import DailySetCard from "@/components/learning/DailySetCard";
import Mascot from "@/components/learning/Mascot";
import XPLevelDisplay from "@/components/learning/XPLevelDisplay";
import StreakDisplay from "@/components/learning/StreakDisplay";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { dailySet, isLoading, error, setIndex, completedCount, maxSets, allDone } =
    useDailySet();
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [todayScore, setTodayScore] = useState<number | undefined>();
  const [completedDays, setCompletedDays] = useState(0);
  const [completedDates, setCompletedDates] = useState<string[]>([]);

  // 오늘의 세트(하루 최대 maxSets개)를 모두 마쳤는지
  const todayCompleted = allDone;

  useEffect(() => {
    if (!user) return;
    setStreak(getStreakCount(user.id));
    setPoints(getTotalPoints(user.id));
    setBadgeCount(getEarnedBadges(user.id).length);
    const dates = getCompletedDates(user.id);
    setCompletedDates(dates);
    setCompletedDays(dates.length);

    if (dailySet && allDone) {
      const record = getRecordForSet(user.id, dailySet.set.id);
      if (record?.is_completed) setTodayScore(record.total_score);
    }
  }, [user, dailySet, allDone]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="학습 세트 준비 중..." />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "좋은 아침이에요"
      : hour < 18
        ? "열심히 공부하고 있네요"
        : "오늘 하루도 수고했어요";

  return (
    <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] lg:gap-8 lg:items-start">
      {/* Left column */}
      <div className="space-y-6">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {greeting},{" "}
              <span className="text-primary">{user?.name || "학생"}</span>님!
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.grade ? `${user.grade}학년 ${user.semester || 1}학기` : ""}{" "}
              | 오늘도 알찬 하루를 시작해볼까요?
            </p>
          </div>
          <Mascot state={todayCompleted ? "happy" : "default"} size={60} />
        </motion.div>

        {/* Today's learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            오늘의 학습
            {maxSets > 1 && (
              <span className="ml-auto flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                {Array.from({ length: maxSets }, (_, i) => (
                  <span
                    key={i}
                    className={`inline-block h-2.5 w-2.5 rounded-full ${
                      i < completedCount
                        ? "bg-green-500"
                        : i === completedCount && !todayCompleted
                          ? "bg-primary"
                          : "bg-muted-foreground/20"
                    }`}
                  />
                ))}
                <span className="ml-1">
                  {todayCompleted
                    ? `오늘 ${maxSets}세트 모두 완료!`
                    : `${setIndex}번째 세트`}
                </span>
              </span>
            )}
          </h2>
          {dailySet ? (
            <DailySetCard
              dailySet={dailySet.set}
              questions={dailySet.questions}
              isCompleted={todayCompleted}
              score={todayScore}
              streak={streak}
            />
          ) : error ? (
            <Card className="py-8 border-red-200">
              <CardContent className="text-center text-red-600">
                <p className="font-bold">학습 세트 오류</p>
                <p className="text-sm mt-1">{error}</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="py-8">
              <CardContent className="text-center text-muted-foreground">
                <p>학년과 학기를 설정해주세요.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Completion / progress message */}
        {(todayCompleted || completedCount > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">
                    {todayCompleted
                      ? maxSets > 1
                        ? `오늘 ${maxSets}세트를 모두 완료했어요! 정말 대단해요!`
                        : "오늘 학습을 모두 완료했어요! 정말 대단해요!"
                      : `${completedCount}세트 완료! 더 하고 싶으면 다음 세트에 도전해 보세요!`}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* XP Level Display - Mobile only (shows below learning card) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:hidden"
        >
          <XPLevelDisplay
            totalPoints={points}
            todayPoints={
              todayCompleted && todayScore ? Math.round(todayScore * 0.5) : 0
            }
          />
        </motion.div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Stats cards */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center py-4 px-3 lg:text-left lg:py-3">
              <CardContent className="p-0 lg:flex lg:items-center lg:gap-3 lg:px-2">
                <motion.div
                  animate={streak > 0 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Flame className="w-6 h-6 mx-auto mb-1 lg:mx-0 lg:mb-0 lg:flex-shrink-0 text-orange-500" />
                </motion.div>
                <div>
                  <div className="text-2xl font-black text-orange-500 lg:text-xl">
                    {streak}
                  </div>
                  <div className="text-xs text-muted-foreground">연속 학습</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center py-4 px-3 lg:text-left lg:py-3">
              <CardContent className="p-0 lg:flex lg:items-center lg:gap-3 lg:px-2">
                <Star className="w-6 h-6 mx-auto mb-1 lg:mx-0 lg:mb-0 lg:flex-shrink-0 text-yellow-500" />
                <div>
                  <div className="text-2xl font-black text-yellow-500 lg:text-xl">
                    {points.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">총 포인트</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="text-center py-4 px-3 lg:text-left lg:py-3">
              <CardContent className="p-0 lg:flex lg:items-center lg:gap-3 lg:px-2">
                <Trophy className="w-6 h-6 mx-auto mb-1 lg:mx-0 lg:mb-0 lg:flex-shrink-0 text-purple-500" />
                <div>
                  <div className="text-2xl font-black text-purple-500 lg:text-xl">
                    {badgeCount}
                  </div>
                  <div className="text-xs text-muted-foreground">획득 뱃지</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* XP Level Display - Desktop only */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="hidden lg:block"
        >
          <XPLevelDisplay
            totalPoints={points}
            todayPoints={
              todayCompleted && todayScore ? Math.round(todayScore * 0.5) : 0
            }
          />
        </motion.div>

        {/* Streak calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StreakDisplay
            currentStreak={streak}
            completedDates={completedDates}
          />
        </motion.div>

        {/* Quick stats summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card>
            <CardContent className="py-4">
              <h3 className="text-sm font-bold text-muted-foreground mb-3">
                학습 요약
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">총 학습일</p>
                    <p className="text-lg font-bold">{completedDays}일</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">최고 연속</p>
                    <p className="text-lg font-bold">{streak}일</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
