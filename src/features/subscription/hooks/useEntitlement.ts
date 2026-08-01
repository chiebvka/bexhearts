import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/keys';
import { checkPremium } from '@/services/revenuecat/client';
import { useCompAccess } from '@/api/comp';

/** The store entitlement alone (RevenueCat). Rarely what a gate should ask. */
export function useIsPremium() {
  const { data: isEntitled = false, isLoading } = useQuery({
    queryKey: queryKeys.entitlement.premium(),
    queryFn: checkPremium,
    staleTime: 1000 * 60 * 5,
  });

  return { isEntitled, isLoading };
}

/** Why someone is entitled — useful in analytics and when debugging support. */
export type AccessReason = 'revenuecat' | 'comp' | null;

/**
 * THE access check. Every paywall enforcement point must use this one, not
 * `useIsPremium` directly.
 *
 * That rule is not stylistic. The 2026-07-26 onboarding-bypass bug had exactly
 * this shape: a check that lived at one entry point only, so every other way
 * in skipped it. A comp list enforced at the tab gate but not in `PremiumGate`
 * would produce the mirror-image bug — a comped pastor gets into the app and
 * then hits "Unlock Premium" on a feature, which is a worse experience than
 * never having been comped at all.
 *
 * The OR is the whole point: comp access supplements the store entitlement,
 * it never replaces it.
 */
export function useEntitlementAccess() {
  const { isEntitled: hasStoreEntitlement, isLoading: storeLoading } = useIsPremium();
  const { hasComp, isLoading: compLoading } = useCompAccess();

  const isEntitled = hasStoreEntitlement || hasComp;
  const reason: AccessReason = hasStoreEntitlement ? 'revenuecat' : hasComp ? 'comp' : null;

  return {
    isEntitled,
    reason,
    // Loading only while NEITHER source has said yes. Once one has, the answer
    // can no longer become "no", so an entitled person never waits on the
    // slower check.
    isLoading: !isEntitled && (storeLoading || compLoading),
  };
}
