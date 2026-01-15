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
#   migrate   - Run database migrations
#   logs      - Tail container logs
#   status    - Show container status
#   stop      - Stop all containers
#   backup    - Backup database to file
#   restore   - Restore database from backup
# ═══════════════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.production.yml"

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

    # Get BASE_URL from env file
    local base_url
    base_url=$(grep "^BASE_URL=" .env.production 2>/dev/null | cut -d'=' -f2 || echo "https://soullab.life")
    base_url="${base_url:-https://soullab.life}"

    # Get alert token from env file
    local alert_token
    alert_token=$(grep "^INTERNAL_ALERT_TOKEN=" .env.production 2>/dev/null | cut -d'=' -f2 || echo "")

    local json_payload
    if [ -n "$details" ]; then
        json_payload="{\"severity\": \"$severity\", \"message\": \"$message\", \"commit\": \"${GIT_COMMIT:-unknown}\", \"source\": \"deploy-script\", \"details\": $details}"
    else
        json_payload="{\"severity\": \"$severity\", \"message\": \"$message\", \"commit\": \"${GIT_COMMIT:-unknown}\", \"source\": \"deploy-script\"}"
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

    local base_url
    base_url=$(grep "^BASE_URL=" .env.production 2>/dev/null | cut -d'=' -f2 || echo "https://soullab.life")
    base_url="${base_url:-https://soullab.life}"

    local all_passed=true

    # Wait for services to stabilize
    sleep 5

    # Test 1: Health endpoint
    log_info "  Testing /api/health..."
    if curl -sf "${base_url}/api/health" > /dev/null 2>&1; then
        log_success "  /api/health OK"
    else
        log_error "  /api/health FAILED"
        send_alert "critical" "Health endpoint failed after deployment"
        all_passed=false
    fi

    # Test 2: Version endpoint
    log_info "  Testing /api/version..."
    if curl -sf "${base_url}/api/version" > /dev/null 2>&1; then
        log_success "  /api/version OK"
    else
        log_error "  /api/version FAILED"
        send_alert "critical" "Version endpoint failed after deployment"
        all_passed=false
    fi

    # Test 3: Ready endpoint (checks dependencies)
    log_info "  Testing /api/ready..."
    local ready_response
    ready_response=$(curl -sf "${base_url}/api/ready" 2>/dev/null || echo '{"ready":false}')
    if echo "$ready_response" | grep -q '"ready":true'; then
        log_success "  /api/ready OK"
    else
        log_warn "  /api/ready shows degraded dependencies"
        send_alert "warning" "Dependencies degraded after deployment" "{\"response\": $(echo "$ready_response" | head -c 500)}"
    fi

    # Test 4: Main page loads
    log_info "  Testing main page..."
    if curl -sf "${base_url}/" > /dev/null 2>&1; then
        log_success "  Main page OK"
    else
        log_warn "  Main page may be slow to respond"
    fi

    # Test 5: Auth endpoints are locked (prove they reject without credentials)
    log_info "  Testing auth lock on /api/build/status..."
    local status_code
    status_code=$(curl -sS -o /dev/null -w "%{http_code}" "${base_url}/api/build/status" 2>/dev/null)
    if [ "$status_code" = "401" ] || [ "$status_code" = "403" ] || [ "$status_code" = "503" ]; then
        log_success "  /api/build/status locked ($status_code)"
    else
        log_error "  /api/build/status NOT LOCKED (got $status_code, expected 401/403/503)"
        send_alert "critical" "Build status endpoint is not protected!" "{\"http_code\": \"$status_code\"}"
        all_passed=false
    fi

    log_info "  Testing auth lock on /api/build/alert..."
    status_code=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "${base_url}/api/build/alert" -H "Content-Type: application/json" -d '{}' 2>/dev/null)
    if [ "$status_code" = "401" ] || [ "$status_code" = "403" ] || [ "$status_code" = "503" ]; then
        log_success "  /api/build/alert locked ($status_code)"
    else
        log_error "  /api/build/alert NOT LOCKED (got $status_code, expected 401/403/503)"
        send_alert "critical" "Build alert endpoint is not protected!" "{\"http_code\": \"$status_code\"}"
        all_passed=false
    fi

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

    # Build and start
    log_info "Building Docker images..."
    export GIT_COMMIT="$(git rev-parse --short HEAD)"
    log_info "Deploying commit: $GIT_COMMIT"
    docker compose -f "$COMPOSE_FILE" build --build-arg GIT_COMMIT="$GIT_COMMIT"

    log_info "Starting containers..."
    docker compose -f "$COMPOSE_FILE" up -d

    log_info "Waiting for services to be healthy..."
    sleep 10

    # Run migrations
    log_info "Running database migrations..."
    docker compose -f "$COMPOSE_FILE" --profile migrate run --rm migrate || true

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
    log_info "Updating MAIA Sovereign..."

    cd "$PROJECT_DIR"

    log_info "Pulling latest code..."
    git pull

    log_info "Rebuilding and redeploying..."
    export GIT_COMMIT="$(git rev-parse --short HEAD)"
    log_info "Deploying commit: $GIT_COMMIT"
    docker compose -f "$COMPOSE_FILE" build --build-arg GIT_COMMIT="$GIT_COMMIT"
    docker compose -f "$COMPOSE_FILE" up -d

    log_info "Running migrations..."
    docker compose -f "$COMPOSE_FILE" --profile migrate run --rm migrate || true

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
    *)
        echo "MAIA Sovereign - Production Deployment"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  setup     - First-time setup (generate secrets)"
        echo "  deploy    - Build and deploy the full stack"
        echo "  update    - Pull latest code and redeploy"
        echo "  migrate   - Run database migrations"
        echo "  logs      - Tail container logs"
        echo "  status    - Show container status"
        echo "  stop      - Stop all containers"
        echo "  backup    - Backup database"
        echo "  restore   - Restore database from backup"
        echo "  smoke     - Run smoke tests against production"
        ;;
esac
