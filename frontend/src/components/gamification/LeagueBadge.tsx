import { LEAGUES, type LeagueTier } from '@/types';

export function leagueInfo(tier: LeagueTier) {
  return LEAGUES.find((l) => l.tier === tier) ?? LEAGUES[0];
}

export function LeagueBadge({ tier, size = 'md' }: { tier: LeagueTier; size?: 'sm' | 'md' | 'lg' }) {
  const info = leagueInfo(tier);
  const dim = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-lg' : 'text-2xl';
  return (
    <span className="inline-flex items-center gap-2 font-extrabold" style={{ color: info.color }}>
      <span className={dim}>{info.icon}</span>
      <span>{info.name}</span>
    </span>
  );
}
