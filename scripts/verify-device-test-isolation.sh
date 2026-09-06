#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# OPS-DT-01 — Independent database isolation proof
# ═══════════════════════════════════════════════════════════════════════════════
# Run this on the EMPTY device-test stack, BEFORE any branch is deployed to it.
#
# Verdict vocabulary — the whole point of this script:
#
#   PASS          positive evidence obtained
#   FAIL          evidence contradicts isolation
#   INCONCLUSIVE  a required observation could not be made
#
#   NEVER: unknown / unreadable / unexecuted → PASS
#
# Both FAIL and INCONCLUSIVE exit non-zero. A human-readable "INCONCLUSIVE"
# followed by exit 0 would be automation-dangerous: a wrapper would read the
# command as passing.
#
# NOTE ON `set -e`: deliberately NOT used. Every probe here is expected to fail
# in some scenarios, and an early abort would skip later checks and suppress the
# final verdict — producing a correct exit code for the wrong reason and an
# unreadable report. Every external call is guarded instead.
#
# This script is read-only against production. It never writes there; it only
# looks for a sentinel that must be absent.
# ═══════════════════════════════════════════════════════════════════════════════
set -uo pipefail

PROD_CONTAINER="${PROD_CONTAINER:-maia-postgres}"
PROD_DB="${PROD_DB:-maia_consciousness}"
PROD_USER="${PROD_USER:-soullab}"
TEST_CONTAINER="${TEST_CONTAINER:-maia-postgres-device-test}"
TEST_DB="${TEST_DB:-maia_device_test}"
TEST_USER="${TEST_USER:-devicetest}"
APP_CONTAINER="${APP_CONTAINER:-maia-device-test}"

SENTINEL="ops_dt_01_sentinel_$(date +%s)"
n_pass=0; n_fail=0; n_inconc=0
NOTES=""

pass(){ printf '  %-42s %s\n' "$1" "PASS"; n_pass=$((n_pass+1)); }
fail(){ printf '  %-42s %s\n' "$1" "FAIL"; n_fail=$((n_fail+1)); NOTES="$NOTES\n  FAIL: $2"; }
inconc(){ printf '  %-42s %s\n' "$1" "INCONCLUSIVE"; n_inconc=$((n_inconc+1)); NOTES="$NOTES\n  INCONCLUSIVE: $2"; }

# Guarded query helpers — never abort, return empty on failure.
q_prod(){ docker exec "$PROD_CONTAINER" psql -U "$PROD_USER" -d "$PROD_DB" -tAc "$1" 2>/dev/null || true; }
q_test(){ docker exec "$TEST_CONTAINER" psql -U "$TEST_USER" -d "$TEST_DB" -tAc "$1" 2>/dev/null || true; }

echo "═══════════════════════════════════════════════════════════════"
echo " OPS-DT-01 — DEVICE-TEST DATABASE ISOLATION PROOF"
echo " $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "═══════════════════════════════════════════════════════════════"
echo

# ── POSITIVE CONTROL ─────────────────────────────────────────────────────────
# Prove the instrument works before treating failure-to-connect as evidence.
echo "POSITIVE CONTROL"
probe(){
  docker exec "$APP_CONTAINER" node -e '
    const net = require("net");
    const s = new net.Socket();
    let done = false;
    const finish = (c) => { if (!done) { done = true; s.destroy(); process.exit(c); } };
    s.setTimeout(4000);
    s.once("connect", () => finish(0));
    s.once("timeout", () => finish(1));
    s.once("error",   () => finish(1));
    s.connect(Number(process.argv[2]), process.argv[1]);
  ' "$1" "$2" >/dev/null 2>&1
}

PROBE_OK=0
if ! docker exec "$APP_CONTAINER" node -e 'process.exit(0)' >/dev/null 2>&1; then
  inconc "probe instrument available" "node unavailable in $APP_CONTAINER — cannot probe, so nothing about reachability can be concluded"
elif probe postgres-device-test 5432; then
  pass "test DB TCP reachable"; PROBE_OK=1
else
  inconc "test DB TCP reachable" "positive control failed — the probe cannot reach even the test database, so 'production unreachable' would prove nothing"
fi
echo

# ── IDENTITY ─────────────────────────────────────────────────────────────────
echo "IDENTITY"
TEST_ID=$(q_test "SELECT current_database()||'/'||system_identifier FROM pg_control_system();")
PROD_ID=$(q_prod "SELECT current_database()||'/'||system_identifier FROM pg_control_system();")

[ -n "$TEST_ID" ] && pass "test DB identity obtained" \
  || inconc "test DB identity obtained" "device-test database unreadable"
[ -n "$PROD_ID" ] && pass "production DB identity obtained" \
  || inconc "production DB identity obtained" "production unreadable — 'different from a value we could not obtain' is not evidence"

if [ -n "$TEST_ID" ] && [ -n "$PROD_ID" ]; then
  if [ "$TEST_ID" != "$PROD_ID" ]; then pass "identities differ"
  else fail "identities differ" "TEST AND PRODUCTION ARE THE SAME DATABASE"; fi
else
  inconc "identities differ" "cannot compare — at least one identity unreadable"
fi
echo "    test: ${TEST_ID:-<unreadable>}"
echo "    prod: ${PROD_ID:-<unreadable>}"
echo

# ── CONNECTION TARGET ────────────────────────────────────────────────────────
echo "CONNECTION TARGET"
APP_DB=$(docker exec "$APP_CONTAINER" sh -c 'echo "$DATABASE_URL"' 2>/dev/null || true)
if [ -z "$APP_DB" ]; then
  inconc "app DATABASE_URL readable" "could not read DATABASE_URL from $APP_CONTAINER"
else
  case "$APP_DB" in
    *postgres-device-test:5432/maia_device_test*)
      pass "app targets the isolated database" ;;
    *) fail "app targets the isolated database" "DATABASE_URL does not point at the isolated database" ;;
  esac
  echo "    $(echo "$APP_DB" | sed 's/:[^:@]*@/:***@/')"
fi
echo

# ── NETWORK ──────────────────────────────────────────────────────────────────
echo "NETWORK"
if [ "$PROBE_OK" -ne 1 ]; then
  inconc "production postgres TCP unreachable" "probe not verified working — a negative result would be meaningless"
else
  REACHABLE=""
  for h in maia-postgres postgres; do
    probe "$h" 5432 && REACHABLE="$REACHABLE $h"
  done
  if [ -n "$REACHABLE" ]; then
    fail "production postgres TCP unreachable" "PRODUCTION POSTGRES REACHABLE from the app container:$REACHABLE — topological isolation is broken"
  else
    pass "production postgres TCP unreachable"
  fi
fi
echo

# ── SENTINEL ─────────────────────────────────────────────────────────────────
echo "SENTINEL"
CREATED=$(q_test "CREATE TABLE IF NOT EXISTS $SENTINEL (id int); SELECT 'ok';")
if [ -n "$CREATED" ]; then
  pass "created in test"
  SEEN=$(q_test "SELECT count(*) FROM information_schema.tables WHERE table_name='$SENTINEL';")
  [ "$SEEN" = "1" ] && pass "visible in test" \
    || inconc "visible in test" "sentinel not observable in the test database"

  PROD_SEEN=$(q_prod "SELECT count(*) FROM information_schema.tables WHERE table_name='$SENTINEL';")
  if [ -z "$PROD_SEEN" ]; then
    inconc "absent from production" "could not query production to confirm absence"
  elif [ "$PROD_SEEN" = "0" ]; then
    pass "absent from production"
  else
    fail "absent from production" "SENTINEL FOUND IN PRODUCTION — environments are NOT isolated"
  fi

  DROPPED=$(q_test "DROP TABLE IF EXISTS $SENTINEL; SELECT 'ok';")
  [ -n "$DROPPED" ] && pass "removed from test" \
    || inconc "removed from test" "sentinel $SENTINEL may remain — remove it manually"
else
  inconc "created in test" "could not create the sentinel; crossover was never tested"
  inconc "visible in test" "sentinel never created"
  inconc "absent from production" "sentinel never created"
  inconc "removed from test" "sentinel never created"
fi
echo

# ── MIGRATION BOUNDARY ───────────────────────────────────────────────────────
echo "MIGRATION BOUNDARY"
PROD_CAP=$(q_prod "SELECT count(*) FROM information_schema.tables WHERE table_name='session_captures';")
if [ -z "$PROD_CAP" ]; then
  inconc "production session_captures absent" "could not query production"
elif [ "$PROD_CAP" = "0" ]; then
  pass "production session_captures absent"
else
  fail "production session_captures absent" "session_captures EXISTS IN PRODUCTION — do NOT assume this leaked from OPS-DT-01; establish provenance first (it may have arrived via another canonical lane). Either way this proof can no longer establish the expected clean baseline."
fi
echo

# ── VERDICT ──────────────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════════"
printf ' %-42s %s\n' "checks passed" "$n_pass"
printf ' %-42s %s\n' "checks failed" "$n_fail"
printf ' %-42s %s\n' "checks inconclusive" "$n_inconc"
[ -n "$NOTES" ] && { echo; echo " Detail:"; printf '%b\n' "$NOTES"; }
echo

if [ "$n_fail" -gt 0 ]; then
  VERDICT="FAIL"; CODE=1
elif [ "$n_inconc" -gt 0 ]; then
  VERDICT="INCONCLUSIVE"; CODE=1
else
  VERDICT="PASS"; CODE=0
fi
printf ' %-42s %s\n' "FINAL VERDICT" "$VERDICT"
printf ' %-42s %s\n' "exit code" "$CODE"
echo "═══════════════════════════════════════════════════════════════"

if [ "$CODE" -ne 0 ]; then
  echo
  echo "ISOLATION NOT PROVEN — do not deploy any branch to this stack."
fi
exit "$CODE"
