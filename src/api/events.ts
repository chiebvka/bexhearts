// D4 (owner locked 2026-07-10) — best-effort couple_events logging from app
// mutations (triggers write their own events server-side, e.g. grace_used /
// streak_reset). Same contract as logActivity: never blocks or fails the
// action it rides on. Feeds the future year-end / anniversary recap cards
// (owner: NO weekly recap — gather only) and audit/analytics.
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import type { Json } from '@/types/database';

export async function logCoupleEvent(
  eventType: string,
  refId?: string | null,
  metadata?: Record<string, Json>
): Promise<void> {
  const user = useAuthStore.getState().user;
  const coupleId = useCoupleStore.getState().coupleId;
  if (!user || !coupleId) return;

  try {
    await supabase.from('couple_events').insert({
      couple_id: coupleId,
      user_id: user.id,
      event_type: eventType,
      ref_id: refId ?? null,
      metadata: metadata ?? {},
    });
  } catch {
    // Best-effort — the underlying action already succeeded.
  }
}
