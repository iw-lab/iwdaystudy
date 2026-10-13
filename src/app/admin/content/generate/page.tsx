"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Check,
  X,
  Eye,
  Save,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { storeDailySet } from "@/lib/local-storage";
import { generateId } from "@/lib/utils";
import type {
  DailySet,
  Question,
  SubjectType,
  QuestionType,
} from "@/types/database";
import { renderMath } from "@/components/learning/MathText";

interface GeneratedQuestion {
  id: string;
  type: string;
  subject: string;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  approved: boolean | null;
}

const subjects: Record<string, string[]> = {
  "1": ["수학", "국어", "맞춤법", "한글놀이", "상식"],
  "2": ["수학", "국어", "맞춤법", "한글놀이", "상식"],
  "3": ["수학", "국어", "맞춤법", "어휘", "한자", "영어", "상식", "안전"],
  "4": ["수학", "국어", "맞춤법", "어휘", "한자", "영어", "상식", "안전"],
  "5": [
    "수학",
    "국어",
    "맞춤법",
    "어휘",
    "한자",
    "영어",
    "과학",
    "사회",
    "안전",
  ],
  "6": [
    "수학",
    "국어",
    "맞춤법",
    "어휘",
    "한자",
    "영어",
    "과학",
    "사회",
    "안전",
  ],
};

const SUBJECT_TO_KEY: Record<string, SubjectType> = {
  수학: "math",
  국어: "korean",
  맞춤법: "spelling",
  어휘: "vocabulary",
  한자: "hanja",
  영어: "english",
  과학: "science",
  사회: "social",
  상식: "general_knowledge",
  안전: "safety",
  글쓰기: "writing",
  한글놀이: "creative",
};

// Template questions by subject for local generation
const questionTemplates: Record<string, GeneratedQuestion[]> = {
  수학: [
    {
      id: "",
      type: "multiple_choice",
      subject: "수학",
      question: "325 + 478 = ?",
      options: ["793", "803", "813", "703"],
      answer: "803",
      explanation:
        "325 + 478을 계산하면, 일의 자리: 5+8=13 (3을 쓰고 1 올림), 십의 자리: 2+7+1=10 (0을 쓰고 1 올림), 백의 자리: 3+4+1=8. 따라서 803입니다.",
      approved: null,
    },
    {
      id: "",
      type: "multiple_choice",
      subject: "수학",
      question: "다음 중 1000에 가장 가까운 수는?",
      options: ["987", "1012", "978", "1023"],
      answer: "1012",
      explanation:
        "각 수와 1000의 차이를 구하면: 987은 13, 1012는 12, 978은 22, 1023은 23. 따라서 1012가 가장 가깝습니다.",
      approved: null,
    },
    {
      id: "",
      type: "multiple_choice",
      subject: "수학",
      question: "7 x 8 = ?",
      options: ["54", "56", "58", "48"],
      answer: "56",
      explanation: "7 x 8 = 56입니다.",
      approved: null,
    },
    {
      id: "",
      type: "multiple_choice",
      subject: "수학",
      question: "100 - 37 = ?",
      options: ["63", "73", "67", "57"],
      answer: "63",
      explanation: "100 - 37 = 63입니다.",
      approved: null,
    },
    {
      id: "",
      type: "multiple_choice",
      subject: "수학",
      question: "1/2 + 1/4 = ?",
      options: ["2/6", "3/4", "1/6", "2/4"],
      answer: "3/4",
      explanation: "1/2 = 2/4이므로, 2/4 + 1/4 = 3/4입니다.",
      approved: null,
    },
  ],
  맞춤법: [
    {
      id: "",
      type: "short_answer",
      subject: "맞춤법",
      question:
        "다음 중 맞춤법이 올바른 것은?\n1) 됬다\n2) 됐다\n3) 되었다\n4) 되엤다",
      answer: "2, 3",
      explanation: "'됐다'는 '되었다'의 준말로 둘 다 올바른 표현입니다.",
      approved: null,
    },
    {
      id: "",
      type: "multiple_choice",
      subject: "맞춤법",
      question: "올바른 표기는?",
      options: ["빗나다", "빛나다", "비나다", "빋나다"],
      answer: "빛나다",
      explanation: "'빛나다'가 올바른 표기입니다.",
      approved: null,
    },
    {
      id: "",
      type: "multiple_choice",
      subject: "맞춤법",
      question: "올바른 문장은?",
      options: ["나는 갈께", "나는 갈게", "나는 갈깨", "나는 갈겨"],
      answer: "나는 갈게",
      explanation: "'갈게'가 올바른 표기입니다. '-ㄹ게'가 맞습니다.",
      approved: null,
    },
  ],
  영어: [
    {
      id: "",
      type: "multiple_choice",
      subject: "영어",
      question: "What color is the sky?",
      options: ["Red", "Blue", "Green", "Yellow"],
      answer: "Blue",
      explanation: "하늘의 색깔은 파란색(Blue)입니다.",
      approved: null,
    },
    {
      id: "",
      type: "multiple_choice",
      subject: "영어",
      question: "How many days are in a week?",
      options: ["5", "6", "7", "8"],
      answer: "7",
      explanation: "일주일은 7일입니다.",
      approved: null,
    },
    {
      id: "",
      type: "multiple_choice",
      subject: "영어",
      question: "'사과'를 영어로?",
      options: ["Banana", "Orange", "Apple", "Grape"],
      answer: "Apple",
      explanation: "사과는 영어로 Apple입니다.",
      approved: null,
    },
  ],
  한자: [
    {
      id: "",
      type: "multiple_choice",
      subject: "한자",
      question: "水(수)의 뜻은?",
      options: ["불", "물", "나무", "흙"],
      answer: "물",
      explanation: "水(수)는 '물 수'로, 물을 뜻합니다.",
      approved: null,
    },
    {
      id: "",
      type: "multiple_choice",
      subject: "한자",
      question: "山(산)의 뜻은?",
      options: ["강", "바다", "산", "들"],
      answer: "산",
      explanation: "山(산)은 '뫼 산'으로, 산을 뜻합니다.",
      approved: null,
    },
    {
      id: "",
      type: "multiple_choice",
      subject: "한자",
      question: "火(화)의 뜻은?",
      options: ["물", "불", "바람", "흙"],
      answer: "불",
      explanation: "火(화)는 '불 화'로, 불을 뜻합니다.",
      approved: null,
    },
  ],
  국어: [
    {
      id: "",
      type: "multiple_choice",
      subject: "국어",
      question: "다음 중 동시(童詩)의 특징이 아닌 것은?",
      options: [
        "아이들의 세계를 담는다",
        "리듬감이 있다",
        "전문 용어를 사용한다",
        "짧고 간결하다",
      ],
      answer: "전문 용어를 사용한다",
      explanation:
        "동시는 아이들의 세계를 담고, 리듬감이 있으며, 짧고 간결한 것이 특징입니다.",
      approved: null,
    },
    {
      id: "",
      type: "multiple_choice",
      subject: "국어",
      question: "다음 중 받침이 있는 글자는?",
      options: ["가", "나", "달", "이"],
      answer: "달",
      explanation: "'달'은 'ㄹ' 받침이 있는 글자입니다.",
      approved: null,
    },
  ],
  상식: [
    {
      id: "",
      type: "multiple_choice",
      subject: "상식",
      question: "지구에서 가장 큰 대양은?",
      options: ["대서양", "인도양", "태평양", "북극해"],
      answer: "태평양",
      explanation: "태평양은 지구에서 가장 큰 대양입니다.",
      approved: null,
    },
    {
      id: "",
      type: "multiple_choice",
      subject: "상식",
      question: "무지개는 몇 가지 색으로 이루어져 있나요?",
      options: ["5가지", "6가지", "7가지", "8가지"],
      answer: "7가지",
      explanation: "무지개는 빨주노초파남보 7가지 색입니다.",
      approved: null,
    },
  ],
  어휘: [
    {
      id: "",
      type: "multiple_choice",
      subject: "어휘",
      question: "'고마움을 느끼는 마음'을 뜻하는 단어는?",
      options: ["감사", "분노", "슬픔", "기쁨"],
      answer: "감사",
      explanation: "'감사'는 고마움을 느끼는 마음을 뜻합니다.",
      approved: null,
    },
    {
      id: "",
      type: "multiple_choice",
      subject: "어휘",
      question: "'매우 작은'의 반대말은?",
      options: ["조그만", "거대한", "빠른", "느린"],
      answer: "거대한",
      explanation: "'매우 작은'의 반대말은 '거대한'입니다.",
      approved: null,
    },
  ],
};

function generateLocalQuestions(
  subjectName: string,
  count: number,
): GeneratedQuestion[] {
  const templates =
    questionTemplates[subjectName] || questionTemplates["상식"] || [];
  const result: GeneratedQuestion[] = [];
  const numToGenerate = Math.min(Number(count), 20);

  for (let i = 0; i < numToGenerate; i++) {
    const template = templates[i % templates.length];
    result.push({
      ...template,
      id: generateId(),
      approved: null,
    });
  }
  return result;
}

export default function AIGeneratePage() {
  const [grade, setGrade] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [count, setCount] = useState("5");
  const [difficulty, setDifficulty] = useState("보통");
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const availableSubjects = grade ? subjects[grade] || [] : [];

  async function handleGenerate() {
    if (!grade || !semester || !subject) return;

    setIsGenerating(true);
    setQuestions([]);
    setSaved(false);

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const generated = generateLocalQuestions(subject, Number(count));
    setQuestions(generated);
    setIsGenerating(false);
  }

  function approveQuestion(id: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, approved: true } : q)),
    );
  }

  function rejectQuestion(id: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, approved: false } : q)),
    );
  }

  function approveAll() {
    setQuestions((prev) => prev.map((q) => ({ ...q, approved: true })));
  }

  async function handleSave() {
    const approved = questions.filter((q) => q.approved === true);
    if (approved.length === 0) return;

    setIsSaving(true);

    // Determine next set number for this grade/semester
    let nextSetNumber = 1;
    try {
      const setsData = localStorage.getItem("araharu_daily_sets");
      if (setsData) {
        const existingSets: DailySet[] = JSON.parse(setsData);
        const sameSets = existingSets.filter(
          (s) => s.grade === Number(grade) && s.semester === Number(semester),
        );
        if (sameSets.length > 0) {
          nextSetNumber = Math.max(...sameSets.map((s) => s.set_number)) + 1;
        }
      }
    } catch {
      // ignore
    }

    const setId = generateId();
    const now = new Date().toISOString();
    const subjectKey = SUBJECT_TO_KEY[subject] || "general_knowledge";

    const dailySet: DailySet = {
      id: setId,
      grade: Number(grade),
      semester: Number(semester),
      set_number: nextSetNumber,
      title: `${grade}학년 ${semester}학기 ${subject} 세트 #${nextSetNumber}`,
      description: `AI 생성 - ${difficulty} 난이도`,
      estimated_minutes: approved.length * 2,
      total_questions: approved.length,
      total_points: approved.length * 10,
      is_published: false,
      created_at: now,
    };

    const dbQuestions: Question[] = approved.map((q, i) => ({
      id: generateId(),
      daily_set_id: setId,
      curriculum_standard_id: null,
      subject: subjectKey as SubjectType,
      question_type: (q.type === "multiple_choice"
        ? "multiple_choice"
        : "short_answer") as QuestionType,
      order_index: i + 1,
      title: null,
      content: {
        question: q.question,
        options: q.options || null,
      },
      answer: { correct: q.answer },
      explanation: q.explanation,
      points: 10,
      hint: null,
      metadata: null,
      created_at: now,
    }));

    // Store to localStorage via storeDailySet
    storeDailySet(dailySet, dbQuestions);

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    setSaved(true);
  }

  const approvedCount = questions.filter((q) => q.approved === true).length;
  const rejectedCount = questions.filter((q) => q.approved === false).length;
  const pendingCount = questions.filter((q) => q.approved === null).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI 콘텐츠 생성
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          학습 문제를 자동으로 생성하고 로컬에 저장합니다.
        </p>
      </div>

      {/* Configuration */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">생성 설정</CardTitle>
          <CardDescription>
            학년, 학기, 과목을 선택하고 문제를 생성하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>학년</Label>
              <Select
                value={grade}
                onValueChange={(v) => {
                  setGrade(v);
                  setSubject("");
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="학년 선택" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <SelectItem key={g} value={String(g)}>
                      {g}학년
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>학기</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="학기 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1학기</SelectItem>
                  <SelectItem value="2">2학기</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>과목</Label>
              <Select
                value={subject}
                onValueChange={setSubject}
                disabled={!grade}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="과목 선택" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>문제 수</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label>난이도</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="쉬움">쉬움</SelectItem>
                  <SelectItem value="보통">보통</SelectItem>
                  <SelectItem value="어려움">어려움</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              onClick={handleGenerate}
              disabled={!grade || !semester || !subject || isGenerating}
              className="h-11 px-6"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI 생성 중...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  문제 생성하기
                </span>
              )}
            </Button>
            {grade && semester && subject && (
              <span className="text-sm text-muted-foreground">
                {grade}학년 {semester}학기 {subject} - {difficulty} - {count}
                문제
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generation progress */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border shadow-sm border-primary/30">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">
                    AI가 문제를 만들고 있어요
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {grade}학년 {semester}학기 {subject} 문제 {count}개를
                    생성하고 있습니다...
                  </p>
                  <div className="mt-6 mx-auto max-w-xs">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated questions */}
      {questions.length > 0 && !isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Actions bar */}
          <Card className="border shadow-sm">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    생성된 문제: {questions.length}개
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      승인 {approvedCount}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    >
                      <X className="h-3 w-3 mr-1" />
                      거부 {rejectedCount}
                    </Badge>
                    <Badge variant="secondary">대기 {pendingCount}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={approveAll}>
                    전체 승인
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleGenerate}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    다시 생성
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={approvedCount === 0 || isSaving || saved}
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        저장 중...
                      </span>
                    ) : saved ? (
                      <span className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        저장 완료!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Save className="h-3.5 w-3.5" />
                        승인된 문제 저장 ({approvedCount})
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question cards */}
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={cn(
                  "border shadow-sm transition-colors",
                  q.approved === true &&
                    "border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20",
                  q.approved === false &&
                    "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 opacity-60",
                )}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {q.subject}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {q.type === "multiple_choice" ? "객관식" : "단답형"}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium whitespace-pre-line">
                        {renderMath(q.question)}
                      </p>

                      {q.options && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {q.options.map((opt, oi) => (
                            <div
                              key={oi}
                              className={cn(
                                "rounded-lg border px-3 py-2 text-sm",
                                opt === q.answer
                                  ? "border-primary bg-primary/5 font-medium text-primary"
                                  : "border-border",
                              )}
                            >
                              {String.fromCharCode(9312 + oi)} {renderMath(opt)}
                              {opt === q.answer && (
                                <Check className="inline h-3.5 w-3.5 ml-1" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {!q.options && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary">
                          <span>정답:</span> {renderMath(q.answer)}
                        </div>
                      )}

                      {/* Expandable explanation */}
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === q.id ? null : q.id)
                        }
                        className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        풀이 보기
                        {expandedId === q.id ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedId === q.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 leading-relaxed">
                              {renderMath(q.explanation)}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Approve / Reject */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <Button
                        variant={q.approved === true ? "default" : "outline"}
                        size="icon"
                        className={cn(
                          "h-8 w-8",
                          q.approved === true &&
                            "bg-green-600 hover:bg-green-700",
                        )}
                        onClick={() => approveQuestion(q.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={
                          q.approved === false ? "destructive" : "outline"
                        }
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => rejectQuestion(q.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {questions.length === 0 && !isGenerating && (
        <Card className="border shadow-sm border-dashed">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Wand2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-2">문제를 생성해 보세요</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                위 설정에서 학년, 학기, 과목을 선택하고 &ldquo;문제
                생성하기&rdquo; 버튼을 클릭하면 문제가 자동으로 생성됩니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
