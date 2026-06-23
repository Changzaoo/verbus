import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flame, Trophy, Zap, Calendar, LogOut, Sparkles, Award } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate, type Variants } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { AchievementBadge } from '@/components/gamification/AchievementBadge';
import { Confetti } from '@/components/gamification/Confetti';
import { Byte, type ByteState } from '@/components/mascot/Byte';
import { useSounds } from '@/hooks/useSounds';
import { cn } from '@/lib/cn';
import type { AchievementWithStatus } from '@/types';

/* -------------------------------------------------------------------------- */
/* Contador animado (count-up)                                                */
/* -------------------------------------------------------------------------- */
function CountUp({ value, duration = 1.1 }: { value: number; duration?: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString('pt-BR'));
  useEffect(() => {
    const controls = animate(mv, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [value, duration, mv]);
  return <motion.span>{rounded}</motion.span>;
}

/* -------------------------------------------------------------------------- */
/* Cartão de estatística                                                       */
/* -------------------------------------------------------------------------- */
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 320, damping: 22 },
  },
};

function StatCard({
  icon: Icon,
  value,
  label,
  color,
  glow,
}: {
  icon: typeof Zap;
  value: number;
  label: string;
  color: string;
  glow: string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
    >
      <Card className="relative flex items-center gap-3 overflow-hidden">
        {/* brilho de fundo */}
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl"
          style={{ background: glow, opacity: 0.25 }}
        />
        <motion.div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
          style={{ background: `${color}1f` }}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon size={24} style={{ color }} />
        </motion.div>
        <div className="relative min-w-0">
          <div className="text-xl font-black tabular-nums" style={{ color }}>
            <CountUp value={value} />
          </div>
          <div className="truncate text-xs font-bold text-muted">{label}</div>
        </div>
      </Card>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Heatmap de atividade                                                        */
/* -------------------------------------------------------------------------- */
function Heatmap({ data }: { data: { day: string; xp: number }[] }) {
  const map = useMemo(() => new Map(data.map((d) => [d.day, d.xp])), [data]);
  const days = useMemo(() => {
    const out: { date: string; xp: number }[] = [];
    const today = new Date();
    for (let i = 118; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ date: key, xp: map.get(key) ?? 0 });
    }
    return out;
  }, [map]);

  const level = (xp: number) =>
    xp === 0 ? 'bg-edge' : xp < 20 ? 'bg-brand/40' : xp < 50 ? 'bg-brand/70' : 'bg-brand';

  const activeDays = days.filter((d) => d.xp > 0).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1">
        {days.map((d, i) => (
          <motion.div
            key={d.date}
            title={`${d.date}: ${d.xp} XP`}
            className={cn('h-3 w-3 rounded-sm', level(d.xp))}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: Math.min(i * 0.004, 0.6),
              type: 'spring',
              stiffness: 500,
              damping: 28,
            }}
            whileHover={{ scale: 1.6, zIndex: 1 }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles size={12} className="text-brand" />
          {activeDays} {activeDays === 1 ? 'dia ativo' : 'dias ativos'}
        </span>
        <span className="flex items-center gap-1">
          Menos
          <span className="h-2.5 w-2.5 rounded-sm bg-edge" />
          <span className="h-2.5 w-2.5 rounded-sm bg-brand/40" />
          <span className="h-2.5 w-2.5 rounded-sm bg-brand/70" />
          <span className="h-2.5 w-2.5 rounded-sm bg-brand" />
          Mais
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Página de perfil                                                            */
/* -------------------------------------------------------------------------- */
export function Profile() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const profile = useProgressStore((s) => s.profile);
  const { play } = useSounds();

  const { data: achievements } = useQuery({ queryKey: ['achievements'], queryFn: () => api.get<AchievementWithStatus[]>('/achievements') });
  const { data: activity } = useQuery({ queryKey: ['activity'], queryFn: () => api.get<{ day: string; xp: number }[]>('/progress/activity') });

  const earned = achievements?.filter((a) => a.earned).length ?? 0;

  // Celebração quando as conquistas carregam (uma vez por sessão de montagem).
  const [burst, setBurst] = useState(0);
  const [byteState, setByteState] = useState<ByteState>('happy');
  const celebrated = useRef(false);
  useEffect(() => {
    if (!celebrated.current && earned > 0) {
      celebrated.current = true;
      setBurst((n) => n + 1);
      setByteState('celebrate');
      play('reward');
      const t = setTimeout(() => setByteState('happy'), 2200);
      return () => clearTimeout(t);
    }
  }, [earned, play]);

  if (!profile || !user) return null;

  return (
    <div className="flex flex-col gap-5">
      <Confetti burstKey={burst} pieces={70} power={1.05} originX={50} originY={20} />

      {/* ---------------------------------------------------------------- */}
      {/* Cabeçalho                                                         */}
      {/* ---------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      >
        <Card className="relative overflow-hidden">
          {/* fundo gradiente sutil da marca */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent" />
          <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-brand/10 blur-3xl" />

          <div className="relative flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
              whileHover={{ scale: 1.06, rotate: -3 }}
            >
              <Avatar avatarId={user.avatar_id} name={user.display_name} size={72} />
            </motion.div>

            <div className="min-w-0 flex-1">
              <motion.h1
                className="truncate font-display text-2xl font-extrabold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 }}
              >
                {user.display_name || user.username}
              </motion.h1>
              <motion.p
                className="text-sm text-muted"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.24 }}
              >
                @{user.username}
              </motion.p>
              <motion.div
                className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-2.5 py-1 text-xs font-bold text-brand"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.32, type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Award size={13} />
                Nível Dev
              </motion.div>
            </div>

            {/* Mascote reagindo */}
            <div className="hidden shrink-0 sm:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 240, damping: 18 }}
              >
                <Byte state={byteState} size={84} />
              </motion.div>
            </div>

            <motion.div whileHover={{ scale: 1.1, rotate: -8 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="sm" onClick={logout} aria-label="Sair">
                <LogOut size={18} />
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* ---------------------------------------------------------------- */}
      {/* Estatísticas (count-up + stagger)                                 */}
      {/* ---------------------------------------------------------------- */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
        initial="hidden"
        animate="show"
      >
        <StatCard icon={Flame} value={profile.streak_current} label="Ofensiva atual" color="#FF9600" glow="#FF9600" />
        <StatCard icon={Flame} value={profile.streak_longest} label="Maior ofensiva" color="#FF4B4B" glow="#FF4B4B" />
        <StatCard icon={Zap} value={profile.xp_total} label="XP total" color="#FF9600" glow="#FFC800" />
        <StatCard icon={Trophy} value={earned} label="Conquistas" color="#58CC02" glow="#58CC02" />
      </motion.div>

      {/* ---------------------------------------------------------------- */}
      {/* Heatmap de atividade                                              */}
      {/* ---------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, type: 'spring', stiffness: 260, damping: 24 }}
      >
        <Card>
          <div className="mb-3 flex items-center gap-2 font-extrabold">
            <motion.span
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Calendar size={18} className="text-brand" />
            </motion.span>
            Atividade (120 dias)
          </div>
          {activity ? (
            <Heatmap data={activity} />
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted">
              <motion.span
                className="h-2 w-2 rounded-full bg-brand"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              Carregando…
            </div>
          )}
        </Card>
      </motion.div>

      {/* ---------------------------------------------------------------- */}
      {/* Conquistas (reveal animado)                                       */}
      {/* ---------------------------------------------------------------- */}
      <div>
        <motion.div
          className="mb-3 flex items-center justify-between"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <Trophy size={20} className="text-warning" />
            Conquistas
          </h2>
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-muted">
            {earned}/{achievements?.length ?? 0}
          </span>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
          variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.55 } } }}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {(achievements ?? []).map((a) => (
              <motion.div
                key={a.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.7, y: 16, rotate: -4 },
                  show: {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotate: 0,
                    transition: { type: 'spring', stiffness: 340, damping: 22 },
                  },
                }}
              >
                <AchievementBadge a={a} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
