import { type ComponentProps } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getStreakMessage } from '@/lib/dates';
import { useMyCouple } from '@/api/couples';
import { useActivityLog } from '@/api/activity';
import { useCoupleStore } from '@/stores/couple.store';
import { weekDots, typesDoneToday } from '../activity';
import type { StreakDayState } from '../streak';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface StreakCounterProps {
  dayState?: StreakDayState;
  partnerName?: string | null;
}

// Today's nudge line — the "don't break our streak" re-engagement moment.
function dayLine(state: StreakDayState | undefined, name: string) {
  switch (state) {
    case 'complete':
      return { text: "🔥 You're both in for today!", color: colors.accent[600] };
    case 'waiting-partner':
      return { text: `You're in — waiting on ${name} to keep it going.`, color: colors.primary[500] };
    case 'waiting-you':
      return { text: `${name} is in — complete today's devotional to keep your streak.`, color: colors.primary[500] };
    default:
      return null;
  }
}

const TRACKABLES = [
  { type: 'devotional', label: 'Devotional', icon: 'book' as const },
  { type: 'prayer_session', label: 'Prayer', icon: 'flower' as const },
  { type: 'check_in', label: 'Check-in', icon: 'chatbubble' as const },
];

// Option A (owner pick 2026-07-04): the Duolingo-style daily driver — streak
// number, week dots, grace chip, today's trackables. Tapping opens the Us hub.
export function StreakCounter({ dayState, partnerName }: StreakCounterProps) {
  // Prefer the live couple row (updated by the streak trigger); fall back to the
  // hydrated store value.
  const { data: couple } = useMyCouple();
  const storeCount = useCoupleStore((s) => s.streakCount);
  const streakCount = couple?.streak_count ?? storeCount;
  const { data: activity } = useActivityLog();

  const dots = weekDots(activity ?? []);
  const doneToday = typesDoneToday(activity ?? []);
  const graceLeft = couple?.grace_days_remaining ?? null;

  const name = partnerName?.trim() || 'your partner';
  const line = dayLine(dayState, name);

  return (
    <Pressable
      onPress={() => router.push('/modal/us-hub')}
      accessibilityRole="button"
      accessibilityLabel="Open your progress"
    >
      <Card variant="filled" padding="md" style={styles.card}>
        <Text variant="displayLarge" style={styles.count}>
          {streakCount}
        </Text>
        <Text variant="labelMedium" color={colors.text.secondary}>
          Day Streak
        </Text>
        <Text variant="bodySmall" color={colors.text.tertiary} style={styles.message}>
          {getStreakMessage(streakCount)}
        </Text>

        <View style={styles.dots}>
          {dots.map((dot) => (
            <View
              key={dot.date}
              style={[
                styles.dot,
                dot.count > 0 && styles.dotActive,
                dot.count > 1 && styles.dotStrong,
                dot.isToday && dot.count === 0 && styles.dotToday,
              ]}
            />
          ))}
        </View>

        {typeof graceLeft === 'number' && streakCount > 0 ? (
          <View style={styles.graceChip}>
            <Text variant="labelSmall" color={colors.primary[700]}>
              {graceLeft > 0
                ? `${graceLeft} grace day left this week`
                : 'No grace days left this week'}
            </Text>
          </View>
        ) : null}

        <View style={styles.trackables}>
          {TRACKABLES.map((t) => {
            const done = doneToday.has(t.type);
            return (
              <View key={t.type} style={styles.trackable}>
                <Ionicons
                  name={(done ? t.icon : `${t.icon}-outline`) as IoniconName}
                  size={15}
                  color={done ? colors.primary[500] : colors.neutral[400]}
                />
                <Text
                  variant="labelSmall"
                  color={done ? colors.text.primary : colors.text.tertiary}
                >
                  {t.label}
                </Text>
              </View>
            );
          })}
        </View>

        {line && (
          <Text variant="labelMedium" color={line.color} style={styles.dayLine}>
            {line.text}
          </Text>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  count: {
    color: colors.primary[500],
  },
  message: {
    marginTop: spacing.xs,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
  },
  dotActive: {
    backgroundColor: colors.primary[300],
    borderColor: colors.primary[300],
  },
  dotStrong: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  dotToday: {
    borderColor: colors.primary[400],
  },
  graceChip: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary[100],
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  trackables: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  trackable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayLine: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
