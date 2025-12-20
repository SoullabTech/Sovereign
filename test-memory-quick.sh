#!/usr/bin/env bash
set -e

TEST_SESSION_ID="memory_cert_$(date +%s)"
BASE_URL="http://localhost:3000"

echo "=== TEST 1: Write Turn 1 ==="
TURN1=$(curl -s -X POST "$BASE_URL/api/sovereign/app/maia" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"My name is Alice and I love gardening\",\"userName\":\"Alice\",\"userId\":\"$TEST_SESSION_ID\",\"mode\":\"dialogue\",\"sessionId\":\"$TEST_SESSION_ID\"}")

echo "$TURN1" | jq -r '.message' | head -c 200
echo "..."
echo ""

echo "=== TEST 2: Write Turn 2 ==="
TURN2=$(curl -s -X POST "$BASE_URL/api/sovereign/app/maia" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"My favorite plant is lavender\",\"userName\":\"Alice\",\"userId\":\"$TEST_SESSION_ID\",\"mode\":\"dialogue\",\"sessionId\":\"$TEST_SESSION_ID\"}")

echo "$TURN2" | jq -r '.message' | head -c 200
echo "..."
echo ""

sleep 2

echo "=== TEST 3: Database Verification ==="
psql postgresql://soullab@localhost:5432/maia_consciousness -t -c "SELECT turn_count, jsonb_array_length(conversation_history) FROM maia_sessions WHERE id = '$TEST_SESSION_ID'" 2>/dev/null

echo ""
echo "=== TEST 4: Memory Recall (before restart) ==="
TURN3=$(curl -s -X POST "$BASE_URL/api/sovereign/app/maia" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"What is my favorite plant?\",\"userName\":\"Alice\",\"userId\":\"$TEST_SESSION_ID\",\"mode\":\"dialogue\",\"sessionId\":\"$TEST_SESSION_ID\"}")

TURN3_TEXT=$(echo "$TURN3" | jq -r '.message')
echo "$TURN3_TEXT" | head -c 300
echo "..."
echo ""

if echo "$TURN3_TEXT" | grep -qi "lavender"; then
  echo "✓ MAIA remembered 'lavender'"
else
  echo "✗ MAIA did NOT remember lavender"
fi

echo ""
echo "Session ID: $TEST_SESSION_ID (save this for after-restart test)"
