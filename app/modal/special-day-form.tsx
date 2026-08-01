import { useState } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { KeyboardAvoid } from '@/components/layout/KeyboardAvoid';
import { Input } from '@/components/ui/Input';
import { Button, Text, Card, Calendar, ModalHeader } from '@/components/ui';
import { useCreateMilestone, useUpdateMilestone, useDeleteMilestone } from '@/api/journal';
import { getCountdown, MILESTONE_PRESETS } from '@/features/journal';
import { formatDate } from '@/lib/dates';
import { successHaptic, selectionHaptic } from '@/lib/haptics';
import { colors, lightColors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

// Deliberately snapshotted from the LIGHT palette: the picked swatch is
// STORED on the milestone row as a concrete hex, so it must not drift with
// the viewer's theme (both partners could be in different modes).
const SWATCHES = [
  lightColors.primary[500],
  lightColors.secondary[500],
  lightColors.accent[500],
  lightColors.primary[300],
];

export default function SpecialDayFormModal() {
  const insets = useSafeAreaInsets();
  // Edit mode: the Journal passes the milestone's current values as params.
  const params = useLocalSearchParams<{
    milestoneId?: string;
    icon?: string;
    title?: string;
    eventDate?: string;
    color?: string;
  }>();
  const isEditing = !!params.milestoneId;

  const [icon, setIcon] = useState(params.icon || '🎉');
  const [title, setTitle] = useState(params.title ?? '');
  const [eventDate, setEventDate] = useState(params.eventDate ?? '');
  const [color, setColor] = useState<string | null>(params.color || null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();

  const canSave = !!title.trim() && !!eventDate;

  const handleSave = async () => {
    if (!canSave) return;
    successHaptic();
    const fields = {
      title: title.trim(),
      icon: icon.trim() || null,
      event_date: eventDate,
      color,
    };
    if (isEditing) {
      await updateMilestone.mutateAsync({ id: params.milestoneId!, ...fields });
    } else {
      await createMilestone.mutateAsync(fields);
    }
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Remove this milestone?', `"${title}" will leave your story.`, [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deleteMilestone.mutateAsync(params.milestoneId!);
          router.back();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoid>
      <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
        <ModalHeader title={isEditing ? 'Edit milestone' : 'A milestone'} />

        {/* D7 — one-tap anniversary presets (dating/engagement/wedding…) so
            these land on the timeline as first-class milestones. */}
        {!isEditing && (
          <View style={styles.presets}>
            {MILESTONE_PRESETS.map((p) => {
              const selected = title === p.title;
              return (
                <Pressable
                  key={p.title}
                  onPress={() => {
                    selectionHaptic();
                    setIcon(p.icon);
                    setTitle(p.title);
                  }}
                  style={[styles.presetChip, selected && styles.presetChipSelected]}
                >
                  <Text
                    variant="labelMedium"
                    color={selected ? colors.text.inverse : colors.text.secondary}
                  >
                    {p.icon} {p.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.row}>
          <View style={styles.iconField}>
            <Text variant="labelMedium" color={colors.text.tertiary} style={styles.label}>
              Icon
            </Text>
            <Input value={icon} onChangeText={setIcon} maxLength={2} style={styles.iconInput} />
          </View>
          <View style={styles.grow}>
            <Input
              label="Title"
              placeholder="e.g. Our anniversary"
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        <Text variant="labelMedium" color={colors.text.tertiary} style={styles.label}>
          Date
        </Text>
        <Pressable
          onPress={() => setCalendarOpen((open) => !open)}
          style={styles.dateField}
          accessibilityRole="button"
          accessibilityLabel="Pick a date"
        >
          <Text
            variant="bodyLarge"
            color={eventDate ? colors.text.primary : colors.text.tertiary}
          >
            {eventDate ? formatDate(eventDate) : 'Pick a date'}
          </Text>
          <Text variant="labelSmall" color={colors.primary[500]}>
            {eventDate ? getCountdown(eventDate).label : ''}
          </Text>
        </Pressable>
        {calendarOpen ? (
          <Card variant="outlined" padding="md" style={styles.calendarCard}>
            <Calendar
              value={eventDate || null}
              onSelect={(ymd) => {
                selectionHaptic();
                setEventDate(ymd);
                setCalendarOpen(false);
              }}
            />
          </Card>
        ) : null}

        <Text variant="labelMedium" color={colors.text.tertiary} style={styles.label}>
          Color (optional)
        </Text>
        <View style={styles.swatches}>
          {SWATCHES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(color === c ? null : c)}
              style={[
                styles.swatch,
                { backgroundColor: c },
                color === c && styles.swatchSelected,
              ]}
            />
          ))}
        </View>

        <Button
          title={isEditing ? 'Save changes' : 'Save milestone'}
          onPress={handleSave}
          loading={createMilestone.isPending || updateMilestone.isPending}
          disabled={!canSave}
          fullWidth
          style={styles.save}
        />

        {isEditing ? (
          <Pressable onPress={handleDelete} style={styles.delete} hitSlop={8}>
            <Text variant="labelMedium" color={colors.accent[600]}>
              Remove this milestone
            </Text>
          </Pressable>
        ) : null}
      </ScreenContainer>
    </KeyboardAvoid>
  );
}

const styles = themedStyles(() => ({
  title: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  presetChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    borderRadius: 999,
  },
  presetChipSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  iconField: {
    width: 64,
  },
  grow: {
    flex: 1,
  },
  iconInput: {
    textAlign: 'center',
    fontSize: 22,
  },
  label: {
    marginBottom: spacing.sm,
  },
  dateField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  calendarCard: {
    marginBottom: spacing.md,
  },
  swatches: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: colors.text.primary,
  },
  save: {
    marginTop: spacing.md,
  },
  delete: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
}));
