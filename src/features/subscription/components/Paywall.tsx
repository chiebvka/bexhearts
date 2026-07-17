import { useState } from 'react';
import { View, Pressable, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Text } from '@/components/ui';
import { useUIStore } from '@/stores/ui.store';
import {
  isRevenueCatConfigured,
  purchaseTrial,
  restorePurchases,
} from '@/services/revenuecat/client';
import { PRIVACY_POLICY_URL, TERMS_URL } from '@/constants/app';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import {
  PLAN_OPTIONS,
  TRIAL_TIMELINE,
  DEFAULT_PLAN,
  trialSubtitle,
  type PlanId,
} from '../plans';

interface PaywallProps {
  onComplete: () => void;
}

export function Paywall({ onComplete }: PaywallProps) {
  const showToast = useUIStore((s) => s.showToast);
  const [plan, setPlan] = useState<PlanId>(DEFAULT_PLAN);
  const [isLoading, setIsLoading] = useState(false);

  const onStart = async () => {
    // Dev / unconfigured — let the funnel through so everything stays testable.
    if (!isRevenueCatConfigured()) {
      onComplete();
      return;
    }
    setIsLoading(true);
    try {
      const ok = await purchaseTrial(plan);
      if (ok) onComplete();
      else showToast('That didn’t go through. Try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onRestore = async () => {
    const restored = await restorePurchases();
    if (restored) onComplete();
    else showToast('Nothing to restore on this account.', 'info');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          Start your 3-day free trial
        </Text>
        <Text variant="bodyMedium" color={colors.text.secondary}>
          Full access. No charge today.
        </Text>
      </View>

      <View style={styles.timeline}>
        {TRIAL_TIMELINE.map((step, i) => (
          <View key={step.title} style={styles.step}>
            <View style={styles.stepRail}>
              <View style={styles.stepDot}>
                <Ionicons name={step.icon as never} size={14} color={colors.text.inverse} />
              </View>
              {i < TRIAL_TIMELINE.length - 1 && <View style={styles.stepLine} />}
            </View>
            <View style={styles.stepBody}>
              <Text variant="labelLarge">{step.title}</Text>
              <Text variant="bodySmall" color={colors.text.secondary}>
                {step.body}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.plans}>
        {PLAN_OPTIONS.map((p) => {
          const selected = plan === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setPlan(p.id)}
              style={[styles.plan, selected && styles.planSelected]}
            >
              {p.highlight && (
                <View style={styles.badge}>
                  {/* vs weekly ($6.99×52) — the honest anchor math */}
                  <Text variant="labelSmall" color={colors.text.inverse} numberOfLines={1}>
                    Save 78%
                  </Text>
                </View>
              )}
              <Text variant="labelLarge">{p.label}</Text>
              <Text variant="headlineSmall" style={styles.planPrice}>
                {p.price}
              </Text>
              <Text variant="labelSmall" color={colors.text.tertiary}>
                {p.sub}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Button
        title="Start my free trial"
        onPress={onStart}
        loading={isLoading}
        fullWidth
      />
      <Text variant="labelSmall" color={colors.text.secondary} style={styles.subtext}>
        {trialSubtitle(plan)}
      </Text>
      <Text variant="labelSmall" color={colors.primary[600]} style={styles.coupleNote}>
        Billed per couple — your partner joins free
      </Text>

      <View style={styles.links}>
        <Pressable onPress={onRestore} hitSlop={8}>
          <Text variant="labelSmall" color={colors.text.tertiary}>
            Restore
          </Text>
        </Pressable>
        <Text variant="labelSmall" color={colors.neutral[300]}>
          ·
        </Text>
        <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8}>
          <Text variant="labelSmall" color={colors.text.tertiary}>
            Terms
          </Text>
        </Pressable>
        <Text variant="labelSmall" color={colors.neutral[300]}>
          ·
        </Text>
        <Pressable onPress={() => Linking.openURL(PRIVACY_POLICY_URL)} hitSlop={8}>
          <Text variant="labelSmall" color={colors.text.tertiary}>
            Privacy
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  timeline: {
    marginBottom: spacing.xl,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepRail: {
    alignItems: 'center',
    width: 28,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.primary[200],
    marginVertical: 2,
  },
  stepBody: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  plans: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  plan: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  planSelected: {
    borderColor: colors.primary[500],
    borderWidth: 2,
    backgroundColor: colors.primary[50],
  },
  badge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.primary[500],
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    maxWidth: '110%',
  },
  planPrice: {
    marginTop: spacing.xs,
  },
  subtext: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  coupleNote: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
