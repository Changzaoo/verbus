import { useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Radio, Play, Pause, ArrowLeft, Check, Sparkles, Volume2, ChevronRight } from 'lucide-react';
import { fetchDialogues, buildComprehension, prettyTerm, shuffle, type DialoguePack, type Dialogue, type DialogueTurn, type Speaker } from '@/lib/dialogues';
import { useNarrator } from '@/hooks/useNarrator';
import { useSounds } from '@/hooks/useSounds';
import { useProgressStore } from '@/store/progressStore';
import { themeColor } from '@/lib/themeColor';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Tuca } from '@/components/mascot/Tuca';
import { DialogueStage } from '@/components/scene/DialogueStage';
import { Confetti } from '@/components/gamification/Confetti';
import { cn } from '@/lib/cn';
import type { UserProfile } from '@/types';

interface Line { kind: 'host' | 'turn'; text: string; lang: string; sp?: Speaker; turn?: DialogueTurn; }

export function Podcast() {
  const { langId } = useParams<{ langId: string }>();
  const navigate = useNavigate();
  const { data: pack, isLoading } = useQuery({ queryKey: ['dialogues', langId], queryFn: () => fetchDialogues(langId!) });
  const [episode, setEpisode] = useState<Dialogue | null>(null);

  if (isLoading || !pack) return <FullPageSpinner />;
  const episodes = pack.dialogues;

  if (!episodes.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Tuca state="sleep" size={120} />
        <p className="text-muted">Os episódios de {pack.language.name} ainda estão sendo preparados.</p>
        <Button onClick={() => navigate('/app/practice')}>Voltar ao hub</Button>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="flex flex-col gap-4">
        <Header onBack={() => navigate('/app/practice')} title="Podcast" subtitle={`${pack.language.name} · escolha um episódio`} />
        <div className="grid gap-3">
          {episodes.map((t, i) => (
            <motion.button
              key={t.theme}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={() => setEpisode(t)}
              className="card flex items-center gap-3 p-4 text-left"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white" style={{ backgroundColor: themeColor(t.theme) }}><Radio size={24} /></span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold uppercase tracking-wide text-muted">Episódio {i + 1}</div>
                <div className="truncate font-extrabold">{t.title}</div>
                <div className="truncate text-sm text-muted">{t.setting}</div>
              </div>
              <ChevronRight className="text-muted" size={20} />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return <Player pack={pack} episode={episode} onBack={() => setEpisode(null)} />;
}

function Player({ pack, episode, onBack }: { pack: DialoguePack; episode: Dialogue; onBack: () => void }) {
  const { speak, cancel } = useNarrator();
  const { play } = useSounds();
  const setProfile = useProgressStore((s) => s.setProfile);
  const color = themeColor(episode.theme);

  const lines = useMemo<Line[]>(() => {
    const out: Line[] = [{ kind: 'host', text: `Olá! Bem-vindo ao Verbus Podcast. O tema de hoje é: ${episode.title}. ${episode.setting}`, lang: 'pt-BR' }];
    episode.turns.forEach((turn) => out.push({ kind: 'turn', text: prettyTerm(turn.term), lang: pack.audio_lang, sp: turn.sp, turn }));
    out.push({ kind: 'host', text: 'Isso é tudo por hoje. Continue praticando. Até a próxima!', lang: 'pt-BR' });
    return out;
  }, [episode, pack.audio_lang]);

  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [talking, setTalking] = useState(false);
  const [ended, setEnded] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const stop = useRef(false);

  function playFrom(i: number) {
    if (i >= lines.length) { setPlaying(false); setTalking(false); setEnded(true); return; }
    stop.current = false;
    setCurrent(i);
    setPlaying(true);
    const line = lines[i];
    setTalking(line.kind === 'turn');
    speak(line.text, line.lang, () => { setTalking(false); if (!stop.current) playFrom(i + 1); });
  }
  function pause() { stop.current = true; cancel(); setPlaying(false); setTalking(false); }
  function toggle() { if (playing) pause(); else playFrom(ended ? 0 : current); if (ended) setEnded(false); }

  if (quiz) return <PodcastQuiz episode={episode} color={color} onBack={onBack} play={play} setProfile={setProfile} />;

  const line = lines[current];
  const active: Speaker | null = line?.kind === 'turn' ? line.sp ?? null : playing ? 'A' : null;
  const bubble = line?.kind === 'turn' && line.turn
    ? { term: prettyTerm(line.turn.term), roman: line.turn.roman, pt: line.turn.pt }
    : null;

  return (
    <div className="flex flex-col gap-4">
      <Header onBack={() => { cancel(); onBack(); }} title={episode.title} subtitle="Podcast · ouça e acompanhe" />

      {/* Estúdio animado */}
      <DialogueStage active={active} talking={talking} color={color} audioLang={pack.audio_lang} height={250} bubble={bubble} />

      {/* Controle do player */}
      <div className="card flex items-center gap-4 p-4" style={{ borderColor: color }}>
        <motion.span className="grid h-12 w-12 place-items-center rounded-full text-white" style={{ backgroundColor: color }}
          animate={playing ? { rotate: 360 } : {}} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
          <Radio size={24} />
        </motion.span>
        <div className="flex-1">
          <div className="font-extrabold">{episode.title}</div>
          <div className="text-sm text-muted">{playing ? 'No ar…' : ended ? 'Fim do episódio' : 'Pausado'}</div>
        </div>
        <button onClick={toggle} aria-label={playing ? 'Pausar' : 'Tocar'} className="grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-btn active:translate-y-[2px]">
          {playing ? <Pause size={26} /> : <Play size={26} />}
        </button>
      </div>

      {/* Transcrição sincronizada */}
      <div className="flex flex-col gap-2">
        {lines.map((l, i) => (
          <button
            key={i}
            onClick={() => playFrom(i)}
            className={cn('rounded-2xl border-2 p-3 text-left transition-colors', i === current ? 'border-brand bg-brand/10' : 'border-edge bg-surface')}
          >
            {l.kind === 'host' ? (
              <div className="flex items-start gap-2 text-sm text-muted">
                <span className="rounded-full bg-edge/60 px-2 py-0.5 text-[10px] font-bold uppercase">Host</span>
                <span>{l.text}</span>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', l.sp === 'A' ? 'bg-correct/15 text-correct' : 'bg-brand/15 text-brand')}>{l.sp === 'A' ? 'Tuca' : 'Lia'}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Volume2 size={16} className={cn('shrink-0', i === current ? 'text-brand' : 'text-muted')} />
                    <span className="font-bold text-ink">{l.text}</span>
                  </div>
                  {l.turn?.roman && <div className="text-xs italic text-muted">{l.turn.roman}</div>}
                  <div className="text-sm text-muted">{l.turn?.pt}</div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      <Button size="lg" fullWidth onClick={() => { cancel(); setQuiz(true); }} className="flex items-center justify-center gap-2">
        Fazer o quiz <ChevronRight size={18} />
      </Button>
    </div>
  );
}

function PodcastQuiz({ episode, color, onBack, play, setProfile }: { episode: Dialogue; color: string; onBack: () => void; play: (s: 'correct' | 'wrong' | 'complete') => void; setProfile: (p: UserProfile) => void }) {
  const questions = useMemo(() => {
    const picks = shuffle(episode.turns).slice(0, Math.min(3, episode.turns.length));
    return picks.map((turn: DialogueTurn) => buildComprehension(episode, turn));
  }, [episode]);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const awarded = useRef(false);

  if (done) {
    if (!awarded.current) {
      awarded.current = true;
      const xp = correctCount * 4 + 4;
      api.post<{ profile: UserProfile }>('/xp/add', { amount: xp, source: 'practice' }).then((r) => setProfile(r.profile)).catch(() => {});
      play('complete');
    }
    return (
      <>
        <Confetti burstKey={1} pieces={70} originX={50} originY={30} />
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <Tuca state="celebrate" size={150} />
          <h1 className="font-display text-2xl font-extrabold">Episódio concluído!</h1>
          <p className="text-muted">Você acertou <b className="text-correct">{correctCount}/{questions.length}</b> e ganhou <b className="text-xp">+{correctCount * 4 + 4} XP</b>.</p>
          <Button size="lg" onClick={onBack} className="mt-2">Voltar aos episódios</Button>
        </div>
      </>
    );
  }

  const q = questions[i];
  function answer(opt: string) {
    if (picked) return;
    setPicked(opt);
    const ok = opt === q.turn.pt;
    if (ok) { setCorrectCount((c) => c + 1); play('correct'); } else play('wrong');
    window.setTimeout(() => {
      if (i + 1 >= questions.length) setDone(true);
      else { setI((x) => x + 1); setPicked(null); }
    }, 900);
  }

  return (
    <div className="flex flex-col gap-4">
      <Header onBack={onBack} title="Quiz do episódio" subtitle={`Pergunta ${i + 1} de ${questions.length}`} />
      <div className="card p-5 text-center" style={{ borderColor: color }}>
        <div className="text-sm font-bold uppercase tracking-wide text-muted">O que significa?</div>
        <div className="mt-2 text-2xl font-extrabold text-ink">{prettyTerm(q.turn.term)}</div>
        {q.turn.roman && <div className="text-sm italic text-muted">{q.turn.roman}</div>}
      </div>
      <div className="grid gap-3">
        {q.options.map((opt) => {
          const isPicked = picked === opt;
          const isCorrect = opt === q.turn.pt;
          let tone = 'border-edge bg-surface hover:border-brand/40';
          if (picked && isCorrect) tone = 'border-correct bg-correct/15 text-correct';
          else if (isPicked && !isCorrect) tone = 'border-wrong bg-wrong/15 text-wrong';
          return (
            <button key={opt} disabled={!!picked} onClick={() => answer(opt)} className={cn('flex items-center justify-between rounded-2xl border-2 px-4 py-3 font-bold text-ink', tone)}>
              {opt}
              {picked && isCorrect && <Check size={18} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Header({ onBack, title, subtitle }: { onBack: () => void; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={onBack} aria-label="Voltar" className="text-muted hover:text-ink"><ArrowLeft size={24} /></button>
      <div>
        <h1 className="flex items-center gap-2 font-display text-xl font-extrabold"><Sparkles size={18} className="text-brand" /> {title}</h1>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
