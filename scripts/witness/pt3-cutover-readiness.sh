#!/bin/sh
# PT-3 — runtime authority topology witness. PRODUCTION HOST. READ ONLY.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §III (B18).
#
#   ssh soullab@minisforum 'sh -s' < <(git show <ACCEPTED_SHA>:scripts/witness/pt3-cutover-readiness.sh)
#
# ⚠️ REWRITTEN TO THE CONSTITUTED ARCHITECTURE. The previous version governed the SUPERSEDED design:
# it treated MAIA_APP_DATABASE_URL in .env.production as a DEFECT and demanded a runtime-only file,
# and it hardcoded four service names. Under B12 that is exactly backwards — the constrained
# credential belongs in .env.production precisely BECAUSE every service loads it, which is what makes
# the boundary survive an ordinary deploy. The runbook required this witness to return READY after a
# cutover that establishes the architecture it condemned: an internally impossible success condition.
#
# THE MODEL IT NOW GOVERNS
#   .env.production   carries MAIA_APP_DATABASE_URL (constrained) and NO owner DATABASE_URL
#   .env              carries MIGRATE_DATABASE_URL (owner), for the migrate service alone
#   runtime           no ordinary running container possesses owner authority
#   no overlay        nothing optional can be omitted to restore owner authority
#
# Authority is DISCOVERED by credential possession, never by a remembered service list.
#
# Verdicts: READY · NOT YET CUT OVER · DEFECT · INCONCLUSIVE (never READY on an empty run).

set -u
defects=0; gaps=0; observed=0
ok()   { observed=$((observed+1)); printf 'OK           %s\n             %s\n' "$1" "$2"; }
gap()  { observed=$((observed+1)); gaps=$((gaps+1));       printf 'PRE-CUTOVER  %s\n             %s\n' "$1" "$2"; }
bad()  { observed=$((observed+1)); defects=$((defects+1)); printf 'DEFECT       %s\n             %s\n' "$1" "$2"; }
note() { printf '             %s\n' "$1"; }

docker ps >/dev/null 2>&1 || { echo "INCONCLUSIVE — no reachable Docker daemon. Run on the production host."; exit 2; }
PROJECT="${PROJECT_DIR:-$HOME/MAIA-SOVEREIGN}"

echo "════════ 1. RUNTIME AUTHORITY, BY POSSESSION ════════"
for c in $(docker ps --format '{{.Names}}' 2>/dev/null); do
  [ "$c" = "maia-postgres" ] && continue
  app=$(docker exec "$c" printenv MAIA_APP_DATABASE_URL 2>/dev/null || true)
  own=$(docker exec "$c" printenv DATABASE_URL 2>/dev/null || true)
  [ -n "$app" ] || [ -n "$own" ] || continue
  app_role=$(printf '%s' "$app" | sed -n 's#^[a-z+]*://\([^:@/]*\).*#\1#p')
  own_role=$(printf '%s' "$own" | sed -n 's#^[a-z+]*://\([^:@/]*\).*#\1#p')
  if [ -n "$own" ] && [ -z "$app" ]; then
    gap "$c runs as the owner" "MAIA_APP_DATABASE_URL absent, DATABASE_URL role=${own_role:-?} — pre-cutover, not a fault"
  elif [ -n "$own" ]; then
    bad "$c still possesses owner authority" "DATABASE_URL role=${own_role:-?} — recreate this container after activation"
  elif [ "$app_role" = "maia_app" ]; then
    ok "$c runs as maia_app only" "owner credential absent"
  else
    bad "$c holds an unexpected role" "MAIA_APP_DATABASE_URL role=${app_role:-<absent>}"
  fi
done
[ "$observed" -gt 0 ] || note "no database-using container observed"

echo
echo "════════ 2. THE DURABLE CONFIGURATION (B12) ════════"
if [ -r "$PROJECT/.env.production" ]; then
  if grep -qE '^MAIA_APP_DATABASE_URL=' "$PROJECT/.env.production"; then
    ok "the constrained credential is in .env.production" "every service loads it — this is the durable design, not a defect"
  else
    gap "the constrained credential is not yet in .env.production" "activation has not run"
  fi
  if grep -qE '^DATABASE_URL=' "$PROJECT/.env.production"; then
    gap "owner authority is still in .env.production" "expected before activation; a defect after it"
  else
    ok "owner authority has left .env.production" "no ordinary service can load it"
  fi
else
  note ".env.production not readable from this shell"
fi
if grep -qE '^MIGRATE_DATABASE_URL=' "$PROJECT/.env" 2>/dev/null; then
  ok "migration authority is staged separately in .env" "migrate alone receives it, by Compose interpolation"
else
  gap "MIGRATE_DATABASE_URL is not staged" "migration would receive an empty credential"
fi
if ls "$PROJECT"/docker-compose.*cutover*.yml >/dev/null 2>&1; then
  bad "an optional cutover overlay exists" "a boundary that depends on remembering a second -f flag is not durable"
else
  ok "no optional overlay exists" "an ordinary deploy cannot restore owner authority by omitting a file"
fi

echo
echo "════════ 3. DATABASE AUTHORITY ════════"
q() { docker exec maia-postgres psql -U soullab -d "${PT3_DB:-maia_consciousness}" -tAc "$1" 2>/dev/null || true; }
if docker ps --format '{{.Names}}' | grep -qx maia-postgres; then
  case "$(q "SELECT rolsuper::text FROM pg_roles WHERE rolname='maia_app'")" in
    f) ok "maia_app exists and is not a superuser" "grants and triggers beneath it are effective" ;;
    t) bad "maia_app is a superuser" "every grant and trigger beneath it is inert" ;;
    *) gap "maia_app does not exist" "the PT-3 migration has not been applied — expected before cutover" ;;
  esac
  owner=$(q "SELECT tableowner FROM pg_tables WHERE tablename='manuscript_sections'")
  [ -n "$owner" ] && [ "$owner" != "maia_app" ] \
    && ok "protected tiers owned by custody authority" "owner=$owner" \
    || note "manuscript_sections owner=${owner:-<unknown>}"
else
  note "maia-postgres not running here"
fi

echo
echo "════════ VERDICT ════════"
if [ "$observed" -eq 0 ]; then
  echo "INCONCLUSIVE — nothing observed. Absence of failures is not evidence."; exit 2
elif [ "$defects" -gt 0 ]; then
  echo "DEFECT — $defects condition(s) wrong under the constituted architecture."; exit 1
elif [ "$gaps" -gt 0 ]; then
  echo "NOT YET CUT OVER — $gaps pre-cutover condition(s), no defects."
  echo "PT-3 is enforced in code and not in production. Expected before cutover; a failure after it."
  exit 1
else
  echo "READY — runtime holds only constrained authority, and the boundary is durable ($observed observations)."
  exit 0
fi
