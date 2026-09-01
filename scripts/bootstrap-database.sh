#!/usr/bin/env bash
# Apply the canonical schema baseline to an EMPTY database, then seed the
# migration ledger so scripts/apply-migrations.sh treats the baselined
# migrations as already applied.
#
# Canonical bootstrap sequence for a blank PostgreSQL database:
#   scripts/bootstrap-database.sh && npm run db:migrate
#
# Refuses to run against a database that already has application tables.
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL must be set}"

BASELINE="${BASELINE:-database/baseline/0001_baseline_2026-09-01.sql}"
MANIFEST="${MANIFEST:-database/baseline/0001_baseline_2026-09-01.manifest}"
MIG_DIR="${MIG_DIR:-database/migrations}"

[ -f "$BASELINE" ] || { echo "❌ baseline not found: $BASELINE"; exit 1; }
[ -f "$MANIFEST" ] || { echo "❌ manifest not found: $MANIFEST"; exit 1; }

existing="$(psql "$DATABASE_URL" -tAc \
  "select count(*) from pg_tables where schemaname='public'")"
if [ "$existing" != "0" ]; then
  echo "❌ Refusing to baseline: database already has $existing public table(s)."
  echo "   The baseline is for empty databases only. Use npm run db:migrate."
  exit 1
fi

echo "📦 Applying canonical baseline: $BASELINE"
psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1 -f "$BASELINE"

echo "🧾 Seeding migration ledger from $MANIFEST"
psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1 <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename text PRIMARY KEY,
  checksum text,
  applied_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum text;
SQL

# The manifest is the SOURCE DATABASE'S LEDGER — filenames only, one per line,
# comments with '#'. A migration is stamped because production recorded it as
# applied, never because a file of that name happens to sit in the repository.
#
# The checksum is computed FROM DISK NOW, not captured with the manifest, so a
# subsumed migration edited after capture still trips the runner's tamper check.
# Where production recorded a migration whose source file is gone, the ledger
# fact is preserved with a NULL checksum: the runner reads that as "applied, no
# checksum stored" and skips it. Nothing is synthesized to fill the gap.
hash_file() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | awk '{print $1}'
  else shasum -a 256 "$1" | awk '{print $1}'; fi
}

# Built to a file rather than piped into psql: a pipeline runs the loop in a
# subshell, and the counters below would be reported as zero while the ledger
# was in fact correctly stamped — a summary line that lies about what happened.
stamp_sql="$(mktemp -t maia-bootstrap-stamp.XXXXXX.sql)"
trap 'rm -f "$stamp_sql"' EXIT

stamped=0; with_file=0; ledger_only=0
{
  echo "INSERT INTO schema_migrations (filename, checksum) VALUES"
  sep=""
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in ''|\#*) continue ;; esac
    name="$(printf '%s' "$line" | tr -d '[:space:]')"
    [ -n "$name" ] || continue
    esc="${name//\'/\'\'}"
    if [ -f "$MIG_DIR/$name" ]; then
      printf "%s('%s','%s')" "$sep" "$esc" "$(hash_file "$MIG_DIR/$name")"
      with_file=$((with_file+1))
    else
      printf "%s('%s',NULL)" "$sep" "$esc"
      ledger_only=$((ledger_only+1))
    fi
    sep=","
    stamped=$((stamped+1))
  done < "$MANIFEST"
  echo ""
  echo "ON CONFLICT (filename) DO NOTHING;"
} > "$stamp_sql"

[ "$stamped" -gt 0 ] || { echo "❌ manifest named no migrations: $MANIFEST"; exit 1; }
psql "$DATABASE_URL" -q -v ON_ERROR_STOP=1 -f "$stamp_sql"

echo "   $stamped ledger entries stamped — $with_file with an on-disk checksum, $ledger_only ledger-only (source file no longer in the repository)."

seeded="$(psql "$DATABASE_URL" -tAc 'select count(*) from schema_migrations')"
tables="$(psql "$DATABASE_URL" -tAc "select count(*) from pg_tables where schemaname='public'")"
echo "✅ Baseline applied: $tables table(s), $seeded ledger row(s)."
echo "   Next: npm run db:migrate"
