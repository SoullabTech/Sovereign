#!/bin/sh
# PT-3 §VI/§VII — production host inspection. READ ONLY.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §VI, §VII.
#
#   ssh soullab@minisforum 'sh -s' < scripts/witness/pt3-cutover-readiness.sh
#
# It reads container environments and database catalogues. It changes nothing: no migration, no
# credential, no role, no grant, no restart, no configuration.
#
# ⚠️ WHAT IT REPORTS, AND WHY THE SHAPE MATTERS (§VI).
#
#   TOPOLOGY   what is actually there — which services hold which authority. Facts, not verdicts.
#              "runtime is still using owner authority" and "MAIA_APP_DATABASE_URL is absent" are
#              simply the PRE-CUTOVER STATE. They are NOT failures of the readiness package, and an
#              earlier version of this script wrongly printed them as FAIL.
#
#   DEFECT     something wrong regardless of cutover state — maia_app a superuser, protected tiers
#              owned by the app role, both authorities in one universally-loaded env file. These
#              would remain wrong after cutover.
#
#   VERDICT    NOT YET CUT OVER · READY · INCONCLUSIVE. Never READY on an empty run: absence of
#              observation is not evidence of compliance (§V).

set -u
defects=0
observed=0
cutover_gaps=0

obs()    { observed=$((observed+1)); printf '  %-46s %s\n' "$1" "$2"; }
defect() { observed=$((observed+1)); defects=$((defects+1));   printf 'DEFECT  %s\n        %s\n' "$1" "$2"; }
gap()    { observed=$((observed+1)); cutover_gaps=$((cutover_gaps+1)); printf 'PRE-CUTOVER  %s\n             %s\n' "$1" "$2"; }
ok()     { observed=$((observed+1)); printf 'OK      %s\n' "$1"; }

if ! docker ps >/dev/null 2>&1; then
  echo "INCONCLUSIVE — no reachable Docker daemon. Run this on the production host."
  exit 2
fi

RUNTIME_SERVICES="maia-sovereign maia-api maia-comms-worker maia-rlm"

echo "════════ §VII.3 / §VII.5 — RUNTIME CREDENTIAL TOPOLOGY ════════"
for svc in $RUNTIME_SERVICES; do
  docker ps --format '{{.Names}}' | grep -qx "$svc" || { printf '  %-46s %s\n' "$svc" "not running"; continue; }
  app_url=$(docker exec "$svc" printenv MAIA_APP_DATABASE_URL 2>/dev/null || true)
  own_url=$(docker exec "$svc" printenv DATABASE_URL 2>/dev/null || true)
  # Report the ROLE only. A connection string is a secret; a role name is a fact.
  app_role=$(printf '%s' "$app_url" | sed -n 's#^[a-z+]*://\([^:@/]*\).*#\1#p')
  own_role=$(printf '%s' "$own_url" | sed -n 's#^[a-z+]*://\([^:@/]*\).*#\1#p')
  obs "$svc MAIA_APP_DATABASE_URL role" "${app_role:-<absent>}"
  obs "$svc DATABASE_URL role"          "${own_role:-<absent>}"

  if [ -z "$app_url" ]; then
    gap "$svc runs as the owner" \
        "MAIA_APP_DATABASE_URL absent — this is the pre-cutover state, not a fault. PT-3 is not enforced for this service."
  elif [ -n "$own_url" ]; then
    gap "$svc can still reach the owner credential" \
        "both authorities present; cutover removes DATABASE_URL from runtime services."
  else
    ok "$svc holds only the constrained credential"
  fi
done

echo
echo "════════ §VII.4 — MIGRATION CREDENTIAL TOPOLOGY ════════"
ENVFILE="$HOME/MAIA-SOVEREIGN/.env.production"
if [ -r "$ENVFILE" ]; then
  # Names only. This script never prints a secret's value.
  obs "vars in .env.production naming a database URL" \
      "$(grep -oE '^[A-Z_]*DATABASE_URL' "$ENVFILE" 2>/dev/null | tr '\n' ' ' || echo none)"
  if grep -q '^MAIA_APP_DATABASE_URL=' "$ENVFILE" 2>/dev/null; then
    defect "the two authorities are in one universally-loaded env file" \
           ".env.production is loaded by every service; the app credential must live in a runtime-only env file (§VIII.A)."
  else
    ok "the app credential is not in the universally-loaded env file"
  fi
else
  obs ".env.production" "not readable from this shell"
fi

echo
echo "════════ DATABASE AUTHORITY ════════"
if docker ps --format '{{.Names}}' | grep -qx maia-postgres; then
  q() { docker exec maia-postgres psql -U soullab -d maia_consciousness -tAc "$1" 2>/dev/null || true; }
  role=$(q "SELECT rolsuper::text FROM pg_roles WHERE rolname='maia_app'")
  case "$role" in
    f) ok "maia_app exists and is not a superuser" ;;
    t) defect "maia_app is a superuser" "every grant and trigger beneath it would be inert." ;;
    *) gap "maia_app does not exist" "the PT-3 migration has not been applied to production — expected before cutover." ;;
  esac
  owner=$(q "SELECT tableowner FROM pg_tables WHERE tablename='manuscript_sections'")
  obs "manuscript_sections owner" "${owner:-<unknown>}"
  if [ -n "$owner" ] && [ "$owner" = "maia_app" ]; then
    defect "protected tiers are owned by the application role" "ownership separation is the boundary itself."
  fi
  obs "PT-3 migration recorded" \
      "$(q "SELECT coalesce(max(applied_at)::text,'not applied') FROM schema_migrations WHERE filename LIKE '20260908000001%'")"
else
  obs "maia-postgres" "not running here"
fi

echo
echo "════════ VERDICT ════════"
if [ "$observed" -eq 0 ]; then
  echo "INCONCLUSIVE — nothing observed. Absence of failures is not evidence of separation."
  exit 2
elif [ "$defects" -gt 0 ]; then
  echo "DEFECTS PRESENT — $defects condition(s) would remain wrong after cutover. Resolve before cutting over."
  exit 1
elif [ "$cutover_gaps" -gt 0 ]; then
  echo "NOT YET CUT OVER — $cutover_gaps pre-cutover condition(s) observed, no defects."
  echo "PT-3 is enforced in code and not in production. This is the expected pre-cutover reading."
  exit 0
else
  echo "READY — runtime and migration authority are separated ($observed observations, 0 defects)."
  exit 0
fi
