-- ============================================================
-- RELATIONSHIP STAGE (C1)
-- ============================================================
-- Records the couple's stage so devotional/date/boundary content and paywalls
-- can be stage-relevant (positioning: dating → engaged → newlywed beachhead).
-- Stored on the COUPLE (one value per couple), captured during onboarding by the
-- couple's creator. Nullable: existing couples and any created before the stage
-- is set keep NULL until backfilled.
--
-- stage_started_on (optional "how long / since when") is reserved here so the
-- column exists; the onboarding UI captures the stage now and can collect the
-- date later without another migration.
-- ============================================================

ALTER TABLE public.couples
  ADD COLUMN relationship_stage TEXT
    CHECK (relationship_stage IN ('dating', 'engaged', 'married')),
  ADD COLUMN stage_started_on DATE;
