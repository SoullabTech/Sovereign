#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# OPS-DT-01 — run the isolation proof and capture it as durable evidence
# ═══════════════════════════════════════════════════════════════════════════════
# Wraps scripts/verify-device-test-isolation.sh without altering it. The proof is
# the instrument; this only stamps provenance and persists the result.
#
# A terminal paste is transient and unbound to any commit. During PR #1093 a
# check_suite.completed event arrived for a stale head_sha and would have read as
# proof for a newer head; a green isolation report that cannot be bound to a
# commit carries the same defect.
#
# Every field that cannot be read is recorded as <unreadable>, never left blank,
# so a gap in the evidence is visible rather than ambiguous.
# ═══════════════════════════════════════════════════════════════════════════════
set -uo pipefail

APP_CONTAINER="${APP_CONTAINER:-maia-device-test}"
TEST_CONTAINER="${TEST_CONTAINER:-maia-postgres-device-test}"
TEST_DB="${TEST_DB:-maia_device_test}"
TEST_USER="${TEST_USER:-devicetest}"
OUT_DIR="${OUT_DIR:-docs/ops/evidence}"

# Read a value; empty OR failed both become <unreadable>.
read_or_unknown(){ local v; v=$( "$@" 2>/dev/null || true ); printf '%s' "${v:-<unreadable>}"; }

STAMP=$(date -u +%Y%m%dT%H%M%SZ)
EVIDENCE="$OUT_DIR/OPS-DT-01-isolation-$STAMP.txt"
mkdir -p "$OUT_DIR"

OPS_DT_SHA=$(read_or_unknown git rev-parse --short HEAD)
CANONICAL_SHA=$(read_or_unknown git rev-parse --short origin/clean-main-no-secrets)
CONTAINER_SHA=$(read_or_unknown docker exec "$APP_CONTAINER" printenv GIT_COMMIT)
DEPLOY_LANE=$(read_or_unknown docker exec "$APP_CONTAINER" printenv DEPLOY_LANE)
TEST_DB_ID=$(read_or_unknown docker exec "$TEST_CONTAINER" psql -U "$TEST_USER" -d "$TEST_DB" -tAc \
  "SELECT current_database()||'/'||system_identifier FROM pg_control_system();")

{
  echo "OPS-DT-01 ISOLATION PROOF — EVIDENCE RECORD"
  echo "═══════════════════════════════════════════════════════════════"
  printf ' %-18s %s\n' "captured_at_utc"  "$(date -u +%FT%TZ)"
  printf ' %-18s %s\n' "ops_dt_sha"       "$OPS_DT_SHA"
  printf ' %-18s %s\n' "canonical_sha"    "$CANONICAL_SHA"
  printf ' %-18s %s\n' "container_sha"    "$CONTAINER_SHA"
  printf ' %-18s %s\n' "deploy_lane"      "$DEPLOY_LANE"
  printf ' %-18s %s\n' "hostname"         "${DEVICE_TEST_HOST:-<unset>}"
  printf ' %-18s %s\n' "test_db_identity" "$TEST_DB_ID"
  echo "═══════════════════════════════════════════════════════════════"
  echo
  scripts/verify-device-test-isolation.sh
  RC=$?
  echo
  printf ' %-18s %s\n' "shell_exit_code" "$RC"
  exit "$RC"
} 2>&1 | tee "$EVIDENCE"
RC=${PIPESTATUS[0]}

echo
echo "saved: $EVIDENCE"
[ "$RC" -eq 0 ] || echo "NOT PROVEN — do not deploy any branch to this stack."
exit "$RC"
