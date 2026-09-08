#!/bin/sh
# PT-3 §IX (B24, B25) — Source-write quiescence boundary. PRODUCTION HOST.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §V, §VI, §IX, §X.
#
#   ssh soullab@minisforum 'sh -s' < …pt3-quiesce-source-writes.sh          # stop
#   ssh soullab@minisforum 'sh -s -- release' < …pt3-quiesce-source-writes.sh
#
# ⭐ WHY A REAL STOP, AND WHY NOT SAFE MODE. §IX asks for the smallest EXISTING production mechanism
# that actually refuses Source-working requests. The existing `safe-mode` toggle disables geocode,
# astrology, deep memory, exports, advanced voice, embeddings and RLM — it does **not** refuse writes
# to protected Source. Using it would look like quiescence while the old import path kept running.
#
# THE UNLAWFUL STATE THIS CLOSES (B25). The old production application connects as the OWNER and
# creates Source sections by direct INSERT, outside the seam. If the PT-3 migration lands while that
# runtime is live, it can keep writing representation-less sections into the post-PT-3 schema —
# privilege would not stop it, because it is the owner. So:
#
#   old app + owner authority + new schema  is not a lawful steady state.
#
# A stopped container cannot write. That is the smallest mechanism that is actually true, and it
# invents no maintenance subsystem.
#
# ⚠️ THIS IS AN OUTAGE, deliberately. Do not shorten it by racing: §IX forbids relying on speed.
#
# The set is DISCOVERED by database-credential possession, the same law the witnesses apply —
# never a remembered list.

set -eu
PROJECT="${PROJECT_DIR:-$HOME/MAIA-SOVEREIGN}"
COMPOSE="$PROJECT/docker-compose.production.yml"
STATE="${PT3_QUIESCE_STATE:-$HOME/.pt3-cutover/quiesced-services}"
MODE="${1:-quiesce}"
cd "$PROJECT"

# B39 — one production Compose invocation, shared. These two scripts are invoked by the
# orchestrator from the immutable snapshot, so the helper is a sibling; if it is missing, this
# script must refuse rather than fall back to a different interpretation of the same file.
PT3_LIB="${PT3_LIB:-$(dirname "$0")}"
if [ ! -r "$PT3_LIB/pt3-compose.sh" ]; then
  echo "ABORT — $PT3_LIB/pt3-compose.sh not found. Run this from the materialized snapshot" >&2
  echo "        (scripts/pt3-cutover.sh does), not by piping the file over ssh." >&2
  exit 1
fi
# shellcheck source=/dev/null
. "$PT3_LIB/pt3-compose.sh"

# postgres is the database; the governed migration service must retain owner authority and is not a
# live writer; caddy is a proxy left up so the outage presents as a refusal rather than a black hole
# — it sheds its stale owner material by recreation instead (B38).
# §IX (B39) — the migrate exemption is now the Compose SERVICE IDENTITY, not a name substring.
is_exempt() { case "$1" in maia-caddy) return 0 ;; esac; pt3_is_exempt "$1"; }

discover() {
  for c in $(docker ps --format '{{.Names}}' 2>/dev/null); do
    is_exempt "$c" && continue
    own=$(docker exec "$c" printenv DATABASE_URL 2>/dev/null || true)
    app=$(docker exec "$c" printenv MAIA_APP_DATABASE_URL 2>/dev/null || true)
    [ -n "$own" ] || [ -n "$app" ] || continue
    pt3_compose_service "$c"
  done | grep -v '^$' | sort -u
}

if [ "$MODE" = "release" ]; then
  [ -r "$STATE" ] || { echo "ABORT — no quiescence record at $STATE. Refusing to guess what to start." >&2; exit 1; }
  SERVICES=$(cat "$STATE")
  echo "════════ releasing quiescence ════════"
  printf '  %s\n' $SERVICES
  # shellcheck disable=SC2086
  pt3_compose up -d --no-deps $SERVICES
  sleep 5
  echo
  echo "  running again: $(discover | tr '\n' ' ')"
  rm -f "$STATE"
  echo "  quiescence released"
  exit 0
fi

echo "════════ discovering database-bearing runtime ════════"
SERVICES=$(discover)
[ -n "$SERVICES" ] || { echo "  none running — nothing to quiesce"; exit 0; }
printf '  %s\n' $SERVICES

mkdir -p "$(dirname "$STATE")"; chmod 700 "$(dirname "$STATE")"
printf '%s\n' $SERVICES > "$STATE"

echo
echo "════════ stopping — Source writes must be refused, not merely discouraged ════════"
# shellcheck disable=SC2086
pt3_compose stop $SERVICES
sleep 3

REMAIN=$(discover)
if [ -n "$REMAIN" ]; then
  echo "  DEFECT — still running after stop:"; printf '    %s\n' $REMAIN
  echo "  Do not migrate: an old Source-writing runtime is live."
  exit 1
fi
echo "  QUIESCED — no database-bearing ordinary container is running."
echo "  Recorded at $STATE for release. The migration may proceed."
