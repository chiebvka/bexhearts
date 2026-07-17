import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { differenceInCalendarDays } from 'date-fns';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Card, ModalHeader } from '@/components/ui';
import { useMyCouple, usePartnerProfile } from '@/api/couples';
import { useMyProfile } from '@/api/profiles';
import { useActivityLog } from '@/api/activity';
import { usePointsTotal } from '@/api/points';
import {
  buildHeatmapWeeks,
  activityStreak,
  buildBadges,
} from '@/features/dashboard/activity';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const HEATMAP_WEEKS = 12;

function cellColor(count: number): string {
  if (count < 0) return 'transparent'; // future padding
  if (count === 0) return colors.neutral[200];
  if (count === 1) return colors.primary[200];
  if (count <= 3) return colors.primary[300];
  return colors.primary[500];
}

const STREAK_ROWS = [
  { type: 'prayer_session', label: 'Prayer sessions', icon: 'flower-outline' as const },
  { type: 'devotional', label: 'Devotionals', icon: 'book-outline' as const },
  { type: 'journal', label: 'Journal moments', icon: 'journal-outline' as const },
];

// Option D (owner pick 2026-07-04): the "Us" hub — every number that says
// "look what we're building" in one place. Reached from the Home streak card.
export default function UsHubModal() {
  const insets = useSafeAreaInsets();
  const { data: couple } = useMyCouple();
  const { data: profile } = useMyProfile();
  const { data: partner } = usePartnerProfile();
  const { data: activity } = useActivityLog();
  const { data: points } = usePointsTotal();

  const rows = activity ?? [];
  const heatmap = buildHeatmapWeeks(rows, HEATMAP_WEEKS);
  const daysTogether = couple?.created_at
    ? differenceInCalendarDays(new Date(), new Date(couple.created_at))
    : null;

  const prayerSessions = rows.filter((r) => r.activity_type === 'prayer_session').length;
  const badges = buildBadges({
    streakCount: couple?.streak_count ?? 0,
    totalActivities: rows.length,
    prayerSessions,
  });

  const names = [profile?.full_name?.split(' ')[0], partner?.full_name?.split(' ')[0]]
    .filter(Boolean)
    .join(' & ');

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <ModalHeader title="Us" />

      <View style={styles.hero}>
        <View style={styles.heroCount}>
          <Ionicons name="flame" size={26} color={colors.primary[500]} />
          <Text variant="displayLarge" style={styles.heroNumber}>
            {couple?.streak_count ?? 0}
          </Text>
        </View>
        <Text variant="labelMedium" color={colors.text.secondary}>
          day streak
        </Text>
        {names ? (
          <Text variant="bodySmall" color={colors.text.tertiary} style={styles.heroNames}>
            {names}
            {daysTogether !== null ? ` · ${daysTogether} days in the app together` : ''}
          </Text>
        ) : null}
      </View>

      <Pressable onPress={() => router.push('/modal/leaderboard')} accessibilityRole="button">
        <Card variant="outlined" padding="md" style={styles.pointsCard}>
          <View style={styles.pointsText}>
            <Text variant="headlineSmall">{points ?? 0} points</Text>
            <Text variant="labelSmall" color={colors.text.tertiary}>
              Earned together — exciting rewards are on the way
            </Text>
          </View>
          <View style={styles.pointsLink}>
            <Ionicons name="trophy-outline" size={18} color={colors.primary[500]} />
            <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
          </View>
        </Card>
      </Pressable>
      {/* D2 — the couple-private audit trail behind the number */}
      <Pressable
        onPress={() => router.push('/modal/points-history')}
        accessibilityRole="button"
        style={styles.pointsHistoryLink}
      >
        <Text variant="labelMedium" color={colors.text.link}>
          See how you earned them →
        </Text>
      </Pressable>

      <Card variant="outlined" padding="md" style={styles.section}>
        <Text variant="headlineSmall" style={styles.sectionTitle}>
          Every day you showed up
        </Text>
        <Text variant="labelSmall" color={colors.text.tertiary} style={styles.sectionHint}>
          last {HEATMAP_WEEKS} weeks — darker means more together
        </Text>
        <View style={styles.heatmap}>
          {heatmap.map((week, wi) => (
            <View key={wi} style={styles.heatColumn}>
              {week.map((count, di) => (
                <View
                  key={di}
                  style={[styles.heatCell, { backgroundColor: cellColor(count) }]}
                />
              ))}
            </View>
          ))}
        </View>
      </Card>

      <Card variant="outlined" padding="md" style={styles.section}>
        {STREAK_ROWS.map((row, i) => (
          <View
            key={row.type}
            style={[styles.streakRow, i < STREAK_ROWS.length - 1 && styles.streakRowBorder]}
          >
            <View style={styles.streakLabel}>
              <Ionicons name={row.icon} size={17} color={colors.primary[500]} />
              <Text variant="bodyMedium">{row.label}</Text>
            </View>
            <Text variant="labelLarge" color={colors.primary[600]}>
              {activityStreak(rows, row.type)} day
              {activityStreak(rows, row.type) === 1 ? '' : 's'}
            </Text>
          </View>
        ))}
      </Card>

      <View style={styles.badges}>
        {badges.map((badge) => (
          <View
            key={badge.key}
            style={[styles.badge, !badge.earned && styles.badgeLocked]}
          >
            <Ionicons
              name={badge.earned ? 'ribbon' : 'lock-closed-outline'}
              size={13}
              color={badge.earned ? colors.primary[600] : colors.neutral[400]}
            />
            <Text
              variant="labelSmall"
              color={badge.earned ? colors.primary[700] : colors.text.tertiary}
            >
              {badge.label}
            </Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroNumber: {
    color: colors.text.primary,
  },
  heroNames: {
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.md,
  },
  pointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  pointsHistoryLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  pointsText: {
    flex: 1,
  },
  pointsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    marginBottom: 2,
  },
  sectionHint: {
    marginBottom: spacing.md,
  },
  heatmap: {
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'center',
  },
  heatColumn: {
    gap: 3,
  },
  heatCell: {
    width: 11,
    height: 11,
    borderRadius: 2,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  streakRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  streakLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary[100],
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  badgeLocked: {
    backgroundColor: colors.neutral[100],
  },
});
