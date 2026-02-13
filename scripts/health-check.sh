#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# MAIA Infrastructure Health Check
# ═══════════════════════════════════════════════════════════════════════════════
#
# Server-side health check that writes structured results to a log file
# and records infrastructure confidence in PostgreSQL.
#
# Run manually:   ./scripts/health-check.sh
# Scheduled via:  life.soullab.health-check.plist (every 5 minutes)
#
# Policy reference: .claude/skills/09_member-field-care.md
# "If uncertain, default to silence."
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────

LOG_DIR="${HOME}/maia-logs"
LOG_FILE="${LOG_DIR}/health.log"
BACKUP_DIR="${HOME}/maia-backups"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Core production containers (the ones that matter for member-facing service)
EXPECTED_CONTAINERS=(
  "maia-sovereign"
  "maia-api"
  "maia-caddy"
  "maia-postgres"
  "maia-comms-worker"
  "maia-summary-worker"
)
EXPECTED_COUNT=${#EXPECTED_CONTAINERS[@]}

# ─── Setup ────────────────────────────────────────────────────────────────────

mkdir -p "$LOG_DIR"

# ─── Check: Docker containers ─────────────────────────────────────────────────

containers_up=0
containers_down=()

for container in "${EXPECTED_CONTAINERS[@]}"; do
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${container}$"; then
    containers_up=$((containers_up + 1))
  else
    containers_down+=("$container")
  fi
done

# ─── Check: API health endpoint ───────────────────────────────────────────────

api_status="fail"
db_status="fail"
db_latency=0

api_response=$(curl -s --connect-timeout 5 --max-time 10 http://localhost:3001/v1/health 2>/dev/null || echo '{}')

if echo "$api_response" | grep -q '"status"'; then
  api_health=$(echo "$api_response" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
  if [ "$api_health" = "healthy" ] || [ "$api_health" = "degraded" ]; then
    api_status="ok"
  fi

  # Extract DB latency
  db_conn=$(echo "$api_response" | grep -o '"status":"connected"' || true)
  if [ -n "$db_conn" ]; then
    db_status="ok"
    db_latency=$(echo "$api_response" | grep -o '"latency":[0-9]*' | head -1 | cut -d: -f2 || echo "0")
  fi
fi

# ─── Check: Queue depths ──────────────────────────────────────────────────────

comms_queue=0
summary_queue=0
failed_jobs=0

if docker exec maia-postgres psql -U soullab -d maia_consciousness -t -A \
    -c "SELECT 1" >/dev/null 2>&1; then

  # Comms analysis queue depth
  comms_queue=$(docker exec maia-postgres psql -U soullab -d maia_consciousness -t -A \
    -c "SELECT COALESCE(COUNT(*), 0) FROM comms_analysis_queue WHERE status = 'queued'" 2>/dev/null || echo "0")
  comms_queue=$(echo "$comms_queue" | tr -d '[:space:]')

  # Session summary queue depth
  summary_queue=$(docker exec maia-postgres psql -U soullab -d maia_consciousness -t -A \
    -c "SELECT COALESCE(COUNT(*), 0) FROM session_summary_queue WHERE status = 'queued'" 2>/dev/null || echo "0")
  summary_queue=$(echo "$summary_queue" | tr -d '[:space:]')

  # Total failed jobs across both queues
  failed_comms=$(docker exec maia-postgres psql -U soullab -d maia_consciousness -t -A \
    -c "SELECT COALESCE(COUNT(*), 0) FROM comms_analysis_queue WHERE status = 'failed'" 2>/dev/null || echo "0")
  failed_summary=$(docker exec maia-postgres psql -U soullab -d maia_consciousness -t -A \
    -c "SELECT COALESCE(COUNT(*), 0) FROM session_summary_queue WHERE status = 'failed'" 2>/dev/null || echo "0")
  failed_comms=$(echo "$failed_comms" | tr -d '[:space:]')
  failed_summary=$(echo "$failed_summary" | tr -d '[:space:]')
  failed_jobs=$((failed_comms + failed_summary))
fi

# ─── Check: Disk space ────────────────────────────────────────────────────────

disk_pct=$(df -h / 2>/dev/null | awk 'NR==2{print $5}' | tr -d '%' || echo "0")

# ─── Check: Last backup ──────────────────────────────────────────────────────

last_backup="none"
if [ -d "$BACKUP_DIR" ]; then
  newest_backup=$(ls -t "$BACKUP_DIR"/maia_backup_*.sql.gz 2>/dev/null | head -1 || true)
  if [ -n "$newest_backup" ]; then
    # Extract timestamp from filename: maia_backup_YYYYMMDD_HHMMSS.sql.gz
    backup_ts=$(basename "$newest_backup" | sed 's/maia_backup_//;s/\.sql\.gz//')
    last_backup=$(echo "$backup_ts" | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)_\([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3T\4:\5:\6Z/')
  fi
fi

# ─── Compute confidence ──────────────────────────────────────────────────────

confidence="high"

# LOW: critical failures
if [ "$api_status" = "fail" ] || [ "$db_status" = "fail" ]; then
  confidence="low"
elif [ "$containers_up" -lt $((EXPECTED_COUNT - 1)) ]; then
  confidence="low"
# MEDIUM: degraded but functional
elif [ "$containers_up" -lt "$EXPECTED_COUNT" ]; then
  confidence="medium"
elif [ "$comms_queue" -gt 20 ] || [ "$summary_queue" -gt 20 ]; then
  confidence="medium"
elif [ "$failed_jobs" -gt 0 ]; then
  confidence="medium"
elif [ "$disk_pct" -gt 85 ]; then
  confidence="medium"
fi

# ─── Write to log file ───────────────────────────────────────────────────────

log_line="[${TIMESTAMP}] CONFIDENCE=${confidence} CONTAINERS=${containers_up}/${EXPECTED_COUNT} API=${api_status} DB=${db_status}(${db_latency}ms) COMMS_QUEUE=${comms_queue} SUMMARY_QUEUE=${summary_queue} FAILED_JOBS=${failed_jobs} DISK=${disk_pct}% LAST_BACKUP=${last_backup}"

if [ ${#containers_down[@]} -gt 0 ]; then
  log_line="${log_line} DOWN=$(IFS=,; echo "${containers_down[*]}")"
fi

echo "$log_line" >> "$LOG_FILE"

# ─── Write to database ───────────────────────────────────────────────────────

# Write confidence snapshot to PostgreSQL (for memberMessageGate to read)
docker exec maia-postgres psql -U soullab -d maia_consciousness -c "
  INSERT INTO infra_health_snapshots
    (checked_at, confidence, containers_up, containers_total, api_healthy, db_latency_ms,
     comms_queue_depth, summary_queue_depth, failed_jobs, details)
  VALUES
    ('${TIMESTAMP}', '${confidence}', ${containers_up}, ${EXPECTED_COUNT},
     $([ "$api_status" = "ok" ] && echo "true" || echo "false"),
     ${db_latency:-0}, ${comms_queue:-0}, ${summary_queue:-0}, ${failed_jobs:-0},
     '{\"disk_pct\": ${disk_pct}, \"last_backup\": \"${last_backup}\"}'::jsonb);
" 2>/dev/null || echo "[${TIMESTAMP}] WARNING: Could not write health snapshot to database" >> "$LOG_FILE"

# ─── Prune old snapshots (keep 7 days) ────────────────────────────────────────

docker exec maia-postgres psql -U soullab -d maia_consciousness -c "
  DELETE FROM infra_health_snapshots WHERE checked_at < NOW() - INTERVAL '7 days';
" 2>/dev/null || true

# ─── Prune old log lines (keep 7 days worth = ~2016 lines at 5-min intervals)

if [ -f "$LOG_FILE" ]; then
  line_count=$(wc -l < "$LOG_FILE")
  if [ "$line_count" -gt 2100 ]; then
    tail -2016 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
  fi
fi

# ─── Console output (for manual runs) ─────────────────────────────────────────

echo "$log_line"
