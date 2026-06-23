import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { compareAnswer } from '@/lib/answer';
import { renderRich } from '@/components/ui/RichText';
import { SpeakerButton } from './SpeakerButton';
import { useSpeech } from '@/hooks/useSpeech';
import type { ExerciseComponentProps } from './types';

export function ListenType({ exercise, checked, onChange }: ExerciseComponentProps) {
  const [value, setValue] = useState('');
  const { supported } = useSpeech();
  const lang = exercise.audio_lang ?? 'en-US';
  const correct = compareAnswer(value, exercise.correct_answer);

  useEffect(() => {
    onChange({ ready: value.trim().length > 0, correct });
  }, [value, correct, onChange]);

  return (
    <div>
      <h2 className="mb-5 text-xl font-extrabold text-ink">{renderRich(exercise.question)}</h2>

      <div className="mb-5 flex items-center gap-4">
        <SpeakerButton text={exercise.correct_answer} lang={lang} size={36} className="p-5" />
        {!supported && <span className="text-sm text-muted">Áudio não suportado neste navegador.</span>}
      </div>

      <input
        value={value}
        disabled={checked}
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        placeholder="Escreva o que você ouviu…"
        className={cn(
          'w-full rounded-2xl border-2 bg-surface p-4 text-lg font-medium text-ink outline-none',
          checked ? (correct ? 'border-correct' : 'border-wrong') : 'border-edge focus:border-lang-english',
        )}
      />
      {checked && !correct && (
        <p className="mt-3 text-sm">
          <span className="font-bold text-correct">Era: </span>
          <span className="text-ink">{renderRich(exercise.correct_answer)}</span>
        </p>
      )}
    </div>
  );
}
