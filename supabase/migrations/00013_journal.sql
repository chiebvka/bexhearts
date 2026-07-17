-- ============================================================
-- JOURNAL — memories timeline + milestones (E5 + E6)
-- ============================================================
-- The "Our Story" feed. Two manual entry types plus reactions and a
-- multi-image gallery. Auto-woven entries (answered prayers, completed dates)
-- are assembled client-side from existing tables — no storage here.
--
--   couple_milestones  — "Special Day" (countdown/anniversary): icon, title,
--                        date, optional time, accent color, recurring flag.
--   memories           — a "Memory" post: title, description, date.
--   memory_images      — N ordered images per memory (URLs → the separate
--                        `bexhearts-memories` R2 bucket; upload is a fast-follow
--                        on the C3b pipeline, the schema is ready now).
--   memory_reactions   — light interaction: one reaction (+ optional note) per
--                        partner per memory (NOT a comment thread).
--
-- RLS: milestones/memories/images are couple-managed (either partner, like
-- couple_dates); reactions are readable by the couple, writable only by their
-- own author. All couple-scoped via get_my_couple_id().
-- ============================================================

CREATE TABLE public.couple_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  color TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_couple_milestones_couple_id ON public.couple_milestones(couple_id);

CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  memory_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_memories_couple_id ON public.memories(couple_id);

CREATE TABLE public.memory_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_memory_images_memory_id ON public.memory_images(memory_id);

CREATE TABLE public.memory_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(memory_id, user_id)
);
CREATE INDEX idx_memory_reactions_memory_id ON public.memory_reactions(memory_id);

ALTER TABLE public.couple_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Couple can manage milestones"
  ON public.couple_milestones FOR ALL
  USING (couple_id = public.get_my_couple_id())
  WITH CHECK (couple_id = public.get_my_couple_id());

CREATE POLICY "Couple can manage memories"
  ON public.memories FOR ALL
  USING (couple_id = public.get_my_couple_id())
  WITH CHECK (couple_id = public.get_my_couple_id());

CREATE POLICY "Couple can manage memory images"
  ON public.memory_images FOR ALL
  USING (couple_id = public.get_my_couple_id())
  WITH CHECK (couple_id = public.get_my_couple_id());

CREATE POLICY "Couple can read memory reactions"
  ON public.memory_reactions FOR SELECT
  USING (couple_id = public.get_my_couple_id());

CREATE POLICY "Users manage own memory reactions"
  ON public.memory_reactions FOR ALL
  USING (user_id = auth.uid() AND couple_id = public.get_my_couple_id())
  WITH CHECK (user_id = auth.uid() AND couple_id = public.get_my_couple_id());

ALTER PUBLICATION supabase_realtime ADD TABLE public.memories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.couple_milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.memory_reactions;
