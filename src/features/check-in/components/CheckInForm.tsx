import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Button } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borderRadius';
import { selectionHaptic } from '@/lib/haptics';
import { useSubmitCheckIn } from '@/api/check-ins';

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

const ratingStyles = StyleSheet.create({
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
});

interface CheckInFormProps {
  onSuccess?: () => void;
}

export function CheckInForm({ onSuccess }: CheckInFormProps) {
  const [emotional, setEmotional] = useState(0);
  const [spiritual, setSpiritual] = useState(0);
  const [communication, setCommunication] = useState(0);
  const submitCheckIn = useSubmitCheckIn();

  const canSubmit = emotional > 0 && spiritual > 0 && communication > 0;

  const handleSubmit = async () => {
    await submitCheckIn.mutateAsync({
      emotional_connection: emotional,
      spiritual_connection: spiritual,
      communication_quality: communication,
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
