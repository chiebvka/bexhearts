import { useEffect, type PropsWithChildren } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import { authService } from '@/services/supabase/auth';
import { getProfile, getCouple } from '@/services/supabase/database';
import { initRevenueCat, identifyUser as rcIdentify } from '@/services/revenuecat/client';
import { identifySuperwallUser } from '@/services/superwall/client';
import { identify as analyticsIdentify } from '@/services/analytics/events';
import { queryClient } from '@/api/client';

async function bootstrapUserContext(userId: string) {
  const { setCoupleContext } = useCoupleStore.getState();

  const profile = await getProfile(userId);
  if (!profile) return;

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
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, clear, clearCouple]);

  return <>{children}</>;
}
