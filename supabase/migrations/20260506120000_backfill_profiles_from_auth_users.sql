-- Backfill public.profiles for auth.users that never got a row (e.g. trigger missing
-- at signup or pre-trigger accounts). Ensures matches.player1_id / player2_id FK inserts succeed.
-- Username mirrors handle_new_user metadata rules, with '_' || full uuid (no dashes) suffix
-- so public.profiles.username UNIQUE never collides.
--
-- After deploying, confirm trigger on_auth_user_created still exists on auth.users in the dashboard.

INSERT INTO public.profiles (id, username)
SELECT
  u.id,
  LEFT(
    COALESCE(
      NULLIF(trim(u.raw_user_meta_data->>'full_name'), ''),
      NULLIF(trim(u.raw_user_meta_data->>'name'), ''),
      'Trainer_' || LEFT(REPLACE(u.id::text, '-', ''), 8)
    ),
    100
  ) || '_' || REPLACE(u.id::text, '-', '')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;
