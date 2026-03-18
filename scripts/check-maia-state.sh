#!/usr/bin/env bash
set -euo pipefail

DB_CONTAINER="${DB_CONTAINER:-maia-postgres}"
DB_NAME="${DB_NAME:-maia_consciousness}"
DB_USER="${DB_USER:-soullab}"
APP_CONTAINER="${APP_CONTAINER:-maia-sovereign}"
HOURS="${1:-24}"

run_sql() {
  local sql="$1"
  docker exec "$DB_CONTAINER" psql -U "$DB_USER" "$DB_NAME" -c "$sql"
}

echo
echo "=== MAIA STATE CHECK (last ${HOURS}h) ==="
echo

echo "--- Containers ---"
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}' | grep -E 'maia-sovereign|maia-postgres|maia-whisper|NAMES' || true

echo
echo "--- Recent member theme signals ---"
run_sql "
SELECT theme, signal_type, resonance_strength, element, detected_at
FROM member_theme_signals
ORDER BY detected_at DESC
LIMIT 10;
"

echo
echo "--- Theme counts ---"
run_sql "
SELECT theme, COUNT(*) AS count
FROM member_theme_signals
GROUP BY theme
ORDER BY count DESC, theme ASC;
"

echo
echo "--- AIN aggregate (${HOURS}h) ---"
run_sql "
SELECT
  COUNT(*) AS turns,
  ROUND(AVG(CASE WHEN next_step THEN 1.0 ELSE 0.0 END) * 100, 1) AS next_step_pct,
  ROUND(AVG(CASE WHEN permission THEN 1.0 ELSE 0.0 END) * 100, 1) AS permission_pct,
  ROUND(AVG(CASE WHEN mirror THEN 1.0 ELSE 0.0 END) * 100, 1) AS mirror_pct,
  ROUND(AVG(CASE WHEN bridge THEN 1.0 ELSE 0.0 END) * 100, 1) AS bridge_pct,
  ROUND(AVG(CASE WHEN pass THEN 1.0 ELSE 0.0 END) * 100, 1) AS pass_pct
FROM ain_shape_telemetry
WHERE formed_at > NOW() - INTERVAL '${HOURS} hours';
"

echo
echo "--- Continuity aggregate (${HOURS}h) ---"
run_sql "
SELECT
  COUNT(*) AS turns,
  ROUND(AVG(((continuity_data->>'hadActiveThread')::boolean)::int) * 100, 1) AS active_thread_pct,
  ROUND(AVG(COALESCE((continuity_data->>'activeThreadConfidence')::numeric, 0)), 3) AS avg_thread_confidence,
  ROUND(AVG(((continuity_data->>'hadCorrectionSignal')::boolean)::int) * 100, 1) AS correction_signal_pct
FROM ain_shape_telemetry
WHERE continuity_data IS NOT NULL
  AND formed_at > NOW() - INTERVAL '${HOURS} hours';
"

echo
echo "--- Recent continuity rows ---"
run_sql "
SELECT
  formed_at,
  route,
  continuity_data->>'hadActiveThread' AS had_active_thread,
  continuity_data->>'activeThreadConfidence' AS active_thread_confidence,
  continuity_data->>'hadCorrectionSignal' AS had_correction_signal
FROM ain_shape_telemetry
WHERE continuity_data IS NOT NULL
  AND formed_at > NOW() - INTERVAL '${HOURS} hours'
ORDER BY formed_at DESC
LIMIT 20;
"

echo
echo "--- Closing anchor logs (${HOURS}h) ---"
docker logs "$APP_CONTAINER" --since "${HOURS}h" 2>&1 | grep "closing-anchor" || true

echo
echo "Done."
