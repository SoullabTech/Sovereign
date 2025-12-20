#!/bin/bash
# Whisper Server Health Check Script
# Purpose: Check status and health of local Whisper.cpp server

WHISPER_PORT=8080
WHISPER_HOST="127.0.0.1"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_status() {
    echo -e "${BLUE}[STATUS]${NC} $1"
}

echo ""
echo "=========================================="
echo "  Whisper Server Health Check"
echo "=========================================="
echo ""

# Check if port is in use
log_status "Checking port $WHISPER_PORT..."

if ! lsof -ti:$WHISPER_PORT >/dev/null 2>&1; then
    log_error "❌ No process found on port $WHISPER_PORT"
    log_info "Start server with: ./scripts/start-whisper.sh"
    exit 1
fi

pids=$(lsof -ti:$WHISPER_PORT)
log_info "✅ Process(es) found: $pids"

# Get process details
for pid in $pids; do
    echo ""
    log_status "Process Details (PID: $pid):"
    ps -p $pid -o pid,ppid,user,%cpu,%mem,etime,command | tail -1 | awk '{
        printf "  PID:     %s\n", $1
        printf "  User:    %s\n", $3
        printf "  CPU:     %s%%\n", $4
        printf "  Memory:  %s%%\n", $5
        printf "  Uptime:  %s\n", $6
        printf "  Command: "
        for(i=7;i<=NF;i++) printf "%s ", $i
        printf "\n"
    }'
done

# HTTP health check
echo ""
log_status "Performing HTTP health check..."

if curl -s -f http://$WHISPER_HOST:$WHISPER_PORT >/dev/null 2>&1; then
    log_info "✅ Server is responding to HTTP requests"

    # Get response time
    response_time=$(curl -s -o /dev/null -w "%{time_total}" http://$WHISPER_HOST:$WHISPER_PORT 2>/dev/null)
    log_info "   Response time: ${response_time}s"
else
    log_error "❌ Server is not responding to HTTP requests"
    log_warn "Process is running but may be unhealthy"
    exit 1
fi

# Check model file
echo ""
log_status "Checking model file..."

WHISPER_MODEL="$HOME/whisper-models/ggml-base.en.bin"
if [ -f "$WHISPER_MODEL" ]; then
    model_size=$(du -h "$WHISPER_MODEL" | cut -f1)
    log_info "✅ Model found: $WHISPER_MODEL ($model_size)"
else
    log_warn "⚠️  Model not found at expected location: $WHISPER_MODEL"
fi

# Check GPU availability (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    log_status "Checking GPU support..."

    if system_profiler SPDisplaysDataType 2>/dev/null | grep -q "Metal"; then
        log_info "✅ Metal GPU support available"

        # Get GPU model
        gpu_model=$(system_profiler SPDisplaysDataType 2>/dev/null | grep "Chipset Model" | head -1 | awk -F': ' '{print $2}' | xargs)
        if [ ! -z "$gpu_model" ]; then
            log_info "   GPU: $gpu_model"
        fi
    else
        log_warn "⚠️  Metal GPU support not detected"
    fi
fi

# Check log file
echo ""
log_status "Recent log entries..."

LOG_FILE="$(dirname "$(dirname "${BASH_SOURCE[0]}")")/whisper-server.log"
if [ -f "$LOG_FILE" ]; then
    log_info "Log file: $LOG_FILE"
    echo ""
    echo "Last 10 lines:"
    echo "----------------------------------------"
    tail -10 "$LOG_FILE"
    echo "----------------------------------------"
else
    log_warn "Log file not found: $LOG_FILE"
fi

# Summary
echo ""
echo "=========================================="
log_info "✅ Overall Status: HEALTHY"
echo "=========================================="
echo ""
log_info "Server URL: http://$WHISPER_HOST:$WHISPER_PORT"
log_info "PID(s): $pids"
log_info "View logs: tail -f $LOG_FILE"
echo ""

exit 0
