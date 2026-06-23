import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string;
}

export function Badge({ className, color, style, ...props }: BadgeProps) {
  return (
    <span
      className={cn('pill bg-surface text-ink border-2 border-edge', className)}
      style={{ ...(color ? { color, borderColor: color } : {}), ...style }}
      {...props}
    />
  );
}
