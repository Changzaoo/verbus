import { Heart, Infinity as InfinityIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface HeartsProps {
  count: number;
  max?: number;
  infinite?: boolean;
  className?: string;
}

export function Hearts({ count, max = 5, infinite, className }: HeartsProps) {
  if (infinite) {
    return (
      <span className={cn('flex items-center gap-1 font-extrabold text-hearts', className)}>
        <Heart size={22} fill="currentColor" />
        <InfinityIcon size={18} />
      </span>
    );
  }
  return (
    <span className={cn('flex items-center gap-0.5', className)} title={`${count}/${max} vidas`}>
      <Heart size={22} className="text-hearts" fill="currentColor" />
      <b className="text-hearts">{count}</b>
    </span>
  );
}

export function HeartsRow({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Heart
          key={i}
          size={28}
          className={i < count ? 'text-hearts' : 'text-edge'}
          fill="currentColor"
        />
      ))}
    </div>
  );
}
