import { pathToFileURL } from 'node:url';
import { db } from './index.js';
import { runSeed } from './seed.js';

/** Apaga TODOS os dados (inclusive usuários) e recria o conteúdo. */
export function resetDatabase(): void {
  db.exec(`
    DELETE FROM user_purchases;
    DELETE FROM user_daily_challenges;
    DELETE FROM user_achievements;
    DELETE FROM user_vocabulary;
    DELETE FROM user_lesson_progress;
    DELETE FROM xp_history;
    DELETE FROM league_participants;
    DELETE FROM friendships;
    DELETE FROM user_profiles;
    DELETE FROM users;
  `);
  runSeed();
  console.log('[reset] Banco recriado do zero.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  resetDatabase();
  process.exit(0);
}
