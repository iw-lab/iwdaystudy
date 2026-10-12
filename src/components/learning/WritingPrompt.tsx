"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Star, RotateCcw, ArrowRight } from "lucide-react";
import {
  evaluateWriting,
  isHardGibberish,
  type WritingEvalResult,
} from "@/lib/writing-evaluator";

interface Props {
  content: any;
  // score: 화면에 보여준 최종 점수(monotonic 보정 포함)를 부모가 그대로 저장하도록 전달
  // — 부모가 재평가하면 보정 이력이 소실되어 표시 점수와 저장 점수가 어긋난다.
  onAnswer: (answer: string, score?: number) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

const MIN_CHARS_DEFAULT = 20;
const PASS_SCORE = 7; // 7점 초과(8점 이상)만 통과, 7점 이하는 다시 쓰기
const MAX_RETRIES = 2; // 최대 재시도 횟수 (총 3번 기회)
const MIN_FORCE_SUBMIT_SCORE = 3; // 이 점수 미만이면 강제 제출/재시도 소진 자동 통과도 차단

const DETAIL_LABELS = [
  { key: "length" as const, label: "글자 수", max: 3, color: "#2ECC71" },
  { key: "sentences" as const, label: "문장 구성", max: 2, color: "#3498DB" },
  { key: "variety" as const, label: "어휘 다양성", max: 3, color: "#9B59B6" },
  { key: "structure" as const, label: "내용 구조", max: 2, color: "#E67E22" },
];

export default function WritingPrompt({
  content,
  onAnswer,
  showResult,
}: Props) {
  const [text, setText] = useState("");
  const [evalResult, setEvalResult] = useState<WritingEvalResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [previewMode, setPreviewMode] = useState(false); // 점수 미리보기 (다시쓰기 전)
  const [submitted, setSubmitted] = useState(false); // 최종 제출 완료
  const [prevScore, setPrevScore] = useState(0); // 이전 점수 (monotonic 보정용)
  const [prevTextLen, setPrevTextLen] = useState(0); // 이전 제출 글자수

  const prompt = content?.prompt || content?.text || "자유롭게 써보세요.";
  const minChars = content?.minChars || content?.min_chars || MIN_CHARS_DEFAULT;
  const charCount = text.length;
  const meetsMinimum = charCount >= minChars;
  const canRetry = retryCount < MAX_RETRIES;

  // 장난/무의미 텍스트 감지 — 평가 엔진과 동일 판정으로 단일화 (v7)
  // (사본 유지 시 엔진만 업데이트되는 드리프트가 생겨 제거. 빈 입력은 차단 아님)
  const isGibberishText = (t: string) =>
    t.trim().length > 0 && isHardGibberish(t);
  const isGibberish = isGibberishText(text);

  const handleSubmit = () => {
    if (!text.trim()) return;
    if (isGibberish) return; // 한글이 30% 미만이면 제출 차단
    const rawResult = evaluateWriting(text.trim(), minChars, { prompt });
    const currentLen = text.trim().length;
    // 다시 쓰기 시: 글이 줄지 않았고 raw 점수가 이전보다 낮으면 이전 점수 유지
    // 글을 지웠으면 (10% 이상 줄었으면) 그대로 재평가
    const adjustedScore =
      prevTextLen > 0 && currentLen >= prevTextLen * 0.9
        ? Math.max(rawResult.score, prevScore)
        : rawResult.score;
    setPrevTextLen(currentLen);
    const adjustedStars =
      adjustedScore <= 2
        ? 1
        : adjustedScore <= 4
          ? 2
          : adjustedScore <= 6
            ? 3
            : adjustedScore <= 8
              ? 4
              : 5;
    const result: WritingEvalResult = {
      ...rawResult,
      score: adjustedScore,
      stars: adjustedStars,
    };
    setPrevScore(adjustedScore);
    setEvalResult(result);

    if (result.score > PASS_SCORE) {
      // 통과 → 최종 제출
      setSubmitted(true);
      onAnswer(text.trim(), result.score);
    } else if (!canRetry && result.score >= MIN_FORCE_SUBMIT_SCORE) {
      // 재시도 소진 + 최소 점수는 넘음 → 자동 제출
      setSubmitted(true);
      onAnswer(text.trim(), result.score);
    } else {
      // 70점 이하(+재시도 가능) 또는 재시도 소진했지만 점수 너무 낮음 → 미리보기
      setPreviewMode(true);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setPreviewMode(false);
    setEvalResult(null);
    // text는 유지 (이어서 수정 가능)
  };

  const handleForceSubmit = () => {
    // 점수 낮아도 강제 제출 (단, 최소 점수 미만이거나 gibberish이면 차단)
    const currentText = text.trim();
    if (!currentText) return;
    if (isGibberishText(currentText)) {
      // previewMode에서 텍스트가 변조되어 장난이 된 경우 차단
      setPreviewMode(false);
      return;
    }
    if (evalResult && evalResult.score < MIN_FORCE_SUBMIT_SCORE) {
      // 점수가 너무 낮으면 강제 제출 차단 → 다시 쓰기 유도
      return;
    }
    setSubmitted(true);
    setPreviewMode(false);
    onAnswer(currentText, evalResult?.score);
  };

  const isShowingResult = (showResult || submitted) && !previewMode;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Prompt card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-2xl bg-gradient-to-br from-[#2ECC71]/5 via-[#2ECC71]/10 to-[#4ECDC4]/5 border-2 border-dashed border-primary/30 p-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Pencil className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-primary mb-1">
              오늘의 글밥
            </p>
            <p className="text-xl font-bold leading-relaxed break-keep">
              {prompt}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Textarea - 작성 모드 (미리보기가 아니고 최종 제출도 아닌 경우) */}
      {!isShowingResult && !previewMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full flex flex-col gap-3"
        >
          {retryCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2"
            >
              <RotateCcw className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                {retryCount} / {MAX_RETRIES}번째 다시쓰기 — 피드백을 참고해서 더
                잘 써봐요!
              </span>
            </motion.div>
          )}

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="여기에 자유롭게 써 보세요..."
            className="min-h-[200px] text-xl leading-relaxed rounded-xl border-2 border-primary/20 focus-visible:border-primary focus-visible:ring-primary/20 resize-none p-4"
            style={{
              fontSize: "1.25rem",
              lineHeight: "1.8",
              fontFamily: "var(--font-handwriting, inherit)",
            }}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 rounded-full transition-all ${meetsMinimum ? "bg-primary" : "bg-muted"}`}
                style={{
                  width: `${Math.min((charCount / minChars) * 100, 100)}%`,
                  minWidth: 8,
                  maxWidth: 120,
                }}
              />
              <span
                className={`text-xs font-medium ${meetsMinimum ? "text-primary" : "text-muted-foreground"}`}
              >
                {charCount}자 / 최소 {minChars}자
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!meetsMinimum || isGibberish}
              className="rounded-xl font-bold bg-primary hover:bg-primary/90"
            >
              {isGibberish
                ? "한글로 써주세요!"
                : meetsMinimum
                  ? "제출하기"
                  : `${minChars - charCount}자 더 써주세요`}
            </Button>
          </div>
        </motion.div>
      )}

      {/* 미리보기 모드 — 점수가 낮아서 다시 쓸 기회 */}
      <AnimatePresence mode="wait">
        {previewMode && evalResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex flex-col items-center gap-4"
          >
            {/* 경고 배너 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full rounded-xl bg-amber-50 border-2 border-amber-200 p-4"
            >
              <p className="text-base font-bold text-amber-800 text-center mb-1">
                {evalResult.score < MIN_FORCE_SUBMIT_SCORE
                  ? "의미 있는 문장을 써야 넘어갈 수 있어요"
                  : "조금만 더 노력해볼까요?"}
              </p>
              <p className="text-sm text-amber-700 text-center">
                {evalResult.score * 10}점이에요. 80점 이상이면 통과!
                {evalResult.score < MIN_FORCE_SUBMIT_SCORE
                  ? ` (최소 ${MIN_FORCE_SUBMIT_SCORE * 10}점 이상 필요)`
                  : canRetry
                    ? ` (다시쓰기 ${MAX_RETRIES - retryCount}번 남음)`
                    : " (마지막 기회였어요)"}
              </p>
            </motion.div>

            {/* 현재 점수 요약 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className="h-6 w-6"
                    style={{
                      fill: n <= evalResult.stars ? "#F1C40F" : "transparent",
                      stroke: n <= evalResult.stars ? "#F1C40F" : "#CBD5E1",
                    }}
                  />
                ))}
              </div>
              <span className="text-xl font-black">
                {evalResult.score}점
                <span className="text-sm font-medium text-muted-foreground">
                  {" "}/ 10점
                </span>
              </span>
            </div>

            {/* 개선 팁 (강조) */}
            <div className="w-full rounded-xl bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm font-bold text-blue-800 mb-1">개선 팁</p>
              <p className="text-sm text-blue-700">{evalResult.tip}</p>
            </div>

            {/* 세부 점수 */}
            <div className="w-full rounded-xl border bg-card p-4 flex flex-col gap-2.5">
              {DETAIL_LABELS.map(({ key, label, max, color }) => {
                const val = evalResult.details[key];
                const pct = (val / max) * 100;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">
                      {label}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color, width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-10 text-right">
                      {val} / {max}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 버튼 */}
            <div className="flex items-center gap-3 w-full">
              <Button
                variant="outline"
                onClick={handleForceSubmit}
                disabled={evalResult.score < MIN_FORCE_SUBMIT_SCORE}
                className="flex-1 h-12 rounded-xl font-bold gap-2 disabled:opacity-50"
              >
                <ArrowRight className="h-4 w-4" />
                {evalResult.score < MIN_FORCE_SUBMIT_SCORE
                  ? "더 써야 해요"
                  : "이대로 제출"}
              </Button>
              <Button
                onClick={handleRetry}
                className="flex-1 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                다시 쓰기
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 최종 결과 (통과 또는 최종 제출 후) */}
      {isShowingResult && evalResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full flex flex-col items-center gap-4"
        >
          {/* 내가 쓴 글 */}
          <div className="w-full rounded-xl bg-muted/50 p-4 border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground font-medium">
                내가 쓴 글
              </p>
              {retryCount > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {retryCount}번 수정
                </span>
              )}
            </div>
            <p
              className="text-base leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: "var(--font-handwriting, inherit)" }}
            >
              {text || "(작성한 내용)"}
            </p>
          </div>

          {/* 별점 + 점수 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <motion.div
                  key={n}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.1 + n * 0.08,
                    type: "spring",
                    stiffness: 300,
                  }}
                >
                  <Star
                    className="h-8 w-8"
                    style={{
                      fill: n <= evalResult.stars ? "#F1C40F" : "transparent",
                      stroke: n <= evalResult.stars ? "#F1C40F" : "#CBD5E1",
                    }}
                  />
                </motion.div>
              ))}
            </div>
            <p className="text-2xl font-black text-foreground">
              {evalResult.score}
              <span className="text-base font-medium text-muted-foreground">
                {" "}
                / 10점
              </span>
            </p>
            <p className="text-base font-semibold text-primary">
              {evalResult.feedback}
            </p>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              {evalResult.tip}
            </p>
          </motion.div>

          {/* 세부 항목 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full rounded-xl border bg-card p-4 flex flex-col gap-3"
          >
            {DETAIL_LABELS.map(({ key, label, max, color }) => {
              const val = evalResult.details[key];
              const pct = (val / max) * 100;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">
                    {label}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-10 text-right">
                    {val} / {max}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      )}

      {/* showResult이지만 evalResult가 없는 경우 (이전 세션 복구 등) */}
      {isShowingResult && !evalResult && (
        <div className="flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-5 py-2 text-sm font-bold text-green-700">
          <span>잘 썼어요! {charCount}자를 썼어요</span>
        </div>
      )}
    </div>
  );
}
