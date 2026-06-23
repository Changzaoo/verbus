import { db } from '../db/index.js';
import { now, today, weekStart, hoursBetween } from './dates.js';
import { HEARTS_SYSTEM } from '../../../shared/types.js';
import type { UserProfile, LeagueTier, Theme, AgeGroup } from '../../../shared/types.js';

export interface ProfileRow {
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
  league: string;
  league_xp_week: number;
  daily_goal_xp: number;
  daily_goal_met: number;
  notifications_enabled: number;
  sound_enabled: number;
  theme: string;
  xp_today_date: string | null;
  xp_week_start: string | null;
  infinite_hearts_until: string | null;
  age_group: string;
}

const getRow = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?');

/**
 * Lê o perfil aplicando recargas/reposições baseadas no tempo:
 * - Regeneração de corações (1 a cada N horas)
 * - Reset de XP diário e meta diária
 * - Reset de XP semanal e XP da liga
 */
export function refreshProfile(userId: number): ProfileRow {
  const row = getRow.get(userId) as ProfileRow | undefined;
  if (!row) throw new Error('profile_not_found');

  const updates: string[] = [];
  const params: Record<string, unknown> = { user_id: userId };

  // --- Corações ---
  const hasInfinite =
    row.infinite_hearts_until != null && new Date(row.infinite_hearts_until) > new Date();
  if (hasInfinite) {
    if (row.hearts < HEARTS_SYSTEM.max) {
      row.hearts = HEARTS_SYSTEM.max;
      updates.push('hearts = @hearts');
      params.hearts = row.hearts;
    }
  } else if (row.hearts < HEARTS_SYSTEM.max) {
    const elapsed = hoursBetween(row.hearts_last_refill);
    const regen = Math.floor(elapsed / HEARTS_SYSTEM.refill_interval_hours);
    if (regen > 0) {
      const newHearts = Math.min(HEARTS_SYSTEM.max, row.hearts + regen);
      row.hearts = newHearts;
      // Avança o relógio de recarga pelo número de corações concedidos.
      const advancedMs =
        new Date(row.hearts_last_refill).getTime() +
        regen * HEARTS_SYSTEM.refill_interval_hours * 3_600_000;
      const newRefill =
        newHearts >= HEARTS_SYSTEM.max ? now() : new Date(advancedMs).toISOString();
      row.hearts_last_refill = newRefill;
      updates.push('hearts = @hearts', 'hearts_last_refill = @hearts_last_refill');
      params.hearts = newHearts;
      params.hearts_last_refill = newRefill;
    }
  }

  // --- Reset diário ---
  const td = today();
  if (row.xp_today_date !== td) {
    row.xp_today = 0;
    row.daily_goal_met = 0;
    row.xp_today_date = td;
    updates.push('xp_today = 0', 'daily_goal_met = 0', 'xp_today_date = @td');
    params.td = td;
  }

  // --- Reset semanal ---
  const ws = weekStart(td);
  if (row.xp_week_start !== ws) {
    row.xp_week = 0;
    row.league_xp_week = 0;
    row.xp_week_start = ws;
    updates.push('xp_week = 0', 'league_xp_week = 0', 'xp_week_start = @ws');
    params.ws = ws;
  }

  if (updates.length > 0) {
    db.prepare(`UPDATE user_profiles SET ${updates.join(', ')} WHERE user_id = @user_id`).run(
      params,
    );
  }

  return row;
}

export function serializeProfile(row: ProfileRow): UserProfile {
  return {
    user_id: row.user_id,
    xp_total: row.xp_total,
    xp_today: row.xp_today,
    xp_week: row.xp_week,
    gems: row.gems,
    hearts: row.hearts,
    hearts_last_refill: row.hearts_last_refill,
    streak_current: row.streak_current,
    streak_longest: row.streak_longest,
    streak_last_date: row.streak_last_date,
    streak_freeze_count: row.streak_freeze_count,
    league: row.league as LeagueTier,
    league_xp_week: row.league_xp_week,
    daily_goal_xp: row.daily_goal_xp,
    daily_goal_met: !!row.daily_goal_met,
    notifications_enabled: !!row.notifications_enabled,
    sound_enabled: !!row.sound_enabled,
    theme: row.theme as Theme,
    age_group: (row.age_group as AgeGroup) ?? 'adult',
  };
}

export function getProfile(userId: number): UserProfile {
  return serializeProfile(refreshProfile(userId));
}
