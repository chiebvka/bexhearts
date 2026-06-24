import { useEffect, type PropsWithChildren } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import { useUIStore } from '@/stores/ui.store';
import { authService } from '@/services/supabase/auth';
import { getProfile, getCouple } from '@/services/supabase/database';
import {
  initRevenueCat,
  identifyUser as rcIdentify,
  logOutRevenueCat,
} from '@/services/revenuecat/client';
import {
  identifySuperwallUser,
  resetSuperwallUser,
} from '@/services/superwall/client';
import {
  identify as analyticsIdentify,
  reset as resetAnalytics,
} from '@/services/analytics/events';
import { queryClient } from '@/api/client';

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
      useCoupleStore.getState().setStreak(couple.streak_count);
    }
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);
  const clearCouple = useCoupleStore((s) => s.clear);

  useEffect(() => {
    // Check existing session on mount
    authService.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        bootstrapUserContext(session.user.id);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (event === 'SIGNED_IN' && session) {
        await bootstrapUserContext(session.user.id);
        await initRevenueCat(session.user.id);
        await rcIdentify(session.user.id);
        identifySuperwallUser(session.user.id);
        analyticsIdentify(session.user.id, { email: session.user.email ?? null });
      }

      if (event === 'SIGNED_OUT') {
        clear();
        clearCouple();
        queryClient.clear();
        // Purge identity from the paid/analytics SDKs so the next user on this
        // device doesn't inherit it (also covers account-deletion PII cleanup).
        resetAnalytics();
        resetSuperwallUser();
        void logOutRevenueCat();
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, clear, clearCouple]);

  return <>{children}</>;
}
