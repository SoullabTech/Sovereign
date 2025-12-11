#!/bin/bash

# Test script for sovereign MAIA session management
# Separates JSON body from curl metrics to avoid jq parse errors

SESSION_ID="test-session-$(date +%s)"
echo "Testing MAIA sovereign session management..."
echo "Session ID: $SESSION_ID"
echo "Endpoint: http://localhost:3000/api/sovereign/app/maia"
echo ""

# Test 1 - First message
echo "=== MESSAGE 1 ==="
RESPONSE_FILE="/tmp/maia_response_1.json"
curl -X POST http://localhost:3000/api/sovereign/app/maia \
     -H "Content-Type: application/json" \
     -d "{\"message\":\"Hello MAIA, I'm testing session management. This is message 1.\",\"sessionId\":\"$SESSION_ID\"}" \
     -s -o "$RESPONSE_FILE" \
     -w "HTTP Status: %{http_code}\nResponse Time: %{time_total}s\n"

echo "Response body:"
if command -v jq &> /dev/null; then
    cat "$RESPONSE_FILE" | jq -r '.message // .text // .'
else
    cat "$RESPONSE_FILE"
fi

echo -e "\n=== WAITING 2 SECONDS ===\n"
sleep 2

# Test 2 - Second message referencing first
echo "=== MESSAGE 2 ==="
RESPONSE_FILE="/tmp/maia_response_2.json"
curl -X POST http://localhost:3000/api/sovereign/app/maia \
     -H "Content-Type: application/json" \
     -d "{\"message\":\"This is message 2. Do you remember my first message about session testing?\",\"sessionId\":\"$SESSION_ID\"}" \
     -s -o "$RESPONSE_FILE" \
     -w "HTTP Status: %{http_code}\nResponse Time: %{time_total}s\n"

echo "Response body:"
if command -v jq &> /dev/null; then
    cat "$RESPONSE_FILE" | jq -r '.message // .text // .'
else
    cat "$RESPONSE_FILE"
fi

echo -e "\n=== WAITING 2 SECONDS ===\n"
sleep 2

# Test 3 - Third message asking for conversation summary
echo "=== MESSAGE 3 ==="
RESPONSE_FILE="/tmp/maia_response_3.json"
curl -X POST http://localhost:3000/api/sovereign/app/maia \
     -H "Content-Type: application/json" \
     -d "{\"message\":\"This is message 3. Can you summarize our conversation so far?\",\"sessionId\":\"$SESSION_ID\"}" \
     -s -o "$RESPONSE_FILE" \
     -w "HTTP Status: %{http_code}\nResponse Time: %{time_total}s\n"

echo "Response body:"
if command -v jq &> /dev/null; then
    cat "$RESPONSE_FILE" | jq -r '.message // .text // .'
else
    cat "$RESPONSE_FILE"
fi

echo -e "\n=== SESSION TEST COMPLETE ===\n"

# Display session metadata from last response
echo "Session metadata from last response:"
if command -v jq &> /dev/null; then
    cat "$RESPONSE_FILE" | jq '.session // "No session metadata found"'
else
    echo "Install jq to see session metadata details"
fi

# Cleanup temp files
rm -f /tmp/maia_response_*.json

echo ""
echo "✅ Session management test completed!"
echo "Expected behavior:"
echo "  - Different responses for each message"
echo "  - Session ID should be consistent"
echo "  - Turn count should increment"
echo "  - Responses should reference previous messages"