-- 00029 — pg_cron schedules for the notification sweep + account deletions
-- (G3, 2026-07-19)
--
-- ⚠️⚠️ OWNER: EDIT BEFORE RUNNING — two placeholders in Part 3:
--   1. YOUR_SUPABASE_URL   → where Postgres can reach the edge functions:
--        · LOCAL Mac stack:      http://host.docker.internal:55321
--        · VPS (Coolify):        http://kong:8000   (same docker network)
--          or https://<your-supabase-domain>
--   2. YOUR_SERVICE_ROLE_KEY → the service_role key of THAT environment
--        (local: `supabase status` shows it; VPS: Coolify env vars).
--   The key lives inside the cron job definition — server-side only, same
--   trust level as the database itself. Re-running cron.schedule with the
--   same job name REPLACES the job, so you can fix values any time.
--
-- WHAT RUNS:
--   · notification-sweep — hourly at :05. The sweep function computes each
--     couple's LOCAL hour (9am devotional reminder + grace notice, 10am
--     milestone countdowns, 12pm prayer digest, Sun 6pm check-in reminder,
--     7pm streak-at-risk) and routes everything through send-notification,
--     so prefs / quiet hours / debounce apply. Idempotent (20h dedupe) —
--     an extra manual run re-sends nothing.
--   · process-account-deletions — daily 03:00 UTC; executes the 7-day-grace
--     hard deletes (function shipped in 00005; owed since B4).

-- ————————————————— 1) extensions —————————————————
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ————————————————— 2) account-deletion processor (no secrets needed) —————
SELECT cron.schedule(
  'process-account-deletions',
  '0 3 * * *',
  $$ SELECT public.process_due_account_deletions(); $$
);

-- ————————————————— 3) hourly notification sweep — EDIT PLACEHOLDERS ————
SELECT cron.schedule(
  'notification-sweep',
  '5 * * * *',
  $$
  SELECT net.http_post(
    -- LOCAL: host.docker.internal (NOT 127.0.0.1 — pg_net runs INSIDE the
    -- Postgres container, where 127.0.0.1 is the container itself). VPS: swap
    -- for http://kong:8000/... or https://<your-supabase-domain>/... .
    url     := 'http://host.docker.internal:55321/functions/v1/notification-sweep',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      -- Paste the CLASSIC service_role JWT from `supabase status -o env |
      -- grep SERVICE_ROLE_KEY` (the eyJhbGci… token) — NOT the new-format
      -- sb_secret_… shown in the pretty `supabase status` panel; the served
      -- functions check the Bearer against the injected JWT.
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);

-- Verify after applying:
--   SELECT jobname, schedule, active FROM cron.job;
--   -- and after the next :05 —
--   SELECT jobname, status, return_message, start_time
--   FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
