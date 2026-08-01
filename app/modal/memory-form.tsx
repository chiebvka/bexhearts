import { useState } from 'react';
import { View, Image, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { KeyboardAvoid } from '@/components/layout/KeyboardAvoid';
import { Input } from '@/components/ui/Input';
import { Button, Text, ModalHeader } from '@/components/ui';
import { useCreateMemory, useAddMemoryImages } from '@/api/journal';
import { pickImages, type PickedImage } from '@/lib/imagePicker';
import { getErrorMessage } from '@/utils/error';
import { successHaptic } from '@/lib/haptics';
import { colors } from '@/theme/colors';
import { themedStyles } from '@/theme/themedStyles';
import { spacing } from '@/theme/spacing';

export default function MemoryFormModal() {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<PickedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const createMemory = useCreateMemory();
  const addImages = useAddMemoryImages();

  const handlePickPhotos = async () => {
    setError(null);
    try {
      const picked = await pickImages();
      if (picked.length) setPhotos((prev) => [...prev, ...picked]);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const removePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((p) => p.uri !== uri));
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setError(null);
    try {
      const memory = await createMemory.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
      });
      if (photos.length) {
        await addImages.mutateAsync({ memoryId: memory.id, images: photos });
      }
      successHaptic();
      router.back();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const saving = createMemory.isPending || addImages.isPending;

  return (
    <KeyboardAvoid>
      <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
        <ModalHeader title="A moment to keep" />

        <Input
          label="What happened?"
          placeholder="e.g. Our first hike together"
          value={title}
          onChangeText={setTitle}
          containerStyle={styles.field}
        />
        <Input
          label="The story (optional)"
          placeholder="What made it special?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          containerStyle={styles.field}
        />

        <Text variant="labelMedium" color={colors.text.tertiary} style={styles.label}>
          Photos (optional)
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
          {photos.map((photo) => (
            <View key={photo.uri} style={styles.thumbWrap}>
              <Image source={{ uri: photo.uri }} style={styles.thumb} />
              <Pressable
                onPress={() => removePhoto(photo.uri)}
                style={styles.removeThumb}
                hitSlop={8}
                accessibilityLabel="Remove photo"
              >
                <Ionicons name="close" size={12} color={colors.text.inverse} />
              </Pressable>
            </View>
          ))}
          <Pressable onPress={handlePickPhotos} style={styles.addPhoto} accessibilityLabel="Add photos">
            <Ionicons name="images-outline" size={22} color={colors.primary[500]} />
            <Text variant="labelSmall" color={colors.primary[500]}>
              Add
            </Text>
          </Pressable>
        </ScrollView>

        {error ? (
          <Text variant="labelSmall" color={colors.accent[600]} style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Button
          title={saving && photos.length ? 'Uploading photos…' : 'Save moment'}
          onPress={handleSave}
          loading={saving}
          disabled={!title.trim()}
          fullWidth
        />
      </ScreenContainer>
    </KeyboardAvoid>
  );
}

const styles = themedStyles(() => ({
  title: {
    marginBottom: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
  },
  photoRow: {
    flexGrow: 0,
    marginBottom: spacing.lg,
  },
  thumbWrap: {
    marginRight: spacing.sm,
  },
  thumb: {
    width: 64,
    height: 64,
    backgroundColor: colors.neutral[100],
  },
  removeThumb: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.neutral[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: {
    width: 64,
    height: 64,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary[300],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  error: {
    marginBottom: spacing.md,
  },
}));
