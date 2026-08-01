import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { notifyPartner, getMyFirstName } from './notifications';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import { logActivity } from './activity';
import type { CoupleDate, CoupleDateUpdate, DateIdea } from '@/types/api';

export interface IdeaAggregate {
  date_idea_id: string;
  avg_rating: number;
  couples_count: number;
}

// Global couple-level idea ratings ("4.6 · 212 couples"), keyed by idea id.
// A PLAIN OBJECT on purpose, not a Map: the query cache persists to disk as
// JSON (H2·M3) and `JSON.stringify(new Map())` is `{}` — a Map came back from
// a cold start as a shape with no `.get`, crashing the Ideas list. Everything
// stored in a query must survive a JSON round-trip.
export type IdeaAggregates = Record<string, IdeaAggregate>;

export function useDateIdeaAggregates() {
  return useQuery({
    queryKey: queryKeys.dateIdeas.aggregates(),
    queryFn: async (): Promise<IdeaAggregates> => {
      const { data, error } = await supabase.rpc('get_date_idea_aggregates');
      if (error) throw error;
      const byId: IdeaAggregates = {};
      for (const row of data ?? []) {
        byId[row.date_idea_id] = row as IdeaAggregate;
      }
      return byId;
    },
    retry: 1,
  });
}

export interface CountryStat {
  country_code: string;
  avg_rating: number;
  couples_count: number;
}

// E13 — how couples in each country rated one idea. Fetched only when the
// country sheet opens (enabled), not with the list.
export function useIdeaCountryStats(dateIdeaId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.dateIdeas.all, dateIdeaId, 'country-stats'],
    queryFn: async (): Promise<CountryStat[]> => {
      const { data, error } = await supabase.rpc('get_date_idea_country_stats', {
        p_date_idea_id: dateIdeaId!,
      });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!dateIdeaId,
  });
}

// One rating per user per idea; earns date_rated points once per day.
export function useRateDateIdea() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (input: { dateIdeaId: string; rating: number }) => {
      const { error } = await supabase.from('date_idea_ratings').upsert(
        {
          date_idea_id: input.dateIdeaId,
          couple_id: coupleId!,
          user_id: user!.id,
          rating: input.rating,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'date_idea_id,user_id' }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dateIdeas.aggregates() });
      void logActivity('date_rated');
    },
  });
}

// couple_dates joined with its (optional) library idea. The hand-written DB
// types don't model the embedded relation, so we shape it explicitly here.
export type CoupleDateWithIdea = CoupleDate & {
  date_ideas: DateIdea | null;
};

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

      // E11 — 'virtual' is a cross-category flag filter, not a category.
      // E13 — 'country:NG' filters by origin tag ("see more ideas from Nigeria").
      if (category === 'virtual') {
        query = query.eq('is_virtual', true);
      } else if (category?.startsWith('country:')) {
        query = query.contains('country_tags', [category.slice('country:'.length)]);
      } else if (category) {
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
      return (data ?? []) as unknown as CoupleDateWithIdea[];
    },
    enabled: !!coupleId,
  });
}

// One completed/saved date with its (optional) library idea — the journal's
// date detail (D6) fetches by id so it works even before the list is cached.
export function useCoupleDateById(id?: string) {
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useQuery({
    queryKey: queryKeys.coupleDates.byId(id ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('couple_dates')
        .select('*, date_ideas(*)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as unknown as CoupleDateWithIdea;
    },
    enabled: !!coupleId && !!id,
  });
}

// D6 — edit a completed date's reflection (stars + note) from the journal
// without touching completed_at (useCompleteDate stamps completion; this
// doesn't re-complete).
export function useUpdateDateReflection() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async ({
      id,
      rating,
      notes,
    }: {
      id: string;
      rating: number | null;
      notes: string | null;
    }) => {
      const { data, error } = await supabase
        .from('couple_dates')
        .update({ rating, notes })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coupleDates.byCoupleId(coupleId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.coupleDates.byId(vars.id) });
    },
  });
}

export function useSaveDateIdea() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (
      input: string | { dateIdeaId: string; scheduledFor?: string | null }
    ) => {
      const dateIdeaId = typeof input === 'string' ? input : input.dateIdeaId;
      const scheduledFor = typeof input === 'string' ? null : input.scheduledFor ?? null;
      const { data, error } = await supabase
        .from('couple_dates')
        .insert({
          couple_id: coupleId!,
          date_idea_id: dateIdeaId,
          scheduled_for: scheduledFor,
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

// G2 — Dates v2: suggest a library idea to your partner (needs 00028).
// Lands in Our Dates as "Suggested" on both sides; only the partner can
// Accept (→ saved/planned) or Pass (→ row removed via useRemoveCoupleDate).
export function useSuggestDateIdea() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (dateIdeaId: string) => {
      const { data, error } = await supabase
        .from('couple_dates')
        .insert({
          couple_id: coupleId!,
          date_idea_id: dateIdeaId,
          suggested_by: user!.id,
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
      notifyPartner({
        category: 'partner_activity',
        title: `${getMyFirstName()} suggested a date 💕`,
        body: 'Take a look and accept if you like it.',
        route: '/dates',
      });
    },
  });
}

// Accepting stamps accepted_at → the row becomes a normal saved/planned date.
export function useAcceptSuggestedDate() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (coupleDateId: string) => {
      const { data, error } = await supabase
        .from('couple_dates')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', coupleDateId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.coupleDates.byCoupleId(coupleId!),
      });
      notifyPartner({
        category: 'partner_activity',
        title: `${getMyFirstName()} accepted your date idea 🎉`,
        route: '/dates',
      });
    },
  });
}

// Log a couple's own date idea (not from the curated library).
export function useCreateCustomDate() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (input: {
      title: string;
      description?: string | null;
      scheduledFor?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('couple_dates')
        .insert({
          couple_id: coupleId!,
          date_idea_id: null,
          custom_title: input.title,
          custom_description: input.description ?? null,
          scheduled_for: input.scheduledFor ?? null,
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

// Remove a saved/planned date from the couple's list (flexible wishlist).
export function useRemoveCoupleDate() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('couple_dates').delete().eq('id', id);
      if (error) throw error;
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
      void logActivity('date_completed');
    },
  });
}
