#!/usr/bin/env bash
#
# Independent human safety-delivery witness.
#
#   scripts/witness/safety-human-delivery-witness.sh <EXPECTED_SHA>
#
# Run from the Mac Studio after:
#   1. #1671 is merged/deployed,
#   2. SAFETY_ALERT_PHONE or SAFETY_ALERT_SLACK_WEBHOOK_URL is intentionally set,
#   3. maia-sovereign has been recreated to read the env.
#
# This script never prints credential values or the configured destination.
# It proves provider acceptance; a human must still confirm receipt.
set -euo pipefail

HOST='soullab@minisforum'
EXPECTED_SHA="${1:-}"

die() { printf 'STOP: %s\n' "$*" >&2; exit 1; }
pass() { printf 'PASS · %s\n' "$*"; }

[ -n "$EXPECTED_SHA" ] || die "usage: $0 <EXPECTED_SHA>"

RUNNING=$(ssh "$HOST" 'docker exec maia-sovereign printenv GIT_COMMIT' | tr -d '[:space:]')
printf 'running=%s expected=%s\n' "${RUNNING:-<empty>}" "$EXPECTED_SHA"
[ -n "$RUNNING" ] || die 'could not read production GIT_COMMIT'
[ "$RUNNING" = "$EXPECTED_SHA" ] || die "running SHA differs; witness would be ambiguous"
pass 'artifact identity matches expected SHA'

printf '\n== config preflight ==\n'
set +e
ssh "$HOST" 'docker exec maia-sovereign node scripts/check-safety-human-delivery-config.mjs'
PRE=$?
set -e
[ "$PRE" -eq 0 ] || die 'independent human safety channel is not READY'
pass 'independent channel configuration is complete'

printf '\n== delivery witness ==\n'
set +e
ssh "$HOST" 'docker exec maia-sovereign node scripts/maia-monitor.js --test'
TEST_RC=$?
set -e
[ "$TEST_RC" -eq 0 ] || die "provider acceptance witness failed (exit $TEST_RC)"
pass 'provider accepted both DOWN and RECOVERED alerts'

cat <<EOF

MACHINE WITNESS COMPLETE

  artifact      $RUNNING
  config        READY
  provider      accepted DOWN + RECOVERED

One human confirmation remains:

  [ ] Both test alerts actually arrived at the designated human destination.

Only after that receipt is confirmed may E2 be closed as delivered.
The same configured independent channel can then be used to witness S1-S3
through their respective production paths.
EOF
