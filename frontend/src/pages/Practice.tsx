import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Brain, Swords, Radio, Phone, BookOpen, ChevronRight, Gamepad2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { LangBadge } from '@/components/ui/LangBadge';
import { Byte } from '@/components/mascot/Byte';
import type { Language } from '@/types';

interface Mode {
  key: string;
  label: string;
  desc: string;
  icon: typeof Brain;
  color: string;
  to: (code: string) => string;
  needsLang: boolean;
}

const MODES: Mode[] = [
  { key: 'match', label: 'Match Madness', desc: 'Conecte os pares o mais rápido que conseguir antes do tempo acabar!', icon: Swords, color: '#FF4B4B', to: (c) => `/app/games/match/${c}`, needsLang: true },
  { key: 'podcast', label: 'Podcast', desc: 'Ouça um episódio narrado e acompanhe a transcrição.', icon: Radio, color: '#CE82FF', to: (c) => `/app/podcast/${c}`, needsLang: true },
  { key: 'call', label: 'Ligação', desc: 'Atenda uma chamada do Byte e converse de verdade.', icon: Phone, color: '#58CC02', to: (c) => `/app/call/${c}`, needsLang: true },
  { key: 'stories', label: 'Histórias', desc: 'Viva uma historinha interativa e responda pelo caminho.', icon: BookOpen, color: '#FF9600', to: (c) => `/app/stories/${c}`, needsLang: true },
  { key: 'srs', label: 'Revisão SRS', desc: 'Reforce as palavras que você está prestes a esquecer.', icon: Brain, color: '#1CB0F6', to: () => `/app/practice/review`, needsLang: false },
];

export function Practice() {
  const navigate = useNavigate();
  const { data: langs, isLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: () => api.get<Language[]>('/languages'),
  });
  const [code, setCode] = useState<string | null>(null);

  if (isLoading || !langs) return <FullPageSpinner />;

  const selected = code ?? langs[0]?.code ?? 'en';

  return (
    <div className="flex flex-col gap-6">
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <Byte state="happy" size={64} />
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold">
            <Gamepad2 className="text-brand" size={26} /> Praticar &amp; Jogar
          </h1>
          <p className="text-sm text-muted">Jogos, podcasts, ligações e histórias — escolha um idioma e divirta-se.</p>
        </div>
      </motion.div>

      {/* Seletor de idioma */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {langs.map((l) => (
          <button
            key={l.code}
            onClick={() => setCode(l.code)}
            title={l.name}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-2xl border-2 px-3 py-2 font-bold transition-colors',
              selected === l.code ? 'border-brand bg-brand/10 text-brand' : 'border-edge text-muted hover:border-brand/40',
            )}
          >
            <LangBadge code={l.code} color={l.color_primary} size={26} />
            <span className="text-sm">{l.name}</span>
          </button>
        ))}
      </div>

      {/* Cards dos modos */}
      <div className="grid gap-3 sm:grid-cols-2">
        {MODES.map((m, i) => (
          <motion.button
            key={m.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, type: 'spring', stiffness: 260, damping: 22 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(m.to(selected))}
            className="card flex items-center gap-4 p-4 text-left"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white shadow-btn-sm" style={{ backgroundColor: m.color }}>
              <m.icon size={28} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 font-extrabold">{m.label}</div>
              <div className="text-sm leading-tight text-muted">{m.desc}</div>
            </div>
            <ChevronRight className="shrink-0 text-muted" size={22} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
