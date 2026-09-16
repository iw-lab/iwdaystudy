// Cloudflare Pages Function: GET /api/version
// Returns current app version information for update checking.
//
// 버전 진실원(single source of truth) = package.json.
// scripts/sync-version.mjs 가 아래 APP_VERSION 상수를 package.json 버전으로 주입한다
// (scripts/bump-version.sh 및 CI 배포 워크플로가 빌드 전 자동 실행).
// 웹/PWA 클라이언트(src/lib/update-checker.ts)는 CSP connect-src 'self' 정책을 우회하지 않도록
// 이 동일 출처(same-origin) 엔드포인트만 호출한다 — GitHub API를 직접 호출하지 않는다.

const GITHUB_OWNER = "insushim";
const GITHUB_REPO = "iwdaystudy";

// scripts/sync-version.mjs 가 이 값을 갱신한다. 직접 수정하지 말 것.
const APP_VERSION = "1.1.1";
const MIN_VERSION = "1.0.0";

export const onRequestGet: PagesFunction = async () => {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const buildDate = kst.toISOString().split("T")[0];

  return new Response(
    JSON.stringify({
      version: APP_VERSION,
      minVersion: MIN_VERSION,
      buildDate,
      // GitHub Releases의 명명 규칙(create-release.sh / deploy.yml)과 일치시켜
      // 클라이언트가 별도 API 호출 없이 다운로드 링크를 구성할 수 있게 한다.
      apkUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/v${APP_VERSION}/araharu-v${APP_VERSION}.apk`,
      htmlUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tag/v${APP_VERSION}`,
      // 실제로 동작하는 기능만 true로 둔다.
      // aiGeneration: 학생 문항은 결정론 생성기가 만든다(AI 생성은 관리자 도구 한정).
      // offlineMode: fetch를 처리하는 서비스워커가 없어 오프라인 동작 불가.
      features: {
        aiGeneration: false,
        offlineMode: false,
        badges: true,
        reports: true,
      },
      maintenance: false,
      message: null,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
};
