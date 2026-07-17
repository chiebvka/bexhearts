// Prayer focus session logic (owner decisions 2026-07-04): auto-queue today's
// active prayers — shared ones plus MY personal ones — and guard crisis
// content away from AI composition. Pure + testable.
import type { Prayer } from '@/types/api';

// Mirrors the server-side guard in supabase/functions/compose-prayer: these
// requests get help resources, never an AI-composed prayer.
const CRISIS_PATTERNS =
  /suicid|kill (myself|me)|self.?harm|end my life|hurt (myself|me)|abus/i;

export function isCrisisText(text: string | null | undefined): boolean {
  return CRISIS_PATTERNS.test(text ?? '');
}

export const SESSION_DURATIONS_MINUTES = [3, 5, 10] as const;

// Active (not answered, not archived) prayers, shared first then my personal,
// each group oldest first — you pray longest-standing requests first.
export function buildFocusQueue(
  prayers: Prayer[] | undefined,
  myUserId: string | undefined
): Prayer[] {
  const active = (prayers ?? []).filter((p) => !p.is_answered && !p.is_archived);
  const shared = active.filter((p) => !p.is_private);
  const personal = active.filter((p) => p.is_private && p.author_id === myUserId);
  const byOldest = (a: Prayer, b: Prayer) =>
    (a.created_at ?? '') < (b.created_at ?? '') ? -1 : 1;
  return [...shared.sort(byOldest), ...personal.sort(byOldest)];
}
