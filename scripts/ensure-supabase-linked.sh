#!/usr/bin/env bash
# Exit 0 if this repo is linked to a hosted Supabase project (supabase link creates .temp/project-ref).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REF_FILE="$ROOT/supabase/.temp/project-ref"
if [[ -f "$REF_FILE" ]] && [[ -s "$REF_FILE" ]]; then
  exit 0
fi
cat >&2 <<'EOF'
No hosted Supabase link found for this repo.

From the pokepath/ folder, link once (use Reference ID from Dashboard → Project Settings → General):

  npx supabase login
  export SUPABASE_PROJECT_REF='<your-reference-id>'
  export SUPABASE_DB_PASSWORD='<database-password>'
  npm run supabase:link

Then retry this command.

If you still see "invalid project ref", check for SUPABASE_PROJECT_ID / SUPABASE_PROJECT_REF in shell or .env
that overrides the linked project — unset mismatched values.
EOF
exit 1
