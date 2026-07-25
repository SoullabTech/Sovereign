#!/usr/bin/env bash
# verify-test-env.sh — FAIL-CLOSED guard for the authenticated mobile verification loop.
#
# Refuses to proceed unless the environment is an isolated, distinctly-named LOCAL TEST
# target. This is the structural safeguard that makes a synthetic test identity safe:
# the local dev DB shares the production DB *name* (maia_consciousness), so operational
# separation is not enough — the approved target must be UNMISTAKABLY named.
#
# See docs/engineering/MOBILE_CONVERSATION_VERIFICATION_LOOP.md §2.1 (amended 2026-07-24).
# Exit 0 only if ALL checks pass; any mismatch aborts BEFORE a member/session is created.
set -euo pipefail

APPROVED_TEST_DB="maia_consciousness_test"
PROD_MARKERS="soullab.life"
STAGING_MARKERS="staging.soullab.life :8090"

fail() { echo "🚫 TEST-ENV GUARD ABORT: $1" >&2; exit 1; }

# --- 1. TEST_DATABASE_URL set, and DB name is EXACTLY the approved test DB ---
[ -n "${TEST_DATABASE_URL:-}" ] || fail "TEST_DATABASE_URL is not set"
DB_NAME="$(printf '%s' "$TEST_DATABASE_URL" | sed -E 's#^.*/([^/?]+)(\?.*)?$#\1#')"
[ "$DB_NAME" = "$APPROVED_TEST_DB" ] || fail "database '$DB_NAME' != approved '$APPROVED_TEST_DB' (refusing prod/shared DB)"
# defense-in-depth: never the production-named DB even as a substring target
case "$TEST_DATABASE_URL" in
  */maia_consciousness|*/maia_consciousness\?*) fail "DSN targets the production-named DB maia_consciousness" ;;
esac

# --- 2/4/5. API target present, LOCAL, not production, not shared staging ---
API="${NEXT_PUBLIC_API_BASE_URL:-}"
[ -n "$API" ] || fail "NEXT_PUBLIC_API_BASE_URL not set (empty falls through to PRODUCTION in apiBaseUrl())"
for h in $PROD_MARKERS;    do case "$API" in *"$h"*) fail "API target '$API' points at PRODUCTION ($h)";; esac; done
for m in $STAGING_MARKERS; do case "$API" in *"$m"*) fail "API target '$API' points at SHARED STAGING ($m)";; esac; done
case "$API" in
  http://localhost*|https://localhost*|http://127.0.0.1*|https://127.0.0.1*|\
  http://10.*|http://192.168.*|http://172.1[6-9].*|http://172.2[0-9].*|http://172.3[01].*) : ;;
  *) fail "API target '$API' is not a recognized LOCAL/LAN address" ;;
esac

# --- 6. commit/build stamp present and truthful ---
STAMP="${NEXT_PUBLIC_GIT_COMMIT:-${GIT_COMMIT:-}}"
[ -n "$STAMP" ] || fail "no commit stamp (NEXT_PUBLIC_GIT_COMMIT / GIT_COMMIT)"
case "$STAMP" in unknown|dev|UNSTAMPED) fail "commit stamp is untruthful ('$STAMP')";; esac

# --- 3. visible LOCAL TEST identity ---
echo "✅ LOCAL TEST — db=$DB_NAME · api=$API · commit=$STAMP"
echo "   environment: LOCAL TEST (isolated). NOT production. NOT shared staging."
exit 0
