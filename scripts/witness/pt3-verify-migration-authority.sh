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

if [ -z "$RESOLVED" ] || [ "$RESOLVED" = '""' ]; then
  echo "ABORT   migrate would receive an EMPTY DATABASE_URL — the migration would fail or misapply"
  fail=1
else
  ROLE=$(printf '%s' "$RESOLVED" | sed -n 's#^[a-z+]*://\([^:@/]*\).*#\1#p')
  # §V (B20) — a non-empty credential is not the test. It must be the ACTUAL custody authority.
  # Derived from the protected tier's own ownership rather than a hardcoded name, so the check
  # follows the boundary if the owner is ever something other than `soullab`.
  OWNER=$(docker exec maia-postgres psql -U soullab -d "${PT3_DB:-maia_consciousness}" -tAc \
    "SELECT tableowner FROM pg_tables WHERE tablename='manuscript_sections'" 2>/dev/null || true)
  if [ -z "$OWNER" ]; then
    echo "ABORT   could not read the protected tier's owner — cannot prove migrate holds custody authority"
    fail=1
  elif [ "$ROLE" = "$OWNER" ]; then
    echo "OK      migrate resolves the custody authority (role: $ROLE = owner of manuscript_sections)"
  else
    echo "ABORT   migrate would run as '$ROLE', which is NOT the protected tier's owner ('$OWNER')"
    echo "        A mistakenly staged constrained or unrelated credential must never read as ready."
    fail=1
  fi
fi

# §V (B20) — maia_app must be ABSENT. Production witnessed it absent; its unexpected presence means
# the observed state has changed or a partial act occurred. That is a reconciliation question, not
# a note, and this instrument must not permit readiness through it.
EXISTS=$(docker exec maia-postgres psql -U soullab -d "${PT3_DB:-maia_consciousness}" -tAc \
  "SELECT count(*) FROM pg_roles WHERE rolname='maia_app'" 2>/dev/null || echo '?')
case "$EXISTS" in
  0) echo "OK      maia_app is absent — the migration will create it (§IV)" ;;
  1) echo "ABORT   maia_app ALREADY EXISTS before the first PT-3 migration"
     echo "        Production witnessed it absent. Either the state has changed since the census or a"
     echo "        partial act occurred. RECONCILIATION REQUIRED — do not migrate."
     fail=1 ;;
  *) echo "ABORT   could not read pg_roles — readiness cannot be established"; fail=1 ;;
esac

echo
[ "$fail" -eq 0 ] && { echo "MIGRATION READY"; exit 0; }
echo "NOT READY — $fail condition(s). Do not run the migration."; exit 1
