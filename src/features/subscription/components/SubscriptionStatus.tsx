import { View, StyleSheet } from 'react-native';
import { Card, Text, Badge, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useEntitlementAccess } from '../hooks/useEntitlement';
import { useRestorePurchases } from '../hooks/useOfferings';
import { triggerPaywall } from '@/services/superwall/client';
import { PAYWALL_EVENTS } from '@/constants/entitlements';

export function SubscriptionStatus() {
  const { isEntitled, reason, isLoading } = useEntitlementAccess();
  const { restore, isRestoring } = useRestorePurchases();

  if (isLoading) return null;

  const isComped = reason === 'comp';

  return (
    <Card variant="outlined" padding="lg">
      <View style={styles.header}>
        <Text variant="headlineSmall">Subscription</Text>
        <Badge
          label={isComped ? 'Complimentary' : isEntitled ? 'Premium' : 'Free'}
          variant={isEntitled ? 'premium' : 'default'}
        />
      </View>

      {isEntitled ? (
        <Text variant="bodyMedium" color={colors.text.secondary} style={styles.description}>
          {isComped
            ? // Comped users are NOT store subscribers. Saying "you're
              // subscribed" would send them to Apple looking for a
              // subscription to manage that does not exist.
              'You have full access to Bexhearts, on the house. There’s nothing to pay and nothing to manage.'
            : 'You have full access to all Bexhearts features.'}
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
