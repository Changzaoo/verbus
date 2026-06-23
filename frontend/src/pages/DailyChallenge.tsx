import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, Check, AlertCircle, Gem, Trophy, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useProgressStore } from '@/store/progressStore';
import { useSounds } from '@/hooks/useSounds';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Byte } from '@/components/mascot/Byte';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Confetti } from '@/components/gamification/Confetti';
import { ExerciseRenderer } from '@/components/exercises/ExerciseRenderer';
import { renderRich } from '@/components/ui/RichText';
import { cn } from '@/lib/cn';
import type { ExerciseDraft } from '@/components/exercises/types';
import type { CoursePath, DailyChallenge as DC, Exercise, UserProfile } from '@/types';

export function DailyChallengePage() {
  const { play } = useSounds();
  const setProfile = useProgressStore((s) => s.setProfile);
  const { data: challenge, refetch } = useQuery({ queryKey: ['daily'], queryFn: () => api.get<DC>('/daily/challenge') });

  const { data: path } = useQuery({
    queryKey: ['daily-path', challenge?.language_id],
    enabled: !!challenge,
    queryFn: () => api.get<CoursePath>(`/courses/${challenge!.language_id}/path`),
  });

  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState(false);
  const [draft, setDraft] = useState<ExerciseDraft>({ ready: false, correct: false });
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [burst, setBurst] = useState(0);

  async function start() {
    if (!path) return;
    play('tap');
    const lessons = path.units.flatMap((u) => u.lessons);
    const idx = new Date().getDate() % Math.max(1, lessons.length);
    const lessonId = lessons[idx]?.id ?? lessons[0]?.id;
    if (!lessonId) return;
    const ex = await api.get<Exercise[]>(`/exercises/lesson/${lessonId}`);
    setExercises(ex.slice(0, 5));
    setIndex(0);
    setScore(0);
    setDone(false);
  }

  async function finish(finalScore: number) {
    if (!challenge) return;
    setBusy(true);
    try {
      const res = await api.post<{ profile: UserProfile }>('/daily/complete', { challenge_id: challenge.id, score: finalScore });
      setProfile(res.profile);
      play('reward');
    } catch { /* já concluído */ }
    setBusy(false);
    setDone(true);
    setBurst((b) => b + 1);
    refetch();
  }

  if (!challenge) return null;

  // Estado: já concluído hoje
  if (challenge.completed && !exercises) {
    return (
      <motion.div
        className="relative flex flex-col items-center gap-4 py-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        >
          <Byte state="happy" size={140} />
        </motion.div>
        <motion.div
          className="flex items-center gap-2 rounded-full border border-correct/30 bg-correct/10 px-4 py-1.5 text-sm font-bold text-correct"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 14 }}
        >
          <Check size={16} /> Concluído hoje
        </motion.div>
        <motion.h1
          className="font-display text-2xl font-extrabold text-ink"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          Desafio de hoje concluído!
        </motion.h1>
        <motion.p
          className="flex items-center gap-1.5 text-muted"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
        >
          <Calendar size={16} /> Volte amanhã para um novo desafio relâmpago.
        </motion.p>
      </motion.div>
    );
  }

  // Tela inicial
  if (!exercises) {
    return (
      <motion.div
        className="relative flex flex-col items-center gap-5 overflow-hidden py-10 text-center"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }}
      >
        {/* Halo de fundo pulsante */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-16 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-xp/20 blur-3xl"
          animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Mascote + raio pulsante */}
        <motion.div
          className="relative"
          variants={{ hidden: { opacity: 0, scale: 0.7, y: 24 }, show: { opacity: 1, scale: 1, y: 0 } }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Byte state="excited" size={132} />
          <motion.div
            className="absolute -right-3 -top-2 grid h-14 w-14 place-items-center rounded-full bg-xp text-canvas shadow-lg shadow-xp/40"
            animate={{ scale: [1, 1.18, 1], rotate: [-6, 6, -6] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Zap size={26} fill="currentColor" />
          </motion.div>
          {/* Faíscas orbitando */}
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute left-1/2 top-1/2 text-xp"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                x: [0, (i - 1) * 50, (i - 1) * 70],
                y: [0, -40 - i * 14, -70 - i * 18],
              }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
            >
              <Sparkles size={14} fill="currentColor" />
            </motion.span>
          ))}
        </motion.div>

        <motion.span
          className="pill bg-xp/15 text-xp"
          variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
        >
          <Zap size={14} fill="currentColor" /> Desafio relâmpago
        </motion.span>

        <motion.h1
          className="font-display text-3xl font-extrabold text-ink"
          variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
        >
          {challenge.title}
        </motion.h1>

        <motion.p
          className="max-w-sm text-muted"
          variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
        >
          {challenge.description}
        </motion.p>

        <motion.div
          className="flex gap-2.5"
          variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
        >
          <motion.span
            className="pill bg-xp/15 text-xp"
            whileHover={{ scale: 1.08, y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          >
            <Zap size={14} fill="currentColor" /> +{challenge.xp_reward} XP
          </motion.span>
          <motion.span
            className="pill bg-gems/15 text-gems"
            whileHover={{ scale: 1.08, y: -2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          >
            <Gem size={14} fill="currentColor" /> +{challenge.gem_reward}
          </motion.span>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 14 }}
        >
          <Button size="lg" disabled={!path} onClick={start}>
            {path ? 'Começar desafio' : 'Carregando…'}
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  // Resultado
  if (done) {
    const total = exercises.length;
    const perfect = score === total;
    return (
      <motion.div
        className="relative flex flex-col items-center gap-4 py-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Confetti burstKey={burst} pieces={perfect ? 90 : 60} power={perfect ? 1.2 : 1} originX={50} originY={34} />

        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-12 -z-10 h-60 w-60 -translate-x-1/2 rounded-full bg-xp/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 13 }}
        >
          <Byte state="celebrate" size={150} />
        </motion.div>

        <motion.h1
          className="flex items-center gap-2 font-display text-2xl font-extrabold text-ink"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Desafio completo!
          <motion.span
            animate={{ rotate: [-12, 12, -12] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-xp"
          >
            <Zap size={26} fill="currentColor" />
          </motion.span>
        </motion.h1>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-2.5"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
        >
          <span className={cn('pill', perfect ? 'bg-correct/15 text-correct' : 'bg-surface text-ink')}>
            <Trophy size={14} /> {score}/{total} corretas
          </span>
          <span className="pill bg-xp/15 text-xp">
            <Zap size={14} fill="currentColor" /> +{challenge.xp_reward} XP
          </span>
          <span className="pill bg-gems/15 text-gems">
            <Gem size={14} fill="currentColor" /> +{challenge.gem_reward}
          </span>
        </motion.div>

        {perfect && (
          <motion.p
            className="text-sm font-bold text-correct"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 12 }}
          >
            Perfeito! Você acertou tudo.
          </motion.p>
        )}
      </motion.div>
    );
  }

  const current = exercises[index];

  function check() {
    if (!draft.ready || checked) return;
    setChecked(true);
    if (draft.correct) { play('correct'); setScore((s) => s + 1); } else play('wrong');
  }
  function next() {
    setChecked(false);
    setDraft({ ready: false, correct: false });
    if (index + 1 >= exercises!.length) finish(draft.correct ? score + 0 : score);
    else setIndex((i) => i + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho do quiz: progresso + contador */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <motion.div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-xp/15 text-xp"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Zap size={18} fill="currentColor" />
        </motion.div>
        <div className="flex-1">
          <ProgressBar value={index / exercises.length} color="#FF9600" />
        </div>
        <span className="pill shrink-0 bg-surface text-xs text-muted">
          {index + 1}/{exercises.length}
        </span>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        >
          <Card>
            <ExerciseRenderer key={current.id} exercise={current} checked={checked} onChange={setDraft} />
          </Card>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {checked && (
          <motion.div
            className={cn(
              'flex items-center gap-2 rounded-xl p-3 font-bold',
              draft.correct ? 'bg-correct/15 text-correct' : 'bg-wrong/15 text-wrong',
            )}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          >
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.05 }}
            >
              {draft.correct ? <Check size={20} /> : <AlertCircle size={20} />}
            </motion.span>
            {draft.correct ? 'Correto!' : <>Resposta: {renderRich(current.correct_answer)}</>}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
        {!checked ? (
          <Button size="lg" fullWidth disabled={!draft.ready} onClick={check}>Verificar</Button>
        ) : (
          <Button size="lg" fullWidth variant={draft.correct ? 'primary' : 'danger'} disabled={busy} onClick={next}>
            <span className="inline-flex items-center justify-center gap-1.5">
              Continuar <ArrowRight size={18} />
            </span>
          </Button>
        )}
      </motion.div>
    </div>
  );
}
