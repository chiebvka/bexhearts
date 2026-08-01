import { sortImageUrls } from '@/features/journal/images';

// buildMemoryImageRows retired with H2·M2 (the upload outbox inserts rows
// one-per-photo as uploads land) — its ordering rules now live in
// __tests__/features/uploadOutbox.test.ts.

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
