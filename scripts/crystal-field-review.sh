#!/usr/bin/env bash
# Crystal Field Review — weekly observation data
#
# Usage: ./scripts/crystal-field-review.sh [hours]
# Default: 168 hours (7 days)
#
# Pulls telemetry from the last N hours to support the
# weekly Crystal Field Review. Not automation — structured observation.

set -euo pipefail

HOURS="${1:-168}"
CONTAINER="maia-postgres"
DB="maia_consciousness"
USER="soullab"

psql_cmd() {
  docker exec "$CONTAINER" psql -U "$USER" "$DB" -tA -c "$1"
}

psql_pretty() {
  docker exec "$CONTAINER" psql -U "$USER" "$DB" -c "$1"
}

echo "=========================================="
echo " CRYSTAL FIELD REVIEW — last ${HOURS}h"
echo "=========================================="
echo ""

# --- 1. Volume ---
echo "--- 1. CONVERSATION VOLUME ---"
psql_pretty "
SELECT
  COUNT(*) as total_turns,
  COUNT(DISTINCT session_id) as sessions,
  MIN(created_at)::date as earliest,
  MAX(created_at)::date as latest
FROM maia_turns
WHERE created_at > NOW() - INTERVAL '${HOURS} hours';
"

# --- 2. Element Distribution ---
echo "--- 2. ELEMENT DISTRIBUTION ---"
psql_pretty "
SELECT
  element,
  COUNT(*) as turns,
  ROUND(100.0 * COUNT(*) / NULLIF(SUM(COUNT(*)) OVER(), 0), 1) as pct
FROM maia_turns
WHERE created_at > NOW() - INTERVAL '${HOURS} hours'
  AND element IS NOT NULL
GROUP BY element
ORDER BY turns DESC;
"

# --- 3. Closing Type Distribution (from observer_insights JSON) ---
echo "--- 3. CLOSING TYPE DISTRIBUTION ---"
psql_pretty "
SELECT
  COALESCE(observer_insights->'fieldShift'->>'closingType', 'unknown') as closing_type,
  COUNT(*) as turns,
  ROUND(100.0 * COUNT(*) / NULLIF(SUM(COUNT(*)) OVER(), 0), 1) as pct
FROM maia_turns
WHERE created_at > NOW() - INTERVAL '${HOURS} hours'
  AND observer_insights IS NOT NULL
GROUP BY closing_type
ORDER BY turns DESC;
"

# --- 4. Closing Type by Element ---
echo "--- 4. CLOSING TYPE x ELEMENT ---"
psql_pretty "
SELECT
  element,
  COALESCE(observer_insights->'fieldShift'->>'closingType', 'unknown') as closing_type,
  COUNT(*) as turns
FROM maia_turns
WHERE created_at > NOW() - INTERVAL '${HOURS} hours'
  AND element IS NOT NULL
  AND observer_insights IS NOT NULL
GROUP BY element, closing_type
ORDER BY element, turns DESC;
"

# --- 5. Stability Distribution ---
echo "--- 5. STABILITY DISTRIBUTION ---"
psql_pretty "
SELECT
  COALESCE(observer_insights->'fieldShift'->>'stability', 'unknown') as stability,
  COUNT(*) as turns
FROM maia_turns
WHERE created_at > NOW() - INTERVAL '${HOURS} hours'
  AND observer_insights IS NOT NULL
GROUP BY stability
ORDER BY turns DESC;
"

# --- 6. Depth Mode Usage ---
echo "--- 6. DEPTH MODE ---"
psql_pretty "
SELECT
  COALESCE(observer_insights->'fieldShift'->>'depthMode', 'false') as depth_active,
  COUNT(*) as turns
FROM maia_turns
WHERE created_at > NOW() - INTERVAL '${HOURS} hours'
  AND observer_insights IS NOT NULL
GROUP BY depth_active;
"

# --- 7. Intervention Outcomes (shift quality) ---
echo "--- 7. INTERVENTION SHIFT QUALITY ---"
psql_pretty "
SELECT
  relational_stance,
  element,
  COUNT(*) as interventions,
  SUM(CASE WHEN shift_direction = 'positive' THEN 1 ELSE 0 END) as positive_shifts,
  SUM(CASE WHEN shift_direction = 'negative' THEN 1 ELSE 0 END) as negative_shifts,
  ROUND(AVG(coherence_delta)::numeric, 3) as avg_coherence_delta
FROM member_intervention_outcomes
WHERE created_at > NOW() - INTERVAL '${HOURS} hours'
  AND shift_detected = true
GROUP BY relational_stance, element
ORDER BY interventions DESC
LIMIT 15;
"

# --- 8. Aether-specific (the edge we're watching) ---
echo "--- 8. AETHER CLOSING MOVES (threshold vs integration) ---"
psql_pretty "
SELECT
  COALESCE(observer_insights->'fieldShift'->>'closingType', 'unknown') as closing_type,
  COUNT(*) as turns,
  ROUND(AVG((observer_insights->'fieldShift'->>'stability')::numeric), 2) as avg_stability
FROM maia_turns
WHERE created_at > NOW() - INTERVAL '${HOURS} hours'
  AND element = 'aether'
  AND observer_insights IS NOT NULL
GROUP BY closing_type
ORDER BY turns DESC;
"

echo ""
echo "=========================================="
echo " REVIEW TEMPLATE"
echo "=========================================="
echo ""
echo " 1. What landed perfectly?"
echo "    (one turn where less said more)"
echo ""
echo " 2. What was slightly off?"
echo "    (one turn where movement or question felt mistimed)"
echo ""
echo " 3. What pattern is emerging?"
echo "    (consistent signal across multiple turns)"
echo ""
echo " 4. One rule to crystallize"
echo "    (if clear enough to name)"
echo ""
echo " 5. Does the member feel SEEN?"
echo "    (the governing test)"
echo ""
echo "=========================================="
