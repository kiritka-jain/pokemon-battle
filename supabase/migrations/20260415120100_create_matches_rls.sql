-- Ticket 2.2: matches table with RLS (PokePath Route Rush)

CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winner_id UUID REFERENCES public.profiles (id),
  loser_id UUID REFERENCES public.profiles (id),
  total_turns INT NOT NULL,
  duration_seconds INT NOT NULL,
  final_board_state JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are viewable by everyone"
  ON public.matches FOR SELECT
  USING (true);
