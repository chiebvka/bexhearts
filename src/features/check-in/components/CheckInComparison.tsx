import { View, StyleSheet } from 'react-native';
import { Card, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { CheckIn } from '@/types/api';
import { getVisiblePartnerNotes, type CheckInComparisonState } from '../comparison';

interface CheckInComparisonProps {
  state: CheckInComparisonState;
  partnerName?: string | null;
  mine?: CheckIn | null;
  partner?: CheckIn | null;
}

const METRICS: { key: keyof CheckIn; label: string }[] = [
  { key: 'emotional_connection', label: 'Emotional' },
  { key: 'spiritual_connection', label: 'Spiritual' },
  { key: 'communication_quality', label: 'Communication' },
];

// Shows the partner-comparison for this week's check-in. What renders depends on
// the reveal state (see comparison.ts) — locked/waiting messages, or the
// side-by-side ratings once both partners have submitted.
export function CheckInComparison({
  state,
  partnerName,
  mine,
  partner,
}: CheckInComparisonProps) {
  const name = partnerName?.trim() || 'Your partner';

  if (state === 'locked') {
    return (
      <Card variant="outlined" style={styles.card}>
        <Text variant="labelLarge" style={styles.heading}>
          This week&apos;s comparison
        </Text>
        <Text variant="bodyMedium" color={colors.text.secondary}>
          Link with your partner to compare how you&apos;re each feeling this week.
        </Text>
      </Card>
    );
  }

  if (state === 'await-self') {
    return (
      <Card variant="outlined" style={styles.card}>
        <Text variant="labelLarge" style={styles.heading}>
          This week&apos;s comparison
        </Text>
        <Text variant="bodyMedium" color={colors.text.secondary}>
          Complete this week&apos;s check-in to compare with {name}.
        </Text>
      </Card>
    );
  }

  if (state === 'await-partner') {
    return (
      <Card variant="outlined" style={styles.card}>
        <Text variant="labelLarge" style={styles.heading}>
          This week&apos;s comparison
        </Text>
        <Text variant="bodyMedium" color={colors.text.secondary}>
          You&apos;re in. Waiting for {name} to check in — you&apos;ll both see the
          comparison once they do.
        </Text>
      </Card>
    );
  }

  return (
    <Card variant="filled" style={styles.card}>
      <Text variant="labelLarge" style={styles.heading}>
        This week&apos;s comparison
      </Text>
      <View style={styles.headerRow}>
        <Text variant="labelMedium" color={colors.text.tertiary} style={styles.metricLabel} />
        <Text variant="labelMedium" style={styles.value}>
          You
        </Text>
        <Text variant="labelMedium" style={styles.value} numberOfLines={1}>
          {name}
        </Text>
      </View>
      {METRICS.map((m) => (
        <View key={m.key} style={styles.row}>
          <Text variant="bodyMedium" color={colors.text.secondary} style={styles.metricLabel}>
            {m.label}
          </Text>
          <Text variant="bodyLarge" style={styles.value}>
            {(mine?.[m.key] as number | null) ?? '—'}
          </Text>
          <Text variant="bodyLarge" style={styles.value}>
            {(partner?.[m.key] as number | null) ?? '—'}
          </Text>
        </View>
      ))}
      <PartnerNotes partner={partner} name={name} />
    </Card>
  );
}

// The revealed artifacts (D3): gratitude always, growth/prayer only if shared.
function PartnerNotes({ partner, name }: { partner?: CheckIn | null; name: string }) {
  const notes = getVisiblePartnerNotes(partner);
  if (!notes.gratitude && !notes.growth && !notes.prayer) return null;

  return (
    <View style={styles.notes}>
      {notes.gratitude && (
        <View style={styles.noteBlock}>
          <Text variant="labelSmall" color={colors.primary[600]}>
            What {name} appreciated about you 💜
          </Text>
          <Text variant="bodyMedium" style={styles.noteText}>
            “{notes.gratitude}”
          </Text>
        </View>
      )}
      {notes.growth && (
        <View style={styles.noteBlock}>
          <Text variant="labelSmall" color={colors.text.tertiary}>
            {name} is working on (shared with you)
          </Text>
          <Text variant="bodyMedium" style={styles.noteText}>
            {notes.growth}
          </Text>
        </View>
      )}
      {notes.prayer && (
        <View style={styles.noteBlock}>
          <Text variant="labelSmall" color={colors.text.tertiary}>
            {name}&apos;s prayer request 🙏
          </Text>
          <Text variant="bodyMedium" style={styles.noteText}>
            {notes.prayer}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
  },
  heading: {
    marginBottom: spacing.md,
    color: colors.text.secondary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  metricLabel: {
    flex: 2,
  },
  value: {
    flex: 1,
    textAlign: 'center',
  },
  notes: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  noteBlock: {
    gap: spacing.xs,
  },
  noteText: {
    lineHeight: 21,
  },
});
