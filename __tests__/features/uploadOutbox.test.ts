import {
  MAX_UPLOAD_ATTEMPTS,
  backoffMs,
  nextJob,
  jobAfterFailure,
  stuckJobs,
  reviveStuckJobs,
  pendingCountForMemory,
  pendingUploadLabel,
  nextWakeDelay,
  type UploadJob,
} from '@/features/uploads/outbox';

const NOW = 1_700_000_000_000;

const job = (overrides: Partial<UploadJob> = {}): UploadJob => ({
  id: overrides.id ?? 'job-1',
  memoryId: 'mem-1',
  coupleId: 'couple-1',
  uri: 'file:///photo.jpg',
  contentType: 'image/jpeg',
  position: 0,
  attempts: 0,
  nextAttemptAt: NOW,
  createdAt: NOW,
  ...overrides,
});

describe('backoffMs', () => {
  it('starts immediate and grows patient', () => {
    expect(backoffMs(0)).toBe(0);
    expect(backoffMs(1)).toBe(30_000);
    expect(backoffMs(2)).toBe(2 * 60_000);
    expect(backoffMs(99)).toBe(30 * 60_000); // clamps to the last step
  });
});

describe('nextJob', () => {
  it('picks the oldest eligible job (photo order preserved)', () => {
    const jobs = [
      job({ id: 'b', createdAt: NOW + 2, position: 1 }),
      job({ id: 'a', createdAt: NOW + 1, position: 0 }),
    ];
    expect(nextJob(jobs, NOW + 10)?.id).toBe('a');
  });

  it('skips jobs waiting on backoff and stuck jobs', () => {
    const jobs = [
      job({ id: 'waiting', nextAttemptAt: NOW + 60_000 }),
      job({ id: 'stuck', attempts: MAX_UPLOAD_ATTEMPTS }),
    ];
    expect(nextJob(jobs, NOW)).toBeNull();
  });

  it('breaks created-at ties by position', () => {
    const jobs = [
      job({ id: 'second', createdAt: NOW, position: 4 }),
      job({ id: 'first', createdAt: NOW, position: 3 }),
    ];
    expect(nextJob(jobs, NOW)?.id).toBe('first');
  });
});

describe('jobAfterFailure / stuck / revive', () => {
  it('bumps attempts and schedules the retry', () => {
    const failed = jobAfterFailure(job(), NOW);
    expect(failed.attempts).toBe(1);
    expect(failed.nextAttemptAt).toBe(NOW + 30_000);
  });

  it('parks after max attempts and revives with a fresh round', () => {
    let j = job();
    for (let i = 0; i < MAX_UPLOAD_ATTEMPTS; i++) j = jobAfterFailure(j, NOW);
    expect(stuckJobs([j])).toHaveLength(1);
    expect(nextJob([j], NOW + 10 * 60 * 60_000)).toBeNull();

    const revived = reviveStuckJobs([j], NOW);
    expect(revived[0].attempts).toBe(0);
    expect(nextJob(revived, NOW)?.id).toBe(j.id);
  });

  it('revive leaves healthy jobs untouched (same reference)', () => {
    const healthy = job();
    expect(reviveStuckJobs([healthy], NOW)[0]).toBe(healthy);
  });
});

describe('pending UI helpers', () => {
  it('counts only the given memory', () => {
    const jobs = [job(), job({ id: 'x', memoryId: 'mem-2' })];
    expect(pendingCountForMemory(jobs, 'mem-1')).toBe(1);
    expect(pendingCountForMemory(jobs, 'nope')).toBe(0);
  });

  it('labels partial and full batches, null when done', () => {
    expect(pendingUploadLabel(2, 5)).toBe(
      "2 of 5 photos still uploading — we'll finish in the background"
    );
    expect(pendingUploadLabel(1, 1)).toBe(
      "1 photo uploading — we'll finish in the background"
    );
    expect(pendingUploadLabel(0, 5)).toBeNull();
  });
});

describe('nextWakeDelay', () => {
  it('is the soonest backoff among waiting jobs', () => {
    const jobs = [
      job({ id: 'soon', nextAttemptAt: NOW + 5_000 }),
      job({ id: 'later', nextAttemptAt: NOW + 60_000 }),
    ];
    expect(nextWakeDelay(jobs, NOW)).toBe(5_000);
  });

  it('is null when nothing is waiting (eligible-now or stuck do not count)', () => {
    expect(nextWakeDelay([job()], NOW)).toBeNull();
    expect(
      nextWakeDelay([job({ attempts: MAX_UPLOAD_ATTEMPTS, nextAttemptAt: NOW + 999 })], NOW)
    ).toBeNull();
  });
});
