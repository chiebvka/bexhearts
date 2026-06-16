import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import type { BoundaryInsert, BoundaryUpdate } from '@/types/api';

export function useBoundaries() {
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useQuery({
    queryKey: queryKeys.boundaries.byCoupleId(coupleId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('boundaries')
        .select('*')
        .eq('couple_id', coupleId!)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!coupleId,
  });
}

export function useCreateBoundary() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (
      input: Pick<BoundaryInsert, 'type' | 'title' | 'description' | 'action_plan' | 'accountability_partner'>
    ) => {
      const { data, error } = await supabase
        .from('boundaries')
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
        queryKey: queryKeys.boundaries.byCoupleId(coupleId!),
      });
    },
  });
}

export function useUpdateBoundary() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async ({ id, ...updates }: BoundaryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('boundaries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boundaries.byCoupleId(coupleId!),
      });
    },
  });
}
