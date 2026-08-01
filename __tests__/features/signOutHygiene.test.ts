import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUploadsStore, clearOutbox, ensureHydrated } from '@/stores/uploads.store';
import { purgePersistedQueryCache } from '@/lib/persistedStorage';
import type { UploadJob } from '@/features/uploads/outbox';

// H2 sign-out hygiene: the query cache and the upload queue now persist to
// DISK, so clearing memory alone would leak the outgoing user's content to the
// next person on a shared device (same rule as G1's push-token clearing).

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

const job: UploadJob = {
  id: 'job-1',
  memoryId: 'mem-1',
  coupleId: 'couple-1',
  uri: 'file:///photo.jpg',
  contentType: 'image/jpeg',
  position: 0,
  attempts: 0,
  nextAttemptAt: 0,
  createdAt: 0,
};

describe('clearOutbox (sign-out hygiene)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useUploadsStore.setState({ jobs: [], hydrated: false });
  });

  it('drops queued jobs from memory AND disk', () => {
    useUploadsStore.getState().enqueue([job]);
    expect(useUploadsStore.getState().jobs).toHaveLength(1);

    clearOutbox();

    expect(useUploadsStore.getState().jobs).toHaveLength(0);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('bexhearts.uploadOutbox');
  });

  it('resets hydration so the next session re-reads a clean queue', async () => {
    // Hydrate once (cached promise), then clear.
    await ensureHydrated();
    expect(useUploadsStore.getState().hydrated).toBe(true);

    clearOutbox();
    expect(useUploadsStore.getState().hydrated).toBe(false);

    // A fresh hydrate must actually hit storage again rather than resolve
    // from the stale cached promise.
    (AsyncStorage.getItem as ReturnType<typeof jest.fn>).mockClear();
    await ensureHydrated();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('bexhearts.uploadOutbox');
  });
});

describe('purgePersistedQueryCache (sign-out hygiene)', () => {
  it('removes the persisted cache key from disk', () => {
    jest.clearAllMocks();
    purgePersistedQueryCache();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('bexhearts.queryCache');
  });
});
