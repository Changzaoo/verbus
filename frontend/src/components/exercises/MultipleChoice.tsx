import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { compareAnswer } from '@/lib/answer';
import { renderRich } from '@/components/ui/RichText';
import { seededShuffle } from '@/lib/shuffle';
import { SpeakerButton } from './SpeakerButton';
import type { ExerciseComponentProps } from './types';

export function MultipleChoice({ exercise, checked, onChange }: ExerciseComponentProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const options = useMemo(
    () => seededShuffle(exercise.options ?? [], exercise.id + 3),
    [exercise.options, exercise.id],
  );

  useEffect(() => {
    onChange({ ready: selected !== null, correct: selected != null && compareAnswer(selected, exercise.correct_answer) });
  }, [selected, exercise.correct_answer, onChange]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        {exercise.audio_lang && <SpeakerButton text={exercise.correct_answer} lang={exercise.audio_lang} />}
        <h2 className="text-xl font-extrabold text-ink">{renderRich(exercise.question)}</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const isSel = selected === opt;
          const isCorrect = compareAnswer(opt, exercise.correct_answer);
          let tone = 'border-edge bg-surface hover:border-lang-english';
          if (checked && isSel && isCorrect) tone = 'border-correct bg-correct/15 text-correct';
          else if (checked && isSel && !isCorrect) tone = 'border-wrong bg-wrong/15 text-wrong';
          else if (checked && isCorrect) tone = 'border-correct bg-correct/10 text-correct';
          else if (isSel) tone = 'border-lang-english bg-lang-english/10';
          return (
            <button
              key={opt}
              type="button"
              disabled={checked}
              onClick={() => setSelected(opt)}
              className={cn(
                'rounded-2xl border-2 px-4 py-4 text-left font-bold text-ink transition-colors',
                tone,
              )}
            >
              {renderRich(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
