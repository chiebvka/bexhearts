import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button } from '@/components/ui';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { InviteCodeCard, PartnerLinkForm, useInviteCode } from '@/features/onboarding';
import { PARTNER_INVITE_BEAT } from '@/features/how-it-works/content';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useState } from 'react';

export default function PartnerInviteScreen() {
  const insets = useSafeAreaInsets();
  const { inviteCode, generateCode, regenerateCode, isLoading } = useInviteCode();
  const [mode, setMode] = useState<'choose' | 'invite' | 'join'>('choose');

  if (mode === 'invite') {
    return (
      <ScreenContainer style={{ paddingTop: insets.top + spacing.xl }}>
        <Text variant="displayMedium" style={styles.title}>
          Invite Your Partner
        </Text>

        {inviteCode ? (
          <>
            <InviteCodeCard code={inviteCode} />
            {/* E8·M1 — answers "does my streak count while I wait?" (yes). */}
            <Text variant="bodySmall" color={colors.text.secondary} style={styles.soloBeat}>
              {PARTNER_INVITE_BEAT}
            </Text>
            <Button
              title="Generate a new code"
              onPress={regenerateCode}
              loading={isLoading}
              variant="ghost"
              size="sm"
              style={styles.switchButton}
            />
          </>
        ) : (
          <Button
            title="Generate Invite Code"
            onPress={generateCode}
            loading={isLoading}
            fullWidth
          />
        )}

        <Button
          title="I have a code instead"
          onPress={() => setMode('join')}
          variant="ghost"
          style={styles.switchButton}
        />

        <Button
          title="Skip for now"
          onPress={() => router.replace('/(tabs)')}
          variant="ghost"
          size="sm"
          style={styles.skipButton}
        />
      </ScreenContainer>
    );
  }

  if (mode === 'join') {
    return (
      <ScreenContainer style={{ paddingTop: insets.top + spacing.xl }}>
        <PartnerLinkForm />

        <Button
          title="I want to invite instead"
          onPress={() => setMode('invite')}
          variant="ghost"
          style={styles.switchButton}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.xl }}>
      <Text variant="displayMedium" style={styles.title}>
        Connect with your partner
      </Text>
      <Text variant="bodyLarge" color={colors.text.secondary} style={styles.subtitle}>
        Bexhearts works best when both of you are here. How would you like to connect?
      </Text>

      <View style={styles.options}>
        <Button
          title="Invite My Partner"
          onPress={() => setMode('invite')}
          fullWidth
          style={styles.optionButton}
        />
        <Button
          title="I Have an Invite Code"
          onPress={() => setMode('join')}
          variant="outline"
          fullWidth
        />
      </View>

      <Button
        title="Skip for now"
        onPress={() => router.replace('/(tabs)')}
        variant="ghost"
        size="sm"
        style={styles.skipButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  options: {
    gap: spacing.md,
  },
  optionButton: {
    marginBottom: spacing.xs,
  },
  switchButton: {
    marginTop: spacing.lg,
  },
  soloBeat: {
    marginTop: spacing.md,
    textAlign: 'center',
    // Emoji clip without an explicit lineHeight (2026-07-04g).
    lineHeight: 20,
  },
  skipButton: {
    marginTop: spacing.xl,
    alignSelf: 'center',
  },
});
