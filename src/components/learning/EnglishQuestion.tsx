"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, Volume2, XCircle } from "lucide-react";
import {
  canUnderline,
  getMeaningText,
  meaningPrompt,
} from "@/lib/english-underline";

interface Props {
  content: Record<string, unknown>;
  answer: Record<string, unknown>;
  onAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
  hideCorrectAnswer?: boolean;
}

const OPTION_LABELS = ["1", "2", "3", "4"];

// 듣기 좋은 en-US voice 선택(기본 로봇/저음 voice 회피)
function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const byName = (re: RegExp) => en.find((v) => re.test(v.name));
  return (
    byName(
      /samantha|karen|moira|tessa|aria|jenny|google us english|microsoft (zira|aria|jenny)/i,
    ) ||
    en.find((v) => v.lang === "en-US" && v.localService) ||
    en.find((v) => v.lang === "en-US") ||
    en[0] ||
    null
  );
}

// 한국어 문장에서 타깃 글로스(모자)를 밑줄·굵게 강조
function renderWithTarget(text: string, target?: string): React.ReactNode {
  if (!target || !text.includes(target)) return text;
  const idx = text.indexOf(target);
  return (
    <>
      {text.slice(0, idx)}
      <strong className="text-[#4169E1] underline decoration-2 underline-offset-4">
        {target}
      </strong>
      {text.slice(idx + target.length)}
    </>
  );
}

export default function EnglishQuestion({
  content,
  answer,
  onAnswer,
  showResult,
  isCorrect,
  hideCorrectAnswer = false,
}: Props) {
  // Type guard for content
  const englishContent = content as any;
  const [selected, setSelected] = useState<string | null>(null);
  const variant: string = englishContent?.variant || "word";
  const correctWord = String(
    (answer as any)?.correct ??
      (answer as any)?.word ??
      (answer as any)?.text ??
      "",
  );
  const choices: string[] = englishContent?.choices || [];

  const handleSpeak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const speak = () => {
      const u = new SpeechSynthesisUtterance(englishContent?.sentence || "");
      u.lang = "en-US";
      u.rate = 0.85;
      u.pitch = 1.1;
      const v = pickEnglishVoice();
      if (v) u.voice = v;
      synth.speak(u);
    };
    // voice 목록이 아직 로드 안 됐으면 voiceschanged 후 발화
    if (synth.getVoices().length === 0) {
      synth.addEventListener("voiceschanged", speak, { once: true });
      synth.getVoices();
    } else {
      speak();
    }
  }, [englishContent?.sentence]);

  const handleSelect = (choice: string) => {
    if (showResult) return;
    setSelected(choice);
    onAnswer(choice);
  };

  // 번역문 안에 밑줄 칠 낱말이 실제로 존재하는지 — 판정은 생성기·게이트와 같은 함수를 쓴다.
  const meaningText = getMeaningText(englishContent ?? {});
  const targetKo = String(englishContent?.targetKo || "");
  const hasUnderline = canUnderline(englishContent ?? {});

  const maskedSentence = String(englishContent?.sentence || "").replace(
    new RegExp(
      `\\b${String(englishContent?.word || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    ),
    "_____",
  );

  return (
    <div className="flex flex-col items-center gap-6">
      {/* meaning variant: show Korean translation prominently */}
      {variant === "meaning" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg rounded-2xl border border-[#4169E1]/20 bg-gradient-to-r from-[#4169E1]/5 to-[#4169E1]/10 p-6 text-center min-h-[80px]"
        >
          <p className="text-sm text-muted-foreground mb-2">
            {/* 밑줄이 실제로 그려질 때만 "밑줄 친"이라고 말한다 —
                targetKo 가 없거나 번역문에 없으면 강조가 0개라 지시문이 거짓이 된다. */}
            {meaningPrompt(hasUnderline)}
          </p>
          <p className="text-3xl font-black text-foreground">
            {renderWithTarget(meaningText, targetKo)}
          </p>
        </motion.div>
      )}

      {/* input variant: show sentence with blank */}
      {variant === "input" && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSpeak}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-lg rounded-2xl border border-[#4169E1]/20 bg-gradient-to-r from-[#4169E1]/5 to-[#4169E1]/10 p-6 text-center min-h-[80px] active:bg-[#4169E1]/15 transition-colors"
          >
            <p className="text-2xl font-bold leading-relaxed text-foreground sm:text-3xl">
              {maskedSentence}
            </p>
            <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Volume2 className="h-3 w-3" />
              문장을 눌러 발음을 들어보세요
            </p>
          </motion.button>
          {englishContent?.translation && (
            <p className="text-sm text-muted-foreground">
              뜻: {englishContent?.translation}
            </p>
          )}
        </>
      )}

      {/* word variant (default): show sentence with blank */}
      {variant === "word" && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleSpeak}
          whileTap={{ scale: 0.98 }}
          className="w-full max-w-lg rounded-2xl border border-[#4169E1]/20 bg-gradient-to-r from-[#4169E1]/5 to-[#4169E1]/10 p-6 text-center min-h-[80px] active:bg-[#4169E1]/15 transition-colors"
        >
          <p className="text-2xl font-bold leading-relaxed text-foreground sm:text-3xl">
            {maskedSentence}
          </p>
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Volume2 className="h-3 w-3" />
            문장을 눌러 발음을 들어보세요
          </p>
        </motion.button>
      )}

      {variant !== "meaning" && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {englishContent?.pronunciation && (
            <div className="rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
              [{englishContent?.pronunciation}]
            </div>
          )}
          {englishContent?.practice?.length > 0 && (
            <div className="rounded-full bg-[#4169E1]/10 px-4 py-2 text-sm font-medium text-[#4169E1]">
              관련 단어 {englishContent?.practice.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Multiple choice (word and meaning variants) */}
      {!showResult && choices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 w-full max-w-md"
        >
          {choices.map((choice, index) => (
            <motion.div key={choice} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={() => handleSelect(choice)}
                className={`w-full h-14 min-h-[48px] text-lg font-bold rounded-xl border-2 transition-all ${
                  selected === choice
                    ? "border-[#4169E1] bg-[#4169E1]/10 text-[#4169E1] shadow-md shadow-[#4169E1]/10"
                    : "border-border hover:border-[#4169E1]/40"
                }`}
              >
                <span className="mr-2 text-sm text-muted-foreground">
                  {OPTION_LABELS[index]}
                </span>
                {choice}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Text input (input variant) */}
      {!showResult && choices.length === 0 && (
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
            placeholder="영단어를 입력하세요"
            className="flex-1 h-14 min-h-[48px] text-center text-xl font-bold rounded-xl border-2 border-[#4169E1]/30 focus:border-[#4169E1] focus:ring-2 focus:ring-[#4169E1]/20 outline-none px-4"
            autoFocus
          />
          <Button
            onClick={() => selected?.trim() && onAnswer(selected.trim())}
            disabled={!selected?.trim()}
            className="h-14 min-h-[48px] px-6 rounded-xl text-lg font-bold bg-[#4169E1] hover:bg-[#4169E1]/90"
          >
            확인
          </Button>
        </motion.div>
      )}

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
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>{isCorrect ? "정답이에요" : hideCorrectAnswer ? "틀렸어요! 나중에 다시 풀어봐요" : `정답: ${correctWord}`}</span>
            </motion.div>

            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {choices.map((choice, index) => (
                <div
                  key={choice}
                  className={`flex items-center justify-center rounded-xl border-2 px-4 py-3 text-base font-bold min-h-[44px] ${
                    hideCorrectAnswer && !isCorrect
                      ? selected === choice
                        ? "border-red-300 bg-red-50 text-red-500"
                        : "border-border text-muted-foreground"
                      : choice === correctWord
                        ? "border-green-400 bg-green-50 text-green-700"
                        : selected === choice
                          ? "border-red-300 bg-red-50 text-red-500"
                          : "border-border text-muted-foreground"
                  }`}
                >
                  <span className="mr-2 text-sm text-muted-foreground">
                    {OPTION_LABELS[index]}
                  </span>
                  {choice}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
