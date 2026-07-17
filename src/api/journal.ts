import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { supabase } from '@/services/supabase/client';
import { subscribeToJournal } from '@/services/supabase/realtime';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import { buildTimeline, type TimelineEntry } from '@/features/journal/timeline';
import { buildMemoryImageRows } from '@/features/journal/images';
import { logActivity } from './activity';
import { uploadImage } from './uploads';
import type { PickedImage } from '@/lib/imagePicker';
import type { Memory, MemoryImage, MemoryReaction, Milestone, MilestoneInsert, MemoryInsert } from '@/types/api';

export type MemoryWithExtras = Memory & {
  memory_images: MemoryImage[];
  memory_reactions: MemoryReaction[];
};

// The "Our Story" feed — assembles manual entries (memories, milestones) with
// auto moments (answered prayers, completed dates) from existing couple data.
export function useTimeline() {
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useQuery({
    queryKey: queryKeys.journal.timeline(coupleId!),
    queryFn: async (): Promise<TimelineEntry[]> => {
      const [memories, milestones, prayers, dates] = await Promise.all([
        supabase
          .from('memories')
          .select('*, memory_images(image_url, position)')
          .eq('couple_id', coupleId!),
        supabase.from('couple_milestones').select('*').eq('couple_id', coupleId!),
        supabase
          .from('prayers')
          .select('id, title, answered_at')
          .eq('couple_id', coupleId!)
          .eq('is_answered', true),
        supabase
          .from('couple_dates')
          .select('id, completed_at, custom_title, date_ideas(title)')
          .eq('couple_id', coupleId!)
          .not('completed_at', 'is', null),
      ]);

      const firstError = memories.error || milestones.error || prayers.error || dates.error;
      if (firstError) throw firstError;

      return buildTimeline({
        memories: memories.data ?? [],
        milestones: milestones.data ?? [],
        answeredPrayers: prayers.data ?? [],
        completedDates: (dates.data ?? []) as never,
      });
    },
    enabled: !!coupleId,
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (
      input: Pick<MilestoneInsert, 'title' | 'icon' | 'event_date' | 'event_time' | 'color' | 'is_recurring'>
    ) => {
      const { data, error } = await supabase
        .from('couple_milestones')
        .insert({ ...input, couple_id: coupleId!, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.timeline(coupleId!) });
      void logActivity('journal');
    },
  });
}

export function useCreateMemory() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (input: Pick<MemoryInsert, 'title' | 'description' | 'memory_date'>) => {
      const { data, error } = await supabase
        .from('memories')
        .insert({ ...input, couple_id: coupleId!, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.timeline(coupleId!) });
      void logActivity('journal');
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (
      input: { id: string } & Partial<
        Pick<Milestone, 'title' | 'icon' | 'event_date' | 'event_time' | 'color' | 'is_recurring'>
      >
    ) => {
      const { id, ...fields } = input;
      const { data, error } = await supabase
        .from('couple_milestones')
        .update(fields)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.timeline(coupleId!) });
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('couple_milestones').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.timeline(coupleId!) });
    },
  });
}

// Upload picked photos to R2 (presigned by the edge function under
// memories/<coupleId>/<memoryId>/) and attach them to the memory, ordered
// after any existing images.
export function useAddMemoryImages() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (input: {
      memoryId: string;
      images: PickedImage[];
      startPosition?: number;
    }) => {
      const imageUrls: string[] = [];
      for (const image of input.images) {
        imageUrls.push(
          await uploadImage(
            { kind: 'memory', memoryId: input.memoryId },
            image.uri,
            image.contentType
          )
        );
      }

      const rows = buildMemoryImageRows({
        memoryId: input.memoryId,
        coupleId: coupleId!,
        imageUrls,
        startPosition: input.startPosition,
      });
      const { data, error } = await supabase.from('memory_images').insert(rows).select();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.memory(input.memoryId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.timeline(coupleId!) });
    },
  });
}

export function useMemory(memoryId: string) {
  return useQuery({
    queryKey: queryKeys.journal.memory(memoryId),
    queryFn: async (): Promise<MemoryWithExtras> => {
      const { data, error } = await supabase
        .from('memories')
        .select('*, memory_images(*), memory_reactions(*)')
        .eq('id', memoryId)
        .single();
      if (error) throw error;
      return data as unknown as MemoryWithExtras;
    },
    enabled: !!memoryId,
  });
}

// Light reaction: one row per user per memory (❤️/🙏 + optional note) — upserted.
export function useReactToMemory(memoryId: string) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const coupleId = useCoupleStore((s) => s.coupleId);

  return useMutation({
    mutationFn: async (input: { reaction?: string | null; note?: string | null }) => {
      const { data, error } = await supabase
        .from('memory_reactions')
        .upsert(
          {
            memory_id: memoryId,
            couple_id: coupleId!,
            user_id: user!.id,
            reaction: input.reaction ?? null,
            note: input.note ?? null,
          },
          { onConflict: 'memory_id,user_id' }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.memory(memoryId) });
    },
  });
}

// Live sync for the Journal (memories / milestones / reactions all changed the
// couple's story). Reuses the couple-updates channel to invalidate the timeline.
export function useJournalRealtime() {
  const queryClient = useQueryClient();
  const coupleId = useCoupleStore((s) => s.coupleId);

  useEffect(() => {
    if (!coupleId) return;
    const channel = subscribeToJournal(coupleId, (payload) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.timeline(coupleId) });
      // Reaction/image events carry memory_id — refresh that open memory too,
      // so a partner's reaction or new photos appear live on the detail screen.
      const row = (payload.new ?? payload.old) as { memory_id?: string } | null;
      if (row?.memory_id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.journal.memory(row.memory_id) });
      }
    });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [coupleId, queryClient]);
}
