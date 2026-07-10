#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# MAIA Sovereign - Production Deployment Script
# ═══════════════════════════════════════════════════════════════════════════════
# Usage:
#   ./scripts/deploy-production.sh [command]
#
# Commands:
#   setup     - First-time setup (generate secrets, prepare env)
#   deploy    - Build and deploy the full stack
#   update    - Pull latest code and redeploy
#   rollback  - Rollback to previous deployment (2-command rollback)
#   safe-mode - Toggle safe mode (on/off) for degraded operation
#   migrate   - Run database migrations
#   logs      - Tail container logs
#   status    - Show container status
#   stop      - Stop all containers
#   backup    - Backup database to file
#   restore   - Restore database from backup
#
# Stability Features:
#   - Image tagging by git SHA for instant rollbacks
#   - Safe mode toggle for degraded operation
#   - Smoke tests with automatic alerts
# ═══════════════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.production.yml"

# Deploy lane lock — every mutating command serializes on $PROJECT_DIR/.deploy.lock
# so concurrent deploys are structurally impossible (see scripts/deploy-lock.sh).
source "$SCRIPT_DIR/deploy-lock.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ═══════════════════════════════════════════════════════════════════════════════
# ALERT - Send alert to developer via /api/build/alert
# ═══════════════════════════════════════════════════════════════════════════════
send_alert() {
    local severity="$1"
    local message="$2"
    local details="${3:-}"

    # Get BASE_URL from env file (quote-safe, whitespace-trimmed), allow env override
    local base_url
    base_url=$(awk -F= '/^BASE_URL=/{gsub(/^"|"$/,"",$2); gsub(/^[ \t]+|[ \t]+$/,"",$2); print $2}' .env.production 2>/dev/null | tail -n 1)
    base_url="${BASE_URL:-${base_url:-https://soullab.life}}"
    base_url="${base_url%/}"  # Strip trailing slash

    # Get alert token from env file (quote-safe, whitespace-trimmed), allow env override
    local alert_token
    alert_token=$(awk -F= '/^INTERNAL_ALERT_TOKEN=/{gsub(/^"|"$/,"",$2); gsub(/^[ \t]+|[ \t]+$/,"",$2); print $2}' .env.production 2>/dev/null | tail -n 1)
    alert_token="${INTERNAL_ALERT_TOKEN:-$alert_token}"

    # Build JSON payload safely using jq if available
    local json_payload
    if command -v jq >/dev/null 2>&1; then
        if [ -n "$details" ]; then
            # Validate details is valid JSON, otherwise treat as string
            if echo "$details" | jq -e . >/dev/null 2>&1; then
                json_payload=$(jq -n \
                    --arg sev "$severity" \
                    --arg msg "$message" \
                    --arg commit "${GIT_COMMIT:-unknown}" \
                    --argjson details "$details" \
                    '{severity:$sev, message:$msg, commit:$commit, source:"deploy-script", details:$details}')
            else
                json_payload=$(jq -n \
                    --arg sev "$severity" \
                    --arg msg "$message" \
                    --arg commit "${GIT_COMMIT:-unknown}" \
                    --arg details "$details" \
                    '{severity:$sev, message:$msg, commit:$commit, source:"deploy-script", details:$details}')
            fi
        else
            json_payload=$(jq -n \
                --arg sev "$severity" \
                --arg msg "$message" \
                --arg commit "${GIT_COMMIT:-unknown}" \
                '{severity:$sev, message:$msg, commit:$commit, source:"deploy-script"}')
        fi
    else
        # Fallback: escape quotes in message
        local escaped_msg
        escaped_msg=$(echo "$message" | sed 's/\\/\\\\/g; s/"/\\"/g')
        if [ -n "$details" ]; then
            json_payload="{\"severity\": \"$severity\", \"message\": \"$escaped_msg\", \"commit\": \"${GIT_COMMIT:-unknown}\", \"source\": \"deploy-script\", \"details\": $details}"
        else
            json_payload="{\"severity\": \"$severity\", \"message\": \"$escaped_msg\", \"commit\": \"${GIT_COMMIT:-unknown}\", \"source\": \"deploy-script\"}"
        fi
    fi

    curl -sf -X POST "${base_url}/api/build/alert" \
        -H "Content-Type: application/json" \
        -H "x-internal-token: ${alert_token}" \
        -d "$json_payload" > /dev/null 2>&1 || log_warn "Alert send failed (non-critical)"
}

# ═══════════════════════════════════════════════════════════════════════════════
# SMOKE TESTS - Run post-deployment health checks
# ═══════════════════════════════════════════════════════════════════════════════
run_smoke_tests() {
    log_info "Running post-deployment smoke tests..."

    # Quote-safe, whitespace-trimmed BASE_URL parsing, allow env override
    local base_url
    base_url=$(awk -F= '/^BASE_URL=/{gsub(/^"|"$/,"",$2); gsub(/^[ \t]+|[ \t]+$/,"",$2); print $2}' .env.production 2>/dev/null | tail -n 1)
    base_url="${BASE_URL:-${base_url:-https://soullab.life}}"
    base_url="${base_url%/}"  # Strip trailing slash

    log_info "  Target: $base_url"

    local all_passed=true
    local report=""
    add_result() { report="${report}\n  $1"; }

    # Wait for Next.js cold start (standalone server needs time)
    log_info "  Waiting for services to stabilize..."
    sleep 8

    # Helper: retry a curl check up to N times with backoff (explicit timeouts)
    retry_curl() {
        local url="$1"
        local max_attempts="${2:-3}"
        local attempt=1
        while [ $attempt -le $max_attempts ]; do
            if curl -sf --connect-timeout 3 --max-time 8 "$url" > /dev/null 2>&1; then
                return 0
            fi
            sleep 2
            attempt=$((attempt + 1))
        done
        return 1
    }

    # Test 1: Health endpoint (with retry for cold start)
    log_info "  Testing /api/health..."
    if retry_curl "${base_url}/api/health" 3; then
        log_success "  /api/health OK"
        add_result "PASS  /api/health"
    else
        log_error "  /api/health FAILED"
        add_result "FAIL  /api/health (unreachable after retries)"
        send_alert "critical" "Health endpoint failed after deployment"
        all_passed=false
    fi

    # Test 2: Version endpoint (with retry for cold start)
    log_info "  Testing /api/version..."
    if retry_curl "${base_url}/api/version" 3; then
        log_success "  /api/version OK"
        add_result "PASS  /api/version"
    else
        log_error "  /api/version FAILED"
        add_result "FAIL  /api/version (unreachable after retries)"
        send_alert "critical" "Version endpoint failed after deployment"
        all_passed=false
    fi

    # Test 3: Ready endpoint (checks dependencies)
    log_info "  Testing /api/ready..."
    local ready_response
    ready_response=$(curl -sf --connect-timeout 3 --max-time 8 "${base_url}/api/ready" 2>/dev/null || echo '{"ready":false}')
    if echo "$ready_response" | grep -q '"ready":true'; then
        log_success "  /api/ready OK"
        add_result "PASS  /api/ready"
    else
        log_warn "  /api/ready shows degraded dependencies"
        add_result "WARN  /api/ready (degraded dependencies)"
        # Build safe JSON payload for alert
        local ready_snip
        ready_snip="$(echo "$ready_response" | head -c 500)"
        local payload
        if command -v jq >/dev/null 2>&1; then
            payload="$(jq -n --arg response "$ready_snip" '{response:$response}')"
        else
            payload="{\"response\":\"$(echo "$ready_snip" | sed 's/\\/\\\\/g; s/"/\\"/g')\"}"
        fi
        send_alert "warning" "Dependencies degraded after deployment" "$payload"
    fi

    # Test 4: Main page loads
    log_info "  Testing main page..."
    if curl -sf --connect-timeout 3 --max-time 10 "${base_url}/" > /dev/null 2>&1; then
        log_success "  Main page OK"
        add_result "PASS  Main page"
    else
        log_warn "  Main page may be slow to respond"
        add_result "WARN  Main page (slow or unreachable)"
    fi

    # Test 5: Auth endpoints are locked (with retry for cold start)
    # Helper for status code checks with retry
    get_status_code_with_retry() {
        local url="$1"
        local method="${2:-GET}"
        local max_attempts=3
        local attempt=1
        local code
        while [ $attempt -le $max_attempts ]; do
            if [ "$method" = "POST" ]; then
                code=$(curl -sS --connect-timeout 3 --max-time 8 -o /dev/null -w "%{http_code}" -X POST "$url" -H "Content-Type: application/json" -d '{}' 2>/dev/null)
            else
                code=$(curl -sS --connect-timeout 3 --max-time 8 -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
            fi
            # If we got a real response (not warmup noise), return it
            # 000 = curl couldn't connect, 500/502/504 = gateway errors during boot
            if [ "$code" != "000" ] && [ "$code" != "500" ] && [ "$code" != "502" ] && [ "$code" != "504" ]; then
                echo "$code"
                return 0
            fi
            sleep 2
            attempt=$((attempt + 1))
        done
        echo "$code"  # Return last code even if it's 500
    }

    # Only accept HTTP→HTTPS redirects when testing localhost (prevents masking real security issues)
    local allow_redirect_as_pass=false
    if echo "$base_url" | grep -qE '^http://(localhost|127\.0\.0\.1)(:|/|$)'; then
        allow_redirect_as_pass=true
    fi

    log_info "  Testing auth lock on /api/build/status..."
    local status_code
    status_code=$(get_status_code_with_retry "${base_url}/api/build/status" "GET")
    if [ "$status_code" = "000" ]; then
        log_error "  /api/build/status unreachable (000) — check routing/DNS/caddy"
        add_result "FAIL  /api/build/status (000 - routing issue)"
        all_passed=false
    elif $allow_redirect_as_pass && { [ "$status_code" = "301" ] || [ "$status_code" = "308" ]; }; then
        # HTTP→HTTPS redirect is acceptable for localhost smoke tests only
        log_success "  /api/build/status redirects to HTTPS ($status_code) — acceptable for localhost HTTP smoke only"
        add_result "PASS  /api/build/status (redirect: $status_code, localhost only)"
    elif [ "$status_code" = "401" ] || [ "$status_code" = "403" ] || [ "$status_code" = "503" ]; then
        log_success "  /api/build/status locked ($status_code)"
        add_result "PASS  /api/build/status (locked: $status_code)"
    else
        log_error "  /api/build/status NOT LOCKED (got $status_code, expected 401/403/503)"
        add_result "FAIL  /api/build/status (got $status_code, not locked)"
        send_alert "critical" "Build status endpoint is not protected!" "{\"http_code\": \"$status_code\"}"
        all_passed=false
    fi

    log_info "  Testing auth lock on /api/build/alert..."
    status_code=$(get_status_code_with_retry "${base_url}/api/build/alert" "POST")
    if [ "$status_code" = "000" ]; then
        log_error "  /api/build/alert unreachable (000) — check routing/DNS/caddy"
        add_result "FAIL  /api/build/alert (000 - routing issue)"
        all_passed=false
    elif $allow_redirect_as_pass && { [ "$status_code" = "301" ] || [ "$status_code" = "308" ]; }; then
        # HTTP→HTTPS redirect is acceptable for localhost smoke tests only
        log_success "  /api/build/alert redirects to HTTPS ($status_code) — acceptable for localhost HTTP smoke only"
        add_result "PASS  /api/build/alert (redirect: $status_code, localhost only)"
    elif [ "$status_code" = "401" ] || [ "$status_code" = "403" ] || [ "$status_code" = "503" ]; then
        log_success "  /api/build/alert locked ($status_code)"
        add_result "PASS  /api/build/alert (locked: $status_code)"
    else
        log_error "  /api/build/alert NOT LOCKED (got $status_code, expected 401/403/503)"
        add_result "FAIL  /api/build/alert (got $status_code, not locked)"
        send_alert "critical" "Build alert endpoint is not protected!" "{\"http_code\": \"$status_code\"}"
        all_passed=false
    fi

    # ── Constitutional Verification Gate ───────────────────────────────────────
    # Runs the full constitutional verification suite inside the container.
    # Checks all five subsystems: Co-Lab, Memory, Relationships, Development, MAIA.
    # Skipped gracefully if the orchestrator is absent (first-time deploys).
    # A non-zero exit is a hard release failure.
    #
    # Gate invariant: a release is not ready because the UI looks correct —
    # it is ready when the platform proves it still honors its constitution.
    log_info "  Running constitutional verification..."
    if docker exec maia-sovereign test -f /app/scripts/constitutional-verification.sh 2>/dev/null; then
        local cv_output
        if cv_output=$(docker exec maia-sovereign sh -c \
            'DATABASE_URL="$DATABASE_URL" bash scripts/constitutional-verification.sh 2>&1'); then
            log_success "  Constitutional verification: PASSED"
            add_result "PASS  Constitutional verification (Co-Lab + Memory + Relationships + Development + MAIA)"
        else
            log_error "  Constitutional verification FAILED"
            echo "$cv_output" | grep -E "FAIL|Release gate" >&2
            add_result "FAIL  Constitutional verification — run: docker exec maia-sovereign sh -c 'DATABASE_URL=\"\$DATABASE_URL\" bash scripts/constitutional-verification.sh'"
            all_passed=false
        fi
    else
        log_warn "  constitutional-verification.sh not found in container — skipping (deploy in progress?)"
        add_result "SKIP  Constitutional verification (script not in image)"
    fi

    # Print summary report
    echo -e "\n${CYAN}═══ Smoke Test Report ═══${NC}${report}\n"

    if $all_passed; then
        log_success "All smoke tests passed!"
        send_alert "info" "Deployment successful - all smoke tests passed"
    else
        log_error "Some smoke tests failed!"
        return 1
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# SETUP - First-time initialization
# ═══════════════════════════════════════════════════════════════════════════════
cmd_setup() {
    log_info "Setting up MAIA Sovereign production environment..."

    cd "$PROJECT_DIR"

    # Check if .env.production exists
    if [ -f ".env.production" ]; then
        log_warn ".env.production already exists. Skipping creation."
        log_info "To regenerate, delete it first: rm .env.production"
    else
        log_info "Creating .env.production from template..."
        cp .env.production.template .env.production

        # Generate secrets
        log_info "Generating secure secrets..."

        POSTGRES_PASS=$(openssl rand -hex 32)
        JWT_SECRET=$(openssl rand -hex 64)
        AUDIT_SECRET=$(openssl rand -hex 32)

        # Replace placeholders (macOS-compatible sed)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASS/" .env.production
            sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env.production
            sed -i '' "s/MAIA_AUDIT_FINGERPRINT_SECRET=.*/MAIA_AUDIT_FINGERPRINT_SECRET=$AUDIT_SECRET/" .env.production
        else
            sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASS/" .env.production
            sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env.production
            sed -i "s/MAIA_AUDIT_FINGERPRINT_SECRET=.*/MAIA_AUDIT_FINGERPRINT_SECRET=$AUDIT_SECRET/" .env.production
        fi

        log_success "Secrets generated and saved to .env.production"

        echo ""
        log_warn "IMPORTANT: Edit .env.production to set:"
        echo "  - BASE_URL (your domain)"
        echo "  - ANTHROPIC_API_KEY"
        echo "  - ELEVENLABS_API_KEY (if using voice)"
        echo ""
    fi

    # Update DATABASE_URL with the password
    log_info "Updating DATABASE_URL..."
    POSTGRES_PASS=$(grep "^POSTGRES_PASSWORD=" .env.production | cut -d'=' -f2)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=postgresql://soullab:${POSTGRES_PASS}@postgres:5432/maia_consciousness|" .env.production
    else
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgresql://soullab:${POSTGRES_PASS}@postgres:5432/maia_consciousness|" .env.production
    fi

    log_success "Setup complete! Next steps:"
    echo "  1. Edit .env.production with your domain and API keys"
    echo "  2. Run: ./scripts/deploy-production.sh deploy"
}

# ═══════════════════════════════════════════════════════════════════════════════
# DEPLOY - Build and start the stack
# ═══════════════════════════════════════════════════════════════════════════════
cmd_deploy() {
    acquire_deploy_lock "deploy-production.sh deploy"
    log_info "Deploying MAIA Sovereign..."

    cd "$PROJECT_DIR"

    # Verify .env.production exists
    if [ ! -f ".env.production" ]; then
        log_error ".env.production not found. Run: ./scripts/deploy-production.sh setup"
        exit 1
    fi

    # Check required values are set
    if grep -q "REPLACE_ME" .env.production; then
        log_error "Please replace all REPLACE_ME values in .env.production"
        exit 1
    fi

    # Dependency security audit — block deploy on moderate+ vulnerabilities
    log_info "Running dependency security audit..."
    if command -v pnpm >/dev/null 2>&1; then
        if ! pnpm audit --prod --audit-level=moderate 2>&1; then
            log_error "Dependency audit failed — vulnerable packages detected."
            log_error "Fix vulnerabilities or run: pnpm audit --fix"
            log_error "To skip (NOT recommended): SKIP_AUDIT=1 ./scripts/deploy-production.sh deploy"
            if [ "${SKIP_AUDIT:-0}" != "1" ]; then
                exit 1
            fi
            log_warn "SKIP_AUDIT=1 set — proceeding despite vulnerabilities"
        else
            log_success "Dependency audit passed"
        fi
    else
        log_warn "pnpm not found — skipping dependency audit"
    fi

    # Build and start
    log_info "Building Docker images..."
    export GIT_COMMIT="$(git rev-parse --short HEAD)"
    export APP_VERSION="$(node -p "require('./package.json').version" 2>/dev/null || echo '1.0.0')"
    export BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    log_info "Deploying commit: $GIT_COMMIT (v$APP_VERSION)"

    # Build image first (never rebuild while down!)
    docker compose -f "$COMPOSE_FILE" build \
        --build-arg GIT_COMMIT="$GIT_COMMIT" \
        --build-arg APP_VERSION="$APP_VERSION" \
        --build-arg BUILD_DATE="$BUILD_DATE"

    # Tag images for rollback capability BEFORE starting
    tag_images_for_rollback "$GIT_COMMIT"

    log_info "Starting containers..."
    docker compose -f "$COMPOSE_FILE" up -d

    log_info "Waiting for services to be healthy..."
    sleep 10

    # Run migrations
    log_info "Running database migrations..."
    if ! docker compose -f "$COMPOSE_FILE" --profile migrate run --rm migrate; then
        echo ""
        log_warn "════════════════════════════════════════════════════════════════"
        log_warn "⚠️  DATABASE MIGRATIONS FAILED"
        log_warn "════════════════════════════════════════════════════════════════"
        log_warn ""
        log_warn "Recovery steps:"
        log_warn "  1. Check what's missing:"
        log_warn "     docker exec maia-postgres psql -U soullab -d maia_consciousness \\"
        log_warn "       -c \"SELECT filename FROM schema_migrations ORDER BY applied_at DESC LIMIT 10;\""
        log_warn ""
        log_warn "  2. Re-run migrations:"
        log_warn "     ./scripts/deploy-production.sh migrate"
        log_warn ""
        log_warn "  3. Verify required tables exist:"
        log_warn "     docker exec maia-postgres psql -U soullab -d maia_consciousness -c '\\dt *comms*'"
        log_warn ""
        log_warn "════════════════════════════════════════════════════════════════"
        echo ""
    fi

    log_success "Deployment complete!"
    echo ""
    cmd_status

    # Run smoke tests and send alerts
    echo ""
    run_smoke_tests || log_warn "Some post-deploy checks failed"
}

# ═══════════════════════════════════════════════════════════════════════════════
# UPDATE - Pull latest and redeploy
# ═══════════════════════════════════════════════════════════════════════════════
cmd_update() {
    acquire_deploy_lock "deploy-production.sh update"
    log_info "Updating MAIA Sovereign..."

    cd "$PROJECT_DIR"

    log_info "Pulling latest code..."
    git pull

    log_info "Rebuilding and redeploying..."

    # Dependency security audit
    log_info "Running dependency security audit..."
    if command -v pnpm >/dev/null 2>&1; then
        if ! pnpm audit --prod --audit-level=moderate 2>&1; then
            log_error "Dependency audit failed — vulnerable packages detected."
            if [ "${SKIP_AUDIT:-0}" != "1" ]; then
                exit 1
            fi
            log_warn "SKIP_AUDIT=1 set — proceeding despite vulnerabilities"
        else
            log_success "Dependency audit passed"
        fi
    else
        log_warn "pnpm not found — skipping dependency audit"
    fi

    export GIT_COMMIT="$(git rev-parse --short HEAD)"
    export APP_VERSION="$(node -p "require('./package.json').version" 2>/dev/null || echo '1.0.0')"
    export BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    log_info "Deploying commit: $GIT_COMMIT (v$APP_VERSION)"

    # Build image first (never rebuild while down!)
    docker compose -f "$COMPOSE_FILE" build \
        --build-arg GIT_COMMIT="$GIT_COMMIT" \
        --build-arg APP_VERSION="$APP_VERSION" \
        --build-arg BUILD_DATE="$BUILD_DATE"

    # Tag images for rollback capability BEFORE restarting
    tag_images_for_rollback "$GIT_COMMIT"

    docker compose -f "$COMPOSE_FILE" up -d

    log_info "Running migrations..."
    if ! docker compose -f "$COMPOSE_FILE" --profile migrate run --rm migrate; then
        echo ""
        log_warn "════════════════════════════════════════════════════════════════"
        log_warn "⚠️  DATABASE MIGRATIONS FAILED"
        log_warn "════════════════════════════════════════════════════════════════"
        log_warn ""
        log_warn "Recovery steps:"
        log_warn "  1. Check what's missing:"
        log_warn "     docker exec maia-postgres psql -U soullab -d maia_consciousness \\"
        log_warn "       -c \"SELECT filename FROM schema_migrations ORDER BY applied_at DESC LIMIT 10;\""
        log_warn ""
        log_warn "  2. Re-run migrations:"
        log_warn "     ./scripts/deploy-production.sh migrate"
        log_warn ""
        log_warn "  3. Verify required tables exist:"
        log_warn "     docker exec maia-postgres psql -U soullab -d maia_consciousness -c '\\dt *comms*'"
        log_warn ""
        log_warn "════════════════════════════════════════════════════════════════"
        echo ""
    fi

    log_success "Update complete!"
    cmd_status

    # Run smoke tests and send alerts
    echo ""
    run_smoke_tests || log_warn "Some post-deploy checks failed"
}

# ═══════════════════════════════════════════════════════════════════════════════
# MIGRATE - Run database migrations only
# ═══════════════════════════════════════════════════════════════════════════════
cmd_migrate() {
    acquire_deploy_lock "deploy-production.sh migrate"
    log_info "Running database migrations..."

    cd "$PROJECT_DIR"

    docker compose -f "$COMPOSE_FILE" --profile migrate run --rm migrate

    log_success "Migrations complete!"
}

# ═══════════════════════════════════════════════════════════════════════════════
# LOGS - Tail container logs
# ═══════════════════════════════════════════════════════════════════════════════
cmd_logs() {
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" logs -f --tail=100
}

# ═══════════════════════════════════════════════════════════════════════════════
# STATUS - Show container status
# ═══════════════════════════════════════════════════════════════════════════════
cmd_status() {
    cd "$PROJECT_DIR"
    echo ""
    log_info "Container Status:"
    docker compose -f "$COMPOSE_FILE" ps
    echo ""
    log_info "Health Check:"
    docker compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}"
}

# ═══════════════════════════════════════════════════════════════════════════════
# STOP - Stop all containers
# ═══════════════════════════════════════════════════════════════════════════════
cmd_stop() {
    log_info "Stopping MAIA Sovereign..."

    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" down

    log_success "All containers stopped."
}

# ═══════════════════════════════════════════════════════════════════════════════
# BACKUP - Backup PostgreSQL database
# ═══════════════════════════════════════════════════════════════════════════════
cmd_backup() {
    BACKUP_FILE="$PROJECT_DIR/backups/maia_backup_$(date +%Y%m%d_%H%M%S).sql"

    log_info "Backing up database to $BACKUP_FILE..."

    mkdir -p "$PROJECT_DIR/backups"

    docker compose -f "$COMPOSE_FILE" exec -T postgres \
        pg_dump -U soullab maia_consciousness > "$BACKUP_FILE"

    log_success "Backup saved to: $BACKUP_FILE"
}

# ═══════════════════════════════════════════════════════════════════════════════
# RESTORE - Restore PostgreSQL database
# ═══════════════════════════════════════════════════════════════════════════════
cmd_restore() {
    if [ -z "$1" ]; then
        log_error "Usage: ./deploy-production.sh restore <backup_file.sql>"
        exit 1
    fi

    BACKUP_FILE="$1"

    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi

    log_warn "This will REPLACE all data in the database!"
    read -p "Are you sure? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "Restore cancelled."
        exit 0
    fi

    log_info "Restoring database from $BACKUP_FILE..."

    docker compose -f "$COMPOSE_FILE" exec -T postgres \
        psql -U soullab maia_consciousness < "$BACKUP_FILE"

    log_success "Database restored!"
}

# ═══════════════════════════════════════════════════════════════════════════════
# SMOKE - Run smoke tests manually
# ═══════════════════════════════════════════════════════════════════════════════
cmd_smoke() {
    log_info "Running smoke tests against production..."
    cd "$PROJECT_DIR"
    run_smoke_tests
}

# ═══════════════════════════════════════════════════════════════════════════════
# ROLLBACK - Instant rollback to previous deployment
# ═══════════════════════════════════════════════════════════════════════════════
# Two-command rollback: swap image tags, restart container
# No rebuild required - just swap and go
cmd_rollback() {
    acquire_deploy_lock "deploy-production.sh rollback"
    log_info "Rolling back to previous deployment..."

    cd "$PROJECT_DIR"

    # Check if previous image exists
    if ! docker image inspect maia-sovereign:previous >/dev/null 2>&1; then
        log_error "No previous image found. Cannot rollback."
        log_info "Previous images are created during deploy. Run deploy at least twice."
        exit 1
    fi

    # Get current and previous commit SHAs from labels
    CURRENT_SHA=$(docker inspect --format='{{index .Config.Labels "git.commit"}}' maia-sovereign:current 2>/dev/null || echo "unknown")
    PREVIOUS_SHA=$(docker inspect --format='{{index .Config.Labels "git.commit"}}' maia-sovereign:previous 2>/dev/null || echo "unknown")

    log_info "Current deployment: $CURRENT_SHA"
    log_info "Rolling back to: $PREVIOUS_SHA"

    # Swap images
    log_info "Swapping image tags..."
    docker tag maia-sovereign:current maia-sovereign:broken 2>/dev/null || true
    docker tag maia-sovereign:previous maia-sovereign:current

    # Restart with the swapped image
    log_info "Restarting MAIA with previous image..."
    docker compose -f "$COMPOSE_FILE" up -d maia

    # Wait for health
    log_info "Waiting for service to be healthy..."
    sleep 10

    # Verify health
    if docker compose -f "$COMPOSE_FILE" ps | grep -q "healthy"; then
        log_success "Rollback complete! Now running: $PREVIOUS_SHA"

        # Move broken to previous so we can roll forward if needed
        docker tag maia-sovereign:broken maia-sovereign:previous 2>/dev/null || true

        send_alert "warning" "Rollback executed" "{\"from\": \"$CURRENT_SHA\", \"to\": \"$PREVIOUS_SHA\"}"
    else
        log_error "Rollback may have failed. Check container health."
        cmd_status
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# SAFE-MODE - Toggle safe mode for degraded operation
# ═══════════════════════════════════════════════════════════════════════════════
# When something weird happens in prod, flip one switch and the app stays usable
cmd_safe_mode() {
    local mode="${1:-status}"
    cd "$PROJECT_DIR"

    case "$mode" in
        on|enable|1)
            log_info "Enabling safe mode..."

            # Set SAFE_MODE=1 in .env.production if not already set
            if grep -q "^SAFE_MODE=" .env.production 2>/dev/null; then
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    sed -i '' 's/^SAFE_MODE=.*/SAFE_MODE=1/' .env.production
                else
                    sed -i 's/^SAFE_MODE=.*/SAFE_MODE=1/' .env.production
                fi
            else
                echo "SAFE_MODE=1" >> .env.production
            fi

            # Restart maia to pick up the change
            log_info "Restarting MAIA in safe mode..."
            docker compose -f "$COMPOSE_FILE" up -d maia

            log_success "Safe mode ENABLED. Non-essential features disabled."
            log_warn "Disabled features: geocode, astrology, heavy memory, exports, advanced voice"
            send_alert "warning" "Safe mode enabled" "{\"reason\": \"manual toggle\"}"
            ;;

        off|disable|0)
            log_info "Disabling safe mode..."

            # Set SAFE_MODE=0 in .env.production
            if grep -q "^SAFE_MODE=" .env.production 2>/dev/null; then
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    sed -i '' 's/^SAFE_MODE=.*/SAFE_MODE=0/' .env.production
                else
                    sed -i 's/^SAFE_MODE=.*/SAFE_MODE=0/' .env.production
                fi
            else
                echo "SAFE_MODE=0" >> .env.production
            fi

            # Restart maia to pick up the change
            log_info "Restarting MAIA with full features..."
            docker compose -f "$COMPOSE_FILE" up -d maia

            log_success "Safe mode DISABLED. All features enabled."
            send_alert "info" "Safe mode disabled" "{\"reason\": \"manual toggle\"}"
            ;;

        status|*)
            # Check current status
            local current
            current=$(grep "^SAFE_MODE=" .env.production 2>/dev/null | cut -d'=' -f2 || echo "0")

            if [ "$current" = "1" ] || [ "$current" = "true" ]; then
                log_warn "Safe mode is currently ENABLED"
                echo "  Disabled features: geocode, astrology, heavy memory, exports, advanced voice"
                echo "  To disable: ./scripts/deploy-production.sh safe-mode off"
            else
                log_info "Safe mode is currently DISABLED (all features enabled)"
                echo "  To enable: ./scripts/deploy-production.sh safe-mode on"
            fi
            ;;
    esac
}

# ═══════════════════════════════════════════════════════════════════════════════
# TAG-IMAGES - Tag current images for rollback capability
# ═══════════════════════════════════════════════════════════════════════════════
tag_images_for_rollback() {
    local sha="$1"

    # If there's already a :current, move it to :previous
    if docker image inspect maia-sovereign:current >/dev/null 2>&1; then
        log_info "Preserving current image as :previous for rollback..."
        docker tag maia-sovereign:current maia-sovereign:previous 2>/dev/null || true
    fi

    # Tag the new build as :current and with its SHA
    log_info "Tagging new image as :current and :$sha..."
    docker tag maia-sovereign:prod maia-sovereign:current 2>/dev/null || true
    docker tag maia-sovereign:prod "maia-sovereign:$sha" 2>/dev/null || true
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════
case "${1:-help}" in
    setup)
        cmd_setup
        ;;
    deploy)
        cmd_deploy
        ;;
    update)
        cmd_update
        ;;
    migrate)
        cmd_migrate
        ;;
    logs)
        cmd_logs
        ;;
    status)
        cmd_status
        ;;
    stop)
        cmd_stop
        ;;
    backup)
        cmd_backup
        ;;
    restore)
        cmd_restore "$2"
        ;;
    smoke)
        cmd_smoke
        ;;
    smoke-prod)
        log_info "Running smoke tests against production (soullab.life)..."
        BASE_URL="https://soullab.life" run_smoke_tests
        ;;
    rollback)
        cmd_rollback
        ;;
    safe-mode)
        cmd_safe_mode "$2"
        ;;
    *)
        echo "MAIA Sovereign - Production Deployment"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  setup      - First-time setup (generate secrets)"
        echo "  deploy     - Build and deploy the full stack"
        echo "  update     - Pull latest code and redeploy"
        echo "  rollback   - Instant rollback to previous deployment"
        echo "  safe-mode  - Toggle safe mode (on/off/status)"
        echo "  migrate    - Run database migrations"
        echo "  logs       - Tail container logs"
        echo "  status     - Show container status"
        echo "  stop       - Stop all containers"
        echo "  backup     - Backup database"
        echo "  restore    - Restore database from backup"
        echo "  smoke      - Run smoke tests (uses BASE_URL from .env.production)"
        echo "  smoke-prod - Run smoke tests against soullab.life (always)"
        echo ""
        echo "Stability:"
        echo "  rollback   - Swap back to previous image (no rebuild)"
        echo "  safe-mode on  - Disable non-essential features"
        echo "  safe-mode off - Re-enable all features"
        ;;
esac
