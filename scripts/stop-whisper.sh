#!/bin/bash
# Bulletproof Whisper Server Shutdown Script
# Purpose: Gracefully stop local Whisper.cpp server

set -e

WHISPER_PORT=8080

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo ""
log_info "=========================================="
log_info "  Whisper Server Shutdown"
log_info "=========================================="
echo ""

# Find processes on port
log_info "Checking for Whisper server on port $WHISPER_PORT..."

if ! lsof -ti:$WHISPER_PORT >/dev/null 2>&1; then
    log_info "No Whisper server found on port $WHISPER_PORT"
    log_info "Server is already stopped."
    exit 0
fi

pids=$(lsof -ti:$WHISPER_PORT)
log_info "Found process(es): $pids"

# Graceful shutdown
for pid in $pids; do
    log_info "Sending SIGTERM to process $pid..."
    kill $pid 2>/dev/null || true

    # Wait up to 10 seconds for graceful shutdown
    local waited=0
    while ps -p $pid > /dev/null 2>&1 && [ $waited -lt 10 ]; do
        sleep 1
        waited=$((waited + 1))
        echo -n "."
    done
    echo ""

    # Force kill if still running
    if ps -p $pid > /dev/null 2>&1; then
        log_warn "Process $pid did not stop gracefully, force killing..."
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi

    # Verify stopped
    if ps -p $pid > /dev/null 2>&1; then
        log_error "Failed to stop process $pid"
        exit 1
    else
        log_info "Process $pid stopped successfully"
    fi
done

# Final verification
if lsof -ti:$WHISPER_PORT >/dev/null 2>&1; then
    log_error "Port $WHISPER_PORT is still in use!"
    exit 1
fi

echo ""
log_info "=========================================="
log_info "  ✅ Whisper server stopped successfully"
log_info "=========================================="
echo ""
