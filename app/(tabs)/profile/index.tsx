import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Avatar, Button } from '@/components/ui';
import { SubscriptionStatus } from '@/features/subscription';
import { SettingsSections } from '@/features/profile/components/SettingsSections';
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

      {/* Settings live directly on the profile (owner ask 2026-07-05) —
          nothing hides behind an extra tap. */}
      <SettingsSections />

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
  signOut: {
    marginTop: spacing.xl,
    alignSelf: 'center',
  },
});
