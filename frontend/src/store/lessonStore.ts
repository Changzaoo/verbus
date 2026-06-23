import { create } from 'zustand';
import type { Exercise } from '@/types';

export type LessonStatus = 'idle' | 'in_progress' | 'finished';

interface LessonState {
  lessonId: number | null;
  queue: Exercise[];
  doneIds: Set<number>;
  originalCount: number;
  mistakes: number;
  comboCount: number;
  maxCombo: number;
  startedAt: number;
  status: LessonStatus;

  start: (lessonId: number, exercises: Exercise[]) => void;
  answer: (correct: boolean) => void;
  skip: () => void;
  reset: () => void;

  current: () => Exercise | null;
  progress: () => number;
  elapsedSeconds: () => number;
  stars: () => number;
}

export const useLessonStore = create<LessonState>((set, get) => ({
  lessonId: null,
  queue: [],
  doneIds: new Set(),
  originalCount: 0,
  mistakes: 0,
  comboCount: 0,
  maxCombo: 0,
  startedAt: 0,
  status: 'idle',

  start: (lessonId, exercises) =>
    set({
      lessonId,
      queue: exercises,
      doneIds: new Set(),
      originalCount: exercises.length,
      mistakes: 0,
      comboCount: 0,
      maxCombo: 0,
      startedAt: Date.now(),
      status: exercises.length > 0 ? 'in_progress' : 'finished',
    }),

  answer: (correct) => {
    const { queue, doneIds, mistakes, comboCount, maxCombo } = get();
    if (queue.length === 0) return;
    const [head, ...rest] = queue;

    if (correct) {
      const nextDone = new Set(doneIds);
      nextDone.add(head.id);
      const nextQueue = rest;
      const nextCombo = comboCount + 1;
      set({
        queue: nextQueue,
        doneIds: nextDone,
        comboCount: nextCombo,
        maxCombo: Math.max(maxCombo, nextCombo),
        status: nextQueue.length === 0 ? 'finished' : 'in_progress',
      });
    } else {
      // Reinsere o exercício no fim para ser refeito.
      set({ queue: [...rest, head], mistakes: mistakes + 1, comboCount: 0 });
    }
  },

  skip: () => {
    const { queue, doneIds } = get();
    if (queue.length === 0) return;
    const [head, ...rest] = queue;
    const nextDone = new Set(doneIds);
    nextDone.add(head.id);
    set({
      queue: rest,
      doneIds: nextDone,
      comboCount: 0,
      status: rest.length === 0 ? 'finished' : 'in_progress',
    });
  },

  reset: () =>
    set({
      lessonId: null,
      queue: [],
      doneIds: new Set(),
      originalCount: 0,
      mistakes: 0,
      comboCount: 0,
      startedAt: 0,
      status: 'idle',
    }),

  current: () => get().queue[0] ?? null,
  progress: () => {
    const { doneIds, originalCount } = get();
    return originalCount === 0 ? 0 : doneIds.size / originalCount;
  },
  elapsedSeconds: () => {
    const { startedAt } = get();
    return startedAt === 0 ? 0 : Math.round((Date.now() - startedAt) / 1000);
  },
  stars: () => {
    const { mistakes } = get();
    if (mistakes === 0) return 3;
    if (mistakes <= 2) return 2;
    return 1;
  },
}));
