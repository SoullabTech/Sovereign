#!/bin/sh
# SQL Migration Runner for MAIA Production
# Called by: docker compose --profile migrate run --rm migrate
#
# Only runs migrations not yet recorded in schema_migrations table.
# Records each successful migration to prevent re-runs.
#
# ROBUST: Works regardless of how schema_migrations was originally created.
# Uses filename as the canonical identifier.
#
# INTEGRITY: A SHA-256 checksum of each migration's contents is recorded at
# apply time and re-verified on every subsequent run, BEFORE any pending
# migration is applied. See "Integrity policy" below and
# docs/ops/MIGRATION_INTEGRITY_POLICY.md for the governing decisions.

set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"

MIGRATIONS_DIR="${MIGRATIONS_DIR:-/app/database/migrations}"

# ═════════════════════════════════════════════════════════════════════════════
# Integrity policy
# ═════════════════════════════════════════════════════════════════════════════
# These are SCRIPT CONSTANTS, deliberately NOT environment variables. There is
# no runtime bypass: changing the posture requires a reviewed code change that
# goes through the normal deploy path. An env-var override would re-open the
# same docs-say-X / runner-does-Y asymmetry this check exists to close.
#
# ── DRIFT_POLICY — a recorded checksum disagrees with the file on disk ───────
#   abort : refuse to run anything; exit non-zero. (deploy fails)
#   warn  : print the drift loudly, continue applying pending migrations.
#
# ── NULL_CHECKSUM_POLICY — a row recorded before checksums were enforced ─────
#   report   : count and name them as UNVERIFIED. Never enforced, never
#              backfilled. The gap stays visible in every run's output.
#   backfill : adopt the current file contents as the recorded truth on first
#              sight. NOTE: this manufactures assurance — if the file already
#              drifted before enforcement existed, the drift becomes canon.
#   drift    : treat a NULL checksum as a mismatch. Fails every environment
#              that has pre-enforcement history until each row is resolved.
#
# INTERIM VALUES — pending founder ruling. See
# docs/ops/MIGRATION_INTEGRITY_POLICY.md for the options, consequences, and the
# recommendation these interim values encode.
DRIFT_POLICY=abort
NULL_CHECKSUM_POLICY=report

case "$DRIFT_POLICY" in
  abort|warn) ;;
  *) echo "❌ Invalid DRIFT_POLICY: $DRIFT_POLICY" >&2; exit 2 ;;
esac
case "$NULL_CHECKSUM_POLICY" in
  report|backfill|drift) ;;
  *) echo "❌ Invalid NULL_CHECKSUM_POLICY: $NULL_CHECKSUM_POLICY" >&2; exit 2 ;;
esac

# ═════════════════════════════════════════════════════════════════════════════
# Checksum computation
# ═════════════════════════════════════════════════════════════════════════════
# Content is hashed from stdin so the filename never enters the digest — the
# same bytes produce the same checksum under every implementation below.
if command -v sha256sum >/dev/null 2>&1; then
  compute_checksum() { sha256sum < "$1" | cut -d' ' -f1; }
elif command -v shasum >/dev/null 2>&1; then
  compute_checksum() { shasum -a 256 < "$1" | cut -d' ' -f1; }
elif command -v openssl >/dev/null 2>&1; then
  compute_checksum() { openssl dgst -sha256 < "$1" | sed 's/.*[= ]//'; }
else
  # Fail closed. Silently skipping integrity because a tool is missing is the
  # exact failure mode this check exists to prevent.
  echo "❌ No SHA-256 tool available (sha256sum / shasum / openssl)." >&2
  echo "   Migration integrity cannot be verified; refusing to run." >&2
  exit 2
fi

echo "=== SQL migrations ==="

# Ensure schema_migrations table exists with filename as primary identifier
# This is idempotent - won't fail if table already exists with different schema
psql "$DATABASE_URL" -X -q -c "
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);"

# The checksum column is load-bearing now, not "for future compatibility".
# If it cannot be ensured, integrity cannot be enforced -> fail closed.
psql "$DATABASE_URL" -X -q -c "
SET client_min_messages TO WARNING;
ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum TEXT;" || {
  echo "❌ Could not ensure schema_migrations.checksum column." >&2
  echo "   Migration integrity cannot be enforced; refusing to run." >&2
  exit 2
}

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

# ═════════════════════════════════════════════════════════════════════════════
# Phase 1 — Pre-flight integrity verification
# ═════════════════════════════════════════════════════════════════════════════
# This runs BEFORE any pending migration is applied, and that ordering is the
# whole point. Each migration commits in its OWN transaction, so aborting
# part-way through the chain leaves earlier migrations permanently applied. A
# pre-flight abort leaves the database exactly as it was found.

ledger_tmp="$(mktemp)"
applied_tmp="$(mktemp)"
trap "rm -f '$ledger_tmp' '$applied_tmp'" EXIT

psql "$DATABASE_URL" -X -t -A -F '|' -c "
SELECT filename, COALESCE(checksum, '')
FROM schema_migrations
WHERE filename IS NOT NULL
ORDER BY filename;" > "$ledger_tmp" || {
  echo "❌ Could not read the schema_migrations ledger." >&2
  echo "   Migration integrity cannot be verified; refusing to run." >&2
  exit 2
}

cut -d'|' -f1 < "$ledger_tmp" > "$applied_tmp"
applied_before=$(grep -c . < "$applied_tmp" || true)

verified_count=0
unverified_count=0
absent_count=0
drift_count=0
backfilled_count=0

echo "--- integrity pre-flight ---"

# Redirected from a file, not piped: POSIX sh keeps this loop in the current
# shell, so the counters below survive it.
while IFS='|' read -r rec_file rec_sum; do
  [ -n "$rec_file" ] || continue
  path="$MIGRATIONS_DIR/$rec_file"

  # Recorded, but no longer on disk. Legitimate: retired and renamed
  # migrations both land here (see database/migrations/README.md, "Retired
  # migrations"). Not verifiable, and not drift.
  if [ ! -f "$path" ]; then
    absent_count=$((absent_count + 1))
    echo "  ○ $rec_file — recorded, file not present (retired or renamed)"
    continue
  fi

  actual_sum=$(compute_checksum "$path")

  if [ -z "$rec_sum" ]; then
    case "$NULL_CHECKSUM_POLICY" in
      report)
        unverified_count=$((unverified_count + 1))
        ;;
      backfill)
        psql "$DATABASE_URL" -X -q -c "
UPDATE schema_migrations SET checksum = '$actual_sum'
WHERE filename = '$rec_file' AND checksum IS NULL;"
        backfilled_count=$((backfilled_count + 1))
        echo "  ↑ $rec_file — checksum backfilled from current file contents"
        ;;
      drift)
        drift_count=$((drift_count + 1))
        echo "  ✗ $rec_file — no recorded checksum (policy: drift)"
        ;;
    esac
    continue
  fi

  if [ "$actual_sum" = "$rec_sum" ]; then
    verified_count=$((verified_count + 1))
  else
    drift_count=$((drift_count + 1))
    echo "  ✗ $rec_file — DRIFT"
    echo "      recorded: $rec_sum"
    echo "      on disk:  $actual_sum"
  fi
done < "$ledger_tmp"

echo "  verified:   $verified_count"
[ "$backfilled_count" -eq 0 ] || echo "  backfilled: $backfilled_count"
# Named, not swallowed: these rows predate enforcement and are NOT protected.
[ "$unverified_count" -eq 0 ] || echo "  unverified: $unverified_count (recorded before checksum enforcement — not protected)"
[ "$absent_count" -eq 0 ]     || echo "  absent:     $absent_count (recorded, file no longer present)"
echo "  drift:      $drift_count"

if [ "$drift_count" -gt 0 ]; then
  if [ "$DRIFT_POLICY" = "abort" ]; then
    echo "❌ Migration integrity check failed: $drift_count applied migration(s) differ from their recorded checksum." >&2
    echo "   An applied migration was edited after the fact. Its new contents have NOT run and will never run." >&2
    echo "   Fix forward: restore the file to its applied contents and ship the change as a NEW migration." >&2
    echo "   No migrations were applied. The database is unchanged." >&2
    exit 1
  fi
  echo "⚠️  Migration integrity: $drift_count drifted migration(s) — continuing (DRIFT_POLICY=warn)."
  echo "    The edited contents have NOT run and will never run."
fi

# ═════════════════════════════════════════════════════════════════════════════
# Phase 2 — Apply pending migrations
# ═════════════════════════════════════════════════════════════════════════════

applied_now=0

for f in "$MIGRATIONS_DIR"/*.sql; do
  [ -e "$f" ] || continue  # handles empty-glob case

  filename=$(basename "$f")

  # Skip if already applied
  if grep -Fxq "$filename" "$applied_tmp"; then
    continue
  fi

  echo "→ $filename"

  # Hash the exact bytes that are about to be fed to psql, before running.
  checksum=$(compute_checksum "$f")

  # Run migration with error stop, wrapped in transaction
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -c "BEGIN;" -f "$f" -c "COMMIT;" || {
    echo "❌ Migration failed: $filename"
    psql "$DATABASE_URL" -X -q -c "ROLLBACK;" 2>/dev/null || true
    exit 1
  }

  # Record successful application, with the checksum of what actually ran.
  psql "$DATABASE_URL" -X -q -c "
INSERT INTO schema_migrations (filename, checksum) VALUES ('$filename', '$checksum')
ON CONFLICT (filename) DO UPDATE SET checksum = EXCLUDED.checksum;"

  applied_now=$((applied_now + 1))
done

# Count total migrations
total=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | wc -l | tr -d ' ')

if [ "$applied_now" -eq 0 ]; then
  echo "=== No pending migrations ($applied_before already applied, $total total) ==="
else
  echo "=== Applied $applied_now new migrations ($applied_before were already applied, $total total) ==="
fi
