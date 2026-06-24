#!/usr/bin/env bash
#
# MAIA Route 53 Dynamic DNS updater.
#
# WHY THIS EXISTS
#   Residential AT&T hands minisforum a DYNAMIC public IP. A long-enough power
#   outage drops the DHCP lease and the ISP assigns a new public IP. The
#   soullab.life A records in Route 53 are static, so after a rotation they
#   point at a dead address and the public edge goes silently dark on cellular
#   (Wi-Fi/LAN keep working via the /etc/hosts split-horizon, which hides it).
#   Verified outage 2026-06-01: 32.220.246.146 -> 32.219.7.166.
#   See memory/project_minisforum_lan_ip_drift_trap.md (the WAN-IP-rotation trap,
#   distinct from the LAN-IP-drift trap).
#
# WHAT IT DOES
#   1. Reads the TRUE current public egress IP via an HTTPS echo. Uses
#      checkip.amazonaws.com (an AWS endpoint), NOT a DNS-echo method: on this
#      network the DNS path is proxied through Cloudflare, so dig-based egress
#      probes are confounded. HTTP echo reports the real TCP egress.
#   2. Reads the apex's currently-published A value straight from Route 53
#      (authoritative, no resolver cache).
#   3. If they differ, UPSERTs every managed soullab.life A record to the new IP
#      in a single change batch, then logs old -> new.
#   Idempotent: when the IP is unchanged it makes no change call.
#
# AUTH (no secret in this file or in git)
#   AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_DEFAULT_REGION /
#   ROUTE53_HOSTED_ZONE_ID come from the environment. Under systemd they are
#   injected by EnvironmentFile=/etc/maia-ddns/credentials (root-only, mode 600).
#   For manual runs, this script sources that file if the vars are unset.
#
# SCOPE: the soullab.life hosted zone only. jlmasterhandyman.com is a separate
#   hosted zone and is intentionally NOT managed here.

set -euo pipefail

CREDENTIALS_FILE="${MAIA_DDNS_CREDENTIALS:-/etc/maia-ddns/credentials}"
TTL=300

# Managed soullab.life A records (all share one public IP). Apex first.
RECORDS=(
  soullab.life
  www.soullab.life
  api.soullab.life
  maia.soullab.life
  oldhead.soullab.life
  kelly.soullab.life
  nathan.soullab.life
  chart.soullab.life
  marc.soullab.life
  jondi.soullab.life
  elementalalchemy.soullab.life
  loralee.soullab.life
  nostr.soullab.life
  demo.soullab.life
  jeremy.soullab.life
  rudeboy.soullab.life
)

log() { echo "[maia-ddns] $*"; }
die() { echo "[maia-ddns] ERROR: $*" >&2; exit 1; }

# Load credentials/zone from the root-only env file when not already in the
# environment (covers manual invocation outside systemd).
if [[ -z "${AWS_ACCESS_KEY_ID:-}" || -z "${ROUTE53_HOSTED_ZONE_ID:-}" ]]; then
  [[ -r "$CREDENTIALS_FILE" ]] || die "credentials file not readable: $CREDENTIALS_FILE"
  set -a; . "$CREDENTIALS_FILE"; set +a
fi

: "${AWS_ACCESS_KEY_ID:?missing AWS_ACCESS_KEY_ID}"
: "${AWS_SECRET_ACCESS_KEY:?missing AWS_SECRET_ACCESS_KEY}"
: "${ROUTE53_HOSTED_ZONE_ID:?missing ROUTE53_HOSTED_ZONE_ID}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

command -v aws >/dev/null 2>&1 || die "aws CLI not found on PATH"

# 1. True public egress IP. HTTPS echo to an AWS endpoint, with an ipify
#    fallback. Validate strict IPv4 before trusting either result.
fetch_ip() {
  local ip
  ip="$(curl -fsS --max-time 10 https://checkip.amazonaws.com 2>/dev/null | tr -d '[:space:]')" || true
  if [[ ! "$ip" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
    ip="$(curl -fsS --max-time 10 https://api.ipify.org 2>/dev/null | tr -d '[:space:]')" || true
  fi
  echo "$ip"
}

PUBLIC_IP="$(fetch_ip)"
[[ "$PUBLIC_IP" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]] \
  || die "could not determine a valid public IPv4 (got: '${PUBLIC_IP}')"

# 2. Read every A record in the zone in ONE authoritative call (no resolver
#    cache), then check whether any MANAGED record drifts from the public IP.
#    This makes the updater self-reconciling: it fixes stale records even when
#    the apex already happens to be correct (e.g. today's leftover subdomains).
published="$(aws route53 list-resource-record-sets \
  --hosted-zone-id "$ROUTE53_HOSTED_ZONE_ID" \
  --query "ResourceRecordSets[?Type=='A'].[Name,ResourceRecords[0].Value]" \
  --output text 2>/dev/null || true)"

needs_update=false
for name in "${RECORDS[@]}"; do
  cur="$(awk -v n="${name}." '$1==n {print $2; exit}' <<<"$published")"
  if [[ "$cur" != "$PUBLIC_IP" ]]; then
    needs_update=true
    log "drift: ${name} = ${cur:-<missing>} (want ${PUBLIC_IP})"
  fi
done

if [[ "$needs_update" != true ]]; then
  log "no change: all ${#RECORDS[@]} records already at ${PUBLIC_IP}"
  exit 0
fi

# 3. Build one UPSERT change batch covering every managed record.
changes="$(
  for name in "${RECORDS[@]}"; do
    printf '{"Action":"UPSERT","ResourceRecordSet":{"Name":"%s","Type":"A","TTL":%d,"ResourceRecords":[{"Value":"%s"}]}},' \
      "$name" "$TTL" "$PUBLIC_IP"
  done | sed 's/,$//'
)"
batch="{\"Comment\":\"maia-ddns reconcile soullab.life A records -> ${PUBLIC_IP}\",\"Changes\":[${changes}]}"

change_id="$(aws route53 change-resource-record-sets \
  --hosted-zone-id "$ROUTE53_HOSTED_ZONE_ID" \
  --change-batch "$batch" \
  --query 'ChangeInfo.Id' --output text)" \
  || die "change-resource-record-sets failed"

log "submitted change ${change_id}: ${#RECORDS[@]} records -> ${PUBLIC_IP}"
