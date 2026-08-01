import { View, Pressable } from 'react-native';
import Toast, { type ToastConfig } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borderRadius';
import { shadows } from '@/theme/shadows';

// Custom toast host config (owner ask 2026-07-19): the popup notifications
// slide in at the top and auto-dismiss, but had NO way to close them by hand —
// every toast now carries an ✕. Being custom also makes them theme-aware
// (the default BaseToast stayed light in dark mode — the known polish gap
// from the Phase 8 theme work).

type ToastType = 'success' | 'error' | 'info';

const ACCENT: Record<ToastType, () => string> = {
  // Functions, not a map of values — theme rule (see src/theme/colors.ts).
  success: () => colors.success,
  error: () => colors.error,
  info: () => colors.primary[500],
};

export function ToastCard({
  type,
  text1,
  text2,
}: {
  type: ToastType;
  text1?: string;
  text2?: string;
}) {
  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: ACCENT[type]() }]} />
      <View style={styles.textWrap}>
        {text1 ? <Text variant="labelLarge">{text1}</Text> : null}
        {text2 ? (
          <Text variant="bodySmall" color={colors.text.secondary}>
            {text2}
          </Text>
        ) : null}
      </View>
      <Pressable
        onPress={() => Toast.hide()}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
        style={styles.close}
      >
        <Ionicons name="close" size={18} color={colors.text.tertiary} />
      </Pressable>
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <ToastCard type="success" text1={text1} text2={text2} />
  ),
  error: ({ text1, text2 }) => <ToastCard type="error" text1={text1} text2={text2} />,
  info: ({ text1, text2 }) => <ToastCard type="info" text1={text1} text2={text2} />,
};

const styles = themedStyles(() => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
    overflow: 'hidden',
    ...shadows.md,
  },
  accent: {
    alignSelf: 'stretch',
    width: 4,
    marginRight: spacing.md,
  },
  textWrap: {
    flex: 1,
    gap: 2,
    paddingVertical: spacing.xs,
  },
  close: {
    padding: spacing.sm,
  },
}));
