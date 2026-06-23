import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { renderRich } from '@/components/ui/RichText';
import { SpeakerButton } from './SpeakerButton';
import type { ExerciseComponentProps } from './types';

/** Embaralhamento determinístico por semente (estável entre renders). */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchPairs({ exercise, checked, onChange }: ExerciseComponentProps) {
  const pairs = exercise.pairs ?? [];
  const lefts = useMemo(() => seededShuffle(pairs.map((p) => p.left), exercise.id + 1), [pairs, exercise.id]);
  const rights = useMemo(() => seededShuffle(pairs.map((p) => p.right), exercise.id + 7), [pairs, exercise.id]);
  const rightToLeft = useMemo(() => new Map(pairs.map((p) => [p.right, p.left])), [pairs]);

  const [leftPick, setLeftPick] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const allMatched = matched.size === pairs.length && pairs.length > 0;

  useEffect(() => {
    onChange({ ready: allMatched, correct: allMatched && wrongAttempts === 0 });
  }, [allMatched, wrongAttempts, onChange]);

  function pickRight(right: string) {
    if (!leftPick || matched.has(leftPick)) return;
    if (rightToLeft.get(right) === leftPick) {
      setMatched((m) => new Set(m).add(leftPick));
      setLeftPick(null);
    } else {
      setWrong(right);
      setWrongAttempts((w) => w + 1);
      setTimeout(() => setWrong(null), 500);
    }
  }

  const tile = (active: boolean, done: boolean, isWrong: boolean) =>
    cn(
      'rounded-2xl border-2 px-3 py-4 font-bold text-ink text-center',
      done && 'border-correct bg-correct/15 text-correct opacity-60',
      isWrong && 'border-wrong bg-wrong/15 text-wrong',
      !done && !isWrong && (active ? 'border-lang-english bg-lang-english/10' : 'border-edge bg-surface'),
    );

  return (
    <div>
      <h2 className="mb-5 text-xl font-extrabold text-ink">{renderRich(exercise.question)}</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {lefts.map((l) => (
            <button
              key={l}
              type="button"
              disabled={checked || matched.has(l)}
              onClick={() => setLeftPick(l)}
              className={tile(leftPick === l, matched.has(l), false)}
            >
              {renderRich(l)}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {rights.map((r) => {
            const done = matched.has(rightToLeft.get(r) ?? '');
            return (
              <div key={r} className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={checked || done}
                  onClick={() => pickRight(r)}
                  className={cn(tile(false, done, wrong === r), 'flex-1')}
                >
                  {renderRich(r)}
                </button>
                {exercise.audio_lang && <SpeakerButton text={r} lang={exercise.audio_lang} size={16} className="p-2" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
