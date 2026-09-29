#!/usr/bin/env bash
set -euo pipefail

SOURCE="${1:-scripts/deploy-production.sh}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
LOG="$TMP/docker.log"

RUNNING_IMAGE="sha256:new"
RUNNING_GIT="newsha999"
TARGET_SHA="7a096281a"
TARGET_IMAGE="maia-sovereign:$TARGET_SHA"

pass(){ printf 'PASS  %s\n' "$1"; }
fail(){ printf 'FAIL  %s\n' "$1" >&2; exit 1; }

acquire_deploy_lock(){ :; }
log_info(){ :; }
log_success(){ :; }
log_error(){ :; }
send_alert(){ :; }
cmd_status(){ :; }
sleep(){ :; }

git(){
  if [ "$1" = "-C" ]; then
    printf '%s\n' "$TARGET_SHA"
    return 0
  fi
  command git "$@"
}
docker(){
  printf '%s\n' "$*" >> "$LOG"

  if [ "$1" = "image" ] && [ "$2" = "inspect" ]; then
    local image="$3"
    if [ "$image" = "$TARGET_IMAGE" ]; then
      if [[ "$*" == *".Config.Env"* ]]; then
        printf 'GIT_COMMIT=%s\n' "$TARGET_SHA"
      else
        printf 'sha256:old\n'
      fi
      return 0
    fi
  fi

  if [ "$1" = "inspect" ] && [ "$2" = "maia-sovereign" ]; then
    if [[ "$*" == *".State.Health"* ]]; then
      printf 'healthy\n'
    else
      printf '%s\n' "$RUNNING_IMAGE"
    fi
    return 0
  fi

  if [ "$1" = "exec" ] && [ "$2" = "maia-sovereign" ]; then
    printf '%s\n' "$RUNNING_GIT"
    return 0
  fi

  if [ "$1" = "tag" ]; then
    return 0
  fi
  if [ "$1" = "compose" ] && [[ "$*" == *"up -d --force-recreate --no-deps maia"* ]]; then
    RUNNING_IMAGE="sha256:old"
    RUNNING_GIT="$TARGET_SHA"
    return 0
  fi

  return 0
}

COMPOSE_FILE="docker-compose.production.yml"
PROJECT_DIR="$TMP"
MAIA_IMAGE_REPO="maia-sovereign"

FUNC="$(awk '/^cmd_rollback\(\)/{f=1} f{print} f && /^}/{exit}' "$SOURCE")"
[ -n "$FUNC" ] || fail 'could not extract cmd_rollback'
eval "$FUNC"

if (cmd_rollback main >/dev/null 2>&1); then
  fail 'mutable branch name was accepted as explicit rollback target'
else
  pass 'mutable branch name is refused'
fi

cmd_rollback "$TARGET_SHA"

grep -Fq "tag $TARGET_IMAGE maia-sovereign:prod" "$LOG" \
  && pass 'explicit target promoted to prod' || fail 'explicit target did not reach prod'

grep -Fq "tag $TARGET_IMAGE maia-sovereign:current" "$LOG" \
  && pass 'explicit target promoted to current' || fail 'explicit target did not reach current'

grep -Fq 'compose -f docker-compose.production.yml up -d --force-recreate --no-deps maia' "$LOG" \
  && pass 'rollback recreates reader only' || fail 'reader-only rollback missing'
[ "$RUNNING_IMAGE" = "sha256:old" ] && [ "$RUNNING_GIT" = "$TARGET_SHA" ] \
  && pass 'running image and SHA equal explicit target' || fail 'explicit target not live'

if grep -Eq 'postgres|maia-postgres' "$LOG"; then
  fail 'rollback touched Postgres'
else
  pass 'rollback leaves database service untouched'
fi

printf 'ROLLBACK_EXPLICIT_SHA_BEHAVIOR=PASS\n'
