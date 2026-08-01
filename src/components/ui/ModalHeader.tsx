import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

interface ModalHeaderProps {
  title?: string;
  onClose?: () => void;
}

// Every full-screen modal gets an explicit way out (owner ask 2026-07-04):
// swipe-to-dismiss is undiscoverable, and without the tab bar a modal is a
// dead end. Title on the left, close on the right.
export function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <View style={styles.row}>
      {title ? (
        <Text variant="headlineMedium" style={styles.title}>
          {title}
        </Text>
      ) : (
        <View />
      )}
      <Pressable
        // canGoBack guard: a modal reached with no back stack (deep link,
        // notification) would otherwise throw GO_BACK-not-handled.
        onPress={
          onClose ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))
        }
        hitSlop={10}
        style={styles.close}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <Ionicons name="close" size={22} color={colors.text.primary} />
      </Pressable>
    </View>
  );
}

const styles = themedStyles(() => ({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    flex: 1,
    paddingRight: spacing.md,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
