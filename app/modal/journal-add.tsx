import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, Card, ModalHeader } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const options = [
  {
    key: 'memory',
    icon: 'heart' as const,
    title: 'Moment',
    description: 'A moment worth keeping — with a photo or a few words.',
    route: '/modal/memory-form' as const,
  },
  {
    key: 'special-day',
    icon: 'sparkles' as const,
    title: 'Milestone',
    description: 'An anniversary or date to count down to and remember.',
    route: '/modal/special-day-form' as const,
  },
];

export default function JournalAddModal() {
  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <ModalHeader title="Add to your story" />
      {options.map((o) => (
        <Pressable
          key={o.key}
          // replace, not back()+push(): the two race during the modal-dismiss
          // animation and the push gets dropped — the form never opened.
          onPress={() => router.replace(o.route)}
        >
          <Card variant="outlined" padding="md" style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name={o.icon} size={22} color={colors.primary[500]} />
            </View>
            <View style={styles.text}>
              <Text variant="headlineSmall">{o.title}</Text>
              <Text variant="bodySmall" color={colors.text.secondary}>
                {o.description}
              </Text>
            </View>
          </Card>
        </Pressable>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
});
