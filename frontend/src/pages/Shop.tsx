import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, ShoppingBag, Sparkles, Check, X, AlertCircle, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { useProgressStore } from '@/store/progressStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { GemCounter } from '@/components/gamification/GemCounter';
import { Confetti } from '@/components/gamification/Confetti';
import { Byte } from '@/components/mascot/Byte';
import { Icon } from '@/components/ui/Icon';
import { useSounds } from '@/hooks/useSounds';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/cn';
import type { ShopItem, User, UserProfile } from '@/types';

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 24 },
  },
};

export function Shop() {
  const profile = useProgressStore((s) => s.profile);
  const setProfile = useProgressStore((s) => s.setProfile);
  const setUser = useAuthStore((s) => s.setUser);
  const { play } = useSounds();
  const { data: items } = useQuery({ queryKey: ['shop'], queryFn: () => api.get<ShopItem[]>('/shop/items') });

  const [selected, setSelected] = useState<ShopItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [celebrating, setCelebrating] = useState(false);

  // Some o feedback de sucesso automaticamente.
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4200);
    return () => clearTimeout(t);
  }, [feedback]);

  async function buy() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ profile: UserProfile; user: User }>('/shop/buy', { item_id: selected.id });
      setProfile(res.profile);
      if (res.user) setUser(res.user);
      play('reward');
      setFeedback(`${selected.name} comprado!`);
      setBurstKey((k) => k + 1);
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 2400);
      setSelected(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const gems = profile?.gems ?? 0;

  return (
    <div className="relative">
      {/* Confete dispara a cada compra bem-sucedida */}
      <Confetti burstKey={burstKey} pieces={80} power={1.1} originX={50} originY={30} />

      {/* Mascote celebrando a compra, flutuando no canto */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            className="pointer-events-none fixed bottom-6 right-4 z-[55] sm:right-8"
            initial={{ opacity: 0, y: 60, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <Byte state="celebrate" size={120} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cabeçalho */}
      <motion.div
        className="mb-5 flex items-center justify-between gap-3"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/15 text-brand shadow-sm"
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ShoppingBag size={24} />
          </motion.div>
          <div>
            <h1 className="font-display text-2xl font-extrabold leading-none">Loja</h1>
            <p className="mt-1 text-xs text-muted">Troque suas gemas por vantagens</p>
          </div>
        </div>

        <motion.div
          className="flex items-center gap-2 rounded-2xl border border-edge bg-surface px-3 py-2 shadow-sm"
          whileHover={{ scale: 1.04 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <GemCounter count={gems} className="text-base" />
        </motion.div>
      </motion.div>

      {/* Banner de sucesso */}
      <AnimatePresence mode="popLayout">
        {feedback && (
          <motion.div
            key="ok"
            className="mb-4 flex items-center gap-3 overflow-hidden rounded-2xl border border-correct/30 bg-correct/10 p-3.5 text-sm font-bold text-correct"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            <motion.span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-correct/20"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.05 }}
            >
              <Check size={16} />
            </motion.span>
            <span className="flex-1">{feedback}</span>
            <Sparkles size={18} className="shrink-0 animate-pulse opacity-70" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grade de itens */}
      {items ? (
        <motion.div
          className="grid gap-3 sm:grid-cols-2"
          variants={gridVariants}
          initial="hidden"
          animate="show"
        >
          {items.map((item) => {
            const affordable = gems >= item.gem_cost;
            const available = item.is_available;
            const locked = !available;
            return (
              <motion.div key={item.id} variants={cardVariants} layout>
                <motion.div
                  whileHover={locked ? undefined : { y: -4, scale: 1.015 }}
                  whileTap={locked ? undefined : { scale: 0.985 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                >
                  <Card
                    className={cn(
                      'group relative flex items-center gap-4 overflow-hidden transition-shadow duration-300',
                      affordable && !locked
                        ? 'hover:border-brand/40 hover:shadow-lg'
                        : 'opacity-60 saturate-[0.85]',
                    )}
                  >
                    {/* brilho sutil ao passar o mouse */}
                    {affordable && !locked && (
                      <span className="pointer-events-none absolute -inset-px rounded-[inherit] bg-gradient-to-br from-brand/0 via-brand/0 to-brand/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    )}

                    {/* Ícone grande animado */}
                    <motion.span
                      className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand"
                      whileHover={locked ? undefined : { scale: 1.18, rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon name={item.icon} size={32} />
                      {locked && (
                        <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border border-edge bg-surface text-muted">
                          <Lock size={12} />
                        </span>
                      )}
                    </motion.span>

                    <div className="relative min-w-0 flex-1">
                      <div className="truncate font-extrabold text-ink">{item.name}</div>
                      <div className="mt-0.5 line-clamp-2 text-xs text-muted">{item.description}</div>
                    </div>

                    <motion.div
                      className="relative shrink-0"
                      whileTap={affordable && !locked ? { scale: 0.92 } : undefined}
                    >
                      <Button
                        size="sm"
                        disabled={!affordable || locked}
                        onClick={() => {
                          play('tap');
                          setSelected(item);
                        }}
                        className="flex items-center gap-1.5"
                      >
                        <Gem size={14} fill="currentColor" className="opacity-90" />
                        {item.gem_cost}
                      </Button>
                    </motion.div>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        // Esqueletos de carregamento
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-edge/60" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-edge/60" />
                <div className="h-2.5 w-full animate-pulse rounded-full bg-edge/40" />
              </div>
              <div className="h-8 w-16 shrink-0 animate-pulse rounded-xl bg-edge/60" />
            </div>
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {items && items.length === 0 && (
        <motion.div
          className="flex flex-col items-center gap-3 py-16 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Byte state="idle" size={120} />
          <p className="font-bold text-ink">A loja está vazia por enquanto</p>
          <p className="text-sm text-muted">Volte mais tarde para novidades!</p>
        </motion.div>
      )}

      {/* Modal de confirmação */}
      <Modal
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setError(null);
        }}
        title="Confirmar compra"
      >
        {selected && (
          <>
            <motion.div
              className="mb-5 flex items-center gap-4 rounded-2xl border border-edge bg-canvas/60 p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <motion.span
                className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand"
                animate={{ y: [0, -6, 0], rotate: [0, -4, 4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Icon name={selected.icon} size={40} />
              </motion.span>
              <div className="min-w-0">
                <div className="font-display text-lg font-extrabold text-ink">{selected.name}</div>
                <div className="mt-0.5 text-sm text-muted">{selected.description}</div>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gems/10 px-2.5 py-1 text-sm font-extrabold text-gems">
                  <Gem size={15} fill="currentColor" className="opacity-90" />
                  {selected.gem_cost}
                </div>
              </div>
            </motion.div>

            {/* Erro de compra */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-4 flex items-center gap-2 rounded-xl border border-wrong/30 bg-wrong/10 p-3 text-sm font-bold text-wrong"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ x: { duration: 0.4 } }}
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setSelected(null);
                  setError(null);
                }}
                className="flex items-center justify-center gap-1.5"
              >
                <X size={16} />
                Cancelar
              </Button>
              <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                <Button
                  fullWidth
                  disabled={busy}
                  onClick={buy}
                  className="flex items-center justify-center gap-1.5"
                >
                  {busy ? (
                    <>
                      <motion.span
                        className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                      />
                      Comprando…
                    </>
                  ) : (
                    <>
                      <Gem size={15} fill="currentColor" className="opacity-90" />
                      Comprar por {selected.gem_cost}
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
