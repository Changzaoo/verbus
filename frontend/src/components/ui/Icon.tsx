import {
  Flame, Dumbbell, Award, Trophy, Star, Sparkles, Target, PartyPopper, BookOpen, BookMarked,
  GraduationCap, Medal, Globe, Globe2, Languages, Code2, Laptop, Zap, Moon, Sunrise, Gauge,
  NotebookPen, Gem, TrendingUp, Crown, Sprout, MessageCircle, Briefcase, Monitor, BarChart3,
  FileText, Rocket, Snowflake, Shield, Ghost, Cat, Bird, Skull, Terminal, Bot, HelpCircle,
  Hand, Hash, Users, Utensils, Leaf, Home, Plane, HeartPulse, CloudSun, Clock,
  type LucideIcon,
} from 'lucide-react';

/** Mapa de nomes de ícone (usados em dados: conquistas, unidades, loja, avatares). */
const MAP: Record<string, LucideIcon> = {
  Flame, Dumbbell, Award, Trophy, Star, Sparkles, Target, PartyPopper, BookOpen, BookMarked,
  GraduationCap, Medal, Globe, Globe2, Languages, Code2, Laptop, Zap, Moon, Sunrise, Gauge,
  NotebookPen, Gem, TrendingUp, Crown, Sprout, MessageCircle, Briefcase, Monitor, BarChart3,
  FileText, Rocket, Snowflake, Shield, Ghost, Cat, Bird, Skull, Terminal, Bot,
  Hand, Hash, Users, Utensils, Leaf, Home, Plane, HeartPulse, CloudSun, Clock,
};

export function getIcon(name: string): LucideIcon {
  return MAP[name] ?? HelpCircle;
}

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
  fill?: string;
}

export function Icon({ name, size = 24, className, strokeWidth, fill }: IconProps) {
  const C = getIcon(name);
  return <C size={size} className={className} strokeWidth={strokeWidth} fill={fill} />;
}
