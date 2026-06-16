import { useQuery } from '@tanstack/react-query';
import { getOfferings, restorePurchases } from '@/services/revenuecat/client';
import { queryClient } from '@/api/client';
import { queryKeys } from '@/api/keys';
import { useState } from 'react';

export function useOfferings() {
  return useQuery({
    queryKey: ['offerings'],
    queryFn: getOfferings,
    staleTime: 1000 * 60 * 30,
  });
}

export function useRestorePurchases() {
  const [isRestoring, setIsRestoring] = useState(false);

  const restore = async () => {
    setIsRestoring(true);
    try {
      const isPremium = await restorePurchases();
      queryClient.invalidateQueries({ queryKey: queryKeys.entitlement.premium() });
      return isPremium;
    } finally {
      setIsRestoring(false);
    }
  };

  return { restore, isRestoring };
}
