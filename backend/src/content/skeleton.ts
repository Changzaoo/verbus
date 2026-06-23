import type { CourseLevel, LanguageCode, LessonType } from '../../../shared/types.js';

export interface LangMeta {
  code: LanguageCode;
  name: string;
  native_name: string;
  flag_emoji: string; // mantido por compatibilidade; a UI usa bandeira SVG pelo código
  color_primary: string;
  color_secondary: string;
  description: string;
  audio_lang: string; // BCP-47 para Web Speech API
}

/** Principais idiomas do mundo para aprender (a partir do português). */
export const LANGUAGE_META: LangMeta[] = [
  { code: 'en', name: 'Inglês', native_name: 'English', flag_emoji: 'EN', color_primary: '#1CB0F6', color_secondary: '#0A7FBF', description: 'O idioma mais falado no mundo dos negócios, viagens e internet.', audio_lang: 'en-US' },
  { code: 'es', name: 'Espanhol', native_name: 'Español', flag_emoji: 'ES', color_primary: '#FF9600', color_secondary: '#CC6F00', description: 'Mais de 500 milhões de falantes — e muito fácil para brasileiros.', audio_lang: 'es-ES' },
  { code: 'fr', name: 'Francês', native_name: 'Français', flag_emoji: 'FR', color_primary: '#2B70C9', color_secondary: '#1B4C8C', description: 'A língua do amor, da culinária e da diplomacia.', audio_lang: 'fr-FR' },
  { code: 'de', name: 'Alemão', native_name: 'Deutsch', flag_emoji: 'DE', color_primary: '#3C3C3C', color_secondary: '#1C1C1C', description: 'Forte na Europa, na engenharia e nas ciências.', audio_lang: 'de-DE' },
  { code: 'it', name: 'Italiano', native_name: 'Italiano', flag_emoji: 'IT', color_primary: '#58CC02', color_secondary: '#46A302', description: 'Arte, música, moda e a melhor comida do mundo.', audio_lang: 'it-IT' },
  { code: 'zh', name: 'Mandarim', native_name: '中文', flag_emoji: 'ZH', color_primary: '#FF4B4B', color_secondary: '#C81E1E', description: 'O idioma mais falado do planeta, com pinyin para ajudar.', audio_lang: 'zh-CN' },
  { code: 'ja', name: 'Japonês', native_name: '日本語', flag_emoji: 'JA', color_primary: '#CE82FF', color_secondary: '#9B4DCC', description: 'Animes, jogos, tecnologia e uma cultura fascinante.', audio_lang: 'ja-JP' },
  { code: 'ko', name: 'Coreano', native_name: '한국어', flag_emoji: 'KO', color_primary: '#00C4FF', color_secondary: '#0090BF', description: 'K-pop, K-dramas e uma das escritas mais lógicas que existem.', audio_lang: 'ko-KR' },
  { code: 'ru', name: 'Russo', native_name: 'Русский', flag_emoji: 'RU', color_primary: '#E0115F', color_secondary: '#A60D46', description: 'A maior língua eslava, da literatura à ciência.', audio_lang: 'ru-RU' },
  { code: 'ar', name: 'Árabe', native_name: 'العربية', flag_emoji: 'AR', color_primary: '#50C878', color_secondary: '#3A9459', description: 'Falado em mais de 20 países, com uma escrita linda.', audio_lang: 'ar-SA' },
  { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', flag_emoji: 'HI', color_primary: '#FF7A00', color_secondary: '#CC6200', description: 'Um dos idiomas mais falados da Índia e do mundo.', audio_lang: 'hi-IN' },
  { code: 'nl', name: 'Holandês', native_name: 'Nederlands', flag_emoji: 'NL', color_primary: '#FF6B00', color_secondary: '#CC5500', description: 'A ponte entre o inglês e o alemão.', audio_lang: 'nl-NL' },
  { code: 'tr', name: 'Turco', native_name: 'Türkçe', flag_emoji: 'TR', color_primary: '#E30A17', color_secondary: '#B00812', description: 'A língua que une a Europa e a Ásia.', audio_lang: 'tr-TR' },
  { code: 'pl', name: 'Polonês', native_name: 'Polski', flag_emoji: 'PL', color_primary: '#DC143C', color_secondary: '#A60F2D', description: 'Uma das línguas eslavas mais faladas da Europa.', audio_lang: 'pl-PL' },
  { code: 'sv', name: 'Sueco', native_name: 'Svenska', flag_emoji: 'SV', color_primary: '#006AA7', color_secondary: '#004D78', description: 'A porta de entrada para as línguas escandinavas.', audio_lang: 'sv-SE' },
  { code: 'el', name: 'Grego', native_name: 'Ελληνικά', flag_emoji: 'EL', color_primary: '#0D5EAF', color_secondary: '#09427C', description: 'O berço da filosofia e da democracia ocidental.', audio_lang: 'el-GR' },
];

export type Theme =
  | 'greetings'
  | 'numbers_colors'
  | 'family'
  | 'food'
  | 'animals_nature'
  | 'home_daily'
  | 'travel'
  | 'conversation'
  | 'verbs_actions'
  | 'body_health'
  | 'work_school'
  | 'time_weather';

export interface LessonSkeleton {
  title: string;
  type: LessonType;
}

export interface UnitSkeleton {
  title: string;
  description: string;
  level: CourseLevel;
  color: string;
  icon: string; // nome de ícone lucide
  required_xp: number;
  theme: Theme;
  lessons: LessonSkeleton[];
}

/**
 * Trilha de lições compartilhada por todas as unidades (estilo Duolingo).
 * Cada lição introduz/pratica um recorte progressivo do vocabulário e das frases
 * do tema. O gerador decide os tipos de exercício a partir do índice da lição.
 */
const LESSON_TRACK: LessonSkeleton[] = [
  { title: 'Palavras novas', type: 'vocabulary' },
  { title: 'Mais palavras', type: 'vocabulary' },
  { title: 'Treino rápido', type: 'vocabulary' },
  { title: 'Primeiras frases', type: 'conversation' },
  { title: 'Monte as frases', type: 'conversation' },
  { title: 'Hora de escutar', type: 'listening' },
  { title: 'Pratique falando', type: 'conversation' },
  { title: 'Revisão da unidade', type: 'vocabulary' },
];

interface UnitMeta {
  title: string;
  description: string;
  level: CourseLevel;
  color: string;
  icon: string;
  required_xp: number;
  theme: Theme;
}

/**
 * Currículo geral (público geral): 12 unidades temáticas × 8 lições progressivas.
 * O TOM do conteúdo varia por faixa etária (child/teen/adult); a estrutura é a mesma.
 */
const UNIT_META: UnitMeta[] = [
  { title: 'Primeiras Palavras', description: 'Cumprimentos e cortesia para começar a falar.', level: 'beginner', color: '#58CC02', icon: 'Hand', required_xp: 0, theme: 'greetings' },
  { title: 'Números e Cores', description: 'Conte e descreva o mundo ao seu redor.', level: 'beginner', color: '#1CB0F6', icon: 'Hash', required_xp: 100, theme: 'numbers_colors' },
  { title: 'Família e Pessoas', description: 'Fale sobre quem você ama.', level: 'basic', color: '#CE82FF', icon: 'Users', required_xp: 240, theme: 'family' },
  { title: 'Comida e Bebida', description: 'Peça e descreva suas comidas favoritas.', level: 'basic', color: '#FF9600', icon: 'Utensils', required_xp: 420, theme: 'food' },
  { title: 'Animais e Natureza', description: 'Do bichinho de estimação à floresta.', level: 'intermediate', color: '#50C878', icon: 'Leaf', required_xp: 640, theme: 'animals_nature' },
  { title: 'Casa e Cotidiano', description: 'O vocabulário do seu dia a dia.', level: 'intermediate', color: '#FF4B4B', icon: 'Home', required_xp: 900, theme: 'home_daily' },
  { title: 'Verbos e Ações', description: 'Os verbos essenciais para formar frases.', level: 'intermediate', color: '#FFC800', icon: 'Zap', required_xp: 1200, theme: 'verbs_actions' },
  { title: 'Corpo e Saúde', description: 'Fale sobre o corpo e como você se sente.', level: 'advanced', color: '#FF6B9D', icon: 'HeartPulse', required_xp: 1540, theme: 'body_health' },
  { title: 'Trabalho e Escola', description: 'O vocabulário dos estudos e do trabalho.', level: 'advanced', color: '#00C4FF', icon: 'GraduationCap', required_xp: 1920, theme: 'work_school' },
  { title: 'Tempo e Clima', description: 'Dias, horas e como está o tempo lá fora.', level: 'advanced', color: '#A78BFA', icon: 'CloudSun', required_xp: 2340, theme: 'time_weather' },
  { title: 'Viagem e Lugares', description: 'Vire um viajante de verdade.', level: 'fluent', color: '#2EC4B6', icon: 'Plane', required_xp: 2800, theme: 'travel' },
  { title: 'Conversação', description: 'Junte tudo e converse com fluência.', level: 'fluent', color: '#F4A261', icon: 'MessageCircle', required_xp: 3300, theme: 'conversation' },
];

export const UNIT_SKELETON: UnitSkeleton[] = UNIT_META.map((u) => ({
  ...u,
  lessons: LESSON_TRACK,
}));

/** XP por lição cresce com o nível da unidade. */
export const LEVEL_XP: Record<CourseLevel, number> = {
  beginner: 10,
  basic: 15,
  intermediate: 20,
  advanced: 25,
  fluent: 30,
};
