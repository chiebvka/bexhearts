import { useMemo } from 'react';
import { View, SectionList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Card, ModalHeader, EmptyState, LoadingScreen } from '@/components/ui';
import { usePointsHistory } from '@/api/points';
import { useMyProfile } from '@/api/profiles';
import { usePartnerProfile } from '@/api/couples';
import {
  partitionPointsHistory,
  pointReasonLabel,
  type PointsLedgerEntry,
} from '@/features/dashboard/points';
import { formatRelativeDate } from '@/lib/dates';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

// D2 (owner locked 2026-07-10) — the transparency screen behind the points
// total: every award, who earned it, when. Couple-private: the leaderboard
// only ever exposes other couples' totals, never this breakdown.
export default function PointsHistoryModal() {
  const insets = useSafeAreaInsets();
  const { data: rows, isLoading } = usePointsHistory();
  const { data: profile } = useMyProfile();
  const { data: partner } = usePartnerProfile();

  const { sections, weekTotal, allTotal } = useMemo(() => {
    const split = partitionPointsHistory(rows);
    return {
      weekTotal: split.weekTotal,
      allTotal: split.allTotal,
      sections: [
        { key: 'week', title: 'This week', data: split.thisWeek },
        { key: 'earlier', title: 'Earlier', data: split.earlier },
      ].filter((s) => s.data.length > 0),
    };
  }, [rows]);

  const nameFor = (userId: string) => {
    if (userId === profile?.id) return profile?.full_name?.split(' ')[0] || 'You';
    return partner?.full_name?.split(' ')[0] || 'Your partner';
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }} scrollable={false}>
      <ModalHeader title="How you earned it" />

      <View style={styles.totalsRow}>
        <Card variant="outlined" padding="md" style={styles.totalCard}>
          <Text variant="headlineSmall">{weekTotal}</Text>
          <Text variant="labelSmall" color={colors.text.tertiary}>
            this week
          </Text>
        </Card>
        <Card variant="outlined" padding="md" style={styles.totalCard}>
          <Text variant="headlineSmall">{allTotal}</Text>
          <Text variant="labelSmall" color={colors.text.tertiary}>
            all time
          </Text>
        </Card>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item: PointsLedgerEntry) => item.id}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text variant="labelLarge" style={styles.sectionTitle}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="bodyMedium">{pointReasonLabel(item.reason)}</Text>
              <Text variant="labelSmall" color={colors.text.tertiary}>
                {nameFor(item.user_id)}
                {item.created_at ? ` · ${formatRelativeDate(item.created_at)}` : ''}
              </Text>
            </View>
            <Text variant="bodyLarge" color={colors.primary[600]} style={styles.rowPoints}>
              +{item.points}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="No points yet"
            description="Complete today's devotional, pray together, or check in — every shared step counts."
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = themedStyles(() => ({
  totalsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  totalCard: {
    flex: 1,
    alignItems: 'center',
  },
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  rowText: {
    flex: 1,
  },
  rowPoints: {
    marginLeft: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
}));
