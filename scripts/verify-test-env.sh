#!/usr/bin/env bash
# verify-test-env.sh — FAIL-CLOSED guard for the authenticated mobile verification loop.
#
# Refuses to proceed unless the environment is an isolated, distinctly-named LOCAL TEST
# target. The local dev DB shares the production DB *name* (maia_consciousness), so
# operational separation is not enough — the approved target must be UNMISTAKABLE, and
# it is asserted several independent ways (name, role, env-var, API, stamp, live owner).
#
# See docs/engineering/MOBILE_CONVERSATION_VERIFICATION_LOOP.md §2.1 (amended 2026-07-24).
# Exit 0 only if ALL checks pass; any mismatch aborts BEFORE a member/session is created.
set -euo pipefail

APPROVED_TEST_DB="maia_consciousness_test"
APPROVED_TEST_ROLE="maia_test_user"
PROD_MARKERS="soullab.life"
STAGING_MARKERS="staging.soullab.life :8090"

fail() { echo "🚫 TEST-ENV GUARD ABORT: $1" >&2; exit 1; }

# --- 1. explicit TEST_DATABASE_URL env var ---
[ -n "${TEST_DATABASE_URL:-}" ] || fail "TEST_DATABASE_URL is not set"

# --- 2. DB name is EXACTLY the approved test DB (and never the prod-named DB) ---
DB_NAME="$(printf '%s' "$TEST_DATABASE_URL" | sed -E 's#^.*/([^/?]+)(\?.*)?$#\1#')"
[ "$DB_NAME" = "$APPROVED_TEST_DB" ] || fail "database '$DB_NAME' != approved '$APPROVED_TEST_DB'"
case "$TEST_DATABASE_URL" in
  */maia_consciousness|*/maia_consciousness\?*) fail "DSN targets the production-named DB maia_consciousness" ;;
esac

# --- 3. DB role is the dedicated test role (independent of the DB name) ---
DB_USER="$(printf '%s' "$TEST_DATABASE_URL" | sed -E 's#^[a-z]+://([^:/@]+).*#\1#')"
[ "$DB_USER" = "$APPROVED_TEST_ROLE" ] || fail "DSN role '$DB_USER' != approved '$APPROVED_TEST_ROLE'"

# --- 4/5/6. API target present, LOCAL, not production, not shared staging ---
API="${NEXT_PUBLIC_API_BASE_URL:-}"
[ -n "$API" ] || fail "NEXT_PUBLIC_API_BASE_URL not set (empty falls through to PRODUCTION in apiBaseUrl())"
for h in $PROD_MARKERS;    do case "$API" in *"$h"*) fail "API target '$API' points at PRODUCTION ($h)";; esac; done
for m in $STAGING_MARKERS; do case "$API" in *"$m"*) fail "API target '$API' points at SHARED STAGING ($m)";; esac; done
case "$API" in
  http://localhost*|https://localhost*|http://127.0.0.1*|https://127.0.0.1*|\
  http://10.*|http://192.168.*|http://172.1[6-9].*|http://172.2[0-9].*|http://172.3[01].*) : ;;
  *) fail "API target '$API' is not a recognized LOCAL/LAN address" ;;
esac

# --- 7. commit/build stamp present and truthful ---
STAMP="${NEXT_PUBLIC_GIT_COMMIT:-${GIT_COMMIT:-}}"
[ -n "$STAMP" ] || fail "no commit stamp (NEXT_PUBLIC_GIT_COMMIT / GIT_COMMIT)"
case "$STAMP" in unknown|dev|UNSTAMPED) fail "commit stamp is untruthful ('$STAMP')";; esac

# --- 8. LIVE (best-effort): target DB exists and is owned by the dedicated test role ---
# Independent of every string check above: verifies the actual database, not the DSN text.
if command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' 2>/dev/null | grep -qx maia-postgres; then
  OWNER="$(docker exec maia-postgres psql -U soullab -d postgres -tAc "SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null | tr -d '[:space:]')"
  [ -n "$OWNER" ] || fail "live check: database '$DB_NAME' does not exist"
  [ "$OWNER" = "$APPROVED_TEST_ROLE" ] || fail "live check: '$DB_NAME' owned by '$OWNER', not $APPROVED_TEST_ROLE"
  LIVE="verified(owner=$OWNER)"
else
  LIVE="skipped(no local docker/maia-postgres)"
fi

# --- 9. visible LOCAL TEST identity ---
echo "✅ LOCAL TEST — db=$DB_NAME · role=$DB_USER · api=$API · commit=$STAMP · live=$LIVE"
echo "   environment: LOCAL TEST (isolated). NOT production. NOT shared staging."
exit 0
