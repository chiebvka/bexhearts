import { Component, type ErrorInfo, type ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { captureException } from '@/services/sentry';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // H2·M5 — reports on builds with a Sentry DSN; silent no-op otherwise.
    captureException(error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>
            Something went wrong
          </Text>
          <Text variant="bodyMedium" color={colors.text.secondary} style={styles.description}>
            We hit an unexpected error. Please try again.
          </Text>
          <Button
            title="Try Again"
            onPress={() => this.setState({ hasError: false })}
            variant="outline"
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = themedStyles(() => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    marginBottom: spacing.sm,
  },
  description: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
}));
