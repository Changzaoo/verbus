import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, BookOpen, ChevronRight, Sparkles, Trophy, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useProgressStore } from '@/store/progressStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { XPBar } from '@/components/gamification/XPBar';
import { Tuca } from '@/components/mascot/Tuca';
import { LangBadge } from '@/components/ui/LangBadge';
import { Confetti } from '@/components/gamification/Confetti';
import { useSounds } from '@/hooks/useSounds';
import { cn } from '@/lib/cn';
import type { DailyChallenge, Language, RankContext, VocabularyStats, XpStats } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 320, damping: 26 },
  },
};

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const profile = useProgressStore((s) => s.profile);

  const { data: xp } = useQuery({ queryKey: ['xp-stats'], queryFn: () => api.get<XpStats>('/xp/stats') });
  const { data: vocab } = useQuery({ queryKey: ['vocab-stats'], queryFn: () => api.get<VocabularyStats>('/vocabulary/stats') });
  const { data: daily } = useQuery({ queryKey: ['daily'], queryFn: () => api.get<DailyChallenge>('/daily/challenge') });
  const { data: languages } = useQuery({ queryKey: ['languages'], queryFn: () => api.get<Language[]>('/languages') });
  const { data: rank } = useQuery({ queryKey: ['rank-all'], queryFn: () => api.get<RankContext>('/leaderboard/me?period=all') });
  const { data: rankWeek } = useQuery({ queryKey: ['rank-week'], queryFn: () => api.get<RankContext>('/leaderboard/me?period=week') });

  const { play } = useSounds();

  const streak = profile?.streak_current ?? 0;
  const todayXp = xp?.today ?? 0;
  const goalXp = xp?.daily_goal ?? 50;
  const goalMet = xp?.daily_goal_met ?? false;

  // Tuca reage: comemora ao bater a meta, feliz com ofensiva, ocioso caso contrário.
  const byteState = goalMet ? 'cheer' : streak > 0 ? 'happy' : 'idle';

  // Dispara celebração (confete + som) uma única vez quando a meta é detectada.
  const [burst, setBurst] = useState(0);
  const celebratedRef = useRef(false);
  useEffect(() => {
    if (goalMet && !celebratedRef.current) {
      celebratedRef.current = true;
      setBurst((b) => b + 1);
      play('complete');
    }
    if (!goalMet) celebratedRef.current = false;
  }, [goalMet, play]);

  const greeting = user?.display_name || user?.username;

  return (
    <>
      <Confetti burstKey={burst} pieces={70} power={1.1} originX={50} originY={30} />

      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-5">
        {/* Cabeçalho com o mascote */}
        <motion.div variants={item} className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
            whileHover={{ scale: 1.06, rotate: 3 }}
            className="shrink-0 drop-shadow-[0_8px_18px_rgba(88,204,2,0.25)]"
          >
            <Tuca state={byteState} size={64} />
          </motion.div>
          <div>
            <h1 className="font-display text-2xl font-extrabold">
              Olá,{' '}
              <span className="bg-gradient-to-r from-brand to-xp bg-clip-text text-transparent">{greeting}</span>!
            </h1>
            <p className="text-sm text-muted">
              {goalMet ? 'Meta diária batida! Você está voando.' : 'Bora manter a ofensiva hoje?'}
            </p>
          </div>
        </motion.div>

        {/* Streak + meta de XP */}
        <motion.div variants={item}>
          <Card className="relative flex flex-col gap-4 overflow-hidden sm:flex-row sm:items-center">
            {/* brilho decorativo de fundo */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-streak/10 blur-3xl" />

            <motion.div
              className="relative flex items-center gap-2"
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              <motion.div
                animate={streak > 0 ? { scale: [1, 1.12, 1] } : {}}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Flame
                  className={cn('animate-flame', streak > 0 ? 'text-streak' : 'text-muted/50')}
                  size={40}
                  fill="currentColor"
                />
              </motion.div>
              <div>
                <motion.div
                  key={streak}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                  className="text-3xl font-black leading-none text-streak"
                >
                  {streak}
                </motion.div>
                <div className="text-xs font-bold text-muted">dias de ofensiva</div>
              </div>
            </motion.div>

            <div className="relative flex-1">
              {/* glow sob a barra de XP */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-3 rounded-full bg-xp/40 blur-md"
                animate={{ opacity: [0.35, 0.7, 0.35] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative">
                <XPBar current={todayXp} goal={goalXp} />
              </div>
              <AnimatePresence>
                {goalMet && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-1.5 flex items-center gap-1 text-xs font-bold text-correct"
                  >
                    <Sparkles size={14} fill="currentColor" /> Meta diária concluída!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Desafio diário */}
        {daily && (
          <motion.div variants={item} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
            <Link to="/app/daily">
              <Card className="group relative flex items-center gap-3 overflow-hidden border-xp/50 bg-xp/5 transition-shadow hover:shadow-[0_10px_30px_-10px_rgba(255,150,0,0.45)]">
                <div className="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-xp/10 blur-2xl transition-opacity group-hover:opacity-100" />
                <motion.div
                  animate={{ rotate: [-8, 8, -8] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <Zap className="text-xp drop-shadow-[0_2px_8px_rgba(255,150,0,0.5)]" size={32} fill="currentColor" />
                </motion.div>
                <div className="relative flex-1">
                  <div className="font-extrabold">{daily.title}</div>
                  <div className="text-sm text-muted">
                    {daily.completed ? 'Concluído hoje ✓' : daily.description}
                  </div>
                </div>
                <span className="pill relative bg-xp/15 text-xp">+{daily.xp_reward} XP</span>
                <ChevronRight className="relative text-muted transition-transform group-hover:translate-x-1" />
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Revisão SRS */}
        {vocab && vocab.due_today > 0 && (
          <motion.div variants={item} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
            <Link to="/app/practice">
              <Card className="group flex items-center gap-3 transition-shadow hover:shadow-[0_10px_30px_-12px_rgba(28,176,246,0.4)]">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <BookOpen className="text-lang-english" size={28} />
                </motion.div>
                <div className="flex-1">
                  <div className="font-extrabold">{vocab.due_today} palavras para revisar</div>
                  <div className="text-sm text-muted">Mantenha o vocabulário afiado com revisão espaçada</div>
                </div>
                <Button size="sm" className="transition-transform group-hover:scale-105">
                  Revisar
                </Button>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Ranking competitivo */}
        {rank && rank.total > 0 && (
          <motion.div variants={item} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
            <Link to="/app/leaderboard">
              <Card className="group relative flex items-center gap-3 overflow-hidden border-warning/40 bg-warning/5 transition-shadow hover:shadow-[0_10px_30px_-12px_rgba(255,200,0,0.5)]">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-warning/15 text-lg font-black text-warning">
                  #{rank.rank}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-extrabold">
                    <Trophy size={16} className="text-warning" fill="currentColor" /> Ranking global
                  </div>
                  <div className="text-sm text-muted">
                    {rank.to_next > 0
                      ? `Faltam ${rank.to_next} XP para passar ${rank.next_user}`
                      : `Você é #1 de ${rank.total}!`}
                    {rankWeek && (
                      <span className="ml-1 inline-flex items-center gap-0.5 text-streak">
                        · <TrendingUp size={13} /> #{rankWeek.rank} na semana
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="text-muted" />
              </Card>
            </Link>
          </motion.div>
        )}

        {/* Cursos */}
        <motion.div variants={item}>
          <h2 className="mb-2 flex items-center gap-2 text-lg font-extrabold">
            <Trophy size={18} className="text-xp" fill="currentColor" />
            Seus idiomas
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(languages ?? []).map((l, i) => (
              <motion.div
                key={l.id}
                variants={item}
                custom={i}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                <Link to={`/app/course/${l.code}`}>
                  <Card
                    className="group relative flex items-center gap-3 overflow-hidden border-2 transition-shadow"
                    style={
                      {
                        borderColor: l.color_primary,
                        boxShadow: `0 8px 24px -14px ${l.color_primary}`,
                        ['--lang' as string]: l.color_primary,
                      } as React.CSSProperties
                    }
                  >
                    {/* lavagem de cor que aparece no hover */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: `linear-gradient(120deg, ${l.color_primary}22, transparent 70%)`,
                      }}
                    />
                    {/* glow no canto */}
                    <div
                      className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl"
                      style={{ backgroundColor: l.color_primary }}
                    />
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.12, rotate: -6 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                    >
                      <LangBadge code={l.code} color={l.color_primary} size={44} />
                    </motion.div>
                    <div className="relative flex-1">
                      <div className="font-extrabold">{l.name}</div>
                      <div className="text-xs text-muted">
                        {l.total_lessons} lições · {l.total_xp_available} XP
                      </div>
                    </div>
                    <ChevronRight className="relative text-muted transition-all group-hover:translate-x-1" />
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
