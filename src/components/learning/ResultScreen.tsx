'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy, Home, RotateCcw, Star, Clock, CheckCircle, XCircle,
  Sparkles, Zap, TrendingUp, Share2, BookX, Flame,
} from 'lucide-react';
import { SUBJECTS } from '@/types/learning';
import Mascot from './Mascot';
import type { Question } from '@/types/database';

interface SubjectScore {
  subject: string;
  correct: number;
  total: number;
}

interface Props {
  questions: Question[];
  correctIndices: Set<number>;
  answeredIndices: Set<number>;
  totalScore: number;
  maxScore: number;
  elapsedSeconds: number;
  onRetry: () => void;
  onGoHome: () => void;
  reviewCorrected?: number[];
  reviewTotal?: number;
}

// --- Confetti Piece ---
function ConfettiPiece({ delay, x }: { delay: number; x: number }) {
  const colors = ['#2ECC71', '#F9CA24', '#FF6B35', '#4ECDC4', '#FF8BA7', '#A18CD1'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 6 + Math.random() * 6;

  return (
    <motion.div
      className="absolute top-0 pointer-events-none"
      style={{
        left: `${x}%`,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: '100vh',
        opacity: [1, 1, 0],
        rotate: 720 * (Math.random() > 0.5 ? 1 : -1),
        x: [0, (Math.random() - 0.5) * 100],
      }}
      transition={{
        duration: 2.5 + Math.random() * 1.5,
        delay,
        ease: 'easeIn',
      }}
    />
  );
}

// --- Animated Counter ---
function AnimatedCounter({ target, duration = 1.2, delay = 0 }: { target: number; duration?: number; delay?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const step = target / (duration * 60);
      const animate = () => {
        start += step;
        if (start >= target) {
          setCount(target);
          return;
        }
        setCount(Math.floor(start));
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return <>{count}</>;
}

// --- Performance message ---
function getPerformanceData(scorePercent: number) {
  if (scorePercent === 100) return {
    emoji: '',
    title: '완벽해요!',
    message: '모든 문제를 맞혔어요! 정말 대단해요!',
    color: 'text-yellow-500',
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200',
  };
  if (scorePercent >= 90) return {
    emoji: '',
    title: '훌륭해요!',
    message: '거의 다 맞혔어요! 조금만 더 연습하면 완벽!',
    color: 'text-green-600',
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
  };
  if (scorePercent >= 80) return {
    emoji: '',
    title: '잘했어요!',
    message: '열심히 공부한 보람이 있네요!',
    color: 'text-blue-600',
    bg: 'bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200',
  };
  if (scorePercent >= 60) return {
    emoji: '',
    title: '좋아요!',
    message: '꾸준히 하면 더 잘할 수 있어요!',
    color: 'text-purple-600',
    bg: 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200',
  };
  return {
    emoji: '',
    title: '힘내요!',
    message: '틀린 문제를 다시 풀어보면 금방 늘어요!',
    color: 'text-orange-600',
    bg: 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200',
  };
}

// --- XP calculation ---
function calculateXP(scorePercent: number, totalQuestions: number) {
  const baseXP = totalQuestions * 5;
  const bonusMultiplier = scorePercent >= 100 ? 2 : scorePercent >= 80 ? 1.5 : scorePercent >= 60 ? 1.2 : 1;
  return Math.round(baseXP * bonusMultiplier);
}

export default function ResultScreen({
  questions,
  correctIndices,
  answeredIndices,
  totalScore,
  maxScore,
  elapsedSeconds,
  onRetry,
  onGoHome,
  reviewCorrected,
  reviewTotal,
}: Props) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'detail'>('overview');
  const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const isGoodScore = scorePercent >= 80;
  const perfData = getPerformanceData(scorePercent);

  // Calculate subject scores
  const subjectScores = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>();
    questions.forEach((q, i) => {
      if (['emotion_check', 'readiness_check', 'writing', 'creative'].includes(q.subject)) return;
      const existing = map.get(q.subject) || { correct: 0, total: 0 };
      existing.total++;
      if (correctIndices.has(i)) existing.correct++;
      map.set(q.subject, existing);
    });
    return Array.from(map.entries()).map(([subject, scores]) => ({
      subject,
      ...scores,
    }));
  }, [questions, correctIndices]);

  const totalCorrect = Array.from(correctIndices).length;
  const totalGraded = subjectScores.reduce((acc, s) => acc + s.total, 0);
  const wrongIndices = useMemo(() => {
    return questions
      .map((q, i) => ({ q, i }))
      .filter(({ q, i }) =>
        !['emotion_check', 'readiness_check', 'writing', 'creative'].includes(q.subject)
        && answeredIndices.has(i)
        && !correctIndices.has(i)
      );
  }, [questions, answeredIndices, correctIndices]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const xpEarned = calculateXP(scorePercent, totalGraded);

  // Mascot state and message
  const mascotState = isGoodScore ? 'correct' as const : 'encourage' as const;
  const mascotMessage = perfData.title;

  useEffect(() => {
    if (isGoodScore) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isGoodScore]);

  useEffect(() => {
    const timer = setTimeout(() => setShowXPAnimation(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = useCallback(() => {
    const text = `[아라하루] 오늘의 학습 결과: ${scorePercent}점! ${totalCorrect}/${totalGraded} 문제를 맞혔어요!`;
    if (navigator.share) {
      navigator.share({ title: '아라하루 학습 결과', text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }, [scorePercent, totalCorrect, totalGraded]);

  return (
    <div className="relative flex flex-col items-center gap-5 py-4 px-4 w-full max-w-lg mx-auto overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiPiece
              key={i}
              delay={Math.random() * 1}
              x={Math.random() * 100}
            />
          ))}
        </div>
      )}

      {/* Celebration header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="mb-2"
        >
          <Mascot state={mascotState} message={mascotMessage} size={72} />
        </motion.div>
      </motion.div>

      {/* Score ring */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 150, delay: 0.3 }}
        className="relative flex items-center justify-center"
      >
        <div className="relative w-40 h-40">
          {/* SVG ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--muted)" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={isGoodScore ? 'var(--primary)' : '#F59E0B'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - scorePercent / 100) }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
            />
          </svg>
          {/* Score text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-5xl font-black"
            >
              <AnimatedCounter target={scorePercent} delay={0.8} />
            </motion.span>
            <span className="text-sm font-bold text-muted-foreground">점</span>
          </div>
        </div>

        {/* Star decorations for good scores */}
        {isGoodScore && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-1 -right-1"
            >
              <Star className="h-7 w-7 fill-[#F9CA24] text-[#F9CA24]" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-1 -left-1"
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Performance message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`w-full rounded-2xl border p-4 text-center ${perfData.bg}`}
      >
        <p className={`text-lg font-bold ${perfData.color}`}>{perfData.title}</p>
        <p className="text-sm text-muted-foreground mt-1">{perfData.message}</p>
      </motion.div>

      {/* XP gain animation */}
      <AnimatePresence>
        {showXPAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 px-5 py-3"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              <Zap className="h-6 w-6 text-amber-500 fill-amber-400" />
            </motion.div>
            <div>
              <p className="text-sm font-bold text-amber-700">
                +<AnimatedCounter target={xpEarned} delay={1.5} duration={0.8} /> XP 획득!
              </p>
              <p className="text-[11px] text-amber-600">경험치를 모아 레벨을 올려보세요</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-3 gap-3 w-full"
      >
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-green-50 border border-green-100 p-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-lg font-bold text-green-700">{totalCorrect}</span>
          <span className="text-xs text-green-600">맞은 문제</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-red-50 border border-red-100 p-3">
          <XCircle className="h-5 w-5 text-red-400" />
          <span className="text-lg font-bold text-red-700">{totalGraded - totalCorrect}</span>
          <span className="text-xs text-red-600">틀린 문제</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-blue-50 border border-blue-100 p-3">
          <Clock className="h-5 w-5 text-blue-500" />
          <span className="text-lg font-bold text-blue-700">{minutes}:{String(seconds).padStart(2, '0')}</span>
          <span className="text-xs text-blue-600">걸린 시간</span>
        </div>
      </motion.div>

      {/* Review stats (Duolingo-style) */}
      {reviewTotal != null && reviewTotal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full rounded-2xl border p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw className="h-4 w-4 text-amber-600" />
            <span className="font-bold text-amber-800 text-sm">복습 결과</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-amber-700">
                틀린 {reviewTotal}문제 중 <span className="font-bold text-green-600">{reviewCorrected?.length || 0}문제</span>를 복습으로 맞혔어요!
              </p>
            </div>
            {(reviewCorrected?.length || 0) === reviewTotal && (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                완벽한 복습!
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Tab switcher for detail views */}
      {subjectScores.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full"
        >
          <div className="flex gap-1 rounded-xl bg-muted p-1 mb-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              과목별 결과
            </button>
            <button
              onClick={() => setActiveTab('detail')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'detail'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookX className="h-3.5 w-3.5" />
              오답 노트
              {wrongIndices.length > 0 && (
                <span className="ml-1 h-5 min-w-5 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-[10px] font-bold px-1">
                  {wrongIndices.length}
                </span>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <Card className="border-border">
                  <CardContent className="pt-4 space-y-3">
                    {subjectScores.map((s, idx) => {
                      const info = SUBJECTS[s.subject];
                      const percent = s.total > 0 ? (s.correct / s.total) * 100 : 0;
                      return (
                        <motion.div
                          key={s.subject}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + idx * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-sm"
                            style={{
                              backgroundColor: `${info?.color || 'var(--muted)'}15`,
                            }}
                          >
                            {info?.icon || '?'}
                          </div>
                          <Badge
                            variant="outline"
                            className="min-w-[52px] justify-center text-xs"
                            style={{
                              borderColor: info?.color || 'var(--border)',
                              color: info?.color || 'var(--foreground)',
                              backgroundColor: `${info?.color || 'var(--muted)'}10`,
                            }}
                          >
                            {info?.name || s.subject}
                          </Badge>
                          <div className="flex-1 h-3.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              className="h-full rounded-full relative overflow-hidden"
                              style={{ backgroundColor: info?.color || 'var(--primary)' }}
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ delay: 0.9 + idx * 0.1, duration: 0.5 }}
                            >
                              {/* Shimmer effect */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 1.5, delay: 1.4 + idx * 0.1 }}
                              />
                            </motion.div>
                          </div>
                          <span className="text-xs font-bold min-w-[40px] text-right">
                            {s.correct} / {s.total}
                          </span>
                          {/* Mini performance indicator */}
                          {percent === 100 && (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          )}
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'detail' && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <Card className="border-border">
                  <CardContent className="pt-4 space-y-3">
                    {wrongIndices.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-400" />
                        <p className="font-bold">틀린 문제가 없어요!</p>
                        <p className="text-sm mt-1">완벽한 성적이에요!</p>
                      </div>
                    ) : (
                      wrongIndices.map(({ q, i }) => {
                        const info = SUBJECTS[q.subject];
                        const correctAnswer = q.answer?.correct || q.answer?.answer || q.answer?.reading || q.answer?.text || '';
                        return (
                          <div
                            key={i}
                            className="rounded-xl border p-3 bg-red-50/50"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm">{info?.icon}</span>
                              <span className="text-xs font-bold" style={{ color: info?.color }}>
                                {info?.name || q.subject}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {i + 1}번 문제
                              </span>
                            </div>
                            <p className="text-sm font-medium mb-1 line-clamp-2">
                              {q.content?.expression || q.content?.text || q.content?.sentence || q.title || ''}
                            </p>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-green-600 font-bold">
                                정답: {String(correctAnswer)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Earned badges / streak */}
      {isGoodScore && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-2 rounded-full bg-[#F9CA24]/10 border border-[#F9CA24]/30 px-4 py-2">
            <Trophy className="h-4 w-4 text-[#F9CA24]" />
            <span className="text-sm font-bold text-[#B8860B]">
              {scorePercent === 100 ? '완벽한 점수!' : '열심히 했어요!'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-4 py-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-600">
              연속 학습!
            </span>
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex flex-col gap-3 w-full"
      >
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="outline"
            onClick={onRetry}
            className="flex-1 h-12 rounded-xl text-base font-bold gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            다시 풀기
          </Button>
          <Button
            onClick={onGoHome}
            className="flex-1 h-12 rounded-xl text-base font-bold gap-2"
          >
            <Home className="h-4 w-4" />
            홈으로
          </Button>
        </div>

        {/* Share button */}
        <Button
          variant="ghost"
          onClick={handleShare}
          className="w-full h-10 rounded-xl text-sm font-medium gap-2 text-muted-foreground hover:text-foreground"
        >
          <Share2 className="h-4 w-4" />
          학습 결과 공유하기
        </Button>
      </motion.div>
    </div>
  );
}
