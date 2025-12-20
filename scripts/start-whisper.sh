#!/bin/bash
# Bulletproof Whisper Server Startup Script
# Purpose: Start local Whisper.cpp server with health checks and auto-recovery

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
WHISPER_MODEL="$HOME/whisper-models/ggml-base.en.bin"
WHISPER_PORT=8080
WHISPER_HOST="127.0.0.1"
MAX_RETRIES=3
RETRY_DELAY=5

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if port is already in use
check_port() {
    if lsof -Pi :$WHISPER_PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Kill existing Whisper server
kill_existing() {
    log_info "Checking for existing Whisper server on port $WHISPER_PORT..."

    if check_port; then
        local pids=$(lsof -ti:$WHISPER_PORT)
        log_warn "Found existing process(es): $pids"

        for pid in $pids; do
            log_info "Killing process $pid..."
            kill $pid 2>/dev/null || true
            sleep 2

            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                log_warn "Process $pid still running, force killing..."
                kill -9 $pid 2>/dev/null || true
                sleep 1
            fi
        done

        # Verify port is free
        if check_port; then
            log_error "Failed to free port $WHISPER_PORT"
            exit 1
        fi

        log_info "Port $WHISPER_PORT is now free"
    else
        log_info "Port $WHISPER_PORT is already free"
    fi
}

# Check if whisper-server is installed
check_installation() {
    log_info "Checking whisper-server installation..."

    if ! command -v whisper-server &> /dev/null; then
        log_error "whisper-server not found! Install with: brew install whisper-cpp"
        exit 1
    fi

    log_info "whisper-server found: $(which whisper-server)"
}

# Check if model exists
check_model() {
    log_info "Checking Whisper model..."

    if [ ! -f "$WHISPER_MODEL" ]; then
        log_error "Model not found: $WHISPER_MODEL"
        log_info "Download with:"
        log_info "  mkdir -p ~/whisper-models"
        log_info "  cd ~/whisper-models"
        log_info "  curl -L -O https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin"
        exit 1
    fi

    local model_size=$(du -h "$WHISPER_MODEL" | cut -f1)
    log_info "Model found: $WHISPER_MODEL ($model_size)"
}

# Check if FFmpeg is available
check_ffmpeg() {
    log_info "Checking FFmpeg installation..."

    if ! command -v ffmpeg &> /dev/null; then
        log_warn "FFmpeg not found (audio format conversion may fail)"
        log_info "Install with: brew install ffmpeg"
        return 1
    fi

    log_info "FFmpeg found: $(ffmpeg -version | head -1)"
    return 0
}

# Health check - verify server is responding
health_check() {
    local max_attempts=10
    local attempt=1

    log_info "Waiting for server to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s -f http://$WHISPER_HOST:$WHISPER_PORT >/dev/null 2>&1; then
            log_info "Server is healthy and responding!"
            return 0
        fi

        log_info "Attempt $attempt/$max_attempts - Server not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done

    log_error "Server failed to respond after $max_attempts attempts"
    return 1
}

# Start the Whisper server
start_server() {
    local has_ffmpeg=0
    check_ffmpeg && has_ffmpeg=1

    log_info "Starting Whisper server..."
    log_info "  Host: $WHISPER_HOST"
    log_info "  Port: $WHISPER_PORT"
    log_info "  Model: $WHISPER_MODEL"
    log_info "  GPU: Enabled (Metal)"
    log_info "  FFmpeg: $([ $has_ffmpeg -eq 1 ] && echo 'Enabled' || echo 'Disabled')"

    # Build command
    local cmd="whisper-server -m $WHISPER_MODEL --host $WHISPER_HOST --port $WHISPER_PORT"

    # Add --convert flag if FFmpeg is available
    if [ $has_ffmpeg -eq 1 ]; then
        cmd="$cmd --convert"
    fi

    # Start server in background
    log_info "Executing: $cmd"
    nohup $cmd > "$PROJECT_DIR/whisper-server.log" 2>&1 &

    local pid=$!
    log_info "Server started with PID: $pid"

    # Wait a moment for server to initialize
    sleep 3

    # Verify process is still running
    if ! ps -p $pid > /dev/null 2>&1; then
        log_error "Server process died immediately!"
        log_error "Check logs: tail -50 $PROJECT_DIR/whisper-server.log"
        exit 1
    fi

    # Perform health check
    if health_check; then
        log_info "✅ Whisper server is fully operational!"
        log_info "   URL: http://$WHISPER_HOST:$WHISPER_PORT"
        log_info "   PID: $pid"
        log_info "   Logs: tail -f $PROJECT_DIR/whisper-server.log"
        return 0
    else
        log_error "Health check failed!"
        log_error "Check logs: tail -50 $PROJECT_DIR/whisper-server.log"

        # Kill the unhealthy server
        kill $pid 2>/dev/null || true
        exit 1
    fi
}

# Main execution
main() {
    echo ""
    log_info "=========================================="
    log_info "  Whisper Server Bulletproof Startup"
    log_info "=========================================="
    echo ""

    # Pre-flight checks
    check_installation
    check_model

    # Kill any existing server
    kill_existing

    # Start server with retries
    local retry=1
    while [ $retry -le $MAX_RETRIES ]; do
        log_info "Start attempt $retry/$MAX_RETRIES..."

        if start_server; then
            echo ""
            log_info "=========================================="
            log_info "  🎉 SUCCESS: Whisper server running!"
            log_info "=========================================="
            echo ""
            exit 0
        fi

        log_warn "Attempt $retry failed, retrying in $RETRY_DELAY seconds..."
        sleep $RETRY_DELAY
        retry=$((retry + 1))
    done

    log_error "Failed to start Whisper server after $MAX_RETRIES attempts"
    exit 1
}

# Run main function
main
