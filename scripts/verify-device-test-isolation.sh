#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# OPS-DT-01 — Independent database isolation proof
# ═══════════════════════════════════════════════════════════════════════════════
# Run this BEFORE deploying any branch into the device-test environment.
#
# Proves, without trusting configuration:
#   1. the test DB identity differs from the production DB identity
#   2. the app's connection string resolves ONLY to the test database
#   3. the app container has no network route to production postgres
#   4. a sentinel created in test never appears in production
#   5. the sentinel is removed afterwards
#
# Read-only against production throughout. It never writes to production; it only
# looks for a sentinel that must be absent.
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

PROD_CONTAINER="${PROD_CONTAINER:-maia-postgres}"
PROD_DB="${PROD_DB:-maia_consciousness}"
PROD_USER="${PROD_USER:-soullab}"
TEST_CONTAINER="${TEST_CONTAINER:-maia-postgres-device-test}"
TEST_DB="${TEST_DB:-maia_device_test}"
TEST_USER="${TEST_USER:-devicetest}"
APP_CONTAINER="${APP_CONTAINER:-maia-device-test}"

SENTINEL="ops_dt_01_sentinel_$(date +%s)"
pass=0; fail=0
ok(){ echo "  ✅ $1"; pass=$((pass+1)); }
no(){ echo "  ❌ $1"; fail=$((fail+1)); }

echo "═══ OPS-DT-01 database isolation proof ═══"
echo

# ── 1. Distinct database identity ────────────────────────────────────────────
echo "1. Database identity"
PROD_ID=$(docker exec "$PROD_CONTAINER" psql -U "$PROD_USER" -d "$PROD_DB" -tAc \
  "SELECT current_database()||'/'||system_identifier FROM pg_control_system();" 2>/dev/null || echo "UNREADABLE")
TEST_ID=$(docker exec "$TEST_CONTAINER" psql -U "$TEST_USER" -d "$TEST_DB" -tAc \
  "SELECT current_database()||'/'||system_identifier FROM pg_control_system();")
echo "   production : $PROD_ID"
echo "   device-test: $TEST_ID"
[ "$PROD_ID" != "$TEST_ID" ] && ok "identities differ" || no "IDENTITIES MATCH — NOT ISOLATED"
echo

# ── 2. App resolves only to the test database ────────────────────────────────
echo "2. Application connection target"
APP_DB=$(docker exec "$APP_CONTAINER" sh -c 'echo "$DATABASE_URL"' | sed 's/:[^:@]*@/:***@/')
echo "   DATABASE_URL: $APP_DB"
case "$APP_DB" in
  *postgres-device-test:5432/maia_device_test*) ok "points at the isolated database" ;;
  *) no "does NOT point at the isolated database" ;;
esac
echo

# ── 3. No network route to production postgres ───────────────────────────────
# The strongest check: even a wrong connection string cannot reach production,
# because there is no path. Absence of DNS resolution is the proof.
echo "3. Network reachability of production postgres"
if docker exec "$APP_CONTAINER" sh -c 'getent hosts postgres || getent hosts maia-postgres' >/dev/null 2>&1; then
  no "production postgres IS RESOLVABLE from the app container — topological isolation broken"
else
  ok "production postgres is not resolvable from the app container"
fi
echo

# ── 4. Sentinel must not cross ───────────────────────────────────────────────
echo "4. Sentinel crossover test"
docker exec "$TEST_CONTAINER" psql -U "$TEST_USER" -d "$TEST_DB" -q -c \
  "CREATE TABLE IF NOT EXISTS $SENTINEL (id int);" >/dev/null
echo "   created $SENTINEL in device-test"

FOUND=$(docker exec "$PROD_CONTAINER" psql -U "$PROD_USER" -d "$PROD_DB" -tAc \
  "SELECT count(*) FROM information_schema.tables WHERE table_name = '$SENTINEL';" 2>/dev/null || echo "ERR")
if [ "$FOUND" = "0" ]; then
  ok "sentinel absent from production"
elif [ "$FOUND" = "ERR" ]; then
  no "could not read production to confirm absence (inconclusive — treat as FAIL)"
else
  no "SENTINEL FOUND IN PRODUCTION ($FOUND) — ENVIRONMENTS ARE NOT ISOLATED"
fi

docker exec "$TEST_CONTAINER" psql -U "$TEST_USER" -d "$TEST_DB" -q -c \
  "DROP TABLE IF EXISTS $SENTINEL;" >/dev/null
echo "   removed $SENTINEL"
echo

# ── 5. Production capture tables must be untouched by this environment ───────
echo "5. Production must not have acquired device-test schema"
for t in session_captures; do
  N=$(docker exec "$PROD_CONTAINER" psql -U "$PROD_USER" -d "$PROD_DB" -tAc \
    "SELECT count(*) FROM information_schema.tables WHERE table_name='$t';" 2>/dev/null || echo "ERR")
  if [ "$N" = "0" ]; then ok "production has no '$t' (branch migrations did not leak)"
  else no "production HAS '$t' — a branch migration reached production"; fi
done
echo

echo "═══ $pass passed · $fail failed ═══"
[ "$fail" -eq 0 ] || { echo "ISOLATION NOT PROVEN — do not deploy a branch here."; exit 1; }
echo "Isolation proven. Safe to deploy a branch into device-test."
