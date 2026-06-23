import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Timer, Flame, Zap, RotateCcw, ArrowLeft, X } from 'lucide-react';
import { fetchMaterial, allWords, shuffle, type Material } from '@/lib/material';
import { useSounds } from '@/hooks/useSounds';
import { useProgressStore } from '@/store/progressStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Byte, type ByteState } from '@/components/mascot/Byte';
import { Confetti } from '@/components/gamification/Confetti';
import { cn } from '@/lib/cn';
import type { UserProfile } from '@/types';

const BOARD = 5;
const SECONDS = 60;

function bare(s: string): string {
  return s.replace(/\s*\([^)]*\)/g, '').trim();
}

interface Pair { id: number; pt: string; term: string; }
interface Card { pairId: number; text: string; }

export function MatchMadness() {
  const { langId } = useParams<{ langId: string }>();
  const { data: mat, isLoading } = useQuery({
    queryKey: ['material', langId],
    queryFn: () => fetchMaterial(langId!),
  });

  if (isLoading || !mat) return <FullPageSpinner />;
  return <Game mat={mat} />;
}

function Game({ mat }: { mat: Material }) {
  const navigate = useNavigate();
  const { play } = useSounds();
  const setProfile = useProgressStore((s) => s.setProfile);
  const onExit = () => navigate('/app/practice');
  const pool = useMemo<Pair[]>(() => {
    const seen = new Set<string>();
    const out: Pair[] = [];
    for (const w of shuffle(allWords(mat))) {
      const key = w.pt.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ id: out.length, pt: w.pt, term: bare(w.term) });
      if (out.length >= 28) break;
    }
    return out;
  }, [mat]);

  const [phase, setPhase] = useState<'intro' | 'playing' | 'over'>('intro');
  const [left, setLeft] = useState<Card[]>([]);
  const [right, setRight] = useState<Card[]>([]);
  const [sel, setSel] = useState<{ side: 'l' | 'r'; pairId: number } | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [justMatched, setJustMatched] = useState<number[]>([]);
  const [matched, setMatched] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS);
  const [burst, setBurst] = useState(0);
  const [byteState, setByteState] = useState<ByteState>('idle');
  const nextIdx = useRef(BOARD);
  const awarded = useRef(false);

  function start() {
    const first = pool.slice(0, BOARD);
    setLeft(shuffle(first.map((p) => ({ pairId: p.id, text: p.pt }))));
    setRight(shuffle(first.map((p) => ({ pairId: p.id, text: p.term }))));
    nextIdx.current = BOARD;
    setMatched(0); setMisses(0); setCombo(0); setMaxCombo(0); setTimeLeft(SECONDS);
    setSel(null); setWrong([]); setByteState('idle');
    awarded.current = false;
    setPhase('playing');
  }

  // Cronômetro
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) { setPhase('over'); play('wrong'); return; }
    const t = window.setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, timeLeft, play]);

  // Recompensa ao terminar
  useEffect(() => {
    if (phase === 'over' && !awarded.current) {
      awarded.current = true;
      const xp = matched * 3 + maxCombo * 2;
      setByteState(matched >= 12 ? 'levelup' : matched >= 6 ? 'celebrate' : 'happy');
      if (xp > 0) {
        api.post<{ profile: UserProfile }>('/xp/add', { amount: Math.min(1000, xp), source: 'practice' })
          .then((r) => setProfile(r.profile)).catch(() => {});
      }
      play('complete');
    }
  }, [phase, matched, maxCombo, play, setProfile]);

  function refill(pairId: number) {
    setLeft((ls) => {
      const filtered = ls.filter((c) => c.pairId !== pairId);
      if (nextIdx.current < pool.length) {
        const np = pool[nextIdx.current];
        const pos = Math.floor(Math.random() * (filtered.length + 1));
        filtered.splice(pos, 0, { pairId: np.id, text: np.pt });
      }
      return filtered;
    });
    setRight((rs) => {
      const filtered = rs.filter((c) => c.pairId !== pairId);
      if (nextIdx.current < pool.length) {
        const np = pool[nextIdx.current];
        const pos = Math.floor(Math.random() * (filtered.length + 1));
        filtered.splice(pos, 0, { pairId: np.id, text: np.term });
      }
      return filtered;
    });
    if (nextIdx.current < pool.length) nextIdx.current += 1;
  }

  function tap(side: 'l' | 'r', pairId: number) {
    if (phase !== 'playing' || wrong.length) return;
    if (!sel) { setSel({ side, pairId }); play('tap'); return; }
    if (sel.side === side) { setSel({ side, pairId }); play('tap'); return; }
    if (sel.pairId === pairId) {
      // acerto
      play('correct');
      setJustMatched([pairId]);
      window.setTimeout(() => setJustMatched([]), 250);
      refill(pairId);
      setMatched((m) => m + 1);
      setCombo((c) => { const n = c + 1; setMaxCombo((mc) => Math.max(mc, n)); if (n >= 3) { setBurst((b) => b + 1); play('combo'); } return n; });
      setSel(null);
      // fim se acabou o baralho e o tabuleiro
      setLeft((ls) => { if (ls.length <= 1 && nextIdx.current >= pool.length) window.setTimeout(() => setPhase('over'), 260); return ls; });
    } else {
      // erro
      play('wrong');
      setWrong([sel.pairId, pairId]);
      setMisses((m) => m + 1);
      setCombo(0);
      setTimeLeft((s) => Math.max(0, s - 2));
      setByteState('sad');
      window.setTimeout(() => { setWrong([]); setByteState('idle'); }, 450);
      setSel(null);
    }
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-wrong text-white shadow-btn"><Swords size={40} /></span>
        <h1 className="font-display text-2xl font-extrabold">Match Madness</h1>
        <p className="max-w-sm text-muted">Conecte cada palavra à sua tradução o mais rápido possível. Você tem <b>{SECONDS}s</b> — cada erro tira 2 segundos!</p>
        <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
          <Button size="lg" fullWidth onClick={() => { play('tap'); start(); }}>Começar</Button>
          <Button variant="secondary" fullWidth onClick={onExit} className="flex items-center justify-center gap-2"><ArrowLeft size={18} /> Voltar</Button>
        </div>
      </div>
    );
  }

  if (phase === 'over') {
    const total = matched + misses;
    const acc = total > 0 ? Math.round((matched / total) * 100) : 0;
    const xp = Math.min(1000, matched * 3 + maxCombo * 2);
    return (
      <>
        <Confetti burstKey={1} pieces={matched >= 12 ? 100 : 60} power={matched >= 12 ? 1.3 : 1} originX={50} originY={30} />
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <Byte state={byteState} size={150} />
          <h1 className="font-display text-2xl font-extrabold">Tempo!</h1>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Stat icon={<Swords size={16} />} label="Pares" value={String(matched)} tone="text-correct" />
            <Stat icon={<Flame size={16} />} label="Combo máx." value={String(maxCombo)} tone="text-streak" />
            <Stat icon={<Zap size={16} />} label="Precisão" value={`${acc}%`} tone="text-brand" />
            <Stat icon={<Zap size={16} />} label="XP" value={`+${xp}`} tone="text-xp" />
          </div>
          <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
            <Button size="lg" fullWidth onClick={() => { play('tap'); start(); }} className="flex items-center justify-center gap-2"><RotateCcw size={18} /> Jogar de novo</Button>
            <Button variant="secondary" fullWidth onClick={onExit}>Voltar ao hub</Button>
          </div>
        </div>
      </>
    );
  }

  const danger = timeLeft <= 10;

  return (
    <>
      <Confetti burstKey={burst} pieces={28} power={0.6} originX={50} originY={24} />
      <div className="flex flex-col gap-4">
        {/* Barra superior */}
        <div className="flex items-center gap-3">
          <button onClick={onExit} aria-label="Sair" className="text-muted hover:text-ink"><X size={24} /></button>
          <div className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 font-extrabold tabular-nums', danger ? 'bg-wrong/15 text-wrong' : 'bg-surface text-ink ring-1 ring-edge')}>
            <Timer size={18} /> {timeLeft}s
          </div>
          <div className="ml-auto flex items-center gap-2">
            {combo >= 2 && (
              <motion.span key={combo} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-1 rounded-full bg-streak/15 px-2.5 py-1 text-sm font-black text-streak">
                <Flame size={14} fill="currentColor" /> {combo}
              </motion.span>
            )}
            <span className="rounded-full bg-correct/15 px-2.5 py-1 text-sm font-extrabold text-correct">{matched}</span>
          </div>
        </div>

        {/* Tabuleiro de pares */}
        <div className="grid grid-cols-2 gap-3">
          <Column cards={left} side="l" sel={sel} wrong={wrong} matched={justMatched} onTap={tap} />
          <Column cards={right} side="r" sel={sel} wrong={wrong} matched={justMatched} onTap={tap} />
        </div>
      </div>
    </>
  );
}

function Column({ cards, side, sel, wrong, matched, onTap }: {
  cards: Card[]; side: 'l' | 'r';
  sel: { side: 'l' | 'r'; pairId: number } | null;
  wrong: number[]; matched: number[];
  onTap: (side: 'l' | 'r', pairId: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {cards.map((c) => {
          const isSel = sel?.side === side && sel.pairId === c.pairId;
          const isWrong = wrong.includes(c.pairId);
          const isMatch = matched.includes(c.pairId);
          return (
            <motion.button
              key={`${side}-${c.pairId}`}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: isMatch ? [1, 1.1, 0] : 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.22 }}
              onClick={() => onTap(side, c.pairId)}
              className={cn(
                'min-h-[58px] rounded-2xl border-2 px-3 py-3 text-center font-bold shadow-btn-sm',
                isWrong ? 'border-wrong bg-wrong/15 text-wrong animate-shake'
                  : isSel ? 'border-brand bg-brand/15 text-brand'
                  : 'border-edge bg-surface text-ink hover:border-brand/40',
              )}
            >
              {c.text}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="flex min-w-[88px] flex-col items-center gap-0.5 rounded-2xl bg-surface px-4 py-3 ring-1 ring-edge">
      <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted"><span className={tone}>{icon}</span>{label}</span>
      <span className={cn('text-xl font-extrabold tabular-nums', tone)}>{value}</span>
    </div>
  );
}
