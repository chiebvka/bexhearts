import { useMemo } from 'react';
import { View, SectionList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, Card, Badge, EmptyState, LoadingScreen, BackButton } from '@/components/ui';
import {
  partitionBoundaryHistory,
  canDeactivate,
  getCategoryLabel,
} from '@/features/boundaries';
import {
  useBoundaries,
  useDeactivateBoundary,
  useRestoreBoundary,
  useBoundariesRealtime,
} from '@/api/boundaries';
import { usePartnerProfile } from '@/api/couples';
import { useMyProfile } from '@/api/profiles';
import { formatDate } from '@/lib/dates';
import { lightHaptic, successHaptic } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';
import type { Boundary } from '@/types/api';

export default function BoundariesScreen() {
  const insets = useSafeAreaInsets();
  const { data: boundaries, isLoading } = useBoundaries();
  const { data: profile } = useMyProfile();
  const { data: partner } = usePartnerProfile();
  const deactivate = useDeactivateBoundary();
  const restore = useRestoreBoundary();
  useBoundariesRealtime();

  const sections = useMemo(() => {
    const groups = partitionBoundaryHistory(boundaries);
    return [
      {
        key: 'boundary',
        title: 'Boundaries',
        subtitle: 'Commitments you keep together.',
        data: groups.boundaries,
        past: false,
      },
      {
        key: 'temptation',
        title: 'Temptation plans',
        subtitle: 'Struggles you face with your partner beside you — no scores kept.',
        data: groups.temptations,
        past: false,
      },
      {
        key: 'victories',
        title: 'Victories 🏆',
        subtitle: 'Struggles you named, faced, and walked out of. They stay yours.',
        data: groups.victories,
        past: true,
      },
      {
        key: 'past',
        title: 'Past covenants',
        subtitle: 'Boundaries that served their season.',
        data: groups.pastCovenants,
        past: true,
      },
    ].filter((s) => s.data.length > 0);
  }, [boundaries]);

  const nameFor = (userId?: string | null) => {
    if (!userId) return null;
    if (userId === profile?.id) return profile?.full_name?.split(' ')[0] || 'You';
    return partner?.full_name?.split(' ')[0] || 'Your partner';
  };

  const handleDeactivate = (boundary: Boundary) => {
    // Resolving a plan is a victory moment; retiring a boundary is quieter.
    if (boundary.type === 'temptation') successHaptic();
    else lightHaptic();
    deactivate.mutate({ id: boundary.id, type: boundary.type });
  };

  const handleRestore = (boundary: Boundary) => {
    lightHaptic();
    restore.mutate(boundary.id);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <BackButton style={styles.back} />
      <View style={styles.header}>
        <Text variant="headlineLarge">Boundaries & Plans</Text>
        <Button
          title="+ Add"
          onPress={() => router.push('/modal/boundary-form')}
          variant="primary"
          size="sm"
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text variant="labelLarge">{section.title}</Text>
            <Text variant="bodySmall" color={colors.text.tertiary}>
              {section.subtitle}
            </Text>
          </View>
        )}
        renderItem={({ item, section }) => (
          <BoundaryCard
            boundary={item}
            past={section.past}
            deactivatedByName={nameFor(item.deactivated_by)}
            canDeactivate={canDeactivate(item, profile?.id)}
            onDeactivate={() => handleDeactivate(item)}
            onRestore={() => handleRestore(item)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="No boundaries set"
            description="Set healthy boundaries together."
            actionLabel="Add Boundary"
            onAction={() => router.push('/modal/boundary-form')}
          />
        }
      />
    </View>
  );
}

function BoundaryCard({
  boundary,
  past,
  deactivatedByName,
  canDeactivate: allowDeactivate,
  onDeactivate,
  onRestore,
}: {
  boundary: Boundary;
  past: boolean;
  deactivatedByName: string | null;
  canDeactivate: boolean;
  onDeactivate: () => void;
  onRestore: () => void;
}) {
  const isBoundary = boundary.type === 'boundary';
  const categoryLabel = getCategoryLabel(boundary.type, boundary.category);

  return (
    <Card
      variant="outlined"
      padding="md"
      style={StyleSheet.flatten([styles.card, past && styles.cardPast])}
    >
      <View style={styles.cardHeader}>
        <Text variant="headlineSmall" style={styles.cardTitle}>
          {boundary.title}
        </Text>
        {categoryLabel && (
          <Badge label={categoryLabel} variant={isBoundary ? 'default' : 'warning'} />
        )}
      </View>
      {boundary.description && (
        <Text variant="bodySmall" color={colors.text.secondary}>
          {boundary.description}
        </Text>
      )}
      {boundary.action_plan && !past && (
        <Text variant="bodySmall" color={colors.accent[600]} style={styles.actionPlan}>
          {isBoundary ? 'Plan: ' : 'When it hits: '}
          {boundary.action_plan}
        </Text>
      )}

      {past ? (
        <View style={styles.pastRow}>
          <Text variant="labelSmall" color={colors.text.tertiary} style={styles.pastLabel}>
            {isBoundary ? 'Retired' : 'Resolved'}
            {deactivatedByName ? ` by ${deactivatedByName}` : ''}
            {boundary.deactivated_at ? ` · ${formatDate(boundary.deactivated_at)}` : ''}
          </Text>
          <Pressable onPress={onRestore} hitSlop={8}>
            <Text variant="labelMedium" color={colors.text.link}>
              Bring back
            </Text>
          </Pressable>
        </View>
      ) : allowDeactivate ? (
        <Pressable onPress={onDeactivate} style={styles.deactivate} hitSlop={8}>
          <Text variant="labelMedium" color={colors.text.tertiary}>
            {isBoundary ? 'Retire' : 'Resolve 🙌'}
          </Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = themedStyles(() => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // This screen is edge-to-edge (each section pads itself), so the back
  // button needs the standard inset to line up with the title.
  back: {
    paddingLeft: spacing.md,
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
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    gap: 2,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardPast: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    flex: 1,
  },
  actionPlan: {
    marginTop: spacing.sm,
  },
  deactivate: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  pastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  pastLabel: {
    flex: 1,
    marginRight: spacing.sm,
  },
}));
