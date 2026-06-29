import {
  PRESET_AVATAR_SEEDS,
  PRESET_AVATAR_URLS,
  presetAvatarUrl,
  isPresetAvatar,
} from '@/features/profile/presetAvatars';

describe('preset avatars (C3a)', () => {
  it('builds a DiceBear PNG URL with the encoded seed', () => {
    const url = presetAvatarUrl('Ivy');
    expect(url).toContain('https://api.dicebear.com/');
    expect(url).toContain('/open-peeps/png');
    expect(url).toContain('seed=Ivy');
  });

  it('encodes seeds with spaces/special characters', () => {
    expect(presetAvatarUrl('A B')).toContain('seed=A%20B');
  });

  it('exposes one URL per seed, all unique', () => {
    expect(PRESET_AVATAR_URLS).toHaveLength(PRESET_AVATAR_SEEDS.length);
    expect(new Set(PRESET_AVATAR_URLS).size).toBe(PRESET_AVATAR_URLS.length);
  });

  it('detects preset vs uploaded URLs', () => {
    expect(isPresetAvatar(presetAvatarUrl('Fox'))).toBe(true);
    expect(isPresetAvatar('https://pub-xyz.r2.dev/avatars/u/abc.jpg')).toBe(false);
    expect(isPresetAvatar(null)).toBe(false);
  });
});
