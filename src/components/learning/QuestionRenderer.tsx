"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, MessageCircle } from "lucide-react";
import { SUBJECTS } from "@/types/learning";
import { getSubjectColor } from "@/lib/utils";
import type { Question } from "@/types/database";
import MathQuestion from "./MathQuestion";
import SpellingQuestion from "./SpellingQuestion";
import VocabQuestion from "./VocabQuestion";
import HanjaQuestion from "./HanjaQuestion";
import EnglishQuestion from "./EnglishQuestion";
import WritingPrompt from "./WritingPrompt";
import EmotionCheck from "./EmotionCheck";
import ReadinessChecklist from "./ReadinessChecklist";
import GeneralKnowledge from "./GeneralKnowledge";
import SafetyQuiz from "./SafetyQuiz";
import { renderMath } from "./MathText";

interface Props {
  question: Question;
  // evalScore: 글쓰기(WritingPrompt)가 화면에 보여준 최종 점수를 그대로 전달(선택)
  onAnswer: (answer: unknown, evalScore?: number) => void;
  showResult: boolean;
  isCorrect: boolean | null;
  hideCorrectAnswer?: boolean;
}

// Mini confetti burst for correct answers
function CorrectBurst() {
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    angle: (i / 12) * 360,
    color: ["#2ECC71", "#F9CA24", "#FF6B35", "#4ECDC4", "#FF8BA7", "#A18CD1"][
      i % 6
    ],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * 80,
            y: Math.sin((p.angle * Math.PI) / 180) * 60,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export default function QuestionRenderer({
  question,
  onAnswer,
  showResult,
  isCorrect,
  hideCorrectAnswer = false,
}: Props) {
  const [showHint, setShowHint] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const subjectInfo = SUBJECTS[question.subject] || {
    name: question.subject,
    icon: "\uD83D\uDCDD",
    color: "#2ECC71",
  };
  const color = getSubjectColor(question.subject);

  // Trigger confetti burst on correct answer
  const handleShowResult = () => {
    if (isCorrect) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 700);
    }
  };

  // Watch for showResult changing to true
  useEffect(() => {
    if (showResult && isCorrect) {
      handleShowResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult, isCorrect]);

  const renderQuestion = () => {
    const commonProps = {
      content: question.content,
      answer: question.answer,
      onAnswer,
      showResult,
      isCorrect,
      hideCorrectAnswer,
    };

    // Route special question types first
    switch (question.question_type) {
      case "emotion_check":
        return <EmotionCheck onAnswer={onAnswer} showResult={showResult} />;

      case "readiness_check":
        return (
          <ReadinessChecklist
            content={question.content}
            onAnswer={onAnswer}
            showResult={showResult}
          />
        );

      default:
        break;
    }

    // Route by subject
    switch (question.subject) {
      case "math":
        return <MathQuestion {...commonProps} />;

      case "spelling":
        return <SpellingQuestion {...commonProps} />;

      case "vocabulary":
        return <VocabQuestion {...commonProps} />;

      case "hanja":
        return <HanjaQuestion {...commonProps} />;

      case "english":
        return <EnglishQuestion {...commonProps} />;

      case "writing":
        return (
          <WritingPrompt
            content={question.content}
            onAnswer={onAnswer}
            showResult={showResult}
            isCorrect={isCorrect}
          />
        );

      case "safety":
        return <SafetyQuiz {...commonProps} />;

      case "korean":
      case "creative":
      case "general_knowledge":
      case "science":
      case "social":
        return <GeneralKnowledge {...commonProps} />;

      default:
        return <GeneralKnowledge {...commonProps} />;
    }
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <Card className="relative w-full max-w-4xl mx-auto overflow-hidden">
        {/* Correct answer confetti burst */}
        {showBurst && <CorrectBurst />}

        {/* Subject-colored header */}
        <CardHeader
          className="py-3 px-4"
          style={{
            backgroundColor: `${color}15`,
            borderBottom: `2px solid ${color}`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.span
                className="text-2xl"
                animate={
                  showResult && isCorrect
                    ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }
                    : {}
                }
                transition={{ duration: 0.5 }}
              >
                {subjectInfo.icon}
              </motion.span>
              <CardTitle className="text-base font-bold" style={{ color }}>
                {renderMath(question.title || subjectInfo.name)}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {question.points > 0 &&
                !["emotion_check", "readiness_check"].includes(
                  question.question_type,
                ) && (
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: color, color }}
                  >
                    {question.points}점
                  </Badge>
                )}
              {question.hint && !showResult && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs min-h-[32px] gap-1"
                  onClick={() => setShowHint(!showHint)}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  힌트
                </Button>
              )}
            </div>
          </div>

          {/* Hint */}
          <AnimatePresence>
            {showHint && question.hint && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-2 bg-amber-50 rounded-lg text-sm text-amber-800 border border-amber-200 flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
                  <span>{renderMath(question.hint)}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <motion.div
            animate={
              showResult
                ? isCorrect
                  ? { scale: [1, 1.02, 1] }
                  : isCorrect === false
                    ? { x: [0, -6, 6, -4, 4, 0] }
                    : {}
                : {}
            }
            transition={{ duration: isCorrect ? 0.4 : 0.3 }}
          >
            {renderQuestion()}
          </motion.div>

          {/* Explanation on result (hidden when hideCorrectAnswer and wrong) */}
          <AnimatePresence>
            {showResult && question.explanation && !(hideCorrectAnswer && !isCorrect) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-2">
                  <MessageCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-0.5">
                      해설
                    </p>
                    <p className="text-sm text-blue-700">
                      {renderMath(question.explanation)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
