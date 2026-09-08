#!/bin/sh
# PT-3 §V (B14) — migration-authority verifier. RUNS ON THE PRODUCTION HOST. Read-only. FAIL-CLOSED.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §V.
#
#   ssh soullab@minisforum 'sh -s' < scripts/witness/pt3-verify-migration-authority.sh
#
# ⭐ WHY THIS EXISTS. The preflight used to NOTE a missing MIGRATE_DATABASE_URL and continue toward
# PREFLIGHT PASSED. Once the canonical Compose sources the migrate service's DATABASE_URL from that
# variable, its absence means the migration would run with an EMPTY credential — so an instrument
# that says "ready" while it is missing is a false green. This refuses instead.
#
# It resolves the value through Compose itself rather than by reading a file, because what matters
# is what the migrate service will actually receive. It prints the ROLE, never the URL.

set -eu
PROJECT="${PROJECT_DIR:-$HOME/MAIA-SOVEREIGN}"
cd "$PROJECT"
fail=0

if grep -qE '^MIGRATE_DATABASE_URL=' .env 2>/dev/null; then
  echo "OK      MIGRATE_DATABASE_URL is staged in .env"
else
  echo "ABORT   MIGRATE_DATABASE_URL is absent from .env"
  echo "        The canonical Compose sources migrate's DATABASE_URL from it. Run"
  echo "        pt3-stage-migration-authority.sh first. Migration is NOT ready."
  fail=1
fi

if grep -q 'DATABASE_URL: ${MIGRATE_DATABASE_URL' docker-compose.production.yml 2>/dev/null; then
  echo "OK      the canonical Compose sources migrate's authority from MIGRATE_DATABASE_URL"
else
  echo "ABORT   the production checkout's Compose has not been brought forward"
  fail=1
fi

# What will the migrate service actually receive? Ask Compose, not the file.
RESOLVED=$(docker compose -f docker-compose.production.yml --profile migrate config 2>/dev/null \
  | awk '/^  migrate:/,/^  [a-z]/' | grep -E '^\s+DATABASE_URL:' | head -1 | cut -d: -f2- | tr -d ' ' || true)
if [ -n "$RESOLVED" ] && [ "$RESOLVED" != '""' ]; then
  ROLE=$(printf '%s' "$RESOLVED" | sed -n 's#^[a-z+]*://\([^:@/]*\).*#\1#p')
  echo "OK      migrate resolves a non-empty DATABASE_URL (role: ${ROLE:-<unparsed>})"
else
  echo "ABORT   migrate would receive an EMPTY DATABASE_URL — the migration would fail or misapply"
  fail=1
fi

# maia_app must NOT exist yet: the migration creates it. Its presence means a prior run.
EXISTS=$(docker exec maia-postgres psql -U soullab -d maia_consciousness -tAc \
  "SELECT count(*) FROM pg_roles WHERE rolname='maia_app'" 2>/dev/null || echo '?')
case "$EXISTS" in
  0) echo "OK      maia_app does not exist yet — the migration will create it (§IV)" ;;
  1) echo "NOTE    maia_app already exists — the migration has run before; verify before repeating" ;;
  *) echo "NOTE    could not read pg_roles" ;;
esac

echo
[ "$fail" -eq 0 ] && { echo "MIGRATION READY"; exit 0; }
echo "NOT READY — $fail condition(s). Do not run the migration."; exit 1
