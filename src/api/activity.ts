import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import { queryClient } from './client';
import { queryKeys } from './keys';
import type { Database } from '@/types/database';

export type ActivityType =
  | 'devotional'
  | 'prayer_session'
  | 'check_in'
  | 'journal'
  | 'date_completed'
  | 'date_rated';
export type ActivityRow = Database['public']['Tables']['activity_log']['Row'];

// How far back the Us-hub heatmap looks.
export const ACTIVITY_WINDOW_DAYS = 120;

export function todayYmd(now = new Date()): string {
  return format(now, 'yyyy-MM-dd');
}

// Best-effort daily activity logging (feeds the streak card + Us hub).
// Idempotent per user/type/day; never blocks or fails the action it rides on.
export async function logActivity(type: ActivityType): Promise<void> {
  const user = useAuthStore.getState().user;
  const coupleId = useCoupleStore.getState().coupleId;
  if (!user || !coupleId) return;

  try {
    await supabase.from('activity_log').upsert(
      {
        couple_id: coupleId,
        user_id: user.id,
        activity_type: type,
        activity_date: todayYmd(),
      },
      {
        onConflict: 'couple_id,user_id,activity_type,activity_date',
        ignoreDuplicates: true,
      }
    );
    // Invalidate the whole activity family — the 120-day log plus the E10
    // all-time stats/daily-counts aggregates all shift with a new row.
    queryClient.invalidateQueries({ queryKey: queryKeys.activity.all });
    // The DB trigger on activity_log just awarded points — refresh every
    // points surface so the Us hub total can't drift from the leaderboard (D1).
    queryClient.invalidateQueries({ queryKey: queryKeys.points.all });
  } catch {
    // Best-effort — the underlying action already succeeded.
  }
}

export function useActivityLog() {
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useQuery({
    queryKey: queryKeys.activity.byCoupleId(coupleId!),
    queryFn: async (): Promise<ActivityRow[]> => {
      const since = format(subDays(new Date(), ACTIVITY_WINDOW_DAYS), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('couple_id', coupleId!)
        .gte('activity_date', since);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!coupleId,
  });
}

export interface ActivityStat {
  activity_type: string;
  best_streak: number;
  last_done: string;
}

// E10 — all-time per-activity best streak + last-done ("best 14 · last Jul 12").
// Server-side because the log query above only fetches 120 days.
export function useActivityStats() {
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useQuery({
    queryKey: queryKeys.activity.stats(coupleId!),
    queryFn: async (): Promise<ActivityStat[]> => {
      const { data, error } = await supabase.rpc('get_activity_stats');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!coupleId,
  });
}

export interface ActivityDailyCount {
  activity_date: string;
  activity_count: number;
}

// E10 — all-time daily counts for the heatmap's "All" filter. One row per
// active day, so the payload stays small; fetched only when All is selected.
export function useActivityDailyCounts(enabled: boolean) {
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useQuery({
    queryKey: queryKeys.activity.dailyCounts(coupleId!),
    queryFn: async (): Promise<ActivityDailyCount[]> => {
      const { data, error } = await supabase.rpc('get_activity_daily_counts');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!coupleId && enabled,
  });
}
