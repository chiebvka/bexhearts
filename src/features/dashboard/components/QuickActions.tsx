import { View, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borderRadius';
import { shadows } from '@/theme/shadows';
import { lightHaptic } from '@/lib/haptics';

const actions = [
  { label: 'Devotional', icon: '📖', route: '/(tabs)/devotional' as const },
  { label: 'Pray', icon: '🙏', route: '/modal/prayer-form' as const },
  { label: 'Check-In', icon: '💬', route: '/modal/check-in-form' as const },
  { label: 'Date Ideas', icon: '💝', route: '/(tabs)/dates' as const },
];

export function QuickActions() {
  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <Pressable
          key={action.label}
          style={styles.action}
          onPress={() => {
            lightHaptic();
            router.push(action.route);
          }}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{action.icon}</Text>
          </View>
          <Text variant="labelSmall" color={colors.text.secondary}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
  },
  action: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  icon: {
    fontSize: 24,
  },
});
