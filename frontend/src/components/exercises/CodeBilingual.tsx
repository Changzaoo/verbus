import { useEffect, useMemo, useState } from 'react';
import { Code2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { renderRich } from '@/components/ui/RichText';
import type { ExerciseComponentProps } from './types';

const isComment = (l: string) => /^\s*(#|\/\/|--|\/\*|\*)/.test(l);

/** Gera versões incorretas plausíveis do código traduzido para múltipla escolha. */
function buildOptions(code: string | null, answer: string): string[] {
  const correct = answer;
  const correctLines = answer.split('\n');
  const origLines = (code ?? '').split('\n');
  const commentIdx = correctLines.map((l, i) => (isComment(l) ? i : -1)).filter((i) => i >= 0);

  const distractors: string[] = [];

  if (commentIdx.length >= 2) {
    const swap = [...correctLines];
    const [a, b] = commentIdx;
    [swap[a], swap[b]] = [swap[b], swap[a]];
    distractors.push(swap.join('\n'));
  }
  if (code && origLines.length === correctLines.length && commentIdx.length >= 1) {
    const mixed = [...correctLines];
    const i = commentIdx[commentIdx.length - 1];
    mixed[i] = origLines[i]; // deixa um comentário sem traduzir
    distractors.push(mixed.join('\n'));
  }
  if (code) distractors.push(code); // versão original (não traduzida)

  const unique = Array.from(new Set(distractors)).filter((d) => d !== correct).slice(0, 3);
  while (unique.length < 2) {
    unique.push(correct.replace(/\n/, '\n  // ???\n'));
  }
  const options = [correct, ...unique.slice(0, 3)];

  // embaralhamento estável
  let s = (code?.length ?? 7) + answer.length;
  for (let i = options.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

export function CodeBilingual({ exercise, checked, onChange }: ExerciseComponentProps) {
  const options = useMemo(
    () => buildOptions(exercise.code, exercise.correct_answer),
    [exercise.code, exercise.correct_answer],
  );
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    onChange({ ready: selected !== null, correct: selected === exercise.correct_answer });
  }, [selected, exercise.correct_answer, onChange]);

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink">
        <Code2 size={22} className="text-lang-japanese" /> {renderRich(exercise.question)}
      </h2>

      {exercise.code && (
        <pre className="mb-4 overflow-x-auto rounded-2xl bg-[#0B2027] p-4 font-code text-sm text-[#7EE787]">
          <code>{exercise.code}</code>
        </pre>
      )}

      <p className="mb-2 text-sm font-bold text-muted">Escolha a versão com os comentários traduzidos corretamente:</p>
      <div className="grid gap-3">
        {options.map((opt, i) => {
          const isSel = selected === opt;
          const isCorrect = opt === exercise.correct_answer;
          let tone = 'border-edge';
          if (checked && isCorrect) tone = 'border-correct';
          else if (checked && isSel && !isCorrect) tone = 'border-wrong';
          else if (isSel) tone = 'border-lang-english';
          return (
            <button
              key={i}
              type="button"
              disabled={checked}
              onClick={() => setSelected(opt)}
              className={cn('overflow-x-auto rounded-2xl border-2 bg-[#0B2027] p-3 text-left', tone)}
            >
              <pre className="font-code text-xs text-[#7EE787]"><code>{opt}</code></pre>
            </button>
          );
        })}
      </div>
    </div>
  );
}
