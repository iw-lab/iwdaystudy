-- 아라하루 D1 SQLite 스키마

-- 사용자 프로필
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student','teacher','parent','admin')),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  grade INTEGER CHECK(grade BETWEEN 1 AND 6),
  semester INTEGER CHECK(semester IN (1, 2)),
  school_name TEXT,
  class_name TEXT,
  student_number INTEGER,
  parent_id TEXT REFERENCES profiles(id),
  teacher_id TEXT REFERENCES profiles(id),
  subscription_plan TEXT DEFAULT 'free',
  subscription_expires_at TEXT,
  streak_count INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  approval_status TEXT DEFAULT 'approved' CHECK(approval_status IN ('pending','approved','rejected')),
  password_hash TEXT NOT NULL DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 학급
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  grade INTEGER NOT NULL CHECK(grade BETWEEN 1 AND 6),
  semester INTEGER NOT NULL CHECK(semester IN (1, 2)),
  school_name TEXT,
  year INTEGER NOT NULL DEFAULT (strftime('%Y','now')),
  invite_code TEXT UNIQUE NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 학급 멤버
CREATE TABLE IF NOT EXISTS class_members (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TEXT DEFAULT (datetime('now')),
  UNIQUE(class_id, student_id)
);

-- 교육과정 성취기준
CREATE TABLE IF NOT EXISTS curriculum_standards (
  id TEXT PRIMARY KEY,
  grade INTEGER NOT NULL CHECK(grade BETWEEN 1 AND 6),
  semester INTEGER NOT NULL CHECK(semester IN (1, 2)),
  subject TEXT NOT NULL,
  standard_code TEXT NOT NULL,
  description TEXT NOT NULL,
  unit_name TEXT,
  difficulty INTEGER DEFAULT 1 CHECK(difficulty BETWEEN 1 AND 3),
  week_start INTEGER,
  week_end INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 일일 학습 세트
CREATE TABLE IF NOT EXISTS daily_sets (
  id TEXT PRIMARY KEY,
  grade INTEGER NOT NULL CHECK(grade BETWEEN 1 AND 6),
  semester INTEGER NOT NULL CHECK(semester IN (1, 2)),
  set_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  estimated_minutes INTEGER DEFAULT 30,
  total_questions INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 100,
  is_published INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(grade, semester, set_number)
);

-- 문제
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  daily_set_id TEXT NOT NULL REFERENCES daily_sets(id) ON DELETE CASCADE,
  curriculum_standard_id TEXT REFERENCES curriculum_standards(id),
  subject TEXT NOT NULL,
  question_type TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  title TEXT,
  content TEXT NOT NULL, -- JSON string
  answer TEXT NOT NULL,  -- JSON string
  explanation TEXT,
  points INTEGER DEFAULT 10,
  hint TEXT,
  metadata TEXT, -- JSON string
  created_at TEXT DEFAULT (datetime('now'))
);

-- 학습 기록
CREATE TABLE IF NOT EXISTS learning_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES profiles(id),
  daily_set_id TEXT NOT NULL REFERENCES daily_sets(id),
  class_id TEXT REFERENCES classes(id),
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  total_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  time_spent_seconds INTEGER DEFAULT 0,
  is_completed INTEGER DEFAULT 0,
  emotion_before TEXT, -- JSON
  emotion_after TEXT,  -- JSON
  readiness TEXT,      -- JSON
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(student_id, daily_set_id)
);

-- 문제 응답
CREATE TABLE IF NOT EXISTS question_responses (
  id TEXT PRIMARY KEY,
  learning_record_id TEXT NOT NULL REFERENCES learning_records(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id),
  student_answer TEXT, -- JSON
  is_correct INTEGER,
  score INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 일일 배정
CREATE TABLE IF NOT EXISTS daily_assignments (
  id TEXT PRIMARY KEY,
  class_id TEXT REFERENCES classes(id),
  student_id TEXT REFERENCES profiles(id),
  daily_set_id TEXT NOT NULL REFERENCES daily_sets(id),
  assigned_date TEXT NOT NULL DEFAULT (date('now')),
  due_date TEXT,
  is_mandatory INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 뱃지
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER,
  rarity TEXT DEFAULT 'common' CHECK(rarity IN ('common','rare','epic','legendary')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- 학생 뱃지
CREATE TABLE IF NOT EXISTS student_badges (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES profiles(id),
  badge_id TEXT NOT NULL REFERENCES badges(id),
  earned_at TEXT DEFAULT (datetime('now')),
  UNIQUE(student_id, badge_id)
);

-- 구독
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id),
  plan TEXT NOT NULL,
  price INTEGER NOT NULL,
  payment_method TEXT,
  payment_id TEXT,
  starts_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  auto_renew INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_questions_daily_set ON questions(daily_set_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_learning_records_student ON learning_records(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_date ON learning_records(created_at);
-- 응답 → 학습기록 조인용. 없으면 제출마다 배지 검사(과목별 정답 수 COUNT JOIN)가
-- question_responses 전체를 풀스캔해 계정 공유 D1 일일 읽기 한도(500만)를 소진했다(2026-09-23).
CREATE INDEX IF NOT EXISTS idx_question_responses_record ON question_responses(learning_record_id);
CREATE INDEX IF NOT EXISTS idx_daily_sets_grade_semester ON daily_sets(grade, semester);
CREATE INDEX IF NOT EXISTS idx_daily_assignments_date ON daily_assignments(assigned_date);
CREATE INDEX IF NOT EXISTS idx_curriculum_grade ON curriculum_standards(grade, semester, subject);
CREATE INDEX IF NOT EXISTS idx_class_members_student ON class_members(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_teacher ON profiles(teacher_id);
CREATE INDEX IF NOT EXISTS idx_profiles_parent ON profiles(parent_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 뱃지 시드 데이터
INSERT OR IGNORE INTO badges (id, name, description, icon, condition_type, condition_value, rarity) VALUES
('b001', '첫 발걸음', '첫 학습을 완료했어요!', '🌱', 'first_complete', 1, 'common'),
('b002', '삼일 새싹', '3일 연속 학습!', '🌿', 'streak_3', 3, 'common'),
('b003', '일주일 나무', '7일 연속 학습!', '🌳', 'streak_7', 7, 'rare'),
('b004', '한 달 숲', '30일 연속 학습!', '🏔️', 'streak_30', 30, 'epic'),
('b005', '백일장', '100일 연속 학습!', '👑', 'streak_100', 100, 'legendary'),
('b006', '완벽한 하루', '일일 학습 만점!', '⭐', 'perfect_score', 1, 'rare'),
('b007', '수학 도사', '수학 10회 연속 정답!', '🔢', 'math_streak_10', 10, 'rare'),
('b008', '맞춤법 왕', '맞춤법 20회 연속 정답!', '📝', 'spelling_streak_20', 20, 'epic'),
('b009', '한자 박사', '한자 50개 마스터!', '📜', 'hanja_50', 50, 'epic'),
('b010', '영어 달인', '영어 30회 연속 정답!', '🌏', 'english_streak_30', 30, 'epic'),
('b011', '천 점 돌파', '누적 1,000점 달성!', '🎯', 'points_1000', 1000, 'common'),
('b012', '만 점 고수', '누적 10,000점 달성!', '🏆', 'points_10000', 10000, 'rare'),
('b013', '새벽 학습자', '오전 7시 이전 학습 완료!', '🌅', 'early_bird', 1, 'rare'),
('b014', '주말 전사', '주말에도 학습 완료!', '💪', 'weekend_learner', 1, 'common'),
('b015', '전 과목 마스터', '모든 과목 정답률 90% 이상!', '🎓', 'all_subject_90', 90, 'legendary');

-- Rate limiting (per IP + path)
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- Security audit log (sensitive actions only)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  ip TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- 무료 읽기 한도(계정 전체 D1 하루 500만 행) 색인 보강 — 2026-10-13
-- check-db-reads.mjs 가 잡은 색인 없는 WHERE/ORDER BY/DELETE(FK 캐스케이드 포함) 전체훑기.
-- 날짜 필터는 코드에서 date(...)/strftime(...) 로 감싸 쓰므로 표현식 색인으로 맞춘다.
CREATE INDEX IF NOT EXISTS idx_learning_records_completed ON learning_records(is_completed, completed_at);
CREATE INDEX IF NOT EXISTS idx_learning_records_created_date ON learning_records(date(created_at));
CREATE INDEX IF NOT EXISTS idx_learning_records_student_created ON learning_records(student_id, created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_starts_date ON subscriptions(date(starts_at));
CREATE INDEX IF NOT EXISTS idx_subscriptions_starts_ym ON subscriptions(strftime('%Y-%m', starts_at));
-- subscriptions.user_id → profiles(id) FK. profiles 삭제 시(teacher/students.ts DELETE) 캐스케이드 체크가 이걸 훑었다.
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
-- daily_assignments.student_id → profiles(id) FK, 같은 이유.
CREATE INDEX IF NOT EXISTS idx_daily_assignments_student ON daily_assignments(student_id);
-- classes.teacher_id → profiles(id) FK(같은 이유) + /api/classes 교사 본인 목록 조회 겸용.
CREATE INDEX IF NOT EXISTS idx_classes_teacher_created ON classes(teacher_id, created_at);
CREATE INDEX IF NOT EXISTS idx_classes_created ON classes(created_at);
CREATE INDEX IF NOT EXISTS idx_classes_active ON classes(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_role_approval ON profiles(role, approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_created ON profiles(role, created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_profiles_created ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_sets_published ON daily_sets(is_published);
CREATE INDEX IF NOT EXISTS idx_class_members_student_joined ON class_members(student_id, joined_at);
