import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, type Variants } from 'framer-motion';
import {
  Flame, Trophy, MessagesSquare, Headphones, BookOpen, Sparkles,
  ArrowRight, Star, Quote, Phone, Globe,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Byte } from '@/components/mascot/Byte';
import { Lia } from '@/components/mascot/Lia';
import { GreetingCycle, VerbusWordmark } from '@/components/brand/GreetingCycle';
import { Confetti } from '@/components/gamification/Confetti';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LangBadge } from '@/components/ui/LangBadge';
import { useSounds } from '@/hooks/useSounds';
import { cn } from '@/lib/cn';
import type { Language } from '@/types';

const FEATURES = [
  { icon: Phone, title: 'Ligações com o Byte', desc: 'Atenda uma chamada e converse de verdade — pergunta e resposta, como na vida real.', tint: 'text-accent' },
  { icon: BookOpen, title: 'Histórias animadas', desc: 'Cenas com personagens que falam, no melhor estilo de uma série interativa.', tint: 'text-lang-japanese' },
  { icon: Headphones, title: 'Podcast / DuoRadio', desc: 'Episódios narrados para treinar o ouvido enquanto acompanha a transcrição.', tint: 'text-gems' },
  { icon: Sparkles, title: 'Revisão inteligente', desc: 'Um algoritmo de repetição espaçada fixa o vocabulário antes de você esquecer.', tint: 'text-accent' },
  { icon: Flame, title: 'Streaks e XP', desc: 'Ofensivas diárias e metas que transformam o estudo em hábito.', tint: 'text-streak' },
  { icon: MessagesSquare, title: 'Conversas reais', desc: 'Diálogos coerentes e cotidianos — nada de frases soltas sem sentido.', tint: 'text-lang-english' },
];

const TESTIMONIALS = [
  { name: 'Camila', role: 'Designer', text: 'Em três meses eu já mantinha conversas básicas em italiano. As histórias viciam!' },
  { name: 'Rafael', role: 'Empreendedor', text: 'Finalmente um app que ensina a falar de verdade, com diálogos que fazem sentido.' },
  { name: 'Júlia', role: 'Estudante', text: 'O streak me fez estudar japonês 60 dias seguidos. Já leio meus mangás favoritos!' },
];

const STATS = [
  { value: '16', label: 'idiomas' },
  { value: '1.500+', label: 'lições' },
  { value: '100%', label: 'grátis para começar' },
];

const containerStagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } } };
const fadeInScale: Variants = { hidden: { opacity: 0, scale: 0.86 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } } };

export function Landing() {
  const { data: languages } = useQuery({ queryKey: ['languages'], queryFn: () => api.get<Language[]>('/languages', false) });
  const { play } = useSounds();
  const [burst, setBurst] = useState(0);
  const celebrate = () => { setBurst((b) => b + 1); play('reward'); };

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-ink">
      <Confetti burstKey={burst} pieces={70} power={1.1} originX={50} originY={42} />

      {/* Brilhos decorativos */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-brand/20 blur-3xl"
          animate={{ y: [0, 30, 0], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute right-[-6rem] top-40 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
          animate={{ y: [0, -36, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gems/15 blur-3xl"
          animate={{ y: [0, 24, 0], opacity: [0.25, 0.5, 0.25] }} transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      {/* Header */}
      <motion.header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5"
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
        <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Byte size={40} />
          <VerbusWordmark className="text-2xl text-brand" />
        </motion.div>
        <Link to="/login">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="secondary" size="sm">Entrar</Button>
          </motion.div>
        </Link>
      </motion.header>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-6 py-12 md:grid-cols-2 md:py-16">
        <motion.div variants={containerStagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-edge bg-surface px-4 py-1.5 text-xs font-bold text-muted shadow-sm">
            <Globe size={14} className="text-accent" /> 16 idiomas · do primeiro «olá» à fluência
          </motion.div>

          <motion.h1 variants={fadeUp} className="font-display text-4xl font-black leading-[1.05] md:text-5xl lg:text-6xl">
            Aprenda a dizer
            <span className="mt-3 block"><GreetingCycle /></span>
            <span className="mt-3 block text-3xl font-bold text-muted md:text-4xl">
              ao mundo — com a <VerbusWordmark className="text-ink" />.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-5 max-w-md text-lg text-muted">
            A <b className="text-ink">Verbus</b> te leva do primeiro cumprimento até conversas de verdade:
            ligações, histórias animadas e podcasts em 16 idiomas.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="sm:flex-1" onClick={celebrate}>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Button size="lg" fullWidth className="group">
                  <span className="inline-flex items-center justify-center gap-2">
                    Começar grátis
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </motion.div>
            </Link>
            <Link to="/login" className="sm:flex-1">
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Button size="lg" variant="secondary" fullWidth>Já tenho conta</Button>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-10 flex gap-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-black text-accent">{s.value}</div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Dupla de mascotes */}
        <motion.div className="relative flex items-end justify-center gap-2"
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}>
          <motion.div className="absolute top-1/2 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-2xl"
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <Byte state="cheer" size={220} />
          </motion.div>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
            <Lia state="happy" size={150} />
          </motion.div>

          <motion.div className="pill absolute -left-2 top-6 flex items-center gap-1 bg-surface text-streak shadow-lg"
            animate={{ y: [0, -8, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}>
            <Flame size={16} /> <span className="text-sm font-bold">+50 XP</span>
          </motion.div>
          <motion.div className="pill absolute -right-1 bottom-16 flex items-center gap-1 bg-surface text-gems shadow-lg"
            animate={{ y: [0, 8, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}>
            <Trophy size={16} /> <span className="text-sm font-bold">Nível 5</span>
          </motion.div>
        </motion.div>
      </section>

      {/* Idiomas */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <motion.h2 className="mb-6 text-center font-display text-2xl font-black md:text-3xl"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5 }}>
          16 idiomas, uma missão: <span className="text-accent">você poliglota</span>
        </motion.h2>
        <motion.div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
          variants={containerStagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          {(languages ?? []).map((l) => (
            <motion.div key={l.id} variants={fadeInScale} whileHover={{ y: -8, scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Card className="group relative flex flex-col items-center gap-1 overflow-hidden text-center transition-shadow hover:shadow-xl" style={{ borderColor: l.color_primary }}>
                <span className="absolute inset-x-0 top-0 h-1 w-full" style={{ backgroundColor: l.color_primary }} aria-hidden />
                <motion.div whileHover={{ scale: 1.12, rotate: [0, -8, 8, 0] }} transition={{ duration: 0.5 }}>
                  <LangBadge code={l.code} color={l.color_primary} size={44} />
                </motion.div>
                <span className="font-extrabold">{l.name}</span>
                <span className="text-xs text-muted">{l.total_lessons} lições</span>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <motion.h2 className="mb-6 text-center font-display text-2xl font-black md:text-3xl"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5 }}>
          Tudo para você falar de verdade
        </motion.h2>
        <motion.div className="grid gap-4 md:grid-cols-3" variants={containerStagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={fadeUp} whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}>
              <Card className="group flex h-full gap-3 transition-shadow hover:shadow-xl">
                <motion.div className={cn('shrink-0', f.tint)} whileHover={{ rotate: [0, -12, 12, 0], scale: 1.15 }} transition={{ duration: 0.5 }}>
                  <f.icon size={28} />
                </motion.div>
                <div>
                  <h3 className="font-extrabold">{f.title}</h3>
                  <p className="text-sm text-muted">{f.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Depoimentos */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <motion.h2 className="mb-6 text-center font-display text-2xl font-black md:text-3xl"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5 }}>
          Quem usa, recomenda
        </motion.h2>
        <motion.div className="grid gap-4 md:grid-cols-3" variants={containerStagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          {TESTIMONIALS.map((t) => (
            <motion.div key={t.name} variants={fadeUp} whileHover={{ y: -6, scale: 1.02 }}>
              <Card className="relative flex h-full flex-col transition-shadow hover:shadow-xl">
                <Quote className="absolute right-4 top-4 text-accent/25" size={36} aria-hidden />
                <div className="mb-2 flex gap-0.5 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (<Star key={i} size={15} className="fill-current" />))}
                </div>
                <p className="flex-1 text-sm text-ink">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 font-extrabold text-accent-dark">{t.name[0]}</div>
                  <div>
                    <p className="text-sm font-bold text-ink">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ type: 'spring', stiffness: 200, damping: 22 }}>
          <Card className="relative overflow-hidden border-accent/40 bg-surface text-center shadow-2xl">
            <motion.div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl"
              animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} aria-hidden />
            <div className="relative flex flex-col items-center gap-4 py-6">
              <motion.div whileHover={{ scale: 1.06, rotate: 3 }} animate={{ y: [0, -10, 0] }} transition={{ y: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } }}>
                <Byte state="jump" size={120} />
              </motion.div>
              <h2 className="font-display text-3xl font-black md:text-4xl">Pronto para virar poliglota?</h2>
              <p className="max-w-md text-muted">Crie sua conta grátis e comece sua primeira lição em menos de um minuto.</p>
              <Link to="/register" onClick={celebrate} className="mt-2 inline-block">
                <motion.div whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }} animate={{ scale: [1, 1.03, 1] }} transition={{ scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}>
                  <Button size="lg" className="group">
                    <span className="inline-flex items-center justify-center gap-2">
                      Criar conta grátis
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </motion.div>
              </Link>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-edge py-8 text-center text-sm text-muted">
        <span className="inline-flex items-center gap-1.5">
          <VerbusWordmark className="text-ink" /> · aprenda idiomas de verdade.
        </span>
      </footer>
    </div>
  );
}
