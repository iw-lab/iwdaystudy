"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import type { DailySetWithQuestions } from "@/types/learning";
import { generateDailySetWithoutRepeats } from "@/lib/daily-set-generator";
import { MAX_DAILY_SETS } from "@/lib/constants";
import {
  getLearningRecords,
  getSeenQuestionSignatures,
  storeDailySet,
  getStoredDailySet,
  getSubjectStats,
} from "@/lib/local-storage";

// Bump this version when daily set structure changes to invalidate cached sets
// v3: 4-way 콘텐츠 감사(한자 예문·영어 품사·과학) + 조사 교정 반영 → 기존 캐시 세트 무효화
// v4: 문제 품질 전면 재설계(distractor 범주매칭·답노출 차단·OX·고대힌트·맞춤법·학년초과 제거·지문 2배·TTS·레이아웃)
// v5: distractor 2차 강화(맞춤법 sentence 동일문장변형·숫자 스케일/콤마·길이근접 랭킹·뱅크7종 추가·vocab 특수variant 랭킹·0오답 가드)
// v6: 수학 reverse 정답무결성 — 첫 수가 결과로 유일 복원되는 식만 reverse 허용(몫/나머지·소수·문장형 폴백), 정답이 보기에 없거나 오답이 정답으로 표기되던 결함 제거
// v7: 수학 UX — 시각 보기 'H시 M분' 라벨(인코딩 300 비표시), 번호범례→실제 라벨 보기(무의미 3·4 제거), 분수 분수꼴 렌더, 이름 조사(연필이) 교정
// v8: 학년 매핑 수정(주지과목 grade-1 복습→현재 학년, 6학년 grade6 콘텐츠 사장 버그 해소) + 전체 문항 약 2배 증량(15→30, 20→39, 21→42) + 1~2학년 독해/창의 중복문항 제거
// v9: 전 학년 문항 42로 통일(5학년 기준) + 과학·사회 단원 매핑 커버리지 확장(assignScienceUnit/assignSocialUnit — 학기 진도 필터 정확도↑, 6학년 특화 콘텐츠 노출↑)
// v10: 수학 진도표(MATH_UNIT_SEQUENCE) 전 학년 2022 개정 정합 재작성 — 기존엔 6-1에 비례식(6-2 단원) 노출·분수의 나눗셈(6-1 핵심) 누락 등 학기 오배치 다수. 학기 초과 해소 + 부적합 단원(3~4학년 혼합계산, 6학년 다각형 넓이) 제외
// v11: 사회 진도표(SOCIAL_UNIT_SEQUENCE) 현행 교과서 정합 정정 — 6-1에 세계(6-2 단원)·6-2에 정치/경제(6-1 단원)가 중복돼 학기 초과이던 것 스왑. 경제생활(초등 6학년 단원)을 5학년에서 제외. (과학 진도표는 2022 개정과 이미 정확, 영어는 주제 배치가 교과서 자율이라 유지)
// v12: 세트 구조 개편 — 세트당 문항 42→원래(15/20/21) 복귀 + 하루 최대 3세트 순차 제공.
//      수학 전수검수 반영(약분 기약분수 오답, 분수 답형식 모호, 분수→소수 반올림 오답,
//      백분율/할인가 비정수, 음수 결과, 단위혼합 답 모호 등) + 힌트 전면 교체(답노출 제거).
const SET_VERSION = 14;
const TODAY_SET_PREFIX = "araharu_today_set_";

function getTodayKey(userId: string, slot: number): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  // slot 1은 기존 키 형식 유지(하위호환), 2·3은 접미사
  const suffix = slot === 1 ? "" : `_s${slot}`;
  return `${TODAY_SET_PREFIX}v${SET_VERSION}_${userId}_${y}-${m}-${d}${suffix}`;
}

export function useDailySet() {
  const { user } = useAuthStore();
  const [dailySet, setDailySet] = useState<DailySetWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 오늘 몇 번째 세트인지(1~MAX_DAILY_SETS), 완료한 세트 수
  const [setIndex, setSetIndex] = useState(1);
  const [completedCount, setCompletedCount] = useState(0);
  const [allDone, setAllDone] = useState(false);

  const fetchDailySet = useCallback(async () => {
    if (!user?.grade || !user?.semester) {
      setError("학년/학기 정보가 필요합니다.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const records = getLearningRecords(user.id);
      const completedSetIds = new Set(
        records.filter((r) => r.is_completed).map((r) => r.daily_set_id),
      );

      // 오늘의 슬롯(1~3)을 순서대로 살펴 첫 미완료 세트를 찾는다
      let done = 0;
      let lastCompletedId: string | null = null;
      for (let slot = 1; slot <= MAX_DAILY_SETS; slot++) {
        const todayKey = getTodayKey(user.id, slot);
        const storedId =
          typeof window !== "undefined"
            ? localStorage.getItem(todayKey)
            : null;

        if (storedId && completedSetIds.has(storedId)) {
          done++;
          lastCompletedId = storedId;
          continue;
        }

        if (storedId) {
          const stored = getStoredDailySet(storedId);
          // 학년·학기를 바꿨으면 오늘 만들어 둔 옛 학기 세트는 버리고 새로 만든다(2026-10-16 «5학년 2학기로 들어갔는데 1학기로 뜸»)
          const sameTerm =
            !!stored?.set &&
            Number(stored.set.grade) === Number(user.grade) &&
            Number(stored.set.semester) === Number(user.semester);
          if (stored && sameTerm && stored.questions && stored.questions.length > 0) {
            setDailySet(stored);
            setSetIndex(slot);
            setCompletedCount(done);
            setAllDone(false);
            setIsLoading(false);
            return;
          }
          // Invalid/corrupted stored set - clear it and regenerate below
          localStorage.removeItem(todayKey);
        }

        // 이 슬롯의 새 세트 생성
        const usedQuestionSignatures = getSeenQuestionSignatures(user.id);
        const subjectAccuracy = getSubjectStats(user.id);
        const setData = generateDailySetWithoutRepeats(
          user.grade,
          user.semester,
          completedSetIds,
          usedQuestionSignatures,
          200,
          subjectAccuracy,
        );
        storeDailySet(setData.set, setData.questions);
        if (typeof window !== "undefined") {
          localStorage.setItem(todayKey, setData.set.id);
        }
        setDailySet(setData);
        setSetIndex(slot);
        setCompletedCount(done);
        setAllDone(false);
        setIsLoading(false);
        return;
      }

      // 오늘 세트를 모두 완료 → 마지막 완료 세트를 완료 상태로 보여준다
      setCompletedCount(done);
      setAllDone(true);
      setSetIndex(MAX_DAILY_SETS);
      const lastStored = lastCompletedId
        ? getStoredDailySet(lastCompletedId)
        : null;
      setDailySet(lastStored ?? null);
    } catch (err) {
      console.error("Daily set generation error:", err);
      // Clear corrupted today set so next refresh can retry
      if (typeof window !== "undefined") {
        for (let slot = 1; slot <= MAX_DAILY_SETS; slot++) {
          localStorage.removeItem(getTodayKey(user.id, slot));
        }
      }
      setError(
        `학습 세트를 불러올 수 없습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.grade, user?.semester]);

  useEffect(() => {
    fetchDailySet();
  }, [fetchDailySet]);

  return {
    dailySet,
    isLoading,
    error,
    refetch: fetchDailySet,
    setIndex,
    completedCount,
    maxSets: MAX_DAILY_SETS,
    allDone,
  };
}
