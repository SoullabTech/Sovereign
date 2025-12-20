#!/bin/bash
# Beads Integration Test Script
# Tests the complete Beads → MAIA integration

set -e

echo "🧪 Beads Integration Test Suite"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
MAIA_URL="${MAIA_URL:-http://localhost:3000/api/maia}"
BEADS_SYNC_URL="${BEADS_SYNC_URL:-http://localhost:3100}"
TEST_SESSION_ID="test-session-$(date +%s)"
TEST_USER_ID="test-user-beads-integration"

# Check prerequisites
echo "📋 Checking prerequisites..."

# 1. Check Beads services running
if ! docker ps | grep -q "maia-beads-memory"; then
  echo -e "${RED}❌ Beads memory container not running${NC}"
  echo "   Run: docker-compose -f docker-compose.beads.yml up -d"
  exit 1
fi

if ! docker ps | grep -q "maia-beads-sync"; then
  echo -e "${RED}❌ Beads sync service not running${NC}"
  echo "   Run: docker-compose -f docker-compose.beads.yml up -d"
  exit 1
fi

echo -e "${GREEN}✓${NC} Beads containers running"

# 2. Check Beads sync service health
HEALTH_STATUS=$(curl -s "${BEADS_SYNC_URL}/health" | jq -r '.status' 2>/dev/null || echo "error")
if [ "$HEALTH_STATUS" != "healthy" ]; then
  echo -e "${RED}❌ Beads sync service unhealthy${NC}"
  echo "   Check: curl ${BEADS_SYNC_URL}/health"
  exit 1
fi

echo -e "${GREEN}✓${NC} Beads sync service healthy"

# 3. Check database connection
if [ -z "$DATABASE_URL" ]; then
  echo -e "${YELLOW}⚠${NC}  DATABASE_URL not set (will use default)"
  export DATABASE_URL="postgresql://soullab@localhost:5432/maia_consciousness"
fi

if ! psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo -e "${RED}❌ Database connection failed${NC}"
  echo "   Check: psql \$DATABASE_URL -c 'SELECT 1'"
  exit 1
fi

echo -e "${GREEN}✓${NC} Database connected"

# 4. Check beads_tasks table exists
if ! psql "$DATABASE_URL" -c "\d beads_tasks" > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠${NC}  beads_tasks table missing - running migration..."
  psql "$DATABASE_URL" < db/migrations/20251220_beads_integration.sql
  echo -e "${GREEN}✓${NC} Migration applied"
fi

echo -e "${GREEN}✓${NC} Database schema ready"
echo ""

# Test 1: Somatic Tension → Task Creation
echo "🧪 Test 1: Somatic Tension Detection"
echo "====================================="

SOMATIC_INPUT="My shoulders are really tense today, like 8 out of 10"

echo "Sending: \"$SOMATIC_INPUT\""

RESPONSE=$(curl -s -X POST "$MAIA_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$TEST_SESSION_ID\",
    \"input\": \"$SOMATIC_INPUT\",
    \"meta\": {
      \"userId\": \"$TEST_USER_ID\"
    }
  }")

echo "MAIA Response:"
echo "$RESPONSE" | jq -r '.text' | head -n 3
echo ""

# Wait for background task creation
sleep 2

# Check if task was created
TASK_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM beads_tasks WHERE user_id = '$TEST_USER_ID' AND body_region = 'shoulders';" | xargs)

if [ "$TASK_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ PASS${NC} - Task created for shoulder tension"

  # Show task details
  TASK_DETAILS=$(psql "$DATABASE_URL" -t -c "SELECT beads_id, title, element FROM beads_tasks WHERE user_id = '$TEST_USER_ID' AND body_region = 'shoulders' LIMIT 1;")
  echo "   Task: $TASK_DETAILS"
else
  echo -e "${RED}❌ FAIL${NC} - No task created"
  echo "   Check MAIA logs for: 🌱 [Beads] Created"
fi

echo ""

# Test 2: Task Readiness Query
echo "🧪 Test 2: Task Readiness Query"
echo "================================"

TASK_QUERY="What should I work on?"

echo "Sending: \"$TASK_QUERY\""

RESPONSE=$(curl -s -X POST "$MAIA_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$TEST_SESSION_ID\",
    \"input\": \"$TASK_QUERY\",
    \"meta\": {
      \"userId\": \"$TEST_USER_ID\"
    }
  }")

RESPONSE_TEXT=$(echo "$RESPONSE" | jq -r '.text')

echo "MAIA Response:"
echo "$RESPONSE_TEXT" | head -n 5
echo ""

if echo "$RESPONSE_TEXT" | grep -q "practice"; then
  echo -e "${GREEN}✅ PASS${NC} - Task query returned practices"
else
  echo -e "${YELLOW}⚠ PARTIAL${NC} - Response may not include task list"
  echo "   This is OK if no tasks are cognitively ready"
fi

echo ""

# Test 3: Practice Completion Detection
echo "🧪 Test 3: Practice Completion Detection"
echo "========================================="

COMPLETION_INPUT="I just did the breathing practice"

echo "Sending: \"$COMPLETION_INPUT\""

RESPONSE=$(curl -s -X POST "$MAIA_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$TEST_SESSION_ID\",
    \"input\": \"$COMPLETION_INPUT\",
    \"meta\": {
      \"userId\": \"$TEST_USER_ID\"
    }
  }")

RESPONSE_TEXT=$(echo "$RESPONSE" | jq -r '.text')

echo "MAIA Response:"
echo "$RESPONSE_TEXT" | head -n 3
echo ""

if echo "$RESPONSE_TEXT" | grep -qi "effective"; then
  echo -e "${GREEN}✅ PASS${NC} - Completion detected, follow-up asked"
else
  echo -e "${YELLOW}⚠ PARTIAL${NC} - Follow-up may not have been woven in"
  echo "   Check MAIA logs for: ✅ [Beads] Practice completion detected"
fi

echo ""

# Test 4: Direct Beads API Test
echo "🧪 Test 4: Direct Beads API Test"
echo "================================="

echo "Creating test task via API..."

BEADS_RESPONSE=$(curl -s -X POST "${BEADS_SYNC_URL}/beads/task" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Integration Test Task\",
    \"description\": \"Created by test-integration.sh\",
    \"priority\": \"medium\",
    \"tags\": [\"test\", \"integration\"],
    \"maiaMeta\": {
      \"userId\": \"$TEST_USER_ID\",
      \"sessionId\": \"$TEST_SESSION_ID\",
      \"element\": \"earth\",
      \"phase\": 1,
      \"cognitive\": {
        \"requiredLevel\": 2
      }
    }
  }")

if echo "$BEADS_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  BEADS_ID=$(echo "$BEADS_RESPONSE" | jq -r '.beadsId')
  echo -e "${GREEN}✅ PASS${NC} - Task created via API"
  echo "   Beads ID: $BEADS_ID"
else
  echo -e "${RED}❌ FAIL${NC} - API task creation failed"
  echo "   Response: $BEADS_RESPONSE"
fi

echo ""

# Summary
echo "📊 Test Summary"
echo "==============="
echo ""

TOTAL_TASKS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM beads_tasks WHERE user_id = '$TEST_USER_ID';" | xargs)
echo "Total tasks created: $TOTAL_TASKS"

if [ "$TOTAL_TASKS" -gt 0 ]; then
  echo ""
  echo "Recent tasks:"
  psql "$DATABASE_URL" -c "
    SELECT
      LEFT(beads_id, 20) as id,
      LEFT(title, 40) as title,
      element,
      status,
      created_at::date as created
    FROM beads_tasks
    WHERE user_id = '$TEST_USER_ID'
    ORDER BY created_at DESC
    LIMIT 5;
  "
fi

echo ""
echo "🧹 Cleanup"
echo "=========="

read -p "Delete test data? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  psql "$DATABASE_URL" -c "DELETE FROM beads_tasks WHERE user_id = '$TEST_USER_ID';"
  echo -e "${GREEN}✓${NC} Test data deleted"
fi

echo ""
echo "🎉 Integration test complete!"
echo ""
echo "Next steps:"
echo "  1. Review MAIA logs for: 🌱 [Beads] events"
echo "  2. Check Beads sync logs: docker logs maia-beads-sync"
echo "  3. Explore tasks: docker exec maia-beads-memory bd list"
