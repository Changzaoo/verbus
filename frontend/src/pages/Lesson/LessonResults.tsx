import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Gem, Target, Clock, Flame, Trophy } from 'lucide-react';
import { Tuca } from '@/components/mascot/Tuca';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/gamification/Confetti';
import { useSounds } from '@/hooks/useSounds';
import type { CompleteLessonResponse } from '@/types';

interface Props {
  result: CompleteLessonResponse;
  stars: number;
  accuracy: number;
  seconds: number;
  maxCombo?: number;
  onContinue: () => void;
}

function CountUp({ to, className }: { to: number; className?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 800;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span className={className}>{n}</span>;
}

function StatBox({ icon: Icon, value, label, color }: { icon: typeof Zap; value: React.ReactNode; label: string; color: string }) {
  return (
    <div className="flex-1 rounded-2xl border-2 p-3 text-center" style={{ borderColor: color }}>
      <Icon className="mx-auto" size={22} style={{ color }} />
      <div className="mt-1 text-lg font-black" style={{ color }}>{value}</div>
      <div className="text-[11px] font-bold uppercase text-muted">{label}</div>
    </div>
  );
}

export function LessonResults({ result, stars, accuracy, seconds, maxCombo = 0, onContinue }: Props) {
  const { play } = useSounds();
  const [burst, setBurst] = useState(0);
  const totalXp = result.xp_gained + result.bonus_xp;

  useEffect(() => {
    setBurst(1);
    play('reward');
    const t = setTimeout(() => setBurst(2), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-canvas px-4 text-ink">
      <Confetti burstKey={burst} pieces={120} power={1.5} originY={30} />

      <motion.div initial={{ scale: 0.5, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
        <Tuca state="celebrate" size={170} />
      </motion.div>

      <motion.h1
        className="mt-2 font-display text-3xl font-black text-brand"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        Lição concluída!
      </motion.h1>

      <div className="mb-6 mt-3 flex gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2 + i * 0.18, type: 'spring', stiffness: 300, damping: 12 }}
          >
            <Star size={44} className={i < stars ? 'text-warning' : 'text-edge'} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <div className="flex w-full max-w-md gap-3">
        <StatBox icon={Zap} value={<><span>+</span><CountUp to={totalXp} /></>} label="XP total" color="#FF9600" />
        <StatBox icon={Target} value={<><CountUp to={Math.round(accuracy * 100)} />%</>} label="Precisão" color="#58CC02" />
        <StatBox icon={Clock} value={`${seconds}s`} label="Tempo" color="#1CB0F6" />
      </div>

      {(result.gems_gained > 0 || result.bonus_xp > 0 || maxCombo >= 3) && (
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-sm font-bold">
          {result.gems_gained > 0 && <span className="pill bg-gems/15 text-gems"><Gem size={14} /> +{result.gems_gained}</span>}
          {result.bonus_xp > 0 && <span className="pill bg-xp/15 text-xp">Bônus de meta +{result.bonus_xp} XP</span>}
          {result.leveled_streak && <span className="pill bg-streak/15 text-streak"><Flame size={14} fill="currentColor" /> Ofensiva +1</span>}
          {maxCombo >= 3 && <span className="pill bg-streak/15 text-streak"><Flame size={14} fill="currentColor" /> Combo máx. {maxCombo}</span>}
        </div>
      )}

      {result.new_achievements.length > 0 && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 w-full max-w-md rounded-2xl border-2 border-warning bg-warning/10 p-3"
        >
          <div className="mb-1 flex items-center gap-1 text-sm font-extrabold text-warning"><Trophy size={15} fill="currentColor" /> Novas conquistas!</div>
          <div className="flex flex-wrap gap-2">
            {result.new_achievements.map((a) => (
              <span key={a.id} className="pill bg-surface">{a.icon} {a.name}</span>
            ))}
          </div>
        </motion.div>
      )}

      <Button size="lg" className="mt-8 w-full max-w-md" onClick={onContinue}>Continuar</Button>
    </div>
  );
}
