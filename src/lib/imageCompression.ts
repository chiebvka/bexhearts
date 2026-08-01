// H2·M1 — shrink images BEFORE they hit the network. A modern phone photo is
// 4000px+ / 3–8 MB; resized to ≤1600px and re-encoded as JPEG it lands around
// 200–500 KB — the single biggest win for uploads on bad networks. Applies to
// avatars and memory photos (every R2 upload).
import type { PickedImage } from './imagePicker';

export const MAX_UPLOAD_DIMENSION = 1600;
export const UPLOAD_JPEG_QUALITY = 0.8;

// Resize instruction for the manipulator: shrink the LONGER side to `max`
// (aspect ratio is preserved when only one dimension is given). Null when the
// image is already small enough — we still re-encode, but never upscale.
export function resizeSpec(
  width: number | undefined,
  height: number | undefined,
  max = MAX_UPLOAD_DIMENSION
): { width: number } | { height: number } | null {
  if (!width || !height) {
    // Unknown dimensions (rare) — cap the width defensively.
    return { width: max };
  }
  if (width <= max && height <= max) return null;
  return width >= height ? { width: max } : { height: max };
}

// Lazy-load the native module (same pattern as loadImagePicker) so importing
// this file never pulls it in at startup.
function loadManipulator() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('expo-image-manipulator') as typeof import('expo-image-manipulator');
}

// Resize + re-encode a picked image for upload. Best-effort: if the
// manipulator fails for any reason the original image uploads unchanged —
// a full-size photo is better than a failed save.
export async function compressForUpload(image: PickedImage): Promise<PickedImage> {
  try {
    const { ImageManipulator, SaveFormat } = loadManipulator();
    const spec = resizeSpec(image.width, image.height);
    const context = ImageManipulator.manipulate(image.uri);
    if (spec) context.resize(spec);
    const rendered = await context.renderAsync();
    const saved = await rendered.saveAsync({
      compress: UPLOAD_JPEG_QUALITY,
      format: SaveFormat.JPEG,
    });
    return {
      uri: saved.uri,
      contentType: 'image/jpeg',
      width: saved.width,
      height: saved.height,
    };
  } catch {
    return image;
  }
}
