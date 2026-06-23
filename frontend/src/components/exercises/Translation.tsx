import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { compareAnswer } from '@/lib/answer';
import { renderRich } from '@/components/ui/RichText';
import { SpeakerButton } from './SpeakerButton';
import type { ExerciseComponentProps } from './types';

export function Translation({ exercise, checked, onChange }: ExerciseComponentProps) {
  const [value, setValue] = useState('');
  const correct = compareAnswer(value, exercise.correct_answer);
  const speakTarget = exercise.type === 'translation_to' && exercise.audio_lang;

  useEffect(() => {
    onChange({ ready: value.trim().length > 0, correct });
  }, [value, correct, onChange]);

  return (
    <div>
      <h2 className="mb-4 text-xl font-extrabold text-ink">{renderRich(exercise.question)}</h2>
      <textarea
        value={value}
        disabled={checked}
        autoFocus
        rows={3}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Digite sua tradução…"
        className={cn(
          'w-full resize-none rounded-2xl border-2 bg-surface p-4 text-lg font-medium text-ink outline-none',
          checked ? (correct ? 'border-correct' : 'border-wrong') : 'border-edge focus:border-lang-english',
        )}
      />
      {exercise.hints && exercise.hints.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted">
          <span className="font-bold">Dicas:</span>
          {exercise.hints.map((h) => (
            <span key={h} className="rounded-full bg-surface px-2 py-0.5 border border-edge">{renderRich(h)}</span>
          ))}
        </div>
      )}
      {checked && !correct && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-bold text-correct">Resposta:</span>
          <span className="text-ink">{renderRich(exercise.correct_answer)}</span>
          {speakTarget && <SpeakerButton text={exercise.correct_answer} lang={exercise.audio_lang!} size={18} className="p-2" />}
        </div>
      )}
    </div>
  );
}
