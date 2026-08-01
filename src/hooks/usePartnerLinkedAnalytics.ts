import { useEffect } from 'react';
import { useCoupleStore } from '@/stores/couple.store';
import { trackPartnerLinked } from '@/services/analytics/events';

/**
 * Phase 7 — the INVITER's side of `partner_linked`.
 *
 * The joiner fires this event from a discrete action (`usePartnerLink`). The
 * inviter has no such moment: their couple row simply gains a partner while
 * they're elsewhere in the app, arriving via the G2 realtime channel. Without
 * this, the funnel dead-ends at `trial_started` for exactly the person whose
 * conversion we're trying to measure — the inviter is the one who saw the
 * paywall and paid.
 *
 * `trackPartnerLinked` is once-per-install, so mounting this in the tabs
 * layout (which re-renders freely) can't produce duplicates, and a joiner —
 * who already recorded the event under the same key — won't be mislabelled as
 * an inviter here.
 */
export function usePartnerLinkedAnalytics() {
  const isLinked = useCoupleStore((s) => s.isLinked);

  useEffect(() => {
    if (!isLinked) return;
    trackPartnerLinked('inviter');
  }, [isLinked]);
}
