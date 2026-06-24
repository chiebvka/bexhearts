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

// Postgres unique_violation — raised when a generated invite_code collides with
// an existing one (couples.invite_code is UNIQUE).
export const INVITE_CODE_UNIQUE_VIOLATION = '23505';

// Persist with a freshly generated invite code, regenerating + retrying on a
// unique-collision (C2·M1). Non-collision errors are rethrown immediately.
// `persist` does the actual insert/update and returns Supabase's { data, error }.
export async function withUniqueInviteCode<T>(
  // PromiseLike (not Promise) so a Supabase query builder can be passed directly.
  persist: (code: string) => PromiseLike<{ data: T | null; error: { code?: string } | null }>,
  attempts = 5
): Promise<{ code: string; data: T | null }> {
  for (let i = 0; i < attempts; i++) {
    const code = generateInviteCode();
    const { data, error } = await persist(code);
    if (!error) return { code, data };
    if (error.code !== INVITE_CODE_UNIQUE_VIOLATION) throw error;
  }
  throw new Error('Could not generate a unique invite code. Please try again.');
}

export function formatInviteCode(code: string): string {
  const cleaned = code.toUpperCase().trim();
  // Format as ABC-DEF for readability
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return cleaned;
}
