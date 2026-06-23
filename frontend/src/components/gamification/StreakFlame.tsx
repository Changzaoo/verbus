import { Flame } from 'lucide-react';
import { cn } from '@/lib/cn';

export function StreakFlame({ days, className, size = 20 }: { days: number; className?: string; size?: number }) {
  const active = days > 0;
  return (
    <span
      className={cn('flex items-center gap-1 font-extrabold', active ? 'text-streak' : 'text-muted', className)}
      title={`${days} dias de ofensiva`}
    >
      <Flame size={size} fill={active ? 'currentColor' : 'none'} className={active ? 'animate-flame' : ''} />
      {days}
    </span>
  );
}
