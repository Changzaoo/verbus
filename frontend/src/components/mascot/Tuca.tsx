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
          <linearGradient id="tucaBeak" x1="0" y1="0" x2="1" y2="0.6">
            <stop offset="0" stopColor="#FFC83D" />
            <stop offset="0.45" stopColor="#FF9E2C" />
            <stop offset="0.8" stopColor="#FF6A2B" />
            <stop offset="1" stopColor="#E8472A" />
          </linearGradient>
          <linearGradient id="tucaBeakLow" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0" stopColor="#FF8A2B" />
            <stop offset="1" stopColor="#D63A22" />
          </linearGradient>
          <linearGradient id="tucaBody" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0" stopColor="#222831" />
            <stop offset="1" stopColor="#0D1015" />
          </linearGradient>
          <linearGradient id="tucaShine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* sombra */}
        <ellipse cx="96" cy="188" rx="46" ry="7" fill="rgba(0,0,0,0.12)" />

        {/* ----- CAUDA (penas pontudas, retas) ----- */}
        <path d="M52 128 L20 150 L34 156 L26 172 L46 162 L52 174 L62 156 Z" fill="#0E1116" />
        <path d="M52 128 L34 156 L46 162 L60 140 Z" fill="#1A1E25" />

        {/* ----- CORPO (formato de gota inclinado, não círculo) ----- */}
        <path
          d="M70 70 Q118 66 124 116 Q126 154 96 172 Q66 178 52 150 Q44 124 52 100 Q58 78 70 70 Z"
          fill="url(#tucaBody)"
        />

        {/* asa dobrada com penas definidas */}
        <path d="M104 92 Q132 110 122 156 Q112 168 100 166 Q108 130 100 100 Z" fill="#171B22" />
        <g stroke="#0B0E12" strokeWidth="1.6" fill="none" opacity="0.7">
          <path d="M108 104 Q118 124 110 152" />
          <path d="M114 100 Q126 122 116 150" />
        </g>

        {/* peito creme (forma de bavette, com recorte) */}
        <path
          d="M66 78 Q96 78 98 120 Q96 152 80 162 Q60 158 54 132 Q50 104 60 84 Q62 80 66 78 Z"
          fill="#FFF7EC"
        />
        <path d="M66 78 Q96 78 98 120 Q96 152 80 162" fill="none" stroke="#F0C56A" strokeWidth="1.5" opacity="0.5" />
        {/* faixa vermelha sob o peito (tucano-toco) */}
        <path d="M58 150 Q72 162 86 156 Q80 168 70 168 Q60 164 56 154 Z" fill="#E8472A" opacity="0.85" />

        {/* pés (garras zigodáctilas) */}
        <g stroke="#46505E" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M76 168 L74 182 M74 182 l-7 4 M74 182 l-1 6 M74 182 l6 4" />
          <path d="M94 166 L94 180 M94 180 l-7 4 M94 180 l-1 6 M94 180 l6 4" />
        </g>

        {/* ----- CABEÇA (definida, separada do corpo) ----- */}
        <path
          d="M70 50 Q104 44 114 70 Q120 90 108 102 Q86 112 68 100 Q54 86 58 66 Q62 54 70 50 Z"
          fill="url(#tucaBody)"
        />
        {/* brilho superior da cabeça */}
        <path d="M72 52 Q98 48 110 66 Q96 56 76 60 Q70 56 72 52 Z" fill="url(#tucaShine)" opacity="0.12" />

        {/* ----- BICO (grande, curvo, marca do tucano) ----- */}
        {/* mandíbula inferior (anima ao falar) */}
        <motion.g
          style={{ transformOrigin: '108px 90px' }}
          animate={talking ? { rotate: [0, 10, 0, 8, 0] } : isSad ? { rotate: 5 } : { rotate: 0 }}
          transition={talking ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
        >
          <path d="M106 92 Q150 100 184 100 Q156 112 126 108 Q112 106 106 98 Z" fill="url(#tucaBeakLow)" />
          <path d="M106 92 Q150 100 184 100" fill="none" stroke="#B8331E" strokeWidth="1.4" opacity="0.6" />
        </motion.g>
        {/* mandíbula superior (longa e curvando para baixo na ponta) */}
        <path
          d="M104 74 Q150 66 188 84 Q192 90 188 96 Q172 92 150 92 Q124 92 106 90 Q102 82 104 74 Z"
          fill="url(#tucaBeak)"
        />
        {/* culmen (crista superior do bico) */}
        <path d="M104 74 Q150 66 188 84" fill="none" stroke="#FFE9A8" strokeWidth="2" opacity="0.6" strokeLinecap="round" />
        {/* ponta preta curvada */}
        <path d="M180 80 Q192 82 189 92 Q184 96 178 92 Q182 86 180 80 Z" fill="#1C140E" opacity="0.9" />
        {/* base verde-azulada junto ao rosto */}
        <path d="M104 72 Q110 86 106 100 Q100 96 99 86 Q99 76 104 72 Z" fill="#0E1116" />
        <path d="M105 76 Q109 86 106 96" fill="none" stroke="#36C5D6" strokeWidth="2.4" opacity="0.7" strokeLinecap="round" />

        {/* ----- ROSTO ----- */}
        {/* anel azul ao redor do olho (marca do tucano-toco) */}
        <ellipse cx="86" cy="74" rx="17" ry="15" fill="#36C5D6" />
        <ellipse cx="86" cy="74" rx="17" ry="15" fill="url(#tucaShine)" opacity="0.18" />

        {/* olho */}
        {isSleep ? (
          <path d="M78 76 q9 6 18 0" stroke="#15181D" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        ) : (
          <>
            <motion.g
              animate={{ scaleY: [1, 1, 0.1, 1] }}
              transition={{ duration: 3.4, repeat: Infinity, times: [0, 0.92, 0.96, 1] }}
              style={{ transformOrigin: '88px 73px' }}
            >
              <circle cx="88" cy="73" r="8.5" fill="#fff" />
              <circle cx={lively ? 90 : 89} cy="73" r="4.8" fill="#15181D" />
              <circle cx={lively ? 92 : 91} cy="71" r="1.6" fill="#fff" />
            </motion.g>
            {isSad && (
              <path d="M76 62 q11 -5 22 0" stroke="#0E1116" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
          </>
        )}

        {/* soninho */}
        {isSleep && <text x="118" y="56" fontSize="16" fill="#36C5D6">z</text>}
      </svg>
    </motion.div>
  );
}
