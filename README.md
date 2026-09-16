# 아라하루 (araharu / iwdaystudy)

초등학교 1~6학년 학생을 위한 **매일 아침 학습 세트** 웹앱. 학년·학기별로 수학·맞춤법·상식·안전·한자·영어·독해 문항을 매일 자동 생성해 제공하고, 학생·학부모·교사·관리자용 대시보드를 함께 제공한다.

- 웹/PWA: https://araharu-ecp.pages.dev  ← 실제 운영 도메인 (araharu.pages.dev 는 갱신되지 않는 옛 Pages 프로젝트)
- Android: GitHub Releases에서 APK 배포 (자동 업데이트 감지)

## 기술 스택

- **Next.js 16** (App Router, `output: "export"` 정적 export)
- **Cloudflare Pages** 호스팅 + **Cloudflare Pages Functions**(`functions/`, `/api/*`)
- **Cloudflare D1**(SQLite) — `wrangler/schema.sql`
- **Android**: WebView 기반 앱 (`android/`), PWA를 앱으로 감싼 형태
- TypeScript, Tailwind CSS, Zustand, Radix UI

## 로컬 실행

```bash
npm ci
npm run dev
```

http://localhost:3000 에서 확인. 로컬에서 D1/API를 함께 띄우려면 `wrangler pages dev out` (빌드 산출물 필요) 또는 Cloudflare 대시보드의 미리보기 배포를 사용한다.

## 빌드

```bash
npm run build
```

`next build`가 정적 파일을 `out/`에 생성한다. 빌드 전(`prebuild`) 다음이 자동 실행된다:

1. `scripts/generate-icons.mjs` — `public/favicon.svg`에서 PWA 아이콘 생성
2. `scripts/sync-version.mjs` — `package.json`의 `version`을 진실원(single source of truth)으로 삼아 `android/app/build.gradle`, `functions/api/version.ts`에 동일 버전을 주입

**`npm run build`는 CI(GitHub Actions)가 실행한다. 로컬에서 이 커맨드를 실행하지 말 것** — 다른 작업과 충돌할 수 있다. 로컬 검증은 아래 "검증 스크립트"로 한다.

## 버전 관리

버전은 **`package.json`의 `version`이 유일한 진실원**이다. 아래 세 곳이 항상 일치해야 한다.

| 파일 | 용도 |
|---|---|
| `package.json` `version` | 웹 클라이언트가 빌드 시 `NEXT_PUBLIC_APP_VERSION`으로 주입받아 자기 버전을 안다 (`next.config.ts`) |
| `android/app/build.gradle` `versionName`/`versionCode` | Android 앱 버전 |
| `functions/api/version.ts` `APP_VERSION` | 서버가 "최신 버전이 몇인지" 응답하는 API (`GET /api/version`) — 웹/PWA/Android가 업데이트 여부를 판단하는 기준 |

버전을 올릴 때:

```bash
bash scripts/bump-version.sh 1.0.31   # package.json + sw.js + (gradle/version.ts는 sync-version.mjs가 처리)
# 또는 커밋/태그/푸시까지 한 번에:
bash scripts/create-release.sh patch "버그 수정"
```

두 스크립트 모두 내부적으로 `node scripts/sync-version.mjs`를 호출해 `android/app/build.gradle`, `functions/api/version.ts`를 `package.json` 기준으로 동기화한다. CI(`cf-deploy.yml`, `deploy.yml`)도 빌드 직전 동일 스크립트를 한 번 더 실행해, 배포 시점에는 항상 세 곳이 일치하도록 보장한다.

업데이트 알림(`src/lib/update-checker.ts`)은 **동일 출처인 `/api/version`만 호출한다** (GitHub API 직접 호출은 CSP `connect-src 'self'`에 막히므로 사용하지 않는다).

## 배포

- **`master` 브랜치 push → `.github/workflows/cf-deploy.yml`** (실질적인 상시 배포 경로)
  1. 버전 동기화(`sync-version.mjs`)
  3. `npm run build`
  4. Cloudflare Pages 배포
- **태그(`v*`) push 또는 workflow_dispatch → `.github/workflows/deploy.yml`** (릴리스 경로)
  1. 웹 빌드 (버전 동기화 포함) → Cloudflare Pages 배포
  2. Android APK 빌드 (버전 동기화 포함)
  3. GitHub Release 생성 (APK 첨부, 릴리스 노트 자동 생성)

`create-release.sh`는 `git push origin master --tags`로 두 ref를 동시에 push하므로 두 워크플로가 같은 커밋에 대해 동시에 켜질 수 있다. 둘 다 `concurrency: group: cloudflare-pages-deploy`로 묶여 있어 **동시 배포는 직렬화**된다(취소하지 않고 순서대로 대기).

### D1 마이그레이션

스키마 변경은 `wrangler/schema.sql`에 반영하고, **배포 전에 직접** 적용한다:

```bash
bash scripts/db-migrate.sh          # 원격(프로덕션) D1
bash scripts/db-migrate.sh --local  # 로컬 개발 D1
```

CI 에서 자동으로 돌리지 않는 이유: GitHub Actions 의 `CLOUDFLARE_API_TOKEN` 에 D1:Edit 권한이 없어 `d1 execute --remote` 가 `Authentication error [code: 10000]` 으로 실패하고, 그 때문에 사이트 배포 전체가 막힌다(2026-08-12 실측). 토큰에 **D1:Edit** 권한을 추가하면 두 워크플로의 주석 처리된 마이그레이션 단계를 되살릴 수 있다.

컬럼 추가 등은 **기존 데이터를 깨지 않는 형태**(`ALTER TABLE ... ADD COLUMN` + 기본값, 또는 `CREATE TABLE IF NOT EXISTS`)로 작성해야 한다.

## 환경변수 / 시크릿

**GitHub Actions Secrets** (`.github/workflows/*.yml`에서 사용):

| 이름 | 용도 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Pages 배포 인증 (D1:Edit 권한은 없음 — 마이그레이션은 로컬 수동) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 계정 ID |

**Cloudflare Pages 시크릿** (`wrangler secret put <이름>` 으로 등록, `wrangler.toml` 참고):

| 이름 | 용도 |
|---|---|
| `ANTHROPIC_API_KEY` | AI 문항 생성 등에서 사용하는 Claude API 키 |
| `CRON_SECRET` | 정기 실행(cron) 엔드포인트 인증 |
| `AUTH_SECRET` | 세션/인증 서명 키 |

**빌드 타임 변수** (`next.config.ts`가 자동 주입, 사람이 설정할 필요 없음): `NEXT_PUBLIC_APP_VERSION` (← `package.json` version).

## 검증 스크립트 (배포 전 필수 게이트)

문항 생성기·콘텐츠를 수정했다면 **아래를 실행해 0결함을 확인한 뒤에만 배포**한다.

```bash
npx tsx scripts/verify-math.ts       # 수학 문항 정답 기계검증 (전 학년·학기·난이도 × 다수 시드, expression 독립 재계산)
npx tsx scripts/verify-content.ts    # 문항 텍스트 결정론 게이트 (플레이스홀더 잔존·조사·중복보기·정답 누락·undefined 유출)
npx tsx scripts/verify-spelling.ts   # 맞춤법 문항 결정론 게이트 (조사 정합성 + 생성 가능한 전 문항 비문/판정불가 검사)
npx tsx scripts/verify-grade.ts      # 학년/학기별 일일 세트 생성 결과 요약 (과목별 문항 수 확인)
npx tsx scripts/verify-underline.ts  # "밑줄 친 …" 지시문 게이트 (밑줄을 말하는데 밑줄 대상이 없는 문항 0 + 영어 밑줄 라벨 보유율 바닥)
npx tsx scripts/smoke-set.ts         # 학년/학기별 일일 세트 스모크 테스트 (기대 문항 수·수학 예시 출력)
```

하나라도 결함(exit 1 또는 비정상 출력)이 나오면 원인을 해결하기 전까지 배포하지 않는다.

일반적인 타입 체크:

```bash
npx tsc --noEmit
```

## 학습 결과 동기화 (오프라인 우선 + 서버 적재)

학습 세트는 **브라우저에서 생성**한다. 커리큘럼 데이터가 13만 줄 규모라 Worker
스크립트 용량 한도에 들어가지 않기 때문이다. 그래서 결과도 localStorage 에 먼저
쓰고(학교 와이파이가 끊겨도 학습이 멈추지 않아야 한다), 세션을 마치면 세트·문항
스냅샷과 함께 서버로 올린다.

```
학생 브라우저                                   Cloudflare D1
  generateDailySet()  ─→ localStorage
  handleComplete()    ─→ localStorage
        │
        └─ syncCompletedSet()  ──POST /api/daily-set/submit──→  daily_sets
                                  (set + questions + responses)   questions
                                                                  learning_records
                                                                  question_responses
```

- **내용주소 id** — 서버가 저장하는 세트 id 는 `<클라이언트 세트id>~<내용해시8>` 이다
  (`functions/lib/client-set.ts`). 내용이 완전히 같은 학생들은 한 행을 공유하고
  (한 학급에서 중복 제거), 난이도 개인화로 내용이 달라지면 자동으로 다른 행이 된다.
  **내용이 1비트라도 다르면 id 가 달라지므로 남의 행을 덮어쓸 수 없다** — 그래서
  `INSERT OR IGNORE` 만으로 경합이 안전하다.
- **적재된 세트는 `is_published = 0`** 이다. `GET /api/daily-set` 과 cron 배정은
  `is_published = 1` 만 보므로, 학생이 올린 스냅샷이 배포용 커리큘럼 세트로 둔갑해
  다른 학생에게 제공되는 경로가 없다. 관리자 통계의 세트 수에도 잡히지 않는다.
- **전송 실패는 학습을 막지 않는다.** 실패하면 `araharu_sync_queue` 에 키만 쌓아
  두고(본문은 전송 직전에 localStorage 에서 다시 만든다) 다음 접속·온라인 복귀·
  로그아웃 시점에 재전송한다. 서버는 `UNIQUE(student_id, daily_set_id)` 로 upsert
  하므로 재전송이 멱등이고, 포인트는 최초 완료에만 적립된다.
- **기기 교체 복원** — 로그인 후 한 번 `GET /api/daily-set/history` 로 본인 기록을
  가져와 로컬에 병합한다(연속일수·포인트·"이 세트는 이미 했음" 판정 복구). 로컬에
  이미 있는 세트는 건드리지 않는다.
- 스키마는 그대로다. **이 기능에 마이그레이션이 필요 없다.**

### 용량·쓰기량 (실측 기준)

로컬 D1 에 실제로 적재된 5학년 21문항 세트를 재어 보면 문항 본문 합계가 **6.8KB**,
문항별 응답이 21건에 **약 1.7KB** 다. 학습기록까지 합쳐 **학생 1명 · 세트 1개당 약 9KB**.

한 학급(21명 × 하루 3세트) 기준, 개인화로 세트가 전혀 공유되지 않는 최악의 경우:

| 항목 | 하루 | 학년도(수업일 180일) | D1 무료 한도 |
|---|---|---|---|
| 저장량 | 약 0.6MB | 약 100MB | 5GB |
| 쓰기 | 약 2,800건 | — | 100,000건/일 |

내용이 같은 학생끼리는 세트·문항 행을 공유하므로 실제 사용량은 이보다 적다.
학급이 수십 개로 늘어도 무료 한도 안이지만, 학교 단위로 커지면 오래된 학년도의
`questions`/`question_responses` 를 정리하는 정책이 필요해진다.

### 교사 화면이 보는 값

`GET /api/teacher/students` 가 D1 의 `learning_records` 를 LEFT JOIN 해서 완료
세션 수·평균 점수·최근 활동을 함께 돌려준다. 예전에는 교사 기기의 localStorage 를
학생 id 로 뒤졌는데, 학생 기록은 **학생 기기**에 있으므로 전원이 "활동 없음"으로
보였다.

### 학생 비밀번호 초기화

학생 계정에는 본인 확인 수단(실메일·전화)이 없어 셀프 재설정을 만들 수 없다.
대신 담임이 `학생 관리` 목록의 열쇠 아이콘으로 초기화한다(두 번 눌러야 실행).
기본값은 계정 생성 규칙과 같은 **아이디와 동일**(`ara01@class.local` → `ara01`)이고,
비밀번호를 여러 번 틀려 계정 단위 제한에 걸려 있었다면 함께 풀어 준다.
API 는 `POST /api/teacher/reset-password`, 담임 본인 학생 또는 관리자만 가능하다.

### 시크릿 설정 확인

`GET /api/admin/stats` 의 `config` 필드가 `CRON_SECRET`·`ANTHROPIC_API_KEY` 의
**설정 여부만**(값은 절대 나가지 않는다) 알려준다. wrangler 없이 관리자 계정으로
누락을 확인할 수 있다.

## 프로젝트 구조 (요약)

```
src/app/            Next.js App Router 페이지 (student / parent / teacher / admin)
src/lib/curriculum/  학년별 교과 데이터 + 과목별 문항 생성기
src/lib/daily-set-generator.ts   학년/학기별 일일 학습 세트 생성 로직
src/components/      공용 컴포넌트
functions/           Cloudflare Pages Functions (/api/*)
android/             Android WebView 앱 래퍼
wrangler/schema.sql  D1 스키마
scripts/             버전 동기화 · 검증 · 릴리스 스크립트
```
