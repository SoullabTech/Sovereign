#!/bin/bash
# Test field-safety audit metadata recording
# This proves Phase 4.2C audit trail infrastructure works for field-safety boundaries

set -e

echo "=== Testing Field-Safety Audit Metadata Recording ==="
echo ""
echo "1. Making API request with force field-safety header..."

curl --max-time 15 -sS -X POST http://localhost:3000/api/oracle/conversation \
  -H "Content-Type: application/json" \
  -H "x-force-field-safety: 1" \
  -d '{"userId":"audit-field-safety-test","sessionId":"fs-test","message":"test"}' \
  > /tmp/field-safety-audit-response.json

echo "2. Extracting trace ID from response..."
TRACE_ID=$(jq -r '.context.traceId' /tmp/field-safety-audit-response.json)
DECISION_ID=$(jq -r '.context.routingDecisionId' /tmp/field-safety-audit-response.json)

echo "   Trace ID: $TRACE_ID"
echo "   Decision ID: $DECISION_ID"
echo ""

if [ "$DECISION_ID" == "null" ] || [ -z "$DECISION_ID" ]; then
  echo "❌ FAILED: No routing decision ID returned"
  exit 1
fi

echo "3. Querying database for routing decision..."
psql postgresql://soullab@localhost:5432/maia_consciousness -c "
SELECT
  id,
  trace_id,
  facet_code,
  routing_rule_id,
  extracted_cues->'audit'->'fieldSafety' AS field_safety_audit,
  extracted_cues->'audit'->'skill' AS skill_audit
FROM routing_decisions
WHERE trace_id = '$TRACE_ID';
"

echo ""
echo "4. Verifying audit metadata is non-null..."

FIELD_SAFETY_AUDIT=$(psql postgresql://soullab@localhost:5432/maia_consciousness -t -c "
SELECT extracted_cues->'audit'->'fieldSafety'
FROM routing_decisions
WHERE trace_id = '$TRACE_ID';
" | xargs)

if [ "$FIELD_SAFETY_AUDIT" == "null" ] || [ -z "$FIELD_SAFETY_AUDIT" ]; then
  echo "❌ FAILED: Field-safety audit metadata is null or empty"
  exit 1
fi

echo "✅ SUCCESS: Field-safety audit metadata populated with: $FIELD_SAFETY_AUDIT"
echo ""
echo "=== Phase 4.2C Audit Trail Verification Complete ==="
