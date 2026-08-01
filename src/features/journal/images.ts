// Pure helpers for memory photo handling (gallery build, 2026-07-04).
// buildMemoryImageRows retired with H2·M2 — the upload outbox worker inserts
// each memory_images row individually as its photo lands.

// Ordered public URLs for a memory's images (position, then insertion order).
export function sortImageUrls(
  images: { image_url: string; position?: number | null }[]
): string[] {
  return [...images]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((i) => i.image_url);
}
