-- ============================================================================
-- Verbus — Schema do banco de dados SQLite
-- ============================================================================
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- USUARIOS -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  avatar_id INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- PERFIL DE PROGRESSO --------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  xp_total INTEGER DEFAULT 0,
  xp_today INTEGER DEFAULT 0,
  xp_week INTEGER DEFAULT 0,
  gems INTEGER DEFAULT 500,
  hearts INTEGER DEFAULT 5,
  hearts_last_refill DATETIME DEFAULT CURRENT_TIMESTAMP,
  streak_current INTEGER DEFAULT 0,
  streak_longest INTEGER DEFAULT 0,
  streak_last_date DATE,
  streak_freeze_count INTEGER DEFAULT 0,
  league TEXT DEFAULT 'bronze',
  league_xp_week INTEGER DEFAULT 0,
  daily_goal_xp INTEGER DEFAULT 50,
  daily_goal_met INTEGER DEFAULT 0,
  notifications_enabled INTEGER DEFAULT 1,
  sound_enabled INTEGER DEFAULT 1,
  theme TEXT DEFAULT 'light',
  xp_today_date DATE,
  xp_week_start DATE,
  infinite_hearts_until DATETIME,
  age_group TEXT DEFAULT 'adult'
);

-- IDIOMAS DISPONÍVEIS --------------------------------------------------------
CREATE TABLE IF NOT EXISTS languages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  flag_emoji TEXT NOT NULL,
  color_primary TEXT NOT NULL,
  color_secondary TEXT NOT NULL,
  description TEXT,
  total_units INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  total_xp_available INTEGER DEFAULT 0
);

-- UNIDADES -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  required_xp INTEGER DEFAULT 0
);

-- LIÇÕES ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 10,
  gem_reward INTEGER DEFAULT 0,
  estimated_minutes INTEGER DEFAULT 5,
  exercise_count INTEGER DEFAULT 10,
  is_bonus INTEGER DEFAULT 0
);

-- EXERCÍCIOS -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  type TEXT NOT NULL,
  question TEXT NOT NULL,
  question_audio TEXT,
  question_image TEXT,
  correct_answer TEXT NOT NULL,
  options TEXT,          -- JSON array
  hints TEXT,            -- JSON array
  explanation TEXT,
  xp_value INTEGER DEFAULT 1,
  difficulty INTEGER DEFAULT 1,
  code TEXT,             -- bloco de código (code_bilingual)
  pairs TEXT,            -- JSON array de {left,right} (match_pairs)
  audio_lang TEXT,       -- BCP-47 para TTS (ex: 'ja-JP')
  age_group TEXT DEFAULT 'all'  -- 'child' | 'teen' | 'adult' | 'all'
);

-- PROGRESSO DO USUÁRIO NAS LIÇÕES --------------------------------------------
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  completed INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  mistakes_count INTEGER DEFAULT 0,
  time_seconds INTEGER DEFAULT 0,
  completed_at DATETIME,
  UNIQUE(user_id, lesson_id)
);

-- VOCABULÁRIO DO USUÁRIO (SRS) -----------------------------------------------
CREATE TABLE IF NOT EXISTS user_vocabulary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
  repetitions INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  next_review DATE DEFAULT CURRENT_DATE,
  last_reviewed DATETIME,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  UNIQUE(user_id, exercise_id)
);

-- CONQUISTAS -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL,
  language_id INTEGER,
  gem_reward INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 0,
  is_hidden INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, achievement_id)
);

-- HISTÓRICO DE XP ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS xp_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id INTEGER,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- LIGAS SEMANAIS -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weekly_leagues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS league_participants (
  league_id INTEGER REFERENCES weekly_leagues(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  league_tier TEXT NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  final_rank INTEGER,
  promoted INTEGER,
  PRIMARY KEY(league_id, user_id)
);

-- DESAFIO DIÁRIO -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE UNIQUE NOT NULL,
  language_id INTEGER REFERENCES languages(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 30,
  gem_reward INTEGER DEFAULT 15
);

CREATE TABLE IF NOT EXISTS user_daily_challenges (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INTEGER REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed INTEGER DEFAULT 0,
  completed_at DATETIME,
  PRIMARY KEY(user_id, challenge_id)
);

-- LOJA -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shop_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  type TEXT NOT NULL,
  gem_cost INTEGER NOT NULL,
  is_available INTEGER DEFAULT 1,
  avatar_id INTEGER
);

CREATE TABLE IF NOT EXISTS user_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES shop_items(id),
  purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  used_at DATETIME
);

-- AMIZADES (ranking de amigos) -----------------------------------------------
CREATE TABLE IF NOT EXISTS friendships (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, friend_id)
);

-- ÍNDICES --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_units_lang ON units(language_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_unit ON lessons(unit_id, order_index);
CREATE INDEX IF NOT EXISTS idx_exercises_lesson ON exercises(lesson_id, order_index);
CREATE INDEX IF NOT EXISTS idx_ulp_user ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_vocab_due ON user_vocabulary(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_xp_user ON xp_history(user_id, earned_at);
