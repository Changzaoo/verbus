import { motion } from 'framer-motion';

export type ByteState =
  | 'happy'
  | 'sad'
  | 'celebrate'
  | 'sleep'
  | 'excited'
  | 'cheer'
  | 'idle'
  | 'spin'
  | 'jump'
  | 'levelup';

/** Estados positivos para sortear reações variadas a cada acerto. */
export const POSITIVE_STATES: ByteState[] = ['cheer', 'excited', 'celebrate', 'jump', 'spin'];
export function randomPositiveState(seed: number): ByteState {
  return POSITIVE_STATES[seed % POSITIVE_STATES.length];
}

interface ByteProps {
  state?: ByteState;
  size?: number;
  className?: string;
  /** Anima a boca como se estivesse falando (lip-sync simples para cenas de diálogo). */
  talking?: boolean;
}

const bodyAnim: Record<ByteState, any> = {
  idle: { y: [0, -4, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  happy: { y: [0, -6, 0], transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } },
  excited: { rotate: [-3, 3, -3], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } },
  celebrate: { y: [0, -16, 0], transition: { duration: 0.5, repeat: Infinity, ease: 'easeOut' } },
  cheer: { rotate: [-6, 6, -6], y: [0, -6, 0], transition: { duration: 0.7, repeat: Infinity } },
  sad: { y: [0, 2, 0], rotate: [0, -4, 4, 0], transition: { duration: 2, repeat: Infinity } },
  sleep: { y: [0, -2, 0], transition: { duration: 4, repeat: Infinity } },
  spin: { rotate: [0, 360], y: [0, -14, 0], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' } },
  jump: { y: [0, -28, 0], scale: [1, 1.12, 1], transition: { duration: 0.55, repeat: Infinity, ease: 'easeOut' } },
  levelup: { y: [0, -10, 0], scale: [1, 1.15, 1], rotate: [-4, 4, -4], transition: { duration: 0.6, repeat: Infinity } },
};

/** Byte — o mascote robô do DevLingo. Reage ao desempenho do usuário. */
export function Byte({ state = 'idle', size = 140, className, talking = false }: ByteProps) {
  const isSad = state === 'sad';
  const isSleep = state === 'sleep';
  const eyeMouth = state !== 'idle' && state !== 'sad' && state !== 'sleep';

  return (
    <motion.div className={className} animate={bodyAnim[state]} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-label="Byte, o mascote">
        {/* sombra */}
        <ellipse cx="100" cy="186" rx="46" ry="8" fill="rgba(0,0,0,0.12)" />

        {/* antena */}
        <line x1="100" y1="40" x2="100" y2="20" stroke="#46A302" strokeWidth="5" strokeLinecap="round" />
        <motion.circle
          cx="100"
          cy="16"
          r="7"
          fill="#FFC800"
          animate={{ scale: state === 'sleep' ? 1 : [1, 1.25, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />

        {/* corpo */}
        <rect x="46" y="40" width="108" height="96" rx="26" fill="#58CC02" />
        <rect x="46" y="40" width="108" height="96" rx="26" fill="url(#shine)" opacity="0.18" />

        {/* visor */}
        <rect x="60" y="58" width="80" height="56" rx="18" fill="#0B2027" />

        {/* olhos */}
        {isSleep ? (
          <>
            <path d="M72 86 q10 8 20 0" stroke="#7EE787" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M108 86 q10 8 20 0" stroke="#7EE787" strokeWidth="4" fill="none" strokeLinecap="round" />
            <text x="138" y="56" fontSize="18" fill="#7EE787">z</text>
          </>
        ) : (
          <>
            <motion.circle
              cx="82"
              cy="84"
              r={eyeMouth ? 9 : 8}
              fill="#7EE787"
              animate={{ scaleY: [1, 1, 0.1, 1] }}
              transition={{ duration: 3.4, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
              style={{ transformOrigin: '82px 84px' }}
            />
            <motion.circle
              cx="118"
              cy="84"
              r={eyeMouth ? 9 : 8}
              fill="#7EE787"
              animate={{ scaleY: [1, 1, 0.1, 1] }}
              transition={{ duration: 3.4, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
            />
          </>
        )}

        {/* boca */}
        {talking ? (
          <motion.ellipse
            cx="100" cy="102" rx="13" fill="#7EE787"
            animate={{ ry: [3, 9, 4, 8, 3] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 102px' }}
          />
        ) : isSad ? (
          <path d="M84 104 q16 -10 32 0" stroke="#7EE787" strokeWidth="4" fill="none" strokeLinecap="round" />
        ) : eyeMouth ? (
          <path d="M82 100 q18 16 36 0" stroke="#7EE787" strokeWidth="4" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M84 102 h32" stroke="#7EE787" strokeWidth="4" fill="none" strokeLinecap="round" />
        )}

        {/* braços */}
        <motion.rect
          x="30" y="74" width="16" height="40" rx="8" fill="#46A302"
          animate={state === 'cheer' || state === 'celebrate' ? { rotate: [-30, -50, -30] } : {}}
          transition={{ duration: 0.6, repeat: Infinity }}
          style={{ transformOrigin: '38px 80px' }}
        />
        <motion.rect
          x="154" y="74" width="16" height="40" rx="8" fill="#46A302"
          animate={state === 'cheer' || state === 'celebrate' ? { rotate: [30, 50, 30] } : {}}
          transition={{ duration: 0.6, repeat: Infinity }}
          style={{ transformOrigin: '162px 80px' }}
        />

        {/* pés */}
        <rect x="64" y="136" width="26" height="20" rx="8" fill="#46A302" />
        <rect x="110" y="136" width="26" height="20" rx="8" fill="#46A302" />

        <defs>
          <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
