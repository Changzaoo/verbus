import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { Theme } from './skeleton.js';
import { DIALOGUE_REFERENCE, DIALOGUE_THEMES, type Speaker } from './dialoguesReference.js';

/** Uma fala do diálogo já resolvida para um idioma. */
export interface DialogueTurn {
  sp: Speaker;
  pt: string;
  /** Texto-alvo TOKENIZADO (palavras separadas por espaço, como no banco). */
  term: string;
  /** Romanização (escrita não-latina). */
  roman?: string;
}

export interface Dialogue {
  theme: Theme;
  title: string;
  setting: string;
  turns: DialogueTurn[];
}

/** Linha-alvo fornecida por um idioma, alinhada por índice ao roteiro-referência. */
interface LangLine {
  term: string;
  roman?: string;
}
interface DialogueLangFile {
  code: string;
  lines: Partial<Record<Theme, LangLine[]>>;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');

const cache = new Map<string, Dialogue[] | null>();

/**
 * Carrega os diálogos coerentes de um idioma, combinando o roteiro-referência (PT,
 * ordem, quem fala) com o texto-alvo do arquivo `<code>.dialogue.json`.
 * Só inclui um tema quando o idioma tem todas as falas daquele diálogo.
 */
export function loadDialogues(code: string): Dialogue[] | null {
  if (cache.has(code)) return cache.get(code)!;

  const path = join(DATA_DIR, `${code}.dialogue.json`);
  if (!existsSync(path)) {
    cache.set(code, null);
    return null;
  }

  let file: DialogueLangFile;
  try {
    file = JSON.parse(readFileSync(path, 'utf-8')) as DialogueLangFile;
  } catch (e) {
    console.warn(`[dialogues] ${code}.dialogue.json inválido:`, (e as Error).message);
    cache.set(code, null);
    return null;
  }

  const out: Dialogue[] = [];
  for (const theme of DIALOGUE_THEMES) {
    const ref = DIALOGUE_REFERENCE[theme];
    const lines = file.lines?.[theme];
    if (!lines || lines.length !== ref.turns.length) continue; // exige paridade exata
    const turns: DialogueTurn[] = ref.turns.map((t, i) => ({
      sp: t.sp,
      pt: t.pt,
      term: lines[i].term,
      roman: lines[i].roman || undefined,
    }));
    if (turns.some((t) => !t.term?.trim())) continue;
    out.push({ theme, title: ref.title, setting: ref.setting, turns });
  }

  const result = out.length ? out : null;
  cache.set(code, result);
  return result;
}
