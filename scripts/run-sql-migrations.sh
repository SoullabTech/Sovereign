#!/bin/sh
# SQL Migration Runner for MAIA Production
# Called by: docker compose --profile migrate run --rm migrate
#
# Only runs migrations not yet recorded in schema_migrations table.
# Records each successful migration to prevent re-runs.
#
# ROBUST: Works regardless of how schema_migrations was originally created.
# Uses filename as the canonical identifier.

set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"

echo "=== SQL migrations ==="

# Ensure schema_migrations table exists with filename as primary identifier
# This is idempotent - won't fail if table already exists with different schema
psql "$DATABASE_URL" -X -q -c "
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);"

# Add checksum column if missing (for future compatibility)
psql "$DATABASE_URL" -X -q -c "
ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum TEXT;" 2>/dev/null || true

# ── PT-3 §VIII — migration attribution (founder ruling 2026-09-08) ───────────────
#
# Every migration applied under constitutional database authority must leave attributable
# evidence. On 2026-09-07 three migrations reached production and the question "who applied
# these?" was unanswerable — not because the information was lost, but because it was never
# written while sitting in the very process that ran them. That is an evidentiary architecture
# defect, and this is its repair.
#
# Recorded: migration identity (filename), checksum, application time, the database authority
# used, the Git commit the deploy asserted, and a run identity for the migrate invocation.
#
# NOT recorded: a human actor. §VIII — do not fabricate human attribution where no authenticated
# human identity exists; a machine-verifiable deploy identity is preferable to an invented actor.
psql "$DATABASE_URL" -X -q -c "
ALTER TABLE schema_migrations
  ADD COLUMN IF NOT EXISTS applied_by_authority TEXT,
  ADD COLUMN IF NOT EXISTS applied_by_commit    TEXT,
  ADD COLUMN IF NOT EXISTS applied_run_id       TEXT;" 2>/dev/null || true

# One identity per migrate invocation. A deploy-supplied MIGRATION_RUN_ID is preferable because it
# ties the rows to the deploy act rather than only to each other; the fallback keeps a run
# self-identifying when the deploy supplies nothing.
RUN_ID="${MIGRATION_RUN_ID:-}"
if [ -z "$RUN_ID" ]; then
  RUN_ID="run-$(date -u +%Y%m%dT%H%M%SZ)-$$"
fi
COMMIT="${GIT_COMMIT:-unknown}"
echo "run_id=$RUN_ID commit=$COMMIT"

# Handle legacy tables that have 'version' as PK instead of 'filename'
# Migrate any version-only rows to have filename
psql "$DATABASE_URL" -X -q -c "
DO \$\$
BEGIN
  -- Check if 'version' column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schema_migrations' AND column_name = 'version'
  ) THEN
    -- Add filename column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'schema_migrations' AND column_name = 'filename'
    ) THEN
      ALTER TABLE schema_migrations ADD COLUMN filename TEXT;
    END IF;

    -- Update any rows where filename is NULL but version exists
    -- Try to find matching file by version prefix
    UPDATE schema_migrations SET filename = version || '.sql'
    WHERE filename IS NULL AND version IS NOT NULL;
  END IF;
END \$\$;" 2>/dev/null || true

# Get list of already-applied migrations
applied_tmp="$(mktemp)"
trap "rm -f '$applied_tmp'" EXIT

# Query only the filename column (guaranteed to exist after our setup)
psql "$DATABASE_URL" -X -t -A -c "
SELECT filename FROM schema_migrations WHERE filename IS NOT NULL;" > "$applied_tmp" 2>/dev/null || true

# Count state before running
applied_before=$(wc -l < "$applied_tmp" | tr -d ' ')
applied_now=0

for f in /app/database/migrations/*.sql; do
  [ -e "$f" ] || continue  # handles empty-glob case

  filename=$(basename "$f")

  # Skip if already applied
  if grep -Fxq "$filename" "$applied_tmp"; then
    continue
  fi

  echo "→ $filename"

  # Run migration with error stop, wrapped in transaction
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -c "BEGIN;" -f "$f" -c "COMMIT;" || {
    echo "❌ Migration failed: $filename"
    psql "$DATABASE_URL" -X -q -c "ROLLBACK;" 2>/dev/null || true
    exit 1
  }

  # Checksum the file that actually ran, so a later reader can tell whether the migration on disk
  # is the migration that was applied. The column existed before this change and was never written.
  checksum=""
  if command -v sha256sum >/dev/null 2>&1; then
    checksum=$(sha256sum "$f" | cut -d' ' -f1)
  elif command -v shasum >/dev/null 2>&1; then
    checksum=$(shasum -a 256 "$f" | cut -d' ' -f1)
  fi

  # Record successful application, with its attribution.
  # Read from stdin, not -c: psql expands :'var' only for files and standard input, and the
  # values below are filenames and checksums that must never be pasted into SQL by hand.
  psql "$DATABASE_URL" -X -q -v ON_ERROR_STOP=1 \
    -v fn="$filename" -v cs="$checksum" -v rid="$RUN_ID" -v commit="$COMMIT" <<'LEDGER'
INSERT INTO schema_migrations (filename, checksum, applied_by_authority, applied_by_commit, applied_run_id)
VALUES (:'fn', NULLIF(:'cs',''), current_user, :'commit', :'rid')
ON CONFLICT (filename) DO NOTHING;
LEDGER

  applied_now=$((applied_now + 1))
done

# Count total migrations
total=$(ls -1 /app/database/migrations/*.sql 2>/dev/null | wc -l | tr -d ' ')

if [ "$applied_now" -eq 0 ]; then
  echo "=== No pending migrations ($applied_before already applied, $total total) ==="
else
  echo "=== Applied $applied_now new migrations ($applied_before were already applied, $total total) ==="
fi
