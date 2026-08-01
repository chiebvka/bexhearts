import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Card, ModalHeader, EmptyState } from '@/components/ui';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  countUnread,
  type NotificationRow,
} from '@/api/notifications';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

// G1 — the in-app inbox behind the Home bell (owner ask 2026-07-18).
// The inbox is the source of truth; OS pushes are just its echo, so this
// screen works fully in Expo Go with no push infrastructure at all.

const CATEGORY_ICONS: Record<string, string> = {
  partner_activity: '💜',
  daily_reminder: '🕊️',
  streak_alert: '🔥',
  milestone: '🎉',
  system: '🔔',
};

export default function NotificationsModal() {
  const insets = useSafeAreaInsets();
  const { data: rows } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unread = countUnread(rows);

  const open = (n: NotificationRow) => {
    if (!n.read_at) markRead.mutate(n.id);
    if (n.route) {
      router.push(n.route as never);
    }
  };

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <ModalHeader title="Notifications" />

      {unread > 0 ? (
        <Pressable
          onPress={() => markAllRead.mutate()}
          style={styles.markAll}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text variant="labelMedium" color={colors.text.link}>
            Mark all as read
          </Text>
        </Pressable>
      ) : null}

      {!rows || rows.length === 0 ? (
        <EmptyState
          title="Nothing here yet 🔔"
          description="When your partner prays, journals, or nudges you — or your streak needs saving — it shows up here."
        />
      ) : (
        rows.map((n) => (
          <Pressable key={n.id} onPress={() => open(n)} accessibilityRole="button">
            <Card
              variant="outlined"
              padding="md"
              style={{ ...styles.row, ...(!n.read_at ? styles.rowUnread : null) }}
            >
              <Text variant="bodyLarge" style={styles.icon}>
                {CATEGORY_ICONS[n.category] ?? '🔔'}
              </Text>
              <View style={styles.rowText}>
                <Text variant="labelLarge">{n.title}</Text>
                {n.body ? (
                  <Text variant="bodySmall" color={colors.text.secondary}>
                    {n.body}
                  </Text>
                ) : null}
                <Text variant="labelSmall" color={colors.text.tertiary} style={styles.time}>
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </Text>
              </View>
              {!n.read_at ? <View style={styles.dot} /> : null}
              {n.route ? (
                <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
              ) : null}
            </Card>
          </Pressable>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = themedStyles(() => ({
  markAll: {
    alignSelf: 'flex-end',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  rowUnread: {
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
  },
  icon: {
    // Emoji clip without an explicit lineHeight (2026-07-04g).
    lineHeight: 24,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  time: {
    marginTop: 2,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary[500],
  },
}));
