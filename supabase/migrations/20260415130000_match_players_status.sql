-- Epic 7: active matches + anon profile read for leaderboard

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS player1_id UUID REFERENCES public.profiles (id),
  ADD COLUMN IF NOT EXISTS player2_id UUID REFERENCES public.profiles (id),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'in_progress';

ALTER TABLE public.matches
  ALTER COLUMN total_turns DROP NOT NULL,
  ALTER COLUMN duration_seconds DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS matches_one_active_pair
  ON public.matches (player1_id, player2_id)
  WHERE status = 'in_progress';

-- Allow leaderboard to load without auth (read-only public fields)
CREATE POLICY "Public profiles are viewable by anonymous users"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);
