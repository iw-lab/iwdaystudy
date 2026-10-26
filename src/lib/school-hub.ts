"use client";
// 학교 순위(game-builder kit/school-hub) — 2026-10-26 사용자 «아라하루에도 다른 게임앱처럼 사용자 수·학교 정도만 나타내자».
// 계정·이름은 그대로 0: 기기 무작위 id 해시 + NEIS 목록에서 고른 학교, 서버에는 학교별 합계만.
// 점수 = 오늘의 학습 한 세트를 끝낼 때 1판(허브 FREE_PLAY — 이용권 문제 창 없음).
// 🔴 키트 모듈은 불러오는 순간 document 를 만진다 → 정적 빌드(서버)에서 죽는다. 브라우저에서만 import() 로 부른다.

export const SCHOOL_HUB = "https://araharu-hub.simssijjang-a04.workers.dev";

type Kit = typeof import("@/gb/gb-school.js");
let kit: Promise<Kit> | null = null;
export function loadSchoolHub(): Promise<Kit> {
  if (!kit) {
    kit = (async () => {
      const [{ configureHub }, school, { setAutoFullscreen }] = await Promise.all([
        import("@/gb/hubnet.js"),
        import("@/gb/gb-school.js"),
        import("@/gb/gb-fullscreen.js"),
      ]);
      configureHub({ key: "araharu.hub.v1", direct: SCHOOL_HUB });
      school.configureSchool({ freePlay: true, playWord: "학습" });
      setAutoFullscreen(false); // 공부 앱 — 세트 끝에 화면이 갑자기 꽉 차면 안 된다
      return school;
    })();
  }
  return kit;
}

/** 세트를 끝냈을 때 한 번 — 학교를 아직 안 골랐으면 고르는 창이 뜨고, 고르면 점수가 들어간다. 실패는 학습을 막지 않는다 */
export function reportSetDone(): void {
  void loadSchoolHub()
    .then(({ gbGate, gbFinish }) => gbGate((ref) => { if (ref) void gbFinish(ref, true).catch(() => null); }, { kind: "lesson" }))
    .catch(() => {});
}
