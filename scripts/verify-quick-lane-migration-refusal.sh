#!/usr/bin/env bash
set -euo pipefail

FILE="${1:-scripts/pre-deploy-gate.sh}"

extract_function() {
  local name="$1"
  awk -v name="$name" '
    $0 ~ "^" name "\\(\\)" {flag=1}
    flag {print}
    flag && /^}/ {exit}
  ' "$FILE"
}

FUNC="$(extract_function gate_quick_lane_no_pending_migrations)"
[ -n "$FUNC" ] || { echo "FAIL function missing" >&2; exit 1; }

log_block() { printf '%s\n' "$1" >&2; }
log_ok() { :; }

deploy_ctx_compose() {
  printf 'database/migrations/20990101000000_pending.sql\n'
}
eval "$FUNC"

set +e
OUT="$(gate_quick_lane_no_pending_migrations 2>&1)"
RC=$?
set -e
[ "$RC" -ne 0 ] || { echo "FAIL pending migration advanced"; exit 1; }
grep -Fq 'quick deploy-maia may not swap the reader first' <<<"$OUT" \
  || { echo "FAIL refusal reason missing"; exit 1; }
grep -Fq '20990101000000_pending.sql' <<<"$OUT" \
  || { echo "FAIL pending path missing"; exit 1; }
echo "PASS  pending migration refuses quick lane"

deploy_ctx_compose() { :; }
gate_quick_lane_no_pending_migrations
echo "PASS  empty pending set permits quick lane"

printf 'QUICK_LANE_MIGRATION_REFUSAL=PASS\n'
