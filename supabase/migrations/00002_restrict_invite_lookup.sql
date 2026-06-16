-- The app links partners through the link_partner RPC.
-- Direct client-side reads of every active invite code are not needed.
DROP POLICY IF EXISTS "Anyone can lookup by invite code"
  ON public.couples;
