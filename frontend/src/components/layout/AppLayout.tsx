import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Gamepad2, Trophy, Zap, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useProgressStore } from '@/store/progressStore';
import { StreakFlame } from '@/components/gamification/StreakFlame';
import { GemCounter } from '@/components/gamification/GemCounter';
import { Byte } from '@/components/mascot/Byte';

const NAV = [
  { to: '/app', label: 'Aprender', icon: Home, end: true },
  { to: '/app/practice', label: 'Praticar', icon: Gamepad2 },
  { to: '/app/leaderboard', label: 'Ranking', icon: Trophy },
  { to: '/app/daily', label: 'Desafio', icon: Zap },
  { to: '/app/shop', label: 'Loja', icon: ShoppingBag },
  { to: '/app/profile', label: 'Perfil', icon: User },
];

function TopBar() {
  const profile = useProgressStore((s) => s.profile);
  if (!profile) return null;
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-edge bg-canvas/90 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex items-center gap-2 font-display text-xl font-extrabold text-brand md:hidden">
        <span>DevLingo</span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <StreakFlame days={profile.streak_current} />
        <GemCounter count={profile.gems} />
      </div>
    </header>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Sidebar desktop */}
      <aside className="fixed left-0 top-0 hidden h-screen w-60 flex-col border-r-2 border-edge bg-surface p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <Byte size={40} />
          <span className="font-display text-2xl font-extrabold text-brand">DevLingo</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 font-bold uppercase tracking-wide',
                  isActive ? 'bg-brand/15 text-brand border-2 border-brand/40' : 'text-muted hover:bg-edge/40 border-2 border-transparent',
                )
              }
            >
              <Icon size={24} /> {label}
            </NavLink>
          ))}
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              cn('mt-auto flex items-center gap-3 rounded-2xl px-4 py-3 font-bold uppercase', isActive ? 'text-brand' : 'text-muted hover:text-ink')
            }
          >
            <User size={20} /> Ajustes
          </NavLink>
        </nav>
      </aside>

      {/* Conteúdo */}
      <div className="md:pl-60">
        <TopBar />
        <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-4 md:pb-10">{children}</main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t-2 border-edge bg-surface py-1 md:hidden">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn('flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold', isActive ? 'text-brand' : 'text-muted')
            }
          >
            <Icon size={22} /> {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
