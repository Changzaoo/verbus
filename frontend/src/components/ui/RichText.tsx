import { Fragment, type ReactNode } from 'react';

/**
 * Renderiza texto destacando trechos entre «...» ou **...** em negrito,
 * removendo os marcadores. Ex.: «Bom dia» -> <strong>Bom dia</strong>.
 */
export function renderRich(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const rx = /«([^»]+)»|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = rx.exec(text)) !== null) {
    if (m.index > last) out.push(<Fragment key={i++}>{text.slice(last, m.index)}</Fragment>);
    const inner = m[1] ?? m[2] ?? '';
    out.push(
      <strong key={i++} className="font-extrabold text-brand">
        {inner}
      </strong>,
    );
    last = rx.lastIndex;
  }
  if (last < text.length) out.push(<Fragment key={i++}>{text.slice(last)}</Fragment>);
  return out;
}

export function RichText({ text, className }: { text: string; className?: string }) {
  return <span className={className}>{renderRich(text)}</span>;
}
