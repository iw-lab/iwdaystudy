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
  { label: "학습 문제", value: "50,000+", icon: BookOpen, color: "text-blue-500" },
  { label: "학년 커리큘럼", value: "6개 학년", icon: GraduationCap, color: "text-primary" },
  { label: "학습 과목", value: "12개", icon: Sparkles, color: "text-purple-500" },
  { label: "교육과정", value: "2022 개정", icon: Target, color: "text-orange-500" },
];

const steps = [
  {
    step: 1,
    title: "아이 정보 등록",
    description: "학년과 학기를 입력하면 2022 개정 교육과정에 맞는 학습 세트가 자동으로 구성됩니다.",
    icon: GraduationCap,
    color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  },
  {
    step: 2,
    title: "매일 아침 30분 학습",
    description: "매일 새로운 학습 세트가 준비됩니다. 수학, 국어, 영어 등 다양한 과목을 아침 시간에 풀어요.",
    icon: Clock,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    step: 3,
    title: "성장 기록 확인",
    description: "학습 통계와 뱃지를 통해 아이의 성장을 확인하세요. AI가 약한 부분을 분석해 맞춤 추천합니다.",
    icon: TrendingUp,
    color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  },
];

const values = [
  {
    icon: Heart,
    title: "아이 중심",
    description: "모든 콘텐츠는 아이의 발달 단계와 흥미를 고려하여 설계합니다. 학습이 즐거운 경험이 되도록 합니다.",
  },
  {
    icon: Target,
    title: "교육과정 기반",
    description: "2022 개정 교육과정을 충실히 반영합니다. 학교 수업과 자연스럽게 연결되는 학습을 제공합니다.",
  },
  {
    icon: Shield,
    title: "안전한 환경",
    description: "광고나 외부 링크 없이 안전한 학습 환경을 제공합니다. 아이가 혼자서도 안심하고 사용할 수 있어요.",
  },
  {
    icon: Lightbulb,
    title: "꾸준한 습관",
    description: "매일 30분이라는 적절한 분량으로 학습 습관을 형성합니다. 작은 성취가 쌓여 큰 성장이 됩니다.",
  },
  {
    icon: Brain,
    title: "AI 맞춤 학습",
    description: "AI가 아이의 학습 패턴과 취약점을 분석하여 최적의 문제를 추천합니다. 개인화된 학습 경험을 제공합니다.",
  },
  {
    icon: Sparkles,
    title: "동기부여",
    description: "뱃지, 연속 학습 기록, 레벨 시스템으로 아이 스스로 동기를 유지합니다. 칭찬과 격려가 함께합니다.",
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
              아라하루 팀 일동
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
              무료 플랜으로 아라하루의 학습 경험을 직접 체험해 보세요.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link href="/">무료로 시작하기</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
                asChild
              >
                <Link href="/pricing">요금제 보기</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
