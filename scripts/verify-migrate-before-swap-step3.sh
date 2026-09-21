#!/usr/bin/env bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY="$SCRIPT_DIR/deploy-production.sh"
PASS=0; FAIL=0
ok(){ echo "  ok:   $1"; PASS=$((PASS+1)); }
bad(){ echo "  FAIL: $1"; FAIL=$((FAIL+1)); }

OLD="1111111111111111111111111111111111111111"
MOVED="2222222222222222222222222222222222222222"
PENDING=$'database/migrations/a.sql\ndatabase/migrations/b.sql'

run_case(){ # observed_pending observed_old migrate_rc
  local observed_pending="$1" observed_old="$2" migrate_rc="$3"
  local events
  events="$(mktemp /tmp/step3-events.XXXXXX)"
  EVENTS="$events" EXPECTED_PENDING="$PENDING" OBSERVED_PENDING="$observed_pending" \
  EXPECTED_OLD="$OLD" OBSERVED_OLD="$observed_old" MIGRATE_RC="$migrate_rc" \
  bash -c '
    source "$1" >/dev/null 2>&1
    set +e
    MAIA_BUILD_CONTEXT=/tmp/step3-fixture-snapshot
    PROJECT_DIR=/tmp/step3-fixture-repo

    collect_pending_production_migrations(){
      echo PENDING >> "$EVENTS"
      printf "%s" "$OBSERVED_PENDING"
    }
    docker(){
      if [ "$1" = exec ] && [ "$2" = maia-sovereign ]; then
        echo OLD_READER >> "$EVENTS"
        printf "%s\n" "$OBSERVED_OLD"
        return 0
      fi
      return 1
    }
    git(){
      if [ "$1" = -C ] && [ "$3" = rev-parse ]; then
        case "$4" in
          "$OBSERVED_OLD"*) printf "%s\n" "$OBSERVED_OLD"; return 0 ;;
        esac
      fi
      return 1
    }
    deploy_ctx_compose(){
      echo MIGRATE >> "$EVENTS"
      return "$MIGRATE_RC"
    }

    MIGRATION_COMPAT_EXPECTED_PENDING="$EXPECTED_PENDING"
    MIGRATION_COMPAT_EXPECTED_OLD_READER="$EXPECTED_OLD"
    run_migrations_or_abort "TEST"
  ' _ "$DEPLOY" >"$events.out" 2>&1
  rc=$?
  printf '%s\n' "$rc"
  cat "$events"
  printf '%s\n' "---OUTPUT---"
  cat "$events.out"
  rm -f "$events" "$events.out"
}

echo "DEPLOYMENT-SAFETY-03 STEP 3 — pre-swap relation witness"
echo

OUT="$(run_case "$PENDING" "$OLD" 0)"
RC="$(printf '%s\n' "$OUT" | head -1)"
EVENTS="$(printf '%s\n' "$OUT" | sed -n '2,/^---OUTPUT---$/p' | sed '$d')"
[ "$RC" = 0 ] && ok "unchanged reviewed relation → migration may run" || bad "lawful relation refused"
[ "$EVENTS" = $'PENDING\nOLD_READER\nMIGRATE' ] \
  && ok "last observation before MIGRATE is the exact old-reader witness" \
  || bad "wrong pre-migration event order: [$EVENTS]"

set +e
OUT="$(run_case "database/migrations/a.sql" "$OLD" 0)"
set -e
RC="$(printf '%s\n' "$OUT" | head -1)"
EVENTS="$(printf '%s\n' "$OUT" | sed -n '2,/^---OUTPUT---$/p' | sed '$d')"
[ "$RC" != 0 ] && ok "pending-set movement → REFUSED" || bad "moved pending set advanced"
case "$EVENTS" in *MIGRATE*) bad "migration ran after pending-set movement" ;;
  *) ok "pending-set movement refuses before migration" ;; esac
case "$EVENTS" in *OLD_READER*) bad "old-reader witness ran after earlier pending refusal" ;;
  *) ok "pending is re-witnessed before old-reader identity" ;; esac

set +e
OUT="$(run_case "$PENDING" "$MOVED" 0)"
set -e
RC="$(printf '%s\n' "$OUT" | head -1)"
EVENTS="$(printf '%s\n' "$OUT" | sed -n '2,/^---OUTPUT---$/p' | sed '$d')"
[ "$RC" != 0 ] && ok "old-reader movement → REFUSED" || bad "moved old reader advanced"
case "$EVENTS" in *MIGRATE*) bad "migration ran after old-reader movement" ;;
  *) ok "old-reader movement refuses before migration" ;; esac
[ "$EVENTS" = $'PENDING\nOLD_READER' ] \
  && ok "old reader is the final observation on old-reader refusal" \
  || bad "unexpected old-reader refusal event order: [$EVENTS]"

set +e
OUT="$(run_case "$PENDING" "$OLD" 1)"
set -e
RC="$(printf '%s\n' "$OUT" | head -1)"
BODY="$(printf '%s\n' "$OUT" | sed -n '/^---OUTPUT---$/,$p')"
[ "$RC" != 0 ] && ok "migration failure → non-zero pre-swap abort" || bad "migration failure exited zero"
case "$BODY" in *"candidate reader was NOT swapped in"*) ok "migration failure explicitly preserves pre-swap standing" ;;
  *) bad "migration failure does not state unswapped candidate" ;; esac

echo
echo "$PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ]
