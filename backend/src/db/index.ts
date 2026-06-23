import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATA_DIR = join(__dirname, '..', '..', 'data');
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

export const DB_PATH = process.env.VERBUS_DB ?? process.env.DEVLINGO_DB ?? join(DATA_DIR, 'verbus.db');

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/** Aplica o schema (idempotente — usa CREATE TABLE IF NOT EXISTS). */
export function applySchema(): void {
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
}

/** Garante que uma coluna exista (migração leve para bancos já criados). */
function ensureColumn(table: string, column: string, definition: string): void {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

/** Migrações idempotentes aplicadas após o schema. */
export function runMigrations(): void {
  ensureColumn('shop_items', 'avatar_id', 'INTEGER');
  ensureColumn('user_profiles', 'age_group', "TEXT DEFAULT 'adult'");
  ensureColumn('exercises', 'age_group', "TEXT DEFAULT 'all'");
  db.exec('CREATE INDEX IF NOT EXISTS idx_exercises_lesson_age ON exercises(lesson_id, age_group, order_index)');
}

/** Indica se o banco já foi populado com idiomas. */
export function isSeeded(): boolean {
  try {
    const row = db.prepare('SELECT COUNT(*) AS n FROM languages').get() as { n: number };
    return row.n > 0;
  } catch {
    return false;
  }
}

// Garante o schema e migrações sempre que o módulo é carregado.
applySchema();
runMigrations();

export type DB = typeof db;
