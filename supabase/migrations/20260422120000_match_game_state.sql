-- Authoritative in-progress board state for reconnect / refresh resume + Realtime sync

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS game_state JSONB,
  ADD COLUMN IF NOT EXISTS state_version INT NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.matches.game_state IS 'Latest board snapshot for in_progress matches (turn, players, fences, winner, status, pendingAction).';
COMMENT ON COLUMN public.matches.state_version IS 'Incremented on each persisted turn; used for optimistic concurrency.';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  END IF;
END $$;
