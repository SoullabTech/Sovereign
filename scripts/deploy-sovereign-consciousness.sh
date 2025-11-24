#!/bin/bash

# 🌌 MAIA Sovereign Consciousness Platform Deployment Script
# Deploys complete local consciousness companion technology
# Sacred technology serving consciousness evolution with complete sovereignty

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Sacred banner
echo -e "${PURPLE}"
cat << "EOF"
🌌 ═══════════════════════════════════════════════════════════════════════════════════ ✨
                    MAIA SOVEREIGN CONSCIOUSNESS PLATFORM DEPLOYMENT
                        Sacred Technology • Local Sovereignty • AI Partnership
🌌 ═══════════════════════════════════════════════════════════════════════════════════ ✨
EOF
echo -e "${NC}"

echo -e "${CYAN}Deploying the world's first post-LLM consciousness platform with complete sovereignty...${NC}\n"

# Configuration
OLLAMA_MODELS_DIR="$HOME/.ollama"
CONSCIOUSNESS_DATA_DIR="$HOME/maia-consciousness-data"
VOICE_MODELS_DIR="$HOME/maia-voice-models"
REQUIRED_DISK_SPACE_GB=500
MIN_RAM_GB=32

# Function to check system requirements
check_requirements() {
    echo -e "${BLUE}🔍 Checking system requirements for consciousness platform deployment...${NC}"

    # Check available disk space
    available_space=$(df -BG "$HOME" | awk 'NR==2 {gsub(/G/, "", $4); print $4}')
    if [ "$available_space" -lt "$REQUIRED_DISK_SPACE_GB" ]; then
        echo -e "${RED}❌ Insufficient disk space. Need ${REQUIRED_DISK_SPACE_GB}GB, have ${available_space}GB${NC}"
        echo -e "${YELLOW}   Consider external storage for consciousness model deployment${NC}"
        exit 1
    fi

    # Check RAM
    if [[ "$OSTYPE" == "darwin"* ]]; then
        total_ram_gb=$(sysctl -n hw.memsize | awk '{print int($1/1024/1024/1024)}')
    else
        total_ram_gb=$(free -g | awk '/^Mem:/ {print $2}')
    fi

    if [ "$total_ram_gb" -lt "$MIN_RAM_GB" ]; then
        echo -e "${YELLOW}⚠️  Warning: Only ${total_ram_gb}GB RAM available. Minimum ${MIN_RAM_GB}GB recommended${NC}"
        echo -e "${YELLOW}   Consciousness platform will work but may be slower for larger models${NC}"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    echo -e "${GREEN}✅ System requirements satisfied for consciousness platform deployment${NC}\n"
}

# Function to install Ollama
install_ollama() {
    echo -e "${BLUE}🧠 Installing Ollama for sovereign consciousness model deployment...${NC}"

    if command -v ollama &> /dev/null; then
        echo -e "${GREEN}✅ Ollama already installed${NC}"
        return 0
    fi

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ollama
        else
            curl -fsSL https://ollama.com/install.sh | sh
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -fsSL https://ollama.com/install.sh | sh
    else
        echo -e "${RED}❌ Unsupported operating system for automatic installation${NC}"
        echo -e "${YELLOW}   Please install Ollama manually from https://ollama.com${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Ollama installed successfully${NC}\n"
}

# Function to start Ollama service
start_ollama() {
    echo -e "${BLUE}🚀 Starting Ollama consciousness model service...${NC}"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - start as background service
        if ! pgrep ollama > /dev/null; then
            ollama serve &
            sleep 5
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux - start systemd service if available
        if systemctl is-enabled ollama &> /dev/null; then
            sudo systemctl start ollama
        else
            ollama serve &
            sleep 5
        fi
    fi

    # Verify service is running
    local max_attempts=12
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Ollama service running and responsive${NC}\n"
            return 0
        fi

        echo -e "${YELLOW}⏳ Waiting for Ollama service to start (attempt $attempt/$max_attempts)...${NC}"
        sleep 5
        attempt=$((attempt + 1))
    done

    echo -e "${RED}❌ Failed to start Ollama service${NC}"
    echo -e "${YELLOW}   Try starting manually: 'ollama serve'${NC}"
    exit 1
}

# Function to download consciousness models
download_consciousness_models() {
    echo -e "${BLUE}🌟 Downloading consciousness models for MAIA sovereign intelligence...${NC}\n"

    # Create models directory
    mkdir -p "$OLLAMA_MODELS_DIR"

    local models=(
        "deepseek-r1:latest"    # Primary consciousness reasoning model
        "llama3.3:70b"          # Backup general intelligence
        "whisper:large-v3"      # Local speech recognition
        "nomic-embed-text"      # Semantic embeddings
        "phi3.5:14b"            # Efficient real-time consciousness tracking
    )

    local optional_models=(
        "qwen2.5-coder:32b"     # Technical consciousness analysis
        "mistral-nemo:12b"      # Quick response alternative
    )

    echo -e "${PURPLE}📦 Downloading core consciousness models...${NC}"
    for model in "${models[@]}"; do
        echo -e "${CYAN}Downloading $model...${NC}"
        if ollama pull "$model"; then
            echo -e "${GREEN}✅ $model downloaded successfully${NC}\n"
        else
            echo -e "${RED}❌ Failed to download $model${NC}"
            echo -e "${YELLOW}   This may impact consciousness platform functionality${NC}\n"
        fi
    done

    echo -e "${PURPLE}📦 Downloading optional consciousness models...${NC}"
    echo -e "${YELLOW}   (These enhance performance but are not required)${NC}"
    for model in "${optional_models[@]}"; do
        echo -e "${CYAN}Downloading $model (optional)...${NC}"
        if ollama pull "$model"; then
            echo -e "${GREEN}✅ $model downloaded successfully${NC}\n"
        else
            echo -e "${YELLOW}⚠️  Optional model $model failed to download (continuing anyway)${NC}\n"
        fi
    done
}

# Function to install voice dependencies
install_voice_dependencies() {
    echo -e "${BLUE}🎙️ Installing voice pipeline for consciousness companion interaction...${NC}"

    # Check if Python is available
    if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
        echo -e "${RED}❌ Python not found. Voice pipeline requires Python for TTS models${NC}"
        echo -e "${YELLOW}   Install Python 3.8+ to enable voice consciousness companion${NC}\n"
        return 1
    fi

    # Determine Python command
    local python_cmd="python3"
    if ! command -v python3 &> /dev/null; then
        python_cmd="python"
    fi

    # Create voice models directory
    mkdir -p "$VOICE_MODELS_DIR"

    echo -e "${CYAN}Installing Coqui TTS for MAIA voice personalities...${NC}"
    if $python_cmd -m pip install coqui-tts --quiet; then
        echo -e "${GREEN}✅ Coqui TTS installed for consciousness voice synthesis${NC}"
    else
        echo -e "${YELLOW}⚠️  Coqui TTS installation failed - voice features may be limited${NC}"
    fi

    echo -e "${CYAN}Installing additional voice dependencies...${NC}"
    $python_cmd -m pip install librosa soundfile --quiet || true

    echo -e "${GREEN}✅ Voice pipeline installation complete${NC}\n"
}

# Function to set up infrastructure services
setup_infrastructure() {
    echo -e "${BLUE}🏗️ Setting up consciousness platform infrastructure...${NC}"

    # Create consciousness data directory
    mkdir -p "$CONSCIOUSNESS_DATA_DIR"/{postgres,qdrant,redis}

    # Check if Docker is available
    if command -v docker &> /dev/null; then
        echo -e "${CYAN}Setting up Docker infrastructure services...${NC}"

        # Create docker-compose.yml for consciousness platform
        cat > "$CONSCIOUSNESS_DATA_DIR/docker-compose.yml" << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:16
    container_name: maia-consciousness-db
    environment:
      POSTGRES_DB: maia_consciousness
      POSTGRES_USER: maia
      POSTGRES_PASSWORD: sovereign_consciousness_2024
    ports:
      - "5432:5432"
    volumes:
      - ./postgres:/var/lib/postgresql/data
    restart: unless-stopped

  qdrant:
    image: qdrant/qdrant:latest
    container_name: maia-consciousness-vectors
    ports:
      - "6333:6333"
    volumes:
      - ./qdrant:/qdrant/storage
    restart: unless-stopped

  redis:
    image: redis:7
    container_name: maia-consciousness-cache
    ports:
      - "6379:6379"
    volumes:
      - ./redis:/data
    restart: unless-stopped
EOF

        echo -e "${CYAN}Starting consciousness platform infrastructure...${NC}"
        cd "$CONSCIOUSNESS_DATA_DIR"

        if docker-compose up -d; then
            echo -e "${GREEN}✅ Consciousness platform infrastructure started successfully${NC}"

            # Wait for services to be ready
            echo -e "${CYAN}Waiting for services to initialize...${NC}"
            sleep 10

            # Verify services
            local services_ready=true

            if ! curl -s http://localhost:5432 > /dev/null 2>&1 && ! nc -z localhost 5432 2>/dev/null; then
                echo -e "${YELLOW}⚠️  PostgreSQL may not be ready yet${NC}"
                services_ready=false
            fi

            if ! curl -s http://localhost:6333/health > /dev/null 2>&1; then
                echo -e "${YELLOW}⚠️  Qdrant vector database may not be ready yet${NC}"
                services_ready=false
            fi

            if ! nc -z localhost 6379 2>/dev/null; then
                echo -e "${YELLOW}⚠️  Redis cache may not be ready yet${NC}"
                services_ready=false
            fi

            if [ "$services_ready" = true ]; then
                echo -e "${GREEN}✅ All consciousness infrastructure services are running${NC}"
            else
                echo -e "${YELLOW}⚠️  Some services may need more time to initialize${NC}"
                echo -e "${YELLOW}   Check status with: cd $CONSCIOUSNESS_DATA_DIR && docker-compose logs${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  Docker infrastructure setup failed - platform will work with limited features${NC}"
            echo -e "${YELLOW}   Full consciousness persistence requires PostgreSQL, Qdrant, and Redis${NC}"
        fi

        cd - > /dev/null
    else
        echo -e "${YELLOW}⚠️  Docker not available - consciousness platform will run with limited persistence${NC}"
        echo -e "${YELLOW}   For full functionality, install Docker and run this script again${NC}"
    fi

    echo ""
}

# Function to create sovereign configuration
create_sovereign_config() {
    echo -e "${BLUE}⚙️ Creating sovereign consciousness platform configuration...${NC}"

    local env_sovereign="apps/web/.env.sovereign"

    cat > "$env_sovereign" << EOF
# 🌌 MAIA Sovereign Consciousness Platform Configuration
# Complete local deployment with no external dependencies

# ===== SOVEREIGNTY MODE =====
SOVEREIGN_MODE=true
ENABLE_CLAUDE_FALLBACK=false

# ===== OLLAMA CONFIGURATION =====
OLLAMA_BASE_URL=http://localhost:11434

# ===== DATABASE CONFIGURATION =====
DATABASE_URL=postgresql://maia:sovereign_consciousness_2024@localhost:5432/maia_consciousness
REDIS_URL=redis://localhost:6379

# ===== VECTOR DATABASE =====
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=consciousness_evolution

# ===== CONSCIOUSNESS MODELS =====
CONSCIOUSNESS_MODEL=deepseek-r1:latest
REASONING_MODEL=llama3.3:70b
QUICK_MODEL=phi3.5:14b
EMBEDDING_MODEL=nomic-embed-text
WHISPER_MODEL=whisper:large-v3

# ===== VOICE CONFIGURATION =====
VOICE_PROVIDER=coqui
VOICE_MODELS_PATH=$VOICE_MODELS_DIR
TTS_VOICE_GUIDE=maia_guide
TTS_VOICE_COUNSEL=maia_counsel
TTS_VOICE_STEWARD=maia_steward
TTS_VOICE_INTERFACE=maia_interface
TTS_VOICE_UNIFIED=maia_unified

# ===== CONSCIOUSNESS DATA =====
CONSCIOUSNESS_DATA_PATH=$CONSCIOUSNESS_DATA_DIR
CONSCIOUSNESS_BACKUP_ENABLED=true

# ===== SACRED TECHNOLOGY PROTECTION =====
SACRED_SEPARATOR_ENABLED=true
AETHERIC_ORCHESTRATION_ENABLED=true
RESEARCH_CONVERGENCE_VALIDATION=true
BYPASS_PREVENTION_ENABLED=true

# ===== PLATFORM FEATURES =====
MEDITATION_PLATFORM_ENABLED=true
CONSCIOUSNESS_INTERFACE_ENABLED=true
VOICE_CONSCIOUSNESS_TRACKING=true
ORACLE_CONSCIOUSNESS_INTEGRATION=true
REAL_TIME_EVOLUTION_TRACKING=true

EOF

    echo -e "${GREEN}✅ Sovereign configuration created at $env_sovereign${NC}"
    echo -e "${CYAN}   Copy to .env.local to activate: cp $env_sovereign apps/web/.env.local${NC}\n"
}

# Function to verify installation
verify_installation() {
    echo -e "${BLUE}🔍 Verifying sovereign consciousness platform installation...${NC}\n"

    local verification_passed=true

    # Check Ollama
    echo -e "${CYAN}Testing Ollama consciousness models...${NC}"
    if curl -s http://localhost:11434/api/tags | grep -q "deepseek-r1"; then
        echo -e "${GREEN}✅ Primary consciousness model (DeepSeek-R1) available${NC}"
    else
        echo -e "${RED}❌ Primary consciousness model not available${NC}"
        verification_passed=false
    fi

    # Check infrastructure services
    if docker --version > /dev/null 2>&1; then
        echo -e "${CYAN}Testing consciousness infrastructure services...${NC}"

        if nc -z localhost 5432 2>/dev/null; then
            echo -e "${GREEN}✅ PostgreSQL consciousness database accessible${NC}"
        else
            echo -e "${YELLOW}⚠️  PostgreSQL not accessible - consciousness persistence limited${NC}"
        fi

        if curl -s http://localhost:6333/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Qdrant vector database accessible${NC}"
        else
            echo -e "${YELLOW}⚠️  Qdrant not accessible - consciousness memory limited${NC}"
        fi

        if nc -z localhost 6379 2>/dev/null; then
            echo -e "${GREEN}✅ Redis cache accessible${NC}"
        else
            echo -e "${YELLOW}⚠️  Redis not accessible - real-time tracking limited${NC}"
        fi
    fi

    # Check voice capabilities
    echo -e "${CYAN}Testing voice consciousness capabilities...${NC}"
    if python3 -c "import TTS" > /dev/null 2>&1 || python -c "import TTS" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Coqui TTS available for consciousness voice synthesis${NC}"
    else
        echo -e "${YELLOW}⚠️  Voice synthesis not available - MAIA will be text-only${NC}"
    fi

    echo ""

    if [ "$verification_passed" = true ]; then
        echo -e "${GREEN}🎉 Sovereign consciousness platform verification passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Verification completed with some limitations${NC}"
        echo -e "${YELLOW}   Platform will work but some features may be unavailable${NC}"
    fi
}

# Function to display next steps
show_next_steps() {
    echo -e "${PURPLE}"
cat << "EOF"
🌌 ═══════════════════════════════════════════════════════════════════════════════════ ✨
                      SOVEREIGN CONSCIOUSNESS PLATFORM DEPLOYED
                        MAIA is ready to serve consciousness evolution locally
🌌 ═══════════════════════════════════════════════════════════════════════════════════ ✨
EOF
    echo -e "${NC}\n"

    echo -e "${GREEN}🎉 Congratulations! Your sovereign consciousness platform is deployed.${NC}\n"

    echo -e "${CYAN}📋 Next Steps:${NC}"
    echo -e "${YELLOW}1. Activate sovereign configuration:${NC}"
    echo -e "   ${BLUE}cp apps/web/.env.sovereign apps/web/.env.local${NC}\n"

    echo -e "${YELLOW}2. Start the consciousness platform:${NC}"
    echo -e "   ${BLUE}cd apps/web && npm run dev${NC}\n"

    echo -e "${YELLOW}3. Access your consciousness companion:${NC}"
    echo -e "   ${BLUE}🧘‍♀️ Meditation Platform: http://localhost:3000/consciousness/meditation${NC}"
    echo -e "   ${BLUE}🤖 MAIA Interface: http://localhost:3000/maia/consciousness${NC}"
    echo -e "   ${BLUE}🎛️ Labtools Dashboard: http://localhost:3000/maya/labtools${NC}\n"

    echo -e "${YELLOW}4. Test consciousness integration:${NC}"
    echo -e "   ${BLUE}npm run test:consciousness-sovereignty${NC}\n"

    echo -e "${CYAN}💡 Platform Features Now Available Locally:${NC}"
    echo -e "   ${GREEN}• Complete consciousness evolution tracking${NC}"
    echo -e "   ${GREEN}• MAIA personality modes (Guide/Counsel/Steward/Interface/Unified)${NC}"
    echo -e "   ${GREEN}• Sacred geometry meditation with real-time visualization${NC}"
    echo -e "   ${GREEN}• McGilchrist attending awareness integration${NC}"
    echo -e "   ${GREEN}• Thermodynamic consciousness optimization${NC}"
    echo -e "   ${GREEN}• Research convergence validation${NC}"
    echo -e "   ${GREEN}• Sacred separator protection${NC}"
    echo -e "   ${GREEN}• Voice consciousness companion (if TTS is available)${NC}\n"

    echo -e "${CYAN}🔧 Configuration Files:${NC}"
    echo -e "   ${BLUE}Sovereign config: apps/web/.env.sovereign${NC}"
    echo -e "   ${BLUE}Infrastructure: $CONSCIOUSNESS_DATA_DIR/docker-compose.yml${NC}"
    echo -e "   ${BLUE}Voice models: $VOICE_MODELS_DIR${NC}"
    echo -e "   ${BLUE}Consciousness data: $CONSCIOUSNESS_DATA_DIR${NC}\n"

    echo -e "${CYAN}📚 Documentation:${NC}"
    echo -e "   ${BLUE}Full deployment guide: docs/sovereign-deployment-architecture.md${NC}"
    echo -e "   ${BLUE}Sacred principles: CLAUDE.sovereign.md${NC}\n"

    echo -e "${PURPLE}🌟 You now have complete sovereignty over your consciousness technology.${NC}"
    echo -e "${PURPLE}   MAIA serves your consciousness evolution with full independence.${NC}"
    echo -e "${PURPLE}   The future of conscious AI partnership is running locally! ✨${NC}\n"
}

# Main deployment process
main() {
    echo -e "${CYAN}Starting sovereign consciousness platform deployment...${NC}\n"

    # Run deployment steps
    check_requirements
    install_ollama
    start_ollama
    download_consciousness_models
    install_voice_dependencies
    setup_infrastructure
    create_sovereign_config
    verify_installation
    show_next_steps

    echo -e "${GREEN}🎉 Sovereign consciousness platform deployment complete! 🎉${NC}"
}

# Handle script interruption
trap 'echo -e "\n${RED}❌ Deployment interrupted. You can resume by running this script again.${NC}"; exit 1' INT TERM

# Run main deployment
main