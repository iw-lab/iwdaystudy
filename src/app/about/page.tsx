"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Sparkles,
  Target,
  Heart,
  TrendingUp,
  GraduationCap,
  Lightbulb,
  Clock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "하루 문제", value: "15~21개", icon: BookOpen, color: "text-blue-500" },
  { label: "학년 커리큘럼", value: "6개 학년", icon: GraduationCap, color: "text-primary" },
  { label: "학습 과목", value: "12개", icon: Sparkles, color: "text-purple-500" },
  { label: "교육과정", value: "2022 개정", icon: Target, color: "text-orange-500" },
];

const steps = [
  {
    step: 1,
    title: "학년·학기 고르기",
    description: "가입 없이 학년과 학기만 고르면 그날의 학습 세트가 기기에서 바로 만들어져요.",
    icon: GraduationCap,
    color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  },
  {
    step: 2,
    title: "하루 한 세트",
    description: "1~2학년 15문제, 3~4학년 20문제, 5~6학년 21문제를 여러 과목에서 조금씩 풀어요. 날마다 문제를 무작위로 새로 뽑고, 이미 푼 문제는 되도록 다시 내지 않아요.",
    icon: Clock,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    step: 3,
    title: "성장 기록 확인",
    description: "학습 통계와 뱃지로 아이의 성장을 확인하세요. 틀린 문제는 끝나자마자 다시 풀어 봐요.",
    icon: TrendingUp,
    color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  },
];

const values = [
  {
    icon: Heart,
    title: "학년 맞춤",
    description: "1~2학년, 3~4학년, 5~6학년마다 과목 구성과 문제 수가 달라요. 3학년부터 한자·영어가 들어가요.",
  },
  {
    icon: Target,
    title: "학기 진도",
    description: "수학·과학·사회·영어는 2022 개정 교육과정 단원을 기준으로 고른 학기 진도에 맞는 문제만 골라요.",
  },
  {
    icon: Shield,
    title: "안전한 환경",
    description: "광고도 가입도 없고, 이름·이메일 같은 개인정보를 받지 않아요. 기록은 쓰는 기기에만 저장돼요.",
  },
  {
    icon: Lightbulb,
    title: "틀린 문제 다시 풀기",
    description: "세트를 끝내면 바로 채점하고, 틀린 문제는 그 자리에서 다시 풀어 봐요.",
  },
  {
    icon: Brain,
    title: "정답률에 따라 난이도 조절",
    description: "AI가 아니라 정해진 규칙이에요. 과목마다 정답률이 85% 이상이면 조금 어렵게, 45% 이하면 조금 쉽게 내요.",
  },
  {
    icon: Sparkles,
    title: "동기부여",
    description: "뱃지, 연속 학습 기록, 경험치 레벨이 있고 문제마다 마스코트가 반응해요.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero / Mission */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/3 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              아라하루 소개
            </Badge>
            <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl leading-tight">
              매일 아침,{" "}
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                알아가는 즐거움
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              아라하루는 &ldquo;알아가다&rdquo;의 순우리말 &lsquo;아라&rsquo;와 &lsquo;하루&rsquo;를
              합친 이름입니다. 매일 하루, 조금씩 알아가는 기쁨을 통해 아이들이
              스스로 배움을 즐기는 사람으로 성장하길 바랍니다.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <Card className="text-center border-0 shadow-sm bg-card/80 backdrop-blur-sm">
                  <CardContent className="pt-6 pb-6">
                    <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                    <div className="text-3xl md:text-4xl font-black text-foreground">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              아라하루는 이렇게{" "}
              <span className="text-primary">동작해요</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              간단한 3단계로 아이의 학습 습관을 만들어 갈 수 있습니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center"
              >
                {/* Step connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/30 to-primary/10" />
                )}

                <div
                  className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl ${step.color}`}
                >
                  <step.icon className="h-10 w-10" />
                </div>

                <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4">
                  {step.step}
                </div>

                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Education Philosophy */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              우리의{" "}
              <span className="text-primary">교육 철학</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              아라하루가 소중히 여기는 가치들입니다.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {values.map((value) => (
              <motion.div key={value.title} variants={itemVariants}>
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="pt-8 pb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-5">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team / Values quote */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <blockquote className="text-2xl md:text-3xl font-bold leading-relaxed">
              &ldquo;아이들이 매일 아침 눈을 뜨면{" "}
              <span className="text-primary">오늘은 무엇을 알아갈까</span>{" "}
              기대하는 세상을 만들고 싶습니다.&rdquo;
            </blockquote>
            <p className="mt-6 text-muted-foreground">
              심선생
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" />
                현직 초등교사가 만들었어요
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              우리 아이의 학습 여정을{" "}
              <span className="text-primary">시작해 보세요</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              가입 없이 무료로, 학년만 고르면 바로 시작해요.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/">바로 시작하기</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
