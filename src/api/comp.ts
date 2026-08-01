import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Server-side comp / free-access check (migration 00036).
 *
 * Deliberately server-side: a client-held list of comped emails would ship
 * every beta tester's address inside the app bundle. The RPC answers only
 * about the CALLER, so it can't be used to probe whether some other address
 * is on the list.
 *
 * Degrades to `false` on any error — including the period before the owner
 * applies 00036, when the function doesn't exist yet. Failing closed is the
 * right default for an access grant, and it costs nothing here because
 * RevenueCat is the primary path; the comp list is the OR.
 */
export async function checkCompAccess(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('has_comp_access');
    if (error) return false;
    return data === true;
  } catch {
    return false;
  }
}

export function useCompAccess() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: hasComp = false, isLoading } = useQuery({
    queryKey: queryKeys.entitlement.comp(),
    queryFn: checkCompAccess,
    enabled: isAuthenticated,
    // Comps change by hand in Studio, rarely. An hour is far more often than
    // they move, and it keeps this off the hot path of every access check.
    staleTime: 1000 * 60 * 60,
    retry: false,
  });

  // A disabled query reports isLoading:true forever (TanStack v5), which would
  // pin the access gate on the loading screen for a signed-out user. Absent
  // auth there is nothing to check, so it isn't loading — it's answered.
  return { hasComp, isLoading: isAuthenticated ? isLoading : false };
}
