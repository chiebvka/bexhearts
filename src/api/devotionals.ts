import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { queryKeys } from './keys';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import { logActivity } from './activity';
import type { DevotionalProgressInsert } from '@/types/api';

export function useTodayDevotional() {
  return useQuery({
    queryKey: queryKeys.devotionals.today(),
    queryFn: async () => {
      // Server-side resolution (00020): a publish_date override wins, else
      // the evergreen pool rotates — one shared devotional for everyone.
      const { data, error } = await supabase.rpc('get_today_devotional');
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export function useDevotionalById(id: string) {
  return useQuery({
    queryKey: queryKeys.devotionals.byId(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useDevotionalHistory() {
  return useQuery({
    queryKey: queryKeys.devotionals.history(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .lte('publish_date', format(new Date(), 'yyyy-MM-dd'))
        .order('publish_date', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });
}

export function useDevotionalProgress(devotionalId: string) {
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useQuery({
    queryKey: queryKeys.devotionals.progress(devotionalId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devotional_progress')
        .select('*')
        .eq('devotional_id', devotionalId)
        .eq('couple_id', coupleId!);
      if (error) throw error;
      return data;
    },
    enabled: !!devotionalId && !!coupleId,
  });
}

export function useCompleteDevotional() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (input: Omit<DevotionalProgressInsert, 'user_id' | 'couple_id'>) => {
      const { data, error } = await supabase
        .from('devotional_progress')
        .upsert(
          {
            ...input,
            user_id: user!.id,
            couple_id: coupleId!,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'devotional_id,user_id' }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.devotionals.progress(variables.devotional_id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.devotionals.today() });
      // The streak trigger may have bumped the couple row — refresh it (D6).
      queryClient.invalidateQueries({ queryKey: queryKeys.couple.mine() });
      void logActivity('devotional');
    },
  });
}
