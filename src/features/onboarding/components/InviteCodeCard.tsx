import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { formatInviteCode } from '@/utils/invite-code';
import { copyToClipboard, shareInviteCode } from '@/lib/linking';
import { successHaptic } from '@/lib/haptics';
import { useUIStore } from '@/stores/ui.store';

interface InviteCodeCardProps {
  code: string;
}

export function InviteCodeCard({ code }: InviteCodeCardProps) {
  const showToast = useUIStore((s) => s.showToast);

  const handleCopy = async () => {
    await copyToClipboard(code);
    successHaptic();
    showToast('Code copied!', 'success');
  };

  const handleShare = () => {
    shareInviteCode(code);
  };

  return (
    <Card variant="elevated" padding="lg" style={styles.card}>
      <Text variant="labelLarge" color={colors.text.secondary} style={styles.label}>
        Your Invite Code
      </Text>
      <Text variant="displayLarge" style={styles.code}>
        {formatInviteCode(code)}
      </Text>
      <Text variant="bodySmall" color={colors.text.tertiary} style={styles.hint}>
        Share this code with your partner to connect
      </Text>

      <View style={styles.actions}>
        <Button
          title="Copy Code"
          onPress={handleCopy}
          variant="outline"
          size="sm"
          style={styles.actionButton}
        />
        <Button
          title="Share"
          onPress={handleShare}
          variant="primary"
          size="sm"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
  label: {
    marginBottom: spacing.sm,
  },
  code: {
    letterSpacing: 8,
    marginBottom: spacing.xs,
  },
  hint: {
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
