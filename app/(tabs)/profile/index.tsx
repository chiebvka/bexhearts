import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Avatar, Card, Button } from '@/components/ui';
import { SubscriptionStatus } from '@/features/subscription';
import { useMyProfile } from '@/api/profiles';
import { useAuth } from '@/features/auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: profile } = useMyProfile();
  const { signOut } = useAuth();

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push('/(tabs)/profile/avatar')}
          accessibilityRole="button"
          accessibilityLabel="Change avatar"
        >
          <Avatar uri={profile?.avatar_url} name={profile?.full_name} size="xl" />
        </Pressable>
        <Text variant="headlineLarge" style={styles.name}>
          {profile?.full_name || 'Your Name'}
        </Text>
        <Text variant="bodyMedium" color={colors.text.secondary}>
          {profile?.email}
        </Text>
        {profile?.denomination && (
          <Text variant="bodySmall" color={colors.text.tertiary}>
            {profile.denomination}
          </Text>
        )}
      </View>

      <SubscriptionStatus />

      <Card variant="outlined" padding="md" style={styles.settingsCard}>
        <Pressable
          onPress={() => router.push('/(tabs)/profile/settings')}
          style={styles.settingsRow}
        >
          <Text variant="bodyLarge">Settings</Text>
          <Text variant="bodyMedium" color={colors.text.tertiary}>›</Text>
        </Pressable>
      </Card>

      <Button
        title="Sign Out"
        onPress={signOut}
        variant="ghost"
        style={styles.signOut}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  name: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  settingsCard: {
    marginTop: spacing.md,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signOut: {
    marginTop: spacing.xl,
    alignSelf: 'center',
  },
});
