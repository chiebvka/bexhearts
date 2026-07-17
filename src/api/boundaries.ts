import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { supabase } from '@/services/supabase/client';
import { subscribeToBoundaries } from '@/services/supabase/realtime';
import { logCoupleEvent } from './events';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import type { BoundaryInsert, BoundaryUpdate } from '@/types/api';

export function useBoundaries() {
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useQuery({
    queryKey: queryKeys.boundaries.byCoupleId(coupleId!),
    queryFn: async () => {
      // Inactive rows come too (D5): retired boundaries and resolved plans
      // live on as "Past covenants" / "Victories" instead of vanishing.
      const { data, error } = await supabase
        .from('boundaries')
        .select('*')
        .eq('couple_id', coupleId!)
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
      input: Pick<BoundaryInsert, 'type' | 'title' | 'description' | 'action_plan' | 'accountability_partner' | 'category'>
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

// D5 — Retire (boundary) / Resolve (temptation plan) with attribution: stamps
// who and when, and logs a couple_event for the audit trail / future recaps.
export function useDeactivateBoundary() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: string }) => {
      const { data, error } = await supabase
        .from('boundaries')
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString(),
          deactivated_by: user!.id,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      void logCoupleEvent(type === 'boundary' ? 'boundary_retired' : 'plan_resolved', id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boundaries.byCoupleId(coupleId!),
      });
    },
  });
}

// D5 — bring a retired boundary / resolved plan back to active.
export function useRestoreBoundary() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('boundaries')
        .update({ is_active: true, deactivated_at: null, deactivated_by: null })
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

// D5 — live sync: a partner's boundary add/retire/resolve reflects without a
// refresh (channel added to the publication in 00025).
export function useBoundariesRealtime() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  useEffect(() => {
    if (!coupleId) return;
    const channel = subscribeToBoundaries(coupleId, () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.boundaries.byCoupleId(coupleId),
      });
    });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [coupleId, queryClient]);
}
