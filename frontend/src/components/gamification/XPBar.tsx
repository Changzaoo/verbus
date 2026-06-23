import { Zap } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface XPBarProps {
  current: number;
  goal: number;
  label?: string;
}

export function XPBar({ current, goal, label = 'Meta diária' }: XPBarProps) {
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-sm font-bold">
        <span className="flex items-center gap-1 text-xp">
          <Zap size={16} fill="currentColor" /> {label}
        </span>
        <span className="text-muted">
          {Math.min(current, goal)} / {goal} XP
        </span>
      </div>
      <ProgressBar value={goal > 0 ? current / goal : 0} color="#FF9600" />
    </div>
  );
}
