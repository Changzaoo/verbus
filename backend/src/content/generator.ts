import type { AgeGroup, LessonType } from '../../../shared/types.js';
import type { Theme } from './skeleton.js';
import type { Term, Sentence } from './banks.js';
import type { ExerciseSeed } from './types.js';

const AGES: AgeGroup[] = ['child', 'teen', 'adult'];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

/** Remove a romanização entre parênteses, ex.: "水 (mizu)" -> "水". */
function bare(s: string): string {
  return s.replace(/\s*\([^)]*\)/g, '').trim();
}

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

function rotate<T>(arr: T[], by: number): T[] {
  const n = arr.length;
  if (n === 0) return arr;
  const k = ((by % n) + n) % n;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

/** Embaralhamento determinístico (LCG) — estável entre execuções do seed. */
function shuffle<T>(arr: T[], seed: number): T[] {
  const r = [...arr];
  let s = seed >>> 0;
  for (let i = r.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function tokens(sentenceTerm: string): string[] {
  return sentenceTerm.split(/\s+/).map((t) => t.trim()).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Frases por tom (faixa etária)
// ---------------------------------------------------------------------------

function askTo(age: AgeGroup, pt: string, lang: string): string {
  return age === 'child' ? `Vamos lá! Como se diz «${pt}» em ${lang}?` : `Como se diz «${pt}» em ${lang}?`;
}
function askFrom(age: AgeGroup, term: string): string {
  if (age === 'child') return `O que quer dizer «${term}»?`;
  if (age === 'teen') return `O que significa «${term}»?`;
  return `Traduza para o português: «${term}»`;
}
function listenPrompt(age: AgeGroup): string {
  if (age === 'child') return 'Escute com atenção e escreva o que ouviu!';
  if (age === 'teen') return 'Ouça e escreva o que você ouviu.';
  return 'Ouça o áudio e transcreva.';
}
function speakPrompt(age: AgeGroup, term: string): string {
  return age === 'child' ? `Sua vez! Diga «${term}» em voz alta` : `Fale em voz alta: «${term}»`;
}
function dragPrompt(age: AgeGroup, pt: string): string {
  return age === 'child' ? `Monte a frase: «${pt}»` : `Toque nas palavras para traduzir: «${pt}»`;
}
function fillPrompt(age: AgeGroup): string {
  return age === 'child' ? 'Complete a frasinha!' : 'Complete a frase:';
}

// ---------------------------------------------------------------------------
// Geração por faixa etária
// ---------------------------------------------------------------------------

function buildForAge(
  words: Term[],
  sentences: Sentence[],
  age: AgeGroup,
  lang: string,
  audioLang: string,
  lessonIndex: number,
): ExerciseSeed[] {
  const out: ExerciseSeed[] = [];
  const difficulty = age === 'child' ? 1 : 2;
  const W = words;
  const S = sentences;
  const hasS = S.length >= 1;
  if (W.length < 4) return out;

  const termPool = W.map((w) => w.term);
  const ptPool = W.map((w) => w.pt);
  const half = Math.max(1, Math.ceil(W.length / 2));
  const A = W.slice(0, half);
  const B = W.slice(half).length >= 4 ? W.slice(half) : W;

  const g = (i: number): Term => W[((i % W.length) + W.length) % W.length];
  const sen = (i: number): Sentence => S[((i % S.length) + S.length) % S.length];

  function distract(pool: string[], correct: string, n: number, seed: number): string[] {
    const cands = uniq(pool).filter((x) => x !== correct);
    return shuffle(cands, seed).slice(0, n);
  }

  // ---- construtores de exercício (palavras) ----
  const mcTo = (w: Term, i: number): ExerciseSeed => {
    const opts = [w.term, ...distract(termPool, w.term, 3, i + 1)];
    return { type: 'multiple_choice', question: askTo(age, w.pt, lang), correct_answer: w.term, options: shuffle(opts, i + 2), explanation: `«${w.pt}» = «${w.term}».`, audio_lang: audioLang, difficulty, age_group: age };
  };
  const mcFrom = (w: Term, i: number): ExerciseSeed => {
    const opts = [w.pt, ...distract(ptPool, w.pt, 3, i + 3)];
    return { type: 'multiple_choice', question: askFrom(age, w.term), correct_answer: w.pt, options: shuffle(opts, i + 4), explanation: `«${w.term}» = «${w.pt}».`, difficulty, age_group: age };
  };
  const matchEx = (four: Term[]): ExerciseSeed => ({
    type: 'match_pairs',
    question: age === 'child' ? 'Ligue cada palavra à sua tradução!' : 'Conecte cada termo à sua tradução:',
    correct_answer: 'match',
    pairs: four.map((x) => ({ left: x.pt, right: bare(x.term) })),
    difficulty,
    age_group: age,
  });
  const transFromW = (w: Term): ExerciseSeed => ({ type: 'translation_from', question: askFrom(age, w.term), correct_answer: w.pt, hints: [w.term], audio_lang: audioLang, difficulty, age_group: age });
  const listenW = (w: Term): ExerciseSeed => ({ type: 'listen_type', question: listenPrompt(age), correct_answer: w.term, audio_lang: audioLang, difficulty, age_group: age });
  const speakW = (w: Term): ExerciseSeed => ({ type: 'speak', question: speakPrompt(age, w.term), correct_answer: w.term, audio_lang: audioLang, difficulty, age_group: age });

  // ---- construtores de exercício (frases) ----
  const transFromS = (s: Sentence): ExerciseSeed => ({ type: 'translation_from', question: askFrom(age, s.term), correct_answer: s.pt, hints: s.roman ? [s.roman] : undefined, audio_lang: audioLang, difficulty, age_group: age });
  const listenS = (s: Sentence): ExerciseSeed => ({ type: 'listen_type', question: listenPrompt(age), correct_answer: s.term, audio_lang: audioLang, difficulty: difficulty + 1, age_group: age });
  const dragS = (s: Sentence, i: number): ExerciseSeed => {
    const tk = tokens(s.term);
    const otherTokens = S.filter((x) => x !== s).flatMap((x) => tokens(x.term)).filter((t) => !tk.includes(t));
    const dis = uniq(otherTokens).slice(0, 2);
    return {
      type: 'drag_drop',
      question: dragPrompt(age, s.pt),
      correct_answer: tk.join(' '),
      options: shuffle([...tk, ...dis], i + 5),
      explanation: s.roman ? `«${s.pt}» → ${s.roman}` : undefined,
      difficulty: difficulty + 1,
      age_group: age,
    };
  };
  const fillS = (s: Sentence, i: number): ExerciseSeed => {
    const tk = tokens(s.term);
    if (tk.length < 2) return transFromS(s);
    let bi = 0;
    let blen = -1;
    tk.forEach((t, k) => {
      if (t.length > blen) {
        blen = t.length;
        bi = k;
      }
    });
    const correct = tk[bi];
    const display = tk.map((t, k) => (k === bi ? '____' : t)).join(' ');
    const pool = uniq([
      ...S.flatMap((x) => tokens(x.term)),
      ...W.map((w) => bare(w.term)),
    ]).filter((t) => t && t !== correct && !/^_+$/.test(t));
    const dis = shuffle(pool, i + 6).slice(0, 2);
    return {
      type: 'fill_blank',
      question: `${fillPrompt(age)} («${s.pt}») ${display}`,
      correct_answer: correct,
      options: shuffle([correct, ...dis], i + 7),
      difficulty: difficulty + 1,
      age_group: age,
    };
  };

  // ---- mix por índice da lição (currículo progressivo, estilo Duolingo) ----
  const sentenceLesson = (start: number) => {
    for (let k = 0; k < 3; k++) {
      if (!hasS) {
        out.push(mcTo(g(start + k), start + k), transFromW(g(start + k + 1)));
        continue;
      }
      const s = sen(start + k);
      out.push(dragS(s, start * 5 + k));
      out.push(k % 2 === 0 ? transFromS(s) : fillS(s, start + k));
    }
  };

  switch (lessonIndex) {
    case 0: // Palavras novas — primeira metade do vocabulário
      out.push(mcTo(A[0 % A.length], 0), mcFrom(A[1 % A.length], 1), matchEx(rotate(A, 0).slice(0, 4)), transFromW(A[2 % A.length]), listenW(A[3 % A.length]), mcTo(A[4 % A.length], 4), speakW(A[0 % A.length]));
      break;
    case 1: // Mais palavras — segunda metade
      out.push(mcTo(B[0 % B.length], 10), mcFrom(B[1 % B.length], 11), matchEx(rotate(B, 1).slice(0, 4)), transFromW(B[2 % B.length]), listenW(B[3 % B.length]), mcTo(B[4 % B.length], 14));
      break;
    case 2: // Treino rápido — revisão de todo o vocabulário
      out.push(matchEx(rotate(W, 2).slice(0, 4)), mcTo(g(0), 20), mcFrom(g(3), 21), transFromW(g(5)), listenW(g(6)), mcFrom(g(8), 24), matchEx(rotate(W, 5).slice(0, 4)));
      break;
    case 3: // Primeiras frases
      sentenceLesson(0);
      break;
    case 4: // Monte as frases
      sentenceLesson(3);
      break;
    case 5: // Hora de escutar
      out.push(listenW(g(0)), listenW(g(1)));
      if (hasS) out.push(listenS(sen(0)), listenS(sen(1)));
      else out.push(listenW(g(2)), listenW(g(3)));
      out.push(listenW(g(4)), transFromW(g(5)));
      break;
    case 6: // Pratique falando
      out.push(speakW(g(0)));
      out.push(hasS ? dragS(sen(0), 30) : mcTo(g(1), 30));
      out.push(speakW(g(2)));
      out.push(hasS ? transFromS(sen(1)) : transFromW(g(3)));
      out.push(speakW(g(4)), mcFrom(g(5), 34));
      break;
    case 7: // Revisão da unidade — mistura tudo
    default:
      out.push(mcTo(g(0), 40), mcFrom(g(2), 41), matchEx(rotate(W, 5).slice(0, 4)));
      if (hasS) out.push(dragS(sen(0), 42), fillS(sen(1), 43), listenS(sen(2)), transFromS(sen(3)));
      else out.push(transFromW(g(4)), listenW(g(5)), mcTo(g(6), 44));
      out.push(transFromW(g(7)));
      break;
  }

  return out;
}

/** Gera exercícios de uma lição para TODAS as faixas etárias (tagueados por age_group). */
export function buildLessonExercises(
  words: Term[],
  sentences: Sentence[],
  lang: string,
  audioLang: string,
  _lessonType: LessonType,
  _unitIndex: number,
  lessonIndex: number,
  _theme: Theme,
): ExerciseSeed[] {
  const all: ExerciseSeed[] = [];
  for (const age of AGES) {
    all.push(...buildForAge(words, sentences, age, lang, audioLang, lessonIndex));
  }
  return all;
}
