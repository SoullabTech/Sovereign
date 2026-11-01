#!/usr/bin/env bash
set -euo pipefail

SOURCE="${1:-scripts/deploy-production.sh}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
LOG="$TMP/docker.log"

pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; exit 1; }

acquire_deploy_lock() { :; }
log_info() { :; }
log_success() { :; }
log_error() { :; }
send_alert() { :; }
cmd_status() { :; }
sleep() { :; }

# Scenario knobs.
PREV_LABEL="oldsha"       # git.commit label of :previous ('' = no label)
PREV_ENV="oldsha"         # GIT_COMMIT baked into :previous
GUARD_COUNTS=()           # successive outputs of the guard query

docker() {
  printf '%s\n' "$*" >> "$LOG"

  if [ "$1" = "image" ] && [ "$2" = "inspect" ]; then
    if [[ "$*" == *"git.commit"* ]]; then
      case "$3" in
        maia-sovereign:current) printf 'newsha\n' ;;
        maia-sovereign:previous) printf '%s\n' "${PREV_LABEL:-<no value>}" ;;
      esac
      return 0
    fi
    if [[ "$*" == *".Config.Env"* ]]; then
      case "$3" in
        maia-sovereign:current) printf 'PATH=/bin\nGIT_COMMIT=newsha\n' ;;
        maia-sovereign:previous) printf 'PATH=/bin\nGIT_COMMIT=%s\n' "$PREV_ENV" ;;
      esac
      return 0
    fi
    case "$3" in
      maia-sovereign:previous) printf 'sha256:old\n'; return 0 ;;
      maia-sovereign:current) printf 'sha256:new\n'; return 0 ;;
    esac
  fi

  if [ "$1" = "tag" ] || [ "$1" = "stop" ]; then
    return 0
  fi

  if [ "$1" = "compose" ]; then
    if [[ "$*" == *"up -d --force-recreate --no-deps maia"* ]]; then
      RUNNING_IMAGE="sha256:old"
      RUNNING_GIT="$PREV_ENV"
      return 0
    fi
    if [[ "$*" == *" ps"* ]]; then
      printf 'maia-sovereign healthy\n'
      return 0
    fi
  fi

  if [ "$1" = "inspect" ] && [ "$2" = "maia-sovereign" ] && [[ "$*" == *"State.Running"* ]]; then
    printf '%s\n' "$STILL_RUNNING"
    return 0
  fi

  if [ "$1" = "inspect" ] && [ "$2" = "maia-sovereign" ]; then
    printf '%s\n' "$RUNNING_IMAGE"
    return 0
  fi

  if [ "$1" = "exec" ] && [ "$2" = "maia-sovereign" ]; then
    printf '%s\n' "$RUNNING_GIT"
    return 0
  fi

  if [ "$1" = "exec" ] && [ "$2" = "-i" ] && [ "$3" = "maia-postgres" ]; then
    cat > "$TMP/guard-stdin.sql"
    printf '%s\n' "${GUARD_COUNTS[0]}"
    GUARD_COUNTS=("${GUARD_COUNTS[@]:1}")
    return 0
  fi

  return 0
}

COMPOSE_FILE="docker-compose.production.yml"
PROJECT_DIR="$TMP"
SCRIPT_DIR="$TMP/scripts"
mkdir -p "$SCRIPT_DIR/rollback-guards"

extract() {
  local f
  f="$(awk "/^$1\\(\\)/{flag=1} flag{print} flag && /^}/{exit}" "$SOURCE")"
  [ -n "$f" ] || fail "could not extract $1"
  eval "$f"
}
for fn in rollback_image_commit rollback_guard_for rollback_commit_resolvable rollback_guards_exist \
          rollback_guard_count cmd_rollback; do
  extract "$fn"
done

reset() {
  : > "$LOG"
  RUNNING_IMAGE="sha256:new"
  RUNNING_GIT="newsha"
  STILL_RUNNING="false"
  unset ROLLBACK_UNKNOWN_COMMIT_ACK
  rm -f "$SCRIPT_DIR"/rollback-guards/*
}

# ── 1. No guard for the previous commit: behaviour unchanged ─────────────────
reset
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
  pass 'behavior: Postgres untouched without a guard'
fi

[ "$RUNNING_IMAGE" = "sha256:old" ] \
  && pass 'behavior: running image is old image after rollback' \
  || fail 'behavior: old image not made live'

# ── 2. Guard exists, no failing rows: stop, check, swap, recheck ─────────────
FULL="d49dbc98df5d448a05e13a7df21180c3bde304c6"
reset
PREV_LABEL=""; PREV_ENV="d49dbc98d"
printf 'SELECT 0;\n' > "$SCRIPT_DIR/rollback-guards/$FULL.sql"
printf 'BEGIN; UPDATE x; COMMIT;\n' > "$SCRIPT_DIR/rollback-guards/$FULL.repair.sql"
GUARD_COUNTS=(0 0)
cmd_rollback

first_stop="$(grep -n '^stop maia-sovereign' "$LOG" | head -1 | cut -d: -f1)"
first_check="$(grep -n '^exec -i maia-postgres' "$LOG" | head -1 | cut -d: -f1)"
first_tag="$(grep -n '^tag ' "$LOG" | head -1 | cut -d: -f1)"
[ -n "$first_stop" ] && [ -n "$first_check" ] && [ "$first_stop" -lt "$first_check" ] \
  && [ "$first_check" -lt "$first_tag" ] \
  && pass 'guard: short GIT_COMMIT matched; reader stopped, then checked, before any tag moved' \
  || fail 'guard: stop → check → swap order not observed'

[ "$(grep -c '^exec -i maia-postgres' "$LOG")" = 2 ] \
  && pass 'guard: check re-run after the swap' \
  || fail 'guard: post-swap recheck not observed'

grep -Fq 'exec -i maia-postgres psql -U soullab -d maia_consciousness -v ON_ERROR_STOP=1 -At' "$LOG" \
  && pass 'guard: check runs with ON_ERROR_STOP and unaligned output' \
  || fail 'guard: psql invoked without the required flags'

grep -Fq 'UPDATE' "$TMP/guard-stdin.sql" \
  && fail 'guard: rollback ran the repair itself' \
  || pass 'guard: only the read-only check reached Postgres'

[ "$RUNNING_IMAGE" = "sha256:old" ] \
  && pass 'guard: clean data rolls back' \
  || fail 'guard: clean data did not roll back'

# ── 3. Guard reports failing rows: refuse, move nothing ──────────────────────
reset
printf 'SELECT 2;\n' > "$SCRIPT_DIR/rollback-guards/$FULL.sql"
GUARD_COUNTS=(2)
if ( cmd_rollback ) >/dev/null 2>&1; then
  fail 'guard: rollback proceeded over failing rows'
fi
grep -q '^tag ' "$LOG" \
  && fail 'guard: a role tag moved despite refusal' \
  || pass 'guard: failing rows refuse the swap; no tag moved'
grep -q '^stop maia-sovereign' "$LOG" && ! grep -q 'up -d --force-recreate' "$LOG" \
  && pass 'guard: current reader left stopped, previous reader not started' \
  || fail 'guard: reader state after refusal is wrong'

# ── 4. Guard query fails: refuse ─────────────────────────────────────────────
reset
printf 'SELECT 0;\n' > "$SCRIPT_DIR/rollback-guards/$FULL.sql"
GUARD_COUNTS=("ERROR")
if ( cmd_rollback ) >/dev/null 2>&1; then
  fail 'guard: rollback proceeded when the check could not run'
fi
grep -q '^tag ' "$LOG" \
  && fail 'guard: a role tag moved after a failed check' \
  || pass 'guard: an unreadable check refuses the swap'

# ── 5. A repair file is never taken for a guard ──────────────────────────────
reset
printf 'BEGIN; UPDATE x; COMMIT;\n' > "$SCRIPT_DIR/rollback-guards/$FULL.repair.sql"
[ -z "$(rollback_guard_for d49dbc98d)" ] \
  && pass 'guard: .repair.sql alone is not a guard' \
  || fail 'guard: repair file matched as a guard'

# ── 6. Reader still running after stop: refuse before checking ─────────────
reset
PREV_LABEL=""; PREV_ENV="d49dbc98d"
printf 'SELECT 0;\n' > "$SCRIPT_DIR/rollback-guards/$FULL.sql"
STILL_RUNNING="true"; GUARD_COUNTS=(0 0)
if ( cmd_rollback ) >/dev/null 2>&1; then
  fail 'guard: rollback proceeded while the current reader was still running'
fi
! grep -q '^tag ' "$LOG" && ! grep -q '^exec -i maia-postgres' "$LOG" \
  && pass 'guard: a reader that did not stop refuses before the check; no tag moved' \
  || fail 'guard: still-running reader was not refused cleanly'

# ── 7. Guards exist but the previous commit cannot be resolved: fail closed ──
reset
PREV_LABEL=""; PREV_ENV=""
printf 'SELECT 0;\n' > "$SCRIPT_DIR/rollback-guards/$FULL.sql"
if ( cmd_rollback ) >/dev/null 2>&1; then
  fail 'guard: unknown previous commit skipped the guard silently'
fi
grep -q '^tag ' "$LOG" \
  && fail 'guard: a tag moved for an unresolvable previous commit' \
  || pass 'guard: unresolvable previous commit refuses while guards exist'

reset
PREV_LABEL=""; PREV_ENV=""
printf 'SELECT 0;\n' > "$SCRIPT_DIR/rollback-guards/$FULL.sql"
ROLLBACK_UNKNOWN_COMMIT_ACK=1 cmd_rollback
[ "$RUNNING_IMAGE" = "sha256:old" ] \
  && pass 'guard: explicit acknowledgement lets an unresolvable rollback proceed' \
  || fail 'guard: acknowledged rollback did not proceed'
PREV_ENV="oldsha"

printf 'ROLLBACK_PROD_ALIAS_BEHAVIOR=PASS\n'
