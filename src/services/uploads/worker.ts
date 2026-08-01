// H2·M2 — the outbox worker. Drains the persisted upload queue ONE job at a
// time: presign → PUT the file with expo-file-system's uploadAsync using the
// iOS BACKGROUND session (the transfer keeps going if the user leaves the
// app) → insert the memory_images row → refresh the UI. Failures back off
// and retry; jobs that exhaust their attempts park until the next app start
// or reconnect revives them. Kick points: app start, reconnect, app-active,
// and every enqueue (see useUploadOutbox).
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '@/services/supabase/client';
import { getUploadUrl } from '@/api/uploads';
import { queryClient } from '@/api/client';
import { queryKeys } from '@/api/keys';
import { useUploadsStore, ensureHydrated } from '@/stores/uploads.store';
import {
  nextJob,
  jobAfterFailure,
  nextWakeDelay,
  type UploadJob,
} from '@/features/uploads/outbox';

let draining = false;
let wakeTimer: ReturnType<typeof setTimeout> | null = null;

async function runJob(job: UploadJob): Promise<void> {
  const { uploadUrl, publicUrl } = await getUploadUrl(
    { kind: 'memory', memoryId: job.memoryId },
    job.contentType
  );

  const result = await FileSystem.uploadAsync(uploadUrl, job.uri, {
    httpMethod: 'PUT',
    headers: { 'content-type': job.contentType },
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    // iOS: the transfer continues even if the app is backgrounded mid-upload.
    sessionType: FileSystem.FileSystemSessionType.BACKGROUND,
  });
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Upload failed with status ${result.status}`);
  }

  const { error } = await supabase.from('memory_images').insert({
    memory_id: job.memoryId,
    couple_id: job.coupleId,
    image_url: publicUrl,
    position: job.position,
  });
  if (error) throw error;

  queryClient.invalidateQueries({ queryKey: queryKeys.journal.memory(job.memoryId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.journal.timeline(job.coupleId) });
}

// Wake the worker later for jobs waiting out a backoff window.
function scheduleWake() {
  const { jobs } = useUploadsStore.getState();
  const delay = nextWakeDelay(jobs, Date.now());
  if (wakeTimer) {
    clearTimeout(wakeTimer);
    wakeTimer = null;
  }
  if (delay !== null) {
    wakeTimer = setTimeout(() => {
      void processOutbox();
    }, delay + 250);
  }
}

// Drain everything currently eligible. Single-flight: concurrent calls are
// no-ops while a drain is running (uploads stay one-at-a-time).
export async function processOutbox(): Promise<void> {
  if (draining) return;
  draining = true;
  try {
    await ensureHydrated();

    for (;;) {
      const job = nextJob(useUploadsStore.getState().jobs, Date.now());
      if (!job) break;
      try {
        await runJob(job);
        useUploadsStore.getState().remove(job.id);
      } catch {
        useUploadsStore.getState().update(jobAfterFailure(job, Date.now()));
      }
    }
  } finally {
    draining = false;
    scheduleWake();
  }
}
