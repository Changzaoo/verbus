import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, AlertCircle, Flame } from 'lucide-react';
import { api } from '@/lib/api';
import { useLessonStore } from '@/store/lessonStore';
import { useProgressStore } from '@/store/progressStore';
import { useSounds } from '@/hooks/useSounds';
import { ExerciseRenderer } from '@/components/exercises/ExerciseRenderer';
import type { ExerciseDraft } from '@/components/exercises/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { renderRich } from '@/components/ui/RichText';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Tuca, randomPositiveState, type ByteState } from '@/components/mascot/Tuca';
import { Confetti } from '@/components/gamification/Confetti';
import { LessonResults } from './LessonResults';
import type { CompleteLessonResponse, Exercise, Lesson } from '@/types';

const PRAISE = ['Mandou bem!', 'Show!', 'Perfeito!', 'Arrasou!', 'Isso aí!', 'Excelente!'];

export function LessonFlow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { play } = useSounds();
  const applyComplete = useProgressStore((s) => s.applyComplete);

  const store = useLessonStore();
  const langId = (location.state as { langId?: string } | null)?.langId;

  const [lesson, setLesson] = useState<(Lesson & { exercises: Exercise[] }) | null>(null);
  const [checked, setChecked] = useState(false);
  const [draft, setDraft] = useState<ExerciseDraft>({ ready: false, correct: false });
  const [byteState, setByteState] = useState<ByteState>('idle');
  const [confettiKey, setConfettiKey] = useState(0);
  const [comboPop, setComboPop] = useState(0);
  const [praise, setPraise] = useState(PRAISE[0]);
  const [quitOpen, setQuitOpen] = useState(false);
  const [result, setResult] = useState<CompleteLessonResponse | null>(null);

  const recorded = useRef<Set<number>>(new Set());
  const startedRef = useRef(false);
  const completingRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    api.get<Lesson & { exercises: Exercise[] }>(`/lessons/${id}`).then((l) => setLesson(l));
  }, [id]);

  useEffect(() => {
    if (lesson && !startedRef.current && lesson.exercises.length > 0) {
      startedRef.current = true;
      store.start(lesson.id, lesson.exercises);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson]);

  useEffect(() => {
    if (store.status === 'finished' && lesson && !completingRef.current && !result) {
      completingRef.current = true;
      const payload = {
        stars: store.stars(),
        mistakes: store.mistakes,
        time_seconds: store.elapsedSeconds(),
        max_combo: store.maxCombo,
      };
      play('complete');
      api.post<CompleteLessonResponse>(`/lessons/${lesson.id}/complete`, payload).then((res) => {
        applyComplete(res);
        setResult(res);
        queryClient.invalidateQueries();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.status]);

  if (!lesson) return <FullPageSpinner />;

  if (lesson.exercises.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center text-ink">
        <Tuca state="sleep" size={140} />
        <h1 className="font-display text-2xl font-extrabold">Conteúdo em breve!</h1>
        <p className="max-w-sm text-muted">
          As lições deste idioma para a sua faixa etária ainda estão sendo preparadas. Tente outro idioma por enquanto.
        </p>
        <Button size="lg" onClick={() => navigate(langId ? `/app/course/${langId}` : '/app')}>
          Voltar
        </Button>
      </div>
    );
  }

  if (result) {
    const accuracy = store.originalCount / (store.originalCount + store.mistakes || 1);
    return (
      <LessonResults
        result={result}
        stars={store.stars()}
        accuracy={accuracy}
        seconds={store.elapsedSeconds()}
        maxCombo={store.maxCombo}
        onContinue={() => {
          store.reset();
          navigate(langId ? `/app/course/${langId}` : '/app');
        }}
      />
    );
  }

  const current = store.current();
  if (!current) return <FullPageSpinner />;

  function handleCheck() {
    if (!draft.ready || checked) return;
    setChecked(true);
    const ex = current!;
    if (!recorded.current.has(ex.id)) {
      recorded.current.add(ex.id);
      api.post('/vocabulary/answer', { exercise_id: ex.id, correct: draft.correct }).catch(() => {});
    }
    if (draft.correct) {
      const projected = store.comboCount + 1;
      setPraise(PRAISE[projected % PRAISE.length]);
      setByteState(randomPositiveState(projected));
      setConfettiKey((k) => k + 1);
      play('correct');
      if (projected >= 3) {
        setComboPop(projected);
        play('combo');
      }
    } else {
      setByteState('sad');
      play('wrong');
    }
  }

  function handleContinue() {
    store.answer(draft.correct);
    setChecked(false);
    setDraft({ ready: false, correct: false });
    setByteState('idle');
    setComboPop(0);
  }

  function handleSkip() {
    store.skip();
    setChecked(false);
    setDraft({ ready: false, correct: false });
    setByteState('idle');
    setComboPop(0);
    play('tap');
  }

  const feedbackTone = draft.correct ? 'bg-correct/15 text-correct' : 'bg-wrong/15 text-wrong';
  const comboPower = comboPop >= 10 ? 1.6 : comboPop >= 5 ? 1.2 : 1;
  const isAudioExercise = current.type === 'speak' || current.type === 'listen_type';

  return (
    <div className="relative flex min-h-screen flex-col bg-canvas text-ink">
      <Confetti burstKey={confettiKey} pieces={comboPop >= 5 ? 90 : 50} power={comboPower} />

      {/* Top bar (sem vidas) */}
      <div className="flex items-center gap-3 px-4 py-3 md:px-8">
        <button onClick={() => setQuitOpen(true)} aria-label="Sair" className="text-muted hover:text-ink">
          <X size={26} />
        </button>
        <div className="flex-1">
          <ProgressBar value={store.progress()} />
        </div>
        {store.comboCount >= 2 && (
          <motion.span
            key={store.comboCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="pill bg-streak/15 font-extrabold text-streak"
          >
            <Flame size={14} fill="currentColor" /> {store.comboCount}
          </motion.span>
        )}
      </div>

      {/* Tuca reagindo (animação diferente a cada etapa) */}
      <div className="relative mx-auto -mb-2 mt-1 flex w-full max-w-2xl justify-center">
        <Tuca state={byteState} size={92} />
        <AnimatePresence>
          {comboPop >= 3 && (
            <motion.div
              initial={{ scale: 0, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: -6, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -right-1 top-0 rounded-full bg-streak px-3 py-1 text-sm font-black text-white shadow-btn-sm"
            >
              COMBO x{comboPop}!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exercício */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.id}-${store.queue.length}`}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ExerciseRenderer exercise={current} checked={checked} onChange={setDraft} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className={cnFooter(checked, draft.correct)}>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
          {checked && (
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`flex items-center gap-2 rounded-xl p-3 font-bold ${feedbackTone}`}
            >
              {draft.correct ? <Check size={22} /> : <AlertCircle size={22} />}
              <div className="flex-1">
                <div>{draft.correct ? praise : 'Quase lá…'}</div>
                {current.explanation && (
                  <div className="text-sm font-normal opacity-90">{renderRich(current.explanation)}</div>
                )}
              </div>
            </motion.div>
          )}
          {!checked ? (
            <>
              <Button size="lg" fullWidth disabled={!draft.ready} onClick={handleCheck}>
                Verificar
              </Button>
              <button
                type="button"
                onClick={handleSkip}
                className="mx-auto mt-1 text-sm font-bold uppercase tracking-wide text-muted hover:text-ink"
              >
                {isAudioExercise ? 'Não consigo ouvir/falar — Pular' : 'Pular'}
              </button>
            </>
          ) : (
            <Button size="lg" fullWidth variant={draft.correct ? 'primary' : 'danger'} onClick={handleContinue}>
              Continuar
            </Button>
          )}
        </div>
      </div>

      <Modal open={quitOpen} onClose={() => setQuitOpen(false)} title="Sair da lição?">
        <p className="mb-4 text-muted">Seu progresso nesta lição será perdido.</p>
        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={() => setQuitOpen(false)}>Voltar</Button>
          <Button variant="danger" fullWidth onClick={() => { store.reset(); navigate(langId ? `/app/course/${langId}` : '/app'); }}>
            Sair
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function cnFooter(checked: boolean, correct: boolean): string {
  const base = 'sticky bottom-0 border-t-2 px-4 py-4 md:px-8 ';
  if (!checked) return base + 'border-edge bg-surface';
  return base + (correct ? 'border-correct/40 bg-correct/5' : 'border-wrong/40 bg-wrong/5');
}
