#!/bin/sh
# PT-3 §VIII.A/B — cutover readiness verifier. READ ONLY against a running stack.
#
# AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §VIII.A/B.
#
# Answers one question that no code review can: does the RUNNING deployment actually separate
# runtime authority from migration authority? Run on the production host BEFORE and AFTER cutover.
# Before cutover it is expected to FAIL — that failure is the honest statement of where the
# deployment stands, not a defect in this script.
#
#   ssh soullab@minisforum 'sh -s' < scripts/witness/pt3-cutover-readiness.sh
#
# It reads container environments and attempts one connection. It changes nothing.

set -u
fail=0
ran=0
pass() { ran=$((ran+1)); printf 'PASS  %s\n' "$1"; }
bad()  { ran=$((ran+1)); fail=$((fail+1)); printf 'FAIL  %s\n      %s\n' "$1" "$2"; }

# An instrument that cannot see the deployment must not pronounce on it. Every skip below is
# counted as nothing observed, and a run that observed nothing reports INCONCLUSIVE — never READY.
if ! docker ps >/dev/null 2>&1; then
  echo "INCONCLUSIVE — no reachable Docker daemon. Run this on the production host."
  exit 2
fi

RUNTIME_SERVICES="maia-sovereign maia-api maia-comms-worker"

echo "── A. Runtime services carry the constrained credential, and only that ──"
for svc in $RUNTIME_SERVICES; do
  if ! docker ps --format '{{.Names}}' | grep -qx "$svc"; then
    echo "SKIP  $svc (not running)"
    continue
  fi
  app_url=$(docker exec "$svc" printenv MAIA_APP_DATABASE_URL 2>/dev/null || true)
  own_url=$(docker exec "$svc" printenv DATABASE_URL 2>/dev/null || true)

  if [ -z "$app_url" ]; then
    bad "$svc holds the constrained credential" \
        "MAIA_APP_DATABASE_URL is unset — this service is running as the OWNER. PT-3 is NOT enforced here."
  else
    case "$app_url" in
      *maia_app*) pass "$svc holds the constrained credential" ;;
      *) bad "$svc holds the constrained credential" "MAIA_APP_DATABASE_URL does not name maia_app" ;;
    esac
  fi

  # §VIII.A — the owner credential must not be reachable from ordinary runtime, under ANY name.
  if [ -n "$own_url" ]; then
    bad "$svc cannot reach the owner credential" \
        "DATABASE_URL is still present in this container. Two authorities in one environment under different names is what §VIII.A refuses."
  else
    pass "$svc cannot reach the owner credential"
  fi
done

echo
echo "── B. Migration authority is the migrate path alone ──"
# The migrate service is profile-gated and normally absent; its config is what matters.
if docker ps -a --format '{{.Names}}' | grep -q 'migrate'; then
  echo "NOTE  a migrate container exists; it is expected to be short-lived"
fi
if [ -f "$HOME/MAIA-SOVEREIGN/.env.production" ]; then
  if grep -q '^MAIA_APP_DATABASE_URL=' "$HOME/MAIA-SOVEREIGN/.env.production" 2>/dev/null; then
    bad "the owner and app credentials are not in one universal env file" \
        "MAIA_APP_DATABASE_URL is in .env.production, which every service loads. Give runtime services their own env file instead."
  else
    pass "the owner and app credentials are not in one universal env file"
  fi
else
  echo "SKIP  .env.production not readable from here"
fi

echo
echo "── C. The constrained role is actually constrained ──"
if docker ps --format '{{.Names}}' | grep -qx maia-postgres; then
  probe=$(docker exec maia-postgres psql -U soullab -d maia_consciousness -tAc \
    "SELECT rolsuper FROM pg_roles WHERE rolname='maia_app'" 2>/dev/null || true)
  case "$probe" in
    f) pass "maia_app exists and is NOT a superuser" ;;
    t) bad "maia_app is NOT a superuser" "maia_app is a superuser; every grant and trigger below it is inert" ;;
    *) bad "maia_app exists" "role not found — the PT-3 migration has not been applied to this database" ;;
  esac

  owner=$(docker exec maia-postgres psql -U soullab -d maia_consciousness -tAc \
    "SELECT tableowner FROM pg_tables WHERE tablename='manuscript_sections'" 2>/dev/null || true)
  if [ -n "$owner" ] && [ "$owner" != "maia_app" ]; then
    pass "protected tiers are owned by custody authority (owner=$owner)"
  else
    bad "protected tiers are owned by custody authority" "owner=$owner"
  fi
else
  echo "SKIP  maia-postgres not running here"
fi

echo
if [ "$ran" -eq 0 ]; then
  echo "INCONCLUSIVE — nothing was observed. Absence of failures is not evidence of separation."
  exit 2
elif [ "$fail" -eq 0 ]; then
  echo "READY — runtime and migration authority are separated ($ran checks observed)."
else
  echo "NOT READY — $fail check(s) failed. Until these pass, PT-3 is enforced in code and NOT in production."
fi
exit "$fail"
