"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { renderMath } from "./MathText";
interface Props {
  content: any;
  answer: any;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
  hideCorrectAnswer?: boolean;
}

export default function GeneralKnowledge({
  content,
  answer,
  onAnswer,
  showResult,
  isCorrect,
  hideCorrectAnswer = false,
}: Props) {
  const correctAnswer = answer?.answer || answer?.correct || answer?.text || "";
  const [selected, setSelected] = useState<string | null>(null);
  const choices: string[] = content?.choices || [];
  // 이미 기기에 저장된 옛 세트 — «tf» 인데 정답이 O/X 가 아닌 빈칸 문항은 4지선다로 그린다(O/X 단추로는 못 맞힌다).
  const variant: string =
    content?.variant === "tf" && !["O", "X"].includes(String(correctAnswer).trim()) && choices.length > 0
      ? "fill"
      : content?.variant || "fill";

  const handleSelect = (choice: string) => {
    if (showResult) return;
    setSelected(choice);
    onAnswer(choice);
  };

  // Split text around ___ to highlight the blank
  const renderText = () => {
    if (!content?.text) return <span>문제를 불러올 수 없습니다.</span>;
    const parts = content.text.split("___");
    if (parts.length < 2) return <span>{renderMath(content.text)}</span>;

    return (
      <span>
        {renderMath(parts[0])}
        {showResult ? (
          <span
            className={`inline-block min-w-[3ch] px-2 py-0.5 rounded font-bold ${
              isCorrect
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {hideCorrectAnswer && !isCorrect ? "?" : renderMath(correctAnswer)}
          </span>
        ) : (
          <span className="inline-block min-w-[4ch] border-b-2 border-[#F9CA24] px-2 mx-1">
            &nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        )}
        {renderMath(parts[1])}
      </span>
    );
  };

  const OPTION_LABELS = ["\u2460", "\u2461", "\u2462", "\u2463"];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Category badge */}
      <Badge
        variant="outline"
        className="rounded-full border-[#F9CA24]/40 bg-[#F9CA24]/10 text-[#B8860B] px-3 py-1 text-sm font-semibold"
      >
        <Lightbulb className="h-3.5 w-3.5 mr-1" />
        {content?.category || "상식"}
      </Badge>

      {/* Reading passage for reading variant */}
      {variant === "reading" && content.passage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg rounded-2xl bg-indigo-50 border border-indigo-200 p-5"
        >
          <p className="text-sm font-semibold text-indigo-600 mb-2 flex items-center gap-1">
            📖 지문
          </p>
          <p className="text-base leading-relaxed text-gray-800 whitespace-pre-line">
            {content.passage}
          </p>
        </motion.div>
      )}

      {/* Question text */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl bg-[#F9CA24]/5 border border-[#F9CA24]/20 p-6 text-center"
      >
        <p className="text-xl sm:text-2xl font-bold leading-relaxed">
          {variant === "tf"
            ? renderMath(content?.text) || "문제를 불러올 수 없습니다."
            : variant === "reading"
              ? renderMath(content?.text) || "문제를 불러올 수 없습니다."
              : renderText()}
        </p>
        {variant === "tf" && (
          <p className="mt-2 text-sm text-muted-foreground">
            위 문장이 맞으면 O, 틀리면 X를 고르세요
          </p>
        )}
      </motion.div>

      {/* OX buttons for tf variant */}
      {!showResult && variant === "tf" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 w-full max-w-sm justify-center"
        >
          {["O", "X"].map((ox) => (
            <motion.div key={ox} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => handleSelect(ox)}
                className={`w-28 h-20 text-4xl font-black rounded-2xl border-2 transition-all ${
                  selected === ox
                    ? ox === "O"
                      ? "border-blue-500 bg-blue-50 text-blue-600 shadow-md"
                      : "border-red-500 bg-red-50 text-red-600 shadow-md"
                    : "border-border hover:border-[#F9CA24]/40"
                }`}
              >
                {ox}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 4-choice options (fill variant) */}
      {!showResult && variant !== "tf" && choices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg"
        >
          {choices.map((choice, i) => (
            <motion.div key={i} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => handleSelect(choice)}
                className={`w-full h-auto min-h-[52px] py-3 px-4 text-base font-bold rounded-xl border-2 whitespace-normal text-left transition-all ${
                  selected === choice
                    ? "border-[#F9CA24] bg-[#F9CA24]/10 text-[#B8860B] shadow-md shadow-[#F9CA24]/10"
                    : "border-border hover:border-[#F9CA24]/40"
                }`}
              >
                <span className="text-muted-foreground mr-2 flex-shrink-0">
                  {OPTION_LABELS[i]}
                </span>
                {renderMath(choice)}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Text input (input variant or fallback when no choices) */}
      {!showResult && variant !== "tf" && choices.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
            placeholder="답을 입력하세요"
            className="flex-1 h-14 min-h-[48px] text-center text-xl font-bold rounded-xl border-2 border-[#F9CA24]/30 focus:border-[#F9CA24] focus:ring-2 focus:ring-[#F9CA24]/20 outline-none px-4"
            autoFocus
          />
          <Button
            onClick={() => selected?.trim() && onAnswer(selected.trim())}
            disabled={!selected?.trim()}
            className="h-14 min-h-[48px] px-6 rounded-xl text-lg font-bold bg-[#F9CA24] hover:bg-[#F9CA24]/90 text-[#1A1A2E]"
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
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 w-full"
          >
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
                  <span>정답이에요!</span>
                </>
              ) : hideCorrectAnswer ? (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>틀렸어요! 나중에 다시 풀어봐요</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>정답: {renderMath(correctAnswer)}</span>
                </>
              )}
            </motion.div>

            {/* Show choices with correct highlighted */}
            {choices.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg mt-2">
                {choices.map((choice, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 h-auto min-h-[48px] py-2 px-4 text-sm font-bold rounded-xl border-2 ${
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
                    <span className="text-muted-foreground flex-shrink-0">
                      {OPTION_LABELS[i]}
                    </span>
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
