import { useEffect } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useUploadsStore, ensureHydrated } from '@/stores/uploads.store';
import { reviveStuckJobs } from '@/features/uploads/outbox';
import { processOutbox } from '@/services/uploads/worker';

// H2·M2 — mounts once in the root layout. Resumes queued photo uploads on
// app start, on reconnect, and whenever the app returns to the foreground;
// parked (max-attempts) jobs get a fresh round on each of those moments.
async function reviveAndProcess() {
  await ensureHydrated();
  const store = useUploadsStore.getState();
  const revived = reviveStuckJobs(store.jobs, Date.now());
  if (revived.some((job, i) => job !== store.jobs[i])) {
    store.replace(revived);
  }
  void processOutbox();
}

export function useUploadOutbox() {
  useEffect(() => {
    void reviveAndProcess();

    const unsubscribeNet = NetInfo.addEventListener((state) => {
      if (state.isConnected) void reviveAndProcess();
    });
    const appStateSub = AppState.addEventListener('change', (status) => {
      if (status === 'active') void processOutbox();
    });
    return () => {
      unsubscribeNet();
      appStateSub.remove();
    };
  }, []);
}
