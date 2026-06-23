import { db } from '../db/index.js';
import { refreshProfile } from '../lib/profile.js';
import { XP_SYSTEM } from '../../../shared/types.js';
import type { XpSource } from '../../../shared/types.js';

const insertHistory = db.prepare(
  `INSERT INTO xp_history (user_id, amount, source, source_id) VALUES (?, ?, ?, ?)`,
);

/** Multiplicador de XP conforme o streak atual. */
export function streakMultiplier(streak: number): number {
  let mult = 1;
  for (const [days, m] of Object.entries(XP_SYSTEM.streak_multiplier)) {
    if (streak >= Number(days)) mult = m;
  }
  return mult;
}

export interface AddXpResult {
  amount: number;
  daily_goal_just_met: boolean;
}

/**
 * Credita XP ao usuário, atualizando totais diário/semanal/liga e o histórico.
 * Retorna o valor creditado e se a meta diária foi batida agora.
 */
export function addXp(
  userId: number,
  amount: number,
  source: XpSource,
  sourceId: number | null = null,
): AddXpResult {
  if (amount <= 0) return { amount: 0, daily_goal_just_met: false };

  const tx = db.transaction(() => {
    const profile = refreshProfile(userId);
    const wasMet = !!profile.daily_goal_met;
    const newToday = profile.xp_today + amount;
    const goalMet = newToday >= profile.daily_goal_xp;

    db.prepare(
      `UPDATE user_profiles
         SET xp_total = xp_total + @amount,
             xp_today = xp_today + @amount,
             xp_week = xp_week + @amount,
             league_xp_week = league_xp_week + @amount,
             daily_goal_met = @goalMet
       WHERE user_id = @userId`,
    ).run({ amount, goalMet: goalMet ? 1 : 0, userId });

    insertHistory.run(userId, amount, source, sourceId);

    return { amount, daily_goal_just_met: goalMet && !wasMet };
  });

  return tx();
}

export interface XpStatsRow {
  total: number;
  today: number;
  week: number;
  month: number;
}

export function getXpStats(userId: number): XpStatsRow {
  const profile = refreshProfile(userId);
  const monthRow = db
    .prepare(
      `SELECT COALESCE(SUM(amount),0) AS m FROM xp_history
        WHERE user_id = ? AND earned_at >= datetime('now','-30 days')`,
    )
    .get(userId) as { m: number };
  return {
    total: profile.xp_total,
    today: profile.xp_today,
    week: profile.xp_week,
    month: monthRow.m,
  };
}
