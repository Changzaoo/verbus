import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { compareAnswer } from '@/lib/answer';
import { renderRich } from '@/components/ui/RichText';
import { seededShuffle } from '@/lib/shuffle';
import type { ExerciseComponentProps } from './types';

export function FillBlank({ exercise, checked, onChange }: ExerciseComponentProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const options = useMemo(
    () => seededShuffle(exercise.options ?? [], exercise.id + 5),
    [exercise.options, exercise.id],
  );
  const parts = exercise.question.split(/_{2,}/);

  useEffect(() => {
    onChange({ ready: selected !== null, correct: selected != null && compareAnswer(selected, exercise.correct_answer) });
  }, [selected, exercise.correct_answer, onChange]);

  return (
    <div>
      <p className="mb-6 text-xl font-extrabold leading-relaxed text-ink">
        {renderRich(parts[0] ?? '')}
        <span
          className={cn(
            'mx-1 inline-flex min-w-[80px] justify-center rounded-lg border-b-4 px-2 align-middle',
            selected ? 'border-lang-english text-lang-english' : 'border-dashed border-edge text-muted',
          )}
        >
          {selected ?? '_____'}
        </span>
        {renderRich(parts[1] ?? '')}
      </p>

      <div className="flex flex-wrap gap-3">
        {options.map((opt) => {
          const isSel = selected === opt;
          const isCorrect = compareAnswer(opt, exercise.correct_answer);
          let tone = 'border-edge bg-surface';
          if (checked && isSel && isCorrect) tone = 'border-correct bg-correct/15 text-correct';
          else if (checked && isSel && !isCorrect) tone = 'border-wrong bg-wrong/15 text-wrong';
          else if (checked && isCorrect) tone = 'border-correct text-correct';
          else if (isSel) tone = 'border-lang-english bg-lang-english/10';
          return (
            <button
              key={opt}
              type="button"
              disabled={checked}
              onClick={() => setSelected(opt)}
              className={cn('rounded-2xl border-2 px-4 py-3 font-bold text-ink', tone)}
            >
              {renderRich(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
