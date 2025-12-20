#!/usr/bin/env bash
set -e

TEST_SESSION_ID="$1"

if [ -z "$TEST_SESSION_ID" ]; then
  echo "Usage: $0 <session_id>"
  exit 1
fi

echo "=== Killing server ==="
pkill -f "next dev" || true
sleep 3

echo "=== Starting fresh server ==="
rm -rf .next && PORT=3000 npm run dev > /tmp/maia-restart-test.log 2>&1 &
sleep 20

echo "=== Waiting for server readiness ==="
MAX_WAIT=30
WAITED=0
until curl -s http://localhost:3000/api/health > /dev/null 2>&1; do
  sleep 1
  WAITED=$((WAITED + 1))
  if [ $WAITED -ge $MAX_WAIT ]; then
    echo "✗ Server failed to start"
    exit 1
  fi
done

echo "✓ Server restarted (took ${WAITED}s)"
echo ""

echo "=== TEST 5: Memory Recall AFTER RESTART ==="
TURN4=$(curl -s -X POST "http://localhost:3000/api/sovereign/app/maia" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Do you remember my name and what I love?\",\"userName\":\"Alice\",\"userId\":\"$TEST_SESSION_ID\",\"mode\":\"dialogue\",\"sessionId\":\"$TEST_SESSION_ID\"}")

TURN4_TEXT=$(echo "$TURN4" | jq -r '.message')
echo "$TURN4_TEXT"
echo ""

echo "=== MEMORY SCORE ==="
SCORE=0

if echo "$TURN4_TEXT" | grep -qi "alice"; then
  echo "✓ Remembered name 'Alice'"
  SCORE=$((SCORE + 1))
else
  echo "✗ Lost name 'Alice'"
fi

if echo "$TURN4_TEXT" | grep -qi "garden"; then
  echo "✓ Remembered 'gardening' interest"
  SCORE=$((SCORE + 1))
else
  echo "✗ Lost 'gardening' context"
fi

if echo "$TURN4_TEXT" | grep -qi "lavender"; then
  echo "✓ Remembered favorite plant 'lavender'"
  SCORE=$((SCORE + 1))
else
  echo "✗ Lost 'lavender' detail"
fi

echo ""
echo "FINAL MEMORY SCORE: $SCORE/3"

if [ $SCORE -ge 2 ]; then
  echo "✓ PERSISTENT MEMORY CERTIFIED"
else
  echo "✗ MEMORY PERSISTENCE FAILED"
fi
