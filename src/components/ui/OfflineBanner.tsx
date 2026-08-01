import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

// H2·M4 — one global banner instead of per-screen offline states. Renders
// above the navigator (app/_layout.tsx); the persisted query cache (H2·M3)
// keeps last-synced content on screen underneath it.
export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const { isConnected } = useNetworkStatus();
  if (isConnected) return null;

  return (
    <View style={[styles.banner, { paddingTop: insets.top + spacing.xs }]}>
      <Ionicons name="cloud-offline-outline" size={14} color={colors.text.inverse} />
      <Text variant="labelSmall" color={colors.text.inverse}>
        You&apos;re offline — showing your last synced content
      </Text>
    </View>
  );
}

const styles = themedStyles(() => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary[700],
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },
}));
