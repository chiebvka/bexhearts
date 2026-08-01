import { StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import { Text } from './Text';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useEntitlementAccess } from '@/features/subscription/hooks/useEntitlement';
import { triggerPaywall } from '@/services/superwall/client';

interface PremiumGateProps {
  paywallEvent: string;
  children: ReactNode;
  fallback?: ReactNode;
}

function DefaultLockedState({ onUnlock }: { onUnlock: () => void }) {
  return (
    <Card variant="outlined" padding="lg" style={styles.lockedCard}>
      <Badge label="Premium" variant="premium" style={styles.badge} />
      <Text variant="headlineSmall" style={styles.title}>
        Unlock this feature
      </Text>
      <Text variant="bodyMedium" color={colors.text.secondary} style={styles.description}>
        Upgrade to Premium to access this feature and grow deeper in your relationship.
      </Text>
      <Button
        title="Unlock Premium"
        onPress={onUnlock}
        variant="secondary"
        fullWidth
      />
    </Card>
  );
}

export function PremiumGate({ paywallEvent, children, fallback }: PremiumGateProps) {
  // Same access answer as the app-wide gate — a comped user must not clear the
  // tab gate and then be told to "Unlock Premium" on a feature.
  const { isEntitled, isLoading } = useEntitlementAccess();

  if (isLoading) return null;
  if (isEntitled) return <>{children}</>;

  return (
    fallback ?? (
      <DefaultLockedState onUnlock={() => triggerPaywall(paywallEvent)} />
    )
  );
}

const styles = StyleSheet.create({
  lockedCard: {
    alignItems: 'center',
    margin: spacing.md,
  },
  badge: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
