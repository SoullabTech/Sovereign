#!/usr/bin/env bash
# scan-auth-incidents.sh
#
# Scans Caddy access logs + onboarding_events table for redirect-loop signatures.
# Run manually for visibility; cron later if signal proves useful.
#
# Usage:
#   ./scripts/scan-auth-incidents.sh           # last 24h
#   ./scripts/scan-auth-incidents.sh 6         # last 6h
#   ./scripts/scan-auth-incidents.sh 168       # last week
#
# What "redirect-loop signature" means here:
#   ≥3 hits to /signin?reason=… from the same remote_ip within a 60s window.
#
# Reads /var/log/caddy/access.log inside maia-caddy via `docker exec`.
# Requires jq on the host (brew install jq).

set -euo pipefail

CADDY_CONTAINER="${CADDY_CONTAINER:-maia-caddy}"
DB_CONTAINER="${DB_CONTAINER:-maia-postgres}"
DB_NAME="${DB_NAME:-maia_consciousness}"
DB_USER="${DB_USER:-soullab}"
HOURS="${1:-24}"
LOG_PATH="${LOG_PATH:-/var/log/caddy/access.log}"
WINDOW_SECONDS="${WINDOW_SECONDS:-60}"
THRESHOLD="${THRESHOLD:-3}"

if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is required (brew install jq)" >&2
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${CADDY_CONTAINER}$"; then
  echo "ERROR: container ${CADDY_CONTAINER} not running" >&2
  exit 1
fi

NOW_EPOCH=$(date +%s)
SINCE_EPOCH=$((NOW_EPOCH - HOURS * 3600))

echo
echo "=== AUTH INCIDENT SCAN (last ${HOURS}h) ==="
echo "Window: ≥${THRESHOLD} /signin?reason=… hits from same IP in ${WINDOW_SECONDS}s"
echo

# --- 1. Pull /signin?reason=… entries from Caddy access log -------------------
# Caddy default JSON log: ts (float epoch), request.remote_ip, request.uri,
# request.headers."User-Agent" (array), status.
echo "--- Caddy log: /signin?reason=… hits by IP ---"
TMP_HITS=$(mktemp)
trap 'rm -f "$TMP_HITS"' EXIT

docker exec "$CADDY_CONTAINER" cat "$LOG_PATH" 2>/dev/null \
  | jq -r --argjson since "$SINCE_EPOCH" '
      select(.ts >= $since)
      | select(.request.uri | test("^/signin\\?.*reason="))
      | [
          (.ts | tostring),
          (.request.remote_ip // "?"),
          (.request.uri // ""),
          ((.request.headers["User-Agent"] // [""])[0] | .[0:60])
        ]
      | @tsv
    ' > "$TMP_HITS" 2>/dev/null || true

TOTAL_HITS=$(wc -l < "$TMP_HITS" | tr -d ' ')
echo "Total /signin?reason=… hits in window: ${TOTAL_HITS}"

if [ "$TOTAL_HITS" = "0" ]; then
  echo "  (none — Caddy log either empty, not mounted, or no incidents)"
else
  echo
  echo "Top IPs by hit count:"
  awk -F'\t' '{print $2}' "$TMP_HITS" | sort | uniq -c | sort -rn | head -10
  echo
  echo "Reason-code breakdown:"
  awk -F'\t' '{ match($3, /reason=[^&]+/); if (RSTART>0) print substr($3, RSTART+7, RLENGTH-7) }' "$TMP_HITS" \
    | sort | uniq -c | sort -rn
fi

# --- 2. Detect bounce signature (≥THRESHOLD hits within WINDOW_SECONDS) ------
echo
echo "--- Redirect-loop signatures (≥${THRESHOLD} hits in ${WINDOW_SECONDS}s per IP) ---"

if [ "$TOTAL_HITS" != "0" ]; then
  # Group by IP, scan timestamps with a sliding window
  awk -F'\t' -v win="$WINDOW_SECONDS" -v thresh="$THRESHOLD" '
    {
      ip = $2; ts = $1 + 0
      n = ++count[ip]
      times[ip,n] = ts
      ua[ip] = $4
    }
    END {
      for (ip in count) {
        n = count[ip]
        # sort timestamps in place (insertion sort, small n)
        for (i = 2; i <= n; i++) {
          v = times[ip,i]; j = i
          while (j > 1 && times[ip,j-1] > v) { times[ip,j] = times[ip,j-1]; j-- }
          times[ip,j] = v
        }
        # sliding window
        max_in_window = 0
        for (i = 1; i <= n; i++) {
          c = 1
          for (k = i+1; k <= n && times[ip,k] - times[ip,i] <= win; k++) c++
          if (c > max_in_window) max_in_window = c
        }
        if (max_in_window >= thresh) {
          printf "  ip=%s peak=%d total=%d ua=%s\n", ip, max_in_window, n, ua[ip]
        }
      }
    }
  ' "$TMP_HITS" | sort -t= -k3 -rn
fi

# --- 3. Cross-check with onboarding_events table -----------------------------
echo
echo "--- onboarding_events: redirect_loop_detected (last ${HOURS}h) ---"
if docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  docker exec "$DB_CONTAINER" psql -U "$DB_USER" "$DB_NAME" -tA -c "
    SELECT to_char(created_at, 'YYYY-MM-DD HH24:MI:SS')
         , COALESCE(member_id::text, '—')
         , COALESCE(metadata->>'reason', '?')
         , COALESCE(metadata->>'bounces', '?')
         , COALESCE(substring(metadata->>'ua' from 1 for 50), '—')
    FROM onboarding_events
    WHERE event = 'redirect_loop_detected'
      AND created_at >= NOW() - INTERVAL '${HOURS} hours'
    ORDER BY created_at DESC
    LIMIT 25;
  " 2>/dev/null | awk -F'|' 'NF>1 {printf "  %s  member=%s  reason=%s  bounces=%s  ua=%s\n", $1, $2, $3, $4, $5}' \
    || echo "  (table may not exist yet — fires on first incident)"
else
  echo "  (db container ${DB_CONTAINER} not running, skipping)"
fi

echo
echo "Done."
