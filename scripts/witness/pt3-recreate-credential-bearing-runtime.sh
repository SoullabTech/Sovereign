#!/bin/sh
# PT-3 §VI (B21) / §VII (B38) — shed owner credentials from every surviving container. PRODUCTION HOST.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §VI, §VII (B38).
#
# ⭐ WHY THIS IS NOT A LIST (B21). Editing .env.production does not change a RUNNING container's
# environment — the container must be recreated. An earlier runbook recreated seven remembered
# services while the witness defines the constitutional set by POSSESSION. Replacing a stale
# four-name list with a stale seven-name list repeats the defect one size larger. This DISCOVERS the
# set, recreates it, then RE-DISCOVERS and requires the law to hold.
#
# ⭐ WHY IT IS NOT THE QUIESCENCE SET EITHER (B38). Two different questions were being answered by
# one set:
#
#   which containers can WRITE SOURCE?          → stopped at quiescence
#   which containers POSSESS OWNER AUTHORITY?   → must be recreated after .env.production is cleansed
#
# maia-caddy is the case that separates them. It is deliberately left UP through the outage so the
# outage presents as a proxy refusal rather than a network black hole — correct — but it loads
# .env.production, so it kept the owner material it was created with. A running container never
# rereads an env file. Caddy therefore needs a credential-shedding recreation even though it never
# needed stopping to protect Source.
#
# ⭐ AND OWNER MATERIAL IS NOT ONE VARIABLE NAME (§V, B28). Discovery below looks for every form of
# owner authentication material, and reports VARIABLE NAMES ONLY — never a value.

set -eu
PROJECT="${PROJECT_DIR:-$HOME/MAIA-SOVEREIGN}"
COMPOSE="$PROJECT/docker-compose.production.yml"
DB="${PT3_DB:-maia_consciousness}"
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

# postgres IS the database; the governed migration service must retain owner authority (§IX.5).
# §IX (B39) — keyed on the Compose service identity, not on a name substring.
is_exempt() { pt3_is_exempt "$1"; }

# The owner role is derived from the protected tier itself, never hardcoded, so the sweep follows
# the boundary if the owner is ever something other than `soullab`.
OWNER=$(docker exec maia-postgres psql -U soullab -d "$DB" -tAc \
  "SELECT tableowner FROM pg_tables WHERE tablename='manuscript_sections'" 2>/dev/null || true)
[ -n "$OWNER" ] || { echo "ABORT — cannot read the protected tier's owner; refusing to guess what owner material looks like." >&2; exit 1; }

# Prints the NAMES of owner-bearing variables in one container. Never a value.
owner_material() {
  docker exec "$1" env 2>/dev/null | awk -F= -v owner="$OWNER" '
    $1 == "DATABASE_URL"         && length($2) { print $1; next }
    $1 == "MIGRATE_DATABASE_URL" && length($2) { print $1; next }
    $1 == "POSTGRES_PASSWORD"    && length($2) { print $1; next }
    # Any equivalently-named credential that authenticates as the owner role.
    $0 ~ ("=postgres(ql)?://" owner ":")       { print $1; next }
  ' | sort -u
}

discover() {  # prints "service<TAB>VAR,VAR"
  for c in $(docker ps --format '{{.Names}}' 2>/dev/null); do
    is_exempt "$c" && continue
    vars=$(owner_material "$c" | tr '\n' ',' | sed 's/,$//')
    [ -n "$vars" ] || continue
    svc=$(pt3_compose_service "$c")
    if [ -n "$svc" ]; then printf '%s\t%s\n' "$svc" "$vars"; fi
  done | sort -u
}

MODE="${1:-shed}"
STATE="${PT3_OWNER_HOLDERS:-$HOME/.pt3-cutover/owner-credential-holders}"

echo "════════ discovered: running containers possessing owner material (names only) ════════"
FOUND=$(discover)
if [ -z "$FOUND" ]; then
  echo "  none — every ordinary container has already lost owner authority"
  if [ "$MODE" != "record" ] && [ -s "$STATE" ]; then
    echo "  recorded holder(s) were already replaced earlier in the transition:"
    sed 's/^/    /' "$STATE"
    rm -f "$STATE"
  fi
  exit 0
fi
printf '%s\n' "$FOUND" | sed 's/^/  /; s/\t/  →  /'
SERVICES=$(printf '%s\n' "$FOUND" | cut -f1 | sort -u)

# `record` is the pre-transition census: the set that will need shedding afterwards. It changes
# nothing. Recording it BEFORE the transition means the shed step is checked against what was
# actually there, not against what is convenient to find later.
if [ "$MODE" = "record" ]; then
  mkdir -p "$(dirname "$STATE")"; chmod 700 "$(dirname "$STATE")"
  printf '%s\n' $SERVICES > "$STATE"
  echo
  echo "  recorded $(printf '%s\n' $SERVICES | wc -l | tr -d ' ') owner-credential holder(s) at $STATE"
  echo "  These must all be recreated after .env.production is cleansed."
  exit 0
fi

echo
echo "════════ recreating exactly that set — their old environment must disappear ════════"
# shellcheck disable=SC2086
pt3_compose up -d --no-deps --force-recreate $SERVICES

echo
echo "════════ re-discovering — the law must now hold ════════"
sleep 5
REMAIN=$(discover)
if [ -z "$REMAIN" ]; then
  echo "  READY — no ordinary running container possesses owner material of any form"
  # Every recorded holder must have been dealt with, not merely the ones still findable now.
  if [ -s "$STATE" ]; then
    MISSED=""
    for svc in $(cat "$STATE"); do
      printf '%s\n' $SERVICES | grep -qx "$svc" || MISSED="$MISSED $svc"
    done
    if [ -n "$MISSED" ]; then
      echo "  NOTE — recorded holder(s) not recreated in this pass (already gone or renamed):$MISSED"
    fi
    rm -f "$STATE"
  fi
  exit 0
fi
echo "  DEFECT — these still possess owner material after recreation:"
printf '%s\n' "$REMAIN" | sed 's/^/    /; s/\t/  →  /'
echo "  Their environment did not change: check that .env.production no longer carries owner material."
exit 1
