import { supabase } from '@/services/supabase/client';

// Where an image upload may land in R2. ONE bucket, two key prefixes (owner
// decision 2026-07-04); the edge function derives the exact key and enforces
// who may write under each prefix.
export type UploadTarget =
  | { kind: 'avatar' }
  | { kind: 'memory'; memoryId: string };

// R2 credentials never live in the app: the `avatar-upload-url` Edge Function
// (which holds them as secrets) returns a short-lived presigned PUT URL plus
// the eventual public URL.
export async function getUploadUrl(
  target: UploadTarget,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const { data, error } = await supabase.functions.invoke('avatar-upload-url', {
    body: { ...target, contentType },
  });
  if (error) throw error;
  return data as { uploadUrl: string; publicUrl: string };
}

// PUT a local asset's bytes (file:// uri from the image picker) straight to R2.
export async function putToStorage(
  uploadUrl: string,
  uri: string,
  contentType: string
): Promise<void> {
  const blob = await (await fetch(uri)).blob();
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'content-type': contentType },
    body: blob,
  });
  if (!response.ok) {
    throw new Error('Upload to storage failed.');
  }
}

// Presign + upload in one step; resolves to the image's public URL.
export async function uploadImage(
  target: UploadTarget,
  uri: string,
  contentType: string
): Promise<string> {
  const { uploadUrl, publicUrl } = await getUploadUrl(target, contentType);
  await putToStorage(uploadUrl, uri, contentType);
  return publicUrl;
}
