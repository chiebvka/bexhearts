import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import { getWeekOf } from '@/lib/dates';
import { logActivity } from './activity';
import type { CheckInInsert } from '@/types/api';

export function useCheckIns() {
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useQuery({
    queryKey: queryKeys.checkIns.byCoupleId(coupleId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('couple_id', coupleId!)
        .order('week_of', { ascending: false })
        .limit(12);
      if (error) throw error;
      return data;
    },
    enabled: !!coupleId,
  });
}

export function useThisWeekCheckIn() {
  const coupleId = useCoupleStore((s) => s.coupleId);
  const user = useAuthStore((s) => s.user);
  const weekOf = getWeekOf();

  return useQuery({
    queryKey: queryKeys.checkIns.byWeek(coupleId!, weekOf),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('couple_id', coupleId!)
        .eq('user_id', user!.id)
        .eq('week_of', weekOf)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!coupleId && !!user,
  });
}

// Both partners' check-ins for the current week — powers the comparison view
// (D3·M3). Returns an array so the screen can split mine vs. partner by user_id.
export function useThisWeekComparison() {
  const coupleId = useCoupleStore((s) => s.coupleId);
  const weekOf = getWeekOf();

  return useQuery({
    queryKey: queryKeys.checkIns.weekComparison(coupleId!, weekOf),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .eq('couple_id', coupleId!)
        .eq('week_of', weekOf);
      if (error) throw error;
      return data;
    },
    enabled: !!coupleId,
  });
}

export function useSubmitCheckIn() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (
      input: Omit<CheckInInsert, 'user_id' | 'couple_id' | 'week_of'>
    ) => {
      const { data, error } = await supabase
        .from('check_ins')
        .upsert(
          {
            ...input,
            couple_id: coupleId!,
            user_id: user!.id,
            week_of: getWeekOf(),
          },
          { onConflict: 'couple_id,user_id,week_of' }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.checkIns.byCoupleId(coupleId!),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.checkIns.weekComparison(coupleId!, getWeekOf()),
      });
      void logActivity('check_in');
    },
  });
}
