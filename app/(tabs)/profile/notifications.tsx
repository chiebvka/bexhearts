import { View, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Card, BackButton } from '@/components/ui';
import { useMyProfile, useUpdateProfile } from '@/api/profiles';
import type { ProfileUpdate } from '@/types/api';
import {
  setCategoryPref,
  setQuietHoursEnabled,
  PREF_ROWS,
  type NotificationPrefs,
} from '@/features/notifications/prefs';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

// Notification settings live on their own page (owner ask 2026-07-26) so the
// Profile tab reads as a short list of rows instead of a wall of switches.
// Every category is ON unless explicitly turned off — a missing key means
// enabled (see features/notifications/prefs.ts), so a brand-new account gets
// everything without touching this screen.
export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const prefs = (profile?.notification_prefs ?? {}) as NotificationPrefs;

  // NotificationPrefs is plain JSON-shaped data; the cast just bridges the
  // interface to the generated Json column type.
  const savePrefs = (next: NotificationPrefs) =>
    updateProfile.mutate({
      notification_prefs: next as unknown as ProfileUpdate['notification_prefs'],
    });

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <BackButton />

      <Text variant="headlineLarge" style={styles.title}>
        Notifications
      </Text>
      <Text variant="bodySmall" color={colors.text.secondary} style={styles.subtitle}>
        These are your settings for this phone — your partner controls their own.
      </Text>

      <Card variant="outlined" padding="sm">
        {PREF_ROWS.map((row, index) => (
          <View
            key={row.key}
            style={[styles.prefRow, index < PREF_ROWS.length && styles.rowBorder]}
          >
            <View style={styles.prefText}>
              <Text variant="bodyMedium">{row.label}</Text>
              <Text variant="labelSmall" color={colors.text.tertiary}>
                {row.hint}
              </Text>
            </View>
            <Switch
              value={prefs[row.key] !== false}
              onValueChange={(on) => savePrefs(setCategoryPref(prefs, row.key, on))}
              trackColor={{ true: colors.primary[500], false: colors.neutral[300] }}
              thumbColor={colors.surfaceElevated}
            />
          </View>
        ))}
        <View style={styles.prefRow}>
          <View style={styles.prefText}>
            <Text variant="bodyMedium">Quiet hours</Text>
            <Text variant="labelSmall" color={colors.text.tertiary}>
              No pushes 10pm – 8am (they still land in your inbox)
            </Text>
          </View>
          <Switch
            value={!!prefs.quiet_hours}
            onValueChange={(on) => savePrefs(setQuietHoursEnabled(prefs, on))}
            trackColor={{ true: colors.primary[500], false: colors.neutral[300] }}
            thumbColor={colors.surfaceElevated}
          />
        </View>
      </Card>

      <Text variant="labelSmall" color={colors.text.tertiary} style={styles.footnote}>
        Account and security messages are always delivered.
      </Text>
    </ScreenContainer>
  );
}

const styles = themedStyles(() => ({
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  prefText: {
    flex: 1,
  },
  footnote: {
    marginTop: spacing.md,
  },
}));
