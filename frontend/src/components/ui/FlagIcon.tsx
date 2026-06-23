import type { CSSProperties, ComponentType } from 'react';
import US from 'country-flag-icons/react/3x2/US';
import ES from 'country-flag-icons/react/3x2/ES';
import FR from 'country-flag-icons/react/3x2/FR';
import DE from 'country-flag-icons/react/3x2/DE';
import IT from 'country-flag-icons/react/3x2/IT';
import CN from 'country-flag-icons/react/3x2/CN';
import JP from 'country-flag-icons/react/3x2/JP';
import KR from 'country-flag-icons/react/3x2/KR';
import RU from 'country-flag-icons/react/3x2/RU';
import SA from 'country-flag-icons/react/3x2/SA';
import IN from 'country-flag-icons/react/3x2/IN';
import NL from 'country-flag-icons/react/3x2/NL';
import TR from 'country-flag-icons/react/3x2/TR';
import PL from 'country-flag-icons/react/3x2/PL';
import SE from 'country-flag-icons/react/3x2/SE';
import GR from 'country-flag-icons/react/3x2/GR';

type FlagComp = ComponentType<{ className?: string; style?: CSSProperties; title?: string }>;

/** Idioma -> bandeira (país representativo). */
const FLAGS: Record<string, FlagComp> = {
  en: US, es: ES, fr: FR, de: DE, it: IT, zh: CN, ja: JP, ko: KR,
  ru: RU, ar: SA, hi: IN, nl: NL, tr: TR, pl: PL, sv: SE, el: GR,
};

export function hasFlag(code: string): boolean {
  return code in FLAGS;
}

export function FlagIcon({ code, className, style, title }: { code: string; className?: string; style?: CSSProperties; title?: string }) {
  const F = FLAGS[code];
  if (!F) return null;
  return <F className={className} style={style} title={title} />;
}
