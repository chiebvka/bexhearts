import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Card, ModalHeader } from '@/components/ui';
import {
  STREAK_RULES,
  POINT_VALUES,
  POINTS_NOTE,
  REWARDS_NOTE,
} from '@/features/how-it-works/content';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

// E8 (owner-locked 2026-07-18): the permanent home of the streak/points/rewards
// rules — onboarding only carries brief beats; this screen carries the whole
// truth. Reached from the Home streak card, the Us hub, and Profile settings.
export default function HowItWorksModal() {
  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <ModalHeader title="How Bexhearts works" />

      <Text variant="labelLarge" color={colors.primary[600]} style={styles.sectionLabel}>
        🔥 The streak
      </Text>
      <Card variant="outlined" padding="md" style={styles.section}>
        {STREAK_RULES.map((rule, i) => (
          <View
            key={rule.title}
            style={[styles.rule, i < STREAK_RULES.length - 1 && styles.ruleBorder]}
          >
            <Text variant="bodyLarge" style={styles.ruleIcon}>
              {rule.icon}
            </Text>
            <View style={styles.ruleText}>
              <Text variant="labelLarge">{rule.title}</Text>
              <Text variant="bodySmall" color={colors.text.secondary}>
                {rule.body}
              </Text>
            </View>
          </View>
        ))}
      </Card>

      <Text variant="labelLarge" color={colors.primary[600]} style={styles.sectionLabel}>
        💜 Points
      </Text>
      <Card variant="outlined" padding="md" style={styles.section}>
        {POINT_VALUES.map((row, i) => (
          <View
            key={row.type}
            style={[styles.pointRow, i < POINT_VALUES.length - 1 && styles.ruleBorder]}
          >
            <Text variant="bodyMedium">{row.label}</Text>
            <Text variant="labelLarge" color={colors.primary[600]}>
              +{row.points}
            </Text>
          </View>
        ))}
        <Text variant="labelSmall" color={colors.text.tertiary} style={styles.pointsNote}>
          {POINTS_NOTE}
        </Text>
      </Card>

      <Text variant="labelLarge" color={colors.primary[600]} style={styles.sectionLabel}>
        🎁 Rewards
      </Text>
      <Card variant="outlined" padding="md" style={styles.section}>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {REWARDS_NOTE}
        </Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = themedStyles(() => ({
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  rule: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  ruleBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  ruleIcon: {
    // Emoji need an explicit lineHeight or they clip at the top (2026-07-04g).
    lineHeight: 24,
  },
  ruleText: {
    flex: 1,
    gap: 2,
  },
  pointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  pointsNote: {
    marginTop: spacing.sm,
  },
}));
