#!/bin/bash
# MAIA Full System Startup - Bulletproof Edition
# Purpose: Start all required services for MAIA voice conversation system

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
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

log_section() {
    echo -e "${CYAN}[SECTION]${NC} $1"
}

banner() {
    echo ""
    echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║                                                           ║${NC}"
    echo -e "${MAGENTA}║           MAIA SOVEREIGN - FULL SYSTEM STARTUP            ║${NC}"
    echo -e "${MAGENTA}║                                                           ║${NC}"
    echo -e "${MAGENTA}║             100% Sovereign Voice Conversation             ║${NC}"
    echo -e "${MAGENTA}║                                                           ║${NC}"
    echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Check if a service is running on a port
check_port() {
    local port=$1
    lsof -ti:$port >/dev/null 2>&1
}

# Wait for a service to be healthy
wait_for_service() {
    local name=$1
    local url=$2
    local max_attempts=${3:-30}
    local attempt=1

    log_info "Waiting for $name to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" >/dev/null 2>&1; then
            log_info "✅ $name is ready!"
            return 0
        fi

        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo ""
    log_error "❌ $name failed to start after $max_attempts attempts"
    return 1
}

# Main execution
main() {
    banner

    cd "$PROJECT_DIR"

    # ============================================================
    # STEP 1: Start Whisper Server
    # ============================================================
    log_section "Step 1: Starting Whisper Server"
    echo ""

    if check_port 8080; then
        log_info "Whisper server already running on port 8080"

        # Verify it's healthy
        if curl -s -f http://127.0.0.1:8080 >/dev/null 2>&1; then
            log_info "✅ Whisper server is healthy"
        else
            log_warn "Whisper server port occupied but not responding"
            log_info "Restarting..."
            "$SCRIPT_DIR/stop-whisper.sh"
            sleep 2
            "$SCRIPT_DIR/start-whisper.sh"
        fi
    else
        log_info "Starting Whisper server..."
        "$SCRIPT_DIR/start-whisper.sh"
    fi

    # ============================================================
    # STEP 2: Check Ollama (Required for MAIA intelligence)
    # ============================================================
    log_section "Step 2: Checking Ollama Service"
    echo ""

    if ! command -v ollama &> /dev/null; then
        log_error "Ollama not found! Install from: https://ollama.ai"
        exit 1
    fi

    log_info "Checking Ollama service..."

    if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        log_warn "Ollama service not responding, attempting to start..."

        # Try to start Ollama (macOS)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            if [ -d "/Applications/Ollama.app" ]; then
                open -a Ollama
                log_info "Waiting for Ollama to start..."
                sleep 5

                if wait_for_service "Ollama" "http://localhost:11434/api/tags" 15; then
                    log_info "✅ Ollama started successfully"
                else
                    log_error "Failed to start Ollama"
                    exit 1
                fi
            else
                log_error "Ollama.app not found in /Applications"
                exit 1
            fi
        else
            log_error "Please start Ollama manually: ollama serve"
            exit 1
        fi
    else
        log_info "✅ Ollama service is running"
    fi

    # Check for required model
    log_info "Checking for DeepSeek-R1 model..."

    if ollama list | grep -q "deepseek-r1"; then
        log_info "✅ DeepSeek-R1 model found"
    else
        log_warn "DeepSeek-R1 model not found"
        log_info "Install with: ollama pull deepseek-r1:latest"
    fi

    # ============================================================
    # STEP 3: Check Database Services (Optional)
    # ============================================================
    log_section "Step 3: Checking Database Services"
    echo ""

    # PostgreSQL
    if check_port 5432; then
        log_info "✅ PostgreSQL running on port 5432"
    else
        log_warn "PostgreSQL not detected (optional for development)"
    fi

    # Redis
    if check_port 6380 || check_port 6379; then
        log_info "✅ Redis running"
    else
        log_warn "Redis not detected (optional for caching)"
    fi

    # ============================================================
    # STEP 4: Start MAIA Dev Server
    # ============================================================
    log_section "Step 4: Starting MAIA Dev Server"
    echo ""

    if check_port 3003; then
        log_info "Dev server already running on port 3003"
        log_info "✅ MAIA interface available at http://localhost:3003/maia"
    else
        log_info "Starting Next.js dev server on port 3003..."
        log_info "This will run in the background..."

        # Kill any stale lock files
        rm -f "$PROJECT_DIR/.next/dev/lock"

        # Start in background
        nohup npm run dev > "$PROJECT_DIR/dev-server.log" 2>&1 &
        local dev_pid=$!

        log_info "Dev server started with PID: $dev_pid"

        if wait_for_service "Dev Server" "http://localhost:3003" 30; then
            log_info "✅ Dev server is ready!"
        else
            log_error "Dev server failed to start"
            log_info "Check logs: tail -50 $PROJECT_DIR/dev-server.log"
            exit 1
        fi
    fi

    # ============================================================
    # FINAL STATUS
    # ============================================================
    echo ""
    echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║                                                           ║${NC}"
    echo -e "${MAGENTA}║                  ✅ ALL SYSTEMS OPERATIONAL                ║${NC}"
    echo -e "${MAGENTA}║                                                           ║${NC}"
    echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""

    log_info "🌟 MAIA Voice System Status:"
    echo ""
    echo "  🎤 Speech-to-Text:   http://127.0.0.1:8080 (whisper-cpp, 100% sovereign)"
    echo "  🧠 Intelligence:      http://localhost:11434 (Ollama DeepSeek-R1, 100% sovereign)"
    echo "  🎯 MAIA Interface:    http://localhost:3003/maia"
    echo "  🔊 Text-to-Speech:    OpenAI TTS (approved for voice output)"
    echo ""

    log_info "📊 Check system health: ./scripts/check-whisper.sh"
    log_info "🛑 Stop Whisper: ./scripts/stop-whisper.sh"
    log_info "📜 Whisper logs: tail -f whisper-server.log"
    log_info "📜 Dev server logs: tail -f dev-server.log"
    echo ""

    log_info "🎉 Ready to test voice conversation!"
    log_info "   1. Open http://localhost:3003/maia"
    log_info "   2. Click the microphone button"
    log_info "   3. Speak and verify MAIA responds"
    echo ""

    log_info "Sovereignty Status: 100% (STT & Intelligence local)"
    echo ""
}

# Run main
main
