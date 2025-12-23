#!/bin/bash
# Test skill audit metadata recording
# This proves Phase 4.2C audit trail infrastructure works for skill execution
#
# IMPORTANT: Server MUST be started with SKILLS_DEV_FORCE_EXECUTE=1 env var
# Example: SKILLS_DEV_FORCE_EXECUTE=1 npm run dev
# Without this flag, the x-force-skill-id header will be ignored (security hardening)

set -e

echo "=== Testing Skill Audit Metadata Recording ==="
echo "⚠️  REQUIREMENT: Server must have SKILLS_DEV_FORCE_EXECUTE=1 environment variable"
echo "    (Without it, forced skill execution is disabled for security)"
echo ""
echo ""
echo "1. Making API request with force skill header..."

curl --max-time 15 -sS -X POST http://localhost:3000/api/oracle/conversation \
  -H "Content-Type: application/json" \
  -H "x-force-skill-id: ipp_parenting_repair_v1" \
  -d '{"userId":"audit-skill-test","sessionId":"skill-test","message":"test"}' \
  > /tmp/skill-audit-response.json

echo "2. Extracting trace ID from response..."
TRACE_ID=$(jq -r '.context.traceId' /tmp/skill-audit-response.json)
DECISION_ID=$(jq -r '.context.routingDecisionId' /tmp/skill-audit-response.json)

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
  extracted_cues->'audit'->'skill' AS skill_audit,
  extracted_cues->'audit'->'fieldSafety' AS field_safety_audit
FROM routing_decisions
WHERE trace_id = '$TRACE_ID';
"

echo ""
echo "4. Verifying skill audit metadata is non-null..."

SKILL_AUDIT=$(psql postgresql://soullab@localhost:5432/maia_consciousness -t -c "
SELECT extracted_cues->'audit'->'skill'
FROM routing_decisions
WHERE trace_id = '$TRACE_ID';
" | xargs)

if [ "$SKILL_AUDIT" == "null" ] || [ -z "$SKILL_AUDIT" ]; then
  echo "❌ FAILED: Skill audit metadata is null or empty"
  exit 1
fi

echo "✅ SUCCESS: Skill audit metadata populated with: $SKILL_AUDIT"
echo ""
echo "=== Phase 4.2C Skill Audit Trail Verification Complete ==="
