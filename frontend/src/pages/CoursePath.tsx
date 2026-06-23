import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Lock,
  Star,
  BookOpen,
  Code2,
  MessageCircle,
  Headphones,
  Trophy,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Icon } from '@/components/ui/Icon';
import { LangBadge } from '@/components/ui/LangBadge';
import { Byte } from '@/components/mascot/Byte';
import { Confetti } from '@/components/gamification/Confetti';
import { useSounds } from '@/hooks/useSounds';
import { cn } from '@/lib/cn';
import {
  LEVEL_LABELS,
  type CoursePath,
  type LessonNode,
  type LessonType,
} from '@/types';

const TYPE_ICON: Record<LessonType, typeof BookOpen> = {
  vocabulary: BookOpen,
  grammar: BookOpen,
  conversation: MessageCircle,
  reading: BookOpen,
  code: Code2,
  listening: Headphones,
};

function Node({
  lesson,
  color,
  offset,
  index,
  onClick,
}: {
  lesson: LessonNode;
  color: string;
  offset: number;
  index: number;
  onClick: () => void;
}) {
  const locked = lesson.status === 'locked';
  const completed = lesson.status === 'completed';
  const active = lesson.status === 'active';
  const Icon = lesson.order_index === 8 ? Trophy : TYPE_ICON[lesson.type] ?? BookOpen;

  return (
    <motion.div
      className="flex flex-col items-center"
      style={{ transform: `translateX(${offset}px)` }}
      variants={{
        hidden: { opacity: 0, y: 26, scale: 0.6 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: 'spring', stiffness: 380, damping: 22 },
        },
      }}
    >
      {/* Balão "Começar" flutuando sobre a lição ativa */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: [0, -5, 0], scale: 1 }}
            transition={{
              opacity: { duration: 0.3, delay: 0.2 },
              scale: { type: 'spring', stiffness: 400, damping: 16, delay: 0.2 },
              y: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="relative mb-2 select-none rounded-2xl bg-surface px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-md ring-2"
            style={{ color, boxShadow: '0 6px 18px rgba(0,0,0,0.18)' }}
          >
            <span style={{ color }}>Começar</span>
            <ChevronDown
              size={16}
              className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[3px]"
              style={{ color: 'var(--tw-surface, #fff)' }}
            />
            <span
              className="absolute -inset-px rounded-2xl ring-2"
              style={{ boxShadow: `0 0 0 2px ${color}33` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={locked ? undefined : { scale: 1.1, y: -3 }}
        whileTap={locked ? undefined : { scale: 0.9, y: 2 }}
        disabled={locked}
        onClick={onClick}
        title={lesson.title}
        className={cn(
          'relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-b-[6px] text-white shadow-md',
          locked && 'cursor-not-allowed border-edge bg-edge text-muted',
        )}
        style={
          !locked
            ? {
                backgroundColor: color,
                borderColor: 'rgba(0,0,0,0.25)',
                boxShadow: active
                  ? `0 10px 22px ${color}66, 0 0 0 3px ${color}33`
                  : completed
                  ? `0 8px 18px ${color}40`
                  : `0 6px 14px rgba(0,0,0,0.12)`,
              }
            : undefined
        }
      >
        {/* brilho interno suave no topo do nó */}
        {!locked && (
          <span
            className="pointer-events-none absolute left-1/2 top-1.5 h-5 w-9 -translate-x-1/2 rounded-full bg-white/35 blur-[2px]"
            aria-hidden
          />
        )}

        {/* anel pulsante da lição ativa */}
        {active && (
          <>
            <motion.span
              className="absolute -inset-2 rounded-full border-4"
              style={{ borderColor: color }}
              animate={{ opacity: [0.35, 0.95, 0.35], scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="absolute -inset-2 rounded-full"
              style={{ boxShadow: `0 0 18px 4px ${color}55` }}
              animate={{ opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        {/* faísca decorativa nas concluídas */}
        {completed && (
          <motion.span
            className="absolute -right-1 -top-1 text-warning"
            animate={{ rotate: [0, 18, -10, 0], scale: [1, 1.25, 1] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: (index % 5) * 0.3,
            }}
          >
            <Sparkles size={16} fill="currentColor" />
          </motion.span>
        )}

        <motion.span
          initial={completed ? { scale: 0, rotate: -45 } : false}
          animate={completed ? { scale: 1, rotate: 0 } : {}}
          transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.1 }}
          className="relative"
        >
          {locked ? (
            <Lock size={26} />
          ) : completed ? (
            <Check size={30} strokeWidth={3} />
          ) : (
            <Icon size={28} />
          )}
        </motion.span>
      </motion.button>

      {completed && (
        <div className="mt-1.5 flex gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => {
            const earned = i < lesson.stars;
            return (
              <motion.span
                key={i}
                initial={{ scale: 0, y: -4 }}
                animate={{ scale: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 600,
                  damping: 14,
                  delay: 0.25 + i * 0.08,
                }}
              >
                <motion.span
                  className="block"
                  animate={
                    earned
                      ? { scale: [1, 1.18, 1], rotate: [0, 6, -6, 0] }
                      : {}
                  }
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.25,
                  }}
                >
                  <Star
                    size={13}
                    className={earned ? 'text-warning' : 'text-edge'}
                    fill="currentColor"
                  />
                </motion.span>
              </motion.span>
            );
          })}
        </div>
      )}

      <span className="mt-1 max-w-[110px] text-center text-[11px] font-bold leading-tight text-muted">
        {lesson.title}
      </span>
    </motion.div>
  );
}

export function CoursePathPage() {
  const { langId } = useParams<{ langId: string }>();
  const navigate = useNavigate();
  const { play } = useSounds();
  const [burst, setBurst] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['course-path', langId],
    queryFn: () => api.get<CoursePath>(`/courses/${langId}/path`),
  });

  if (isLoading || !data) return <FullPageSpinner />;

  const offsets = [0, 36, 56, 36, 0, -36, -56, -36];

  const handleLessonClick = (lesson: LessonNode) => {
    if (lesson.status !== 'locked') play('tap');
    navigate(`/lesson/${lesson.id}`, { state: { langId } });
  };

  return (
    <div className="relative pb-14">
      <Confetti burstKey={burst} pieces={70} power={1} originX={50} originY={30} />

      {/* Cabeçalho do curso */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="card relative mb-8 flex items-center gap-4 overflow-hidden p-4"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-brand/10 blur-2xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.button
          type="button"
          onClick={() => {
            play('reward');
            setBurst((b) => b + 1);
          }}
          whileHover={{ scale: 1.08, rotate: -4 }}
          whileTap={{ scale: 0.92 }}
          title="Olá!"
          className="relative -my-2 shrink-0"
        >
          <Byte state="happy" size={66} />
        </motion.button>

        <div className="relative flex-1">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <LangBadge code={data.language.code} color={data.language.color_primary} size={48} />
            </motion.div>
            <h1 className="font-display text-2xl font-extrabold">
              {data.language.name}
            </h1>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-muted"
          >
            <Sparkles size={14} className="text-xp" fill="currentColor" />
            <span className="font-extrabold text-xp">{data.user_xp_in_course}</span>
            XP conquistados neste curso
          </motion.p>
        </div>
      </motion.div>

      <div className="flex flex-col gap-12">
        {data.units.map((unit, unitIdx) => {
          const progress =
            unit.lessons.length > 0
              ? Math.round((unit.completed_lessons / unit.lessons.length) * 100)
              : 0;
          const unitDone = unit.completed_lessons === unit.lessons.length && unit.lessons.length > 0;

          return (
            <motion.section
              key={unit.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            >
              {/* Banner da unidade */}
              <motion.div
                whileHover={unit.unlocked ? { scale: 1.01, y: -2 } : undefined}
                className="relative mb-7 overflow-hidden rounded-3xl px-4 py-4 text-white shadow-btn-sm"
                style={{ backgroundColor: unit.color, opacity: unit.unlocked ? 1 : 0.6 }}
              >
                {/* brilho deslizante */}
                {unit.unlocked && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-white/20 blur-md"
                    initial={{ left: '-40%' }}
                    animate={{ left: ['-40%', '130%'] }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      repeatDelay: 4 + unitIdx,
                      ease: 'easeInOut',
                    }}
                  />
                )}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/15"
                />

                <div className="relative flex items-center gap-3">
                  <motion.span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-2xl shadow-inner"
                    animate={
                      unit.unlocked
                        ? { y: [0, -4, 0], rotate: [0, -4, 4, 0] }
                        : {}
                    }
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: unitIdx * 0.4,
                    }}
                  >
                    <Icon name={unit.icon} size={26} />
                  </motion.span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide opacity-90">
                      {LEVEL_LABELS[unit.level]} · Unidade {unit.order_index}
                      {!unit.unlocked && <Lock size={11} className="opacity-90" />}
                    </div>
                    <div className="truncate text-lg font-extrabold leading-tight">
                      {unit.title}
                    </div>

                    {/* barra de progresso da unidade */}
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/20">
                      <motion.div
                        className="h-full rounded-full bg-white/90"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-center gap-1">
                    <div className="rounded-full bg-black/20 px-2.5 py-1 text-sm font-extrabold tabular-nums">
                      {unit.completed_lessons}/{unit.lessons.length}
                    </div>
                    {unitDone && (
                      <motion.span
                        initial={{ scale: 0, rotate: -30 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 500, damping: 12 }}
                      >
                        <Trophy size={16} className="text-warning" fill="currentColor" />
                      </motion.span>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Trilha de lições com entrada em cascata */}
              <motion.div
                className="flex flex-col items-center gap-7"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
                }}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
              >
                {unit.lessons.map((lesson, i) => (
                  <Node
                    key={lesson.id}
                    lesson={lesson}
                    color={unit.color}
                    index={i}
                    offset={offsets[i % offsets.length]}
                    onClick={() => handleLessonClick(lesson)}
                  />
                ))}
              </motion.div>
            </motion.section>
          );
        })}
      </div>

      {/* Byte celebrando no fim da trilha */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="mt-12 flex flex-col items-center gap-2"
      >
        <Byte state="cheer" size={88} />
        <p className="text-center text-sm font-bold text-muted">
          Continue assim — você está indo muito bem!
        </p>
      </motion.div>
    </div>
  );
}
