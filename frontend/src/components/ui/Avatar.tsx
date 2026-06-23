import { Bot, Ghost, Cat, Bird, Rocket, Crown, Skull, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

const AVATARS: Record<number, LucideIcon> = {
  1: Bot,
  2: Ghost,
  3: Cat,
  4: Bird,
  5: Rocket,
  6: Crown,
  7: Skull,
};

const COLORS = ['#1CB0F6', '#CE82FF', '#FF9600', '#58CC02', '#FF4B4B', '#FFC800', '#00C4FF'];

interface AvatarProps {
  avatarId?: number;
  name?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ avatarId = 1, name, size = 44, className }: AvatarProps) {
  const Ico = AVATARS[avatarId] ?? Bot;
  const color = COLORS[(avatarId - 1) % COLORS.length];
  return (
    <div
      className={cn('grid shrink-0 place-items-center rounded-2xl border-2', className)}
      style={{ width: size, height: size, backgroundColor: `${color}1f`, borderColor: color }}
      title={name ?? undefined}
      aria-label={name ?? 'avatar'}
    >
      <Ico size={size * 0.55} style={{ color }} />
    </div>
  );
}
