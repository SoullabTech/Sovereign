#!/bin/bash
# ============================================================
# MAIA Local AI Stack — Sovereign Development Environment
# ============================================================
# Replaces paid Claude API with local open-source models
# running on Mac Studio M4 Max (48GB unified memory)
#
# Models stored on T7 Shield SSD (~592 MB/s)
# Inference runs in unified memory at full M4 Max speed
#
# Usage:
#   ./scripts/setup-local-ai.sh          # Full setup
#   ./scripts/setup-local-ai.sh storage  # Storage migration only
#   ./scripts/setup-local-ai.sh models   # Pull models only
#   ./scripts/setup-local-ai.sh config   # Configure Claude Code only
#   ./scripts/setup-local-ai.sh status   # Check current status
# ============================================================

set -euo pipefail

# ── Configuration ──────────────────────────────────────────
MODEL_STORAGE="/Volumes/T7 Shield/ollama-models"
OLLAMA_HOME="$HOME/.ollama"
OLLAMA_MODELS_DIR="$OLLAMA_HOME/models"

# Models to install (fits comfortably in 48GB with Docker)
CODING_MODEL="qwen3-coder:30b"        # 18.6GB — MoE, 3.3B active, agentic coding
CONTENT_MODEL="qwen3:32b"             # ~20GB — content, copy, documentation
REASONING_MODEL="deepseek-r1:8b"      # 5.2GB — already installed, quick reasoning
EMBEDDING_MODEL="nomic-embed-text"     # 274MB — already installed, RAG/search
IMAGE_MODEL="x/z-image-turbo"         # ~6GB — local image generation (experimental)

# Claude Code context window (critical — default 4096 is too small)
CONTEXT_LENGTH=65536

# Keep models in memory for 24h (avoids repeated cold starts from SSD)
KEEP_ALIVE="24h"

# ── Colors ─────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
AMBER='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[MAIA]${NC} $1"; }
warn() { echo -e "${AMBER}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

# ── Preflight Checks ──────────────────────────────────────
preflight() {
    log "Running preflight checks..."

    # Check Ollama
    if ! command -v ollama &>/dev/null; then
        err "Ollama not installed. Install from https://ollama.com"
        exit 1
    fi
    local ver
    ver=$(ollama --version 2>/dev/null | awk '{print $NF}')
    log "Ollama version: $ver"

    # Check version >= 0.14 (needed for Anthropic API compatibility)
    local major minor
    major=$(echo "$ver" | cut -d. -f1)
    minor=$(echo "$ver" | cut -d. -f2)
    if [[ "$major" -eq 0 && "$minor" -lt 14 ]]; then
        err "Ollama v0.14+ required for Anthropic API compatibility. You have v$ver"
        err "Update with: brew upgrade ollama"
        exit 1
    fi
    log "Ollama v0.14+ confirmed (Anthropic Messages API supported)"

    # Check Claude Code
    if ! command -v claude &>/dev/null; then
        warn "Claude Code CLI not found. Install with: npm install -g @anthropic-ai/claude-code"
    else
        log "Claude Code CLI found"
    fi

    # Check T7 Shield
    if [[ ! -d "/Volumes/T7 Shield" ]]; then
        err "T7 Shield not mounted at /Volumes/T7 Shield"
        err "Connect the drive and try again"
        exit 1
    fi
    local avail
    avail=$(df -h "/Volumes/T7 Shield" | tail -1 | awk '{print $4}')
    log "T7 Shield available: $avail"

    # Check memory
    local mem_gb
    mem_gb=$(sysctl -n hw.memsize | awk '{printf "%.0f", $1/1073741824}')
    log "System memory: ${mem_gb}GB unified"

    # Check Docker overhead
    local docker_mem
    if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
        docker_mem=$(docker stats --no-stream --format '{{.MemUsage}}' 2>/dev/null | awk -F'/' '{sum += $1} END {printf "%.1f", sum/1024}' 2>/dev/null || echo "unknown")
        log "Docker memory usage: ~${docker_mem}GB"
    fi

    echo ""
}

# ── Storage Migration ─────────────────────────────────────
setup_storage() {
    log "Setting up model storage on T7 Shield..."

    # Create target directory
    if [[ ! -d "$MODEL_STORAGE" ]]; then
        mkdir -p "$MODEL_STORAGE"
        log "Created $MODEL_STORAGE"
    fi

    # Check if already symlinked
    if [[ -L "$OLLAMA_MODELS_DIR" ]]; then
        local target
        target=$(readlink "$OLLAMA_MODELS_DIR")
        if [[ "$target" == "$MODEL_STORAGE" ]]; then
            log "Already symlinked to T7 Shield. Skipping."
            return 0
        else
            warn "Models currently symlinked to: $target"
            warn "Will re-link to T7 Shield"
        fi
    fi

    # Stop Ollama
    log "Stopping Ollama..."
    pkill -f "ollama serve" 2>/dev/null || true
    brew services stop ollama 2>/dev/null || true
    sleep 2

    # Move existing models if they exist as a real directory
    if [[ -d "$OLLAMA_MODELS_DIR" && ! -L "$OLLAMA_MODELS_DIR" ]]; then
        local existing_size
        existing_size=$(du -sh "$OLLAMA_MODELS_DIR" 2>/dev/null | awk '{print $1}')
        log "Moving existing models ($existing_size) to T7 Shield..."
        rsync -avh --progress "$OLLAMA_MODELS_DIR/" "$MODEL_STORAGE/"
        rm -rf "$OLLAMA_MODELS_DIR"
        log "Migration complete"
    elif [[ -L "$OLLAMA_MODELS_DIR" ]]; then
        # Remove old symlink
        rm "$OLLAMA_MODELS_DIR"
    fi

    # Create symlink
    ln -s "$MODEL_STORAGE" "$OLLAMA_MODELS_DIR"
    log "Symlinked: ~/.ollama/models -> $MODEL_STORAGE"

    # Verify
    if [[ -L "$OLLAMA_MODELS_DIR" ]] && [[ "$(readlink "$OLLAMA_MODELS_DIR")" == "$MODEL_STORAGE" ]]; then
        log "Storage migration verified"
    else
        err "Symlink verification failed!"
        exit 1
    fi

    # Restart Ollama
    log "Starting Ollama..."
    brew services start ollama 2>/dev/null || ollama serve &>/dev/null &
    sleep 3

    # Set keep-alive to avoid repeated cold starts
    launchctl setenv OLLAMA_KEEP_ALIVE "$KEEP_ALIVE" 2>/dev/null || true
    log "Keep-alive set to $KEEP_ALIVE (models stay in memory)"
}

# ── Model Installation ────────────────────────────────────
pull_models() {
    log "Pulling models to T7 Shield..."
    echo ""

    local models=(
        "$CODING_MODEL"
        "$CONTENT_MODEL"
        "$EMBEDDING_MODEL"
        "$IMAGE_MODEL"
    )

    # Check which are already installed
    local installed
    installed=$(ollama list 2>/dev/null | awk '{print $1}' || echo "")

    for model in "${models[@]}"; do
        if echo "$installed" | grep -q "^${model}$"; then
            log "$model — already installed"
        else
            log "Pulling $model..."
            ollama pull "$model"
            log "$model — done"
        fi
        echo ""
    done

    # Create coding model variant with extended context
    log "Creating $CODING_MODEL with ${CONTEXT_LENGTH} context window..."
    local modelfile_path="/tmp/maia-coder-modelfile"
    cat > "$modelfile_path" << EOF
FROM $CODING_MODEL
PARAMETER num_ctx $CONTEXT_LENGTH
PARAMETER temperature 0.3
EOF
    ollama create maia-coder -f "$modelfile_path"
    rm -f "$modelfile_path"
    log "Created 'maia-coder' (qwen3-coder + 64K context + low temp for precision)"

    # Create content model variant
    log "Creating content model with extended context..."
    local content_modelfile="/tmp/maia-content-modelfile"
    cat > "$content_modelfile" << EOF
FROM $CONTENT_MODEL
PARAMETER num_ctx $CONTEXT_LENGTH
PARAMETER temperature 0.7
EOF
    ollama create maia-content -f "$content_modelfile"
    rm -f "$content_modelfile"
    log "Created 'maia-content' (qwen3 + 64K context + creative temp)"

    echo ""
    log "All models installed. Current inventory:"
    ollama list
}

# ── Claude Code Configuration ─────────────────────────────
configure_claude_code() {
    log "Configuring Claude Code for local models..."

    # Shell config
    local shell_rc="$HOME/.zshrc"
    local marker="# ── MAIA Local AI Stack ──"

    if grep -q "$marker" "$shell_rc" 2>/dev/null; then
        warn "Local AI config already in $shell_rc — updating..."
        # Remove old block
        sed -i '' "/$marker/,/# ── END MAIA Local AI ──/d" "$shell_rc"
    fi

    cat >> "$shell_rc" << 'ZSHRC'

# ── MAIA Local AI Stack ──
# Sovereign development: no paid APIs, no data leaving your machine

# Point Claude Code at local Ollama (Anthropic Messages API)
export ANTHROPIC_BASE_URL="http://localhost:11434"
export ANTHROPIC_AUTH_TOKEN="ollama"
export ANTHROPIC_API_KEY=""

# Model aliases for Claude Code /model command
export ANTHROPIC_MODEL="maia-coder"
export ANTHROPIC_DEFAULT_OPUS_MODEL="maia-coder"
export ANTHROPIC_DEFAULT_SONNET_MODEL="maia-coder"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-r1:8b"
export CLAUDE_CODE_SUBAGENT_MODEL="deepseek-r1:8b"

# Ollama performance tuning
export OLLAMA_KEEP_ALIVE="24h"
export OLLAMA_CONTEXT_LENGTH="65536"

# Quick aliases
alias maia-code='ANTHROPIC_BASE_URL="http://localhost:11434" ANTHROPIC_AUTH_TOKEN="ollama" ANTHROPIC_API_KEY="" claude --model maia-coder'
alias maia-cloud='unset ANTHROPIC_BASE_URL && unset ANTHROPIC_AUTH_TOKEN && claude'

# ── END MAIA Local AI ──
ZSHRC

    log "Shell config written to $shell_rc"
    echo ""
    info "Two modes available:"
    info "  maia-code  → Local models (free, sovereign, private)"
    info "  maia-cloud → Anthropic API (when you need Opus-level reasoning)"
    echo ""
    log "Run 'source $shell_rc' or open a new terminal to activate"
}

# ── Status Check ──────────────────────────────────────────
show_status() {
    echo ""
    log "═══ MAIA Local AI Stack Status ═══"
    echo ""

    # Ollama
    if pgrep -f "ollama serve" &>/dev/null; then
        log "Ollama: RUNNING"
    else
        err "Ollama: NOT RUNNING"
    fi

    # Storage
    if [[ -L "$OLLAMA_MODELS_DIR" ]]; then
        local target
        target=$(readlink "$OLLAMA_MODELS_DIR")
        log "Model storage: $target"
        if [[ -d "$target" ]]; then
            local used
            used=$(du -sh "$target" 2>/dev/null | awk '{print $1}')
            log "Storage used: $used"
        fi
    else
        warn "Model storage: ~/.ollama/models (internal SSD — not migrated)"
    fi

    # Models
    echo ""
    log "Installed models:"
    ollama list 2>/dev/null | while IFS= read -r line; do
        info "  $line"
    done

    # Docker
    echo ""
    log "Docker containers:"
    docker ps --format "  {{.Names}}: {{.Status}}" 2>/dev/null | while IFS= read -r line; do
        info "$line"
    done

    # Memory
    echo ""
    local mem_pressure
    mem_pressure=$(memory_pressure 2>/dev/null | head -1 || echo "unknown")
    log "Memory: $mem_pressure"

    # Environment
    echo ""
    if [[ -n "${ANTHROPIC_BASE_URL:-}" ]]; then
        log "Claude Code target: $ANTHROPIC_BASE_URL (LOCAL)"
    else
        warn "Claude Code target: Anthropic API (CLOUD — costs money)"
        info "Run 'source ~/.zshrc' or use 'maia-code' alias"
    fi

    echo ""
    log "═══════════════════════════════════"
}

# ── Main ──────────────────────────────────────────────────
main() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   MAIA Local AI Stack — Sovereign Dev     ║${NC}"
    echo -e "${GREEN}║   Mac Studio M4 Max · 48GB · T7 Shield    ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
    echo ""

    local cmd="${1:-all}"

    case "$cmd" in
        storage)
            preflight
            setup_storage
            ;;
        models)
            preflight
            pull_models
            ;;
        config)
            configure_claude_code
            ;;
        status)
            show_status
            ;;
        all)
            preflight
            setup_storage
            pull_models
            configure_claude_code
            echo ""
            show_status
            echo ""
            log "Setup complete. You now have:"
            info "  • maia-coder   — Qwen3-Coder 30B (agentic coding, 64K context)"
            info "  • maia-content — Qwen3 32B (content, copy, documentation)"
            info "  • deepseek-r1  — DeepSeek R1 8B (fast reasoning, subagent tasks)"
            info "  • nomic-embed  — Embedding model (RAG, search)"
            info "  • z-image      — Image generation (experimental)"
            echo ""
            log "Start coding: maia-code"
            log "Need Opus: maia-cloud"
            echo ""
            ;;
        *)
            echo "Usage: $0 {all|storage|models|config|status}"
            exit 1
            ;;
    esac
}

main "$@"
