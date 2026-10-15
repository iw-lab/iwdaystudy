"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ShieldAlert } from "lucide-react";
interface Props {
  content: any;
  answer: any;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
  hideCorrectAnswer?: boolean;
}

export default function SafetyQuiz({
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
    if (parts.length < 2) return <span>{content.text}</span>;

    return (
      <span>
        {parts[0]}
        {showResult ? (
          <span
            className={`inline-block min-w-[3ch] px-2 py-0.5 rounded font-bold ${
              isCorrect
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {hideCorrectAnswer && !isCorrect ? "?" : correctAnswer}
          </span>
        ) : (
          <span className="inline-block min-w-[4ch] border-b-2 border-[#E74C3C] px-2 mx-1">
            &nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        )}
        {parts[1]}
      </span>
    );
  };

  const OPTION_LABELS = ["\u2460", "\u2461", "\u2462", "\u2463"];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Safety category badge */}
      <Badge
        variant="outline"
        className="rounded-full border-[#E74C3C]/40 bg-[#E74C3C]/10 text-[#E74C3C] px-3 py-1 text-sm font-semibold"
      >
        <ShieldAlert className="h-3.5 w-3.5 mr-1" />
        {content?.category || "안전"}
      </Badge>

      {/* Question text */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-2xl bg-[#E74C3C]/5 border border-[#E74C3C]/15 p-6 text-center"
      >
        <p className="text-xl sm:text-2xl font-bold leading-relaxed">
          {variant === "tf"
            ? content?.text || "문제를 불러올 수 없습니다."
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
                    : "border-border hover:border-[#E74C3C]/40"
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
                    ? "border-[#E74C3C] bg-[#E74C3C]/10 text-[#E74C3C] shadow-md shadow-[#E74C3C]/10"
                    : "border-border hover:border-[#E74C3C]/40"
                }`}
              >
                <span className="text-muted-foreground mr-2 flex-shrink-0">
                  {OPTION_LABELS[i]}
                </span>
                {choice}
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
            className="flex-1 h-14 min-h-[48px] text-center text-xl font-bold rounded-xl border-2 border-[#E74C3C]/30 focus:border-[#E74C3C] focus:ring-2 focus:ring-[#E74C3C]/20 outline-none px-4"
            autoFocus
          />
          <Button
            onClick={() => selected?.trim() && onAnswer(selected.trim())}
            disabled={!selected?.trim()}
            className="h-14 min-h-[48px] px-6 rounded-xl text-lg font-bold bg-[#E74C3C] hover:bg-[#E74C3C]/90"
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
                  <span>맞았어요! 안전을 잘 알고 있네요!</span>
                </>
              ) : hideCorrectAnswer ? (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>틀렸어요! 나중에 다시 풀어봐요</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>정답: {correctAnswer}</span>
                </>
              )}
            </motion.div>

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
                    {choice}
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
