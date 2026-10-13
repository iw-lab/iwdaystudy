"use client";

import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  BookOpen,
  SpellCheck,
  Languages,
  Palette,
  Brain,
} from "lucide-react";
import { renderMath } from "@/components/learning/MathText";

const gradeData: Record<
  string,
  {
    label: string;
    color: string;
    subjects: { icon: React.ElementType; name: string; sample: string; color: string }[];
  }
> = {
  "1": {
    label: "1학년",
    color: "bg-grade1",
    subjects: [
      {
        icon: Calculator,
        name: "수놀이",
        sample: "사과 3개와 귤 4개를 합치면 모두 몇 개일까요?",
        color: "text-subject-math",
      },
      {
        icon: SpellCheck,
        name: "맞춤법",
        sample: "다음 중 바른 표현을 골라보세요: '왠지' vs '웬지'",
        color: "text-subject-spelling",
      },
      {
        icon: Palette,
        name: "그리기",
        sample: "왼쪽 그림을 보고 오른쪽에 똑같이 그려보세요!",
        color: "text-subject-creative",
      },
    ],
  },
  "2": {
    label: "2학년",
    color: "bg-grade2",
    subjects: [
      {
        icon: Calculator,
        name: "수놀이",
        sample: "37 + 45 = ? (받아올림에 주의하세요)",
        color: "text-subject-math",
      },
      {
        icon: BookOpen,
        name: "글밥",
        sample: "다음 글을 읽고 주인공의 기분을 골라보세요.",
        color: "text-subject-writing",
      },
      {
        icon: Brain,
        name: "상식 퀴즈",
        sample: "무지개는 몇 가지 색으로 이루어져 있을까요?",
        color: "text-subject-knowledge",
      },
    ],
  },
  "3": {
    label: "3학년",
    color: "bg-grade3",
    subjects: [
      {
        icon: Calculator,
        name: "수놀이",
        sample: "256 x 3 = ? (곱셈을 세로로 풀어보세요)",
        color: "text-subject-math",
      },
      {
        icon: Languages,
        name: "한자",
        sample: "다음 한자의 뜻과 음을 맞춰보세요: 山",
        color: "text-subject-hanja",
      },
      {
        icon: SpellCheck,
        name: "맞춤법",
        sample: "'됬다'와 '됐다' 중 올바른 표현은?",
        color: "text-subject-spelling",
      },
    ],
  },
  "4": {
    label: "4학년",
    color: "bg-grade4",
    subjects: [
      {
        icon: Calculator,
        name: "수놀이",
        sample: "3/4 + 1/4 = ? (분수의 덧셈)",
        color: "text-subject-math",
      },
      {
        icon: BookOpen,
        name: "English",
        sample: "What color is the sky? 알맞은 답을 골라보세요.",
        color: "text-subject-english",
      },
      {
        icon: Brain,
        name: "상식 퀴즈",
        sample: "대한민국의 수도는 어디일까요?",
        color: "text-subject-knowledge",
      },
    ],
  },
  "5": {
    label: "5학년",
    color: "bg-grade5",
    subjects: [
      {
        icon: Calculator,
        name: "수놀이",
        sample: "1.5 x 2.4 = ? (소수의 곱셈)",
        color: "text-subject-math",
      },
      {
        icon: Languages,
        name: "한자",
        sample: "'학교(學校)' 에서 '學' 의 총 획수는?",
        color: "text-subject-hanja",
      },
      {
        icon: BookOpen,
        name: "English",
        sample: "I ___ to school every day. (go/goes)",
        color: "text-subject-english",
      },
    ],
  },
  "6": {
    label: "6학년",
    color: "bg-grade6",
    subjects: [
      {
        icon: Calculator,
        name: "수놀이",
        sample: "원의 넓이를 구하세요. (반지름 = 5cm)",
        color: "text-subject-math",
      },
      {
        icon: BookOpen,
        name: "사회",
        sample: "6.25 전쟁이 일어난 연도는 언제일까요?",
        color: "text-subject-knowledge",
      },
      {
        icon: Brain,
        name: "과학",
        sample: "물이 끓는 온도(기압 1atm)는 몇 도 일까요?",
        color: "text-subject-knowledge",
      },
    ],
  },
};

export function GradePreview() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            학년별{" "}
            <span className="bg-gradient-to-r from-ara-orange to-ara-pink bg-clip-text text-transparent">
              맛보기
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            우리 아이 학년을 선택하고 어떤 문제가 나오는지 미리 살펴보세요.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="1" className="w-full">
            <TabsList className="w-full flex flex-wrap justify-center gap-2 bg-transparent h-auto p-0 mb-8">
              {Object.entries(gradeData).map(([grade, data]) => (
                <TabsTrigger
                  key={grade}
                  value={grade}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-5 py-2 text-sm font-medium transition-all"
                >
                  {data.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(gradeData).map(([grade, data]) => (
              <TabsContent key={grade} value={grade}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.subjects.map((subject, i) => (
                    <motion.div
                      key={subject.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      <Card className="h-full border shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`rounded-lg p-2 bg-muted`}>
                              <subject.icon className={`h-5 w-5 ${subject.color}`} />
                            </div>
                            <div>
                              <Badge variant="secondary" className="text-xs">
                                {data.label}
                              </Badge>
                              <p className="text-sm font-semibold mt-0.5">{subject.name}</p>
                            </div>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-4">
                            <p className="text-sm text-foreground leading-relaxed">
                              {renderMath(subject.sample)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
