import { buildMemoryImageRows, sortImageUrls } from '@/features/journal/images';

describe('buildMemoryImageRows', () => {
  it('builds ordered rows starting at position 0 by default', () => {
    const rows = buildMemoryImageRows({
      memoryId: 'mem-1',
      coupleId: 'couple-1',
      imageUrls: ['https://cdn/a.jpg', 'https://cdn/b.jpg'],
    });

    expect(rows).toEqual([
      { memory_id: 'mem-1', couple_id: 'couple-1', image_url: 'https://cdn/a.jpg', position: 0 },
      { memory_id: 'mem-1', couple_id: 'couple-1', image_url: 'https://cdn/b.jpg', position: 1 },
    ]);
  });

  it('appends after existing images via startPosition', () => {
    const rows = buildMemoryImageRows({
      memoryId: 'mem-1',
      coupleId: 'couple-1',
      imageUrls: ['https://cdn/c.jpg'],
      startPosition: 3,
    });

    expect(rows[0].position).toBe(3);
  });

  it('handles an empty batch', () => {
    expect(
      buildMemoryImageRows({ memoryId: 'm', coupleId: 'c', imageUrls: [] })
    ).toEqual([]);
  });
});

describe('sortImageUrls', () => {
  it('orders by position and returns urls', () => {
    const urls = sortImageUrls([
      { image_url: 'b.jpg', position: 1 },
      { image_url: 'a.jpg', position: 0 },
      { image_url: 'c.jpg', position: 2 },
    ]);
    expect(urls).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
  });

  it('treats a null position as 0 and does not mutate the input', () => {
    const input = [
      { image_url: 'later.jpg', position: 5 },
      { image_url: 'first.jpg', position: null },
    ];
    expect(sortImageUrls(input)).toEqual(['first.jpg', 'later.jpg']);
    expect(input[0].image_url).toBe('later.jpg');
  });
});
