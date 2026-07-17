import { useMemo, useState } from 'react';
import { View, SectionList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, EmptyState, LoadingScreen } from '@/components/ui';
import { PrayerItem, partitionPrayers } from '@/features/prayer';
import { usePrayers, useUpdatePrayer, usePrayersRealtime } from '@/api/prayers';
import { useMyProfile } from '@/api/profiles';
import { usePartnerProfile } from '@/api/couples';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { successHaptic, lightHaptic } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { Prayer } from '@/types/api';

export default function PrayersScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const showToast = useUIStore((s) => s.showToast);
  const { data: prayers, isLoading } = usePrayers();
  const { data: profile } = useMyProfile();
  const { data: partner } = usePartnerProfile();
  const updatePrayer = useUpdatePrayer();
  // Hybrid IA (2026-07-04): the wall splits Ours (shared) | Mine (personal).
  const [scope, setScope] = useState<'ours' | 'mine'>('ours');

  // Live sync — partner's adds/answers/archives appear without a manual refresh.
  usePrayersRealtime();

  const sections = useMemo(() => {
    const inScope = (prayers ?? []).filter((p) =>
      scope === 'ours' ? !p.is_private : p.is_private
    );
    const { active, answered } = partitionPrayers(inScope);
    return [
      { key: 'active', title: 'Praying', data: active },
      { key: 'answered', title: 'Answered', data: answered },
    ].filter((s) => s.data.length > 0);
  }, [prayers, scope]);

  const authorNameFor = (prayer: Prayer) =>
    prayer.author_id === user?.id
      ? profile?.full_name ?? undefined
      : partner?.full_name ?? undefined;

  const handleMarkAnswered = (prayer: Prayer) => {
    successHaptic();
    updatePrayer.mutate({
      id: prayer.id,
      is_answered: true,
      answered_at: new Date().toISOString(),
    });
    showToast('Answered prayer 🙌 — thank You, Lord.', 'success');
  };

  const handleArchive = (prayer: Prayer) => {
    lightHaptic();
    updatePrayer.mutate({
      id: prayer.id,
      is_archived: true,
      archived_at: new Date().toISOString(),
    });
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text variant="headlineLarge">Prayers</Text>
        <Button
          title="+ Add"
          onPress={() => router.push('/modal/prayer-form')}
          variant="primary"
          size="sm"
        />
      </View>

      <View style={styles.toolbar}>
        <View style={styles.scopeRow}>
          {(
            [
              { key: 'ours', label: 'Ours' },
              { key: 'mine', label: 'Mine' },
            ] as const
          ).map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setScope(option.key)}
              style={[styles.scopeChip, scope === option.key && styles.scopeChipActive]}
              accessibilityState={{ selected: scope === option.key }}
            >
              <Text
                variant="labelLarge"
                color={scope === option.key ? colors.text.inverse : colors.text.secondary}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Button
          title="Pray now"
          variant="secondary"
          size="sm"
          onPress={() => router.push('/modal/prayer-focus')}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) =>
          sections.length > 1 ? (
            <Text
              variant="labelMedium"
              color={colors.text.tertiary}
              style={styles.sectionHeader}
            >
              {section.title}
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <PrayerItem
            prayer={item}
            authorName={authorNameFor(item)}
            onMarkAnswered={() => handleMarkAnswered(item)}
            onArchive={() => handleArchive(item)}
            onEdit={
              item.author_id === user?.id
                ? () =>
                    router.push({
                      pathname: '/modal/prayer-form',
                      params: {
                        prayerId: item.id,
                        title: item.title,
                        body: item.body ?? '',
                        isPrivate: String(item.is_private),
                      },
                    })
                : undefined
            }
          />
        )}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
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
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  scopeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  scopeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.surface,
  },
  scopeChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  list: {
    paddingHorizontal: spacing.md,
    flexGrow: 1,
  },
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
