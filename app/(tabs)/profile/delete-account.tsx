import { useState } from 'react';
import { View, StyleSheet, Alert, Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, BackButton, Button, Input, Card } from '@/components/ui';
import { KeyboardAvoid } from '@/components/layout/KeyboardAvoid';
import { useAuth } from '@/features/auth';
import { useAuthStore } from '@/stores/auth.store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// Where users manage/cancel store subscriptions (deleting the account does NOT).
const SUBSCRIPTION_SETTINGS_URL =
  Platform.OS === 'ios'
    ? 'https://apps.apple.com/account/subscriptions'
    : 'https://play.google.com/store/account/subscriptions';

export default function DeleteAccountScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { deleteAccount, isLoading, error } = useAuth();
  const [password, setPassword] = useState('');

  // Email/password users re-authenticate (sensitive-action gate); social users
  // (Apple/Google) have no password to re-enter. Default to requiring it when the
  // provider is unknown, which is the safer assumption.
  const provider = user?.app_metadata?.provider;
  const isEmailUser = provider == null || provider === 'email';
  const canSubmit = !isEmailUser || password.length > 0;

  const confirmDelete = () => {
    if (!canSubmit) return;
    Alert.alert(
      'Delete account?',
      'Your account will be permanently deleted after a 7-day grace period. Sign back in before then to cancel.',
      [
        { text: 'Keep my account', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteAccount(
              isEmailUser && user?.email
                ? { email: user.email, password }
                : undefined
            );
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoid>
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <BackButton />
        <View style={styles.header}>
          <Text variant="displayLarge">Delete account</Text>
          <Text variant="bodyLarge" color={colors.text.secondary} style={styles.subtitle}>
            We&apos;ll schedule your account for deletion and sign you out. You
            have a 7-day grace period — sign back in before then to cancel.
            After that, your account and personal data are permanently removed.
            Your partner keeps your shared couple space.
          </Text>
        </View>

        <Card variant="outlined" padding="md" style={styles.notice}>
          <Text variant="bodyMedium">
            Deleting your account does not cancel your subscription. Manage or
            cancel it in the {Platform.OS === 'ios' ? 'App Store' : 'Play Store'}.
          </Text>
          <Button
            title="Manage subscription"
            variant="ghost"
            size="sm"
            onPress={() => Linking.openURL(SUBSCRIPTION_SETTINGS_URL)}
            style={styles.noticeButton}
          />
        </Card>

        {isEmailUser && (
          <Input
            label="Confirm your password"
            placeholder="Enter your password"
            secureTextEntry
            textContentType="password"
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
            containerStyle={styles.field}
          />
        )}

        {error && (
          <Text variant="bodySmall" color={colors.error} style={styles.error}>
            {error}
          </Text>
        )}

        <Button
          title="Delete my account"
          variant="danger"
          onPress={confirmDelete}
          loading={isLoading}
          disabled={!canSubmit}
          fullWidth
          style={styles.button}
        />

        <Button
          title="Cancel"
          variant="ghost"
          onPress={() => router.back()}
          fullWidth
        />
      </View>
    </KeyboardAvoid>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  notice: {
    marginBottom: spacing.lg,
  },
  noticeButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  field: {
    marginBottom: spacing.md,
  },
  error: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  button: {
    marginBottom: spacing.sm,
  },
});
