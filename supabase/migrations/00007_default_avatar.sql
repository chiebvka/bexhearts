-- ============================================================
-- DEFAULT AVATAR FOR NEW ACCOUNTS (C3 follow-up)
-- ============================================================
-- Every new profile is auto-assigned an illustrated DiceBear "open-peeps" avatar
-- seeded by the user's id (deterministic + unique-ish) instead of the blank
-- purple-initials fallback. Fires for ALL signup methods (the trigger runs on
-- auth.users INSERT, including Apple/Google id-token sign-in). Matches the app's
-- preset style (src/features/profile/presetAvatars.ts: open-peeps + bg eee7ff),
-- so it's consistent with the in-app avatar picker. Users can still change it.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    'https://api.dicebear.com/9.x/open-peeps/png?seed='
      || NEW.id::text
      || '&backgroundColor=eee7ff'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing accounts that still have no avatar (e.g. test accounts
-- created before this migration).
UPDATE public.profiles
SET avatar_url =
  'https://api.dicebear.com/9.x/open-peeps/png?seed='
    || id::text
    || '&backgroundColor=eee7ff'
WHERE avatar_url IS NULL;
