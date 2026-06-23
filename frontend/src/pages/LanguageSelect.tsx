import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Sparkles, ArrowRight, BookOpen, Globe2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Byte, type ByteState } from '@/components/mascot/Byte';
import { Confetti } from '@/components/gamification/Confetti';
import { Card } from '@/components/ui/Card';
import { LangBadge } from '@/components/ui/LangBadge';
import { useSounds } from '@/hooks/useSounds';
import { cn } from '@/lib/cn';
import type { Language } from '@/types';

// Variantes reutilizáveis de animação ----------------------------------------
const containerStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};

const cardIn: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 22 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

export function LanguageSelect() {
  const { data: languages } = useQuery({ queryKey: ['languages'], queryFn: () => api.get<Language[]>('/languages') });
  const { play } = useSounds();

  const [burst, setBurst] = useState(0);
  const [byteState, setByteState] = useState<ByteState>('idle');
  const [hovered, setHovered] = useState<number | null>(null);

  const list = languages ?? [];
  const loading = !languages;

  const celebrate = (color: string) => {
    void color;
    setBurst((b) => b + 1);
    setByteState('cheer');
    play('tap');
  };

  return (
    <div className="relative">
      {/* explosão de confete ao escolher / tocar um idioma */}
      <Confetti burstKey={burst} pieces={48} power={0.85} originX={50} originY={30} />

      {/* brilho ambiente de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 h-56 w-[36rem] max-w-[90vw] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
      />

      {/* Cabeçalho com mascote ------------------------------------------------ */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="relative mb-7 flex items-start gap-4"
      >
        <motion.div
          variants={fadeUp}
          className="hidden shrink-0 sm:block"
          onHoverStart={() => setByteState('excited')}
          onHoverEnd={() => setByteState('idle')}
        >
          <Byte state={byteState} size={92} />
        </motion.div>

        <div className="flex-1">
          <motion.div variants={fadeUp} className="mb-2 inline-flex items-center gap-1.5">
            <span className="pill inline-flex items-center gap-1.5 bg-brand/10 text-xs font-bold text-brand">
              <Globe2 className="h-3.5 w-3.5" />
              {list.length > 0 ? `${list.length} idiomas` : 'Idiomas'}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mb-1 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl"
          >
            Escolha um idioma
          </motion.h1>
          <motion.p variants={fadeUp} className="flex items-center gap-1.5 text-sm text-muted">
            <Sparkles className="h-4 w-4 text-warning" />
            Aprenda quantos quiser — cada um tem sua própria trilha.
          </motion.p>
        </div>
      </motion.div>

      {/* Grade de idiomas ----------------------------------------------------- */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card flex animate-pulse items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-edge/60" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded bg-edge/60" />
                <div className="h-3 w-3/4 rounded bg-edge/40" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2"
        >
          {list.map((l) => {
            const isHovered = hovered === l.id;
            return (
              <motion.div key={l.id} variants={cardIn} className="h-full">
                <Link
                  to={`/app/course/${l.code}`}
                  className="block h-full focus:outline-none"
                  aria-label={`Abrir trilha de ${l.name}`}
                  onMouseEnter={() => setHovered(l.id)}
                  onMouseLeave={() => setHovered((h) => (h === l.id ? null : h))}
                  onClick={() => celebrate(l.color_primary)}
                >
                  <motion.div
                    whileHover={{ y: -6, scale: 1.025 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    className="h-full"
                  >
                    <Card
                      className={cn(
                        'group relative flex h-full items-center gap-4 overflow-hidden border-2 transition-shadow duration-300',
                      )}
                      style={
                        {
                          borderColor: l.color_primary,
                          boxShadow: isHovered
                            ? `0 18px 40px -18px ${l.color_primary}, 0 0 0 1px ${l.color_primary}33`
                            : `0 6px 18px -14px ${l.color_primary}`,
                          ['--lang' as string]: l.color_primary,
                        } as React.CSSProperties
                      }
                    >
                      {/* barra superior na cor do idioma */}
                      <span
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                        style={{ backgroundColor: l.color_primary }}
                      />

                      {/* glow difuso no hover, na cor do idioma */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ background: `linear-gradient(120deg, ${l.color_primary}1f, transparent 65%)` }}
                      />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-25"
                        style={{ backgroundColor: l.color_primary }}
                      />

                      {/* bandeira */}
                      <motion.div
                        className="relative shrink-0"
                        whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }}
                        transition={{ type: 'spring', stiffness: 320, damping: 12, duration: 0.5 }}
                      >
                        <LangBadge code={l.code} color={l.color_primary} size={64} />
                      </motion.div>

                      {/* textos */}
                      <div className="relative min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-lg font-extrabold text-ink">{l.name}</span>
                          {l.native_name && l.native_name !== l.name && (
                            <span className="truncate text-xs font-semibold text-muted">{l.native_name}</span>
                          )}
                        </div>
                        {l.description && (
                          <div className="line-clamp-1 text-sm text-muted">{l.description}</div>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-muted">
                          <span className="inline-flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" style={{ color: l.color_primary }} />
                            {l.total_lessons} lições
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-xp" />
                            {l.total_xp_available.toLocaleString('pt-BR')} XP
                          </span>
                        </div>
                      </div>

                      {/* seta que aparece no hover */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-white"
                            style={{ backgroundColor: l.color_primary }}
                            aria-hidden
                          >
                            <ArrowRight className="h-5 w-5" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
