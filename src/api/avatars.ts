import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/auth.store';
import { queryKeys } from './keys';

// Lazy-load expo-image-picker so importing this module (e.g. the preset cycler)
// doesn't pull the native module — a dev build made before it was added would
// otherwise crash. It's only needed when the user taps "Upload a photo".
function loadImagePicker() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-image-picker') as typeof import('expo-image-picker');
}

// Persist a chosen avatar URL (a DiceBear preset or an uploaded R2 photo) onto
// the profile. The Avatar component renders whichever URL is stored.
export function useSetAvatar() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (avatarUrl: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user!.id);
      if (error) throw error;
      return avatarUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.mine() });
    },
  });
}

// Pick a photo and upload it to Cloudflare R2 (C3b). R2 credentials never live
// in the app: the `avatar-upload-url` Edge Function (which holds them as secrets)
// returns a short-lived presigned PUT URL + the eventual public URL. We PUT the
// bytes straight to R2, then persist the public URL. Returns null if cancelled.
export function useUploadAvatar() {
  const setAvatar = useSetAvatar();

  return useMutation({
    mutationFn: async (): Promise<string | null> => {
      const ImagePicker = loadImagePicker();
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Photo library permission is required.');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (result.canceled) return null;

      const asset = result.assets[0];
      const contentType = asset.mimeType ?? 'image/jpeg';

      // 1) presigned PUT URL from the Edge Function (auth token attached by invoke)
      const { data, error } = await supabase.functions.invoke(
        'avatar-upload-url',
        { body: { contentType } }
      );
      if (error) throw error;
      const { uploadUrl, publicUrl } = data as {
        uploadUrl: string;
        publicUrl: string;
      };

      // 2) upload the bytes directly to R2
      const blob = await (await fetch(asset.uri)).blob();
      const putResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'content-type': contentType },
        body: blob,
      });
      if (!putResponse.ok) {
        throw new Error('Upload to storage failed.');
      }

      // 3) persist the public URL on the profile
      await setAvatar.mutateAsync(publicUrl);
      return publicUrl;
    },
  });
}
