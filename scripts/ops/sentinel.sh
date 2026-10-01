#!/usr/bin/env bash
# SENTINEL — one independent watcher for the failures that are silent by nature.
# ============================================================================
#
# Law: monitoring must not depend on what it monitors. The 2026-09-29 → 10-01
# Resend outage ran 2.5 days unseen because every alarm it raised travelled
# by email: `[MAIA/email] TRANSPORT_DOWN` went to a log nobody reads, and the
# uptime monitor alerts THROUGH Resend. So: one channel (Twilio SMS, no email,
# no app code path) and two vantage points.
#
#   primary  (cron on minisforum, every 15 min)
#     1. EMAIL      the delivery ledger: provider_auth / quota / config refusals
#                   in the window, or zero accepted sends while refusals exist
#     2. BACKUP     newest backup file younger than SENTINEL_BACKUP_MAX_HOURS
#     3. REPLICATION pg_stat_replication shows a streaming standby, lag bounded
#     4. DISK       root + docker data usage under SENTINEL_DISK_MAX_PCT
#     then forces one tiny committed transaction (txid_current) — the heartbeat
#     the standby watches. No table, no migration: a commit is a WAL record.
#
#   standby  (cron on the Hetzner standby, every 15 min) — the dead-man's switch
#     pg_last_xact_replay_timestamp() older than SENTINEL_HEARTBEAT_MAX_MIN means
#     either the primary stopped running this script, the primary is down, or
#     replication broke. All three deserve a page, and none of them can be
#     reported by the primary itself.
#
#   test-alert   send one SMS to prove the channel works. Run it once after install.
#
# Alerting is edge-triggered: one SMS when a check turns red, one when it
# recovers, silence in between (state in SENTINEL_STATE_DIR). A check that
# CANNOT run (psql unreachable, file missing) is RED, never green: an unknown
# is not a pass.
#
# Read-only except: the heartbeat commit (no rows written) and its own state dir.
# Secrets: never printed. Twilio credentials are read from the environment, or
# on the primary from the running maia-sovereign container's environment.
set -uo pipefail

MODE="${1:-}"
STATE_DIR="${SENTINEL_STATE_DIR:-$HOME/.sentinel}"
HOSTLABEL="${SENTINEL_HOST_LABEL:-$(hostname -s 2>/dev/null || echo host)}"
EMAIL_WINDOW_MIN="${SENTINEL_EMAIL_WINDOW_MIN:-60}"
BACKUP_GLOB="${SENTINEL_BACKUP_GLOB:-$HOME/MAIA-SOVEREIGN/database/backups/maia_backup_*}"
BACKUP_MAX_HOURS="${SENTINEL_BACKUP_MAX_HOURS:-26}"
REPL_MAX_LAG_SEC="${SENTINEL_REPL_MAX_LAG_SEC:-300}"
DISK_MAX_PCT="${SENTINEL_DISK_MAX_PCT:-85}"
DISK_PATHS="${SENTINEL_DISK_PATHS:-/ /var/lib/docker}"
HEARTBEAT_MAX_MIN="${SENTINEL_HEARTBEAT_MAX_MIN:-45}"

# Overridable so the logic can be exercised without a database (see verify-sentinel.sh).
PSQL_PRIMARY="${SENTINEL_PSQL_PRIMARY:-docker exec maia-postgres psql -U soullab -d maia_consciousness -tAX -v ON_ERROR_STOP=1 -c}"
PSQL_STANDBY="${SENTINEL_PSQL_STANDBY:-psql -U postgres -tAX -v ON_ERROR_STOP=1 -c}"
SMS_CMD="${SENTINEL_SMS_CMD:-}"   # test seam: if set, called as "$SMS_CMD <message>" instead of Twilio

mkdir -p "$STATE_DIR"

# ── alert channel ───────────────────────────────────────────────────────────
twilio_env() {
  # Explicit environment wins; otherwise borrow the app's (primary only).
  local v
  for v in TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN TWILIO_FROM_NUMBER; do
    if [ -z "${!v:-}" ] && command -v docker >/dev/null 2>&1; then
      printf -v "$v" '%s' "$(docker exec maia-sovereign printenv "$v" 2>/dev/null || true)"
    fi
  done
}

send_sms() {
  local msg="[sentinel:$HOSTLABEL] $1"
  if [ -n "$SMS_CMD" ]; then "$SMS_CMD" "$msg"; return $?; fi
  twilio_env
  if [ -z "${TWILIO_ACCOUNT_SID:-}" ] || [ -z "${TWILIO_AUTH_TOKEN:-}" ] || [ -z "${TWILIO_FROM_NUMBER:-}" ] || [ -z "${SENTINEL_ALERT_PHONE:-}" ]; then
    # The channel itself is broken. Say so as loudly as the host allows.
    echo "SENTINEL CHANNEL DOWN: Twilio env or SENTINEL_ALERT_PHONE missing. Undelivered: $msg" >&2
    logger -t sentinel "CHANNEL DOWN: $msg" 2>/dev/null || true
    return 1
  fi
  local phone rc=0
  for phone in ${SENTINEL_ALERT_PHONE//,/ }; do
    curl -fsS --max-time 20 -o /dev/null \
      -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
      --data-urlencode "From=$TWILIO_FROM_NUMBER" \
      --data-urlencode "To=$phone" \
      --data-urlencode "Body=$msg" \
      "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json" || rc=1
  done
  [ "$rc" -eq 0 ] || echo "SENTINEL CHANNEL DOWN: Twilio send failed. Undelivered: $msg" >&2
  return "$rc"
}

# ── edge-triggered reporting ────────────────────────────────────────────────
RED_COUNT=0
report() {  # report <check> <ok|red> <detail>
  local check="$1" status="$2" detail="$3" f="$STATE_DIR/$1.state" prev
  prev="$(cat "$f" 2>/dev/null || echo ok)"
  printf '%s %-12s %s %s\n' "$(date -u +%FT%TZ)" "$check" "$status" "$detail"
  if [ "$status" = red ]; then
    RED_COUNT=$((RED_COUNT + 1))
    # Only advance state if the page actually went out — otherwise retry next run.
    if [ "$prev" != red ]; then send_sms "RED $check: $detail" && echo red > "$f"; fi
  else
    if [ "$prev" = red ]; then send_sms "recovered $check: $detail" && echo ok > "$f"; else echo ok > "$f"; fi
  fi
}

q() { $PSQL_PRIMARY "$1" 2>/dev/null; }

# ── checks ──────────────────────────────────────────────────────────────────
check_email() {
  local row
  if ! row="$(q "SELECT count(*) FILTER (WHERE state='accepted'),
                        count(*) FILTER (WHERE state='refused' AND failure_class IN ('provider_auth','quota_exceeded','provider_config','not_configured'))
                   FROM email_delivery_attempts
                  WHERE created_at > now() - interval '$EMAIL_WINDOW_MIN minutes'")"; then
    report email red "ledger unreadable"; return
  fi
  local accepted="${row%%|*}" transport="${row##*|}"
  if [ "${transport:-0}" -gt 0 ]; then
    report email red "$transport transport-wide refusals in ${EMAIL_WINDOW_MIN}m ($accepted accepted). Members may be locked out of sign-in."
  else
    report email ok "accepted=$accepted transport_refusals=0 (${EMAIL_WINDOW_MIN}m)"
  fi
}

check_backup() {
  local newest age_h
  # shellcheck disable=SC2086
  newest="$(ls -1t $BACKUP_GLOB 2>/dev/null | head -1)"
  if [ -z "$newest" ]; then report backup red "no file matches $BACKUP_GLOB"; return; fi
  age_h=$(( ( $(date +%s) - $(stat -c %Y "$newest" 2>/dev/null || stat -f %m "$newest") ) / 3600 ))
  if [ ! -s "$newest" ]; then report backup red "newest backup is empty: $(basename "$newest")"
  elif [ "$age_h" -gt "$BACKUP_MAX_HOURS" ]; then report backup red "newest backup ${age_h}h old (max ${BACKUP_MAX_HOURS}h)"
  else report backup ok "${age_h}h old: $(basename "$newest")"; fi
}

check_replication() {
  local row
  if ! row="$(q "SELECT count(*), coalesce(max(extract(epoch FROM replay_lag))::int, -1)
                   FROM pg_stat_replication WHERE state = 'streaming'")"; then
    report replication red "pg_stat_replication unreadable"; return
  fi
  local n="${row%%|*}" lag="${row##*|}"
  if [ "${n:-0}" -lt 1 ]; then report replication red "no streaming standby connected"
  elif [ "$lag" -gt "$REPL_MAX_LAG_SEC" ]; then report replication red "replay lag ${lag}s (max ${REPL_MAX_LAG_SEC}s)"
  else report replication ok "standbys=$n lag=${lag}s"; fi
}

check_disk() {
  local p pct worst=0 worst_p=""
  for p in $DISK_PATHS; do
    [ -e "$p" ] || continue
    pct="$(df -P "$p" 2>/dev/null | awk 'NR==2{gsub("%","",$5); print $5}')"
    [ -n "$pct" ] || { report disk red "df failed on $p"; return; }
    if [ "$pct" -gt "$worst" ]; then worst="$pct"; worst_p="$p"; fi
  done
  if [ "$worst" -ge "$DISK_MAX_PCT" ]; then report disk red "$worst_p at ${worst}% (max ${DISK_MAX_PCT}%)"
  else report disk ok "max ${worst}% ($worst_p)"; fi
}

heartbeat() {
  # A committed transaction with an assigned xid = one WAL commit record that
  # the standby replays and timestamps. Writes no row.
  q "BEGIN; SELECT txid_current(); COMMIT;" >/dev/null || report heartbeat red "could not commit heartbeat"
}

check_deadman() {
  local age
  if ! age="$($PSQL_STANDBY "SELECT coalesce(extract(epoch FROM now() - pg_last_xact_replay_timestamp())::int, -1)" 2>/dev/null)"; then
    report deadman red "standby postgres unreadable"; return
  fi
  if [ "$age" -lt 0 ]; then report deadman red "standby has never replayed a transaction"
  elif [ "$age" -gt $((HEARTBEAT_MAX_MIN * 60)) ]; then
    report deadman red "no heartbeat from primary for $((age / 60))m: primary down, its sentinel stopped, or replication broken"
  else report deadman ok "last replayed commit $((age / 60))m ago"; fi
}

case "$MODE" in
  primary)    check_email; check_backup; check_replication; check_disk; heartbeat ;;
  standby)    check_deadman ;;
  test-alert) send_sms "test alert: channel works ($(date -u +%FT%TZ))" && echo "sent"; exit $? ;;
  *) echo "usage: $0 primary|standby|test-alert" >&2; exit 2 ;;
esac
[ "$RED_COUNT" -eq 0 ]
