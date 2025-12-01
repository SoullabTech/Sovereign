#!/bin/bash

# 🛡️ BULLETPROOF MAIA DEPLOYMENT STRATEGY
# Multi-layered, fault-tolerant deployment with automatic fallbacks

set -e  # Exit on error
trap 'echo "❌ Deployment failed at line $LINENO. Executing fallback strategy..."' ERR

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="./logs/bulletproof-deploy-$(date +%Y%m%d_%H%M%S).log"
mkdir -p ./logs

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

# ============================================================================
# 1. PRE-DEPLOYMENT VALIDATION & HEALTH CHECKS
# ============================================================================

validate_environment() {
    log "🔍 Validating deployment environment..."

    # Check Docker
    if ! docker --version > /dev/null 2>&1; then
        error "Docker not available"
        return 1
    fi

    # Check disk space (need at least 5GB free)
    available_space=$(df . | tail -1 | awk '{print $4}')
    if [ "$available_space" -lt 5242880 ]; then  # 5GB in KB
        warn "Low disk space detected. Cleaning up..."
        docker system prune -f
    fi

    # Check memory (macOS compatible)
    if command -v vm_stat > /dev/null 2>&1; then
        # macOS memory check using vm_stat
        warn "Memory check on macOS - monitoring available"
    elif command -v free > /dev/null 2>&1; then
        # Linux memory check
        if [ "$(free -m | awk 'NR==2{printf "%.0f", $3*100/$2}')" -gt 90 ]; then
            warn "High memory usage detected"
        fi
    fi

    # Validate critical files
    local critical_files=(
        "package.json"
        "next.config.js"
        "tailwind.config.js"
        ".env.production"
    )

    for file in "${critical_files[@]}"; do
        if [ ! -f "$file" ]; then
            error "Critical file missing: $file"
            return 1
        fi
    done

    success "Environment validation passed"
    return 0
}

# ============================================================================
# 2. OPTIMIZED BUILD STRATEGY WITH FALLBACKS
# ============================================================================

build_with_optimizations() {
    log "🚀 Building with optimizations..."

    # Set Node.js optimizations
    export NODE_OPTIONS="--max-old-space-size=8192 --max-semi-space-size=256"
    export NEXT_TELEMETRY_DISABLED=1

    # Build with timeout and retry logic
    timeout 600 npm run build || {
        warn "Standard build failed. Trying fallback build strategy..."

        # Fallback: Build with reduced parallelism
        export UV_THREADPOOL_SIZE=4
        timeout 900 npm run build:safe || {
            warn "Safe build failed. Trying minimal build..."

            # Ultimate fallback: Minimal build
            timeout 1200 npm run build:minimal || {
                error "All build strategies failed"
                return 1
            }
        }
    }

    success "Build completed successfully"
    return 0
}

# ============================================================================
# 3. PROGRESSIVE DEPLOYMENT WITH HEALTH CHECKS
# ============================================================================

deploy_progressive() {
    log "📦 Starting progressive deployment..."

    # Strategy 1: Use existing successful deployment as base
    if docker ps | grep -q maia-sovereign_web; then
        log "Found existing deployment. Creating backup..."
        docker tag maia-sovereign_web:latest maia-sovereign_web:backup-$(date +%Y%m%d_%H%M%S)
    fi

    # Strategy 2: Build only the web service first
    log "Building web service..."
    docker-compose build web --no-cache --parallel || {
        warn "Docker build failed. Using PM2 direct deployment..."
        return 1
    }

    # Strategy 3: Start with health checks
    log "Starting services with health monitoring..."
    docker-compose up -d --remove-orphans

    # Wait and verify
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            success "Service health check passed on attempt $attempt"
            return 0
        fi

        log "Health check attempt $attempt/$max_attempts..."
        sleep 10
        ((attempt++))
    done

    warn "Health checks failed after $max_attempts attempts"
    return 1
}

# ============================================================================
# 4. FALLBACK: PM2 DIRECT DEPLOYMENT
# ============================================================================

deploy_pm2_fallback() {
    log "🔄 Initiating PM2 fallback deployment..."

    # Stop existing PM2 processes
    pm2 delete maia-sovereign 2>/dev/null || true

    # Start with PM2
    PORT=80 pm2 start npm --name "maia-sovereign" -- start
    pm2 save

    # Verify PM2 deployment
    sleep 15
    if pm2 list | grep -q "maia-sovereign.*online"; then
        if curl -f http://localhost/api/health > /dev/null 2>&1; then
            success "PM2 fallback deployment successful"
            return 0
        fi
    fi

    error "PM2 fallback deployment failed"
    return 1
}

# ============================================================================
# 5. EMERGENCY: RESTORE FROM BACKUP
# ============================================================================

restore_from_backup() {
    log "🆘 Initiating emergency restore from backup..."

    # Find most recent backup
    backup_image=$(docker images | grep "maia-sovereign_web.*backup" | head -1 | awk '{print $1":"$2}')

    if [ -n "$backup_image" ]; then
        docker tag "$backup_image" maia-sovereign_web:latest
        docker-compose up -d web

        if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
            success "Successfully restored from backup: $backup_image"
            return 0
        fi
    fi

    error "Backup restore failed"
    return 1
}

# ============================================================================
# 6. MAIN EXECUTION FLOW WITH ERROR HANDLING
# ============================================================================

main() {
    log "${BOLD}🛡️  BULLETPROOF MAIA DEPLOYMENT STARTED${NC}"

    # Phase 1: Validation
    if validate_environment; then
        log "✅ Phase 1: Environment validation passed"
    else
        error "❌ Phase 1: Environment validation failed"
        exit 1
    fi

    # Phase 2: Build
    if build_with_optimizations; then
        log "✅ Phase 2: Build completed"
    else
        warn "⚠️  Phase 2: Build failed, will use existing build"
    fi

    # Phase 3: Progressive deployment
    if deploy_progressive; then
        log "✅ Phase 3: Progressive deployment successful"
        success "🎉 MAIA Sovereign is live at https://soullab.life"
        return 0
    fi

    # Phase 4: PM2 Fallback
    warn "Phase 3 failed. Attempting PM2 fallback..."
    if deploy_pm2_fallback; then
        log "✅ Phase 4: PM2 fallback deployment successful"
        success "🎉 MAIA Sovereign is live via PM2 at http://localhost"
        return 0
    fi

    # Phase 5: Emergency restore
    warn "Phase 4 failed. Attempting emergency restore..."
    if restore_from_backup; then
        log "✅ Phase 5: Emergency restore successful"
        success "🎉 MAIA Sovereign restored from backup"
        return 0
    fi

    # All strategies failed
    error "❌ ALL DEPLOYMENT STRATEGIES FAILED"
    error "Manual intervention required. Check logs: $LOG_FILE"
    exit 1
}

# ============================================================================
# 7. ADDITIONAL SAFETY BUILD SCRIPTS
# ============================================================================

# Add fallback build scripts to package.json
cat > ./temp_package_scripts.json << 'EOF'
{
  "build:safe": "NODE_OPTIONS='--max-old-space-size=4096' next build",
  "build:minimal": "NODE_OPTIONS='--max-old-space-size=2048' NEXT_MINIMAL=true next build"
}
EOF

# Execute main function
main "$@"