/** Embaralhamento determinístico por semente (estável entre re-renders). */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = (seed || 1) % 233280;
  if (s <= 0) s += 233280;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Embaralha garantindo que a ordem resultante seja diferente da original
 * (quando há ao menos 2 itens distintos) — evita que a resposta fique óbvia.
 */
export function shuffleNotEqual<T>(arr: T[], seed: number): T[] {
  if (arr.length < 2) return [...arr];
  let out = seededShuffle(arr, seed);
  let attempt = 1;
  while (attempt < 6 && out.every((v, i) => v === arr[i])) {
    out = seededShuffle(arr, seed + attempt * 17);
    attempt++;
  }
  return out;
}
