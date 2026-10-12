import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Question, DailySet } from "@/types/database";
import type {
  QuestionState,
  EmotionData,
  ReadinessData,
} from "@/types/learning";

interface LearningState {
  // 새로고침 복원 시 "누구의 어떤 세트" 진행 상태인지 식별하는 키
  // (studentId:setId). 다른 학생/다른 세트로 열리면 이 키가 달라지므로
  // 반드시 초기화되어야 한다 — initSession 호출부에서 비교 후 결정.
  sessionKey: string | null;
  currentSet: DailySet | null;
  questions: Question[];
  questionStates: QuestionState[];
  currentIndex: number;
  startedAt: Date | null;
  isCompleted: boolean;
  totalScore: number;
  emotionBefore: EmotionData | null;
  emotionAfter: EmotionData | null;
  readiness: ReadinessData | null;
  timeSpent: number;

  // Review phase (Duolingo-style wrong answer review)
  isReviewMode: boolean;
  showReviewIntro: boolean;
  reviewQueue: number[];
  reviewIndex: number;
  reviewCorrected: number[];
  /** 복습 바퀴 수(1부터). MAX_REVIEW_ROUNDS 를 넘으면 맞히지 못해도 끝낸다 */
  reviewRound: number;

  initSession: (
    set: DailySet,
    questions: Question[],
    sessionKey?: string,
  ) => void;
  setCurrentIndex: (index: number) => void;
  answerQuestion: (
    questionId: string,
    answer: unknown,
    isCorrect: boolean,
    score: number,
  ) => void;
  setEmotionBefore: (data: EmotionData) => void;
  setEmotionAfter: (data: EmotionData) => void;
  setReadiness: (data: ReadinessData) => void;
  completeSession: () => void;
  resetSession: () => void;
  incrementTime: () => void;

  startReview: (wrongIndices: number[]) => void;
  dismissReviewIntro: () => void;
  advanceReview: (isCorrect: boolean) => void;
  skipReview: () => void;
}

// 복습은 «다 맞힐 때까지»였는데, 글쓰기처럼 기준을 못 넘기면 결과 화면에 영영 못 갔다(2026-10-12 e2e 실측).
// 두 바퀴까지만 되풀이하고 끝낸다.
export const MAX_REVIEW_ROUNDS = 2;

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      sessionKey: null,
      currentSet: null,
      questions: [],
      questionStates: [],
      currentIndex: 0,
      startedAt: null,
      isCompleted: false,
      totalScore: 0,
      emotionBefore: null,
      emotionAfter: null,
      readiness: null,
      timeSpent: 0,

      isReviewMode: false,
      showReviewIntro: false,
      reviewQueue: [],
      reviewIndex: 0,
      reviewCorrected: [],
      reviewRound: 1,

      initSession: (dailySet, questions, sessionKey) => {
        set({
          sessionKey: sessionKey ?? null,
          currentSet: dailySet,
          questions,
          questionStates: questions.map((q) => ({
            questionId: q.id,
            answer: null,
            isCorrect: null,
            isAnswered: false,
            score: 0,
            timeSpent: 0,
          })),
          currentIndex: 0,
          startedAt: new Date(),
          isCompleted: false,
          totalScore: 0,
          timeSpent: 0,
          isReviewMode: false,
          showReviewIntro: false,
          reviewQueue: [],
          reviewIndex: 0,
          reviewCorrected: [],
          reviewRound: 1,
        });
      },

      setCurrentIndex: (index) => set({ currentIndex: index }),

      answerQuestion: (questionId, answer, isCorrect, score) => {
        set((state) => {
          // 복습(review) 재채점 등으로 같은 문항이 두 번째로 채점될 때,
          // 이전 점수를 빼지 않고 새 점수를 더하면 총점이 만점을 넘는다.
          // 같은 questionId의 이전 점수를 먼저 차감한 뒤 새 점수를 반영한다.
          const previousScore =
            state.questionStates.find((qs) => qs.questionId === questionId)
              ?.score ?? 0;
          const newStates = state.questionStates.map((qs) =>
            qs.questionId === questionId
              ? {
                  ...qs,
                  answer,
                  isCorrect,
                  isAnswered: true,
                  score,
                  timeSpent: state.timeSpent,
                }
              : qs,
          );
          return {
            questionStates: newStates,
            totalScore: state.totalScore - previousScore + score,
          };
        });
      },

      setEmotionBefore: (data) => set({ emotionBefore: data }),
      setEmotionAfter: (data) => set({ emotionAfter: data }),
      setReadiness: (data) => set({ readiness: data }),

      completeSession: () => set({ isCompleted: true }),

      resetSession: () =>
        set({
          sessionKey: null,
          currentSet: null,
          questions: [],
          questionStates: [],
          currentIndex: 0,
          startedAt: null,
          isCompleted: false,
          totalScore: 0,
          emotionBefore: null,
          emotionAfter: null,
          readiness: null,
          timeSpent: 0,
          isReviewMode: false,
          showReviewIntro: false,
          reviewQueue: [],
          reviewIndex: 0,
          reviewCorrected: [],
        }),

      incrementTime: () => set((state) => ({ timeSpent: state.timeSpent + 1 })),

      // ── Review actions ──
      startReview: (wrongIndices) =>
        set({
          showReviewIntro: true,
          isReviewMode: false,
          reviewQueue: wrongIndices,
          reviewIndex: 0,
          reviewCorrected: [],
          reviewRound: 1,
        }),

      dismissReviewIntro: () =>
        set({
          showReviewIntro: false,
          isReviewMode: true,
        }),

      advanceReview: (isCorrect) => {
        const state = get();
        const originalIndex = state.reviewQueue[state.reviewIndex];
        const newCorrected = isCorrect
          ? [...state.reviewCorrected, originalIndex]
          : state.reviewCorrected;

        const nextIndex = state.reviewIndex + 1;

        if (nextIndex >= state.reviewQueue.length) {
          // 아직 틀린 문제가 남아있으면 다시 반복
          const stillWrong = state.reviewQueue.filter(
            (idx) => !newCorrected.includes(idx),
          );
          if (stillWrong.length > 0 && state.reviewRound < MAX_REVIEW_ROUNDS) {
            // 틀린 문제만 다시 큐에 넣어서 한 번 더
            set({
              reviewCorrected: newCorrected,
              reviewQueue: stillWrong,
              reviewIndex: 0,
              reviewRound: state.reviewRound + 1,
            });
          } else {
            // 전부 맞춤 → 복습 완료
            set({
              reviewCorrected: newCorrected,
              reviewIndex: nextIndex,
              isReviewMode: false,
              isCompleted: true,
            });
          }
        } else {
          set({
            reviewCorrected: newCorrected,
            reviewIndex: nextIndex,
          });
        }
      },

      skipReview: () =>
        set({
          showReviewIntro: false,
          isReviewMode: false,
          isCompleted: true,
        }),
    }),
    {
      name: "araharu-learning-session",
      // 새로고침 복원 전용 — 탭을 닫으면 사라져도 무방하다(오래 남아있는
      // localStorage보다 사고 범위가 작음). 실수로 새로고침해도 진행 상태 유지.
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        sessionKey: state.sessionKey,
        currentSet: state.currentSet,
        questions: state.questions,
        questionStates: state.questionStates,
        currentIndex: state.currentIndex,
        startedAt: state.startedAt,
        isCompleted: state.isCompleted,
        totalScore: state.totalScore,
        emotionBefore: state.emotionBefore,
        emotionAfter: state.emotionAfter,
        readiness: state.readiness,
        timeSpent: state.timeSpent,
        isReviewMode: state.isReviewMode,
        showReviewIntro: state.showReviewIntro,
        reviewQueue: state.reviewQueue,
        reviewIndex: state.reviewIndex,
        reviewCorrected: state.reviewCorrected,
      }),
      // startedAt은 Date 객체여야 하는데(started_at.toISOString() 등에서 사용)
      // JSON 직렬화를 거치면 문자열로 돌아오므로 복원 시 다시 Date로 변환한다.
      merge: (persistedState, currentState) => {
        const persisted = persistedState as
          | (Partial<LearningState> & { startedAt?: string | Date | null })
          | undefined;
        if (!persisted) return currentState;
        return {
          ...currentState,
          ...persisted,
          startedAt: persisted.startedAt
            ? new Date(persisted.startedAt)
            : null,
        } as LearningState;
      },
    },
  ),
);
