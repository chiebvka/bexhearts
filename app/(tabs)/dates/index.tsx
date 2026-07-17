import { useState, useMemo } from 'react';
import { View, FlatList, SectionList, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, LoadingScreen, EmptyState } from '@/components/ui';
import { DateIdeaCard, CoupleDateCard, partitionCoupleDates } from '@/features/dates';
import {
  useDateIdeas,
  useCoupleDates,
  useRemoveCoupleDate,
  useDateIdeaAggregates,
} from '@/api/dates';
import { DATE_CATEGORIES } from '@/constants/devotional';
import { lightHaptic } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borderRadius';

type Tab = 'ideas' | 'ours';

export default function DatesScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('ideas');

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <Text variant="headlineLarge" style={styles.title}>
        Dates
      </Text>

      <View style={styles.segmented}>
        {(['ideas', 'ours'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.segment, tab === t && styles.segmentActive]}
          >
            <Text
              variant="labelLarge"
              color={tab === t ? colors.text.inverse : colors.text.secondary}
            >
              {t === 'ideas' ? 'Ideas' : 'Our Dates'}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'ideas' ? <IdeasTab /> : <OurDatesTab />}
    </View>
  );
}

function IdeasTab() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { data: ideas, isLoading } = useDateIdeas(selectedCategory);
  const { data: aggregates } = useDateIdeaAggregates();

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filters}
      >
        <Pressable
          onPress={() => setSelectedCategory(undefined)}
          style={[styles.chip, !selectedCategory && styles.chipActive]}
        >
          <Text
            variant="labelMedium"
            color={!selectedCategory ? colors.text.inverse : colors.text.secondary}
          >
            All
          </Text>
        </Pressable>
        {DATE_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key}
            onPress={() => setSelectedCategory(cat.key)}
            style={[styles.chip, selectedCategory === cat.key && styles.chipActive]}
          >
            <Text
              variant="labelMedium"
              color={selectedCategory === cat.key ? colors.text.inverse : colors.text.secondary}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={ideas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DateIdeaCard
            idea={item}
            aggregate={aggregates?.get(item.id)}
            onPress={() => router.push(`/(tabs)/dates/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState title="No date ideas found" description="Try a different category." />
        }
      />
    </>
  );
}

function OurDatesTab() {
  const { data: dates, isLoading } = useCoupleDates();
  const removeDate = useRemoveCoupleDate();

  const sections = useMemo(() => {
    const { planned, saved, completed } = partitionCoupleDates(dates);
    return [
      { key: 'planned', title: 'Planned', data: planned },
      { key: 'saved', title: 'Saved', data: saved },
      { key: 'completed', title: 'Memories', data: completed },
    ].filter((s) => s.data.length > 0);
  }, [dates]);

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <View style={styles.createRow}>
        <Button
          title="+ Create your own"
          onPress={() => router.push('/modal/date-form')}
          variant="secondary"
          size="sm"
          fullWidth
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text
            variant="labelMedium"
            color={colors.text.tertiary}
            style={styles.sectionHeader}
          >
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <CoupleDateCard
            coupleDate={item}
            onComplete={() => router.push(`/modal/date-complete?id=${item.id}`)}
            onRemove={() => {
              lightHaptic();
              removeDate.mutate(item.id);
            }}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="No dates yet"
            description="Save an idea or create your own to start planning."
            actionLabel="Create your own"
            onAction={() => router.push('/modal/date-form')}
          />
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  segmented: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.primary[500],
  },
  // Fixed height: flexGrow: 0 alone lets the scroller hug the chips so tightly
  // that descenders clip (owner report 2026-07-05); a set height gives the row
  // room in every filter state.
  filtersScroll: {
    flexGrow: 0,
    height: 44,
    marginBottom: spacing.sm,
  },
  filters: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
  },
  chipActive: {
    backgroundColor: colors.primary[500],
  },
  createRow: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    paddingHorizontal: spacing.md,
    flexGrow: 1,
  },
});
