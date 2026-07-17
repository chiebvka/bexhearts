-- ============================================================
-- COUPLE DATES — custom (log-your-own) dates + scheduling (D5)
-- ============================================================
-- The date loop was library-only and had no "planned" concept. This adds
-- maximum flexibility (owner decision 2026-06-29 — "nothing forced, pick from
-- the library OR create your own"):
--
-- 1. date_idea_id becomes NULLABLE — a couple can log a date that isn't in the
--    curated library ("we drove to the lake").
-- 2. custom_title / custom_description hold that own-idea content (used when
--    date_idea_id is null; a library date derives its title from date_ideas).
-- 3. scheduled_for (DATE) enables planning a date for a future day → a "Planned"
--    state (status is DERIVED in the app from completed_at / scheduled_for, so
--    no status column). Groundwork for a "date this Friday" reminder (Phase 6).
-- 4. CHECK guarantees every couple_date is anchored to EITHER a library idea OR
--    a custom title (never an empty row). Existing rows all have date_idea_id,
--    so they satisfy it.
--
-- RLS unchanged: "Couple can manage their dates" is already FOR ALL on the
-- couple, so either partner can create/schedule/complete/remove.
-- ============================================================

ALTER TABLE public.couple_dates
  ALTER COLUMN date_idea_id DROP NOT NULL,
  ADD COLUMN custom_title TEXT,
  ADD COLUMN custom_description TEXT,
  ADD COLUMN scheduled_for DATE;

ALTER TABLE public.couple_dates
  ADD CONSTRAINT couple_dates_source_check
    CHECK (date_idea_id IS NOT NULL OR custom_title IS NOT NULL);
