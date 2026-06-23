import { useCallback, useEffect, useRef } from 'react';

/**
 * Narração via SpeechSynthesis com callback de término (encadeável).
 * Usado por Podcast, Ligação e Histórias para tocar falas em sequência.
 */
export function useNarrator() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const stopped = useRef(false);

  const cancel = useCallback(() => {
    stopped.current = true;
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  const speak = useCallback(
    (text: string, lang = 'en-US', onend?: () => void, rate = 0.95) => {
      if (!supported) {
        // Sem TTS: simula a duração para o fluxo continuar.
        window.setTimeout(() => { if (!stopped.current) onend?.(); }, 700);
        return;
      }
      stopped.current = false;
      const clean = text.replace(/\s*\([^)]*\)/g, '').trim() || text;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = lang;
      u.rate = rate;
      const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(lang.slice(0, 2)));
      if (voice) u.voice = voice;
      const done = () => { if (!stopped.current) onend?.(); };
      u.onend = done;
      u.onerror = done;
      window.speechSynthesis.speak(u);
    },
    [supported],
  );

  // Para a fala ao desmontar.
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);

  return { supported, speak, cancel };
}
