import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/keys';
import { checkPremium } from '@/services/revenuecat/client';

export function useIsPremium() {
  const { data: isEntitled = false, isLoading } = useQuery({
    queryKey: queryKeys.entitlement.premium(),
    queryFn: checkPremium,
    staleTime: 1000 * 60 * 5,
  });

  return { isEntitled, isLoading };
}
