import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { supabase } from '@/services/supabase/client';
import { useCoupleStore } from '@/stores/couple.store';
import type { CoupleDateUpdate } from '@/types/api';

export function useDateIdeas(category?: string) {
  const queryKey = category
    ? queryKeys.dateIdeas.byCategory(category)
    : queryKeys.dateIdeas.all;

  return useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('date_ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useDateIdeaById(id: string) {
  return useQuery({
    queryKey: [...queryKeys.dateIdeas.all, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('date_ideas')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCoupleDates() {
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useQuery({
    queryKey: queryKeys.coupleDates.byCoupleId(coupleId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('couple_dates')
        .select('*, date_ideas(*)')
        .eq('couple_id', coupleId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!coupleId,
  });
}

export function useSaveDateIdea() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (dateIdeaId: string) => {
      const { data, error } = await supabase
        .from('couple_dates')
        .insert({
          couple_id: coupleId!,
          date_idea_id: dateIdeaId,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.coupleDates.byCoupleId(coupleId!),
      });
    },
  });
}

export function useCompleteDate() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: CoupleDateUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('couple_dates')
        .update({
          ...updates,
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.coupleDates.byCoupleId(coupleId!),
      });
    },
  });
}
