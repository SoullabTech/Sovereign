#!/usr/bin/env bash
# check-continuity.sh — Continuity layer health snapshot
# Usage: ./scripts/check-continuity.sh [hours]
# Default window: last 24 hours

HOURS="${1:-24}"
[[ "$HOURS" =~ ^[0-9]+$ ]] || HOURS=24
DB="docker exec maia-postgres psql -U soullab maia_consciousness"

echo ""
echo "=== CONTINUITY HEALTH (last ${HOURS}h) ==="
echo ""

echo "--- Aggregate ---"
$DB -c "
SELECT
  COUNT(*) AS turns,
  ROUND(AVG(((continuity_data->>'hadActiveThread')::boolean)::int) * 100, 1) AS active_thread_pct,
  ROUND(AVG(COALESCE((continuity_data->>'activeThreadConfidence')::numeric, 0)), 3) AS avg_confidence,
  ROUND(AVG(((continuity_data->>'hadCorrectionSignal')::boolean)::int) * 100, 1) AS correction_pct
FROM ain_shape_telemetry
WHERE continuity_data IS NOT NULL
  AND formed_at > NOW() - INTERVAL '${HOURS} hours';"

echo ""
echo "--- Confidence bands ---"
$DB -c "
SELECT
  CASE
    WHEN (continuity_data->>'activeThreadConfidence')::numeric >= 0.70 THEN 'high   (>= 0.70)'
    WHEN (continuity_data->>'activeThreadConfidence')::numeric >= 0.45 THEN 'medium (0.45-0.70)'
    ELSE                                                                     'low    (< 0.45)'
  END AS confidence_band,
  COUNT(*) AS turns
FROM ain_shape_telemetry
WHERE continuity_data IS NOT NULL
  AND formed_at > NOW() - INTERVAL '${HOURS} hours'
GROUP BY 1
ORDER BY 1;"

echo ""
echo "--- Correction signal breakdown ---"
$DB -c "
SELECT
  continuity_data->>'correctionType' AS correction_type,
  COUNT(*) AS count
FROM ain_shape_telemetry
WHERE continuity_data IS NOT NULL
  AND continuity_data->>'hadCorrectionSignal' = 'true'
  AND formed_at > NOW() - INTERVAL '${HOURS} hours'
GROUP BY 1
ORDER BY 2 DESC;"

echo ""
echo "--- Thread confidence vs AIN shape score ---"
$DB -c "
SELECT
  CASE
    WHEN (continuity_data->>'activeThreadConfidence')::numeric >= 0.70 THEN 'high'
    WHEN (continuity_data->>'activeThreadConfidence')::numeric >= 0.45 THEN 'medium'
    ELSE 'low'
  END AS thread_confidence_band,
  COUNT(*) AS turns,
  ROUND(100.0 * AVG(CASE WHEN pass THEN 1 ELSE 0 END), 1) AS pass_rate_pct,
  ROUND(AVG(score), 2) AS avg_shape_score,
  ROUND(100.0 * AVG(CASE WHEN bridge THEN 1 ELSE 0 END), 1) AS bridge_rate_pct
FROM ain_shape_telemetry
WHERE continuity_data IS NOT NULL
  AND formed_at > NOW() - INTERVAL '${HOURS} hours'
GROUP BY 1
ORDER BY 1;"

echo ""
echo "--- Recent 10 turns ---"
$DB -c "
SELECT
  formed_at::time(0) AS time,
  route,
  continuity_data->>'hadActiveThread'        AS thread,
  continuity_data->>'activeThreadConfidence' AS confidence,
  continuity_data->>'hadCorrectionSignal'    AS correction,
  CASE WHEN pass THEN 'pass' ELSE 'fail' END AS ain_shape
FROM ain_shape_telemetry
WHERE continuity_data IS NOT NULL
  AND formed_at > NOW() - INTERVAL '${HOURS} hours'
ORDER BY formed_at DESC
LIMIT 10;"

echo ""
