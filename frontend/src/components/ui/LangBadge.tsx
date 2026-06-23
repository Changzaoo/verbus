import { cn } from '@/lib/cn';
import { FlagIcon, hasFlag } from './FlagIcon';
import type { LanguageCode } from '@/types';

const LABEL: Record<string, string> = {
  en: 'EN', es: 'ES', fr: 'FR', de: 'DE', it: 'IT', zh: 'ZH', ja: 'JA', ko: 'KO',
  ru: 'RU', ar: 'AR', hi: 'HI', nl: 'NL', tr: 'TR', pl: 'PL', sv: 'SV', el: 'EL',
};

interface LangBadgeProps {
  code: LanguageCode | string;
  color?: string;
  size?: number;
  className?: string;
}

/** Selo do idioma com a bandeira (SVG). Fallback: código colorido. */
export function LangBadge({ code, color = '#58CC02', size = 44, className }: LangBadgeProps) {
  if (hasFlag(code)) {
    return (
      <span
        className={cn('inline-block shrink-0 overflow-hidden rounded-xl border-2 border-edge shadow-btn-sm', className)}
        style={{ width: size, height: size }}
      >
        <FlagIcon code={code} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </span>
    );
  }
  return (
    <div
      className={cn('grid shrink-0 place-items-center rounded-2xl font-black text-white shadow-btn-sm', className)}
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.34 }}
    >
      {LABEL[code] ?? String(code).slice(0, 2).toUpperCase()}
    </div>
  );
}
