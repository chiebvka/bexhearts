// Lazy-load expo-image-picker so importing a module that *can* pick photos
// doesn't pull the native module in at startup — a dev build made before it
// was added would otherwise crash (same pattern as src/api/avatars.ts).
export function loadImagePicker() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-image-picker') as typeof import('expo-image-picker');
}

export interface PickedImage {
  uri: string;
  contentType: string;
}

// Multi-select photos from the library. Returns [] when the user cancels.
// Throws when library permission is denied (callers surface the message).
export async function pickImages(selectionLimit = 10): Promise<PickedImage[]> {
  const ImagePicker = loadImagePicker();
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit,
    quality: 0.7,
    // Presenting as a sheet OVER our own modal swallows the picker's
    // confirm/cancel taps on iOS (bug 2026-07-05) — go full screen.
    presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
  });
  if (result.canceled) return [];

  return result.assets.map((asset) => ({
    uri: asset.uri,
    contentType: asset.mimeType ?? 'image/jpeg',
  }));
}
