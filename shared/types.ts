// ============================================================================
// DevLingo — Tipos compartilhados entre frontend e backend
// Fonte da verdade para todos os contratos de dados e API.
// ============================================================================

// ----------------------------------------------------------------------------
// Domínio: usuário e perfil
// ----------------------------------------------------------------------------
export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  avatar_id: number;
  created_at: string;
  last_active: string;
}

export type LeagueTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'sapphire'
  | 'ruby'
  | 'emerald'
  | 'amethyst'
  | 'pearl'
  | 'obsidian'
  | 'diamond';

export type Theme = 'light' | 'dark' | 'terminal';

/** Faixa etária — define o TOM do curso (não há conteúdo explícito; só o tom). */
export type AgeGroup = 'child' | 'teen' | 'adult';

export const AGE_GROUPS: { value: AgeGroup; label: string; hint: string }[] = [
  { value: 'child', label: 'Criança', hint: 'Tom fofo e divertido, com historinhas' },
  { value: 'teen', label: 'Adolescente', hint: 'Tom descontraído, do dia a dia' },
  { value: 'adult', label: 'Adulto', hint: 'Tom sério e direto ao ponto' },
];

export interface UserProfile {
  user_id: number;
  xp_total: number;
  xp_today: number;
  xp_week: number;
  gems: number;
  hearts: number;
  hearts_last_refill: string;
  streak_current: number;
  streak_longest: number;
  streak_last_date: string | null;
  streak_freeze_count: number;
  league: LeagueTier;
  league_xp_week: number;
  daily_goal_xp: number;
  daily_goal_met: boolean;
  notifications_enabled: boolean;
  sound_enabled: boolean;
  theme: Theme;
  age_group: AgeGroup;
}

// ----------------------------------------------------------------------------
// Domínio: idiomas, unidades, lições, exercícios
// ----------------------------------------------------------------------------
export type LanguageCode =
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'zh' | 'ja' | 'ko'
  | 'ru' | 'ar' | 'hi' | 'nl' | 'tr' | 'pl' | 'sv' | 'el';

export interface Language {
  id: number;
  code: LanguageCode;
  name: string;
  native_name: string;
  flag_emoji: string;
  color_primary: string;
  color_secondary: string;
  description: string | null;
  total_units: number;
  total_lessons: number;
  total_xp_available: number;
}

export type CourseLevel =
  | 'beginner'
  | 'basic'
  | 'intermediate'
  | 'advanced'
  | 'fluent';

export interface Unit {
  id: number;
  language_id: number;
  order_index: number;
  title: string;
  description: string | null;
  level: CourseLevel;
  color: string;
  icon: string;
  required_xp: number;
}

export type LessonType =
  | 'vocabulary'
  | 'grammar'
  | 'conversation'
  | 'reading'
  | 'code'
  | 'listening';

export interface Lesson {
  id: number;
  unit_id: number;
  order_index: number;
  title: string;
  description: string | null;
  type: LessonType;
  xp_reward: number;
  gem_reward: number;
  estimated_minutes: number;
  exercise_count: number;
  is_bonus: boolean;
}

export type ExerciseType =
  | 'multiple_choice'
  | 'translation_to'
  | 'translation_from'
  | 'fill_blank'
  | 'drag_drop'
  | 'listen_type'
  | 'speak'
  | 'code_bilingual'
  | 'match_pairs';

export interface MatchPair {
  left: string;
  right: string;
}

export interface Exercise {
  id: number;
  lesson_id: number;
  order_index: number;
  type: ExerciseType;
  question: string;
  question_audio: string | null;
  question_image: string | null;
  /** Resposta correta. Para match_pairs/drag_drop é um JSON string já parseado em `answer`. */
  correct_answer: string;
  /** Para múltipla escolha / drag_drop: array de opções. */
  options: string[] | null;
  /** Dicas. */
  hints: string[] | null;
  explanation: string | null;
  xp_value: number;
  difficulty: number;
  /** Bloco de código para exercícios code_bilingual. */
  code: string | null;
  /** Pares para match_pairs. */
  pairs: MatchPair[] | null;
  /** Idioma de áudio (TTS) para listen/speak — código BCP-47, ex: 'ja-JP'. */
  audio_lang: string | null;
}

// ----------------------------------------------------------------------------
// Progresso
// ----------------------------------------------------------------------------
export interface UserLessonProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  completed: boolean;
  stars: number;
  xp_earned: number;
  mistakes_count: number;
  time_seconds: number;
  completed_at: string | null;
}

export type LessonNodeStatus = 'locked' | 'available' | 'completed' | 'active';

/** Lição enriquecida com progresso para a trilha. */
export interface LessonNode extends Lesson {
  status: LessonNodeStatus;
  stars: number;
}

/** Unidade enriquecida com lições + progresso para a trilha. */
export interface UnitWithProgress extends Unit {
  lessons: LessonNode[];
  unlocked: boolean;
  completed_lessons: number;
}

export interface CoursePath {
  language: Language;
  units: UnitWithProgress[];
  user_xp_in_course: number;
  active_lesson_id: number | null;
}

// ----------------------------------------------------------------------------
// Vocabulário / SRS
// ----------------------------------------------------------------------------
export interface UserVocabulary {
  id: number;
  user_id: number;
  exercise_id: number;
  repetitions: number;
  ease_factor: number;
  interval_days: number;
  next_review: string;
  last_reviewed: string | null;
  correct_count: number;
  wrong_count: number;
}

export interface VocabularyStats {
  total: number;
  due_today: number;
  mastered: number;
  learning: number;
}

// ----------------------------------------------------------------------------
// Conquistas
// ----------------------------------------------------------------------------
export type AchievementCategory =
  | 'streak'
  | 'xp'
  | 'lessons'
  | 'perfect'
  | 'social'
  | 'language';

export interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  condition_type: string;
  condition_value: number;
  language_id: number | null;
  gem_reward: number;
  xp_reward: number;
  is_hidden: boolean;
}

export interface AchievementWithStatus extends Achievement {
  earned: boolean;
  earned_at: string | null;
  progress: number; // 0..1
}

// ----------------------------------------------------------------------------
// XP
// ----------------------------------------------------------------------------
export type XpSource =
  | 'lesson'
  | 'daily_challenge'
  | 'streak_bonus'
  | 'achievement'
  | 'practice';

export interface XpHistoryEntry {
  id: number;
  user_id: number;
  amount: number;
  source: XpSource;
  source_id: number | null;
  earned_at: string;
}

export interface XpStats {
  total: number;
  today: number;
  week: number;
  month: number;
  daily_goal: number;
  daily_goal_met: boolean;
}

// ----------------------------------------------------------------------------
// Ligas / Leaderboard
// ----------------------------------------------------------------------------
export interface LeaderboardEntry {
  user_id: number;
  username: string;
  display_name: string | null;
  avatar_id: number;
  xp: number;
  rank: number;
  league: LeagueTier;
  is_current_user: boolean;
}

export type RankPeriod = 'all' | 'week';

export interface RankContext {
  rank: number;
  total: number;
  xp: number;
  to_next: number;
  next_user: string | null;
  period: RankPeriod;
}

export interface LeagueInfo {
  tier: LeagueTier;
  name: string;
  icon: string;
  color: string;
  promote_top: number;
  demote_bottom: number;
}

export interface CurrentLeague {
  league: LeagueInfo;
  participants: LeaderboardEntry[];
  user_rank: number;
  promotion_zone: number;
  demotion_zone: number;
  ends_in_seconds: number;
}

// ----------------------------------------------------------------------------
// Loja
// ----------------------------------------------------------------------------
export type ShopItemType =
  | 'streak_freeze'
  | 'heart_refill'
  | 'xp_boost'
  | 'avatar'
  | 'theme';

export interface ShopItem {
  id: number;
  name: string;
  description: string;
  icon: string;
  type: ShopItemType;
  gem_cost: number;
  is_available: boolean;
  avatar_id: number | null;
}

export interface UserPurchase {
  id: number;
  user_id: number;
  item_id: number;
  purchased_at: string;
  used_at: string | null;
}

// ----------------------------------------------------------------------------
// Desafio diário
// ----------------------------------------------------------------------------
export interface DailyChallenge {
  id: number;
  date: string;
  language_id: number;
  type: string;
  title: string;
  description: string | null;
  xp_reward: number;
  gem_reward: number;
  completed: boolean;
}

// ----------------------------------------------------------------------------
// Contratos de requisição/resposta da API
// ----------------------------------------------------------------------------
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  display_name?: string;
  daily_goal_xp?: number;
  first_language?: LanguageCode;
  age_group?: AgeGroup;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  profile: UserProfile;
}

export interface CompleteLessonRequest {
  stars: number;
  xp_earned: number;
  mistakes: number;
  time_seconds: number;
  max_combo?: number;
}

export interface CompleteLessonResponse {
  profile: UserProfile;
  xp_gained: number;
  bonus_xp: number;
  gems_gained: number;
  leveled_streak: boolean;
  new_achievements: Achievement[];
  daily_goal_met: boolean;
}

export interface AddXpRequest {
  amount: number;
  source: XpSource;
  source_id?: number;
}

export interface VocabularyAnswerRequest {
  exercise_id: number;
  correct: boolean;
}

export interface BuyItemRequest {
  item_id: number;
}

export interface UpdateSettingsRequest {
  theme?: Theme;
  sound_enabled?: boolean;
  notifications_enabled?: boolean;
  daily_goal_xp?: number;
  age_group?: AgeGroup;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// ----------------------------------------------------------------------------
// Constantes de gamificação (compartilhadas)
// ----------------------------------------------------------------------------
export const XP_SYSTEM = {
  base_lesson: 10,
  perfect_lesson: 20,
  streak_multiplier: { 7: 1.2, 30: 1.5, 100: 2.0 } as Record<number, number>,
  first_time_bonus: 5,
  daily_goal_bonus: 10,
  daily_challenge: 30,
  achievement_earned: 5,
} as const;

export const DAILY_GOALS = [10, 20, 30, 50] as const;

export const HEARTS_SYSTEM = {
  max: 5,
  lost_per_mistake: 1,
  refill_interval_hours: 5,
  refill_with_gems: 350,
  infinite_hearts_daily_gems: 650,
} as const;

export const LEAGUES: LeagueInfo[] = [
  { tier: 'bronze', name: 'Bronze', icon: '🥉', color: '#CD7F32', promote_top: 5, demote_bottom: 0 },
  { tier: 'silver', name: 'Prata', icon: '🥈', color: '#C0C0C0', promote_top: 5, demote_bottom: 5 },
  { tier: 'gold', name: 'Ouro', icon: '🥇', color: '#FFD700', promote_top: 5, demote_bottom: 5 },
  { tier: 'sapphire', name: 'Safira', icon: '💎', color: '#0F52BA', promote_top: 5, demote_bottom: 5 },
  { tier: 'ruby', name: 'Rubi', icon: '❤️‍🔥', color: '#E0115F', promote_top: 5, demote_bottom: 5 },
  { tier: 'emerald', name: 'Esmeralda', icon: '💚', color: '#50C878', promote_top: 5, demote_bottom: 5 },
  { tier: 'amethyst', name: 'Ametista', icon: '💜', color: '#9966CC', promote_top: 5, demote_bottom: 5 },
  { tier: 'pearl', name: 'Pérola', icon: '🤍', color: '#FDEBD0', promote_top: 5, demote_bottom: 5 },
  { tier: 'obsidian', name: 'Obsidiana', icon: '🖤', color: '#1C1C1E', promote_top: 5, demote_bottom: 5 },
  { tier: 'diamond', name: 'Diamante', icon: '💫', color: '#B9F2FF', promote_top: 0, demote_bottom: 5 },
];

export const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: 'Iniciante',
  basic: 'Básico',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  fluent: 'Fluente',
};
