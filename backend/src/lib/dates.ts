/** Utilidades de data/hora — padroniza para UTC em formato ISO/data. */

export function now(): string {
  return new Date().toISOString();
}

/** Data de hoje no formato YYYY-MM-DD (UTC). */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Diferença em dias inteiros entre duas datas YYYY-MM-DD (a - b). */
export function diffDays(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00Z').getTime();
  const db = new Date(b + 'T00:00:00Z').getTime();
  return Math.round((da - db) / 86_400_000);
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return toDateStr(d);
}

/** Início (segunda-feira) da semana ISO que contém `dateStr`. */
export function weekStart(dateStr: string = today()): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  const day = d.getUTCDay(); // 0=domingo
  const delta = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + delta);
  return toDateStr(d);
}

export function hoursBetween(fromISO: string, toISO: string = now()): number {
  return (new Date(toISO).getTime() - new Date(fromISO).getTime()) / 3_600_000;
}

export function secondsUntilEndOfWeek(): number {
  const n = new Date();
  const ws = new Date(weekStart() + 'T00:00:00Z');
  const end = new Date(ws.getTime() + 7 * 86_400_000);
  return Math.max(0, Math.floor((end.getTime() - n.getTime()) / 1000));
}
