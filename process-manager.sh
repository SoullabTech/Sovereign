#!/bin/bash

# ============================================================================
# MAIA SOVEREIGN PROCESS MANAGER
# Centralized control for all development and production processes
# Prevents errant process proliferation and provides single source of truth
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Process tracking
PROCESS_DIR="/tmp/maia-processes"
mkdir -p "$PROCESS_DIR"

# Logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# Check if process is already running
check_running() {
    local service_name="$1"
    local pid_file="$PROCESS_DIR/$service_name.pid"

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0  # Process is running
        else
            rm -f "$pid_file"  # Clean up stale PID file
            return 1  # Process not running
        fi
    fi
    return 1  # No PID file
}

# Start development server
start_dev() {
    local port="${1:-3000}"
    local service_name="dev-server-$port"

    if check_running "$service_name"; then
        warn "Development server already running on port $port"
        return
    fi

    log "Starting development server on port $port..."
    cd /Users/soullab/MAIA-SOVEREIGN

    # Kill any existing processes on this port
    lsof -ti:$port | xargs kill -9 2>/dev/null || true

    # Start new process
    if [ "$port" != "3000" ]; then
        PORT=$port npm run dev > "$PROCESS_DIR/$service_name.log" 2>&1 &
    else
        npm run dev > "$PROCESS_DIR/$service_name.log" 2>&1 &
    fi

    echo $! > "$PROCESS_DIR/$service_name.pid"
    log "Development server started on port $port (PID: $!)"
}

# Start production server
start_prod() {
    local port="${1:-80}"
    local service_name="prod-server-$port"

    if check_running "$service_name"; then
        warn "Production server already running on port $port"
        return
    fi

    log "Starting production server on port $port..."
    cd /Users/soullab/MAIA-SOVEREIGN

    # Kill any existing processes on this port
    lsof -ti:$port | xargs kill -9 2>/dev/null || true

    # Start new process
    PORT=$port npm start > "$PROCESS_DIR/$service_name.log" 2>&1 &
    echo $! > "$PROCESS_DIR/$service_name.pid"
    log "Production server started on port $port (PID: $!)"
}

# Start consciousness monitor
start_consciousness() {
    local service_name="consciousness-monitor"

    if check_running "$service_name"; then
        warn "Consciousness monitor already running"
        return
    fi

    # Check Python dependencies first
    if ! python3 -c "import scipy.signal" 2>/dev/null; then
        error "Python consciousness monitor has dependency issues. Skipping."
        return
    fi

    log "Starting consciousness monitor..."
    cd /Users/soullab/MAIA-SOVEREIGN
    python3 start_consciousness_monitor.py > "$PROCESS_DIR/$service_name.log" 2>&1 &
    echo $! > "$PROCESS_DIR/$service_name.pid"
    log "Consciousness monitor started (PID: $!)"
}

# Stop a service
stop_service() {
    local service_name="$1"
    local pid_file="$PROCESS_DIR/$service_name.pid"

    if [ ! -f "$pid_file" ]; then
        warn "No PID file for $service_name"
        return
    fi

    local pid=$(cat "$pid_file")
    if ps -p "$pid" > /dev/null 2>&1; then
        log "Stopping $service_name (PID: $pid)..."
        kill -TERM "$pid"
        sleep 2

        # Force kill if still running
        if ps -p "$pid" > /dev/null 2>&1; then
            warn "Force killing $service_name..."
            kill -9 "$pid"
        fi

        rm -f "$pid_file"
        log "$service_name stopped"
    else
        warn "$service_name was not running"
        rm -f "$pid_file"
    fi
}

# Stop all services
stop_all() {
    log "Stopping all managed processes..."

    for pid_file in "$PROCESS_DIR"/*.pid; do
        if [ -f "$pid_file" ]; then
            local service_name=$(basename "$pid_file" .pid)
            stop_service "$service_name"
        fi
    done

    # Clean up any remaining MAIA processes
    log "Cleaning up any remaining MAIA processes..."
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "npm start" 2>/dev/null || true
    pkill -f "consciousness_monitor" 2>/dev/null || true

    log "All processes stopped"
}

# Status check
status() {
    echo -e "\n${BLUE}=== MAIA SOVEREIGN PROCESS STATUS ===${NC}"

    local any_running=false

    for pid_file in "$PROCESS_DIR"/*.pid; do
        if [ -f "$pid_file" ]; then
            local service_name=$(basename "$pid_file" .pid)
            local pid=$(cat "$pid_file")

            if ps -p "$pid" > /dev/null 2>&1; then
                echo -e "${GREEN}✓${NC} $service_name (PID: $pid)"
                any_running=true
            else
                echo -e "${RED}✗${NC} $service_name (stale PID file)"
                rm -f "$pid_file"
            fi
        fi
    done

    if [ "$any_running" = false ]; then
        echo -e "${YELLOW}No managed processes running${NC}"
    fi

    # Show port usage
    echo -e "\n${BLUE}=== PORT USAGE ===${NC}"
    lsof -i :3000,3001,3002,3003,3004,80 2>/dev/null | grep LISTEN || echo "No MAIA processes found on standard ports"
}

# Deploy with proper process management
deploy() {
    log "🚀 Starting managed deployment..."

    # Stop existing processes
    stop_all

    # Build the application
    log "Building application..."
    cd /Users/soullab/MAIA-SOVEREIGN
    npm run build

    if [ $? -eq 0 ]; then
        log "✅ Build successful, starting production server..."
        start_prod 80
    else
        error "❌ Build failed, starting development server instead..."
        start_dev 3000
    fi
}

# Show usage
usage() {
    echo "MAIA Sovereign Process Manager"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start-dev [port]     Start development server (default port 3000)"
    echo "  start-prod [port]    Start production server (default port 80)"
    echo "  start-consciousness  Start consciousness monitoring"
    echo "  stop <service>       Stop specific service"
    echo "  stop-all            Stop all managed processes"
    echo "  status              Show status of all processes"
    echo "  deploy              Build and deploy production"
    echo "  cleanup             Emergency cleanup of all MAIA processes"
    echo ""
    echo "Examples:"
    echo "  $0 start-dev        # Start dev server on port 3000"
    echo "  $0 start-dev 3005   # Start dev server on port 3005"
    echo "  $0 status           # Check what's running"
    echo "  $0 stop-all         # Stop everything"
    echo "  $0 deploy           # Build and start production"
}

# Emergency cleanup
cleanup() {
    log "🧹 Emergency cleanup of all MAIA processes..."

    # Kill all Node.js processes related to MAIA
    pkill -f "npm.*dev" 2>/dev/null || true
    pkill -f "npm.*start" 2>/dev/null || true
    pkill -f "next.*dev" 2>/dev/null || true
    pkill -f "consciousness" 2>/dev/null || true
    pkill -f "MAIA" 2>/dev/null || true

    # Clean up PID files
    rm -rf "$PROCESS_DIR"
    mkdir -p "$PROCESS_DIR"

    # Kill processes on common ports
    for port in 3000 3001 3002 3003 3004 3005 80; do
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    done

    log "✅ Emergency cleanup complete"
}

# Main command handler
case "${1:-}" in
    start-dev)
        start_dev "${2:-3000}"
        ;;
    start-prod)
        start_prod "${2:-80}"
        ;;
    start-consciousness)
        start_consciousness
        ;;
    stop)
        if [ -z "$2" ]; then
            error "Please specify service name to stop"
            exit 1
        fi
        stop_service "$2"
        ;;
    stop-all)
        stop_all
        ;;
    status)
        status
        ;;
    deploy)
        deploy
        ;;
    cleanup)
        cleanup
        ;;
    *)
        usage
        ;;
esac