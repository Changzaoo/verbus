import type {
  AgeGroup,
  CourseLevel,
  ExerciseType,
  LanguageCode,
  LessonType,
  MatchPair,
} from '../../../shared/types.js';

export interface ExerciseSeed {
  type: ExerciseType;
  question: string;
  correct_answer: string;
  options?: string[];
  hints?: string[];
  explanation?: string;
  code?: string;
  pairs?: MatchPair[];
  audio_lang?: string;
  question_audio?: string;
  question_image?: string;
  difficulty?: number;
  age_group?: AgeGroup | 'all';
}

export interface LessonSeed {
  title: string;
  description?: string;
  type: LessonType;
  xp_reward: number;
  gem_reward: number;
  estimated_minutes: number;
  is_bonus?: boolean;
  exercises: ExerciseSeed[];
}

export interface UnitSeed {
  title: string;
  description?: string;
  level: CourseLevel;
  color: string;
  icon: string;
  required_xp: number;
  lessons: LessonSeed[];
}

export interface LanguageSeed {
  code: LanguageCode;
  name: string;
  native_name: string;
  flag_emoji: string;
  color_primary: string;
  color_secondary: string;
  description: string;
  units: UnitSeed[];
}

/** Estrutura do arquivo JSON produzido por idioma (content/data/<code>.json). */
export interface LanguageContentFile {
  code: LanguageCode;
  /** audio_lang BCP-47 padrão do idioma (ex.: 'ja-JP'). */
  audio_lang: string;
  lessons: {
    unit: number; // 1-based
    lesson: number; // 1-based
    exercises: ExerciseSeed[];
  }[];
}
