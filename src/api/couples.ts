import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { supabase } from '@/services/supabase/client';
import { refreshInviteCode } from '@/services/supabase/database';
import {
  subscribeToDevotionalProgress,
  subscribeToCoupleUpdates,
} from '@/services/supabase/realtime';
import { useCoupleStore } from '@/stores/couple.store';
import { useAuthStore } from '@/stores/auth.store';
import { identifyUser } from '@/services/revenuecat/client';
import { purgePersistedQueryCache } from '@/lib/persistedStorage';
import { clearOutbox } from '@/stores/uploads.store';

export function useMyCouple() {
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useQuery({
    queryKey: queryKeys.couple.mine(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('couples')
        .select('*')
        .eq('id', coupleId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!coupleId,
  });
}

// Re-issue the couple's invite code (solo-mode re-invite / expired code).
export function useRegenerateInviteCode() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: () => {
      if (!coupleId) throw new Error('No couple to re-invite for');
      return refreshInviteCode(coupleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.couple.mine() });
    },
  });
}

// E11 — the Profile "Long-distance mode" toggle (either partner can flip it;
// visits and moves happen). Drives the Virtual date filter ordering.
export function useSetLongDistance() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (isLongDistance: boolean) => {
      const { error } = await supabase
        .from('couples')
        .update({ is_long_distance: isLongDistance })
        .eq('id', coupleId!);
      if (error) throw error;
      return isLongDistance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.couple.mine() });
    },
  });
}

// E14 — leaving a couple (breakup / divorce). Unilateral and immediate by
// design; the server RPC detaches only the caller, keeps the couple space
// intact for the remaining partner, and rotates the invite code.
//
// Two things must happen client-side afterwards, and both matter:
//   * RevenueCat is re-identified back to the INDIVIDUAL, so whoever's store
//     account is billed keeps their subscription instead of leaving it
//     attached to a couple they just left (F2 made entitlement couple-scoped).
//   * The persisted query cache is purged — otherwise the ex-partner's
//     prayers and journal would restore from disk on the next cold start.
export function useLeaveCouple() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const clearCouple = useCoupleStore((s) => s.clear);

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('leave_couple');
      if (error) throw error;
    },
    onSuccess: async () => {
      clearCouple();
      // Entitlement follows the payer, not the couple they left.
      if (user) await identifyUser(user.id, null);
      queryClient.clear();
      purgePersistedQueryCache();
      clearOutbox();
    },
  });
}

// D7 — couple-wide live sync. Mounted once (tabs layout) so a partner's
// devotional completion (→ reflection reveal + streak) and any couple-row change
// (streak / linking) reflect live on the other device without a manual refresh.
export function useCoupleRealtime() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  useEffect(() => {
    if (!coupleId) return;

    const progressChannel = subscribeToDevotionalProgress(coupleId, () => {
      // partner completed a devotional → refresh reveal + today, and the couple
      // row (the streak trigger may have just bumped streak_count).
      queryClient.invalidateQueries({ queryKey: queryKeys.devotionals.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.couple.mine() });
    });

    const coupleChannel = subscribeToCoupleUpdates(coupleId, () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.couple.mine() });
      queryClient.invalidateQueries({ queryKey: queryKeys.couple.partner() });
    });

    return () => {
      void supabase.removeChannel(progressChannel);
      void supabase.removeChannel(coupleChannel);
    };
  }, [coupleId, queryClient]);
}

export function usePartnerProfile() {
  const coupleId = useCoupleStore((s) => s.coupleId);
  const partnerId = useCoupleStore((s) => s.partnerId);

  return useQuery({
    queryKey: queryKeys.couple.partner(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', partnerId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!coupleId && !!partnerId,
  });
}
