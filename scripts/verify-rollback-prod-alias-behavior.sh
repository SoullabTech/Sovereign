#!/usr/bin/env bash
set -euo pipefail

SOURCE="${1:-scripts/deploy-production.sh}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
LOG="$TMP/docker.log"
RUNNING_IMAGE="sha256:new"
RUNNING_GIT="newsha"

pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; exit 1; }

acquire_deploy_lock() { :; }
log_info() { :; }
log_success() { :; }
log_error() { :; }
send_alert() { :; }
cmd_status() { :; }
sleep() { :; }

docker() {
  printf '%s\n' "$*" >> "$LOG"

  if [ "$1" = "image" ] && [ "$2" = "inspect" ]; then
    case "$3" in
      maia-sovereign:previous) printf 'sha256:old\n'; return 0 ;;
      maia-sovereign:current) printf 'sha256:new\n'; return 0 ;;
    esac
  fi

  if [ "$1" = "inspect" ] && [[ "$*" == *"git.commit"* ]]; then
    case "${*: -1}" in
      maia-sovereign:current) printf 'newsha\n'; return 0 ;;
      maia-sovereign:previous) printf 'oldsha\n'; return 0 ;;
    esac
  fi

  if [ "$1" = "tag" ]; then
    return 0
  fi

  if [ "$1" = "compose" ]; then
    if [[ "$*" == *"up -d --force-recreate --no-deps maia"* ]]; then
      RUNNING_IMAGE="sha256:old"
      RUNNING_GIT="oldsha"
      return 0
    fi
    if [[ "$*" == *" ps"* ]]; then
      printf 'maia-sovereign healthy\n'
      return 0
    fi
  fi

  if [ "$1" = "inspect" ] && [ "$2" = "maia-sovereign" ]; then
    printf '%s\n' "$RUNNING_IMAGE"
    return 0
  fi

  if [ "$1" = "exec" ] && [ "$2" = "maia-sovereign" ]; then
    printf '%s\n' "$RUNNING_GIT"
    return 0
  fi

  return 0
}

COMPOSE_FILE="docker-compose.production.yml"
PROJECT_DIR="$TMP"

FUNC="$(awk '/^cmd_rollback\(\)/{flag=1} flag{print} flag && /^}/{exit}' "$SOURCE")"
[ -n "$FUNC" ] || fail 'could not extract cmd_rollback'
eval "$FUNC"

cmd_rollback

grep -Fq 'tag maia-sovereign:previous maia-sovereign:prod' "$LOG" \
  && pass 'behavior: previous image promoted to prod' \
  || fail 'behavior: prod alias not moved'

grep -Fq 'compose -f docker-compose.production.yml up -d --force-recreate --no-deps maia' "$LOG" \
  && pass 'behavior: only maia recreated with no dependencies' \
  || fail 'behavior: reader-only recreate not observed'

if grep -Eq 'postgres|maia-postgres' "$LOG"; then
  fail 'behavior: rollback touched Postgres'
else
  pass 'behavior: Postgres untouched'
fi

[ "$RUNNING_IMAGE" = "sha256:old" ] \
  && pass 'behavior: running image is old image after rollback' \
  || fail 'behavior: old image not made live'

printf 'ROLLBACK_PROD_ALIAS_BEHAVIOR=PASS\n'
