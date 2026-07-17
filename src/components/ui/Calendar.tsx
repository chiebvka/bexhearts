import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  buildMonthMatrix,
  parseYmd,
  toYmd,
  addMonths,
} from '@/lib/calendar';

interface CalendarProps {
  // Selected date as yyyy-MM-dd (or nothing selected yet).
  value?: string | null;
  onSelect: (ymd: string) => void;
}

// Milestones reach back to weddings/first-dates and forward to countdowns.
const MIN_YEAR = 1910;
const MAX_YEAR = new Date().getFullYear() + 15;
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

// In-app calendar (owner ask 2026-07-04: no typed dates). Two modes, the
// Couple Joy pattern: the day grid, and — after tapping the "July 2026"
// title — native month + year scroll wheels for fast jumps.
export function Calendar({ value, onSelect }: CalendarProps) {
  const today = new Date();
  const selected = parseYmd(value);
  const [visible, setVisible] = useState(() => ({
    year: selected?.year ?? today.getFullYear(),
    month: selected?.month ?? today.getMonth() + 1,
  }));
  const [mode, setMode] = useState<'days' | 'months'>('days');

  const weeks = buildMonthMatrix(visible.year, visible.month);
  const todayYmd = toYmd(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const shift = (delta: number) => setVisible((v) => addMonths(v.year, v.month, delta));

  return (
    <View>
      <View style={styles.header}>
        <Pressable
          onPress={() => setMode((m) => (m === 'days' ? 'months' : 'days'))}
          hitSlop={8}
          style={styles.titleButton}
          accessibilityRole="button"
          accessibilityLabel="Choose month and year"
        >
          <Text variant="headlineSmall">
            {MONTH_LABELS[visible.month - 1]} {visible.year}
          </Text>
          <Ionicons
            name={mode === 'days' ? 'chevron-down' : 'chevron-up'}
            size={16}
            color={colors.primary[500]}
          />
        </Pressable>
        {mode === 'days' ? (
          <View style={styles.chevrons}>
            <Pressable onPress={() => shift(-1)} hitSlop={10} accessibilityLabel="Previous month">
              <Ionicons name="chevron-back" size={22} color={colors.primary[500]} />
            </Pressable>
            <Pressable onPress={() => shift(1)} hitSlop={10} accessibilityLabel="Next month">
              <Ionicons name="chevron-forward" size={22} color={colors.primary[500]} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setMode('days')} hitSlop={8} accessibilityRole="button">
            <Text variant="labelLarge" color={colors.primary[500]}>
              Done
            </Text>
          </Pressable>
        )}
      </View>

      {mode === 'months' ? (
        <View style={styles.wheels}>
          <Picker
            selectedValue={visible.month}
            onValueChange={(month) => setVisible((v) => ({ ...v, month }))}
            style={styles.wheel}
            itemStyle={styles.wheelItem}
          >
            {MONTH_LABELS.map((label, i) => (
              <Picker.Item key={label} label={label} value={i + 1} />
            ))}
          </Picker>
          <Picker
            selectedValue={visible.year}
            onValueChange={(year) => setVisible((v) => ({ ...v, year }))}
            style={styles.wheel}
            itemStyle={styles.wheelItem}
          >
            {YEARS.map((year) => (
              <Picker.Item key={year} label={String(year)} value={year} />
            ))}
          </Picker>
        </View>
      ) : (
        <>
          <View style={styles.week}>
            {WEEKDAY_LABELS.map((d) => (
              <Text
                key={d}
                variant="labelSmall"
                color={colors.text.tertiary}
                style={styles.weekday}
              >
                {d}
              </Text>
            ))}
          </View>

          {weeks.map((week, wi) => (
            <View key={wi} style={styles.week}>
              {week.map((day, di) => {
                if (day === null) return <View key={di} style={styles.cell} />;
                const ymd = toYmd(visible.year, visible.month, day);
                const isSelected = value === ymd;
                const isToday = ymd === todayYmd;
                return (
                  <Pressable
                    key={di}
                    onPress={() => onSelect(ymd)}
                    style={[
                      styles.cell,
                      isToday && !isSelected && styles.today,
                      isSelected && styles.selected,
                    ]}
                    accessibilityLabel={ymd}
                  >
                    <Text
                      variant="bodyMedium"
                      color={isSelected ? colors.text.inverse : colors.text.primary}
                    >
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chevrons: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  week: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  today: {
    backgroundColor: colors.primary[100],
  },
  selected: {
    backgroundColor: colors.primary[500],
  },
  wheels: {
    flexDirection: 'row',
  },
  wheel: {
    flex: 1,
  },
  wheelItem: {
    fontSize: 18,
    color: colors.text.primary,
  },
});
