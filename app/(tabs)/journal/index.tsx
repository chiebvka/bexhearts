import { useMemo } from 'react';
import { View, SectionList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Text, EmptyState, LoadingScreen } from '@/components/ui';
import { TimelineEntryCard } from '@/features/journal';
import { useTimeline, useJournalRealtime } from '@/api/journal';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { TimelineEntry } from '@/features/journal';

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const { data: entries, isLoading } = useTimeline();
  useJournalRealtime();

  const sections = useMemo(() => {
    const groups = new Map<string, TimelineEntry[]>();
    for (const entry of entries ?? []) {
      const [y, m, d] = entry.date.split('-').map(Number);
      const key = format(new Date(y, m - 1, d), 'MMMM yyyy');
      const bucket = groups.get(key) ?? [];
      bucket.push(entry);
      groups.set(key, bucket);
    }
    return Array.from(groups, ([title, data]) => ({ title, data }));
  }, [entries]);

  if (isLoading) return <LoadingScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text variant="headlineLarge">Our Story</Text>
        <Pressable
          onPress={() => router.push('/modal/journal-add')}
          style={styles.addButton}
          hitSlop={8}
          accessibilityLabel="Add to your story"
        >
          <Ionicons name="add" size={22} color={colors.primary[500]} />
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text variant="labelMedium" color={colors.text.tertiary} style={styles.month}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <TimelineEntryCard
            entry={item}
            onPress={
              item.type === 'memory'
                ? () => router.push(`/(tabs)/journal/${item.id.replace('memory-', '')}`)
                : item.type === 'milestone'
                  ? () => {
                      // Tap a special day → edit it (current values as params).
                      const m = item.ref as {
                        id: string;
                        icon?: string | null;
                        title: string;
                        event_date: string;
                        color?: string | null;
                      };
                      router.push({
                        pathname: '/modal/special-day-form',
                        params: {
                          milestoneId: m.id,
                          icon: m.icon ?? '',
                          title: m.title,
                          eventDate: m.event_date,
                          color: m.color ?? '',
                        },
                      });
                    }
                  : item.type === 'date'
                    ? () =>
                        // D6 — completed dates open their memory (edit stars/
                        // note, save as a Moment for photos).
                        router.push({
                          pathname: '/modal/date-view',
                          params: { dateId: item.id.replace('date-', '') },
                        })
                    : item.type === 'prayer'
                      ? () =>
                          // D6 — answered prayers open read-only (full circle).
                          router.push({
                            pathname: '/modal/prayer-view',
                            params: { prayerId: item.id.replace('prayer-', '') },
                          })
                      : undefined
            }
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="Your story starts here"
            description="Add a moment or a milestone — answered prayers and completed dates will show up here too."
            actionLabel="Add a moment"
            onAction={() => router.push('/modal/journal-add')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
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
