import { View, Image, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

interface FannedPolaroidsProps {
  imageUrls: string[];
  onPress?: (index: number) => void;
}

const TILT = [-8, 5, -2];

// The signature memory preview: up to three cream polaroid frames fanned out,
// with a "+N" chip when there are more. Renders nothing without photos.
// Tapping a polaroid reports its index (the detail screen opens the viewer).
export function FannedPolaroids({ imageUrls, onPress }: FannedPolaroidsProps) {
  if (!imageUrls.length) return null;
  const shown = imageUrls.slice(0, 3);
  const extra = imageUrls.length - shown.length;

  return (
    <View style={styles.container}>
      {shown.map((url, i) => (
        <Pressable
          key={url + i}
          onPress={onPress ? () => onPress(i) : undefined}
          disabled={!onPress}
          style={[
            styles.polaroid,
            { transform: [{ rotate: `${TILT[i] ?? 0}deg` }], zIndex: i, marginLeft: i === 0 ? 0 : -28 },
          ]}
        >
          <Image source={{ uri: url }} style={styles.photo} />
        </Pressable>
      ))}
      {extra > 0 && (
        <View style={styles.chip}>
          <Text variant="labelSmall" color={colors.primary[800]}>
            +{extra}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = themedStyles(() => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  polaroid: {
    width: 72,
    height: 84,
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.neutral[300],
    borderRadius: 4,
    padding: 4,
    paddingBottom: 12,
  },
  photo: {
    flex: 1,
    borderRadius: 2,
    backgroundColor: colors.neutral[100],
  },
  chip: {
    marginLeft: spacing.sm,
    backgroundColor: colors.primary[100],
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
}));
