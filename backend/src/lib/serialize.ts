import type { Exercise, Language, Lesson, Unit } from '../../../shared/types.js';

export interface ExerciseRow {
  id: number;
  lesson_id: number;
  order_index: number;
  type: string;
  question: string;
  question_audio: string | null;
  question_image: string | null;
  correct_answer: string;
  options: string | null;
  hints: string | null;
  explanation: string | null;
  xp_value: number;
  difficulty: number;
  code: string | null;
  pairs: string | null;
  audio_lang: string | null;
}

function parseJson<T>(s: string | null): T | null {
  if (s == null) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export function serializeExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    lesson_id: row.lesson_id,
    order_index: row.order_index,
    type: row.type as Exercise['type'],
    question: row.question,
    question_audio: row.question_audio,
    question_image: row.question_image,
    correct_answer: row.correct_answer,
    options: parseJson<string[]>(row.options),
    hints: parseJson<string[]>(row.hints),
    explanation: row.explanation,
    xp_value: row.xp_value,
    difficulty: row.difficulty,
    code: row.code,
    pairs: parseJson<Exercise['pairs']>(row.pairs),
    audio_lang: row.audio_lang,
  };
}

export function serializeLanguage(row: any): Language {
  return row as Language;
}

export function serializeUnit(row: any): Unit {
  return row as Unit;
}

export function serializeLesson(row: any): Lesson {
  return { ...row, is_bonus: !!row.is_bonus } as Lesson;
}
