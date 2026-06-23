import { db } from '../db/index.js';
import { today, addDays, now } from '../lib/dates.js';

/**
 * Algoritmo SM-2 (SuperMemo 2) para repetição espaçada.
 * Qualidade: correto => 5, incorreto => 2.
 */
export interface SrsState {
  repetitions: number;
  ease_factor: number;
  interval_days: number;
  next_review: string;
}

export function computeSm2(
  prev: { repetitions: number; ease_factor: number; interval_days: number },
  correct: boolean,
): SrsState {
  const q = correct ? 5 : 2;
  let { repetitions, ease_factor, interval_days } = prev;

  if (q < 3) {
    repetitions = 0;
    interval_days = 1;
  } else {
    if (repetitions === 0) interval_days = 1;
    else if (repetitions === 1) interval_days = 6;
    else interval_days = Math.round(interval_days * ease_factor);
    repetitions += 1;
  }

  ease_factor = ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ease_factor < 1.3) ease_factor = 1.3;
  ease_factor = Math.round(ease_factor * 100) / 100;

  return {
    repetitions,
    ease_factor,
    interval_days,
    next_review: addDays(today(), interval_days),
  };
}

const getVocab = db.prepare(
  'SELECT * FROM user_vocabulary WHERE user_id = ? AND exercise_id = ?',
);

export interface VocabRow extends SrsState {
  id: number;
  user_id: number;
  exercise_id: number;
  last_reviewed: string | null;
  correct_count: number;
  wrong_count: number;
}

export function reviewVocabulary(
  userId: number,
  exerciseId: number,
  correct: boolean,
): SrsState {
  const tx = db.transaction(() => {
    const existing = getVocab.get(userId, exerciseId) as VocabRow | undefined;
    const prev = existing ?? { repetitions: 0, ease_factor: 2.5, interval_days: 1 };
    const next = computeSm2(prev, correct);

    if (existing) {
      db.prepare(
        `UPDATE user_vocabulary
           SET repetitions = @repetitions, ease_factor = @ease_factor,
               interval_days = @interval_days, next_review = @next_review,
               last_reviewed = @lastReviewed,
               correct_count = correct_count + @c, wrong_count = wrong_count + @w
         WHERE user_id = @userId AND exercise_id = @exerciseId`,
      ).run({
        ...next,
        lastReviewed: now(),
        c: correct ? 1 : 0,
        w: correct ? 0 : 1,
        userId,
        exerciseId,
      });
    } else {
      db.prepare(
        `INSERT INTO user_vocabulary
           (user_id, exercise_id, repetitions, ease_factor, interval_days, next_review,
            last_reviewed, correct_count, wrong_count)
         VALUES (@userId, @exerciseId, @repetitions, @ease_factor, @interval_days,
                 @next_review, @lastReviewed, @c, @w)`,
      ).run({
        ...next,
        lastReviewed: now(),
        c: correct ? 1 : 0,
        w: correct ? 0 : 1,
        userId,
        exerciseId,
      });
    }

    return next;
  });

  return tx();
}

/** Exercícios devidos para revisão hoje (limit configurável). */
export function getDueVocabulary(userId: number, limit = 20) {
  return db
    .prepare(
      `SELECT e.* FROM user_vocabulary v
         JOIN exercises e ON e.id = v.exercise_id
        WHERE v.user_id = ? AND v.next_review <= ?
        ORDER BY v.next_review ASC
        LIMIT ?`,
    )
    .all(userId, today(), limit);
}

export function getVocabularyStats(userId: number) {
  const total = (
    db.prepare('SELECT COUNT(*) AS n FROM user_vocabulary WHERE user_id = ?').get(userId) as {
      n: number;
    }
  ).n;
  const due = (
    db
      .prepare('SELECT COUNT(*) AS n FROM user_vocabulary WHERE user_id = ? AND next_review <= ?')
      .get(userId, today()) as { n: number }
  ).n;
  const mastered = (
    db
      .prepare('SELECT COUNT(*) AS n FROM user_vocabulary WHERE user_id = ? AND repetitions >= 5')
      .get(userId) as { n: number }
  ).n;
  return { total, due_today: due, mastered, learning: total - mastered };
}
