import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { supabase } from '@/services/supabase/client';
import { subscribeToPrayers } from '@/services/supabase/realtime';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import { notifyPartner, getMyFirstName } from './notifications';
import type { PrayerInsert, PrayerUpdate } from '@/types/api';

export function usePrayers() {
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useQuery({
    queryKey: queryKeys.prayers.byCoupleId(coupleId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prayers')
        .select('*')
        .eq('couple_id', coupleId!)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!coupleId,
  });
}

// D2·M2 — live sync: when either partner adds/answers/archives a prayer, the
// other device refetches. Subscribes for the current couple and tears the
// channel down on unmount / couple change.
export function usePrayersRealtime() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  useEffect(() => {
    if (!coupleId) return;
    const channel = subscribeToPrayers(coupleId, () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prayers.byCoupleId(coupleId),
      });
    });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [coupleId, queryClient]);
}

// Compose (or fetch the cached) AI prayer + verse for a prayer via the
// compose-prayer edge function (Claude Haiku; key lives server-side only).
export function useComposePrayer() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (
      prayerId: string
    ): Promise<{
      prayer?: string;
      verseRef?: string;
      verseText?: string | null;
      flagged?: boolean;
      unsuitable?: boolean;
      // E9: couple hit the composition cap (00026) — 'day' or 'month'.
      limited?: 'day' | 'month';
    }> => {
      const { data, error } = await supabase.functions.invoke('compose-prayer', {
        body: { prayerId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // The composed prayer is cached on the row — refresh the list.
      queryClient.invalidateQueries({ queryKey: queryKeys.prayers.byCoupleId(coupleId!) });
    },
  });
}

// One-time consent before any prayer text is sent to the AI service
// (sensitive religious data — stamped on the profile, enforced server-side).
export function useGrantAiPrayerConsent() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ ai_prayer_consent_at: new Date().toISOString() })
        .eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.mine() });
    },
  });
}

export function useCreatePrayer() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (input: Pick<PrayerInsert, 'title' | 'body' | 'is_private'>) => {
      const { data, error } = await supabase
        .from('prayers')
        .insert({
          ...input,
          couple_id: coupleId!,
          author_id: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prayers.byCoupleId(coupleId!),
      });
      // G2 — generic wording only; the prayer's content never rides along.
      if (!created.is_private) {
        notifyPartner({
          category: 'partner_activity',
          title: `${getMyFirstName()} added a shared prayer 🙏`,
          route: '/(tabs)/connect/prayers',
        });
      }
    },
  });
}

export function useUpdatePrayer() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async ({ id, ...updates }: PrayerUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('prayers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data, updates };
    },
    onSuccess: ({ data, updates }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prayers.byCoupleId(coupleId!),
      });
      // G2 — answered celebration reaches the partner (shared prayers only).
      if (updates.is_answered && !data.is_private) {
        notifyPartner({
          category: 'partner_activity',
          title: 'A prayer was answered 🙌',
          route: '/(tabs)/connect/prayers',
        });
      }
    },
  });
}

export function useDeletePrayer() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (prayerId: string) => {
      const { error } = await supabase
        .from('prayers')
        .delete()
        .eq('id', prayerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prayers.byCoupleId(coupleId!),
      });
    },
  });
}
