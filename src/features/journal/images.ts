// Pure helpers for memory photo handling (gallery build, 2026-07-04).

export interface MemoryImageRow {
  memory_id: string;
  couple_id: string;
  image_url: string;
  position: number;
}

// Rows for a batch of freshly uploaded images, ordered after any existing ones
// (positions continue from `startPosition` so later additions append).
export function buildMemoryImageRows(params: {
  memoryId: string;
  coupleId: string;
  imageUrls: string[];
  startPosition?: number;
}): MemoryImageRow[] {
  const start = params.startPosition ?? 0;
  return params.imageUrls.map((image_url, i) => ({
    memory_id: params.memoryId,
    couple_id: params.coupleId,
    image_url,
    position: start + i,
  }));
}

// Ordered public URLs for a memory's images (position, then insertion order).
export function sortImageUrls(
  images: { image_url: string; position?: number | null }[]
): string[] {
  return [...images]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((i) => i.image_url);
}
