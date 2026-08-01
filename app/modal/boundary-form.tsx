import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { KeyboardAvoid } from '@/components/layout/KeyboardAvoid';
import { Text, PremiumGate, ModalHeader } from '@/components/ui';
import { BoundaryForm } from '@/features/boundaries';
import { PAYWALL_EVENTS } from '@/constants/entitlements';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borderRadius';
import type { BoundaryType } from '@/types/common';

export default function BoundaryFormModal() {
  const insets = useSafeAreaInsets();
  const [type, setType] = useState<BoundaryType>('boundary');

  return (
    <KeyboardAvoid>
      <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
        <ModalHeader />
        <PremiumGate paywallEvent={PAYWALL_EVENTS.BOUNDARIES_GATE}>
          <View style={styles.tabs}>
            <Pressable
              onPress={() => setType('boundary')}
              style={[styles.tab, type === 'boundary' && styles.tabActive]}
            >
              <Text
                variant="labelLarge"
                color={type === 'boundary' ? colors.text.inverse : colors.text.secondary}
              >
                Boundary
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setType('temptation')}
              style={[styles.tab, type === 'temptation' && styles.tabActive]}
            >
              <Text
                variant="labelLarge"
                color={type === 'temptation' ? colors.text.inverse : colors.text.secondary}
              >
                Temptation Plan
              </Text>
            </Pressable>
          </View>

          {/* key resets template/category/field state when switching registers —
              the two forms ask different questions, so carrying text over misleads */}
          <BoundaryForm key={type} type={type} onSuccess={() => router.back()} />
        </PremiumGate>
      </ScreenContainer>
    </KeyboardAvoid>
  );
}

const styles = themedStyles(() => ({
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary[500],
  },
}));
