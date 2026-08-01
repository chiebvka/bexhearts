import { useEffect, useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button, Text, Card, ModalHeader, EmptyState } from '@/components/ui';
import {
  usePrayers,
  useComposePrayer,
  useGrantAiPrayerConsent,
} from '@/api/prayers';
import { useMyProfile } from '@/api/profiles';
import { logActivity } from '@/api/activity';
import { notifyPartner, getMyFirstName } from '@/api/notifications';
import {
  buildFocusQueue,
  isCrisisText,
  getComposeLimitMessage,
  SESSION_DURATIONS_MINUTES,
} from '@/features/prayer/focus';
import { useAuthStore } from '@/stores/auth.store';
import { successHaptic, selectionHaptic } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';
import { SUPPORT_EMAIL } from '@/constants/app';

type Phase = 'setup' | 'praying' | 'done';

export default function PrayerFocusModal() {
  useKeepAwake(); // the screen stays lit for the whole session
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?.id);
  const { data: prayers } = usePrayers();
  const { data: profile } = useMyProfile();
  const compose = useComposePrayer();
  const grantConsent = useGrantAiPrayerConsent();

  const [phase, setPhase] = useState<Phase>('setup');
  const [minutes, setMinutes] = useState<number>(5);
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const queue = buildFocusQueue(prayers, userId);
  const current = queue[index];

  useEffect(() => {
    if (phase !== 'praying') return;
    const timer = setInterval(
      () => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)),
      1000
    );
    return () => clearInterval(timer);
  }, [phase]);

  const begin = () => {
    selectionHaptic();
    setSecondsLeft(minutes * 60);
    setIndex(0);
    setPhase('praying');
  };

  const advance = () => {
    selectionHaptic();
    compose.reset(); // a composed result belongs to the prayer it was made for
    if (index + 1 < queue.length) {
      setIndex(index + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    successHaptic();
    void logActivity('prayer_session');
    // G2/E3 — a finished session IS "praying for you": tell the partner
    // (debounced server-side; generic copy, never prayer content).
    notifyPartner({
      category: 'partner_activity',
      title: `${getMyFirstName()} just prayed for your requests 🙏`,
      route: '/(tabs)/connect/prayers',
    });
    setPhase('done');
  };

  // The pre-compose disclosure sheet was removed per owner (2026-07-10) — the
  // Compose tap itself is the affirmative act. The edge function still
  // requires the consent stamp, so first tap records it, then composes; the
  // full AI disclosure lives in the Privacy Policy (+ ToS §5).
  const handleCompose = async () => {
    if (!current) return;
    if (!profile?.ai_prayer_consent_at) {
      await grantConsent.mutateAsync().catch(() => undefined);
    }
    compose.mutate(current.id);
  };

  const mmss = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`;
  const composed = compose.data;
  const crisis = current ? isCrisisText(`${current.title} ${current.body ?? ''}`) : false;

  if (phase === 'done') {
    return (
      <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
        <View style={styles.doneWrap}>
          <Ionicons name="heart" size={56} color={colors.primary[500]} />
          <Text variant="displayMedium" style={styles.doneTitle}>
            Amen.
          </Text>
          <Text variant="bodyLarge" color={colors.text.secondary} style={styles.doneText}>
            You prayed through {queue.length} {queue.length === 1 ? 'prayer' : 'prayers'} today.
          </Text>
          <Button title="Back to your day" onPress={() => router.back()} fullWidth />
        </View>
      </ScreenContainer>
    );
  }

  if (phase === 'setup') {
    return (
      <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
        <ModalHeader title="Prayer time" />
        {queue.length === 0 ? (
          <EmptyState
            title="Nothing to pray through yet"
            description="Add a prayer — shared or personal — and come back."
            actionLabel="Add a prayer"
            onAction={() => router.replace('/modal/prayer-form')}
          />
        ) : (
          <>
            <Text variant="bodyLarge" color={colors.text.secondary} style={styles.setupIntro}>
              {queue.length} {queue.length === 1 ? 'prayer is' : 'prayers are'} waiting — set a
              few quiet minutes apart.
            </Text>
            <Text variant="labelMedium" color={colors.text.tertiary} style={styles.label}>
              How long?
            </Text>
            <View style={styles.durationRow}>
              {SESSION_DURATIONS_MINUTES.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMinutes(m)}
                  style={[styles.durationChip, minutes === m && styles.durationChipActive]}
                >
                  <Text
                    variant="labelLarge"
                    color={minutes === m ? colors.text.inverse : colors.text.secondary}
                  >
                    {m} min
                  </Text>
                </Pressable>
              ))}
            </View>
            <Button title="Begin" onPress={begin} fullWidth style={styles.begin} />
          </>
        )}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <View style={styles.sessionHeader}>
        <Text variant="labelMedium" color={colors.text.tertiary}>
          {index + 1} of {queue.length}
        </Text>
        <Text variant="labelMedium" color={secondsLeft === 0 ? colors.accent[600] : colors.primary[500]}>
          {mmss}
        </Text>
      </View>

      <Text variant="displayMedium" style={styles.prayerTitle}>
        {current?.title}
      </Text>
      {current?.body ? (
        <Text variant="bodyMedium" color={colors.text.secondary} style={styles.prayerBody}>
          {current.body}
        </Text>
      ) : null}

      {crisis ? (
        <Card variant="outlined" padding="md" style={styles.aiCard}>
          <Text variant="bodyMedium" color={colors.text.primary}>
            {`This one deserves more than an app. If you or someone you love is in danger or struggling, reach out to someone you trust, a pastor, or a crisis line — and we're at ${SUPPORT_EMAIL}.`}
          </Text>
        </Card>
      ) : composed?.limited ? (
        /* E9 — cap reached: a gentle nudge toward praying together, styled
           exactly like the other cards (owner: never error styling). */
        <Card variant="outlined" padding="md" style={styles.aiCard}>
          <Text variant="bodyMedium" color={colors.text.secondary}>
            {getComposeLimitMessage(composed.limited)}
          </Text>
        </Card>
      ) : composed?.unsuitable ? (
        <Card variant="outlined" padding="md" style={styles.aiCard}>
          <Text variant="bodyMedium" color={colors.text.secondary}>
            {"We couldn't shape this one into a prayer. Try editing it with a few honest words about what you're bringing to God."}
          </Text>
        </Card>
      ) : current?.ai_prayer || composed?.prayer ? (
        <Card variant="outlined" padding="md" style={styles.aiCard}>
          <Text variant="labelMedium" color={colors.primary[600]} style={styles.verseRef}>
            {current?.ai_verse_ref ?? composed?.verseRef}
          </Text>
          <Text variant="bodyMedium" color={colors.text.secondary} style={styles.verseText}>
            “{current?.ai_verse_text ?? composed?.verseText}”
          </Text>
          <Text variant="bodyLarge" style={styles.aiPrayer}>
            {current?.ai_prayer ?? composed?.prayer}
          </Text>
        </Card>
      ) : (
        <Card variant="outlined" padding="md" style={styles.aiCard}>
          {compose.isPending ? (
            <View style={styles.composing}>
              <ActivityIndicator color={colors.primary[500]} />
              <Text variant="bodySmall" color={colors.text.tertiary}>
                Composing a prayer…
              </Text>
            </View>
          ) : (
            <Button
              title="Compose a prayer ✨"
              variant="secondary"
              onPress={() => void handleCompose()}
              fullWidth
            />
          )}
        </Card>
      )}

      <View style={styles.sessionActions}>
        <Button
          title={index + 1 < queue.length ? 'Next prayer' : 'Amen'}
          onPress={advance}
          fullWidth
        />
        <Pressable onPress={() => router.back()} style={styles.leave} hitSlop={8}>
          <Text variant="labelMedium" color={colors.text.tertiary}>
            Leave quietly
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = themedStyles(() => ({
  doneWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  doneTitle: {
    marginTop: spacing.sm,
  },
  doneText: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  setupIntro: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  durationChip: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.surface,
  },
  durationChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  begin: {
    marginTop: spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  prayerTitle: {
    marginBottom: spacing.sm,
  },
  prayerBody: {
    marginBottom: spacing.md,
  },
  aiCard: {
    marginVertical: spacing.md,
  },
  verseRef: {
    marginBottom: spacing.xs,
  },
  verseText: {
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  aiPrayer: {
    lineHeight: 26,
  },
  composing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sessionActions: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
  leave: {
    alignSelf: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
}));
