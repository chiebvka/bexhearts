import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from '@/components/ui';
import { SignOutLink } from '@/features/auth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing['3xl'] }]}>
      <View style={styles.content}>
        <Text variant="displayLarge" style={styles.title}>
          Welcome to{'\n'}Bexhearts
        </Text>
        <Text variant="bodyLarge" color={colors.text.secondary} style={styles.description}>
          Grow closer to God and each other. Build your relationship on a foundation of faith, love, and intentional connection.
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          title="Get Started"
          onPress={() => router.push('/(onboarding)/profile-setup')}
          fullWidth
        />
        <SignOutLink />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    marginBottom: spacing.lg,
    color: colors.primary[500],
  },
  description: {
    lineHeight: 26,
  },
  footer: {
    paddingVertical: spacing.md,
  },
});
