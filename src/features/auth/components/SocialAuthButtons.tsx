import { Platform, View, StyleSheet } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Button, Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useAuth } from '../hooks/useAuth';
import { isGoogleSignInConfigured } from '../socialAuth';
import type { AuthMethod } from '../lastUsedMethod';

interface SocialAuthButtonsProps {
  // When provided (sign-in screen), shows a "Last used" tag on the matching
  // provider. Omitted on sign-up, where a "last used" hint doesn't apply.
  lastUsed?: AuthMethod | null;
}

function LastUsedTag() {
  return (
    <Text variant="bodySmall" color={colors.text.tertiary} style={styles.lastUsed}>
      Last used
    </Text>
  );
}

export function SocialAuthButtons({ lastUsed }: SocialAuthButtonsProps) {
  const { signInWithApple, signInWithGoogle, isLoading, error } = useAuth();

  // App Store rule: whenever a third-party login (Google) is offered, Apple must
  // be too. On iOS we always show Apple, so showing Google alongside is compliant.
  // Apple is iOS-only; Android shows Google only (no Apple requirement there).
  const showApple = Platform.OS === 'ios';
  const showGoogle = isGoogleSignInConfigured();

  if (!showApple && !showGoogle) return null;

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text variant="bodySmall" color={colors.text.tertiary} style={styles.dividerText}>
          or
        </Text>
        <View style={styles.line} />
      </View>

      {showApple && (
        <View style={styles.buttonWrap}>
          {lastUsed === 'apple' && <LastUsedTag />}
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={0}
            style={styles.appleButton}
            onPress={signInWithApple}
          />
        </View>
      )}

      {showGoogle && (
        <View style={styles.buttonWrap}>
          {lastUsed === 'google' && <LastUsedTag />}
          <Button
            title="Continue with Google"
            variant="outline"
            onPress={signInWithGoogle}
            loading={isLoading}
            fullWidth
          />
        </View>
      )}

      {error && (
        <Text variant="bodySmall" color={colors.error} style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral[300],
  },
  dividerText: {
    marginHorizontal: spacing.md,
  },
  buttonWrap: {
    marginBottom: spacing.md,
  },
  appleButton: {
    width: '100%',
    height: 48,
  },
  lastUsed: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  error: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
