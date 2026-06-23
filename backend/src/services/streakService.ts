import { db } from '../db/index.js';
import { refreshProfile } from '../lib/profile.js';
import { today, diffDays } from '../lib/dates.js';

export interface StreakResult {
  streak_current: number;
  streak_longest: number;
  increased: boolean;
  freeze_used: boolean;
}

/**
 * Atualiza o streak ao concluir atividade no dia.
 * - Mesmo dia: sem alteração.
 * - Dia consecutivo: +1.
 * - Lacuna de 1 dia com streak_freeze disponível: consome o freeze e mantém o streak.
 * - Lacuna maior (ou sem freeze): reinicia em 1.
 */
export function registerStreakActivity(userId: number): StreakResult {
  const tx = db.transaction(() => {
    const p = refreshProfile(userId);
    const td = today();

    if (p.streak_last_date === td) {
      return {
        streak_current: p.streak_current,
        streak_longest: p.streak_longest,
        increased: false,
        freeze_used: false,
      };
    }

    let current = p.streak_current;
    let freezeUsed = false;
    let freezeCount = p.streak_freeze_count;

    if (p.streak_last_date == null) {
      current = 1;
    } else {
      const gap = diffDays(td, p.streak_last_date);
      if (gap === 1) {
        current += 1;
      } else if (gap === 2 && freezeCount > 0) {
        // Pulou um dia, mas tem streak freeze: mantém e incrementa.
        freezeCount -= 1;
        freezeUsed = true;
        current += 1;
      } else {
        current = 1;
      }
    }

    const longest = Math.max(current, p.streak_longest);

    db.prepare(
      `UPDATE user_profiles
         SET streak_current = @current,
             streak_longest = @longest,
             streak_last_date = @td,
             streak_freeze_count = @freezeCount
       WHERE user_id = @userId`,
    ).run({ current, longest, td, freezeCount, userId });

    return {
      streak_current: current,
      streak_longest: longest,
      increased: true,
      freeze_used: freezeUsed,
    };
  });

  return tx();
}
