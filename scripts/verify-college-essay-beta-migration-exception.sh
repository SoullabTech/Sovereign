#!/usr/bin/env bash
# FOUNDER-BETA-MIGRATION-01: isolated negative tests; no production mutation.
set -euo pipefail
if [ "$#" -ne 2 ]; then
  echo "usage: $0 <local-git-repo> <candidate-commit>" >&2
  exit 2
fi
repo="$1"
target="$2"
sql="database/migrations/20261113000010_studio_doorway_invitation_studio_access.sql"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/scripts" "$tmp/database/migrations"
for f in deploy-production.sh deploy-lock.sh deploy-tag.sh deploy-context.sh; do
  git -C "$repo" show "$target:scripts/$f" > "$tmp/scripts/$f"
done
PASS=0; FAIL=0
run_case() {
  local label="$1" policy="$2" pending="$3" tamper="$4" old="$5" rollback="$6" schema="$7" want="$8"
  git -C "$repo" show "$target:$sql" > "$tmp/$sql"
  if [ "$tamper" = yes ]; then echo "-- changed bytes" >> "$tmp/$sql"; fi
  local out rc
  set +e
  out="$(
    BETA_TEST_POLICY="$policy" BETA_TEST_PENDING="$pending" BETA_TEST_OLD="$old" \
    BETA_TEST_ROLLBACK="$rollback" BETA_TEST_SCHEMA="$schema" \
    bash -c '
      source "$1" help >/dev/null 2>&1
      set +e
      PROJECT_DIR="$2"
      MAIA_BUILD_CONTEXT="$3"
      DEPLOY_CTX_FULL_SHA="$4"
      SOULLAB_BETA_MIGRATION_POLICY="$BETA_TEST_POLICY"
      collect_pending_production_migrations() { printf "%s" "$BETA_TEST_PENDING"; }
      docker() {
        case "$*" in
          "exec maia-sovereign printenv GIT_COMMIT") printf "%s\n" "$BETA_TEST_OLD" ;;
          "inspect maia-sovereign -f "* ) printf "%s\n" "sha256:a9317ce76e58a34bfa83d80dbc68d4d66020959dafa64bd4c95ba06d017fad97" ;;
          "image inspect maia-sovereign:previous -f "* ) printf "%s\n" "$BETA_TEST_ROLLBACK" ;;
          "exec maia-postgres psql "* ) printf "%s\n" "$BETA_TEST_SCHEMA" ;;
          *) return 1 ;;
        esac
      }
      review_migration_custody_or_abort "UNIT_TEST"
    ' _ "$tmp/scripts/deploy-production.sh" "$repo" "$tmp" "$target"
  )" 2>&1
  rc=$?
  set -e
  if [ "$want" = pass ] && [ "$rc" -eq 0 ]; then
    echo "PASS $label"; PASS=$((PASS + 1))
  elif [ "$want" = fail ] && [ "$rc" -ne 0 ]; then
    echo "PASS $label (refused)"; PASS=$((PASS + 1))
  else
    echo "FAIL $label (rc=$rc)"; printf "%s\n" "$out" | tail -12
    FAIL=$((FAIL + 1))
  fi
}
goodpolicy="college-essay-20261113-single-additive"
goodold="faac1d482"
goodrollback="sha256:ba28b98a3adc73a4962efac222ffcf8e7d87c7b961ea8da35940387dac9e61db"
run_case valid_exact_beta "$goodpolicy" "$sql" no "$goodold" "$goodrollback" ready pass
run_case missing_opt_in "" "$sql" no "$goodold" "$goodrollback" ready fail
run_case unknown_policy wrong "$sql" no "$goodold" "$goodrollback" ready fail
run_case unrelated_migration "$goodpolicy" database/migrations/unrelated.sql no "$goodold" "$goodrollback" ready fail
run_case two_pending "$goodpolicy" "$sql
database/migrations/unrelated.sql" no "$goodold" "$goodrollback" ready fail
run_case changed_migration_bytes "$goodpolicy" "$sql" yes "$goodold" "$goodrollback" ready fail
run_case changed_live_reader "$goodpolicy" "$sql" no c9283f4 "$goodrollback" ready fail
run_case changed_rollback_image "$goodpolicy" "$sql" no "$goodold" sha256:wrong ready fail
run_case unexpected_database_shape "$goodpolicy" "$sql" no "$goodold" "$goodrollback" refuse fail
echo "$PASS passed; $FAIL failed"
[ "$PASS" -eq 9 ] && [ "$FAIL" -eq 0 ]
