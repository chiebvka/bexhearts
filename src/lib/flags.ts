// ISO 3166-1 alpha-2 country code → flag emoji (regional indicator pairs).
export function countryFlag(code: string | null | undefined): string {
  if (!code || !/^[a-zA-Z]{2}$/.test(code)) return '🌍';
  const base = 0x1f1e6; // regional indicator 'A'
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    base + (upper.charCodeAt(0) - 65),
    base + (upper.charCodeAt(1) - 65)
  );
}
