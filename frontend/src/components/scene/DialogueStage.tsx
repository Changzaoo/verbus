import { motion, AnimatePresence } from 'framer-motion';
import { Byte, type ByteState } from '@/components/mascot/Byte';
import { Lia, type LiaState } from '@/components/mascot/Lia';
import { SpeakerButton } from '@/components/exercises/SpeakerButton';
import { cn } from '@/lib/cn';
import type { Speaker } from '@/lib/dialogues';

export interface StageBubble {
  term: string;
  roman?: string;
  pt: string;
}

interface DialogueStageProps {
  /** Quem está em foco/falando ('A' = Byte, 'B' = Lia). null = ninguém. */
  active: Speaker | null;
  talking: boolean;
  color: string;
  bubble?: StageBubble | null;
  audioLang: string;
  byteState?: ByteState;
  liaState?: LiaState;
  /** Altura do palco (px). */
  height?: number;
}

/** Onda sonora animada que aparece sob o personagem que fala. */
function SoundWave({ color }: { color: string }) {
  return (
    <div className="flex items-end gap-[3px]" style={{ height: 14 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full"
          style={{ backgroundColor: color }}
          animate={{ height: [4, 14, 6, 12, 4] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
        />
      ))}
    </div>
  );
}

/**
 * Palco de diálogo: dois personagens num cenário temático, com o falante em destaque,
 * boca animada (lip-sync) e um balão de fala estilo HQ. Reusado por Histórias e Podcast.
 */
export function DialogueStage({
  active, talking, color, bubble, audioLang, byteState = 'idle', liaState = 'idle', height = 260,
}: DialogueStageProps) {
  const byteActive = active === 'A';
  const liaActive = active === 'B';

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl ring-1 ring-edge"
      style={{ height, background: `linear-gradient(160deg, ${color}26 0%, ${color}10 55%, transparent 100%)` }}
    >
      {/* céu/decoração */}
      <motion.div
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full"
        style={{ background: `radial-gradient(circle, ${color}55, transparent 70%)` }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-1/3" style={{ background: `linear-gradient(to top, ${color}22, transparent)` }} />
      {/* chão */}
      <div className="absolute bottom-0 left-0 right-0 h-3" style={{ backgroundColor: `${color}44` }} />

      {/* balão de fala */}
      <AnimatePresence>
        {bubble && active && (
          <motion.div
            key={active + bubble.term}
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className={cn(
              'absolute top-3 z-10 max-w-[62%] rounded-2xl bg-surface px-3 py-2 shadow-btn ring-2',
              byteActive ? 'left-3 rounded-bl-sm' : 'right-3 rounded-br-sm',
            )}
            style={{ borderColor: color, ['--tw-ring-color' as any]: color }}
          >
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold leading-tight text-ink">{bubble.term}</span>
              <SpeakerButton text={bubble.term} lang={audioLang} size={13} className="bg-transparent p-1 text-muted shadow-none" />
            </div>
            {bubble.roman && <div className="text-[11px] italic text-muted">{bubble.roman}</div>}
            <div className="text-xs text-muted">{bubble.pt}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* personagens */}
      <div className="absolute bottom-3 left-0 right-0 flex items-end justify-between px-4">
        <motion.div
          className="flex flex-col items-center gap-1"
          animate={{ scale: byteActive ? 1.06 : 0.92, opacity: active && !byteActive ? 0.55 : 1, filter: active && !byteActive ? 'saturate(0.6)' : 'saturate(1)' }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Byte state={byteState} talking={byteActive && talking} size={Math.round(height * 0.46)} />
          {byteActive && talking && <SoundWave color={color} />}
          <span className="rounded-full bg-surface/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">Byte</span>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-1"
          animate={{ scale: liaActive ? 1.06 : 0.92, opacity: active && !liaActive ? 0.55 : 1, filter: active && !liaActive ? 'saturate(0.6)' : 'saturate(1)' }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Lia state={liaState} talking={liaActive && talking} size={Math.round(height * 0.46)} />
          {liaActive && talking && <SoundWave color={color} />}
          <span className="rounded-full bg-surface/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">Lia</span>
        </motion.div>
      </div>
    </div>
  );
}
