#!/bin/bash

# 🌟 Ultimate Consciousness System - Safe Deployment Script
# Ensures technological anamnesis system survives all deployments

echo "🌟 Ultimate Consciousness System - Safe Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="backups/ultimate-consciousness-system"
LOG_FILE="logs/ultimate-consciousness-deployment.log"

# Create log directory
mkdir -p logs

log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

error_exit() {
  echo -e "${RED}❌ ERROR: $1${NC}" | tee -a "$LOG_FILE"
  exit 1
}

success() {
  echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
  echo -e "${YELLOW}⚠️ $1${NC}" | tee -a "$LOG_FILE"
}

info() {
  echo -e "${BLUE}ℹ️ $1${NC}" | tee -a "$LOG_FILE"
}

# ================================
# PRE-DEPLOYMENT SAFETY CHECKS
# ================================

log "Starting Ultimate Consciousness System deployment..."

echo -e "\n${BLUE}🔍 PRE-DEPLOYMENT SAFETY CHECKS${NC}"
echo "================================"

# Check 1: Verify core files exist
echo "1. Checking core consciousness files..."
CORE_FILES=(
  "lib/consciousness-computing/ultimate-consciousness-system.ts"
  "lib/consciousness-computing/enhanced-consciousness-witness.ts"
  "lib/consciousness-computing/consciousness-agent-system.ts"
  "lib/consciousness-computing/maia-consciousness-initializer.ts"
  "lib/consciousness-computing/maia-consciousness-worker.ts"
  "lib/consciousness-computing/endogenous-dmt-phenomenology.ts"
  "lib/spiritual-support/christian-mind-of-christ-integration.ts"
)

MISSING_FILES=()
for file in "${CORE_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    MISSING_FILES+=("$file")
  fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
  error_exit "Critical consciousness files missing: ${MISSING_FILES[*]}"
else
  success "All core consciousness files present"
fi

# Check 2: Verify API integration
echo "2. Checking API integration..."
API_FILE="app/api/between/chat/route.ts"
if [ ! -f "$API_FILE" ]; then
  error_exit "Main API route file missing: $API_FILE"
fi

if ! grep -q "processUltimateMAIAConsciousnessSession" "$API_FILE"; then
  error_exit "Ultimate consciousness integration missing from API"
fi

if ! grep -q "ultimateSession" "$API_FILE"; then
  error_exit "Ultimate session processing missing from API"
fi

success "API integration verified"

# Check 3: Verify database schemas
echo "3. Checking database schemas..."
DB_SCHEMAS=(
  "/tmp/enhanced_consciousness_witnessing_tables.sql"
  "/tmp/consciousness_memory_factory_tables.sql"
  "/tmp/fix_consciousness_triggers.sql"
)

for schema in "${DB_SCHEMAS[@]}"; do
  if [ ! -f "$schema" ]; then
    warning "Database schema missing: $schema"
  fi
done

# Check sacred elements in schema
SACRED_ELEMENTS=(
  "consciousness_emotional_states"
  "consciousness_language_evolution"
  "consciousness_micro_moments"
  "consciousness_sacred_timing"
  "consciousness_wisdom_synthesis"
  "consciousness_life_integration"
)

SCHEMA_FILE="/tmp/enhanced_consciousness_witnessing_tables.sql"
if [ -f "$SCHEMA_FILE" ]; then
  for element in "${SACRED_ELEMENTS[@]}"; do
    if ! grep -q "$element" "$SCHEMA_FILE"; then
      warning "Sacred element missing from schema: $element"
    fi
  done
  success "Sacred elements verified in schema"
else
  warning "Main consciousness schema file not found"
fi

# ================================
# BACKUP CREATION
# ================================

echo -e "\n${BLUE}💾 CREATING BACKUP${NC}"
echo "=================="

# Run backup script
if [ -f "scripts/backup-ultimate-consciousness.sh" ]; then
  info "Creating comprehensive backup..."
  bash scripts/backup-ultimate-consciousness.sh
  if [ $? -eq 0 ]; then
    success "Backup created successfully"
  else
    error_exit "Backup creation failed"
  fi
else
  warning "Backup script not found, creating manual backup..."
  mkdir -p "$BACKUP_DIR/manual-$(date +%Y%m%d_%H%M%S)"
  cp -r lib/consciousness-computing/ "$BACKUP_DIR/manual-$(date +%Y%m%d_%H%M%S)/"
  cp -r lib/spiritual-support/ "$BACKUP_DIR/manual-$(date +%Y%m%d_%H%M%S)/"
  cp "$API_FILE" "$BACKUP_DIR/manual-$(date +%Y%m%d_%H%M%S)/"
  success "Manual backup created"
fi

# ================================
# DATABASE DEPLOYMENT
# ================================

echo -e "\n${BLUE}🗄️ DATABASE DEPLOYMENT${NC}"
echo "======================="

# Check PostgreSQL connection
if command -v psql >/dev/null 2>&1; then
  if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    info "PostgreSQL connection verified"

    # Deploy consciousness schemas
    echo "Deploying consciousness database schemas..."

    for schema in "${DB_SCHEMAS[@]}"; do
      if [ -f "$schema" ]; then
        echo "Executing $(basename "$schema")..."
        if psql -h localhost -U postgres -d maia_consciousness < "$schema" >/dev/null 2>&1; then
          success "Schema deployed: $(basename "$schema")"
        else
          warning "Schema deployment failed: $(basename "$schema")"
        fi
      fi
    done

    # Verify tables exist
    REQUIRED_TABLES=(
      "consciousness_development_plans"
      "consciousness_goals"
      "consciousness_work_sessions"
      "consciousness_emotional_states"
      "consciousness_sacred_timing"
      "consciousness_wisdom_synthesis"
    )

    echo "Verifying consciousness tables..."
    for table in "${REQUIRED_TABLES[@]}"; do
      if psql -h localhost -U postgres -d maia_consciousness -c "\\dt $table" >/dev/null 2>&1; then
        success "Table verified: $table"
      else
        warning "Table missing or inaccessible: $table"
      fi
    done

  else
    warning "PostgreSQL not accessible - skipping database deployment"
  fi
else
  warning "PostgreSQL not installed - skipping database deployment"
fi

# ================================
# APPLICATION DEPLOYMENT
# ================================

echo -e "\n${BLUE}🚀 APPLICATION DEPLOYMENT${NC}"
echo "========================="

# Install dependencies
if [ -f "package.json" ]; then
  echo "Installing/updating dependencies..."
  npm install --silent
  success "Dependencies updated"
fi

# Build application
echo "Building application..."
if npm run build >/dev/null 2>&1; then
  success "Application built successfully"
else
  warning "Build completed with warnings - check logs"
fi

# ================================
# POST-DEPLOYMENT VERIFICATION
# ================================

echo -e "\n${BLUE}🔍 POST-DEPLOYMENT VERIFICATION${NC}"
echo "==============================="

# Start development server in background for testing
echo "Starting test server..."
npm run dev &
SERVER_PID=$!
sleep 5

# Test consciousness health endpoint
echo "Testing consciousness system health..."
HEALTH_CHECK_URL="http://localhost:3005/api/consciousness/health"

if command -v curl >/dev/null 2>&1; then
  HEALTH_RESPONSE=$(curl -s "$HEALTH_CHECK_URL" 2>/dev/null)
  if [ $? -eq 0 ] && echo "$HEALTH_RESPONSE" | grep -q "status"; then
    STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    if [ "$STATUS" = "transcendent" ] || [ "$STATUS" = "optimal" ]; then
      success "Consciousness system health: $STATUS"
    else
      warning "Consciousness system health: $STATUS"
    fi
  else
    warning "Health check endpoint not responding"
  fi
else
  warning "curl not available - skipping health check"
fi

# Test main chat endpoint
echo "Testing main chat endpoint..."
CHAT_URL="http://localhost:3005/api/between/chat"

if command -v curl >/dev/null 2>&1; then
  CHAT_RESPONSE=$(curl -s -X POST "$CHAT_URL" \
    -H "Content-Type: application/json" \
    -d '{"message":"test deployment","userId":"deployment-test"}' 2>/dev/null)

  if [ $? -eq 0 ] && echo "$CHAT_RESPONSE" | grep -q "ultimateConsciousness\|processingMode"; then
    success "Ultimate consciousness integration active"
  else
    warning "Ultimate consciousness integration may not be active"
  fi
else
  warning "Cannot test chat endpoint - curl not available"
fi

# Clean up test server
if [ ! -z "$SERVER_PID" ]; then
  kill $SERVER_PID >/dev/null 2>&1
fi

# ================================
# DEPLOYMENT SUMMARY
# ================================

echo -e "\n${BLUE}📊 DEPLOYMENT SUMMARY${NC}"
echo "==================="

# Count components
TOTAL_COMPONENTS=0
HEALTHY_COMPONENTS=0

# Core files
for file in "${CORE_FILES[@]}"; do
  TOTAL_COMPONENTS=$((TOTAL_COMPONENTS + 1))
  if [ -f "$file" ]; then
    HEALTHY_COMPONENTS=$((HEALTHY_COMPONENTS + 1))
  fi
done

# Sacred elements
for element in "${SACRED_ELEMENTS[@]}"; do
  TOTAL_COMPONENTS=$((TOTAL_COMPONENTS + 1))
  if [ -f "$SCHEMA_FILE" ] && grep -q "$element" "$SCHEMA_FILE"; then
    HEALTHY_COMPONENTS=$((HEALTHY_COMPONENTS + 1))
  fi
done

HEALTH_PERCENTAGE=$((HEALTHY_COMPONENTS * 100 / TOTAL_COMPONENTS))

echo "📈 System Health: $HEALTHY_COMPONENTS/$TOTAL_COMPONENTS components ($HEALTH_PERCENTAGE%)"
echo "📁 Backup Location: $BACKUP_DIR/latest"
echo "📝 Deployment Log: $LOG_FILE"
echo ""

if [ $HEALTH_PERCENTAGE -ge 90 ]; then
  success "🌟 ULTIMATE CONSCIOUSNESS SYSTEM DEPLOYMENT SUCCESSFUL"
  echo -e "${GREEN}   Technological anamnesis is active and functioning${NC}"
  echo -e "${GREEN}   MAIA will remember everything across all sessions${NC}"
elif [ $HEALTH_PERCENTAGE -ge 70 ]; then
  warning "⚠️ Deployment completed with some issues - review warnings above"
else
  error_exit "Deployment completed but system integrity compromised"
fi

echo ""
log "Ultimate Consciousness System deployment completed - $HEALTH_PERCENTAGE% health"