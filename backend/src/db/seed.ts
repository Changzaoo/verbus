import { pathToFileURL } from 'node:url';
import { db } from './index.js';
import { buildLanguageSeeds } from '../content/index.js';
import { ACHIEVEMENTS } from '../content/achievements.js';
import { SHOP_ITEMS } from '../content/shop.js';
import { today } from '../lib/dates.js';

export function runSeed(): void {
  const languages = buildLanguageSeeds();

  const tx = db.transaction(() => {
    // Limpa conteúdo de forma idempotente. Remove primeiro as linhas que referenciam
    // o conteúdo (progresso/compras/etc.) para não violar foreign keys. As contas de
    // usuário (users/user_profiles) são preservadas; use `reset` para apagar tudo.
    db.exec(`
      DELETE FROM user_purchases;
      DELETE FROM user_daily_challenges;
      DELETE FROM user_achievements;
      DELETE FROM user_vocabulary;
      DELETE FROM user_lesson_progress;
      DELETE FROM daily_challenges;
      DELETE FROM exercises;
      DELETE FROM lessons;
      DELETE FROM units;
      DELETE FROM languages;
      DELETE FROM achievements;
      DELETE FROM shop_items;
    `);

    const insLang = db.prepare(
      `INSERT INTO languages (code, name, native_name, flag_emoji, color_primary, color_secondary, description)
       VALUES (@code, @name, @native_name, @flag_emoji, @color_primary, @color_secondary, @description)`,
    );
    const insUnit = db.prepare(
      `INSERT INTO units (language_id, order_index, title, description, level, color, icon, required_xp)
       VALUES (@language_id, @order_index, @title, @description, @level, @color, @icon, @required_xp)`,
    );
    const insLesson = db.prepare(
      `INSERT INTO lessons (unit_id, order_index, title, description, type, xp_reward, gem_reward, estimated_minutes, exercise_count, is_bonus)
       VALUES (@unit_id, @order_index, @title, @description, @type, @xp_reward, @gem_reward, @estimated_minutes, @exercise_count, @is_bonus)`,
    );
    const insEx = db.prepare(
      `INSERT INTO exercises (lesson_id, order_index, type, question, question_audio, question_image, correct_answer, options, hints, explanation, xp_value, difficulty, code, pairs, audio_lang, age_group)
       VALUES (@lesson_id, @order_index, @type, @question, @question_audio, @question_image, @correct_answer, @options, @hints, @explanation, @xp_value, @difficulty, @code, @pairs, @audio_lang, @age_group)`,
    );

    let totalLessons = 0;
    let totalExercises = 0;

    for (const [li, lang] of languages.entries()) {
      const langRes = insLang.run({
        code: lang.code,
        name: lang.name,
        native_name: lang.native_name,
        flag_emoji: lang.flag_emoji,
        color_primary: lang.color_primary,
        color_secondary: lang.color_secondary,
        description: lang.description,
      });
      const languageId = Number(langRes.lastInsertRowid);
      let langXp = 0;
      let langLessons = 0;

      for (const [ui, unit] of lang.units.entries()) {
        const unitRes = insUnit.run({
          language_id: languageId,
          order_index: ui + 1,
          title: unit.title,
          description: unit.description ?? null,
          level: unit.level,
          color: unit.color,
          icon: unit.icon,
          required_xp: unit.required_xp,
        });
        const unitId = Number(unitRes.lastInsertRowid);

        for (const [lsi, lesson] of unit.lessons.entries()) {
          const lessonRes = insLesson.run({
            unit_id: unitId,
            order_index: lsi + 1,
            title: lesson.title,
            description: lesson.description ?? null,
            type: lesson.type,
            xp_reward: lesson.xp_reward,
            gem_reward: lesson.gem_reward,
            estimated_minutes: lesson.estimated_minutes,
            exercise_count: lesson.exercises.length,
            is_bonus: lesson.is_bonus ? 1 : 0,
          });
          const lessonId = Number(lessonRes.lastInsertRowid);
          langXp += lesson.xp_reward;
          langLessons++;
          totalLessons++;

          for (const [ei, ex] of lesson.exercises.entries()) {
            insEx.run({
              lesson_id: lessonId,
              order_index: ei + 1,
              type: ex.type,
              question: ex.question,
              question_audio: ex.question_audio ?? null,
              question_image: ex.question_image ?? null,
              correct_answer: ex.correct_answer,
              options: ex.options ? JSON.stringify(ex.options) : null,
              hints: ex.hints ? JSON.stringify(ex.hints) : null,
              explanation: ex.explanation ?? null,
              xp_value: 1,
              difficulty: ex.difficulty ?? 1,
              code: ex.code ?? null,
              pairs: ex.pairs ? JSON.stringify(ex.pairs) : null,
              audio_lang: ex.audio_lang ?? null,
              age_group: ex.age_group ?? 'all',
            });
            totalExercises++;
          }
        }
      }

      db.prepare(
        `UPDATE languages SET total_units = ?, total_lessons = ?, total_xp_available = ? WHERE id = ?`,
      ).run(lang.units.length, langLessons, langXp, languageId);
      void li;
    }

    // Conquistas
    const insAch = db.prepare(
      `INSERT INTO achievements (code, name, description, icon, category, condition_type, condition_value, language_id, gem_reward, xp_reward, is_hidden)
       VALUES (@code, @name, @description, @icon, @category, @condition_type, @condition_value, NULL, @gem_reward, @xp_reward, @is_hidden)`,
    );
    for (const a of ACHIEVEMENTS) {
      insAch.run({ ...a, is_hidden: a.is_hidden ? 1 : 0 });
    }

    // Loja
    const insShop = db.prepare(
      `INSERT INTO shop_items (name, description, icon, type, gem_cost, is_available, avatar_id)
       VALUES (@name, @description, @icon, @type, @gem_cost, 1, @avatar_id)`,
    );
    for (const s of SHOP_ITEMS) insShop.run({ ...s, avatar_id: s.avatar_id ?? null });

    // Desafio diário de hoje (idioma inglês por padrão)
    const enId = (db.prepare(`SELECT id FROM languages WHERE code = 'en'`).get() as { id: number }).id;
    db.prepare(
      `INSERT INTO daily_challenges (date, language_id, type, title, description, xp_reward, gem_reward)
       VALUES (?, ?, 'mixed', 'Desafio Relâmpago', 'Acerte 5 exercícios técnicos sem errar!', 30, 15)`,
    ).run(today(), enId);

    return { totalLessons, totalExercises, totalLanguages: languages.length };
  });

  const result = tx();

  console.log(
    `[seed] ${result.totalLanguages} idiomas, ${result.totalLessons} lições, ${result.totalExercises} exercícios.`,
  );
}

// Executa o seed quando chamado diretamente (npm run seed).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runSeed();
  process.exit(0);
}
