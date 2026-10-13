"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Check, Zap, Crown, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRICING } from "@/lib/constants";

// 결제 연동이 없어 basic/premium/school은 아직 실제로 판매되지 않는다.
// 가입하면 요금제 선택과 무관하게 전원 free로 생성되므로("무료 베타"),
// 유료 플랜 버튼이 결제를 흉내내지 않도록 comingSoon으로 비활성화한다.
const planMeta = [
  {
    key: "free" as const,
    icon: Zap,
    color: "border-border",
    buttonVariant: "outline" as const,
    buttonText: "무료로 시작",
    popular: true,
    comingSoon: false,
  },
  {
    key: "basic" as const,
    icon: Check,
    color: "border-ara-blue",
    buttonVariant: "outline" as const,
    buttonText: "준비 중",
    popular: false,
    comingSoon: true,
  },
  {
    key: "premium" as const,
    icon: Crown,
    color: "border-primary",
    buttonVariant: "outline" as const,
    buttonText: "준비 중",
    popular: false,
    comingSoon: true,
  },
  {
    key: "school" as const,
    icon: School,
    color: "border-ara-purple",
    buttonVariant: "outline" as const,
    buttonText: "문의하기",
    popular: false,
    comingSoon: false,
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function PricingCards() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            합리적인{" "}
            <span className="bg-gradient-to-r from-primary to-ara-blue bg-clip-text text-transparent">
              요금제
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            지금은 무료 베타 기간이에요. 베이직·프리미엄·학교 플랜은 준비
            중이며, 출시 전까지 모든 기능을 무료로 이용하실 수 있습니다.
          </p>
        </motion.div>

        {/* Pricing grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {planMeta.map((meta) => {
            const plan = PRICING[meta.key];
            return (
              <motion.div key={meta.key} variants={itemVariants} className="flex">
                <Card
                  className={`relative flex flex-col w-full border-2 ${meta.color} ${
                    meta.popular
                      ? "shadow-xl shadow-primary/10 scale-[1.02]"
                      : "shadow-md"
                  } transition-shadow hover:shadow-lg`}
                >
                  {meta.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        무료 베타
                      </Badge>
                    </div>
                  )}
                  {meta.comingSoon && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge
                        variant="secondary"
                        className="px-4 py-1 text-muted-foreground"
                      >
                        준비 중
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-2">
                      <meta.icon
                        className={`h-8 w-8 ${
                          meta.popular ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-black text-foreground">
                        {plan.price === 0
                          ? "무료"
                          : `${plan.price.toLocaleString()}원`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {"perClass" in plan ? "/학급/월" : "/월"}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1">
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {meta.comingSoon ? (
                      <Button
                        variant={meta.buttonVariant}
                        className="w-full mt-6"
                        disabled
                      >
                        {meta.buttonText}
                      </Button>
                    ) : (
                      <Button
                        variant={meta.buttonVariant}
                        className="w-full mt-6"
                        asChild
                      >
                        <Link
                          href={meta.key === "school" ? "#contact" : "/"}
                        >
                          {meta.buttonText}
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
