import { useRef, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Card, ModalHeader } from '@/components/ui';
import { useMyCouple, usePartnerProfile } from '@/api/couples';
import { useMyProfile } from '@/api/profiles';
import { useActivityLog, useActivityStats, useActivityDailyCounts } from '@/api/activity';
import { usePointsTotal } from '@/api/points';
import { useCoupleDates } from '@/api/dates';
import { passportProgress } from '@/features/dates';
import {
  dailyCounts,
  countsFromDaily,
  buildHeatmapCells,
  lastDaysCells,
  rangeDays,
  heatCellLabel,
  activityStreak,
  bestLastLabel,
  bestStreakLine,
  togetherLabel,
  buildBadges,
  type HeatCell,
  type HeatmapRange,
} from '@/features/dashboard/activity';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

function cellColor(count: number): string {
  if (count === 0) return colors.neutral[200];
  if (count === 1) return colors.primary[200];
  if (count <= 3) return colors.primary[300];
  return colors.primary[500];
}

const RANGE_OPTIONS: { key: HeatmapRange; label: string }[] = [
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: 'all', label: 'All' },
];

const RANGE_HINTS: Record<HeatmapRange, string> = {
  '7d': 'last 7 days — darker means more together',
  '30d': 'last 30 days — darker means more together',
  all: 'since your first day — darker means more together',
};

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
  const { data: stats } = useActivityStats();
  const { data: coupleDates } = useCoupleDates();

  const [range, setRange] = useState<HeatmapRange>('30d');
  const [selectedCell, setSelectedCell] = useState<HeatCell | null>(null);
  const allScrollRef = useRef<ScrollView>(null);
  const { data: allDaily } = useActivityDailyCounts(range === 'all');

  const rows = activity ?? [];
  const counts = range === 'all' ? countsFromDaily(allDaily ?? []) : dailyCounts(rows);
  const weekRow = range === '7d' ? lastDaysCells(counts, 7) : null;
  const gridWeeks =
    range === '7d' ? null : buildHeatmapCells(counts, rangeDays(range, counts));
  const daysTogether = couple?.created_at
    ? differenceInCalendarDays(new Date(), new Date(couple.created_at))
    : null;
  const bestLine = bestStreakLine({
    longest: couple?.longest_streak,
    startedOn: couple?.longest_streak_started_on,
    endedOn: couple?.longest_streak_ended_on,
  });

  const pickRange = (next: HeatmapRange) => {
    setRange(next);
    setSelectedCell(null);
  };

  const prayerSessions = rows.filter((r) => r.activity_type === 'prayer_session').length;
  const badges = buildBadges({
    streakCount: couple?.streak_count ?? 0,
    totalActivities: rows.length,
    prayerSessions,
  });

  const passport = passportProgress(coupleDates);
  const passportBadge = {
    key: 'passport',
    label: passport.label,
    earned: passport.earned,
  };

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
        {/* E10·M4 — name the anchor so a 0-day streak beside a full heatmap
            reads as "the devotional streak broke", not "the app forgot us". */}
        <Text variant="labelMedium" color={colors.text.secondary}>
          day devotional streak
        </Text>
        {bestLine ? (
          <Text variant="labelSmall" color={colors.text.tertiary} style={styles.bestLine}>
            {bestLine}
          </Text>
        ) : null}
        {names ? (
          <Text variant="bodySmall" color={colors.text.tertiary} style={styles.heroNames}>
            {names}
            {togetherLabel(daysTogether) ? ` · ${togetherLabel(daysTogether)}` : ''}
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
        <View style={styles.heatmapHeader}>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Every day you showed up
          </Text>
          <View style={styles.rangeChips}>
            {RANGE_OPTIONS.map((option) => (
              <Pressable
                key={option.key}
                onPress={() => pickRange(option.key)}
                accessibilityRole="button"
                style={[styles.rangeChip, range === option.key && styles.rangeChipActive]}
              >
                <Text
                  variant="labelSmall"
                  color={range === option.key ? colors.primary[700] : colors.text.tertiary}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Text variant="labelSmall" color={colors.text.tertiary} style={styles.sectionHint}>
          {RANGE_HINTS[range]}
        </Text>

        {weekRow ? (
          // 7d — one large tappable row with weekday letters
          <View style={styles.weekRow}>
            {weekRow.map((cell) => (
              <Pressable
                key={cell.date}
                onPress={() => setSelectedCell(cell)}
                accessibilityRole="button"
                accessibilityLabel={heatCellLabel(cell)}
                style={styles.weekDay}
              >
                <View
                  style={[
                    styles.weekCell,
                    { backgroundColor: cellColor(cell.count) },
                    selectedCell?.date === cell.date && styles.cellSelected,
                  ]}
                />
                <Text variant="labelSmall" color={colors.text.tertiary}>
                  {format(parseISO(cell.date), 'EEEEE')}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <ScrollView
            ref={allScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            // "All" can span many months — land on the most recent weeks
            onContentSizeChange={() => allScrollRef.current?.scrollToEnd({ animated: false })}
            contentContainerStyle={styles.heatmapScroll}
          >
            <View style={styles.heatmap}>
              {(gridWeeks ?? []).map((week, wi) => (
                <View key={wi} style={styles.heatColumn}>
                  {week.map((cell) =>
                    cell.future ? (
                      <View key={cell.date} style={[styles.heatCell, styles.cellFuture]} />
                    ) : (
                      <Pressable
                        key={cell.date}
                        onPress={() => setSelectedCell(cell)}
                        accessibilityRole="button"
                        accessibilityLabel={heatCellLabel(cell)}
                        hitSlop={2}
                        style={[
                          styles.heatCell,
                          { backgroundColor: cellColor(cell.count) },
                          selectedCell?.date === cell.date && styles.cellSelected,
                        ]}
                      />
                    )
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        <Text
          variant="labelSmall"
          color={selectedCell ? colors.text.secondary : colors.text.tertiary}
          style={styles.cellDetail}
        >
          {selectedCell ? heatCellLabel(selectedCell) : 'tap a day for details'}
        </Text>
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
            <View style={styles.streakValue}>
              <Text variant="labelLarge" color={colors.primary[600]}>
                {activityStreak(rows, row.type)} day
                {activityStreak(rows, row.type) === 1 ? '' : 's'}
              </Text>
              {bestLastLabel(stats, row.type) ? (
                <Text variant="labelSmall" color={colors.text.tertiary}>
                  {bestLastLabel(stats, row.type)}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </Card>

      <View style={styles.badges}>
        {/* E13 — Passport: deliberately a badge, not a prize (rewards
            eligibility is still an open legal question, ToS §7). */}
        {[...badges, passportBadge].map((badge) => (
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

      {/* E8·M3 — the full rules live one tap away from every number here. */}
      <Pressable
        onPress={() => router.push('/modal/how-it-works')}
        accessibilityRole="button"
        style={styles.howItWorksLink}
      >
        <Text variant="labelMedium" color={colors.text.link}>
          How streaks & points work →
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = themedStyles(() => ({
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
  bestLine: {
    marginTop: 2,
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
  heatmapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeChips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  rangeChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.neutral[100],
  },
  rangeChipActive: {
    backgroundColor: colors.primary[100],
  },
  heatmapScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  heatmap: {
    flexDirection: 'row',
    gap: 3,
  },
  heatColumn: {
    gap: 3,
  },
  heatCell: {
    width: 13,
    height: 13,
    borderRadius: 2,
  },
  cellFuture: {
    backgroundColor: 'transparent',
  },
  cellSelected: {
    borderWidth: 1.5,
    borderColor: colors.primary[700],
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    alignItems: 'center',
    gap: 4,
  },
  weekCell: {
    width: 34,
    height: 34,
    borderRadius: 4,
  },
  cellDetail: {
    marginTop: spacing.sm,
    textAlign: 'center',
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
  streakValue: {
    alignItems: 'flex-end',
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
  howItWorksLink: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
  },
}));
