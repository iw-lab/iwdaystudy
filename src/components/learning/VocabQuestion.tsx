"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { renderMath } from "./MathText";
interface Props {
  content: any;
  answer: any;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
  hideCorrectAnswer?: boolean;
}

export default function VocabQuestion({
  content,
  answer,
  onAnswer,
  showResult,
  isCorrect,
  hideCorrectAnswer = false,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const variant: string = content?.variant || "clue";
  // Support both formats
  const meanings: string[] = content?.meanings || content?.clues || [];
  const correctAnswer = answer?.answer || answer?.correct || answer?.text || "";
  // reverse(낱말→뜻)에서 문제로 보여줄 것은 '낱말'(answer.text)이다.
  // correctAnswer(= 정답 뜻풀이)를 보여주면 보기 중 정답이 그대로 노출된다.
  const promptWord = answer?.text || "";
  const choices: string[] = content?.choices || [];

  const handleSelect = (choice: string) => {
    if (showResult) return;
    setSelected(choice);
    onAnswer(choice);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-lg font-medium text-muted-foreground">
        {variant === "reverse"
          ? "낱말을 보고 알맞은 뜻을 고르세요!"
          : variant === "input"
            ? "힌트를 보고 낱말을 직접 입력하세요!"
            : "힌트를 보고 알맞은 낱말을 고르세요!"}
      </p>

      {/* Reverse variant: show word prominently */}
      {variant === "reverse" && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-5xl font-black text-foreground"
        >
          {promptWord}
        </motion.div>
      )}

      {/* Meaning cards (for clue and input variants) */}
      {variant !== "reverse" && (
        <div className="flex flex-col gap-3 w-full max-w-md">
          {meanings.map((meaning: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-3 rounded-xl border-2 border-[#FF8BA7]/20 bg-[#FF8BA7]/5 px-5 py-4 min-h-[52px]"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF8BA7]/20 flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-[#FF8BA7]" />
              </div>
              <p className="text-lg font-medium">{renderMath(meaning)}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Multiple choice options (clue and reverse variants) */}
      {!showResult && choices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: variant === "reverse" ? 0.2 : meanings.length * 0.15 + 0.1,
          }}
          className="grid grid-cols-2 gap-3 w-full max-w-md"
        >
          {choices.map((choice, i) => (
            <motion.div key={i} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => handleSelect(choice)}
                className={`w-full h-14 min-h-[48px] text-lg font-bold rounded-xl border-2 transition-all ${
                  selected === choice
                    ? "border-[#FF8BA7] bg-[#FF8BA7]/10 text-[#FF8BA7] shadow-md shadow-[#FF8BA7]/10"
                    : "border-border hover:border-[#FF8BA7]/40"
                }`}
              >
                {renderMath(choice)}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Text input (input variant or fallback when no choices) */}
      {!showResult && choices.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: meanings.length * 0.15 }}
          className="flex items-center gap-3 w-full max-w-sm"
        >
          <input
            type="text"
            value={selected || ""}
            onChange={(e) => setSelected(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && selected?.trim())
                onAnswer(selected.trim());
            }}
            placeholder="낱말을 입력하세요"
            className="flex-1 h-14 min-h-[48px] text-center text-xl font-bold rounded-xl border-2 border-[#FF8BA7]/30 focus:border-[#FF8BA7] focus:ring-2 focus:ring-[#FF8BA7]/20 outline-none px-4"
            autoFocus
          />
          <Button
            onClick={() => selected?.trim() && onAnswer(selected.trim())}
            disabled={!selected?.trim()}
            className="h-14 min-h-[48px] px-6 rounded-xl text-lg font-bold bg-[#FF8BA7] hover:bg-[#FF8BA7]/90"
          >
            확인
          </Button>
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Answer reveal (hidden when hideCorrectAnswer and wrong) */}
            {!(hideCorrectAnswer && !isCorrect) && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="text-5xl font-black text-foreground"
              >
                {correctAnswer}
              </motion.div>
            )}

            {/* Show meanings below answer */}
            {!(hideCorrectAnswer && !isCorrect) && (
              <div className="text-center text-sm text-muted-foreground">
                <span className="font-medium">뜻:</span> {renderMath(meanings.join(", "))}
              </div>
            )}

            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold ${
                isCorrect
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>맞았어요!</span>
                </>
              ) : hideCorrectAnswer ? (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>틀렸어요! 나중에 다시 풀어봐요</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>정답은 &ldquo;{correctAnswer}&rdquo; 이에요</span>
                </>
              )}
            </motion.div>

            {/* Show all choices with correct highlighted */}
            {choices.length > 0 && (
              <div className="grid grid-cols-2 gap-2 w-full max-w-md mt-2">
                {choices.map((choice, i) => (
                  <div
                    key={i}
                    className={`h-12 min-h-[44px] flex items-center justify-center text-base font-bold rounded-xl border-2 ${
                      hideCorrectAnswer && !isCorrect
                        ? selected === choice
                          ? "border-red-300 bg-red-50 text-red-500 line-through"
                          : "border-border text-muted-foreground"
                        : choice === correctAnswer
                          ? "border-green-400 bg-green-50 text-green-700"
                          : selected === choice
                            ? "border-red-300 bg-red-50 text-red-500 line-through"
                            : "border-border text-muted-foreground"
                    }`}
                  >
                    {renderMath(choice)}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
