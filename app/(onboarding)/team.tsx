import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Button, Card } from '@/components/ui';
import { usePartnerProfile } from '@/api/couples';
import { TEAM_MOMENT_RULES } from '@/features/how-it-works/content';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

// E8·M2 — the partner-B "you're a team" moment (owner-approved 2026-07-18).
// The joiner skips the quiz + paywall, so this post-link screen is the only
// "how it works" they ever see. Reached ONLY from a successful link
// (usePartnerLink routes here); the CTA lands on the dashboard.
export default function TeamMomentScreen() {
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name?: string }>();
  // Param first (already resolved by the link), live profile as fallback.
  const { data: partner } = usePartnerProfile();
  const partnerFirst =
    (typeof name === 'string' && name.trim().split(' ')[0]) ||
    partner?.full_name?.split(' ')[0] ||
    'your partner';

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.xl }}>
      <View style={styles.hero}>
        <Text variant="displayMedium" style={styles.title}>
          You&apos;re linked with {partnerFirst} 💜
        </Text>
        <Text variant="bodyLarge" color={colors.text.secondary}>
          You two are a team now — here&apos;s all you need to know.
        </Text>
      </View>

      <Card variant="outlined" padding="md" style={styles.rules}>
        {TEAM_MOMENT_RULES.map((rule, i) => (
          <View
            key={rule.icon}
            style={[styles.rule, i < TEAM_MOMENT_RULES.length - 1 && styles.ruleBorder]}
          >
            <Text variant="bodyLarge" style={styles.ruleIcon}>
              {rule.icon}
            </Text>
            <Text variant="bodyMedium" style={styles.ruleText}>
              {rule.body}
            </Text>
          </View>
        ))}
      </Card>

      <Button
        title="See today's devotional"
        onPress={() => router.replace('/(tabs)')}
        fullWidth
        style={styles.button}
      />
    </ScreenContainer>
  );
}

const styles = themedStyles(() => ({
  hero: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
  },
  rules: {
    marginBottom: spacing.xl,
  },
  rule: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'flex-start',
  },
  ruleBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  ruleIcon: {
    // Emoji clip without an explicit lineHeight (2026-07-04g).
    lineHeight: 24,
  },
  ruleText: {
    flex: 1,
  },
  button: {
    marginTop: spacing.sm,
  },
}));
