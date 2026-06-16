import { View, StyleSheet } from 'react-native';
import { Card, Text, Badge, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useIsPremium } from '../hooks/useEntitlement';
import { useRestorePurchases } from '../hooks/useOfferings';
import { triggerPaywall } from '@/services/superwall/client';
import { PAYWALL_EVENTS } from '@/constants/entitlements';

export function SubscriptionStatus() {
  const { isEntitled, isLoading } = useIsPremium();
  const { restore, isRestoring } = useRestorePurchases();

  if (isLoading) return null;

  return (
    <Card variant="outlined" padding="lg">
      <View style={styles.header}>
        <Text variant="headlineSmall">Subscription</Text>
        <Badge
          label={isEntitled ? 'Premium' : 'Free'}
          variant={isEntitled ? 'premium' : 'default'}
        />
      </View>

      {isEntitled ? (
        <Text variant="bodyMedium" color={colors.text.secondary} style={styles.description}>
          You have full access to all Bexhearts features.
        </Text>
      ) : (
        <>
          <Text variant="bodyMedium" color={colors.text.secondary} style={styles.description}>
            Upgrade to Premium to unlock all features and deepen your relationship.
          </Text>
          <Button
            title="Upgrade to Premium"
            onPress={() => triggerPaywall(PAYWALL_EVENTS.PROFILE_UPSELL)}
            variant="secondary"
            fullWidth
            style={styles.upgradeButton}
          />
          <Button
            title="Restore Purchases"
            onPress={restore}
            loading={isRestoring}
            variant="ghost"
            size="sm"
          />
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  description: {
    marginBottom: spacing.md,
  },
  upgradeButton: {
    marginBottom: spacing.sm,
  },
});
