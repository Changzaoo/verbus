import { api } from '@/lib/api';

export interface MatWord {
  pt: string;
  term: string;
}
export interface MatSentence {
  pt: string;
  term: string;
  roman?: string;
}
export interface MatTheme {
  theme: string;
  title: string;
  icon: string;
  color: string;
  words: MatWord[];
  sentences: MatSentence[];
}
export interface Material {
  language: { id: number; code: string; name: string; native_name: string; color_primary: string };
  audio_lang: string;
  themes: MatTheme[];
}

export function fetchMaterial(langId: string): Promise<Material> {
  return api.get<Material>(`/content/${langId}/material`);
}

/** Remove o espaço antes da pontuação e depois de abre-aspas/parênteses, para exibição. */
export function prettyTerm(t: string): string {
  return t
    .replace(/\s+([.,!?;:»)）。、！？])/g, '$1')
    .replace(/([«(（])\s+/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Embaralha um array (Fisher–Yates) — para jogos/seleções aleatórias. */
export function shuffle<T>(arr: T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Junta todas as palavras de todos os temas. */
export function allWords(mat: Material): MatWord[] {
  return mat.themes.flatMap((t) => t.words);
}

/** Junta todas as frases de todos os temas. */
export function allSentences(mat: Material): MatSentence[] {
  return mat.themes.flatMap((t) => t.sentences);
}
