import { View, FlatList, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Card, ModalHeader, EmptyState, LoadingScreen } from '@/components/ui';
import { useLeaderboard, useSetLeaderboardOptIn } from '@/api/points';
import { useMyCouple } from '@/api/couples';
import { countryFlag } from '@/lib/flags';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

// Global standings (owner decision 2026-07-05). Privacy first: couples appear
// masked ("t**y & b****i · #1042") unless they opt in to show first names.
// The couple number is a human-friendly sequence, never an id.
export default function LeaderboardModal() {
  const insets = useSafeAreaInsets();
  const { data: entries, isLoading } = useLeaderboard();
  const { data: couple } = useMyCouple();
  const setOptIn = useSetLeaderboardOptIn();

  if (isLoading) return <LoadingScreen />;

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }} scrollable={false}>
      <ModalHeader title="Leaderboard" />
      <Text variant="bodySmall" color={colors.text.tertiary} style={styles.intro}>
        Couples around the world, growing together. Your activity earns points —
        exciting rewards are on the way.
      </Text>

      <Card variant="outlined" padding="md" style={styles.optInCard}>
        <View style={styles.optInText}>
          <Text variant="bodyMedium">Show our first names</Text>
          <Text variant="labelSmall" color={colors.text.tertiary}>
            Off = you appear masked with your couple number
          </Text>
        </View>
        <Switch
          value={couple?.leaderboard_opt_in ?? false}
          onValueChange={(value) => setOptIn.mutate(value)}
          trackColor={{ true: colors.primary[400] }}
        />
      </Card>

      <FlatList
        data={entries ?? []}
        keyExtractor={(item) => String(item.couple_number)}
        renderItem={({ item }) => (
          <View style={[styles.row, item.is_you && styles.rowYou]}>
            <Text variant="labelLarge" color={colors.text.tertiary} style={styles.rank}>
              {item.rank}
            </Text>
            <Text variant="bodyMedium" style={styles.flag}>
              {countryFlag(item.country_code)}
            </Text>
            <View style={styles.labelWrap}>
              <Text variant="bodyMedium" numberOfLines={1}>
                {item.label ?? 'a couple'}
              </Text>
              <Text variant="labelSmall" color={colors.text.tertiary}>
                #{item.couple_number}
                {item.is_you ? ' · you' : ''}
              </Text>
            </View>
            <Text variant="labelLarge" color={colors.primary[600]}>
              {item.points} pts
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="The board is warming up"
            description="Points appear as couples pray, reflect, and show up together."
          />
        }
        contentContainerStyle={styles.list}
      />
    </ScreenContainer>
  );
}

const styles = themedStyles(() => ({
  intro: {
    marginBottom: spacing.md,
  },
  optInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  optInText: {
    flex: 1,
  },
  list: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  rowYou: {
    backgroundColor: colors.primary[50],
  },
  rank: {
    width: 26,
    textAlign: 'center',
  },
  flag: {
    fontSize: 18,
    lineHeight: 24,
  },
  labelWrap: {
    flex: 1,
  },
}));
