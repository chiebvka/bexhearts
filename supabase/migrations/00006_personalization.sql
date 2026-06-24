-- ============================================================
-- ONBOARDING PERSONALIZATION (C1b)
-- ============================================================
-- "What do you want to grow in?" — per-person growth focus areas captured in
-- onboarding, used for the personalized plan summary and (later) stage/goal-aware
-- content recommendations. Per-PROFILE (each partner has their own goals; the
-- couple's plan blends both). Free-form text[] sourced from a fixed UI list, so
-- adding options later needs no migration. Defaults to empty for existing rows.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN growth_focus TEXT[] NOT NULL DEFAULT '{}';
