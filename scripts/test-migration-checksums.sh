#!/usr/bin/env bash
# Verification harness for migration integrity enforcement in
# scripts/run-sql-migrations.sh.
#
# Creates its OWN throwaway database and its OWN fixture migration directory —
# it never touches maia_consciousness or database/migrations. (The dev database
# is shared across many worktrees; evidence gathered against it is not
# repeatable.)
#
# Usage:
#   bash scripts/test-migration-checksums.sh
#   TEST_PG_ADMIN_URL=postgresql://user@host:5432/postgres bash scripts/...

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUNNER="$REPO_ROOT/scripts/run-sql-migrations.sh"

ADMIN_URL="${TEST_PG_ADMIN_URL:-postgresql://soullab@localhost:5432/postgres}"
TEST_DB="maia_migchk_test_$$"
TEST_URL="${ADMIN_URL%/*}/$TEST_DB"

WORK="$(mktemp -d)"
MIGDIR="$WORK/migrations"
mkdir -p "$MIGDIR"

pass=0
fail=0

cleanup() {
  psql "$ADMIN_URL" -X -q -c "DROP DATABASE IF EXISTS $TEST_DB;" >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

ok()   { pass=$((pass + 1)); echo "  ✓ $1"; }
bad()  { fail=$((fail + 1)); echo "  ✗ $1"; }

check() { # check <description> <expected> <actual>
  if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 — expected [$2], got [$3]"; fi
}

contains() { # contains <description> <needle> <haystack>
  case "$3" in
    *"$2"*) ok "$1" ;;
    *)      bad "$1 — output did not contain [$2]" ;;
  esac
}

not_contains() { # not_contains <description> <needle> <haystack>
  case "$3" in
    *"$2"*) bad "$1 — output unexpectedly contained [$2]" ;;
    *)      ok "$1" ;;
  esac
}

# Run the real runner (or a policy variant of it) against the fixture dir.
# Captures output and exit code without tripping set -e.
run_migrations() { # run_migrations [runner_path]
  local script="${1:-$RUNNER}"
  set +e
  RUN_OUT="$(DATABASE_URL="$TEST_URL" MIGRATIONS_DIR="$MIGDIR" sh "$script" 2>&1)"
  RUN_RC=$?
  set -e
}

# Produce a copy of the runner with a policy constant changed. The constants are
# deliberately not environment variables, so a variant copy is the only honest
# way to exercise the other ruled outcomes.
variant() { # variant <NAME=value> -> echoes path
  local out="$WORK/runner_${1//[^A-Za-z0-9]/_}.sh"
  sed "s/^${1%%=*}=.*/$1/" "$RUNNER" > "$out"
  grep -qx "$1" "$out" || { echo "FATAL: variant $1 did not apply" >&2; exit 2; }
  echo "$out"
}

sql() { psql "$TEST_URL" -X -t -A -c "$1"; }

sha_of() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum < "$1" | cut -d' ' -f1
  else shasum -a 256 < "$1" | cut -d' ' -f1; fi
}

echo "=== migration integrity verification ==="
echo "database: $TEST_DB"
psql "$ADMIN_URL" -X -q -c "DROP DATABASE IF EXISTS $TEST_DB;" >/dev/null 2>&1 || true
psql "$ADMIN_URL" -X -q -c "CREATE DATABASE $TEST_DB;" >/dev/null

cat > "$MIGDIR/20260101000001_alpha.sql" <<'SQL'
CREATE TABLE IF NOT EXISTS alpha (id int primary key);
SQL
cat > "$MIGDIR/20260101000002_beta.sql" <<'SQL'
CREATE TABLE IF NOT EXISTS beta (id int primary key);
SQL

# ─────────────────────────────────────────────────────────────────────────────
echo
echo "T1 — first run applies both migrations and records checksums"
run_migrations
check "exit 0" "0" "$RUN_RC"
check "two migrations recorded" "2" "$(sql "SELECT count(*) FROM schema_migrations;")"
check "no NULL checksums" "0" "$(sql "SELECT count(*) FROM schema_migrations WHERE checksum IS NULL;")"
check "alpha checksum is the file's SHA-256" \
  "$(sha_of "$MIGDIR/20260101000001_alpha.sql")" \
  "$(sql "SELECT checksum FROM schema_migrations WHERE filename='20260101000001_alpha.sql';")"
check "tables actually created" "2" \
  "$(sql "SELECT count(*) FROM information_schema.tables WHERE table_name IN ('alpha','beta');")"

# ─────────────────────────────────────────────────────────────────────────────
echo
echo "T2 — clean re-run verifies, applies nothing"
run_migrations
check "exit 0" "0" "$RUN_RC"
contains "reports 2 verified" "verified:   2" "$RUN_OUT"
contains "reports 0 drift" "drift:      0" "$RUN_OUT"
contains "no pending migrations" "No pending migrations" "$RUN_OUT"

# ─────────────────────────────────────────────────────────────────────────────
echo
echo "T3 — editing an applied migration aborts, and aborts BEFORE applying anything"
cp "$MIGDIR/20260101000001_alpha.sql" "$WORK/alpha.orig"
cat > "$MIGDIR/20260101000001_alpha.sql" <<'SQL'
CREATE TABLE IF NOT EXISTS alpha (id int primary key);
ALTER TABLE alpha ADD COLUMN IF NOT EXISTS smuggled text;
SQL
# A genuinely pending migration sits alongside the drifted one. Under a
# pre-flight check it must NOT be applied; under a mid-chain check it would be.
cat > "$MIGDIR/20260101000003_gamma.sql" <<'SQL'
CREATE TABLE IF NOT EXISTS gamma (id int primary key);
SQL
run_migrations
check "exit 1" "1" "$RUN_RC"
contains "names the drifted file" "20260101000001_alpha.sql — DRIFT" "$RUN_OUT"
contains "refusal reason is integrity, not a SQL error" "Migration integrity check failed" "$RUN_OUT"
contains "states the edited contents never ran" "have NOT run and will never run" "$RUN_OUT"
contains "states nothing was applied" "No migrations were applied" "$RUN_OUT"
check "smuggled column was NOT added" "0" \
  "$(sql "SELECT count(*) FROM information_schema.columns WHERE table_name='alpha' AND column_name='smuggled';")"
check "pending gamma was NOT applied (pre-flight ordering)" "0" \
  "$(sql "SELECT count(*) FROM information_schema.tables WHERE table_name='gamma';")"
check "ledger unchanged" "2" "$(sql "SELECT count(*) FROM schema_migrations;")"

# ─────────────────────────────────────────────────────────────────────────────
echo
echo "T4 — restoring the file clears the drift and the backlog applies"
cp "$WORK/alpha.orig" "$MIGDIR/20260101000001_alpha.sql"
run_migrations
check "exit 0" "0" "$RUN_RC"
contains "gamma applied" "→ 20260101000003_gamma.sql" "$RUN_OUT"
check "gamma table exists" "1" \
  "$(sql "SELECT count(*) FROM information_schema.tables WHERE table_name='gamma';")"
check "gamma checksum recorded" "$(sha_of "$MIGDIR/20260101000003_gamma.sql")" \
  "$(sql "SELECT checksum FROM schema_migrations WHERE filename='20260101000003_gamma.sql';")"

# ─────────────────────────────────────────────────────────────────────────────
echo
echo "T5 — a pre-enforcement row (NULL checksum) is UNVERIFIED, not drift"
sql "UPDATE schema_migrations SET checksum = NULL WHERE filename='20260101000002_beta.sql';" >/dev/null
# Edit it too: without a recorded checksum there is nothing to compare against,
# so this must NOT be reported as drift under NULL_CHECKSUM_POLICY=report.
cat > "$MIGDIR/20260101000002_beta.sql" <<'SQL'
CREATE TABLE IF NOT EXISTS beta (id int primary key);
-- edited after the fact, but recorded before enforcement existed
SQL
run_migrations
check "exit 0 — existing environments are not broken" "0" "$RUN_RC"
contains "unverified is named, not swallowed" "unverified: 1" "$RUN_OUT"
contains "reports 0 drift" "drift:      0" "$RUN_OUT"
check "NULL checksum left NULL (no silent backfill)" "1" \
  "$(sql "SELECT count(*) FROM schema_migrations WHERE checksum IS NULL;")"

# ─────────────────────────────────────────────────────────────────────────────
echo
echo "T6 — NULL_CHECKSUM_POLICY=backfill adopts current contents, loudly"
BACKFILL_RUNNER="$(variant "NULL_CHECKSUM_POLICY=backfill")"
run_migrations "$BACKFILL_RUNNER"
check "exit 0" "0" "$RUN_RC"
contains "announces the backfill" "checksum backfilled from current file contents" "$RUN_OUT"
check "no NULL checksums remain" "0" \
  "$(sql "SELECT count(*) FROM schema_migrations WHERE checksum IS NULL;")"
check "adopted the EDITED contents, not the applied ones" \
  "$(sha_of "$MIGDIR/20260101000002_beta.sql")" \
  "$(sql "SELECT checksum FROM schema_migrations WHERE filename='20260101000002_beta.sql';")"

# ─────────────────────────────────────────────────────────────────────────────
echo
echo "T7 — a retired migration (recorded, file removed) is ABSENT, not drift"
rm "$MIGDIR/20260101000003_gamma.sql"
run_migrations
check "exit 0" "0" "$RUN_RC"
contains "names it as retired or renamed" "recorded, file not present (retired or renamed)" "$RUN_OUT"
contains "reports 0 drift" "drift:      0" "$RUN_OUT"

# ─────────────────────────────────────────────────────────────────────────────
echo
echo "T8 — DRIFT_POLICY=warn continues but still says the edit never ran"
cat > "$MIGDIR/20260101000001_alpha.sql" <<'SQL'
CREATE TABLE IF NOT EXISTS alpha (id int primary key);
ALTER TABLE alpha ADD COLUMN IF NOT EXISTS smuggled text;
SQL
cat > "$MIGDIR/20260101000004_delta.sql" <<'SQL'
CREATE TABLE IF NOT EXISTS delta (id int primary key);
SQL
WARN_RUNNER="$(variant "DRIFT_POLICY=warn")"
run_migrations "$WARN_RUNNER"
check "exit 0" "0" "$RUN_RC"
contains "reports the drift" "drift:      1" "$RUN_OUT"
contains "says the edit never ran" "have NOT run and will never run" "$RUN_OUT"
check "smuggled column still NOT added" "0" \
  "$(sql "SELECT count(*) FROM information_schema.columns WHERE table_name='alpha' AND column_name='smuggled';")"
check "pending delta WAS applied under warn" "1" \
  "$(sql "SELECT count(*) FROM information_schema.tables WHERE table_name='delta';")"

# ─────────────────────────────────────────────────────────────────────────────
echo
echo "T9 — checksum is over contents only; the filename is not in the digest"
# T8 deliberately left alpha drifted. Clear it, or the default runner aborts at
# pre-flight and T9/T10 would exercise T8's case instead of their own.
cp "$WORK/alpha.orig" "$MIGDIR/20260101000001_alpha.sql"
cp "$MIGDIR/20260101000004_delta.sql" "$MIGDIR/20260101000005_epsilon.sql"
run_migrations
check "exit 0" "0" "$RUN_RC"
check "identical contents under a different name hash identically" \
  "$(sql "SELECT checksum FROM schema_migrations WHERE filename='20260101000004_delta.sql';")" \
  "$(sql "SELECT checksum FROM schema_migrations WHERE filename='20260101000005_epsilon.sql';")"

# ─────────────────────────────────────────────────────────────────────────────
echo
echo "T10 — a failing migration is not recorded, and its checksum is not banked"
cat > "$MIGDIR/20260101000006_zeta.sql" <<'SQL'
CREATE TABLE zeta (id int primary key);
SELECT this_function_does_not_exist();
SQL
run_migrations
check "exit 1" "1" "$RUN_RC"
contains "names the failed migration" "Migration failed: 20260101000006_zeta.sql" "$RUN_OUT"
check "not recorded in the ledger" "0" \
  "$(sql "SELECT count(*) FROM schema_migrations WHERE filename='20260101000006_zeta.sql';")"
rm "$MIGDIR/20260101000006_zeta.sql"

# ─────────────────────────────────────────────────────────────────────────────
echo
echo "T11 — a fresh database records every checksum from the start"
FRESH_DB="${TEST_DB}_fresh"
FRESH_URL="${ADMIN_URL%/*}/$FRESH_DB"
psql "$ADMIN_URL" -X -q -c "DROP DATABASE IF EXISTS $FRESH_DB;" >/dev/null 2>&1 || true
psql "$ADMIN_URL" -X -q -c "CREATE DATABASE $FRESH_DB;" >/dev/null
set +e
FRESH_OUT="$(DATABASE_URL="$FRESH_URL" MIGRATIONS_DIR="$MIGDIR" sh "$RUNNER" 2>&1)"
FRESH_RC=$?
set -e
check "exit 0" "0" "$FRESH_RC"
check "zero unverified rows on a fresh database" "0" \
  "$(psql "$FRESH_URL" -X -t -A -c "SELECT count(*) FROM schema_migrations WHERE checksum IS NULL;")"
not_contains "no unverified line printed" "unverified:" "$FRESH_OUT"
psql "$ADMIN_URL" -X -q -c "DROP DATABASE IF EXISTS $FRESH_DB;" >/dev/null 2>&1 || true

# ─────────────────────────────────────────────────────────────────────────────
echo
echo "=== $pass passed · $fail failed ==="
[ "$fail" -eq 0 ]
