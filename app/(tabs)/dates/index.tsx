import { useState } from 'react';
import { View, FlatList, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, LoadingScreen, EmptyState } from '@/components/ui';
import { DateIdeaCard } from '@/features/dates';
import { useDateIdeas } from '@/api/dates';
import { DATE_CATEGORIES } from '@/constants/devotional';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borderRadius';

export default function DatesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { data: ideas, isLoading } = useDateIdeas(selectedCategory);

  if (isLoading) return <LoadingScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <Text variant="headlineLarge" style={styles.title}>
        Date Ideas
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
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
            onPress={() => router.push(`/(tabs)/dates/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState title="No date ideas found" description="Try a different category." />
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
  title: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  filters: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  list: {
    paddingHorizontal: spacing.md,
    flexGrow: 1,
  },
});
