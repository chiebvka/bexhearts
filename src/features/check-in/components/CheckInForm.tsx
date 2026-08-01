import { useState } from 'react';
import { View, StyleSheet, Pressable, Switch } from 'react-native';
import { Text, Button, Input } from '@/components/ui';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borderRadius';
import { selectionHaptic } from '@/lib/haptics';
import { useSubmitCheckIn } from '@/api/check-ins';
import { usePartnerProfile } from '@/api/couples';

interface RatingRowProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

function RatingRow({ label, value, onChange }: RatingRowProps) {
  return (
    <View style={ratingStyles.container}>
      <Text variant="bodyMedium" style={ratingStyles.label}>
        {label}
      </Text>
      <View style={ratingStyles.dots}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            onPress={() => {
              selectionHaptic();
              onChange(n);
            }}
            style={[
              ratingStyles.dot,
              n <= value && ratingStyles.dotActive,
            ]}
          >
            <Text
              variant="labelMedium"
              color={n <= value ? colors.text.inverse : colors.text.tertiary}
            >
              {n}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const ratingStyles = themedStyles(() => ({
  container: { marginBottom: spacing.lg },
  label: { marginBottom: spacing.sm, color: colors.text.secondary },
  dots: { flexDirection: 'row', gap: spacing.sm },
  dot: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
}));

// A private note field with an explicit per-field "share with partner" toggle
// (D3, owner locked 2026-07-10 — honest reflection needs a private default).
function PrivateNoteField({
  label,
  placeholder,
  value,
  onChangeText,
  share,
  onShareChange,
  partnerName,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  share: boolean;
  onShareChange: (v: boolean) => void;
  partnerName: string;
}) {
  return (
    <View style={noteStyles.container}>
      <Text variant="bodyMedium" style={noteStyles.label}>
        {label}
      </Text>
      <Input value={value} onChangeText={onChangeText} placeholder={placeholder} multiline />
      {value.trim().length > 0 && (
        <View style={noteStyles.shareRow}>
          <Text variant="labelSmall" color={colors.text.tertiary} style={noteStyles.shareLabel}>
            Share with {partnerName} (off = only you see this)
          </Text>
          <Switch
            value={share}
            onValueChange={onShareChange}
            trackColor={{ true: colors.primary[400] }}
          />
        </View>
      )}
    </View>
  );
}

const noteStyles = themedStyles(() => ({
  container: { marginBottom: spacing.lg },
  label: { marginBottom: spacing.sm, color: colors.text.secondary },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  shareLabel: { flex: 1, marginRight: spacing.sm },
}));

interface CheckInFormProps {
  onSuccess?: () => void;
}

export function CheckInForm({ onSuccess }: CheckInFormProps) {
  const [emotional, setEmotional] = useState(0);
  const [spiritual, setSpiritual] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [gratitude, setGratitude] = useState('');
  const [growth, setGrowth] = useState('');
  const [prayer, setPrayer] = useState('');
  const [shareGrowth, setShareGrowth] = useState(false);
  const [sharePrayer, setSharePrayer] = useState(false);
  const submitCheckIn = useSubmitCheckIn();
  const { data: partnerProfile } = usePartnerProfile();
  const partnerName = partnerProfile?.full_name?.split(' ')[0] || 'your partner';

  const canSubmit = emotional > 0 && spiritual > 0 && communication > 0;

  const handleSubmit = async () => {
    await submitCheckIn.mutateAsync({
      emotional_connection: emotional,
      spiritual_connection: spiritual,
      communication_quality: communication,
      gratitude_note: gratitude.trim() || null,
      growth_area: growth.trim() || null,
      prayer_request: prayer.trim() || null,
      share_growth_note: shareGrowth,
      share_prayer_request: sharePrayer,
    });
    onSuccess?.();
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Weekly Check-In
      </Text>
      <Text variant="bodyMedium" color={colors.text.secondary} style={styles.subtitle}>
        How are things going this week?
      </Text>

      <RatingRow label="Emotional Connection" value={emotional} onChange={setEmotional} />
      <RatingRow label="Spiritual Connection" value={spiritual} onChange={setSpiritual} />
      <RatingRow label="Communication Quality" value={communication} onChange={setCommunication} />

      {/* Gratitude is the revealed artifact — shown to your partner alongside
          the ratings once you've BOTH checked in (never before). */}
      <View style={noteStyles.container}>
        <Text variant="bodyMedium" style={noteStyles.label}>
          Something you appreciated about {partnerName} this week
        </Text>
        <Input
          value={gratitude}
          onChangeText={setGratitude}
          placeholder="They'll see this once you've both checked in…"
          multiline
        />
      </View>

      <PrivateNoteField
        label="An area you want to grow in"
        placeholder="Just for you, unless you choose to share…"
        value={growth}
        onChangeText={setGrowth}
        share={shareGrowth}
        onShareChange={setShareGrowth}
        partnerName={partnerName}
      />

      <PrivateNoteField
        label="A prayer request this week"
        placeholder="Just for you, unless you choose to share…"
        value={prayer}
        onChangeText={setPrayer}
        share={sharePrayer}
        onShareChange={setSharePrayer}
        partnerName={partnerName}
      />

      <Button
        title="Submit Check-In"
        onPress={handleSubmit}
        loading={submitCheckIn.isPending}
        disabled={!canSubmit}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
});
