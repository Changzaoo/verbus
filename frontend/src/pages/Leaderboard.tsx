import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, TrendingUp, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { FullPageSpinner } from '@/components/ui/Spinner';
import type { LeaderboardEntry, RankContext } from '@/types';

type Tab = 'all' | 'week' | 'friends';

function PodiumSpot({ e, place }: { e: LeaderboardEntry; place: 1 | 2 | 3 }) {
  const cfg = {
    1: { color: '#FFD700', h: 'h-28', icon: Crown, order: 'order-2' },
    2: { color: '#C0C0C0', h: 'h-20', icon: Medal, order: 'order-1' },
    3: { color: '#CD7F32', h: 'h-16', icon: Medal, order: 'order-3' },
  }[place];
  const Ico = cfg.icon;
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: place * 0.08 }}
      className={cn('flex flex-1 flex-col items-center justify-end', cfg.order)}
    >
      <Ico size={place === 1 ? 30 : 22} style={{ color: cfg.color }} fill="currentColor" />
      <Avatar avatarId={e.avatar_id} name={e.display_name ?? e.username} size={place === 1 ? 56 : 44} className="my-1" />
      <span className="max-w-[90px] truncate text-xs font-extrabold">{e.display_name ?? e.username}</span>
      <span className="text-xs font-bold text-xp">{e.xp} XP</span>
      <div
        className={cn('mt-1 w-full rounded-t-xl', cfg.h)}
        style={{ background: `linear-gradient(180deg, ${cfg.color}, ${cfg.color}55)` }}
      >
        <div className="pt-1 text-center text-lg font-black text-white/90">{place}</div>
      </div>
    </motion.div>
  );
}

function Row({ e }: { e: LeaderboardEntry }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center gap-3 rounded-2xl border-2 px-3 py-2',
        e.is_current_user ? 'border-brand bg-brand/10' : 'border-transparent',
      )}
    >
      <span className="w-7 text-center font-black text-muted">{e.rank}</span>
      <Avatar avatarId={e.avatar_id} name={e.display_name ?? e.username} size={36} />
      <span className="flex-1 truncate font-bold">
        {e.display_name ?? e.username}
        {e.is_current_user && ' (você)'}
      </span>
      <span className="font-extrabold text-xp">{e.xp} XP</span>
    </motion.div>
  );
}

export function Leaderboard() {
  const [tab, setTab] = useState<Tab>('all');
  const period = tab === 'week' ? 'week' : 'all';

  const board = useQuery({
    queryKey: ['lb', tab],
    queryFn: () =>
      tab === 'friends'
        ? api.get<LeaderboardEntry[]>('/leaderboard/friends')
        : api.get<LeaderboardEntry[]>(`/leaderboard/global?period=${period}&limit=100`),
  });
  const me = useQuery({
    queryKey: ['lb-me', period],
    queryFn: () => api.get<RankContext>(`/leaderboard/me?period=${period}`),
    enabled: tab !== 'friends',
  });

  const tabs: [Tab, string, typeof Trophy][] = [
    ['all', 'Geral', Trophy],
    ['week', 'Semana', TrendingUp],
    ['friends', 'Amigos', Users],
  ];

  const entries = board.data ?? [];
  const top3 = tab !== 'friends' ? entries.slice(0, 3) : [];
  const rest = tab !== 'friends' ? entries.slice(3) : entries;

  return (
    <div className="pb-28 md:pb-4">
      <h1 className="mb-1 flex items-center gap-2 font-display text-2xl font-extrabold">
        <Trophy className="text-warning" fill="currentColor" /> Ranking
      </h1>
      <p className="mb-4 text-sm text-muted">Acumule XP e dispute o topo com devs do mundo todo.</p>

      <div className="mb-4 flex gap-2">
        {tabs.map(([t, label, Ico]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 py-2 font-bold',
              tab === t ? 'border-brand bg-brand/10 text-brand' : 'border-edge text-muted',
            )}
          >
            <Ico size={16} /> {label}
          </button>
        ))}
      </div>

      {board.isLoading ? (
        <FullPageSpinner />
      ) : entries.length === 0 ? (
        <Card className="text-center text-muted">
          {tab === 'friends' ? 'Adicione amigos para competir! (em breve)' : 'Ninguém no ranking ainda. Seja o primeiro!'}
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {top3.length === 3 && (
            <Card className="bg-gradient-to-b from-warning/10 to-transparent">
              <div className="flex items-end gap-2">
                <PodiumSpot e={top3[1]} place={2} />
                <PodiumSpot e={top3[0]} place={1} />
                <PodiumSpot e={top3[2]} place={3} />
              </div>
            </Card>
          )}
          <div className="flex flex-col gap-1">
            {(top3.length === 3 ? rest : entries).map((e) => (
              <Row key={e.user_id} e={e} />
            ))}
          </div>
        </div>
      )}

      {/* Banner fixo com a sua posição */}
      {tab !== 'friends' && me.data && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed inset-x-0 bottom-16 z-20 mx-auto max-w-3xl px-4 md:bottom-4 md:pl-64"
        >
          <div className="flex items-center gap-3 rounded-2xl border-2 border-brand bg-surface px-4 py-3 shadow-btn">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/15 font-black text-brand">
              #{me.data.rank}
            </span>
            <div className="flex-1 text-sm">
              <div className="font-extrabold">Você está em #{me.data.rank} de {me.data.total}</div>
              <div className="text-muted">
                {me.data.to_next > 0
                  ? `Faltam ${me.data.to_next} XP para passar ${me.data.next_user}`
                  : 'Você está no topo!'}
              </div>
            </div>
            <span className="font-extrabold text-xp">{me.data.xp} XP</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
