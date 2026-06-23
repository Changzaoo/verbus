import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number; // 0..1
  className?: string;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, className, color = '#58CC02', height = 16 }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-edge', className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 200, damping: 26 }}
      >
        {pct > 8 && <div className="h-1/3 mx-2 mt-1 rounded-full bg-white/30" />}
      </motion.div>
    </div>
  );
}
