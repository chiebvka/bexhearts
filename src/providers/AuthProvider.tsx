import { useEffect, type PropsWithChildren } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import { useUIStore } from '@/stores/ui.store';
import { authService } from '@/services/supabase/auth';
import { getProfile, getCouple } from '@/services/supabase/database';
import {
  initRevenueCat,
  identifyUser as rcIdentify,
  revenueCatAppUserId,
  logOutRevenueCat,
} from '@/services/revenuecat/client';
import {
  identifySuperwallUser,
  resetSuperwallUser,
} from '@/services/superwall/client';
import {
  identify as analyticsIdentify,
  reset as resetAnalytics,
  resetRetentionState,
} from '@/services/analytics/events';
import { queryClient } from '@/api/client';
import { purgePersistedQueryCache } from '@/lib/persistedStorage';
import { clearOutbox } from '@/stores/uploads.store';
import { withTimeout } from '@/utils/withTimeout';

async function bootstrapUserContext(userId: string) {
  const { setCoupleContext } = useCoupleStore.getState();

  const profile = await getProfile(userId);
  if (!profile) return;

  // Reactivation: signing back in within the 7-day grace window cancels a
  // pending account deletion (00005).
  if (profile.deletion_scheduled_at) {
    try {
      await authService.cancelAccountDeletion();
      useUIStore
        .getState()
        .showToast('Welcome back — your account deletion was cancelled.', 'success');
    } catch {
      // Best-effort; the deletion can still be cancelled by re-trying later.
    }
  }

  if (profile.couple_id) {
    const couple = await getCouple(profile.couple_id);
    if (couple) {
      const partnerId =
        couple.partner_a_id === userId
          ? couple.partner_b_id
          : couple.partner_a_id;
      setCoupleContext(couple.id, partnerId);
      useCoupleStore.getState().setStreak(couple.streak_count ?? 0);
    }
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);
  const clearCouple = useCoupleStore((s) => s.clear);

  useEffect(() => {
    let active = true;

    // Check existing session on mount. getSession() REJECTS when the stored
    // refresh token is invalid (e.g. after a local DB reset, or a real user's
    // token expiring) — without this catch, setSession never runs, isLoading
    // stays true, and the app hangs on the loading screen. Treat any failure as
    // signed-out so the app always reaches sign-in.
    (async () => {
      try {
        // Bounded: if session recovery hangs (common right after a Supabase
        // restart, when the stored token is stale), fall through to signed-out
        // instead of pinning the loading screen forever.
        const {
          data: { session },
        } = await withTimeout(authService.getSession(), 6000);
        if (!active) return;
        if (session) {
          try {
            // Hydrate couple context BEFORE flipping the signed-in switch:
            // the route gate and dashboard read the couple store, and setting
            // the session first briefly routed linked users to partner-invite
            // (bug 2026-07-04). Bounded so a hang degrades to signed-in
            // without context instead of pinning the splash screen.
            await withTimeout(bootstrapUserContext(session.user.id), 5000);
          } catch {
            // Non-fatal — the session is valid even if context hydration fails.
          }
        }
        if (!active) return;
        setSession(session);
      } catch {
        // Rejected OR timed out → treat as signed-out so the app always reaches
        // sign-in (the onAuthStateChange listener re-hydrates if a real session
        // recovers later).
        if (active) setSession(null);
      }
    })();

    // Post-sign-in hydration (profile/couple context + paid-SDK identify).
    // Best-effort: never blocks or reverts the signed-in state.
    const hydrateSignedIn = async (userId: string) => {
      try {
        await bootstrapUserContext(userId);
        // F2 — identify RevenueCat by the COUPLE (billed per couple), so a
        // purchase by either partner entitles both. bootstrapUserContext has
        // already hydrated the couple id above; solo users fall back to their
        // own id and are re-identified on linking.
        const coupleId = useCoupleStore.getState().coupleId;
        await initRevenueCat(revenueCatAppUserId(userId, coupleId));
        await rcIdentify(userId, coupleId);
        identifySuperwallUser(userId);
        // Phase 7 — UUID only, deliberately no email. The Privacy Policy
        // carried a "[MINIMIZE AT LAUNCH: review whether email is necessary]"
        // flag on this exact line; the answer is no. The UUID still joins back
        // to the DB for support, without an address sitting in a third-party
        // analytics store alongside religious-practice behaviour.
        analyticsIdentify(userId);
      } catch {
        // Non-fatal — screens re-fetch their own data.
      }
    };

    // Listen for auth state changes. The callback MUST stay synchronous:
    // supabase-js awaits it while signInWithPassword is still pending, so any
    // await here keeps the sign-in spinner up until hydration finishes — and a
    // single wedged promise (SecureStore, a dead fetch) hangs sign-in forever.
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      setSession(session);

      if (event === 'SIGNED_IN' && session) {
        const { id } = session.user;
        setTimeout(() => void hydrateSignedIn(id), 0);
      }

      if (event === 'SIGNED_OUT') {
        clear();
        clearCouple();
        queryClient.clear();
        // H2 — the in-memory clear above isn't enough now that the cache and
        // the upload queue persist to disk; purge both so nothing of this
        // user survives for the next one on a shared device.
        purgePersistedQueryCache();
        clearOutbox();
        // Purge identity from the paid/analytics SDKs so the next user on this
        // device doesn't inherit it (also covers account-deletion PII cleanup).
        resetAnalytics();
        // Per-install analytics state (first-open date, once-only funnel
        // flags) is about the PERSON, not the device — same hygiene rule as
        // the persisted query cache above.
        void resetRetentionState();
        resetSuperwallUser();
        void logOutRevenueCat();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [setSession, clear, clearCouple]);

  return <>{children}</>;
}
