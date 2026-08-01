import { useState, useMemo } from 'react';
import { View, SectionList, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, LoadingScreen, EmptyState, BackButton } from '@/components/ui';
import {
  DateIdeaCard,
  CoupleDateCard,
  partitionCoupleDates,
  canRespondToSuggestion,
  getCountry,
} from '@/features/dates';
import {
  useDateIdeas,
  useCoupleDates,
  useRemoveCoupleDate,
  useAcceptSuggestedDate,
  useDateIdeaAggregates,
} from '@/api/dates';
import { DATE_CATEGORIES } from '@/constants/devotional';
import { buildIdeaFilters, buildIdeaSections } from '@/features/ldr/ldr';
import { useMyCouple } from '@/api/couples';
import { lightHaptic, successHaptic } from '@/lib/haptics';
import { useAuthStore } from '@/stores/auth.store';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borderRadius';

type Tab = 'ideas' | 'ours';

export default function DatesScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('ideas');

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      {/* Dates is hidden from the tab bar (IA decision 2026-07-04) and is
          entered from Home, so it needs its own way back. */}
      <BackButton style={styles.back} />
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
  // E13 — "See more ideas from Nigeria" arrives as ?country=NG.
  const { country } = useLocalSearchParams<{ country?: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    country ? `country:${country}` : undefined
  );
  const { data: ideas, isLoading } = useDateIdeas(selectedCategory);
  const { data: aggregates } = useDateIdeaAggregates();
  const { data: couple } = useMyCouple();

  const isLongDistance = !!couple?.is_long_distance;

  // E11 — Virtual 💻 leads for long-distance couples, trails otherwise.
  const filters = buildIdeaFilters(
    DATE_CATEGORIES.map((cat) => ({ key: cat.key, label: cat.label })),
    isLongDistance
  );

  const sections = buildIdeaSections({
    ideas: ideas ?? [],
    isLongDistance,
    filtered: !!selectedCategory,
  });

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
        {/* A country arrives via deep link, so it needs its own chip to be
            visible and dismissible rather than an invisible active filter. */}
        {country ? (
          <Pressable
            onPress={() => setSelectedCategory(`country:${country}`)}
            style={[
              styles.chip,
              selectedCategory === `country:${country}` && styles.chipActive,
            ]}
          >
            <Text
              variant="labelMedium"
              color={
                selectedCategory === `country:${country}`
                  ? colors.text.inverse
                  : colors.text.secondary
              }
            >
              {getCountry(country).flag} {getCountry(country).name}
            </Text>
          </Pressable>
        ) : null}
        {filters.map((cat) => (
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

      {/* E12 — for a long-distance couple the unfiltered list splits: what
          you can do apart RIGHT NOW, then everything else reframed as visit
          planning. Co-located ideas are sunk, never hidden. */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) =>
          section.title ? (
            <Text
              variant="labelLarge"
              color={colors.text.tertiary}
              style={styles.sectionHeader}
            >
              {section.title}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <DateIdeaCard
            idea={item}
            aggregate={aggregates?.[item.id]}
            onPress={() => router.push(`/dates/${item.id}`)}
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
  const acceptDate = useAcceptSuggestedDate();
  const userId = useAuthStore((s) => s.user?.id);

  const sections = useMemo(() => {
    const { suggested, planned, saved, completed } = partitionCoupleDates(dates);
    return [
      { key: 'suggested', title: 'Suggested', data: suggested },
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
            onAccept={
              canRespondToSuggestion(item, userId)
                ? () => {
                    successHaptic();
                    acceptDate.mutate(item.id);
                  }
                : undefined
            }
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

const styles = themedStyles(() => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Edge-to-edge screen (sections pad themselves) — match the title's inset.
  back: {
    paddingLeft: spacing.md,
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
}));
