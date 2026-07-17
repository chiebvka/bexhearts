import { StyleSheet } from 'react-native';
import { Card, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { ReflectionRevealState } from '../reflectionReveal';

interface PartnerReflectionProps {
  state: ReflectionRevealState;
  partnerName?: string | null;
  partnerReflection?: string | null;
}

// Renders the partner-reflection slot on the devotional screen. What it shows
// depends on the reveal state (see reflectionReveal.ts).
export function PartnerReflection({
  state,
  partnerName,
  partnerReflection,
}: PartnerReflectionProps) {
  const name = partnerName?.trim() || 'Your partner';

  if (state === 'locked') {
    return (
      <Card variant="outlined" style={styles.card}>
        <Text variant="labelLarge" style={styles.heading}>
          Partner reflection
        </Text>
        <Text variant="bodyMedium" color={colors.text.secondary}>
          Link with your partner to share reflections on each devotional.
        </Text>
      </Card>
    );
  }

  if (state === 'await-self') {
    return (
      <Card variant="outlined" style={styles.card}>
        <Text variant="labelLarge" style={styles.heading}>
          {name}&apos;s reflection
        </Text>
        <Text variant="bodyMedium" color={colors.text.secondary}>
          Write your own reflection to unlock {name}&apos;s.
        </Text>
      </Card>
    );
  }

  if (state === 'await-partner') {
    return (
      <Card variant="outlined" style={styles.card}>
        <Text variant="labelLarge" style={styles.heading}>
          {name}&apos;s reflection
        </Text>
        <Text variant="bodyMedium" color={colors.text.secondary}>
          Waiting for {name} to reflect. You&apos;ll both see each other&apos;s once they do.
        </Text>
      </Card>
    );
  }

  return (
    <Card variant="filled" style={styles.card}>
      <Text variant="labelLarge" style={styles.heading}>
        {name}&apos;s reflection
      </Text>
      <Text variant="bodyLarge" style={styles.body}>
        {partnerReflection}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
  },
  heading: {
    marginBottom: spacing.sm,
    color: colors.text.secondary,
  },
  body: {
    color: colors.text.primary,
    lineHeight: 26,
  },
});
