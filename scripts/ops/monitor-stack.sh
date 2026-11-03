#!/bin/bash
# MAIA production stack monitor — Stage 0 (runs on minisforum).
# Checks: core container health · postgres liveness · disk headroom ·
# backup freshness (local nightly + encrypted offsite staging).
# Exit 0 = all green (pings HEARTBEAT_MONITOR_URL if set — dead-man switch:
# if this stops pinging, the alert fires without any infra on our side).
# Exit 1 = one or more failures (pings $HEARTBEAT_MONITOR_URL/fail and, if
# NOTIFY_CMD is set, pipes the failure summary to it).
#
# Config file (optional): ~/.maia-backup.env
set -uo pipefail

CONFIG_FILE="${CONFIG_FILE:-$HOME/.maia-backup.env}"
[ -f "$CONFIG_FILE" ] && . "$CONFIG_FILE"

CORE_CONTAINERS="${CORE_CONTAINERS:-maia-postgres maia-sovereign maia-api maia-caddy}"
DISK_THRESHOLD_PCT="${DISK_THRESHOLD_PCT:-90}"
LOCAL_BACKUP_DIR="${LOCAL_BACKUP_DIR:-$HOME/MAIA-SOVEREIGN/database/backups}"
OFFSITE_STAGING_DIR="${OFFSITE_STAGING_DIR:-$HOME/backups/offsite}"
MAX_BACKUP_AGE_HOURS="${MAX_BACKUP_AGE_HOURS:-26}"
HEARTBEAT_MONITOR_URL="${HEARTBEAT_MONITOR_URL:-}"
NOTIFY_CMD="${NOTIFY_CMD:-}"   # e.g. a script that posts to ntfy/email; receives summary on stdin

failures=()
note() { echo "[monitor] $1"; }
bad()  { failures+=("$1"); echo "[monitor] FAIL: $1"; }

# 1. Containers running (and healthy, when a healthcheck exists).
for c in $CORE_CONTAINERS; do
  state=$(docker inspect "$c" --format '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{else}}nohc{{end}}' 2>/dev/null) \
    || { bad "container $c: not found"; continue; }
  case "$state" in
    "running healthy"|"running nohc") note "container $c: ok ($state)" ;;
    *) bad "container $c: $state" ;;
  esac
done

# 2. Postgres answering.
if docker exec maia-postgres pg_isready -U soullab -d maia_consciousness >/dev/null 2>&1; then
  note "postgres: accepting connections"
else
  bad "postgres: pg_isready failed"
fi

# 3. Disk headroom on /.
used_pct=$(df --output=pcent / | tail -1 | tr -dc '0-9')
if [ "$used_pct" -ge "$DISK_THRESHOLD_PCT" ]; then
  bad "disk: ${used_pct}% used (threshold ${DISK_THRESHOLD_PCT}%)"
else
  note "disk: ${used_pct}% used"
fi

# 4. Backup freshness — a stale backup is a silent failure.
check_fresh() { # label dir glob
  local newest
  newest=$(find "$2" -maxdepth 1 -name "$3" -mmin "-$((MAX_BACKUP_AGE_HOURS * 60))" 2>/dev/null | head -1)
  if [ -n "$newest" ]; then
    note "$1: fresh (<${MAX_BACKUP_AGE_HOURS}h)"
  else
    bad "$1: no backup newer than ${MAX_BACKUP_AGE_HOURS}h in $2"
  fi
}
check_fresh "local nightly backup" "$LOCAL_BACKUP_DIR" "maia_backup_*.sql.gz"
[ -d "$OFFSITE_STAGING_DIR" ] && check_fresh "encrypted offsite artifact" "$OFFSITE_STAGING_DIR" "maia_*.dump.gpg"

# 5. Report.
if [ ${#failures[@]} -eq 0 ]; then
  note "ALL OK"
  [ -n "$HEARTBEAT_MONITOR_URL" ] && curl -fsS -m 10 --retry 3 "$HEARTBEAT_MONITOR_URL" >/dev/null 2>&1
  exit 0
else
  summary=$(printf 'MAIA stack monitor failures on %s:\n%s\n' "$(hostname)" "$(printf ' - %s\n' "${failures[@]}")")
  echo "$summary"
  [ -n "$HEARTBEAT_MONITOR_URL" ] && curl -fsS -m 10 --retry 3 "$HEARTBEAT_MONITOR_URL/fail" >/dev/null 2>&1
  [ -n "$NOTIFY_CMD" ] && echo "$summary" | $NOTIFY_CMD || true
  exit 1
fi
