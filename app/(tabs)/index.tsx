import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Avatar } from '@/components/ui';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { StreakCounter, QuickActions } from '@/features/dashboard';
import { DevotionalCard } from '@/features/devotional';
import { useMyProfile } from '@/api/profiles';
import { useTodayDevotional } from '@/api/devotionals';
import { usePartnerProfile } from '@/api/couples';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { router } from 'expo-router';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data: profile } = useMyProfile();
  const { data: partner } = usePartnerProfile();
  const { data: todayDevotional } = useTodayDevotional();

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <View style={styles.greeting}>
        <View>
          <Text variant="bodyMedium" color={colors.text.secondary}>
            Good morning,
          </Text>
          <Text variant="headlineLarge">{firstName}</Text>
        </View>
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
      </View>

      <StreakCounter />

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

const styles = StyleSheet.create({
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
});
