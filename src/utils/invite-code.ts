// Excludes ambiguous characters: O/0, I/1, L
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateInviteCode(length = 6): string {
  return Array.from({ length }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('');
}

export function isValidInviteCode(code: string): boolean {
  const cleaned = code.toUpperCase().trim();
  if (cleaned.length !== 6) return false;
  return /^[A-HJ-NP-Z2-9]{6}$/.test(cleaned);
}

export function formatInviteCode(code: string): string {
  const cleaned = code.toUpperCase().trim();
  // Format as ABC-DEF for readability
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return cleaned;
}
