/** Normaliza texto para comparação tolerante (acentos, caixa, pontuação, espaços). */
export function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // remove acentos combinantes
    .replace(/\s*\([^)]*\)/g, '') // remove romanização entre parênteses
    .replace(/[.,!?;:¿¡"'`´’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function compareAnswer(input: string, expected: string): boolean {
  return normalizeAnswer(input) === normalizeAnswer(expected);
}
