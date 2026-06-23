import { Gem } from 'lucide-react';
import { cn } from '@/lib/cn';

export function GemCounter({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cn('flex items-center gap-1 font-extrabold text-gems', className)}>
      <Gem size={20} fill="currentColor" className="opacity-90" />
      {count.toLocaleString('pt-BR')}
    </span>
  );
}
