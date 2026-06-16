import { Pressable, Linking, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Card } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { PRIVACY_POLICY_URL, TERMS_URL, SUPPORT_EMAIL } from '@/constants/app';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  const settingsItems = [
    { label: 'Privacy Policy', onPress: () => Linking.openURL(PRIVACY_POLICY_URL) },
    { label: 'Terms of Service', onPress: () => Linking.openURL(TERMS_URL) },
    { label: 'Contact Support', onPress: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}`) },
  ];

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <Text variant="headlineLarge" style={styles.title}>Settings</Text>

      <Card variant="outlined" padding="sm">
        {settingsItems.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            style={[styles.row, index < settingsItems.length - 1 && styles.rowBorder]}
          >
            <Text variant="bodyLarge">{item.label}</Text>
            <Text variant="bodyMedium" color={colors.text.tertiary}>›</Text>
          </Pressable>
        ))}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.lg,
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
});
