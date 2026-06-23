import { api } from '@/lib/api';
import { prettyTerm, shuffle } from '@/lib/material';

export type Speaker = 'A' | 'B'; // A = Byte, B = Lia

export interface DialogueTurn {
  sp: Speaker;
  pt: string;
  term: string;
  roman?: string;
}
export interface Dialogue {
  theme: string;
  title: string;
  setting: string;
  turns: DialogueTurn[];
}
export interface DialoguePack {
  language: { id: number; code: string; name: string; native_name: string; color_primary: string };
  audio_lang: string;
  dialogues: Dialogue[];
}

export function fetchDialogues(langId: string): Promise<DialoguePack> {
  return api.get<DialoguePack>(`/content/${langId}/dialogues`);
}

export { prettyTerm, shuffle };

/**
 * Monta os turnos de "responda corretamente" para a Ligação: para cada fala da Lia (B)
 * que responde a uma fala do Byte (A), oferece a resposta certa + distratores plausíveis
 * (outras falas da Lia, do mesmo diálogo — topicamente próximas, mas só uma é coerente).
 */
export interface CallExchange {
  prompt: DialogueTurn; // fala do Byte (A)
  reply: DialogueTurn; // resposta correta da Lia (B)
  options: string[]; // termos (pretty) embaralhados
}

export function buildCallExchanges(d: Dialogue): CallExchange[] {
  const replies = d.turns.filter((t) => t.sp === 'B');
  const out: CallExchange[] = [];
  for (let i = 0; i + 1 < d.turns.length; i++) {
    const a = d.turns[i];
    const b = d.turns[i + 1];
    if (a.sp !== 'A' || b.sp !== 'B') continue;
    const correct = prettyTerm(b.term);
    const distract = shuffle(replies.filter((r) => r.pt !== b.pt).map((r) => prettyTerm(r.term)))
      .filter((t) => t !== correct)
      .slice(0, 2);
    out.push({ prompt: a, reply: b, options: shuffle([correct, ...distract]) });
  }
  return out;
}

/** Pergunta de compreensão: o que significa esta fala? (distratores = outras falas do diálogo). */
export interface ComprehensionQ {
  turn: DialogueTurn;
  options: string[]; // traduções PT
}
export function buildComprehension(d: Dialogue, turn: DialogueTurn): ComprehensionQ {
  const distract = shuffle(d.turns.filter((t) => t.pt !== turn.pt).map((t) => t.pt)).slice(0, 3);
  return { turn, options: shuffle([turn.pt, ...distract]) };
}
