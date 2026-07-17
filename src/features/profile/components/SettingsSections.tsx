import { View, Pressable, Linking, Share, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { Text, Card } from '@/components/ui';
import { useUIStore, type AppearancePreference } from '@/stores/ui.store';
import { restorePurchases, isRevenueCatConfigured } from '@/services/revenuecat/client';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import {
  APP_NAME,
  PRIVACY_POLICY_URL,
  TERMS_URL,
  SUPPORT_EMAIL,
  WEBSITE_URL,
  APP_STORE_URL,
  SHARE_MESSAGE,
} from '@/constants/app';

const APPEARANCE_OPTIONS: { key: AppearancePreference; label: string }[] = [
  { key: 'system', label: 'System' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

interface Row {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

function SettingsCard({ rows }: { rows: Row[] }) {
  return (
    <Card variant="outlined" padding="sm">
      {rows.map((row, index) => (
        <Pressable
          key={row.label}
          onPress={row.onPress}
          style={[styles.row, index < rows.length - 1 && styles.rowBorder]}
          accessibilityRole="button"
        >
          <Text variant="bodyLarge" color={row.destructive ? colors.error : colors.text.primary}>
            {row.label}
          </Text>
          <Text
            variant="bodyMedium"
            color={row.destructive ? colors.error : colors.text.tertiary}
          >
            ›
          </Text>
        </Pressable>
      ))}
    </Card>
  );
}

// Everything that used to live behind Profile → Settings, flattened onto the
// Profile tab (owner ask 2026-07-05) so nothing hides one tap deeper.
export function SettingsSections() {
  const appearance = useUIStore((s) => s.appearance);
  const setAppearance = useUIStore((s) => s.setAppearance);
  const showToast = useUIStore((s) => s.showToast);

  const pickAppearance = (key: AppearancePreference) => {
    setAppearance(key);
    if (key === 'dark') {
      showToast('Saved — the dark theme arrives in an upcoming update.', 'info');
    }
  };

  const handleRestore = async () => {
    if (!isRevenueCatConfigured()) {
      showToast('Purchases will be restorable once the store goes live.', 'info');
      return;
    }
    const restored = await restorePurchases();
    showToast(
      restored ? 'Your purchases were restored.' : 'No purchases found to restore.',
      restored ? 'success' : 'info'
    );
  };

  const handleRate = () => {
    if (APP_STORE_URL) {
      void Linking.openURL(APP_STORE_URL);
    } else {
      showToast(`Thank you! Rating opens once ${APP_NAME} is on the App Store.`, 'info');
    }
  };

  // Simulators (and some devices) have no Mail app — openURL rejects.
  const handleSupport = async () => {
    try {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
    } catch {
      await Clipboard.setStringAsync(SUPPORT_EMAIL);
      showToast(`Email copied: ${SUPPORT_EMAIL}`, 'info');
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => showToast(`Visit ${url}`, 'info'));
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View>
      <Text variant="labelLarge" color={colors.text.tertiary} style={styles.sectionLabel}>
        Appearance
      </Text>
      <Card variant="outlined" padding="sm">
        <View style={styles.appearanceRow}>
          {APPEARANCE_OPTIONS.map((option) => {
            const active = appearance === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => pickAppearance(option.key)}
                style={[styles.appearanceChip, active && styles.appearanceChipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text
                  variant="labelLarge"
                  color={active ? colors.text.inverse : colors.text.secondary}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {appearance !== 'system' ? (
          <Text variant="labelSmall" color={colors.text.tertiary} style={styles.appearanceHint}>
            {appearance === 'dark'
              ? 'Saved — the dark theme ships in an upcoming update and will apply automatically.'
              : 'Light mode is the current look.'}
          </Text>
        ) : null}
      </Card>

      <Text variant="labelLarge" color={colors.text.tertiary} style={styles.sectionLabel}>
        Subscription
      </Text>
      <SettingsCard rows={[{ label: 'Restore Purchases', onPress: () => void handleRestore() }]} />

      <Text variant="labelLarge" color={colors.text.tertiary} style={styles.sectionLabel}>
        Spread the love
      </Text>
      <SettingsCard
        rows={[
          {
            label: 'Share the app',
            onPress: () => void Share.share({ message: SHARE_MESSAGE }),
          },
          { label: `Rate ${APP_NAME}`, onPress: handleRate },
          { label: 'About us', onPress: () => openLink(WEBSITE_URL) },
        ]}
      />

      <Text variant="labelLarge" color={colors.text.tertiary} style={styles.sectionLabel}>
        Support & legal
      </Text>
      <SettingsCard
        rows={[
          { label: 'Contact Support', onPress: () => void handleSupport() },
          { label: 'Privacy Policy', onPress: () => openLink(PRIVACY_POLICY_URL) },
          { label: 'Terms of Service', onPress: () => openLink(TERMS_URL) },
        ]}
      />

      <Text variant="labelLarge" color={colors.text.tertiary} style={styles.sectionLabel}>
        Account
      </Text>
      <SettingsCard
        rows={[
          {
            label: 'Delete Account',
            onPress: () => router.push('/(tabs)/profile/delete-account'),
            destructive: true,
          },
        ]}
      />

      <Text variant="labelSmall" color={colors.text.tertiary} style={styles.version}>
        {APP_NAME} v{version}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  appearanceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.xs,
  },
  appearanceChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.surface,
  },
  appearanceChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  appearanceHint: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  version: {
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
});
