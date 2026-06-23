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

interface TucaProps {
  state?: ByteState;
  size?: number;
  className?: string;
  /** Anima o bico como se estivesse falando (lip-sync simples para cenas de diálogo). */
  talking?: boolean;
}

const bodyAnim: Record<ByteState, any> = {
  idle: { y: [0, -4, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  happy: { y: [0, -6, 0], transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } },
  excited: { rotate: [-3, 3, -3], transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } },
  celebrate: { y: [0, -16, 0], transition: { duration: 0.5, repeat: Infinity, ease: 'easeOut' } },
  cheer: { rotate: [-5, 5, -5], y: [0, -6, 0], transition: { duration: 0.7, repeat: Infinity } },
  sad: { y: [0, 3, 0], rotate: [0, -3, 3, 0], transition: { duration: 2, repeat: Infinity } },
  sleep: { y: [0, -2, 0], transition: { duration: 4, repeat: Infinity } },
  spin: { rotate: [0, 360], y: [0, -14, 0], transition: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' } },
  jump: { y: [0, -26, 0], scale: [1, 1.1, 1], transition: { duration: 0.55, repeat: Infinity, ease: 'easeOut' } },
  levelup: { y: [0, -10, 0], scale: [1, 1.12, 1], rotate: [-4, 4, -4], transition: { duration: 0.6, repeat: Infinity } },
};

/** Tuca — o tucano do Verbus. Mascote brasileiro que reage ao desempenho do usuário. */
export function Tuca({ state = 'idle', size = 140, className, talking = false }: TucaProps) {
  const isSad = state === 'sad';
  const isSleep = state === 'sleep';
  const lively = state !== 'idle' && state !== 'sad' && state !== 'sleep';

  return (
    <motion.div className={className} animate={bodyAnim[state]} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-label="Tuca, o tucano do Verbus">
        <defs>
          <linearGradient id="tucaBeak" x1="0" y1="0" x2="1" y2="0.5">
            <stop offset="0" stopColor="#FFB22E" />
            <stop offset="0.55" stopColor="#FF8A2B" />
            <stop offset="1" stopColor="#FF5E3A" />
          </linearGradient>
          <linearGradient id="tucaShine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* sombra */}
        <ellipse cx="92" cy="187" rx="48" ry="8" fill="rgba(0,0,0,0.12)" />

        {/* cauda */}
        <path d="M44 118 Q24 150 40 168 L60 150 Q52 132 60 118 Z" fill="#0E1116" />

        {/* corpo */}
        <ellipse cx="88" cy="120" rx="52" ry="54" fill="#15181D" />
        <ellipse cx="88" cy="120" rx="52" ry="54" fill="url(#tucaShine)" opacity="0.06" />
        {/* asa */}
        <path d="M96 92 Q132 104 120 158 Q104 150 96 120 Z" fill="#22262E" />

        {/* peito creme */}
        <path d="M70 96 Q104 100 100 140 Q92 164 72 162 Q56 150 58 120 Q60 102 70 96 Z" fill="#FFF7EC" />

        {/* pés */}
        <g stroke="#5A6675" strokeWidth="4" strokeLinecap="round">
          <line x1="78" y1="170" x2="78" y2="180" />
          <line x1="98" y1="170" x2="98" y2="180" />
          <path d="M72 180 h12 M92 180 h12" />
        </g>

        {/* ----- BICO ----- */}
        {/* mandíbula inferior (anima ao falar) */}
        <motion.g
          style={{ transformOrigin: '116px 98px' }}
          animate={talking ? { rotate: [0, 9, 0, 7, 0] } : isSad ? { rotate: 4 } : { rotate: 0 }}
          transition={talking ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
        >
          <path d="M116 98 Q150 102 186 88 Q162 104 134 104 Q122 104 116 100 Z" fill="url(#tucaBeak)" />
        </motion.g>
        {/* mandíbula superior */}
        <path d="M114 86 Q150 74 192 82 Q170 92 150 95 Q130 95 116 94 Z" fill="url(#tucaBeak)" />
        {/* ponta escura + culmen */}
        <path d="M180 83 Q190 81 192 82 Q186 88 178 89 Z" fill="#1C140E" opacity="0.85" />
        <path d="M114 86 Q150 74 192 82" fill="none" stroke="#C8451F" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
        {/* base do bico junto ao rosto */}
        <path d="M110 80 Q116 90 112 100 Q106 96 106 88 Q106 82 110 80 Z" fill="#0E1116" />

        {/* ----- ROSTO ----- */}
        {/* anel azul ao redor do olho (marca do tucano-toco) */}
        <ellipse cx="98" cy="86" rx="20" ry="18" fill="#36C5D6" />
        <ellipse cx="98" cy="86" rx="20" ry="18" fill="url(#tucaShine)" opacity="0.18" />

        {/* olho */}
        {isSleep ? (
          <path d="M88 88 q10 7 20 0" stroke="#15181D" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        ) : (
          <>
            <motion.g
              animate={{ scaleY: [1, 1, 0.1, 1] }}
              transition={{ duration: 3.4, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
              style={{ transformOrigin: '99px 85px' }}
            >
              <circle cx="99" cy="85" r="9" fill="#fff" />
              <circle cx={lively ? 101 : 100} cy="85" r="5" fill="#15181D" />
              <circle cx={lively ? 103 : 102} cy="83" r="1.6" fill="#fff" />
            </motion.g>
            {isSad && (
              <path d="M86 74 q12 -5 24 0" stroke="#0E1116" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
          </>
        )}

        {/* soninho */}
        {isSleep && <text x="126" y="64" fontSize="16" fill="#36C5D6">z</text>}
      </svg>
    </motion.div>
  );
}
