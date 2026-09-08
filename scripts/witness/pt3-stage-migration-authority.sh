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
#   · copies the owner DATABASE_URL into .env.migrate and POSTGRES_PASSWORD into .env.postgres
#   · ABORTS if either cannot be positively established (B37) — before any outage begins
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
for f in .env.migrate .env.postgres; do
  git check-ignore -q "$f" 2>/dev/null || {
    echo "ABORT — $f is not gitignored. Refusing to write a credential to a tracked path." >&2; exit 1; }
done
echo "OK    .env.migrate and .env.postgres are gitignored"

OWNER_URL=$(grep -E '^DATABASE_URL=' "$ENVPROD" | head -1 | cut -d= -f2- || true)
OWNER_PW=$(grep -E '^POSTGRES_PASSWORD=' "$ENVPROD" | head -1 | cut -d= -f2- || true)
if [ -z "$OWNER_URL" ]; then
  echo "ABORT — no DATABASE_URL in .env.production. Nothing to preserve; is this already staged?" >&2
  exit 1
fi

umask 077
# §VI (B28) — owner authority moves into SERVICE-SPECIFIC custody, not Compose interpolation.
# deploy-context.sh passes `--env-file .env.production`, so an interpolated variable would resolve
# from the universal file under the ordinary deploy path — precisely where it must not be.
printf 'DATABASE_URL=%s\n' "$OWNER_URL" > "$PROJECT/.env.migrate"
chmod 600 "$PROJECT/.env.migrate"
# ⭐ B37 — FAIL CLOSED, BEFORE THE OUTAGE. This used to WARN, write an EMPTY .env.postgres and
# continue. Under the ratified credential law a required service-specific owner credential cannot be
# "missing, but continue": .env.postgres is a REQUIRED env_file, so an empty one means the database
# comes back with no owner password — discovered mid-outage, after the point of no return, on the
# strength of a warning printed several steps earlier. No production boundary may depend on somebody
# noticing a warning. Aborting here costs nothing: not one thing has been mutated yet.
if [ -z "$OWNER_PW" ]; then
  echo "ABORT — no POSTGRES_PASSWORD in .env.production. Postgres owner custody cannot be preserved," >&2
  echo "        so it must not be half-established. Nothing has been changed; nothing is quiesced." >&2
  rm -f "$PROJECT/.env.migrate"
  exit 1
fi
printf 'POSTGRES_PASSWORD=%s\n' "$OWNER_PW" > "$PROJECT/.env.postgres"
chmod 600 "$PROJECT/.env.postgres"
unset OWNER_URL OWNER_PW

# Positively established, or not established at all.
for f in .env.migrate .env.postgres; do
  [ -s "$PROJECT/$f" ] || { echo "ABORT — $PROJECT/$f is empty after staging." >&2; exit 1; }
  case "$(stat -c '%a' "$PROJECT/$f" 2>/dev/null || echo '?')" in
    600|400) ;;
    *) echo "ABORT — $PROJECT/$f is not owner-only." >&2; exit 1 ;;
  esac
done
grep -qE '^DATABASE_URL=.'      "$PROJECT/.env.migrate"  || { echo "ABORT — .env.migrate carries no DATABASE_URL." >&2; exit 1; }
grep -qE '^POSTGRES_PASSWORD=.' "$PROJECT/.env.postgres" || { echo "ABORT — .env.postgres carries no POSTGRES_PASSWORD." >&2; exit 1; }

echo "OK    owner authority staged into .env.migrate and .env.postgres (mode 600), both verified non-empty"
echo "OK    .env.production is UNCHANGED — runtime keeps owner authority until the role exists"
echo
echo "Nothing about maia_app was attempted: the migration creates it. Nothing was restarted."
echo "Next: the orchestrator brings Compose forward and verifies migration authority."
