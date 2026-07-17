-- 00014 — memory_images realtime (photo/gallery build, 2026-07-04)
-- 00013 added memories / couple_milestones / memory_reactions to the realtime
-- publication but missed memory_images. With photo upload landing, a partner's
-- new photos should appear in the Journal live like every other entry.
ALTER PUBLICATION supabase_realtime ADD TABLE public.memory_images;
