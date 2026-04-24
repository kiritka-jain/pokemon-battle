#!/usr/bin/env bash
# Mark each version in supabase/migrations/*.sql as APPLIED on the linked remote
# (updates supabase_migrations history only; does not run SQL).
# Use when the database already matches these migrations but history was cleared or wrong.
# Requires: npx supabase link (from repo root: npm run supabase:link in pokepath/)
# Safety: set SUPABASE_MARK_APPLIED_CONFIRM=1
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
bash "$ROOT/scripts/ensure-supabase-linked.sh"
cd "$ROOT"
if [ "${SUPABASE_MARK_APPLIED_CONFIRM:-}" != "1" ]; then
  echo "Refusing: set SUPABASE_MARK_APPLIED_CONFIRM=1 only if the remote schema already matches these migrations." >&2
  exit 1
fi
shopt -s nullglob
files=(supabase/migrations/*.sql)
if [ ${#files[@]} -eq 0 ]; then
  echo "No files in supabase/migrations/*.sql" >&2
  exit 1
fi
IFS=$'\n' sorted=($(sort <<<"${files[*]}"))
for f in "${sorted[@]}"; do
  base=$(basename "$f")
  version="${base%%_*}"
  echo "supabase migration repair --status applied $version"
  npx supabase migration repair --status applied "$version" --linked --workdir . --yes
done
