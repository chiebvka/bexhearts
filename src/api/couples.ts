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
