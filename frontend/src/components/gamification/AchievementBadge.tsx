import { Lock, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import type { AchievementWithStatus } from '@/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Icon } from '@/components/ui/Icon';

export function AchievementBadge({ a }: { a: AchievementWithStatus }) {
  const locked = !a.earned;
  const hiddenLocked = a.is_hidden && locked;
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className={cn(
        'flex flex-col items-center rounded-2xl border-2 p-3 text-center',
        a.earned ? 'border-brand bg-brand/10' : 'border-edge bg-surface opacity-90',
      )}
    >
      <Icon
        name={hiddenLocked ? 'HelpCircle' : a.icon}
        size={36}
        className={cn(a.earned ? 'text-brand' : 'text-muted', locked && !a.earned && 'opacity-70')}
      />
      <div className="mt-1 text-sm font-extrabold text-ink">{hiddenLocked ? 'Secreta' : a.name}</div>
      <div className="text-xs text-muted">{hiddenLocked ? 'Continue jogando…' : a.description}</div>
      {!a.earned && !a.is_hidden && (
        <div className="mt-2 w-full">
          <ProgressBar value={a.progress} height={8} />
        </div>
      )}
      {a.earned && (
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-brand">
          <Check size={14} strokeWidth={3} /> Conquistada
        </span>
      )}
      {hiddenLocked && <Lock size={14} className="mt-1 text-muted" />}
    </motion.div>
  );
}
