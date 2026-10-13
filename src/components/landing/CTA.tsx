"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, BookOpen, Zap, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const freeFeatures = [
  { icon: BookOpen, text: "12개 과목 전체 학습" },
  { icon: Zap, text: "AI 맞춤 문제 출제" },
  { icon: Star, text: "학습 리포트 & 분석" },
  { icon: Shield, text: "광고 없는 안전한 환경" },
];

export function CTA() {
  return (
    <section
      id="contact"
      className="py-20 md:py-28 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-ara-blue/5 to-ara-purple/5" />

      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Floating sparkles */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-8 left-1/4 opacity-20"
          >
            <Sparkles className="h-8 w-8 text-primary" />
          </motion.div>
          <motion.div
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-12 right-1/4 opacity-20"
          >
            <Sparkles className="h-6 w-6 text-ara-yellow" />
          </motion.div>

          <h2 className="text-3xl font-black sm:text-4xl md:text-5xl">
            오늘 시작하면,
            <br />
            <span className="bg-gradient-to-r from-primary via-ara-blue to-ara-purple bg-clip-text text-transparent">
              내일 아침이 달라져요
            </span>
          </h2>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            매일 30분의 작은 습관이 아이의 학습 자신감을 키워요.
            지금 바로 시작해 보세요.
          </p>

          {/* Free features grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto"
          >
            {freeFeatures.map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex flex-col items-center gap-2 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 p-4"
              >
                <item.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-foreground">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust message */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-sm text-muted-foreground"
          >
            가입 후 바로 모든 기능을 사용할 수 있어요. 카드 등록 없이 시작하세요.
          </motion.p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-14 px-10 text-lg font-bold gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
              asChild
            >
              <Link href="/">
                지금 무료로 시작하기
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Parent trust builder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-10 max-w-lg mx-auto rounded-2xl bg-background/60 backdrop-blur-sm border border-border/50 p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-ara-blue/20 flex items-center justify-center text-lg">
                {'\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67'}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground mb-1">학부모님께 안심을</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  아라하루는 교육부 교육과정을 철저히 따르며, 아이의 학습 데이터를 안전하게 관리해요.
                  학부모 전용 리포트로 아이의 성장을 함께 지켜보세요.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
