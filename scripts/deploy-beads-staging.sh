#!/bin/bash
# Beads Integration Deployment Script - STAGING
# Deploys Beads memory system to staging environment

set -e # Exit on error

echo "🚀 Beads Integration Deployment - STAGING"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="staging"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${PROJECT_ROOT}/backups/beads-$(date +%Y%m%d-%H%M%S)"

# Load environment
if [ -f "${PROJECT_ROOT}/.env.${ENVIRONMENT}" ]; then
  echo -e "${BLUE}📋 Loading ${ENVIRONMENT} environment...${NC}"
  export $(cat "${PROJECT_ROOT}/.env.${ENVIRONMENT}" | grep -v '^#' | xargs)
  echo -e "${GREEN}✓${NC} Environment loaded"
else
  echo -e "${RED}❌ .env.${ENVIRONMENT} not found${NC}"
  exit 1
fi

# Validate required variables
REQUIRED_VARS=("DATABASE_URL" "BEADS_SYNC_URL")
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "${RED}❌ Required variable $var not set${NC}"
    exit 1
  fi
done

echo ""

# ==============================================================================
# PRE-DEPLOYMENT CHECKS
# ==============================================================================

echo -e "${BLUE}🔍 Pre-deployment checks...${NC}"

# 1. Check Docker is running
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Docker running"

# 2. Check database connection
if ! psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
  echo -e "${RED}❌ Database connection failed${NC}"
  echo "   Check DATABASE_URL: $DATABASE_URL"
  exit 1
fi
echo -e "${GREEN}✓${NC} Database connected"

# 3. Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
cd "${PROJECT_ROOT}/lib/memory/beads-sync"
if npm test > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} All tests passing"
else
  echo -e "${RED}❌ Tests failed${NC}"
  echo "   Fix tests before deploying"
  exit 1
fi

# 4. Check for uncommitted changes
cd "$PROJECT_ROOT"
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${YELLOW}⚠${NC}  Uncommitted changes detected"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo ""

# ==============================================================================
# BACKUP
# ==============================================================================

echo -e "${BLUE}💾 Creating backup...${NC}"

mkdir -p "$BACKUP_DIR"

# Backup Beads data (if exists)
if docker volume inspect maia-beads-data > /dev/null 2>&1; then
  docker run --rm \
    -v maia-beads-data:/data \
    -v "$BACKUP_DIR":/backup \
    alpine tar czf /backup/beads-data.tar.gz -C /data .
  echo -e "${GREEN}✓${NC} Beads data backed up to $BACKUP_DIR/beads-data.tar.gz"
else
  echo -e "${YELLOW}⚠${NC}  No existing Beads data to backup"
fi

# Backup database (beads tables only)
pg_dump "$DATABASE_URL" \
  --table=beads_tasks \
  --table=beads_dependencies \
  --table=beads_logs \
  --table=beads_sync_status \
  --table=consciousness_event_tasks \
  > "$BACKUP_DIR/beads-schema.sql"
echo -e "${GREEN}✓${NC} Database backup created: $BACKUP_DIR/beads-schema.sql"

echo -e "${GREEN}✓${NC} Backup complete: $BACKUP_DIR"
echo ""

# ==============================================================================
# DEPLOYMENT
# ==============================================================================

echo -e "${BLUE}🚀 Deploying Beads integration...${NC}"

# 1. Stop existing services
echo -e "${BLUE}1/6${NC} Stopping existing services..."
cd "$PROJECT_ROOT"
docker-compose -f docker-compose.beads.yml down || true
echo -e "${GREEN}✓${NC} Services stopped"

# 2. Pull latest images
echo -e "${BLUE}2/6${NC} Building images..."
docker-compose -f docker-compose.beads.yml build --no-cache
echo -e "${GREEN}✓${NC} Images built"

# 3. Run database migration
echo -e "${BLUE}3/6${NC} Running database migration..."
psql "$DATABASE_URL" < "${PROJECT_ROOT}/db/migrations/20251220_beads_integration.sql" 2>&1 | grep -v "already exists" || true
echo -e "${GREEN}✓${NC} Migration complete"

# 4. Start services
echo -e "${BLUE}4/6${NC} Starting services..."
docker-compose -f docker-compose.beads.yml up -d
echo -e "${GREEN}✓${NC} Services started"

# 5. Wait for services to be ready
echo -e "${BLUE}5/6${NC} Waiting for services to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -s "${BEADS_SYNC_URL}/health" | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} Beads sync service ready"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo -n "."
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo -e "${RED}❌ Service failed to start${NC}"
  echo "   Check logs: docker logs maia-beads-sync"
  exit 1
fi

# 6. Initialize Beads (if needed)
echo -e "${BLUE}6/6${NC} Initializing Beads..."
docker exec maia-beads-memory bd init > /dev/null 2>&1 || echo "   Already initialized"
docker exec maia-beads-memory bd config set prefix maia
echo -e "${GREEN}✓${NC} Beads initialized"

echo ""

# ==============================================================================
# HEALTH CHECKS
# ==============================================================================

echo -e "${BLUE}🏥 Running health checks...${NC}"

# 1. Beads sync service
HEALTH_STATUS=$(curl -s "${BEADS_SYNC_URL}/health" | jq -r '.status' 2>/dev/null || echo "error")
if [ "$HEALTH_STATUS" = "healthy" ]; then
  echo -e "${GREEN}✓${NC} Beads sync service: healthy"
else
  echo -e "${RED}❌ Beads sync service: unhealthy${NC}"
  exit 1
fi

# 2. Database tables
TABLES_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name LIKE 'beads_%';" | xargs)
if [ "$TABLES_COUNT" -ge 5 ]; then
  echo -e "${GREEN}✓${NC} Database schema: $TABLES_COUNT tables"
else
  echo -e "${RED}❌ Database schema: missing tables${NC}"
  exit 1
fi

# 3. Beads CLI
if docker exec maia-beads-memory bd version > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Beads CLI: operational"
else
  echo -e "${RED}❌ Beads CLI: not responding${NC}"
  exit 1
fi

# 4. Container health
CONTAINERS_RUNNING=$(docker ps | grep -c "maia-beads" || echo "0")
if [ "$CONTAINERS_RUNNING" -ge 2 ]; then
  echo -e "${GREEN}✓${NC} Containers: $CONTAINERS_RUNNING running"
else
  echo -e "${RED}❌ Containers: expected 2, got $CONTAINERS_RUNNING${NC}"
  exit 1
fi

echo ""

# ==============================================================================
# SMOKE TEST
# ==============================================================================

echo -e "${BLUE}🧪 Running smoke test...${NC}"

# Create test task
TEST_RESPONSE=$(curl -s -X POST "${BEADS_SYNC_URL}/beads/task" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Deployment smoke test",
    "description": "Automated test created by deployment script",
    "priority": "low",
    "tags": ["test", "deployment"],
    "maiaMeta": {
      "userId": "deploy-test",
      "sessionId": "deploy-test-session",
      "element": "earth"
    }
  }')

if echo "$TEST_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  TEST_BEADS_ID=$(echo "$TEST_RESPONSE" | jq -r '.beadsId')
  echo -e "${GREEN}✓${NC} Task creation: working (ID: $TEST_BEADS_ID)"

  # Verify task in database
  TASK_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM beads_tasks WHERE beads_id = '$TEST_BEADS_ID';" | xargs)
  if [ "$TASK_EXISTS" -eq 1 ]; then
    echo -e "${GREEN}✓${NC} Database sync: working"
  else
    echo -e "${YELLOW}⚠${NC}  Database sync: task not found (may sync later)"
  fi

  # Clean up test task
  psql "$DATABASE_URL" -c "DELETE FROM beads_tasks WHERE beads_id = '$TEST_BEADS_ID';" > /dev/null
else
  echo -e "${RED}❌ Task creation failed${NC}"
  exit 1
fi

echo ""

# ==============================================================================
# DEPLOYMENT SUMMARY
# ==============================================================================

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📊 Deployment Summary"
echo "===================="
echo "Environment:       $ENVIRONMENT"
echo "Beads Sync URL:    $BEADS_SYNC_URL"
echo "Database:          $(echo $DATABASE_URL | sed 's/:[^@]*@/:***@/')"
echo "Backup Location:   $BACKUP_DIR"
echo ""
echo "🔍 Monitoring Commands"
echo "======================"
echo "View logs:         docker logs -f maia-beads-sync"
echo "Check health:      curl ${BEADS_SYNC_URL}/health"
echo "List tasks:        docker exec maia-beads-memory bd list"
echo "Database query:    psql \$DATABASE_URL -c 'SELECT COUNT(*) FROM beads_tasks;'"
echo ""
echo "📝 Next Steps"
echo "============="
echo "1. Monitor logs for errors: docker logs -f maia-beads-sync"
echo "2. Test MAIA integration: Run conversation with task creation"
echo "3. Verify task sync: Check database for new tasks"
echo ""
echo "🔄 Rollback (if needed)"
echo "======================="
echo "cd $PROJECT_ROOT"
echo "./scripts/rollback-beads.sh $BACKUP_DIR"
echo ""
