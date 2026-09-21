#!/usr/bin/env bash
# REVIEW-CUSTODY-01 / STEP 3 — production migration binding falsifier
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY="$SCRIPT_DIR/deploy-production.sh"
PASS=0; FAIL=0
ok(){ echo "  ok:   $1"; PASS=$((PASS+1)); }
bad(){ echo "  FAIL: $1"; FAIL=$((FAIL+1)); }

TMP="$(mktemp -d "${TMPDIR:-/tmp}/review-custody-step3.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/project/node_modules/.bin" "$TMP/project/scripts"
touch "$TMP/project/scripts/review-custody-migration-gate.ts"

cat > "$TMP/project/node_modules/.bin/tsx" <<'SH'
#!/usr/bin/env bash
printf '%s\n' "$*" > "$STEP3_ARGS"
exit "${STEP3_GATE_RC:-0}"
SH
chmod +x "$TMP/project/node_modules/.bin/tsx"

run_case(){ # pending, evidence(yes/no), gate_rc
  local pending="$1" evidence="$2" rc="$3"
  STEP3_ARGS="$TMP/args" STEP3_GATE_RC="$rc" \
  PENDING="$pending" EVIDENCE="$evidence" \
  bash -c '
    source "$1" >/dev/null 2>&1
    PROJECT_DIR="$2/project"
    MAIA_BUILD_CONTEXT="$PROJECT_DIR"
    DEPLOY_CTX_FULL_SHA="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    collect_pending_production_migrations(){ printf "%s" "$PENDING"; }
    docker(){
      if [ "$1" = exec ]; then printf "111111111\n"; return 0; fi
      return 1
    }
    git(){
      if [ "$1" = -C ] && [ "$3" = rev-parse ]; then
        case "$4" in
          111111111*) printf "1111111111111111111111111111111111111111\n"; return 0 ;;
        esac
      fi
      command git "$@"
    }
    if [ "$EVIDENCE" = yes ]; then
      export REVIEW_CUSTODY_RECORD=/evidence/record.json
      export REVIEW_CUSTODY_REVIEW=/evidence/review.json
      export REVIEW_CUSTODY_TRACE=/evidence/trace.ndjson
    else
      unset REVIEW_CUSTODY_RECORD REVIEW_CUSTODY_REVIEW REVIEW_CUSTODY_TRACE
    fi
    review_migration_custody_or_abort "TEST"
  ' _ "$DEPLOY" "$TMP" 2>&1
}

echo "REVIEW-CUSTODY STEP 3 — migration binding falsifier"
echo

OUT="$(run_case "" no 0)"; CODE=$?
[ "$CODE" -eq 0 ] && ok "no pending migrations → no review required" \
                     || bad "empty pending set refused"
case "$OUT" in *"no production-pending migrations"*) ok "empty-set disposition stated" ;;
  *) bad "empty-set disposition not stated" ;; esac

set +e
OUT="$(run_case "database/migrations/a.sql" no 0)"; CODE=$?
set -e
[ "$CODE" -ne 0 ] && ok "pending migration + missing evidence → REFUSED" \
                     || bad "pending migration advanced without evidence"
case "$OUT" in *"DATABASE MIGRATION REVIEW REQUIRED"*) ok "missing-evidence refusal is explicit" ;;
  *) bad "missing-evidence refusal not explicit" ;; esac

set +e
OUT="$(run_case "database/migrations/a.sql" yes 1)"; CODE=$?
set -e
[ "$CODE" -ne 0 ] && ok "pending migration + failed custody gate → REFUSED" \
                     || bad "failed custody gate advanced"

OUT="$(run_case $'database/migrations/a.sql\ndatabase/migrations/b.sql\n' yes 0)"; CODE=$?
[ "$CODE" -eq 0 ] && ok "pending set + passing custody gate → may proceed" \
                     || bad "passing custody gate was refused"
ARGS="$(cat "$TMP/args")"
case "$ARGS" in *"--migration database/migrations/a.sql"*"--migration database/migrations/b.sql"*)
  ok "complete pending set is passed to the custody gate" ;;
  *) bad "pending-set forwarding incomplete: $ARGS" ;; esac
case "$ARGS" in *"--old-reader 1111111111111111111111111111111111111111"*)
  ok "exact live old-reader commit is passed to the composed gate" ;;
  *) bad "old-reader identity missing from gate arguments: $ARGS" ;; esac

python3 - "$DEPLOY" <<'PY'
import re, sys
s=open(sys.argv[1]).read()
issues=[]
def body(name):
    m=re.search(rf'^{name}\(\) \{{(.*?)^\}}', s, re.S|re.M)
    return m.group(1) if m else ""
for fn, later in (
    ("cmd_deploy", "tag_images_for_rollback"),
    ("cmd_update", "tag_images_for_rollback"),
    ("cmd_migrate", 'docker compose -f "$COMPOSE_FILE" --profile migrate run --rm migrate'),
):
    b=body(fn)
    g=b.find("review_migration_custody_or_abort")
    a=b.find(later)
    if g < 0 or a < 0 or g >= a:
        issues.append(f"{fn}: custody gate is not strictly before governed mutation")
for x in issues: print("STRUCT_FAIL", x)
sys.exit(len(issues))
PY
STRUCT=$?
if [ "$STRUCT" -eq 0 ]; then
  ok "deploy/update/migrate place custody strictly before the governed mutation"
else
  bad "structural placement failed"
fi

echo
echo "$PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ]
