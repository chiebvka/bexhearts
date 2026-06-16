import { View, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, Card, Badge, EmptyState, LoadingScreen } from '@/components/ui';
import { useBoundaries } from '@/api/boundaries';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { Boundary } from '@/types/api';

export default function BoundariesScreen() {
  const insets = useSafeAreaInsets();
  const { data: boundaries, isLoading } = useBoundaries();

  if (isLoading) return <LoadingScreen />;

  const boundaryItems = boundaries?.filter((b) => b.type === 'boundary') ?? [];
  const temptationItems = boundaries?.filter((b) => b.type === 'temptation') ?? [];

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text variant="headlineLarge">Boundaries & Plans</Text>
        <Button
          title="+ Add"
          onPress={() => router.push('/modal/boundary-form')}
          variant="primary"
          size="sm"
        />
      </View>

      <FlatList
        data={[...boundaryItems, ...temptationItems]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BoundaryCard boundary={item} />}
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

function BoundaryCard({ boundary }: { boundary: Boundary }) {
  return (
    <Card variant="outlined" padding="md" style={styles.card}>
      <View style={styles.cardHeader}>
        <Text variant="headlineSmall">{boundary.title}</Text>
        <Badge
          label={boundary.type === 'boundary' ? 'Boundary' : 'Temptation'}
          variant={boundary.type === 'boundary' ? 'default' : 'warning'}
        />
      </View>
      {boundary.description && (
        <Text variant="bodySmall" color={colors.text.secondary}>
          {boundary.description}
        </Text>
      )}
      {boundary.action_plan && (
        <Text variant="bodySmall" color={colors.accent[600]} style={styles.actionPlan}>
          Plan: {boundary.action_plan}
        </Text>
      )}
    </Card>
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
  card: {
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  actionPlan: {
    marginTop: spacing.sm,
  },
});
