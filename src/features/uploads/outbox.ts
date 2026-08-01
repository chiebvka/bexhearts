// H2·M2 — pure outbox math. A queued photo upload survives app restarts and
// bad networks: jobs persist in MMKV (uploads.store), a single worker drains
// them one at a time, failures back off and retry. No React, no IO here —
// everything is unit-testable.

export interface UploadJob {
  id: string;
  memoryId: string;
  coupleId: string;
  // Local file uri of the COMPRESSED image (compression happens at enqueue).
  uri: string;
  contentType: string;
  // memory_images position this photo will land at.
  position: number;
  attempts: number;
  // Epoch ms — the job is eligible once now >= nextAttemptAt.
  nextAttemptAt: number;
  createdAt: number;
}

// After this many failed attempts the job parks as "stuck" (still visible,
// retried on the next app start / manual retry, but no longer hot-looped).
export const MAX_UPLOAD_ATTEMPTS = 5;

// Backoff between attempts: quick first retry, then progressively patient.
const BACKOFF_MS = [0, 30_000, 2 * 60_000, 10 * 60_000, 30 * 60_000];

export function backoffMs(attempts: number): number {
  return BACKOFF_MS[Math.min(attempts, BACKOFF_MS.length - 1)];
}

// The next job the worker should run: eligible (nextAttemptAt reached, not
// stuck), oldest first so photos land in the order they were added.
export function nextJob(jobs: UploadJob[], now: number): UploadJob | null {
  const eligible = jobs.filter(
    (job) => job.attempts < MAX_UPLOAD_ATTEMPTS && job.nextAttemptAt <= now
  );
  if (eligible.length === 0) return null;
  return eligible.reduce((a, b) =>
    a.createdAt !== b.createdAt
      ? a.createdAt < b.createdAt
        ? a
        : b
      : a.position <= b.position
        ? a
        : b
  );
}

// A failed attempt: bump the counter and schedule the retry.
export function jobAfterFailure(job: UploadJob, now: number): UploadJob {
  const attempts = job.attempts + 1;
  return { ...job, attempts, nextAttemptAt: now + backoffMs(attempts) };
}

// Jobs that exhausted their attempts (surfaced as "we'll retry later").
export function stuckJobs(jobs: UploadJob[]): UploadJob[] {
  return jobs.filter((job) => job.attempts >= MAX_UPLOAD_ATTEMPTS);
}

// Reset stuck jobs so a fresh app start / reconnect gives them a new round.
export function reviveStuckJobs(jobs: UploadJob[], now: number): UploadJob[] {
  return jobs.map((job) =>
    job.attempts >= MAX_UPLOAD_ATTEMPTS
      ? { ...job, attempts: 0, nextAttemptAt: now }
      : job
  );
}

// How many photos are still on their way to a given memory (pending-state UI).
export function pendingCountForMemory(jobs: UploadJob[], memoryId: string): number {
  return jobs.filter((job) => job.memoryId === memoryId).length;
}

// "2 of 5 photos uploading — we'll finish in the background" card copy.
export function pendingUploadLabel(pending: number, total?: number): string | null {
  if (pending <= 0) return null;
  const noun = pending === 1 ? 'photo' : 'photos';
  if (total && total > pending) {
    return `${pending} of ${total} ${noun} still uploading — we'll finish in the background`;
  }
  return `${pending} ${noun} uploading — we'll finish in the background`;
}

// When the worker should be woken again for jobs that are waiting on backoff
// (null = nothing scheduled in the future, no timer needed).
export function nextWakeDelay(jobs: UploadJob[], now: number): number | null {
  const waiting = jobs.filter(
    (job) => job.attempts < MAX_UPLOAD_ATTEMPTS && job.nextAttemptAt > now
  );
  if (waiting.length === 0) return null;
  return Math.max(0, Math.min(...waiting.map((job) => job.nextAttemptAt)) - now);
}
