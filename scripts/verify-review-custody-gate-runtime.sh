#!/usr/bin/env bash
# DEPLOYMENT-SAFETY-03 — migration review gate execution-custody falsifier
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY="$SCRIPT_DIR/deploy-production.sh"
PASS=0; FAIL=0
ok(){ echo "  ok:   $1"; PASS=$((PASS+1)); }
bad(){ echo "  FAIL: $1"; FAIL=$((FAIL+1)); }

TMP="$(mktemp -d "${TMPDIR:-/tmp}/review-gate-runtime.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/project/scripts" "$TMP/evidence"
touch "$TMP/project/scripts/review-custody-migration-gate.ts"
touch "$TMP/evidence/record.json" "$TMP/evidence/review.json" "$TMP/evidence/trace.ndjson"

run_case(){ # context yes/no, verify_rc, docker_rc, evidence yes/no
  local context="$1" verify_rc="$2" docker_rc="$3" evidence="$4"
  rm -f "$TMP/docker-args" "$TMP/events"
  CONTEXT="$context" VERIFY_RC="$verify_rc" DOCKER_RC="$docker_rc" EVIDENCE="$evidence"   DOCKER_ARGS="$TMP/docker-args" EVENTS="$TMP/events" PENDING="database/migrations/a.sql"   bash -c '
    source "$1" >/dev/null 2>&1
    PROJECT_DIR="$2/project"
    MAIA_IMAGE_REPO="maia-sovereign"
    DEPLOY_CTX_FULL_SHA="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    if [ "$CONTEXT" = yes ]; then
      MAIA_BUILD_CONTEXT="$PROJECT_DIR"
    else
      unset MAIA_BUILD_CONTEXT
    fi

    collect_pending_production_migrations(){ printf "%s" "$PENDING"; }
    deploy_ctx_verify_image(){
      printf "VERIFY %s\n" "$*" >> "$EVENTS"
      return "$VERIFY_RC"
    }
    docker(){
      if [ "$1" = exec ]; then
        printf "111111111\n"
        return 0
      fi
      if [ "$1" = run ]; then
        printf "%s\n" "$*" > "$DOCKER_ARGS"
        return "$DOCKER_RC"
      fi
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
      export REVIEW_CUSTODY_RECORD="$2/evidence/record.json"
      export REVIEW_CUSTODY_REVIEW="$2/evidence/review.json"
      export REVIEW_CUSTODY_TRACE="$2/evidence/trace.ndjson"
    else
      export REVIEW_CUSTODY_RECORD="$2/evidence/missing-record.json"
      export REVIEW_CUSTODY_REVIEW="$2/evidence/review.json"
      export REVIEW_CUSTODY_TRACE="$2/evidence/trace.ndjson"
    fi

    review_migration_custody_or_abort "TEST"
  ' _ "$DEPLOY" "$TMP" 2>&1
}

echo "DEPLOYMENT-SAFETY-03 — gate runtime custody"
echo

OUT="$(run_case yes 0 0 yes)"; RC=$?
[ "$RC" -eq 0 ] && ok "host-tsx absent + verified immutable image → gate may execute"                  || bad "lawful image fallback was refused: $OUT"
case "$(cat "$TMP/events" 2>/dev/null)" in
  *"VERIFY aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa maia-sovereign:prod"*)
    ok "fallback re-verifies exact target image provenance" ;;
  *) bad "target image provenance was not re-verified" ;;
esac

ARGS="$(cat "$TMP/docker-args" 2>/dev/null || true)"
case "$ARGS" in *"--entrypoint /app/node_modules/.bin/tsx"*"maia-sovereign:prod"*"/app/scripts/review-custody-migration-gate.ts"*)
  ok "gate executes with target image tsx + target image gate source" ;;
  *) bad "wrong image execution substrate: $ARGS" ;; esac
case "$ARGS" in *"dst=/repo,readonly"*"/evidence/record.json,readonly"*"/evidence/review.json,readonly"*"/evidence/trace.ndjson,readonly"*)
  ok "repository and all evidence mounts are read-only" ;;
  *) bad "read-only custody mounts missing: $ARGS" ;; esac
case "$ARGS" in *"--repo /repo"*"--target aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"*"--old-reader 1111111111111111111111111111111111111111"*"--migration database/migrations/a.sql"*)
  ok "exact target, old reader and pending migration cross into container gate" ;;
  *) bad "relation forwarding incomplete: $ARGS" ;; esac
case "$ARGS" in *"GIT_CONFIG_KEY_0=safe.directory"*"GIT_CONFIG_VALUE_0=/repo"*)
  ok "read-only repository is explicitly admitted as git safe.directory" ;;
  *) bad "git read custody configuration missing: $ARGS" ;; esac

set +e
OUT="$(run_case yes 1 0 yes)"; RC=$?
set -e
[ "$RC" -ne 0 ] && ok "unverified target image → REFUSED" || bad "unverified image advanced"
[ ! -s "$TMP/docker-args" ] && ok "image-provenance refusal occurs before gate container runs"                              || bad "gate ran after image-provenance refusal"

set +e
OUT="$(run_case yes 0 1 yes)"; RC=$?
set -e
[ "$RC" -ne 0 ] && ok "containerized gate failure → REFUSED" || bad "failed container gate advanced"

set +e
OUT="$(run_case no 0 0 yes)"; RC=$?
set -e
[ "$RC" -ne 0 ] && ok "no immutable build context + no host tsx → REFUSED"                  || bad "migration-only silently borrowed image fallback"
case "$OUT" in *"No immutable target-image context"*) ok "migration-only refusal is explicit" ;;
  *) bad "missing immutable-context refusal message" ;; esac

set +e
OUT="$(run_case yes 0 0 no)"; RC=$?
set -e
[ "$RC" -ne 0 ] && ok "missing evidence file → REFUSED before bind mount"                  || bad "missing evidence was allowed into docker mount"

echo
echo "$PASS passed · $FAIL failed"
[ "$FAIL" -eq 0 ]
