import type { Exercise } from '@/types';

export interface ExerciseDraft {
  ready: boolean;
  correct: boolean;
}

export interface ExerciseComponentProps {
  exercise: Exercise;
  /** Quando true, o feedback (acerto/erro) deve ser revelado. */
  checked: boolean;
  /** Chamado sempre que a resposta do usuário muda. */
  onChange: (draft: ExerciseDraft) => void;
}
