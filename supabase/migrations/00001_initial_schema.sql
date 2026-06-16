-- ============================================================
-- BEXHEARTS INITIAL SCHEMA
-- ============================================================

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  denomination TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  couple_id UUID,
  push_token TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COUPLES
-- ============================================================
CREATE TABLE public.couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_a_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_b_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  invite_code TEXT UNIQUE NOT NULL,
  invite_code_expires_at TIMESTAMPTZ,
  linked_at TIMESTAMPTZ,
  streak_count INTEGER DEFAULT 0,
  streak_last_date DATE,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_couples_invite_code ON public.couples(invite_code);

-- Add FK from profiles to couples (circular reference, added after both tables exist)
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_couple
  FOREIGN KEY (couple_id) REFERENCES public.couples(id) ON DELETE SET NULL;

-- ============================================================
-- DEVOTIONALS (content, seeded by admin/CMS)
-- ============================================================
CREATE TABLE public.devotionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publish_date DATE UNIQUE NOT NULL,
  title TEXT NOT NULL,
  scripture_reference TEXT NOT NULL,
  scripture_text TEXT NOT NULL,
  reflection TEXT NOT NULL,
  couple_action TEXT NOT NULL,
  category TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_devotionals_publish_date ON public.devotionals(publish_date);

-- ============================================================
-- DEVOTIONAL PROGRESS
-- ============================================================
CREATE TABLE public.devotional_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devotional_id UUID NOT NULL REFERENCES public.devotionals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  reflection_response TEXT,
  action_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(devotional_id, user_id)
);

-- ============================================================
-- PRAYERS
-- ============================================================
CREATE TABLE public.prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  is_answered BOOLEAN DEFAULT FALSE,
  answered_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_prayers_couple_id ON public.prayers(couple_id);

-- ============================================================
-- CHECK-INS
-- ============================================================
CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_of DATE NOT NULL,
  emotional_connection INTEGER CHECK (emotional_connection BETWEEN 1 AND 5),
  spiritual_connection INTEGER CHECK (spiritual_connection BETWEEN 1 AND 5),
  communication_quality INTEGER CHECK (communication_quality BETWEEN 1 AND 5),
  gratitude_note TEXT,
  growth_area TEXT,
  prayer_request TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(couple_id, user_id, week_of)
);

-- ============================================================
-- BOUNDARIES
-- ============================================================
CREATE TABLE public.boundaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('boundary', 'temptation')),
  title TEXT NOT NULL,
  description TEXT,
  action_plan TEXT,
  accountability_partner TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- DATE IDEAS (content, seeded by admin/CMS)
-- ============================================================
CREATE TABLE public.date_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_cost TEXT CHECK (estimated_cost IN ('free', '$', '$$', '$$$')),
  estimated_duration TEXT,
  scripture_tie TEXT,
  discussion_questions JSONB DEFAULT '[]',
  is_premium BOOLEAN DEFAULT FALSE,
  is_challenge BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COUPLE DATES
-- ============================================================
CREATE TABLE public.couple_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  date_idea_id UUID NOT NULL REFERENCES public.date_ideas(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_couples_updated_at
  BEFORE UPDATE ON public.couples
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_prayers_updated_at
  BEFORE UPDATE ON public.prayers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_boundaries_updated_at
  BEFORE UPDATE ON public.boundaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Helper: get the current user's couple_id
CREATE OR REPLACE FUNCTION public.get_my_couple_id()
RETURNS UUID AS $$
  SELECT couple_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Link partner function (called from app via RPC)
CREATE OR REPLACE FUNCTION public.link_partner(p_invite_code TEXT)
RETURNS UUID AS $$
DECLARE
  v_couple_id UUID;
BEGIN
  -- Find the couple with this invite code
  SELECT id INTO v_couple_id
  FROM public.couples
  WHERE invite_code = p_invite_code
    AND partner_b_id IS NULL
    AND invite_code_expires_at > now();

  IF v_couple_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;

  -- Prevent self-linking
  IF EXISTS (
    SELECT 1 FROM public.couples
    WHERE id = v_couple_id AND partner_a_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Cannot link with yourself';
  END IF;

  -- Prevent user already in a couple
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND couple_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'You are already linked to a partner';
  END IF;

  -- Link the partner
  UPDATE public.couples
  SET partner_b_id = auth.uid(),
      linked_at = now(),
      invite_code_expires_at = now()
  WHERE id = v_couple_id;

  -- Update the joining user's profile
  UPDATE public.profiles
  SET couple_id = v_couple_id
  WHERE id = auth.uid();

  RETURN v_couple_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotional_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_dates ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can read partner profile"
  ON public.profiles FOR SELECT
  USING (couple_id IS NOT NULL AND couple_id = public.get_my_couple_id());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- COUPLES
CREATE POLICY "Partners can read couple"
  ON public.couples FOR SELECT
  USING (partner_a_id = auth.uid() OR partner_b_id = auth.uid());

CREATE POLICY "Anyone can lookup by invite code"
  ON public.couples FOR SELECT
  USING (invite_code IS NOT NULL AND invite_code_expires_at > now());

CREATE POLICY "Authenticated users can create couple"
  ON public.couples FOR INSERT
  WITH CHECK (partner_a_id = auth.uid());

CREATE POLICY "Partners can update couple"
  ON public.couples FOR UPDATE
  USING (partner_a_id = auth.uid() OR partner_b_id = auth.uid());

-- DEVOTIONALS (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read devotionals"
  ON public.devotionals FOR SELECT
  TO authenticated
  USING (TRUE);

-- DEVOTIONAL_PROGRESS
CREATE POLICY "Couple can read progress"
  ON public.devotional_progress FOR SELECT
  USING (couple_id = public.get_my_couple_id());

CREATE POLICY "Users can insert own progress"
  ON public.devotional_progress FOR INSERT
  WITH CHECK (user_id = auth.uid() AND couple_id = public.get_my_couple_id());

CREATE POLICY "Users can update own progress"
  ON public.devotional_progress FOR UPDATE
  USING (user_id = auth.uid());

-- PRAYERS
CREATE POLICY "Couple can read prayers"
  ON public.prayers FOR SELECT
  USING (couple_id = public.get_my_couple_id());

CREATE POLICY "Couple can insert prayers"
  ON public.prayers FOR INSERT
  WITH CHECK (couple_id = public.get_my_couple_id() AND author_id = auth.uid());

CREATE POLICY "Author can update prayers"
  ON public.prayers FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Author can delete prayers"
  ON public.prayers FOR DELETE
  USING (author_id = auth.uid());

-- CHECK_INS
CREATE POLICY "Couple can read check-ins"
  ON public.check_ins FOR SELECT
  USING (couple_id = public.get_my_couple_id());

CREATE POLICY "Users can insert own check-ins"
  ON public.check_ins FOR INSERT
  WITH CHECK (user_id = auth.uid() AND couple_id = public.get_my_couple_id());

-- BOUNDARIES
CREATE POLICY "Couple can read boundaries"
  ON public.boundaries FOR SELECT
  USING (couple_id = public.get_my_couple_id());

CREATE POLICY "Couple can insert boundaries"
  ON public.boundaries FOR INSERT
  WITH CHECK (couple_id = public.get_my_couple_id() AND author_id = auth.uid());

CREATE POLICY "Author can update boundaries"
  ON public.boundaries FOR UPDATE
  USING (author_id = auth.uid());

-- DATE_IDEAS (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read date ideas"
  ON public.date_ideas FOR SELECT
  TO authenticated
  USING (TRUE);

-- COUPLE_DATES
CREATE POLICY "Couple can manage their dates"
  ON public.couple_dates FOR ALL
  USING (couple_id = public.get_my_couple_id());


-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.prayers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.devotional_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.couples;
