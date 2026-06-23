import { db } from '../db/index.js';
import { refreshProfile } from '../lib/profile.js';
import { secondsUntilEndOfWeek } from '../lib/dates.js';
import { LEAGUES } from '../../../shared/types.js';
import type { LeaderboardEntry, CurrentLeague, LeagueTier } from '../../../shared/types.js';

interface RankRow {
  user_id: number;
  username: string;
  display_name: string | null;
  avatar_id: number;
  xp: number;
  league: string;
}

function toEntries(rows: RankRow[], currentUserId: number): LeaderboardEntry[] {
  return rows.map((r, i) => ({
    user_id: r.user_id,
    username: r.username,
    display_name: r.display_name,
    avatar_id: r.avatar_id,
    xp: r.xp,
    rank: i + 1,
    league: r.league as LeagueTier,
    is_current_user: r.user_id === currentUserId,
  }));
}

export type RankPeriod = 'all' | 'week';

export function globalLeaderboard(
  currentUserId: number,
  limit = 50,
  period: RankPeriod = 'all',
): LeaderboardEntry[] {
  const col = period === 'week' ? 'xp_week' : 'xp_total';
  const rows = db
    .prepare(
      `SELECT u.id AS user_id, u.username, u.display_name, u.avatar_id,
              p.${col} AS xp, p.league
         FROM user_profiles p JOIN users u ON u.id = p.user_id
        ORDER BY p.${col} DESC, u.id ASC
        LIMIT ?`,
    )
    .all(limit) as RankRow[];
  return toEntries(rows, currentUserId);
}

export interface RankContext {
  rank: number;
  total: number;
  xp: number;
  to_next: number;
  next_user: string | null;
  period: RankPeriod;
}

/** Posição do usuário no ranking + quanto falta para subir uma posição. */
export function rankContext(currentUserId: number, period: RankPeriod = 'all'): RankContext {
  const col = period === 'week' ? 'xp_week' : 'xp_total';
  const me = db.prepare(`SELECT ${col} AS xp FROM user_profiles WHERE user_id = ?`).get(currentUserId) as
    | { xp: number }
    | undefined;
  const myXp = me?.xp ?? 0;
  const above = (
    db.prepare(`SELECT COUNT(*) AS n FROM user_profiles WHERE ${col} > ?`).get(myXp) as { n: number }
  ).n;
  const total = (db.prepare('SELECT COUNT(*) AS n FROM user_profiles').get() as { n: number }).n;
  const nextRow = db
    .prepare(
      `SELECT u.username, u.display_name, p.${col} AS xp
         FROM user_profiles p JOIN users u ON u.id = p.user_id
        WHERE p.${col} > ? ORDER BY p.${col} ASC LIMIT 1`,
    )
    .get(myXp) as { username: string; display_name: string | null; xp: number } | undefined;
  return {
    rank: above + 1,
    total,
    xp: myXp,
    to_next: nextRow ? Math.max(1, nextRow.xp - myXp + 1) : 0,
    next_user: nextRow ? nextRow.display_name ?? nextRow.username : null,
    period,
  };
}

export function friendsLeaderboard(currentUserId: number): LeaderboardEntry[] {
  const rows = db
    .prepare(
      `SELECT u.id AS user_id, u.username, u.display_name, u.avatar_id,
              p.xp_week AS xp, p.league
         FROM user_profiles p JOIN users u ON u.id = p.user_id
        WHERE u.id = @uid
           OR u.id IN (SELECT friend_id FROM friendships WHERE user_id = @uid)
        ORDER BY p.xp_week DESC, u.id ASC`,
    )
    .all({ uid: currentUserId }) as RankRow[];
  return toEntries(rows, currentUserId);
}

export function currentLeague(currentUserId: number): CurrentLeague {
  const me = refreshProfile(currentUserId);
  const tier = me.league as LeagueTier;
  const info = LEAGUES.find((l) => l.tier === tier) ?? LEAGUES[0];

  const rows = db
    .prepare(
      `SELECT u.id AS user_id, u.username, u.display_name, u.avatar_id,
              p.league_xp_week AS xp, p.league
         FROM user_profiles p JOIN users u ON u.id = p.user_id
        WHERE p.league = ?
        ORDER BY p.league_xp_week DESC, u.id ASC
        LIMIT 30`,
    )
    .all(tier) as RankRow[];

  const entries = toEntries(rows, currentUserId);
  const userRank = entries.find((e) => e.is_current_user)?.rank ?? entries.length + 1;

  return {
    league: info,
    participants: entries,
    user_rank: userRank,
    promotion_zone: info.promote_top,
    demotion_zone: info.demote_bottom,
    ends_in_seconds: secondsUntilEndOfWeek(),
  };
}

/** Índice do tier na hierarquia de ligas (0 = bronze). */
export function leagueIndex(tier: LeagueTier): number {
  return LEAGUES.findIndex((l) => l.tier === tier);
}
