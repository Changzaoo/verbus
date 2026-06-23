import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff, PhoneCall, Volume2, Check, Sparkles, Zap } from 'lucide-react';
import { fetchDialogues, buildCallExchanges, prettyTerm, shuffle, type DialoguePack, type CallExchange } from '@/lib/dialogues';
import { useNarrator } from '@/hooks/useNarrator';
import { useSounds } from '@/hooks/useSounds';
import { useProgressStore } from '@/store/progressStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Tuca, type ByteState } from '@/components/mascot/Tuca';
import { Lia } from '@/components/mascot/Lia';
import { Confetti } from '@/components/gamification/Confetti';
import { SpeakerButton } from '@/components/exercises/SpeakerButton';
import { cn } from '@/lib/cn';
import type { UserProfile } from '@/types';

interface Bubble { who: 'byte' | 'me'; term: string; pt: string; roman?: string; }

export function Call() {
  const { langId } = useParams<{ langId: string }>();
  const { data: pack, isLoading } = useQuery({ queryKey: ['dialogues', langId], queryFn: () => fetchDialogues(langId!) });
  if (isLoading || !pack) return <FullPageSpinner />;
  if (!pack.dialogues.length) return <NoContent name={pack.language.name} />;
  return <CallScreen pack={pack} />;
}

function NoContent({ name }: { name: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <Tuca state="sleep" size={120} />
      <p className="text-muted">Os diálogos de {name} ainda estão sendo preparados.</p>
      <Button onClick={() => navigate('/app/practice')}>Voltar ao hub</Button>
    </div>
  );
}

function CallScreen({ pack }: { pack: DialoguePack }) {
  const navigate = useNavigate();
  const { speak, cancel } = useNarrator();
  const { play } = useSounds();
  const setProfile = useProgressStore((s) => s.setProfile);
  const audioLang = pack.audio_lang;

  // Junta os turnos de 2 diálogos coerentes para uma conversa mais longa (até 5 trocas).
  const exchanges = useMemo<CallExchange[]>(() => {
    const picked = shuffle(pack.dialogues).slice(0, 2);
    return picked.flatMap((d) => buildCallExchanges(d)).slice(0, 5);
  }, [pack]);

  const [phase, setPhase] = useState<'ringing' | 'incall' | 'over'>('ringing');
  const [step, setStep] = useState(0);
  const [turn, setTurn] = useState<'byte' | 'me'>('byte');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [byteState, setByteState] = useState<ByteState>('idle');
  const [byteTalking, setByteTalking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const awarded = useRef(false);

  useEffect(() => {
    if (phase !== 'incall') return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [bubbles, turn]);

  useEffect(() => {
    if (phase === 'over' && !awarded.current) {
      awarded.current = true;
      const xp = score * 5 + 5;
      api.post<{ profile: UserProfile }>('/xp/add', { amount: Math.min(1000, xp), source: 'practice' }).then((r) => setProfile(r.profile)).catch(() => {});
      play('complete');
    }
  }, [phase, score, play, setProfile]);

  function byteSpeak(i: number) {
    const ex = exchanges[i];
    if (!ex) { setPhase('over'); return; }
    setTurn('byte');
    setByteState('happy');
    setByteTalking(true);
    setBubbles((b) => [...b, { who: 'byte', term: prettyTerm(ex.prompt.term), pt: ex.prompt.pt, roman: ex.prompt.roman }]);
    speak(prettyTerm(ex.prompt.term), audioLang, () => { setByteTalking(false); setByteState('idle'); setTurn('me'); });
  }

  function accept() {
    play('tap');
    setPhase('incall');
    setStep(0);
    window.setTimeout(() => byteSpeak(0), 500);
  }

  function pick(opt: string) {
    if (picked) return;
    const ex = exchanges[step];
    const correct = prettyTerm(ex.reply.term);
    setPicked(opt);
    const ok = opt === correct;
    if (ok) {
      play('correct');
      setScore((s) => s + 1);
      setBubbles((b) => [...b, { who: 'me', term: correct, pt: ex.reply.pt, roman: ex.reply.roman }]);
      speak(correct, audioLang);
    } else {
      play('wrong');
    }
    window.setTimeout(() => {
      setPicked(null);
      const next = step + 1;
      if (next >= exchanges.length) setPhase('over');
      else { setStep(next); byteSpeak(next); }
    }, ok ? 900 : 1400);
  }

  function hangup() { cancel(); navigate('/app/practice'); }

  if (phase === 'ringing') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
        <motion.div animate={{ rotate: [-8, 8, -8] }} transition={{ duration: 0.6, repeat: Infinity }}>
          <Tuca state="happy" size={150} />
        </motion.div>
        <div>
          <div className="text-sm font-bold uppercase tracking-wide text-muted">Chamada recebida</div>
          <h1 className="font-display text-2xl font-extrabold">Tuca está te ligando…</h1>
          <p className="mt-1 text-muted">Pratique uma conversa de verdade em {pack.language.name}.</p>
        </div>
        <div className="flex items-center gap-10">
          <button onClick={hangup} className="flex flex-col items-center gap-1">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-wrong text-white shadow-btn"><PhoneOff size={28} /></span>
            <span className="text-xs font-bold text-muted">Recusar</span>
          </button>
          <motion.button onClick={accept} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1, repeat: Infinity }} className="flex flex-col items-center gap-1">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-correct text-white shadow-btn"><PhoneCall size={28} /></span>
            <span className="text-xs font-bold text-muted">Atender</span>
          </motion.button>
        </div>
      </div>
    );
  }

  if (phase === 'over') {
    const xp = Math.min(1000, score * 5 + 5);
    return (
      <>
        <Confetti burstKey={1} pieces={70} originX={50} originY={30} />
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <Tuca state={score >= exchanges.length ? 'levelup' : 'celebrate'} size={150} />
          <h1 className="font-display text-2xl font-extrabold">Chamada encerrada!</h1>
          <p className="text-muted">Respostas certas: <b className="text-correct">{score}/{exchanges.length}</b></p>
          <div className="flex items-center gap-1 text-lg font-extrabold text-xp"><Zap size={18} /> +{xp} XP</div>
          <Button size="lg" onClick={() => navigate('/app/practice')} className="mt-2">Voltar ao hub</Button>
        </div>
      </>
    );
  }

  const ex = exchanges[step];

  return (
    <div className="flex flex-col gap-3">
      {/* Cabeçalho da chamada com Tuca falando */}
      <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-edge">
        <Tuca state={byteState} talking={byteTalking} size={48} />
        <div className="flex-1">
          <div className="font-extrabold">Tuca</div>
          <div className="flex items-center gap-1 text-xs text-correct"><PhoneCall size={12} /> {fmt(seconds)}</div>
        </div>
        <button onClick={hangup} aria-label="Desligar" className="grid h-11 w-11 place-items-center rounded-full bg-wrong text-white"><PhoneOff size={20} /></button>
      </div>

      {/* Balões */}
      <div ref={scrollRef} className="flex max-h-[44vh] flex-col gap-2 overflow-y-auto py-1">
        <AnimatePresence initial={false}>
          {bubbles.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn('flex items-end gap-2', b.who === 'byte' ? '' : 'flex-row-reverse')}
            >
              {b.who === 'byte' ? <Tuca state="idle" size={30} /> : <Lia state="happy" size={30} />}
              <div className={cn('max-w-[78%] rounded-2xl px-3 py-2', b.who === 'byte' ? 'rounded-bl-sm bg-surface ring-1 ring-edge' : 'rounded-br-sm bg-brand/15')}>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-ink">{b.term}</span>
                  <SpeakerButton text={b.term} lang={audioLang} size={14} className="bg-transparent p-1 text-muted shadow-none" />
                </div>
                {b.roman && <div className="text-[11px] italic text-muted">{b.roman}</div>}
                <div className="text-xs text-muted">{b.pt}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sua vez */}
      <div className="rounded-2xl border-2 border-edge bg-surface p-3">
        {turn === 'byte' ? (
          <div className="flex items-center justify-center gap-2 py-3 text-muted">
            <Volume2 size={18} /> Tuca está falando…
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center gap-1 text-sm font-bold text-muted">
              <Sparkles size={14} className="text-brand" /> Responda «{ex.reply.pt}»
            </div>
            <div className="grid gap-2">
              {ex.options.map((opt) => {
                const isPicked = picked === opt;
                const isCorrect = opt === prettyTerm(ex.reply.term);
                let tone = 'border-edge bg-canvas hover:border-brand/40';
                if (picked && isCorrect) tone = 'border-correct bg-correct/15 text-correct';
                else if (isPicked && !isCorrect) tone = 'border-wrong bg-wrong/15 text-wrong';
                return (
                  <button key={opt} disabled={!!picked} onClick={() => pick(opt)} className={cn('flex items-center justify-between rounded-xl border-2 px-3 py-3 font-bold text-ink', tone)}>
                    {opt}
                    {picked && isCorrect && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}
