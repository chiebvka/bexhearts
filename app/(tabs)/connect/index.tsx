import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Card } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { lightHaptic } from '@/lib/haptics';
import { CheckInComparison, getCheckInComparisonState } from '@/features/check-in';
import { useThisWeekComparison } from '@/api/check-ins';
import { useAuthStore } from '@/stores/auth.store';
import { useCoupleStore } from '@/stores/couple.store';
import { usePartnerProfile } from '@/api/couples';

const sections = [
  {
    title: 'Shared Prayers',
    description: 'Pray for each other and track answered prayers.',
    route: '/(tabs)/connect/prayers' as const,
    emoji: '🙏',
  },
  {
    title: 'Weekly Check-In',
    description: 'Reflect on your relationship this week.',
    route: '/modal/check-in-form' as const,
    emoji: '💬',
  },
  {
    title: 'Boundaries & Plans',
    description: 'Set boundaries and temptation plans together.',
    route: '/(tabs)/connect/boundaries' as const,
    emoji: '🛡️',
  },
];

export default function ConnectScreen() {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?.id);
  const isLinked = useCoupleStore((s) => s.isLinked);
  const { data: partner } = usePartnerProfile();
  const { data: weekCheckIns } = useThisWeekComparison();

  const mine = weekCheckIns?.find((c) => c.user_id === userId) ?? null;
  const partnerCheckIn = weekCheckIns?.find((c) => c.user_id !== userId) ?? null;
  const comparisonState = getCheckInComparisonState({
    isLinked,
    mine,
    partner: partnerCheckIn,
  });

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <Text variant="headlineLarge" style={styles.title}>
        Connect
      </Text>
      <Text variant="bodyMedium" color={colors.text.secondary} style={styles.subtitle}>
        Strengthen your bond through communication and accountability.
      </Text>

      {sections.map((section) => (
        <Pressable
          key={section.title}
          onPress={() => {
            lightHaptic();
            router.push(section.route);
          }}
        >
          <Card variant="elevated" padding="md" style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.emoji}>{section.emoji}</Text>
              <View style={styles.cardText}>
                <Text variant="headlineSmall">{section.title}</Text>
                <Text variant="bodySmall" color={colors.text.secondary}>
                  {section.description}
                </Text>
              </View>
            </View>
          </Card>
        </Pressable>
      ))}

      <CheckInComparison
        state={comparisonState}
        partnerName={partner?.full_name}
        mine={mine}
        partner={partnerCheckIn}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emoji: {
    fontSize: 32,
    // Emoji need explicit lineHeight or iOS clips their tops.
    lineHeight: 42,
  },
  cardText: {
    flex: 1,
    gap: spacing.xs,
  },
});
