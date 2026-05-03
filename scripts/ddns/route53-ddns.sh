#!/usr/bin/env bash
# route53-ddns.sh — keep AWS Route 53 A records pointed at this host's current WAN IP.
#
# Behavior:
#   1. Detect WAN IP from multiple sources (first success wins).
#   2. Compare to cached IP in $STATE_DIR/current-ip.
#   3. If unchanged, log JSON event "no_change" and exit 0.
#   4. If changed (or first run), discover all A records in $HOSTED_ZONE_ID that
#      point at the OLD cached IP and UPSERT them to the new IP. First run with
#      no cache only writes the cache and emits a "baseline" event — no changes.
#   5. Update cache file.
#
# Logs are JSON lines on stdout (captured by journalctl when run via systemd).
#
# Config (read from /etc/route53-ddns/config or env):
#   HOSTED_ZONE_ID   Route 53 hosted zone ID (e.g. Z01234567ABCDEFGH)
#   DNS_NAME         Canonical zone name for sanity check (e.g. soullab.life)
#   STATE_DIR        Where to keep ip-history cache (default /var/lib/route53-ddns)
#   HISTORY_DEPTH    How many recent IPs to retain for matching (default 3)
#   WEBHOOK_URL      Optional. POST a JSON payload on every "updated" /
#                    "ip_changed_no_matching_records" event. Slack/Discord/
#                    generic-JSON compatible. Failures do not abort the run.
#   DRY_RUN          If "1", do everything except submit the change batch.

set -euo pipefail

CONFIG_FILE="${CONFIG_FILE:-/etc/route53-ddns/config}"
[ -f "$CONFIG_FILE" ] && . "$CONFIG_FILE"

STATE_DIR="${STATE_DIR:-/var/lib/route53-ddns}"
HISTORY_DEPTH="${HISTORY_DEPTH:-3}"
DRY_RUN="${DRY_RUN:-0}"
DNS_NAME="${DNS_NAME:-}"
HOSTED_ZONE_ID="${HOSTED_ZONE_ID:-}"
WEBHOOK_URL="${WEBHOOK_URL:-}"

mkdir -p "$STATE_DIR"
HISTORY_FILE="$STATE_DIR/ip-history"

emit_payload() {
  local event="$1"; shift
  local extra=""
  if [ "$#" -gt 0 ]; then extra=",$*"; fi
  printf '{"ts":"%s","event":"%s","host":"%s"%s}' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    "$event" \
    "$(hostname -s)" \
    "$extra"
}

log_json() {
  emit_payload "$@"
  echo
}

post_webhook() {
  [ -z "$WEBHOOK_URL" ] && return 0
  local payload="$1"
  if ! curl -fsS --max-time 10 -X POST \
        -H 'Content-Type: application/json' \
        -d "$payload" \
        "$WEBHOOK_URL" >/dev/null 2>&1; then
    log_json "webhook_failed" "\"hint\":\"check WEBHOOK_URL or network\""
  fi
}

die() {
  log_json "error" "\"message\":\"$1\""
  exit 1
}

require() {
  command -v "$1" >/dev/null 2>&1 || die "missing dependency: $1"
}

require curl
require aws
require jq

# --- IP history helpers -----------------------------------------------------

read_history() {
  [ -f "$HISTORY_FILE" ] || return 0
  cat "$HISTORY_FILE"
}

current_cached_ip() {
  read_history | head -1
}

history_json_array() {
  read_history | jq -R . | jq -s .
}

prepend_history() {
  local ip="$1"
  local tmp
  tmp="$(mktemp)"
  {
    echo "$ip"
    read_history | grep -Fxv "$ip" 2>/dev/null || true
  } | head -n "$HISTORY_DEPTH" > "$tmp"
  mv "$tmp" "$HISTORY_FILE"
}

[ -n "$HOSTED_ZONE_ID" ] || die "HOSTED_ZONE_ID not set"
[ -n "$DNS_NAME" ] || die "DNS_NAME not set"

detect_ip() {
  local sources=(
    "https://api.ipify.org"
    "https://ifconfig.me"
    "https://icanhazip.com"
    "https://ipv4.icanhazip.com"
  )
  for url in "${sources[@]}"; do
    local ip
    ip="$(curl -fsS --max-time 5 --resolve-timeout 3 "$url" 2>/dev/null | tr -d '[:space:]' || true)"
    if [[ "$ip" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      echo "$ip"
      return 0
    fi
  done
  return 1
}

NEW_IP="$(detect_ip)" || die "could not detect WAN IP from any source"

OLD_IP="$(current_cached_ip)"

# --- Baseline path: no history yet -----------------------------------------
if [ -z "$OLD_IP" ]; then
  RECORDS_JSON="$(aws route53 list-resource-record-sets \
    --hosted-zone-id "$HOSTED_ZONE_ID" \
    --output json 2>/dev/null)" || die "list-resource-record-sets failed"

  BASELINE_NAMES="$(echo "$RECORDS_JSON" | jq --arg ip "$NEW_IP" -c '
    [.ResourceRecordSets[]
     | select(.Type == "A")
     | select(.AliasTarget == null)
     | select(any(.ResourceRecords[]?; .Value == $ip))
     | .Name]
  ')"
  BASELINE_COUNT="$(echo "$BASELINE_NAMES" | jq 'length')"
  TOTAL_A="$(echo "$RECORDS_JSON" | jq '[.ResourceRecordSets[] | select(.Type == "A") | select(.AliasTarget == null)] | length')"

  prepend_history "$NEW_IP"
  log_json "baseline" \
    "\"ip\":\"$NEW_IP\",\"matching_a_records\":$BASELINE_COUNT,\"total_a_records\":$TOTAL_A,\"records\":$BASELINE_NAMES,\"note\":\"baseline established; no DNS changes made\""
  exit 0
fi

# --- Steady state: IP unchanged --------------------------------------------
if [ "$OLD_IP" = "$NEW_IP" ]; then
  log_json "no_change" "\"ip\":\"$NEW_IP\""
  exit 0
fi

# --- IP changed: reconcile A records ---------------------------------------
# Match against the rolling history window so a record stranded at IP[t-2]
# (because IP changed twice between runs) still gets caught.
KNOWN_IPS_JSON="$(history_json_array)"

RECORDS_JSON="$(aws route53 list-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --output json 2>/dev/null)" || die "list-resource-record-sets failed"

CHANGES_JSON="$(echo "$RECORDS_JSON" | jq --argjson known "$KNOWN_IPS_JSON" --arg new "$NEW_IP" '
  [
    .ResourceRecordSets[]
    | select(.Type == "A")
    | select(.AliasTarget == null)
    | select(any(.ResourceRecords[]?; .Value as $v | $known | index($v)))
    | {
        Action: "UPSERT",
        ResourceRecordSet: {
          Name: .Name,
          Type: .Type,
          TTL: (.TTL // 300),
          ResourceRecords: [{Value: $new}]
        }
      }
  ]
')"

CHANGE_COUNT="$(echo "$CHANGES_JSON" | jq 'length')"
CHANGE_NAMES="$(echo "$CHANGES_JSON" | jq -c '[.[].ResourceRecordSet.Name]')"

if [ "$CHANGE_COUNT" -eq 0 ]; then
  prepend_history "$NEW_IP"
  PAYLOAD="$(emit_payload "ip_changed_no_matching_records" \
    "\"old_ip\":\"$OLD_IP\",\"new_ip\":\"$NEW_IP\",\"history\":$KNOWN_IPS_JSON,\"warning\":\"IP changed but zero A records matched any known historical IP — DNS may have drifted\"")"
  echo "$PAYLOAD"
  post_webhook "$PAYLOAD"
  exit 0
fi

BATCH_JSON="$(jq -n \
  --arg comment "ddns: $OLD_IP -> $NEW_IP at $(date -u +%FT%TZ)" \
  --argjson changes "$CHANGES_JSON" \
  '{Comment: $comment, Changes: $changes}')"

if [ "$DRY_RUN" = "1" ]; then
  log_json "dry_run" \
    "\"old_ip\":\"$OLD_IP\",\"new_ip\":\"$NEW_IP\",\"history\":$KNOWN_IPS_JSON,\"records\":$CHANGE_NAMES,\"count\":$CHANGE_COUNT"
  echo "$BATCH_JSON" | jq .
  exit 0
fi

CHANGE_RESPONSE="$(aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch "$BATCH_JSON" \
  --output json 2>/dev/null)" || die "change-resource-record-sets failed"

CHANGE_ID="$(echo "$CHANGE_RESPONSE" | jq -r '.ChangeInfo.Id')"
prepend_history "$NEW_IP"

PAYLOAD="$(emit_payload "updated" \
  "\"old_ip\":\"$OLD_IP\",\"new_ip\":\"$NEW_IP\",\"records\":$CHANGE_NAMES,\"count\":$CHANGE_COUNT,\"change_id\":\"$CHANGE_ID\"")"
echo "$PAYLOAD"
post_webhook "$PAYLOAD"
