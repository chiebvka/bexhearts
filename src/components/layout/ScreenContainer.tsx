import { ScrollView, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  style?: ViewStyle;
}

export function ScreenContainer({
  children,
  scrollable = true,
  padded = true,
  style,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  const contentStyle = [
    styles.container,
    padded && styles.padded,
    { paddingBottom: insets.bottom + spacing.md },
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={contentStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.scroll, contentStyle]}>{children}</View>;
}

const styles = themedStyles(() => ({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
}));
