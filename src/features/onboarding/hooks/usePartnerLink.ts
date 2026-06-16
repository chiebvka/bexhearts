import { useState } from 'react';
import { router } from 'expo-router';
import { useCoupleStore } from '@/stores/couple.store';
import { linkPartner } from '@/services/supabase/database';
import { queryClient } from '@/api/client';
import { queryKeys } from '@/api/keys';
import { track, ANALYTICS_EVENTS } from '@/services/analytics/events';
import { getErrorMessage } from '@/utils/error';

export function usePartnerLink() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCoupleContext = useCoupleStore((s) => s.setCoupleContext);

  const link = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const coupleId = await linkPartner(code);
      setCoupleContext(coupleId, null); // Partner details fetched separately
      track(ANALYTICS_EVENTS.PARTNER_LINKED, { method: 'code' });

      // Invalidate queries so fresh data is loaded
      queryClient.invalidateQueries({ queryKey: queryKeys.couple.mine() });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.mine() });

      router.replace('/(tabs)');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return { link, isLoading, error };
}
