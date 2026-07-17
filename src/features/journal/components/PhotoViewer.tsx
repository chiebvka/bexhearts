import { useRef, useState } from 'react';
import {
  Modal,
  View,
  Image,
  FlatList,
  ScrollView,
  Pressable,
  Share,
  StyleSheet,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface PhotoViewerProps {
  imageUrls: string[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

// Full-screen swipeable gallery (locked design 2026-06-29): cream letterbox,
// "n / N" counter, share, close. Horizontal paging between photos; pinch-zoom
// via ScrollView zoom (iOS — Android gets swipe/share/close, zoom later).
export function PhotoViewer({ imageUrls, initialIndex, visible, onClose }: PhotoViewerProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(initialIndex);
  const indexRef = useRef(initialIndex);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    indexRef.current = next;
    setIndex(next);
  };

  const handleShare = () => {
    const url = imageUrls[indexRef.current];
    if (url) void Share.share({ url, message: url });
  };

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.letterbox}>
        <FlatList
          data={imageUrls}
          keyExtractor={(url, i) => `${i}-${url}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onMomentumScrollEnd={handleScrollEnd}
          renderItem={({ item }) => (
            <ScrollView
              style={{ width, height }}
              contentContainerStyle={styles.zoomPage}
              maximumZoomScale={3}
              minimumZoomScale={1}
              bouncesZoom
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              <Image
                source={{ uri: item }}
                style={{ width, height: height * 0.8 }}
                resizeMode="contain"
              />
            </ScrollView>
          )}
        />

        <View style={[styles.header, { top: insets.top + spacing.sm }]}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.headerButton} accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </Pressable>
          <Text variant="labelMedium" color={colors.text.secondary}>
            {Math.min(index + 1, imageUrls.length)} / {imageUrls.length}
          </Text>
          <Pressable onPress={handleShare} hitSlop={10} style={styles.headerButton} accessibilityLabel="Share photo">
            <Ionicons name="share-outline" size={22} color={colors.text.primary} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  letterbox: {
    flex: 1,
    backgroundColor: colors.background,
  },
  zoomPage: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
