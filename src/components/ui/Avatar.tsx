import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from './Text';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: AvatarSize;
}

const sizes: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const fontSizes: Record<AvatarSize, number> = {
  sm: 12,
  md: 14,
  lg: 20,
  xl: 28,
};

function getInitials(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ uri, name, size = 'md' }: AvatarProps) {
  const dimension = sizes[size];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        }}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        },
      ]}
    >
      <Text
        style={{ fontSize: fontSizes[size], color: colors.text.inverse }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = themedStyles(() => ({
  fallback: {
    backgroundColor: colors.primary[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
