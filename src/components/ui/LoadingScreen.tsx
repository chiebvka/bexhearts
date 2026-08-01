import { View, ActivityIndicator } from 'react-native';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary[500]} />
      {message && (
        <Text
          variant="bodyMedium"
          color={colors.text.secondary}
          style={styles.message}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = themedStyles(() => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  message: {
    marginTop: spacing.md,
  },
}));
