import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, EmptyState, BackButton } from '@/components/ui';
import { ScriptureBlock } from '@/features/devotional';
import { useDevotionalById } from '@/api/devotionals';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

export default function DevotionalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: devotional, isLoading } = useDevotionalById(id);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!devotional) {
    return <EmptyState title="Devotional not found" />;
  }

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <BackButton />
      <Text variant="displayMedium" style={styles.title}>
        {devotional.title}
      </Text>

      <ScriptureBlock
        reference={devotional.scripture_reference}
        text={devotional.scripture_text}
      />

      <Text variant="bodyLarge" style={styles.reflection}>
        {devotional.reflection}
      </Text>
    </ScreenContainer>
  );
}

const styles = themedStyles(() => ({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.md,
  },
  reflection: {
    marginTop: spacing.lg,
    color: colors.text.secondary,
    lineHeight: 26,
  },
}));
