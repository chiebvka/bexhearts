import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from '@/components/ui';
import { useMyCouple, useRegenerateInviteCode } from '@/api/couples';
import { shareInviteCode, copyToClipboard } from '@/lib/linking';
import { formatInviteCode } from '@/utils/invite-code';
import { useUIStore } from '@/stores/ui.store';
import { successHaptic } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

// Solo-mode "carrot" (C2·M2): shown on the dashboard while the couple has no
// linked partner. Lets the solo user share / regenerate their invite code.
export function WaitingForPartnerCard() {
  const { data: couple } = useMyCouple();
  const regenerate = useRegenerateInviteCode();
  const showToast = useUIStore((s) => s.showToast);

  const code = couple?.invite_code;
  if (!code) return null;

  const handleCopy = async () => {
    await copyToClipboard(code);
    successHaptic();
    showToast('Code copied!', 'success');
  };

  return (
    <Card variant="elevated" padding="lg" style={styles.card}>
      <Text variant="headlineMedium" style={styles.title}>
        Invite your partner
      </Text>
      <Text variant="bodyMedium" color={colors.text.secondary} style={styles.subtitle}>
        Bexhearts is built for two. Share your code — shared prayer, check-ins,
        and partner reflections unlock the moment they join.
      </Text>

      <Text variant="displayMedium" style={styles.code}>
        {formatInviteCode(code)}
      </Text>

      <View style={styles.actions}>
        <Button
          title="Copy"
          onPress={handleCopy}
          variant="outline"
          size="sm"
          style={styles.actionButton}
        />
        <Button
          title="Share"
          onPress={() => shareInviteCode(code)}
          size="sm"
          style={styles.actionButton}
        />
      </View>

      <Button
        title="Generate a new code"
        onPress={() => regenerate.mutate()}
        loading={regenerate.isPending}
        variant="ghost"
        size="sm"
        style={styles.regen}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  code: {
    letterSpacing: 8,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  actionButton: {
    flex: 1,
  },
  regen: {
    marginTop: spacing.sm,
  },
});
