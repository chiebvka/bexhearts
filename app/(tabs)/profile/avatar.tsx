import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Text, BackButton, Button } from '@/components/ui';
import { useMyProfile } from '@/api/profiles';
import { useSetAvatar, useUploadAvatar } from '@/api/avatars';
import { PRESET_AVATAR_URLS } from '@/features/profile/presetAvatars';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const PREVIEW_SIZE = 140;

function initials(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function AvatarScreen() {
  const insets = useSafeAreaInsets();
  const { data: profile } = useMyProfile();
  const setAvatar = useSetAvatar();
  const uploadAvatar = useUploadAvatar();

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(
    profile?.avatar_url ?? null
  );
  const [error, setError] = useState<string | null>(null);

  const shuffle = () => {
    const next = (index + 1) % PRESET_AVATAR_URLS.length;
    setIndex(next);
    setSelected(PRESET_AVATAR_URLS[next]);
  };

  const pickPhoto = async () => {
    setError(null);
    try {
      const url = await uploadAvatar.mutateAsync();
      if (url) setSelected(url);
    } catch {
      setError('Could not upload that photo. Please try again.');
    }
  };

  const save = async () => {
    if (!selected) return;
    setError(null);
    try {
      await setAvatar.mutateAsync(selected);
      router.back();
    } catch {
      setError('Could not save your avatar. Please try again.');
    }
  };

  return (
    <ScreenContainer style={{ paddingTop: insets.top + spacing.md }}>
      <BackButton />

      <View style={styles.previewWrap}>
        {selected ? (
          <Image source={{ uri: selected }} style={styles.preview} contentFit="cover" transition={200} />
        ) : (
          <View style={[styles.preview, styles.fallback]}>
            <Text style={styles.fallbackText}>{initials(profile?.full_name)}</Text>
          </View>
        )}
      </View>

      <Text variant="headlineLarge" style={styles.title}>
        Choose your avatar
      </Text>
      <Text variant="bodyMedium" color={colors.text.secondary} style={styles.subtitle}>
        Shuffle through a few, or upload your own photo.
      </Text>

      <View style={styles.actions}>
        <Button
          title="Shuffle avatar"
          variant="outline"
          onPress={shuffle}
          fullWidth
          style={styles.actionButton}
        />
        <Button
          title="Upload a photo"
          variant="outline"
          onPress={pickPhoto}
          loading={uploadAvatar.isPending}
          fullWidth
        />
      </View>

      {error && (
        <Text variant="bodySmall" color={colors.error} style={styles.error}>
          {error}
        </Text>
      )}

      <Button
        title="Save"
        onPress={save}
        loading={setAvatar.isPending}
        disabled={!selected}
        fullWidth
        style={styles.save}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  previewWrap: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  preview: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: PREVIEW_SIZE / 2,
  },
  fallback: {
    backgroundColor: colors.primary[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 48,
    color: colors.text.inverse,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.xs,
  },
  error: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  save: {
    marginTop: spacing.xl,
  },
});
