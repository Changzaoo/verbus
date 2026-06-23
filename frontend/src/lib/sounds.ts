// Sons de feedback gerados via Web Audio API — zero assets externos.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

interface Note {
  freq: number;
  start: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
}

function playSequence(notes: Note[]): void {
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime;
  for (const n of notes) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = n.type ?? 'sine';
    osc.frequency.value = n.freq;
    const t0 = now + n.start;
    const peak = n.gain ?? 0.15;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + n.duration);
    osc.connect(gain).connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + n.duration + 0.02);
  }
}

export const sfx = {
  correct(): void {
    playSequence([
      { freq: 587.33, start: 0, duration: 0.12, type: 'triangle' },
      { freq: 880.0, start: 0.09, duration: 0.18, type: 'triangle' },
    ]);
  },
  wrong(): void {
    playSequence([
      { freq: 196.0, start: 0, duration: 0.18, type: 'sawtooth', gain: 0.1 },
      { freq: 155.56, start: 0.12, duration: 0.22, type: 'sawtooth', gain: 0.1 },
    ]);
  },
  complete(): void {
    playSequence([
      { freq: 523.25, start: 0, duration: 0.14, type: 'triangle' },
      { freq: 659.25, start: 0.12, duration: 0.14, type: 'triangle' },
      { freq: 783.99, start: 0.24, duration: 0.14, type: 'triangle' },
      { freq: 1046.5, start: 0.36, duration: 0.3, type: 'triangle' },
    ]);
  },
  tap(): void {
    playSequence([{ freq: 330, start: 0, duration: 0.06, type: 'sine', gain: 0.08 }]);
  },
  reward(): void {
    playSequence([
      { freq: 880, start: 0, duration: 0.1, type: 'square', gain: 0.08 },
      { freq: 1174.66, start: 0.1, duration: 0.1, type: 'square', gain: 0.08 },
      { freq: 1567.98, start: 0.2, duration: 0.25, type: 'square', gain: 0.08 },
    ]);
  },
  streak(): void {
    playSequence([
      { freq: 440, start: 0, duration: 0.1, type: 'triangle' },
      { freq: 554.37, start: 0.1, duration: 0.1, type: 'triangle' },
      { freq: 659.25, start: 0.2, duration: 0.2, type: 'triangle' },
    ]);
  },
  combo(): void {
    playSequence([
      { freq: 659.25, start: 0, duration: 0.08, type: 'triangle', gain: 0.12 },
      { freq: 880, start: 0.07, duration: 0.08, type: 'triangle', gain: 0.13 },
      { freq: 1108.73, start: 0.14, duration: 0.14, type: 'triangle', gain: 0.14 },
    ]);
  },
  levelup(): void {
    playSequence([
      { freq: 523.25, start: 0, duration: 0.12, type: 'square', gain: 0.08 },
      { freq: 659.25, start: 0.12, duration: 0.12, type: 'square', gain: 0.08 },
      { freq: 783.99, start: 0.24, duration: 0.12, type: 'square', gain: 0.08 },
      { freq: 1046.5, start: 0.36, duration: 0.12, type: 'square', gain: 0.09 },
      { freq: 1318.51, start: 0.48, duration: 0.35, type: 'square', gain: 0.1 },
    ]);
  },
};

export type SfxName = keyof typeof sfx;
