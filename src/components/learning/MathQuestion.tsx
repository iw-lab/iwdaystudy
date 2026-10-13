"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Lightbulb, XCircle } from "lucide-react";
import { renderMath } from "./MathText";

interface Props {
  content: Record<string, unknown>;
  answer: Record<string, unknown>;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
  hideCorrectAnswer?: boolean;
}

const OPTION_LABELS = ["1", "2", "3", "4"];

export default function MathQuestion({
  content,
  answer,
  onAnswer,
  showResult,
  isCorrect,
  hideCorrectAnswer = false,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Type guard for content
  const mathContent = content as any;
  const variant = mathContent?.variant || "choice";
  const rawExpression: string = mathContent?.expression || "";
  // 답 형식 안내 주석 "(분자만 입력, 분모=6)" "(원주율 3.14)" 등은 식에서 분리해
  // 작은 안내줄로 보여준다. (기존엔 "… = ? (분자만 입력) = ?"처럼 깨져 보였음)
  let noteText: string | null = null;
  let baseExpression = rawExpression;
  const noteMatch = rawExpression.match(/\(([^()]*(?:입력|원주율|분모|기약)[^()]*)\)\s*$/);
  if (noteMatch) {
    noteText = noteMatch[1];
    baseExpression = rawExpression.slice(0, noteMatch.index).trim();
  }
  // 제너레이터가 "a + b = ?" 형태로 넣는 경우가 많음 → UI가 다시 "= ?" 붙이지 않도록 정규화
  const expression = baseExpression.replace(/\s*=\s*\?\s*$/, "").trim();
  const correctAnswer = String(
    (answer as any)?.correct ??
      (answer as any)?.answer ??
      (answer as any)?.text ??
      "",
  );
  const choices: string[] = mathContent?.choices || [];
  const steps: string[] = (answer as any)?.steps || [];

  // 세로셈 판정: 순수 "숫자 연산자 숫자" 형태일 때만 (문장형 식은 제외)
  const verticalMatch = expression.match(
    /^\s*(\d+(?:\.\d+)?)\s*([+\-×÷])\s*(\d+(?:\.\d+)?)\s*$/,
  );
  const operator = verticalMatch?.[2] || "";
  const operands = verticalMatch
    ? [verticalMatch[1], verticalMatch[3]]
    : [];
  const isVerticalLayout = !!verticalMatch && variant !== "reverse";

  const handleSelect = (choice: string) => {
    if (showResult) return;
    setSelected(choice);
    onAnswer(choice);
  };

  const handleInputSubmit = () => {
    if (showResult || !inputValue.trim()) return;
    setSelected(inputValue.trim());
    onAnswer(inputValue.trim());
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {mathContent?.unit && (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#FF6B35]/10 px-3 py-1 text-xs font-semibold text-[#FF6B35]">
          {mathContent.unit}
        </span>
      )}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center justify-center gap-2"
      >
        <div className="text-4xl sm:text-5xl font-black tracking-wide text-foreground select-none text-center leading-relaxed">
          {variant === "reverse" ? (
            expression.endsWith("?") ? (
              // 이미 물음표로 끝나는 문장형 역산("?부터 3씩 5번 뛰어 세면?")은
              // 결과를 그냥 이어붙이면 "...세면? 42"처럼 깨져 보인다.
              // 끝의 "?"를 떼고 자연스러운 문장으로 이어준다.
              <>
                {renderMath(expression.replace(/\?\s*$/, "").trimEnd())}{" "}
                {String(content.result ?? "")}
                입니다. <span className="text-muted-foreground/50">?</span>는
                얼마일까요?
              </>
            ) : (
              <>
                {renderMath(expression)} = {String(content.result ?? "")}
              </>
            )
          ) : expression.endsWith("?") ? (
            // 문장형 질문 ("…는 몇 개?")은 이미 물음표로 끝남 → 그대로 출력
            <>{renderMath(expression)}</>
          ) : (
            <>
              {renderMath(expression)} ={" "}
              <span className="text-muted-foreground/50">?</span>
            </>
          )}
        </div>
      </motion.div>

      {noteText && (
        <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground -mt-3">
          ✍️ {noteText}
        </span>
      )}

      {isVerticalLayout && variant !== "reverse" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border-2 border-dashed border-[#FF6B35]/30 bg-[#FF6B35]/5 p-6 font-mono"
        >
          <div className="inline-grid grid-cols-[auto_1fr] gap-x-3 text-3xl font-bold tabular-nums">
            <div />
            <div className="text-right">{operands[0]}</div>
            <div className="text-[#FF6B35]">{operator}</div>
            <div className="text-right">{operands[1]}</div>
            <div className="col-span-2 border-b-2 border-foreground mt-1" />
            <div />
            <div className="text-right pt-1 text-muted-foreground/40">
              {showResult && !(hideCorrectAnswer && !isCorrect)
                ? correctAnswer
                : "?"}
            </div>
          </div>
        </motion.div>
      )}

      {!showResult && variant === "input" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 w-full max-w-md items-center"
        >
          <Input
            type="number"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
            placeholder="답을 입력하세요"
            className="h-14 text-xl font-bold text-center rounded-xl border-2 border-[#FF6B35]/30 focus:border-[#FF6B35]"
            autoFocus
          />
          <Button
            onClick={handleInputSubmit}
            disabled={!inputValue.trim()}
            className="h-14 px-6 text-lg font-bold rounded-xl bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
          >
            확인
          </Button>
        </motion.div>
      )}

      {!showResult && variant !== "input" && choices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3 w-full max-w-md"
        >
          {choices.map((choice, index) => (
            <motion.div key={choice} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => handleSelect(choice)}
                className={`w-full h-14 min-h-[48px] text-lg font-bold rounded-xl border-2 transition-all ${
                  selected === choice
                    ? "border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35] shadow-md shadow-[#FF6B35]/10"
                    : "border-border hover:border-[#FF6B35]/40"
                }`}
              >
                <span className="mr-2 text-sm text-muted-foreground">
                  {OPTION_LABELS[index]}
                </span>
                {renderMath(choice)}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`flex items-center gap-3 rounded-2xl px-6 py-4 text-lg font-bold ${
                isCorrect
                  ? "bg-green-50 text-green-700 border-2 border-green-200"
                  : "bg-red-50 text-red-700 border-2 border-red-200"
              }`}
            >
              {isCorrect ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <span>{isCorrect ? "정답이에요" : hideCorrectAnswer ? "틀렸어요! 나중에 다시 풀어봐요" : <>정답: {renderMath(correctAnswer)}</>}</span>
            </motion.div>

            {choices.length > 0 && (
              <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                {choices.map((choice, index) => (
                  <div
                    key={choice}
                    className={`flex items-center justify-center rounded-xl border-2 px-4 py-3 text-base font-bold min-h-[44px] ${
                      hideCorrectAnswer && !isCorrect
                        ? selected === choice
                          ? "border-red-300 bg-red-50 text-red-500"
                          : "border-border text-muted-foreground"
                        : choice === correctAnswer
                          ? "border-green-400 bg-green-50 text-green-700"
                          : selected === choice
                            ? "border-red-300 bg-red-50 text-red-500"
                            : "border-border text-muted-foreground"
                    }`}
                  >
                    <span className="mr-2 text-sm text-muted-foreground">
                      {OPTION_LABELS[index]}
                    </span>
                    {renderMath(choice)}
                  </div>
                ))}
              </div>
            )}

            {steps.length > 0 && !(hideCorrectAnswer && !isCorrect) && (
              <div className="w-full max-w-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSteps(!showSteps)}
                  className="gap-1 text-muted-foreground min-h-[36px]"
                >
                  <Lightbulb className="h-4 w-4" />
                  {showSteps ? "풀이 숨기기" : "풀이 보기"}
                </Button>
                <AnimatePresence>
                  {showSteps && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 rounded-xl bg-muted/50 p-4 space-y-2">
                        {steps.map((step: string, index: number) => (
                          <div
                            key={`${step}-${index}`}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF6B35]/10 text-xs font-bold text-[#FF6B35]">
                              {index + 1}
                            </span>
                            <span className="pt-0.5">{renderMath(step)}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
