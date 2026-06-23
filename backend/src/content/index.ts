import { LANGUAGE_META, UNIT_SKELETON, LEVEL_XP } from './skeleton.js';
import { loadBank } from './banks.js';
import { buildLessonExercises } from './generator.js';
import type { LanguageSeed, LessonSeed, UnitSeed, ExerciseSeed } from './types.js';

/**
 * Monta o currículo geral (público geral) para cada idioma, com exercícios
 * gerados por faixa etária (child/teen/adult) a partir do banco de vocabulário.
 */
export function buildLanguageSeeds(): LanguageSeed[] {
  return LANGUAGE_META.map((meta) => {
    const bank = loadBank(meta.code);

    const units: UnitSeed[] = UNIT_SKELETON.map((u, ui) => {
      const themeWords = bank?.words[u.theme] ?? [];
      const themeSentences = bank?.sentences[u.theme] ?? [];

      const lessons: LessonSeed[] = u.lessons.map((ls, li) => {
        const exercises: ExerciseSeed[] =
          themeWords.length >= 4
            ? buildLessonExercises(themeWords, themeSentences, meta.name, meta.audio_lang, ls.type, ui, li, u.theme)
            : [];

        // exercise_count é por faixa etária (o serviço filtra por idade).
        const perAge = exercises.filter((e) => e.age_group === 'adult').length || exercises.length;
        const isTest = li === u.lessons.length - 1;
        return {
          title: ls.title,
          description: undefined,
          type: ls.type,
          xp_reward: LEVEL_XP[u.level] + (isTest ? 10 : 0),
          gem_reward: isTest ? 15 : 0,
          estimated_minutes: Math.max(3, Math.round(perAge * 0.7)),
          is_bonus: false,
          exercises,
        };
      });

      return {
        title: u.title,
        description: u.description,
        level: u.level,
        color: u.color,
        icon: u.icon,
        required_xp: u.required_xp,
        lessons,
      };
    });

    return {
      code: meta.code,
      name: meta.name,
      native_name: meta.native_name,
      flag_emoji: meta.flag_emoji,
      color_primary: meta.color_primary,
      color_secondary: meta.color_secondary,
      description: meta.description,
      units,
    };
  });
}
