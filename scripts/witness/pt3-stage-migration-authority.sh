#!/bin/sh
# PT-3 §IV — PHASE 1: stage migration authority. RUNS ON THE PRODUCTION HOST. PRE-MIGRATION.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §III–§V (B13, B14, B15, B16).
#
#   ssh soullab@minisforum 'sh -s' < scripts/witness/pt3-stage-migration-authority.sh
#
# ⭐ WHY THIS IS A SEPARATE SCRIPT (B13). The earlier single installer did two acts that belong on
# OPPOSITE SIDES of the migration: it preserved migration authority, and it configured `maia_app`.
# But `maia_app` is CREATED BY the migration (20260908000001, line 38), so configuring it first was
# not merely early — it could not succeed. The documented cutover could not complete in its order.
#
# The temporal law is now explicit:
#
#   preserve migration authority → create constrained role → credential it →
#   remove owner runtime authority → restart runtime
#
# THIS SCRIPT DOES ONLY THE FIRST STEP. It:
#   · copies the owner DATABASE_URL from .env.production into .env as MIGRATE_DATABASE_URL
#   · LEAVES DATABASE_URL in .env.production — runtime keeps working, unchanged
#   · does NOT touch maia_app, which does not exist yet
#   · does NOT restart anything
#   · prints no credential

set -eu

PROJECT="${PROJECT_DIR:-$HOME/MAIA-SOVEREIGN}"
ENVPROD="$PROJECT/.env.production"
ENVCOMPOSE="$PROJECT/.env"

[ -r "$ENVPROD" ] || { echo "ABORT — $ENVPROD not readable." >&2; exit 1; }
cd "$PROJECT"

# The destination must not be source-controlled (§X.3).
git check-ignore -q .env 2>/dev/null || {
  echo "ABORT — .env is not gitignored. Refusing to write a credential to a tracked path." >&2; exit 1; }
echo "OK    .env is gitignored"

OWNER_URL=$(grep -E '^DATABASE_URL=' "$ENVPROD" | head -1 | cut -d= -f2- || true)
if [ -z "$OWNER_URL" ]; then
  echo "ABORT — no DATABASE_URL in .env.production. Nothing to preserve; is this already staged?" >&2
  exit 1
fi

umask 077
touch "$ENVCOMPOSE"; chmod 600 "$ENVCOMPOSE"
TMP=$(mktemp "$PROJECT/.env.pt3.XXXXXX")
grep -v -E '^MIGRATE_DATABASE_URL=' "$ENVCOMPOSE" > "$TMP" 2>/dev/null || true
printf 'MIGRATE_DATABASE_URL=%s\n' "$OWNER_URL" >> "$TMP"
chmod 600 "$TMP"; mv "$TMP" "$ENVCOMPOSE"
unset OWNER_URL

echo "OK    MIGRATE_DATABASE_URL staged in .env (mode $(stat -c '%a' "$ENVCOMPOSE" 2>/dev/null || echo '?'))"
echo "OK    .env.production is UNCHANGED — runtime keeps owner authority until the role exists"
echo
echo "Nothing about maia_app was attempted: the migration creates it. Nothing was restarted."
echo "Next: bring the canonical Compose forward, then run the migration-authority verifier."
