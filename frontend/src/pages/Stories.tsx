import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, ArrowLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { fetchDialogues, buildComprehension, prettyTerm, type DialoguePack, type Dialogue, type DialogueTurn } from '@/lib/dialogues';
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
import { SpeakerButton } from '@/components/exercises/SpeakerButton';
import { cn } from '@/lib/cn';
import type { UserProfile } from '@/types';

type Step =
  | { type: 'line'; turn: DialogueTurn }
  | { type: 'q'; turn: DialogueTurn; options: string[] };

export function Stories() {
  const { langId } = useParams<{ langId: string }>();
  const navigate = useNavigate();
  const { data: pack, isLoading } = useQuery({ queryKey: ['dialogues', langId], queryFn: () => fetchDialogues(langId!) });
  const [story, setStory] = useState<Dialogue | null>(null);

  if (isLoading || !pack) return <FullPageSpinner />;
  const stories = pack.dialogues;

  if (!stories.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Tuca state="sleep" size={120} />
        <p className="text-muted">As histórias de {pack.language.name} ainda estão sendo preparadas.</p>
        <Button onClick={() => navigate('/app/practice')}>Voltar ao hub</Button>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app/practice')} aria-label="Voltar" className="text-muted hover:text-ink"><ArrowLeft size={24} /></button>
          <div>
            <h1 className="flex items-center gap-2 font-display text-xl font-extrabold"><BookOpen size={20} className="text-warning" /> Histórias</h1>
            <p className="text-sm text-muted">{pack.language.name} · escolha uma história</p>
          </div>
        </div>
        <div className="grid gap-3">
          {stories.map((t, i) => (
            <motion.button
              key={t.theme}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={() => setStory(t)}
              className="card flex items-center gap-3 p-4 text-left"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white" style={{ backgroundColor: themeColor(t.theme) }}><BookOpen size={24} /></span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold uppercase tracking-wide text-muted">História {i + 1}</div>
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

  return <Reader pack={pack} story={story} onBack={() => setStory(null)} />;
}

function Reader({ pack, story, onBack }: { pack: DialoguePack; story: Dialogue; onBack: () => void }) {
  const navigate = useNavigate();
  const { speak, cancel } = useNarrator();
  const { play } = useSounds();
  const setProfile = useProgressStore((s) => s.setProfile);
  const audioLang = pack.audio_lang;
  const color = themeColor(story.theme);

  const steps = useMemo<Step[]>(() => {
    const out: Step[] = [];
    story.turns.forEach((turn, idx) => {
      out.push({ type: 'line', turn });
      if (idx === 2 || idx === story.turns.length - 1) {
        out.push({ type: 'q', ...buildComprehension(story, turn) });
      }
    });
    return out;
  }, [story]);

  const [pointer, setPointer] = useState(-1);
  const [transcript, setTranscript] = useState<DialogueTurn[]>([]);
  const [talking, setTalking] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const started = useRef(false);
  const awarded = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function enter(p: number) {
    if (p >= steps.length) { setDone(true); cancel(); return; }
    setPointer(p);
    const st = steps[p];
    if (st.type === 'line') {
      setTranscript((h) => [...h, st.turn]);
      setTalking(true);
      speak(prettyTerm(st.turn.term), audioLang, () => setTalking(false));
    }
  }

  useEffect(() => {
    if (!started.current) { started.current = true; enter(0); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [transcript, pointer]);

  useEffect(() => {
    if (done && !awarded.current) {
      awarded.current = true;
      const xp = score * 4 + 6;
      api.post<{ profile: UserProfile }>('/xp/add', { amount: xp, source: 'practice' }).then((r) => setProfile(r.profile)).catch(() => {});
      play('complete');
    }
  }, [done, score, play, setProfile]);

  if (done) {
    return (
      <>
        <Confetti burstKey={1} pieces={80} originX={50} originY={30} />
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <Tuca state="levelup" size={150} />
          <h1 className="font-display text-2xl font-extrabold">Fim da história!</h1>
          <p className="text-muted">Compreensão: <b className="text-correct">{score}</b> acertos · <b className="text-xp">+{score * 4 + 6} XP</b></p>
          <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
            <Button size="lg" fullWidth onClick={onBack}>Outra história</Button>
            <Button variant="secondary" fullWidth onClick={() => navigate('/app/practice')}>Voltar ao hub</Button>
          </div>
        </div>
      </>
    );
  }

  const current = pointer >= 0 ? steps[pointer] : null;
  const activeLine = current?.type === 'line' ? current.turn : transcript[transcript.length - 1];
  const active = activeLine ? activeLine.sp : null;

  function answer(opt: string) {
    if (picked || current?.type !== 'q') return;
    setPicked(opt);
    const ok = opt === current.turn.pt;
    if (ok) { setScore((s) => s + 1); play('correct'); } else play('wrong');
    window.setTimeout(() => { setPicked(null); enter(pointer + 1); }, ok ? 800 : 1300);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button onClick={() => { cancel(); onBack(); }} aria-label="Voltar" className="text-muted hover:text-ink"><ArrowLeft size={24} /></button>
        <div>
          <h1 className="flex items-center gap-2 font-display text-lg font-extrabold"><BookOpen size={18} className="text-warning" /> {story.title}</h1>
          <p className="text-xs text-muted">{story.setting}</p>
        </div>
      </div>

      {/* Palco animado */}
      <DialogueStage
        active={active}
        talking={talking && current?.type === 'line'}
        color={color}
        audioLang={audioLang}
        height={240}
        bubble={activeLine ? { term: prettyTerm(activeLine.term), roman: activeLine.roman, pt: activeLine.pt } : null}
      />

      {/* Transcrição */}
      <div ref={scrollRef} className="flex max-h-[22vh] flex-col gap-2 overflow-y-auto py-1">
        {transcript.map((t, i) => (
          <div key={i} className={cn('flex items-center gap-2 text-sm', t.sp === 'A' ? '' : 'flex-row-reverse text-right')}>
            <span className="rounded-full bg-edge/60 px-2 py-0.5 text-[10px] font-bold uppercase">{t.sp === 'A' ? 'Tuca' : 'Lia'}</span>
            <div className={cn('rounded-xl px-2 py-1', t.sp === 'A' ? 'bg-surface ring-1 ring-edge' : 'bg-brand/10')}>
              <span className="font-bold text-ink">{prettyTerm(t.term)}</span>
              <span className="ml-1 text-xs text-muted">— {t.pt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="rounded-2xl border-2 border-edge bg-surface p-3">
        {current?.type === 'q' ? (
          <>
            <div className="mb-2 flex items-center gap-1 text-sm font-bold text-muted">
              <Sparkles size={14} className="text-brand" /> O que significa «{prettyTerm(current.turn.term)}»?
              <SpeakerButton text={prettyTerm(current.turn.term)} lang={audioLang} size={13} className="bg-transparent p-1 text-muted shadow-none" />
            </div>
            <div className="grid gap-2">
              {current.options.map((opt) => {
                const isPicked = picked === opt;
                const isCorrect = opt === current.turn.pt;
                let tone = 'border-edge bg-canvas hover:border-brand/40';
                if (picked && isCorrect) tone = 'border-correct bg-correct/15 text-correct';
                else if (isPicked && !isCorrect) tone = 'border-wrong bg-wrong/15 text-wrong';
                return (
                  <button key={opt} disabled={!!picked} onClick={() => answer(opt)} className={cn('flex items-center justify-between rounded-xl border-2 px-3 py-3 font-bold text-ink', tone)}>
                    {opt}
                    {picked && isCorrect && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <Button size="lg" fullWidth onClick={() => enter(pointer + 1)} className="flex items-center justify-center gap-2">
            {pointer + 1 >= steps.length ? 'Terminar' : 'Continuar'} <ChevronRight size={18} />
          </Button>
        )}
      </div>
    </div>
  );
}
