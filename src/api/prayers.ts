import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
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

export function useCreatePrayer() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (input: Pick<PrayerInsert, 'title' | 'body'>) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prayers.byCoupleId(coupleId!),
      });
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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prayers.byCoupleId(coupleId!),
      });
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
