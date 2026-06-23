import { db } from '../db/index.js';
import { refreshProfile } from '../lib/profile.js';
import { leagueIndex } from './leagueService.js';
import type { Achievement, LeagueTier } from '../../../shared/types.js';

export interface AchievementContext {
  night_study?: boolean;
  morning_study?: boolean;
  fast_lesson?: boolean;
  best_combo?: number;
}

function num(sql: string, ...params: unknown[]): number {
  return (db.prepare(sql).get(...params) as { n: number }).n;
}

/** Quantos cursos (idiomas) o usuário concluiu 100%. */
function completedCourses(userId: number): number {
  const langs = db
    .prepare(
      `SELECT l.id,
              (SELECT COUNT(*) FROM lessons les
                 JOIN units un ON un.id = les.unit_id
                WHERE un.language_id = l.id) AS total,
              (SELECT COUNT(*) FROM user_lesson_progress ulp
                 JOIN lessons les ON les.id = ulp.lesson_id
                 JOIN units un ON un.id = les.unit_id
                WHERE un.language_id = l.id AND ulp.user_id = ? AND ulp.completed = 1) AS done
         FROM languages l`,
    )
    .all(userId) as { id: number; total: number; done: number }[];
  return langs.filter((l) => l.total > 0 && l.done >= l.total).length;
}

/** Valor atual da métrica para um tipo de condição. */
function metricValue(
  userId: number,
  conditionType: string,
  ctx: AchievementContext,
): number {
  const p = refreshProfile(userId);
  switch (conditionType) {
    case 'streak_days':
      return p.streak_longest;
    case 'total_xp':
      return p.xp_total;
    case 'gems_total':
      return p.gems;
    case 'lessons_done':
    case 'lessons_complete':
      return num(
        'SELECT COUNT(*) AS n FROM user_lesson_progress WHERE user_id = ? AND completed = 1',
        userId,
      );
    case 'perfect_lessons':
      return num(
        'SELECT COUNT(*) AS n FROM user_lesson_progress WHERE user_id = ? AND completed = 1 AND mistakes_count = 0',
        userId,
      );
    case 'code_lessons':
      return num(
        `SELECT COUNT(*) AS n FROM user_lesson_progress ulp
           JOIN lessons l ON l.id = ulp.lesson_id
          WHERE ulp.user_id = ? AND ulp.completed = 1 AND l.type = 'code'`,
        userId,
      );
    case 'languages_started':
      return num(
        `SELECT COUNT(DISTINCT un.language_id) AS n FROM user_lesson_progress ulp
           JOIN lessons l ON l.id = ulp.lesson_id
           JOIN units un ON un.id = l.unit_id
          WHERE ulp.user_id = ?`,
        userId,
      );
    case 'daily_challenges':
      return num(
        'SELECT COUNT(*) AS n FROM user_daily_challenges WHERE user_id = ? AND completed = 1',
        userId,
      );
    case 'vocab_learned':
      return num('SELECT COUNT(*) AS n FROM user_vocabulary WHERE user_id = ?', userId);
    case 'league_reached':
      return leagueIndex(p.league as LeagueTier) + 1;
    case 'course_complete':
    case 'all_courses':
      return completedCourses(userId);
    case 'night_study':
      return ctx.night_study ? 1 : 0;
    case 'morning_study':
      return ctx.morning_study ? 1 : 0;
    case 'fast_lesson':
      return ctx.fast_lesson ? 1 : 0;
    case 'best_combo':
      return ctx.best_combo ?? 0;
    case 'best_rank_top': {
      if (p.xp_total <= 0) return 0;
      const row = db
        .prepare('SELECT COUNT(*) AS n FROM user_profiles WHERE xp_total > ?')
        .get(p.xp_total) as { n: number };
      return row.n + 1; // posição global (1 = topo)
    }
    default:
      return 0;
  }
}

/** Tipos de condição onde "menor é melhor" (posição de ranking). */
const RANK_TYPES = new Set(['best_rank_top']);

function meetsCondition(conditionType: string, value: number, target: number): boolean {
  if (RANK_TYPES.has(conditionType)) return value > 0 && value <= target;
  return value >= target;
}

/** Progresso (0..1) de uma conquista — útil para a UI. */
export function achievementProgress(
  userId: number,
  conditionType: string,
  conditionValue: number,
): number {
  if (RANK_TYPES.has(conditionType)) return 0; // progresso de ranking não é linear
  const v = metricValue(userId, conditionType, {});
  return Math.max(0, Math.min(1, v / conditionValue));
}

/**
 * Verifica todas as conquistas pendentes, concede as atingidas e devolve
 * a lista das recém-concedidas (com recompensas já aplicadas).
 */
export function checkAchievements(
  userId: number,
  ctx: AchievementContext = {},
): Achievement[] {
  const all = db.prepare('SELECT * FROM achievements').all() as Achievement[];
  const earned = new Set(
    (
      db.prepare('SELECT achievement_id FROM user_achievements WHERE user_id = ?').all(userId) as {
        achievement_id: number;
      }[]
    ).map((r) => r.achievement_id),
  );

  const granted: Achievement[] = [];
  const insert = db.prepare(
    'INSERT OR IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
  );

  const tx = db.transaction(() => {
    for (const a of all) {
      if (earned.has(a.id)) continue;
      const v = metricValue(userId, a.condition_type, ctx);
      if (meetsCondition(a.condition_type, v, a.condition_value)) {
        insert.run(userId, a.id);
        if (a.gem_reward > 0 || a.xp_reward > 0) {
          db.prepare(
            `UPDATE user_profiles SET gems = gems + @g, xp_total = xp_total + @x WHERE user_id = @u`,
          ).run({ g: a.gem_reward, x: a.xp_reward, u: userId });
        }
        granted.push(a);
      }
    }
  });
  tx();

  return granted;
}
