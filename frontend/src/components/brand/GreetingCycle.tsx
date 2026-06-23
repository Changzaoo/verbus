import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LangBadge } from '@/components/ui/LangBadge';

/** Saudações nativas dos 16 idiomas do Verbus (ciclam no hero). */
export const GREETINGS: { code: string; word: string; name: string; color: string }[] = [
  { code: 'en', word: 'Hello', name: 'Inglês', color: '#1CB0F6' },
  { code: 'es', word: 'Hola', name: 'Espanhol', color: '#FF9600' },
  { code: 'fr', word: 'Bonjour', name: 'Francês', color: '#2B70C9' },
  { code: 'it', word: 'Ciao', name: 'Italiano', color: '#3FA34D' },
  { code: 'de', word: 'Hallo', name: 'Alemão', color: '#5B6470' },
  { code: 'nl', word: 'Hallo', name: 'Holandês', color: '#FF6B00' },
  { code: 'sv', word: 'Hej', name: 'Sueco', color: '#0A6BA8' },
  { code: 'pl', word: 'Cześć', name: 'Polonês', color: '#DC143C' },
  { code: 'tr', word: 'Merhaba', name: 'Turco', color: '#E30A17' },
  { code: 'ru', word: 'Привет', name: 'Russo', color: '#E0115F' },
  { code: 'el', word: 'Γεια', name: 'Grego', color: '#0D5EAF' },
  { code: 'ar', word: 'مرحبا', name: 'Árabe', color: '#3A9459' },
  { code: 'hi', word: 'नमस्ते', name: 'Hindi', color: '#FF7A00' },
  { code: 'zh', word: '你好', name: 'Mandarim', color: '#FF4B4B' },
  { code: 'ja', word: 'こんにちは', name: 'Japonês', color: '#CE82FF' },
  { code: 'ko', word: '안녕하세요', name: 'Coreano', color: '#00A6C4' },
];

interface GreetingCycleProps {
  intervalMs?: number;
  className?: string;
}

/**
 * Saudação que troca para cada idioma do Verbus, com a bandeira correspondente.
 * É o efeito multilíngue do hero — a "palavra que muda para cada idioma".
 */
export function GreetingCycle({ intervalMs = 1900, className }: GreetingCycleProps) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((x) => (x + 1) % GREETINGS.length), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);

  const g = GREETINGS[i];
  return (
    <span className={`relative inline-flex items-center gap-3 align-middle ${className ?? ''}`}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={g.code}
          initial={{ y: '0.5em', opacity: 0, rotateX: -70 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: '-0.5em', opacity: 0, rotateX: 70 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="inline-flex items-center gap-3"
          style={{ color: g.color, transformStyle: 'preserve-3d' }}
        >
          <span className="inline-grid place-items-center overflow-hidden rounded-xl shadow-sm ring-1 ring-black/10">
            <LangBadge code={g.code} color={g.color} size={42} />
          </span>
          <span className="font-display font-black">{g.word}</span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Wordmark do Verbus — "Verb" + "us" em coral, na fonte display. */
export function VerbusWordmark({ className }: { className?: string }) {
  return (
    <span className={`font-display font-black tracking-tight ${className ?? ''}`}>
      Verb<span className="text-accent">us</span>
    </span>
  );
}

/** Faixa contínua com as saudações dos 16 idiomas (reforça o multilíngue no hero). */
export function GreetingMarquee() {
  const items = [...GREETINGS, ...GREETINGS];
  return (
    <div className="relative overflow-hidden py-3" aria-hidden>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-canvas to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-canvas to-transparent" />
      <motion.div
        className="flex w-max gap-3"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((g, i) => (
          <span key={i} className="inline-flex items-center gap-2 rounded-full border border-edge bg-surface px-4 py-2 shadow-sm">
            <LangBadge code={g.code} color={g.color} size={22} />
            <span className="font-display text-lg font-bold" style={{ color: g.color }}>{g.word}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
