import { motion } from 'framer-motion';

export type LiaState = 'idle' | 'happy' | 'excited' | 'celebrate' | 'sad';

interface LiaProps {
  state?: LiaState;
  size?: number;
  className?: string;
  /** Anima a boca como se estivesse falando (lip-sync simples). */
  talking?: boolean;
}

const bodyAnim: Record<LiaState, any> = {
  idle: { y: [0, -4, 0], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } },
  happy: { y: [0, -6, 0], transition: { duration: 1.7, repeat: Infinity, ease: 'easeInOut' } },
  excited: { rotate: [-3, 3, -3], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } },
  celebrate: { y: [0, -16, 0], transition: { duration: 0.5, repeat: Infinity, ease: 'easeOut' } },
  sad: { y: [0, 2, 0], rotate: [0, -3, 3, 0], transition: { duration: 2, repeat: Infinity } },
};

/** Lia — a gata exploradora, amiga do Byte. Conversa com ele nas cenas de diálogo. */
export function Lia({ state = 'idle', size = 140, className, talking = false }: LiaProps) {
  const isSad = state === 'sad';
  const happy = state !== 'idle' && state !== 'sad';

  return (
    <motion.div className={className} animate={bodyAnim[state]} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-label="Lia, a gata">
        {/* sombra */}
        <ellipse cx="100" cy="186" rx="44" ry="8" fill="rgba(0,0,0,0.12)" />

        {/* cauda */}
        <motion.path
          d="M150 150 q40 -6 30 -44"
          stroke="#F2A65A" strokeWidth="12" fill="none" strokeLinecap="round"
          animate={{ rotate: happy ? [0, 8, 0] : [0, 4, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '150px 150px' }}
        />

        {/* orelhas */}
        <path d="M60 64 L52 30 L88 52 Z" fill="#F2A65A" />
        <path d="M140 64 L148 30 L112 52 Z" fill="#F2A65A" />
        <path d="M62 58 L58 40 L78 52 Z" fill="#FFD6A5" />
        <path d="M138 58 L142 40 L122 52 Z" fill="#FFD6A5" />

        {/* corpo */}
        <rect x="52" y="92" width="96" height="76" rx="30" fill="#F2A65A" />
        <rect x="52" y="92" width="96" height="76" rx="30" fill="url(#liaShine)" opacity="0.18" />

        {/* cabeça */}
        <circle cx="100" cy="80" r="44" fill="#F4B47A" />
        <circle cx="100" cy="80" r="44" fill="url(#liaShine)" opacity="0.15" />

        {/* focinho */}
        <ellipse cx="100" cy="92" rx="22" ry="16" fill="#FFE8CF" />

        {/* olhos */}
        {isSad ? (
          <>
            <path d="M74 76 q9 7 18 0" stroke="#3B2A1A" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M108 76 q9 7 18 0" stroke="#3B2A1A" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <motion.ellipse cx="83" cy="74" rx="7" ry="9" fill="#2E7D5B"
              animate={{ scaleY: [1, 1, 0.1, 1] }} transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.9, 0.95, 1] }} style={{ transformOrigin: '83px 74px' }} />
            <motion.ellipse cx="117" cy="74" rx="7" ry="9" fill="#2E7D5B"
              animate={{ scaleY: [1, 1, 0.1, 1] }} transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.9, 0.95, 1] }} style={{ transformOrigin: '117px 74px' }} />
            <circle cx="85" cy="71" r="2.4" fill="#fff" />
            <circle cx="119" cy="71" r="2.4" fill="#fff" />
          </>
        )}

        {/* nariz */}
        <path d="M96 86 h8 l-4 5 Z" fill="#E8896B" />

        {/* bigodes */}
        <g stroke="#C98A5A" strokeWidth="2" strokeLinecap="round">
          <line x1="78" y1="90" x2="56" y2="86" />
          <line x1="78" y1="95" x2="56" y2="96" />
          <line x1="122" y1="90" x2="144" y2="86" />
          <line x1="122" y1="95" x2="144" y2="96" />
        </g>

        {/* boca */}
        {talking ? (
          <motion.ellipse cx="100" cy="100" rx="7" fill="#A65336"
            animate={{ ry: [2, 6, 3, 5, 2] }} transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '100px 100px' }} />
        ) : isSad ? (
          <path d="M92 102 q8 -6 16 0" stroke="#A65336" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : happy ? (
          <path d="M90 98 q10 9 20 0" stroke="#A65336" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M92 99 q8 5 16 0" stroke="#A65336" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}

        {/* patas */}
        <motion.ellipse cx="74" cy="166" rx="16" ry="11" fill="#E8965A"
          animate={state === 'celebrate' ? { y: [0, -8, 0] } : {}} transition={{ duration: 0.5, repeat: Infinity }} />
        <motion.ellipse cx="126" cy="166" rx="16" ry="11" fill="#E8965A"
          animate={state === 'celebrate' ? { y: [0, -8, 0] } : {}} transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }} />

        <defs>
          <linearGradient id="liaShine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
