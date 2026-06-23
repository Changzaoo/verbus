import { useCallback, useEffect, useRef, useState } from 'react';

/** Text-to-Speech via Web Speech API (SpeechSynthesis). */
export function useSpeech() {
  const [supported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  );

  const speak = useCallback(
    (text: string, lang = 'en-US', rate = 0.92) => {
      if (!supported) return;
      // Remove romanização entre parênteses para a pronúncia.
      const clean = text.replace(/\s*\([^)]*\)/g, '').trim() || text;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = lang;
      u.rate = rate;
      const match = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(lang.slice(0, 2)));
      if (match) u.voice = match;
      window.speechSynthesis.speak(u);
    },
    [supported],
  );

  return { supported, speak };
}

interface SpeechRecognitionResultLike {
  results: { 0: { transcript: string } }[];
}

/** Reconhecimento de fala (Web Speech API) para exercícios "speak". */
export function useSpeechRecognition(lang = 'en-US') {
  const [supported] = useState(
    () =>
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
  );
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (!supported) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: SpeechRecognitionResultLike) => {
      setTranscript(e.results[0][0].transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    };
  }, [lang, supported]);

  const start = useCallback(() => {
    if (!supported || !recRef.current) return;
    setTranscript('');
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      /* já iniciado */
    }
  }, [supported]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, transcript, start, stop, setTranscript };
}
