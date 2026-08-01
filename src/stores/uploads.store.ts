import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UPLOAD_OUTBOX_KEY } from '@/lib/persistedStorage';
import { pendingCountForMemory, type UploadJob } from '@/features/uploads/outbox';

// H2·M2 — the persisted upload outbox. Jobs live in AsyncStorage (works in
// Expo Go AND the dev build) so a queued photo survives an app restart; the
// store is the in-memory mirror the UI and the worker share. All writes flow
// through here so persistence can't drift.

interface UploadsState {
  jobs: UploadJob[];
  hydrated: boolean;
  enqueue: (jobs: UploadJob[]) => void;
  replace: (jobs: UploadJob[]) => void;
  update: (job: UploadJob) => void;
  remove: (id: string) => void;
}

function persist(jobs: UploadJob[]) {
  // Best-effort — the in-memory queue still drains if the write fails.
  AsyncStorage.setItem(UPLOAD_OUTBOX_KEY, JSON.stringify(jobs)).catch(() => {});
}

export const useUploadsStore = create<UploadsState>((set, get) => ({
  jobs: [],
  hydrated: false,

  enqueue: (newJobs) => {
    const jobs = [...get().jobs, ...newJobs];
    persist(jobs);
    set({ jobs });
  },

  replace: (jobs) => {
    persist(jobs);
    set({ jobs });
  },

  update: (job) => {
    const jobs = get().jobs.map((j) => (j.id === job.id ? job : j));
    persist(jobs);
    set({ jobs });
  },

  remove: (id) => {
    const jobs = get().jobs.filter((j) => j.id !== id);
    persist(jobs);
    set({ jobs });
  },
}));

// One-time async hydration from AsyncStorage. Cached promise so every entry
// point (enqueue, worker, app start) can `await ensureHydrated()` without
// racing; jobs enqueued before hydration finishes are kept (merged after
// the persisted ones so photo order survives).
let hydration: Promise<void> | null = null;

export function ensureHydrated(): Promise<void> {
  if (!hydration) {
    hydration = AsyncStorage.getItem(UPLOAD_OUTBOX_KEY)
      .then((raw) => {
        const persisted: UploadJob[] = raw ? JSON.parse(raw) : [];
        const current = useUploadsStore.getState().jobs;
        const merged = [
          ...persisted.filter((p) => !current.some((c) => c.id === p.id)),
          ...current,
        ];
        useUploadsStore.setState({ jobs: merged, hydrated: true });
        persist(merged);
      })
      .catch(() => {
        useUploadsStore.setState({ hydrated: true });
      });
  }
  return hydration;
}

// Sign-out / account-deletion hygiene: drop queued photos belonging to the
// outgoing user's couple (they'd fail RLS under the next user anyway, and a
// shared device shouldn't carry them). Also resets hydration so the next
// session re-reads a clean queue.
export function clearOutbox(): void {
  useUploadsStore.setState({ jobs: [], hydrated: false });
  hydration = null;
  AsyncStorage.removeItem(UPLOAD_OUTBOX_KEY).catch(() => {});
}

// How many photos are still uploading to a memory (pending-state UI on the
// memory detail screen + timeline cards). Live — re-renders as jobs land.
export function usePendingUploads(memoryId: string): number {
  return useUploadsStore((s) => pendingCountForMemory(s.jobs, memoryId));
}
