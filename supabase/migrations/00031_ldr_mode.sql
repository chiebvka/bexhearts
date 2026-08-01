-- ============================================================
-- 00031 — E11 LONG-DISTANCE MODE (owner design round 2026-07-25)
-- ============================================================
-- Owner-locked design: LDR captured in onboarding (new question) + a Profile
-- toggle; virtual dates = is_virtual FLAG on date_ideas (cross-category, not
-- a new category) + a curated tag pass + 12 new purpose-built virtual ideas;
-- "their time" clock needs each PARTNER's timezone (couples.timezone stays
-- the streak anchor — this is per-user, stamped from the device).
-- Owner applies in Studio. database.ts hand-updated in the same commit.

-- 1) Columns ---------------------------------------------------------------
-- (profiles.timezone already exists from 00001 — defaulted to
-- 'America/New_York' and never written until now; the app starts stamping
-- the real device timezone with this round, no schema change needed.)
ALTER TABLE public.couples
  ADD COLUMN is_long_distance BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.date_ideas
  ADD COLUMN is_virtual BOOLEAN NOT NULL DEFAULT false;

-- 2) Tag the existing library ideas that genuinely work over a video call ---
UPDATE public.date_ideas
   SET is_virtual = true
 WHERE title IN (
   'Video Game Co-op Night',
   'Creation Documentary Night',
   'Interview Each Other on Video',
   'Watch Old Home Videos',
   'Slideshow of Us',
   'Team Crossword'
 );

-- 3) Twelve purpose-built virtual date ideas (one per screen, both on a call)
INSERT INTO public.date_ideas
  (title, description, category, estimated_cost, estimated_duration, location_type, accessibility_tags, season, stage_fit, is_virtual)
VALUES
('Watch-Together Movie Night', 'Same movie, synced play buttons, one video call. Snacks on both screens.', 'at-home', 'free', '2-3 hours', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', true),
('Video-Call Dinner Date', 'Cook or order the same meal in two kitchens. Candles on both tables.', 'food', '$$', '1-2 hours', 'home', '{mobility-friendly,no-car-needed}', 'any', '{dating,engaged,married}', true),
('Virtual Museum Tour', 'Pick a museum with a free online tour and wander it together on a call.', 'creative', 'free', '1-2 hours', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', true),
('Online Game Arcade Night', 'Browser party games, two screens, zero mercy.', 'at-home', 'free', '1-2 hours', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', true),
('Read to Each Other', 'One book, alternating chapters, phones on speaker as you fall asleep.', 'simple', 'free', '30 minutes', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', true),
('Pray Across the Miles', 'Open today''s devotional together on a call and close in prayer for each other.', 'spiritual', 'free', '30 minutes', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', true),
('Sunset in Two Time Zones', 'Each of you watches your own sunset on the same call. Compare skies.', 'simple', 'free', '1 hour', 'outdoor', '{no-car-needed,low-energy}', 'any', '{dating,engaged,married}', true),
('Cook the Same Recipe Apart', 'One recipe, two kitchens, one call. Judge plating over video.', 'food', '$$', '2-3 hours', 'home', '{mobility-friendly,no-car-needed}', 'any', '{dating,engaged,married}', true),
('Virtual Coffee Before Work', 'Twenty minutes, two mugs, two time zones. Start the day face to face.', 'simple', '$', '30 minutes', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', true),
('Plan the Next Visit Together', 'Shared list, real dates, a bucket list for the reunion. Hope is a date on the calendar.', 'simple', 'free', '1 hour', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', true),
('Online Bible Study for Two', 'Pick a short reading plan and do day one live on a call.', 'spiritual', 'free', '1 hour', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', true),
('Care Package Build & Reveal', 'Each assemble and mail a surprise box, then open them together on video.', 'creative', '$$', '2 hours', 'home', '{mobility-friendly,no-car-needed}', 'any', '{dating,engaged,married}', true);
