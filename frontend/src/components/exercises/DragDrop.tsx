import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { compareAnswer } from '@/lib/answer';
import { renderRich } from '@/components/ui/RichText';
import { seededShuffle } from '@/lib/shuffle';
import type { ExerciseComponentProps } from './types';

export function DragDrop({ exercise, checked, onChange }: ExerciseComponentProps) {
  const tiles = useMemo(
    () => (exercise.options ?? exercise.correct_answer.split(' ')).map((word, idx) => ({ word, idx })),
    [exercise.options, exercise.correct_answer],
  );

  // Ordem embaralhada do banco — nunca igual à ordem correta.
  const bankOrder = useMemo(() => {
    const idxs = tiles.map((t) => t.idx);
    const correctSeq = exercise.correct_answer.split(' ').join('|');
    let seed = exercise.id + 11;
    let order = seededShuffle(idxs, seed);
    let tries = 0;
    while (tries < 6 && order.map((i) => tiles[i].word).join('|') === correctSeq) {
      seed += 17;
      order = seededShuffle(idxs, seed);
      tries++;
    }
    return order;
  }, [tiles, exercise.correct_answer, exercise.id]);

  const [placed, setPlaced] = useState<number[]>([]);

  const assembled = placed.map((i) => tiles[i].word).join(' ');
  const correct = compareAnswer(assembled, exercise.correct_answer);

  useEffect(() => {
    onChange({ ready: placed.length > 0, correct });
  }, [placed, correct, onChange]);

  const bank = bankOrder.filter((i) => !placed.includes(i));

  return (
    <div>
      <h2 className="mb-5 text-xl font-extrabold text-ink">{renderRich(exercise.question)}</h2>

      {/* área de montagem */}
      <div
        className={cn(
          'mb-5 flex min-h-[64px] flex-wrap items-start gap-2 rounded-2xl border-2 border-dashed p-3',
          checked ? (correct ? 'border-correct' : 'border-wrong') : 'border-edge',
        )}
      >
        {placed.map((i, pos) => (
          <button
            key={`${i}-${pos}`}
            type="button"
            disabled={checked}
            onClick={() => setPlaced((p) => p.filter((_, k) => k !== pos))}
            className="rounded-xl border-2 border-edge bg-surface px-3 py-2 font-bold text-ink shadow-btn-sm"
          >
            {tiles[i].word}
          </button>
        ))}
      </div>

      {/* banco de palavras (embaralhado) */}
      <div className="flex flex-wrap gap-2">
        {bank.map((i) => (
          <button
            key={i}
            type="button"
            disabled={checked}
            onClick={() => setPlaced((p) => [...p, i])}
            className="rounded-xl border-2 border-edge bg-surface px-3 py-2 font-bold text-ink shadow-btn-sm active:translate-y-[2px]"
          >
            {tiles[i].word}
          </button>
        ))}
      </div>

      {checked && !correct && (
        <p className="mt-4 text-sm">
          <span className="font-bold text-correct">Correto: </span>
          <span className="text-ink">{renderRich(exercise.correct_answer)}</span>
        </p>
      )}
    </div>
  );
}
