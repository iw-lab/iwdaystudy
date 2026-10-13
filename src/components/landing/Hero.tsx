"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, BookOpen, Shield, Lock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const floatingItems = [
  { icon: "\uD83D\uDCD0", x: "10%", y: "20%", delay: 0 },
  { icon: "\u270F\uFE0F", x: "85%", y: "15%", delay: 0.5 },
  { icon: "\uD83D\uDCD6", x: "5%", y: "70%", delay: 1 },
  { icon: "\uD83C\uDFA8", x: "90%", y: "65%", delay: 1.5 },
  { icon: "\uD83D\uDD22", x: "15%", y: "45%", delay: 0.8 },
  { icon: "\uD83D\uDCA1", x: "80%", y: "40%", delay: 1.2 },
];

// Animated counter component
function AnimatedStat({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const step = Math.max(1, Math.floor(value / 40));
    const interval = setInterval(() => {
      current += step;
      if (current >= value) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(current);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [value, started]);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl sm:text-3xl font-black text-primary">
        {count}{suffix}
      </span>
      <span className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

// Grade selector preview
function GradeSelector() {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const grades = [1, 2, 3, 4, 5, 6];
  const gradeColors = ['#FF8BA7', '#F9CA24', '#4ECDC4', '#4169E1', '#A18CD1', '#2ECC71'];
  const gradeSubjects: Record<number, string[]> = {
    1: ['수학', '국어', '맞춤법', '안전'],
    2: ['수학', '국어', '맞춤법', '한자'],
    3: ['수학', '국어', '영어', '한자', '상식'],
    4: ['수학', '국어', '영어', '한자', '상식'],
    5: ['수학', '국어', '영어', '한자', '어휘'],
    6: ['수학', '국어', '영어', '한자', '어휘'],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="w-full max-w-md mx-auto mt-4"
    >
      <p className="text-xs text-muted-foreground text-center mb-3 font-medium">
        학년을 눌러 과목을 미리 보세요
      </p>
      <div className="flex items-center justify-center gap-2">
        {grades.map((g, i) => (
          <motion.button
            key={g}
            onClick={() => setSelectedGrade(selectedGrade === g ? null : g)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl font-bold text-sm transition-all ${
              selectedGrade === g
                ? 'text-white shadow-lg scale-105'
                : 'bg-white/80 border-2 border-border hover:border-primary/30 text-foreground'
            }`}
            style={selectedGrade === g ? { backgroundColor: gradeColors[i] } : {}}
          >
            {g}
            {selectedGrade === g && (
              <motion.div
                layoutId="grade-indicator"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white"
              />
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedGrade && (
          <motion.div
            key={selectedGrade}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap justify-center gap-2 mt-3 pt-3 border-t border-border/50">
              {gradeSubjects[selectedGrade]?.map((subject, idx) => (
                <motion.span
                  key={subject}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-full bg-primary/10 text-primary text-xs font-medium px-3 py-1"
                >
                  {subject}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E8F5E8] via-background to-background" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating decorations */}
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl sm:text-3xl pointer-events-none select-none opacity-20"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: item.delay,
            ease: "easeInOut",
          }}
        >
          {item.icon}
        </motion.div>
      ))}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="gap-1.5 px-4 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              2022 개정 교육과정 기반
            </Badge>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="block">매일 아침,</span>
            <span className="block mt-2 bg-gradient-to-r from-primary to-ara-blue bg-clip-text text-transparent">
              알아가는 즐거움
            </span>
          </motion.h1>

          {/* Mascot area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
            className="my-8 relative"
          >
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-primary/20 to-ara-blue/20 flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Sprout body */}
                  <ellipse cx="50" cy="82" rx="20" ry="8" fill="#2ECC71" opacity="0.2" />
                  <path d="M50 80 L50 40" stroke="#2ECC71" strokeWidth="4" strokeLinecap="round" />
                  <path d="M50 55 C38 52 32 40 38 30 C44 24 50 32 50 42" fill="#2ECC71" />
                  <path d="M50 46 C62 44 68 32 62 22 C56 16 50 24 50 34" fill="#27AE60" />
                  {/* Cute face */}
                  <circle cx="43" cy="50" r="2.5" fill="#1A1A2E" />
                  <circle cx="57" cy="50" r="2.5" fill="#1A1A2E" />
                  <path d="M46 56 Q50 60 54 56" stroke="#1A1A2E" strokeWidth="2" strokeLinecap="round" fill="none" />
                  {/* Blush */}
                  <circle cx="39" cy="54" r="3" fill="#FF8BA7" opacity="0.4" />
                  <circle cx="61" cy="54" r="3" fill="#FF8BA7" opacity="0.4" />
                  {/* Pencil hat */}
                  <path d="M50 40 L44 24 L50 12 L56 24 Z" fill="#F9CA24" />
                  <path d="M50 12 L47 18 L53 18 Z" fill="#1A1A2E" />
                  {/* Sparkles */}
                  <motion.circle cx="68" cy="18" r="2" fill="#F9CA24"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ transformOrigin: "68px 18px" }} />
                  <motion.circle cx="32" cy="28" r="1.5" fill="#F9CA24"
                    animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.8, 1.1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    style={{ transformOrigin: "32px 28px" }} />
                  {/* Blinking animation */}
                  <motion.rect
                    x="41" y="48" width="4" height="5" rx="2" fill="#FAFDF7"
                    animate={{ scaleY: [0, 0, 1, 0, 0] }}
                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.48, 0.5, 0.52, 1] }}
                    style={{ transformOrigin: "43px 50px" }}
                  />
                  <motion.rect
                    x="55" y="48" width="4" height="5" rx="2" fill="#FAFDF7"
                    animate={{ scaleY: [0, 0, 1, 0, 0] }}
                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.48, 0.5, 0.52, 1] }}
                    style={{ transformOrigin: "57px 50px" }}
                  />
                </svg>
              </motion.div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
          >
            초등 1~6학년 맞춤 일일학습 프로그램.{" "}
            <span className="text-foreground font-medium">매일 30분 아침학습</span>으로
            수학, 국어, 영어, 한자까지 학습 습관을 만들어요.
          </motion.p>

          {/* Animated stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 grid grid-cols-3 gap-6 sm:gap-10"
          >
            <AnimatedStat value={12} label="학습 과목" suffix="개" />
            <AnimatedStat value={6} label="학년 커리큘럼" suffix="학년" />
            <AnimatedStat value={30} label="하루 학습 시간" suffix="분" />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Button
              size="lg"
              className="h-14 px-10 text-base font-bold gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
              asChild
            >
              <Link href="/">
                무료로 시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-10 text-base gap-2" asChild>
              <a href="#features">
                <BookOpen className="h-4 w-4" />
                자세히 알아보기
              </a>
            </Button>
          </motion.div>

          {/* Grade selector preview */}
          <GradeSelector />

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <GraduationCap className="h-4 w-4 text-primary" />
              </div>
              <span>교육부 교육과정 기반</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                <Lock className="h-4 w-4 text-blue-500" />
              </div>
              <span>개인정보 보호</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
                <Shield className="h-4 w-4 text-amber-500" />
              </div>
              <span>광고 없는 학습 환경</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 60L48 55C96 50 192 40 288 45C384 50 480 70 576 75C672 80 768 70 864 60C960 50 1056 40 1152 45C1248 50 1344 70 1392 80L1440 90V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z"
            fill="var(--background)"
          />
        </svg>
      </div>
    </section>
  );
}
