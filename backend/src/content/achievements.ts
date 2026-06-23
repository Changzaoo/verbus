import type { AchievementCategory } from '../../../shared/types.js';

export interface AchievementSeed {
  code: string;
  name: string;
  description: string;
  icon: string; // nome de ícone lucide-react
  category: AchievementCategory;
  condition_type: string;
  condition_value: number;
  gem_reward: number;
  xp_reward: number;
  is_hidden?: boolean;
}

export const ACHIEVEMENTS: AchievementSeed[] = [
  // STREAK
  { code: 'streak_3', name: 'Aquecendo', description: '3 dias seguidos', icon: 'Flame', category: 'streak', condition_type: 'streak_days', condition_value: 3, gem_reward: 20, xp_reward: 10 },
  { code: 'streak_7', name: 'Semana Perfeita', description: '7 dias seguidos', icon: 'Flame', category: 'streak', condition_type: 'streak_days', condition_value: 7, gem_reward: 40, xp_reward: 20 },
  { code: 'streak_30', name: 'Mês de Dedicação', description: '30 dias seguidos', icon: 'Dumbbell', category: 'streak', condition_type: 'streak_days', condition_value: 30, gem_reward: 100, xp_reward: 50 },
  { code: 'streak_100', name: 'Centenário', description: '100 dias seguidos', icon: 'Award', category: 'streak', condition_type: 'streak_days', condition_value: 100, gem_reward: 300, xp_reward: 150 },
  { code: 'streak_365', name: 'Lendário', description: '365 dias seguidos', icon: 'Trophy', category: 'streak', condition_type: 'streak_days', condition_value: 365, gem_reward: 1000, xp_reward: 500 },

  // XP
  { code: 'xp_100', name: 'Primeiros Passos', description: '100 XP total', icon: 'Star', category: 'xp', condition_type: 'total_xp', condition_value: 100, gem_reward: 10, xp_reward: 0 },
  { code: 'xp_1000', name: 'Aprendiz', description: '1.000 XP total', icon: 'Sparkles', category: 'xp', condition_type: 'total_xp', condition_value: 1000, gem_reward: 50, xp_reward: 0 },
  { code: 'xp_10000', name: 'Expert', description: '10.000 XP total', icon: 'Sparkles', category: 'xp', condition_type: 'total_xp', condition_value: 10000, gem_reward: 200, xp_reward: 0 },
  { code: 'xp_50000', name: 'Mestre', description: '50.000 XP total', icon: 'Target', category: 'xp', condition_type: 'total_xp', condition_value: 50000, gem_reward: 500, xp_reward: 0 },

  // LIÇÕES
  { code: 'lessons_1', name: 'Começou!', description: 'Complete 1 lição', icon: 'PartyPopper', category: 'lessons', condition_type: 'lessons_done', condition_value: 1, gem_reward: 5, xp_reward: 0 },
  { code: 'lessons_10', name: 'Em Ritmo', description: '10 lições completas', icon: 'BookOpen', category: 'lessons', condition_type: 'lessons_done', condition_value: 10, gem_reward: 20, xp_reward: 0 },
  { code: 'lessons_50', name: 'Estudioso', description: '50 lições completas', icon: 'BookMarked', category: 'lessons', condition_type: 'lessons_done', condition_value: 50, gem_reward: 80, xp_reward: 0 },
  { code: 'lessons_100', name: 'Centurião', description: '100 lições', icon: 'GraduationCap', category: 'lessons', condition_type: 'lessons_done', condition_value: 100, gem_reward: 150, xp_reward: 0 },

  // PERFEIÇÃO
  { code: 'perfect_5', name: 'Sem Errar', description: '5 lições perfeitas', icon: 'Sparkles', category: 'perfect', condition_type: 'perfect_lessons', condition_value: 5, gem_reward: 30, xp_reward: 0 },
  { code: 'perfect_20', name: 'Impecável', description: '20 lições perfeitas', icon: 'Medal', category: 'perfect', condition_type: 'perfect_lessons', condition_value: 20, gem_reward: 120, xp_reward: 0 },

  // IDIOMAS
  { code: 'lang_2', name: 'Bilíngue', description: 'Inicie 2 idiomas', icon: 'Globe', category: 'language', condition_type: 'languages_started', condition_value: 2, gem_reward: 30, xp_reward: 0 },
  { code: 'lang_3', name: 'Poliglota', description: 'Inicie 3 idiomas', icon: 'Globe2', category: 'language', condition_type: 'languages_started', condition_value: 3, gem_reward: 60, xp_reward: 0 },
  { code: 'lang_5', name: 'Hiperglota', description: 'Todos os 5 idiomas', icon: 'Languages', category: 'language', condition_type: 'languages_started', condition_value: 5, gem_reward: 200, xp_reward: 0 },

  // ESPECIAIS DEV
  { code: 'first_code', name: 'Hello World', description: 'Complete lição de código bilíngue', icon: 'Code2', category: 'lessons', condition_type: 'code_lessons', condition_value: 1, gem_reward: 15, xp_reward: 0 },
  { code: 'code_10', name: 'Code Polyglot', description: '10 lições de código', icon: 'Laptop', category: 'lessons', condition_type: 'code_lessons', condition_value: 10, gem_reward: 80, xp_reward: 0 },
  { code: 'daily_7', name: 'Desafio Semanal', description: '7 desafios diários', icon: 'Zap', category: 'xp', condition_type: 'daily_challenges', condition_value: 7, gem_reward: 50, xp_reward: 0 },
  { code: 'night_owl', name: 'Coruja Noturna', description: 'Estude depois da meia-noite', icon: 'Moon', category: 'xp', condition_type: 'night_study', condition_value: 1, gem_reward: 15, xp_reward: 0, is_hidden: true },
  { code: 'early_bird', name: 'Madrugador', description: 'Estude antes das 7h', icon: 'Sunrise', category: 'xp', condition_type: 'morning_study', condition_value: 1, gem_reward: 15, xp_reward: 0, is_hidden: true },
  { code: 'speed_run', name: 'Speed Run', description: 'Complete lição em menos de 2 min', icon: 'Gauge', category: 'perfect', condition_type: 'fast_lesson', condition_value: 1, gem_reward: 20, xp_reward: 0, is_hidden: true },
  { code: 'vocab_100', name: 'Vocabularista', description: '100 palavras no SRS', icon: 'NotebookPen', category: 'lessons', condition_type: 'vocab_learned', condition_value: 100, gem_reward: 60, xp_reward: 0 },
  { code: 'gems_1000', name: 'Rico em Gems', description: 'Acumule 1000 gems', icon: 'Gem', category: 'xp', condition_type: 'gems_total', condition_value: 1000, gem_reward: 0, xp_reward: 50 },
  { code: 'combo_master', name: 'Combo Mestre', description: 'Acerte 10 seguidas numa lição', icon: 'Flame', category: 'perfect', condition_type: 'best_combo', condition_value: 10, gem_reward: 40, xp_reward: 0 },

  // COMPETITIVO (ranking)
  { code: 'rank_top10', name: 'Top 10', description: 'Fique entre os 10 melhores do ranking global', icon: 'TrendingUp', category: 'social', condition_type: 'best_rank_top', condition_value: 10, gem_reward: 100, xp_reward: 0 },
  { code: 'rank_1', name: 'Nº 1 do Mundo', description: 'Alcance o topo do ranking global', icon: 'Crown', category: 'social', condition_type: 'best_rank_top', condition_value: 1, gem_reward: 500, xp_reward: 0 },
];
