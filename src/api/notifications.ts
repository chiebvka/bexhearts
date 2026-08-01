import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { subscribeToNotifications } from '@/services/supabase/realtime';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import type { NotificationCategory } from '@/features/notifications/prefs';
import { queryClient } from './client';
import { queryKeys } from './keys';
import type { Database } from '@/types/database';

type MyProfileLike = { full_name: string | null } | undefined;

// My first name for notification copy, from the already-cached profile.
export function getMyFirstName(): string {
  const profile = queryClient.getQueryData<MyProfileLike>(queryKeys.profile.mine());
  return profile?.full_name?.trim().split(' ')[0] || 'Your partner';
}

// G2 — fire-and-forget partner notification after a successful action.
// Best-effort by design: the action already succeeded; a failed notification
// must never surface as an error. Copy rule (owner-locked): NEVER include
// prayer/journal/check-in content — names + generic wording only.
export function notifyPartner(input: {
  category: NotificationCategory;
  title: string;
  body?: string;
  route?: string;
}): void {
  const partnerId = useCoupleStore.getState().partnerId;
  if (!partnerId) return; // solo — nobody to notify
  try {
    void supabase.functions
      .invoke('send-notification', {
        body: { recipientId: partnerId, ...input },
      })
      .catch(() => {
        // send-notification not served / offline — the action still succeeded.
      });
  } catch {
    // Must never break the action it rides on (or a mocked client in tests).
  }
}

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];

const INBOX_LIMIT = 50;

// The inbox list (newest first). Gracefully empty until 00027 is applied —
// a missing-table error must not red-screen the bell.
export function useNotifications() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: queryKeys.notifications.inbox(userId!),
    queryFn: async (): Promise<NotificationRow[]> => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId!)
        .order('created_at', { ascending: false })
        .limit(INBOX_LIMIT);
      if (error) return []; // 00027 not applied yet → empty inbox, no crash
      return data ?? [];
    },
    enabled: !!userId,
  });
}

export function countUnread(rows: NotificationRow[] | undefined): number {
  return (rows ?? []).filter((n) => !n.read_at).length;
}

export function useMarkNotificationRead() {
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.inbox(userId!) });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const userId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', userId!)
        .is('read_at', null);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.inbox(userId!) });
    },
  });
}

// Mounted once in the tabs layout: a new row invalidates the inbox so the
// bell badge moves live.
export function useNotificationsRealtime() {
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!userId) return;
    const channel = subscribeToNotifications(userId, () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.inbox(userId),
      });
    });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);
}
