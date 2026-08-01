import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/auth.store';
import { loadImagePicker } from '@/lib/imagePicker';
import { compressForUpload } from '@/lib/imageCompression';
import { uploadImage } from './uploads';
import { queryKeys } from './keys';

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

      // H2·M1 — resize/re-encode before upload (a raw camera-roll photo is
      // 3–8 MB; the avatar renders at ~100px).
      const compressed = await compressForUpload({
        uri: asset.uri,
        contentType: asset.mimeType ?? 'image/jpeg',
        width: asset.width,
        height: asset.height,
      });

      // Presign (Edge Function) → PUT to R2 → persist the public URL.
      const publicUrl = await uploadImage(
        { kind: 'avatar' },
        compressed.uri,
        compressed.contentType
      );
      await setAvatar.mutateAsync(publicUrl);
      return publicUrl;
    },
  });
}
