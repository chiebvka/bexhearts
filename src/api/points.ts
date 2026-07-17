import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLocales } from 'expo-localization';
import { supabase } from '@/services/supabase/client';
import { useCoupleStore } from '@/stores/couple.store';
import { queryKeys } from './keys';

export interface LeaderboardEntry {
  rank: number;
  label: string;
  couple_number: number;
  country_code: string | null;
  points: number;
  is_you: boolean;
}

// The couple's total points (sums the RLS-scoped ledger).
export function usePointsTotal() {
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useQuery({
    queryKey: queryKeys.points.total(coupleId!),
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase
        .from('points_ledger')
        .select('points')
        .eq('couple_id', coupleId!);
      if (error) throw error;
      return (data ?? []).reduce((sum, row) => sum + row.points, 0);
    },
    enabled: !!coupleId,
  });
}

// The couple-private audit trail behind the total (D2): every award row —
// what, who, when. Other couples only ever see totals (leaderboard RPC).
export function usePointsHistory() {
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useQuery({
    queryKey: queryKeys.points.history(coupleId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_ledger')
        .select('id, user_id, points, reason, created_at')
        .eq('couple_id', coupleId!)
        .order('created_at', { ascending: false })
        .limit(300);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!coupleId,
  });
}

// Global standings — names are masked server-side unless a couple opted in.
export function useLeaderboard() {
  return useQuery({
    queryKey: queryKeys.points.leaderboard(),
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const { data, error } = await supabase.rpc('get_leaderboard', {
        entry_limit: 50,
      });
      if (error) throw error;
      return (data ?? []) as LeaderboardEntry[];
    },
    // One retry is plenty — pre-migration (or offline) this should settle
    // into the empty state fast, not spin through the default 3 backoffs.
    retry: 1,
  });
}

// Device region approximates the store country until we have receipt data.
export function deviceCountryCode(): string | null {
  return getLocales()[0]?.regionCode ?? null;
}

// Toggle showing real first names on the global leaderboard; also backfills
// the couple's country the first time either partner touches the setting.
export function useSetLeaderboardOptIn() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (optIn: boolean) => {
      const { error } = await supabase
        .from('couples')
        .update({ leaderboard_opt_in: optIn, country_code: deviceCountryCode() })
        .eq('id', coupleId!);
      if (error) throw error;
      return optIn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.couple.mine() });
      queryClient.invalidateQueries({ queryKey: queryKeys.points.leaderboard() });
    },
  });
}
