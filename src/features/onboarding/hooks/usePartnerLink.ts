import { useState } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import { linkPartner, getPartnerProfile } from '@/services/supabase/database';
import { queryClient } from '@/api/client';
import { queryKeys } from '@/api/keys';
import { notifyPartner } from '@/api/notifications';
import { identifyUser } from '@/services/revenuecat/client';
import { trackPartnerLinked } from '@/services/analytics/events';
import { getErrorMessage } from '@/utils/error';

export function usePartnerLink() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const setCoupleContext = useCoupleStore((s) => s.setCoupleContext);

  const link = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const coupleId = await linkPartner(code);
      // The joiner IS linked immediately — resolve the partner (the couple's
      // creator) so couple context / isLinked are correct without an app
      // restart (previously this set partnerId=null → stuck in solo mode).
      const partner = user ? await getPartnerProfile(coupleId, user.id) : null;
      setCoupleContext(coupleId, partner?.id ?? null);
      trackPartnerLinked('joiner');

      // F2 — re-identify RevenueCat against the COUPLE now that one exists,
      // so the subscription covers both partners from this moment on.
      if (user) void identifyUser(user.id, coupleId);

      // Invalidate queries so fresh data is loaded
      queryClient.invalidateQueries({ queryKey: queryKeys.couple.mine() });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.mine() });
      queryClient.invalidateQueries({ queryKey: queryKeys.entitlement.all });

      // G2 — tell the inviter their invite landed (couple context is set
      // above, so notifyPartner resolves the partner correctly).
      notifyPartner({
        category: 'partner_activity',
        title: 'Your invite was accepted 💜',
        body: "You're a team now — light the flame together.",
        route: '/',
      });

      // E8·M2: the joiner skips onboarding, so land on the one-time "you're a
      // team" moment (partner name passed so it renders before any refetch).
      router.replace({
        pathname: '/(onboarding)/team',
        params: { name: partner?.full_name ?? '' },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return { link, isLoading, error };
}
