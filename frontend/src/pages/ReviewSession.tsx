import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle, Brain, Sparkles, Zap, RotateCcw, Target, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useSounds } from '@/hooks/useSounds';
import { useProgressStore } from '@/store/progressStore';
import { ExerciseRenderer } from '@/components/exercises/ExerciseRenderer';
import { renderRich } from '@/components/ui/RichText';
import type { ExerciseDraft } from '@/components/exercises/types';
import { Byte, randomPositiveState, type ByteState } from '@/components/mascot/Byte';
import { Confetti } from '@/components/gamification/Confetti';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import type { Exercise, UserProfile } from '@/types';

export function ReviewSession() {
  const { play } = useSounds();
  const navigate = useNavigate();
  const setProfile = useProgressStore((s) => s.setProfile);
  const { data: due, isLoading, refetch } = useQuery({
    queryKey: ['vocab-due'],
    queryFn: () => api.get<Exercise[]>('/vocabulary/due?limit=15'),
  });

  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState(false);
  const [draft, setDraft] = useState<ExerciseDraft>({ ready: false, correct: false });
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [byteState, setByteState] = useState<ByteState>('idle');
  const [burst, setBurst] = useState(0);
  const [winBurst, setWinBurst] = useState(0);
  const awarded = useRef(false);
  const wonRef = useRef(false);

  useEffect(() => {
    if (finished && !awarded.current && correctCount > 0) {
      awarded.current = true;
      api
        .post<{ profile: UserProfile }>('/xp/add', { amount: correctCount * 2 + 3, source: 'practice' })
        .then((r) => setProfile(r.profile))
        .catch(() => {});
    }
  }, [finished, correctCount, setProfile]);

  useEffect(() => {
    if (finished && !wonRef.current) {
      wonRef.current = true;
      const accuracy = due && due.length > 0 ? correctCount / due.length : 0;
      setWinBurst((k) => k + 1);
      play('complete');
      if (accuracy >= 0.8) {
        window.setTimeout(() => {
          setWinBurst((k) => k + 1);
          play('reward');
        }, 420);
      }
    }
  }, [finished, correctCount, due, play]);

  if (isLoading) return <FullPageSpinner />;

  if (!due || due.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center gap-3 py-16 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Byte state="sleep" size={150} />
        <h1 className="text-2xl font-extrabold">Nada para revisar agora!</h1>
        <p className="max-w-sm text-muted">
          Complete lições para alimentar sua revisão espaçada <span className="font-bold text-brand">(SRS)</span>.
        </p>
        <Button variant="secondary" onClick={() => navigate('/app/practice')} className="mt-2 flex items-center gap-2">
          <ArrowLeft size={18} /> Voltar
        </Button>
      </motion.div>
    );
  }

  if (finished) {
    const xpGained = correctCount * 2 + 3;
    const accuracy = correctCount / due.length;
    const perfect = correctCount === due.length;
    const finalByte: ByteState = accuracy >= 0.8 ? 'levelup' : accuracy >= 0.5 ? 'celebrate' : 'happy';

    return (
      <>
        <Confetti burstKey={winBurst} pieces={perfect ? 90 : 64} power={perfect ? 1.25 : 1} originX={50} originY={32} />
        <motion.div className="flex flex-col items-center gap-4 py-12 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <div className="relative">
            <motion.div aria-hidden className="absolute inset-0 -z-10 rounded-full bg-brand/25 blur-2xl" animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
            <Byte state={finalByte} size={156} />
          </div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold">
            <Brain className="text-brand" size={28} />
            {perfect ? 'Revisão perfeita!' : 'Revisão concluída!'}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <StatPill icon={<Target size={16} />} label="Acertos" value={`${correctCount}/${due.length}`} tone="correct" />
            <StatPill icon={<Sparkles size={16} />} label="Precisão" value={`${Math.round(accuracy * 100)}%`} tone="brand" />
            <StatPill icon={<Zap size={16} />} label="XP" value={`+${xpGained}`} tone="xp" />
          </div>
          <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
            <Button
              fullWidth
              size="lg"
              className="flex items-center justify-center gap-2"
              onClick={() => {
                play('tap');
                setIndex(0);
                setFinished(false);
                setCorrectCount(0);
                setChecked(false);
                setDraft({ ready: false, correct: false });
                setByteState('idle');
                awarded.current = false;
                wonRef.current = false;
                refetch();
              }}
            >
              <RotateCcw size={18} /> Revisar mais
            </Button>
            <Button variant="secondary" fullWidth onClick={() => navigate('/app/practice')}>Voltar ao hub</Button>
          </div>
        </motion.div>
      </>
    );
  }

  const current = due[index];

  function check() {
    if (!draft.ready || checked) return;
    setChecked(true);
    if (draft.correct) {
      play('correct');
      setCorrectCount((c) => c + 1);
      setByteState(randomPositiveState(index + correctCount + 1));
      setBurst((k) => k + 1);
    } else {
      play('wrong');
      setByteState('sad');
    }
    api.post('/vocabulary/answer', { exercise_id: current.id, correct: draft.correct }).catch(() => {});
  }

  function next() {
    setChecked(false);
    setDraft({ ready: false, correct: false });
    setByteState('idle');
    if (index + 1 >= due!.length) setFinished(true);
    else setIndex((i) => i + 1);
  }

  return (
    <>
      <Confetti burstKey={burst} pieces={36} power={0.7} originX={50} originY={30} />
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <motion.div className="shrink-0" animate={{ scale: checked ? [1, 1.12, 1] : 1 }} transition={{ duration: 0.4 }}>
            <Byte state={byteState} size={56} />
          </motion.div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-extrabold text-brand">
                <Brain size={16} /> Revisão SRS
              </span>
              <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-bold text-muted ring-1 ring-edge">
                {index + 1}/{due.length}
              </span>
            </div>
            <ProgressBar value={index / due.length} height={14} />
          </div>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              className={cn('card relative overflow-hidden', checked && draft.correct && 'ring-2 ring-correct/50', checked && !draft.correct && 'ring-2 ring-wrong/50 animate-shake')}
              initial={{ opacity: 0, x: 36, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -36, scale: 0.98 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <ExerciseRenderer key={current.id} exercise={current} checked={checked} onChange={setDraft} />
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {checked && (
            <motion.div
              key={draft.correct ? 'ok' : 'no'}
              className={cn('flex items-center gap-2 rounded-xl p-3 font-bold', draft.correct ? 'bg-correct/15 text-correct' : 'bg-wrong/15 text-wrong')}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
            >
              {draft.correct ? <Check size={20} /> : <AlertCircle size={20} />}
              <span>{draft.correct ? 'Correto!' : <>Resposta: {renderRich(current.correct_answer)}</>}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {!checked ? (
          <Button size="lg" fullWidth disabled={!draft.ready} onClick={check}>Verificar</Button>
        ) : (
          <Button size="lg" fullWidth variant={draft.correct ? 'primary' : 'danger'} onClick={next}>Continuar</Button>
        )}
      </div>
    </>
  );
}

function StatPill({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'correct' | 'brand' | 'xp' }) {
  const toneCls: Record<typeof tone, string> = { correct: 'text-correct', brand: 'text-brand', xp: 'text-xp' };
  return (
    <div className="flex min-w-[96px] flex-col items-center gap-0.5 rounded-2xl bg-surface px-4 py-3 ring-1 ring-edge">
      <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted">
        <span className={toneCls[tone]}>{icon}</span>
        {label}
      </span>
      <span className={cn('text-xl font-extrabold tabular-nums', toneCls[tone])}>{value}</span>
    </div>
  );
}
