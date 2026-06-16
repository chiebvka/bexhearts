import { View, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, EmptyState, LoadingScreen } from '@/components/ui';
import { PrayerItem } from '@/features/prayer';
import { usePrayers, useUpdatePrayer } from '@/api/prayers';
import { useMyProfile } from '@/api/profiles';
import { usePartnerProfile } from '@/api/couples';
import { useAuthStore } from '@/stores/auth.store';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function PrayersScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: prayers, isLoading } = usePrayers();
  const { data: profile } = useMyProfile();
  const { data: partner } = usePartnerProfile();
  const updatePrayer = useUpdatePrayer();

  if (isLoading) return <LoadingScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text variant="headlineLarge">Shared Prayers</Text>
        <Button
          title="+ Add"
          onPress={() => router.push('/modal/prayer-form')}
          variant="primary"
          size="sm"
        />
      </View>

      <FlatList
        data={prayers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PrayerItem
            prayer={item}
            authorName={
              item.author_id === user?.id
                ? profile?.full_name ?? undefined
                : partner?.full_name ?? undefined
            }
            onMarkAnswered={() =>
              updatePrayer.mutate({
                id: item.id,
                is_answered: true,
                answered_at: new Date().toISOString(),
              })
            }
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="No prayers yet"
            description="Start your prayer list together."
            actionLabel="Add First Prayer"
            onAction={() => router.push('/modal/prayer-form')}
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
  list: {
    paddingHorizontal: spacing.md,
    flexGrow: 1,
  },
});
