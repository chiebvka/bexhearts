import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Avatar } from '@/components/ui';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { StreakCounter, QuickActions, WaitingForPartnerCard, getStreakDayState } from '@/features/dashboard';
import { DevotionalCard } from '@/features/devotional';
import { useMyProfile } from '@/api/profiles';
import { useTodayDevotional, useDevotionalProgress } from '@/api/devotionals';
import { usePartnerProfile } from '@/api/couples';
import { useNotifications, countUnread } from '@/api/notifications';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import { partnerClock, partnerClockLabel, visitCountdownLabel } from '@/features/ldr/ldr';
import { useNextVisit } from '@/api/journal';
import { getCountdown } from '@/features/journal/countdown';
import type { NotificationPrefs } from '@/features/notifications/prefs';
import { getDeviceTimeZone } from '@/lib/dates';
import { getGreeting } from '@/utils/greeting';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';
import { router } from 'expo-router';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?.id);
  const { data: profile } = useMyProfile();
  const { data: partner } = usePartnerProfile();
  const { data: todayDevotional } = useTodayDevotional();
  const { data: todayProgress } = useDevotionalProgress(todayDevotional?.id ?? '');
  const { data: inbox } = useNotifications();
  const unread = countUnread(inbox);
  const isLinked = useCoupleStore((s) => s.isLinked);

  const { data: visit } = useNextVisit();

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  // E11/E12 — "their time" beside the partner name (null when clocks match),
  // with a 🌙 when they're inside their OWN quiet-hours window.
  const theirTime = partnerClockLabel(
    partnerClock({
      partnerTimezone: partner?.timezone,
      myTimezone: getDeviceTimeZone(),
      quietHours: (partner?.notification_prefs as NotificationPrefs | null)?.quiet_hours,
    })
  );

  const dayState = getStreakDayState({
    isLinked,
    myDone: !!todayProgress?.some((p) => p.user_id === userId && p.completed_at),
    partnerDone: !!todayProgress?.some((p) => p.user_id !== userId && p.completed_at),
  });

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <View style={styles.greeting}>
        <View>
          <Text variant="bodyMedium" color={colors.text.secondary}>
            {getGreeting()},
          </Text>
          <Text variant="headlineLarge">{firstName}</Text>
        </View>
        {/* G1 — the bell: inbox works fully in Expo Go (pushes are its echo). */}
        <Pressable
          onPress={() => router.push('/modal/notifications')}
          style={styles.bell}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text.primary} />
          {unread > 0 ? (
            <View style={styles.bellBadge}>
              <Text variant="labelSmall" color={colors.text.inverse} style={styles.bellCount}>
                {unread > 9 ? '9+' : unread}
              </Text>
            </View>
          ) : null}
        </Pressable>

        {/* E8·M4 — the partner stops being an anonymous circle (owner ask). */}
        <View style={styles.avatarsBlock}>
          <View style={styles.avatars}>
            <Avatar uri={profile?.avatar_url} name={profile?.full_name} size="md" />
            {partner && (
              <Avatar
                uri={partner.avatar_url}
                name={partner.full_name}
                size="md"
              />
            )}
          </View>
          {/* Two short lines, not one long one: a single line grew the block
              wide enough to shove the bell into the middle of the header. */}
          {partner?.full_name ? (
            <>
              <Text
                variant="labelSmall"
                color={colors.text.tertiary}
                style={styles.coupleNames}
                numberOfLines={1}
              >
                {firstName} & {partner.full_name.split(' ')[0]}
              </Text>
              {theirTime ? (
                <Text
                  variant="labelSmall"
                  color={colors.text.tertiary}
                  style={styles.coupleNames}
                  numberOfLines={1}
                >
                  {theirTime}
                </Text>
              ) : null}
            </>
          ) : null}
        </View>
      </View>

      {!isLinked && <WaitingForPartnerCard />}

      {/* E12 — the ✈️ visit countdown. Not gated on long-distance mode:
          couples apart for a work trip want this just as much. Tapping opens
          the milestone on the Journal timeline. */}
      {visit ? (
        <Pressable
          onPress={() => router.push('/(tabs)/journal')}
          accessibilityRole="button"
          style={styles.visitCard}
        >
          <Text variant="labelLarge" color={colors.primary[700]}>
            {visitCountdownLabel(getCountdown(visit.event_date).days)}
          </Text>
          <Text variant="labelSmall" color={colors.text.tertiary}>
            {visit.title}
          </Text>
        </Pressable>
      ) : null}

      <StreakCounter dayState={dayState} partnerName={partner?.full_name} />

      <QuickActions />

      {todayDevotional && (
        <>
          <SectionHeader title="Today's Devotional" />
          <DevotionalCard
            devotional={todayDevotional}
            onPress={() => router.push('/(tabs)/devotional')}
          />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = themedStyles(() => ({
  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatars: {
    flexDirection: 'row',
    gap: -8,
  },
  avatarsBlock: {
    alignItems: 'center',
    gap: 2,
    // Capped so a long caption (names + "their time") can never widen the
    // header and push the bell off the right edge — it wraps instead.
    maxWidth: 132,
  },
  visitCard: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: 2,
  },
  coupleNames: {
    textAlign: 'center',
  },
  bell: {
    marginLeft: 'auto',
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  bellBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellCount: {
    fontSize: 9,
    lineHeight: 11,
  },
}));
