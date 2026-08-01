import {
  buildFocusQueue,
  isCrisisText,
  getComposeLimitMessage,
} from '@/features/prayer/focus';
import type { Prayer } from '@/types/api';

const prayer = (overrides: Partial<Prayer>): Prayer =>
  ({
    id: Math.random().toString(),
    title: 'p',
    body: null,
    author_id: 'me',
    couple_id: 'c1',
    is_answered: false,
    is_archived: false,
    is_private: false,
    created_at: '2026-07-01T00:00:00Z',
    ...overrides,
  }) as Prayer;

describe('buildFocusQueue', () => {
  it('queues shared prayers first, then my personal, each oldest-first', () => {
    const queue = buildFocusQueue(
      [
        prayer({ id: 'personal-new', is_private: true, created_at: '2026-07-03T00:00:00Z' }),
        prayer({ id: 'shared-new', created_at: '2026-07-02T00:00:00Z' }),
        prayer({ id: 'shared-old', created_at: '2026-06-01T00:00:00Z' }),
        prayer({ id: 'personal-old', is_private: true, created_at: '2026-06-15T00:00:00Z' }),
      ],
      'me'
    );
    expect(queue.map((p) => p.id)).toEqual([
      'shared-old',
      'shared-new',
      'personal-old',
      'personal-new',
    ]);
  });

  it('excludes answered and archived prayers', () => {
    const queue = buildFocusQueue(
      [
        prayer({ id: 'answered', is_answered: true }),
        prayer({ id: 'archived', is_archived: true }),
        prayer({ id: 'active' }),
      ],
      'me'
    );
    expect(queue.map((p) => p.id)).toEqual(['active']);
  });

  it('handles undefined input', () => {
    expect(buildFocusQueue(undefined, 'me')).toEqual([]);
  });
});

describe('isCrisisText', () => {
  it('flags crisis language', () => {
    expect(isCrisisText('I want to hurt myself')).toBe(true);
    expect(isCrisisText('thoughts of suicide')).toBe(true);
    expect(isCrisisText('healing from abuse')).toBe(true);
  });

  it('passes ordinary requests', () => {
    expect(isCrisisText('Wisdom for our finances')).toBe(false);
    expect(isCrisisText(null)).toBe(false);
  });
});

describe('getComposeLimitMessage (E9 rate-limit copy, owner-locked 2026-07-18)', () => {
  it('day cap gently points to tomorrow AND to praying together now', () => {
    const msg = getComposeLimitMessage('day');
    expect(msg).toMatch(/tomorrow/i);
    expect(msg).toMatch(/together|own words/i);
    // Never error language (owner: subtle, warm — not a wall).
    expect(msg).not.toMatch(/error|limit reached|denied|blocked/i);
  });

  it('month cap keeps the same warm register', () => {
    const msg = getComposeLimitMessage('month');
    expect(msg).toMatch(/month/i);
    expect(msg).toMatch(/together/i);
    expect(msg).not.toMatch(/error|denied|blocked/i);
  });
});
