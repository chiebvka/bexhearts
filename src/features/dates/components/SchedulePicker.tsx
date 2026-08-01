import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borderRadius';
import { getSchedulePresets } from '../schedulePresets';

interface SchedulePickerProps {
  value: string | null; // yyyy-MM-dd
  onChange: (value: string | null) => void;
}

// JS-only date scheduling — quick presets, no native date-picker dependency.
export function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  const presets = getSchedulePresets();

  return (
    <View>
      <Text variant="labelMedium" color={colors.text.tertiary} style={styles.label}>
        Plan it for a day (optional)
      </Text>
      <View style={styles.chips}>
        {presets.map((p) => {
          const selected = value === p.date;
          return (
            <Pressable
              key={p.key}
              onPress={() => onChange(selected ? null : p.date)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text
                variant="labelMedium"
                color={selected ? colors.text.inverse : colors.text.secondary}
              >
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = themedStyles(() => ({
  label: {
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
  },
  chipSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
}));
