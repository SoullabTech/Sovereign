#!/bin/sh
# PT-3 §V (B14) — migration-authority verifier. RUNS ON THE PRODUCTION HOST. Read-only. FAIL-CLOSED.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §V.
#
#   ssh soullab@minisforum 'sh -s' < scripts/witness/pt3-verify-migration-authority.sh
#
# ⭐ WHY THIS EXISTS. The preflight used to NOTE a missing migration credential and continue toward
# PREFLIGHT PASSED. Its absence means the migration would run with an EMPTY credential — so an
# instrument that says "ready" while it is missing is a false green. This refuses instead.
#
# ⭐ B28 — the credential no longer arrives by interpolation (${MIGRATE_DATABASE_URL} in .env). It
# arrives as a REQUIRED per-service env_file, .env.migrate, because interpolation resolves from
# --env-file .env.production under the ordinary deploy path — exactly where owner authority must no
# longer be. This verifier follows the architecture; an instrument left checking the old mechanism
# would ABORT a correctly staged cutover and, worse, could pass a wrongly staged one.
#
# It resolves the value through Compose itself rather than by reading a file, because what matters
# is what the migrate service will actually receive. It prints the ROLE, never the URL.

set -eu
PROJECT="${PROJECT_DIR:-$HOME/MAIA-SOVEREIGN}"
cd "$PROJECT"
fail=0

# §VI (B37) — service-specific owner custody is REQUIRED, not "missing but continue". Both files
# must exist, be non-empty, carry their key, and be readable only by their owner.
check_custody() {  # file · required key · which service depends on it
  if [ ! -s "$1" ]; then
    echo "ABORT   $1 is missing or empty — $3 would receive no credential"; fail=1; return
  fi
  if ! grep -qE "^$2=." "$1"; then
    echo "ABORT   $1 does not carry $2 — $3 would receive no credential"; fail=1; return
  fi
  MODE=$(stat -c '%a' "$1" 2>/dev/null || stat -f '%OLp' "$1" 2>/dev/null || echo '?')
  case "$MODE" in
    600|400) echo "OK      $1 carries $2 (mode $MODE)" ;;
    *) echo "ABORT   $1 has mode $MODE — owner material must not be group- or world-readable"; fail=1 ;;
  esac
}
check_custody "$PROJECT/.env.migrate"  DATABASE_URL      "the migrate service"
check_custody "$PROJECT/.env.postgres" POSTGRES_PASSWORD "the postgres service"

# The universal file must not have acquired owner material of any form.
for key in DATABASE_URL POSTGRES_PASSWORD MIGRATE_DATABASE_URL; do
  if grep -qE "^$key=" "$PROJECT/.env.production" 2>/dev/null; then
    echo "NOTE    .env.production still carries $key — expected before activation, a defect after it"
  fi
done

if grep -q '\.env\.migrate' docker-compose.production.yml 2>/dev/null \
   && grep -q '\.env\.postgres' docker-compose.production.yml 2>/dev/null; then
  echo "OK      the production Compose declares both service-specific owner env_files"
else
  echo "ABORT   the production checkout's Compose has not been brought forward"
  echo "        It must declare env_file .env.migrate (migrate) and .env.postgres (postgres)."
  fail=1
fi

# What will the migrate service actually receive? Ask Compose, not the file.
RESOLVED=$(docker compose --env-file "$PROJECT/.env.production" -f docker-compose.production.yml \
  --profile migrate config 2>/dev/null \
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
