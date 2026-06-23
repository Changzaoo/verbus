import { useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#58CC02', '#1CB0F6', '#FF9600', '#FF4B4B', '#CE82FF', '#FFC800', '#00C4FF'];

interface ConfettiProps {
  /** Muda o valor para disparar uma nova explosão. 0 = nada. */
  burstKey: number;
  pieces?: number;
  /** Origem em % da viewport (0-100). Padrão: centro-superior. */
  originX?: number;
  originY?: number;
  power?: number;
}

/**
 * Explosão de confete em DOM (sem assets). Cada mudança de `burstKey` remonta
 * o conjunto de partículas, que animam para fora e desaparecem.
 */
export function Confetti({ burstKey, pieces = 60, originX = 50, originY = 38, power = 1 }: ConfettiProps) {
  const particles = useMemo(() => {
    return Array.from({ length: pieces }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = (120 + Math.random() * 320) * power;
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 80 * power,
        rot: Math.random() * 720 - 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 7 + Math.random() * 9,
        delay: Math.random() * 0.08,
        round: Math.random() > 0.5,
        duration: 0.9 + Math.random() * 0.7,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [burstKey, pieces, power]);

  if (!burstKey) return null;

  return (
    <div key={burstKey} className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${originX}%`,
            top: `${originY}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.round ? '50%' : 2,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y + 220, opacity: [1, 1, 0], rotate: p.rot }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
