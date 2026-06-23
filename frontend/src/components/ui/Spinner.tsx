import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Spinner({ className, size = 28 }: { className?: string; size?: number }) {
  return <Loader2 className={cn('animate-spin text-brand', className)} size={size} />;
}

export function FullPageSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-canvas">
      <Spinner size={48} />
    </div>
  );
}
