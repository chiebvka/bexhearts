import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, BackButton, Button, Card } from '@/components/ui';
import { useLeaveCouple, usePartnerProfile } from '@/api/couples';
import { useUIStore } from '@/stores/ui.store';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

// E14 — leaving a couple. Kept OFF the danger list next to "Delete account":
// ending a relationship is not the same as destroying your account, and a
// person doing this is often having the worst week of their year. The copy is
// plain and non-judgemental, states exactly what happens, and never asks why.
export default function LeaveCoupleScreen() {
  const insets = useSafeAreaInsets();
  const { data: partner } = usePartnerProfile();
  const leaveCouple = useLeaveCouple();
  const showToast = useUIStore((s) => s.showToast);

  const partnerName = partner?.full_name?.split(' ')[0];

  const confirmLeave = () => {
    Alert.alert(
      'Leave this couple?',
      partnerName
        ? `You'll be on your own again. ${partnerName} keeps the shared space and everything in it, and won't be notified.`
        : "You'll be on your own again. The shared space stays as it is.",
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveCouple.mutate(undefined, {
              onSuccess: () => {
                showToast('You’ve left the couple.', 'info');
                // Back to the gate, which routes a now-solo user to the
                // invite step where they can start fresh.
                router.replace('/');
              },
              onError: () =>
                showToast("That didn't go through. Please try again.", 'error'),
            });
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <BackButton />

      <Text variant="displayMedium" style={styles.title}>
        Leave this couple
      </Text>
      <Text variant="bodyLarge" color={colors.text.secondary} style={styles.subtitle}>
        Relationships end, and you shouldn&apos;t have to delete your account to move
        on. You can do this on your own, right now.
      </Text>

      <Card variant="outlined" padding="md" style={styles.card}>
        <Text variant="labelLarge" style={styles.cardTitle}>
          What happens
        </Text>
        <Text variant="bodyMedium" color={colors.text.secondary} style={styles.line}>
          • You&apos;re unlinked immediately. {partnerName ?? 'Your partner'} isn&apos;t
          notified.
        </Text>
        <Text variant="bodyMedium" color={colors.text.secondary} style={styles.line}>
          • {partnerName ?? 'They'} keep{partnerName ? 's' : ''} the shared space and
          everything in it. Nothing either of you wrote gets deleted.
        </Text>
        <Text variant="bodyMedium" color={colors.text.secondary} style={styles.line}>
          • Your shared streak and points stay with that space. A new relationship
          starts fresh.
        </Text>
        <Text variant="bodyMedium" color={colors.text.secondary} style={styles.line}>
          • Your invite code is replaced, so an old one can&apos;t be used to rejoin.
        </Text>
        <Text variant="bodyMedium" color={colors.text.secondary} style={styles.line}>
          • If you&apos;re the one paying, your subscription stays with you.
        </Text>
      </Card>

      <Text variant="labelSmall" color={colors.text.tertiary} style={styles.note}>
        You&apos;ll lose access to the shared journal the moment you leave. Take a
        copy first — afterwards there&apos;s no way back to it.
      </Text>

      {/* This used to say "save it before you go" with nothing to tap. The
          export is the answer to that sentence, and it belongs HERE, above
          the irreversible button, not buried in a settings list. */}
      <Button
        title="Export my journal first"
        variant="secondary"
        fullWidth
        onPress={() => router.push('/modal/journal-export')}
        style={styles.action}
      />

      <Button
        title="Leave this couple"
        variant="outline"
        fullWidth
        loading={leaveCouple.isPending}
        onPress={confirmLeave}
        style={styles.action}
      />
      <Button title="Never mind" variant="ghost" fullWidth onPress={() => router.back()} />
    </ScreenContainer>
  );
}

const styles = themedStyles(() => ({
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    marginBottom: spacing.sm,
  },
  line: {
    marginBottom: spacing.sm,
  },
  note: {
    marginBottom: spacing.lg,
  },
  action: {
    marginBottom: spacing.xs,
  },
}));
