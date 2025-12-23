#!/bin/bash
# Test routing decision with audit namespace

echo "1. Making API request..."
curl -X POST http://localhost:3000/api/oracle/conversation \
  -H 'Content-Type: application/json' \
  -d '{"userId":"audit-final-test","sessionId":"audit-final-session","message":"test"}' \
  -s > /tmp/audit-final-response.json

echo ""
echo "2. Checking response..."
cat /tmp/audit-final-response.json | jq '{traceId: .context.traceId, routingDecisionId: .context.routingDecisionId}'

echo ""
echo "3. Querying database for latest routing decision with audit namespace..."
psql postgresql://soullab@localhost:5432/maia_consciousness -c "
SELECT
  member_id,
  facet_code,
  extracted_cues->'audit' as audit,
  extracted_cues->'audit'->'skill' as audit_skill,
  extracted_cues->'audit'->'fieldSafety' as audit_fieldSafety,
  timestamp
FROM routing_decisions
WHERE member_id = 'audit-final-test'
ORDER BY timestamp DESC
LIMIT 1;
"
