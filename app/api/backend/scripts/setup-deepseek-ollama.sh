#!/bin/bash
# Setup DeepSeek models via Ollama for local, privacy-first AI
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   🧠 DeepSeek Local AI Setup via Ollama              ║"
echo "║   Privacy-First, Fully Offline AI Assistant          ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Check if Ollama is installed
check_ollama() {
    echo -e "${BLUE}🔍 Checking Ollama installation...${NC}"
    if command -v ollama &> /dev/null; then
        echo -e "${GREEN}✅ Ollama is installed${NC}"
        ollama version
        return 0
    else
        echo -e "${YELLOW}⚠️  Ollama not found${NC}"
        return 1
    fi
}

# Install Ollama
install_ollama() {
    echo -e "${BLUE}📦 Installing Ollama...${NC}"
    
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
        echo -e "${RED}❌ Unsupported OS: $OSTYPE${NC}"
        exit 1
    fi
}

# Start Ollama service
start_ollama() {
    echo -e "${BLUE}🚀 Starting Ollama service...${NC}"
    
    # Check if already running
    if pgrep -x "ollama" > /dev/null; then
        echo -e "${GREEN}✅ Ollama service already running${NC}"
    else
        # Start in background
        ollama serve > /dev/null 2>&1 &
        sleep 3
        echo -e "${GREEN}✅ Ollama service started${NC}"
    fi
}

# Available DeepSeek models
show_models() {
    echo ""
    echo -e "${CYAN}📚 Available DeepSeek Models:${NC}"
    echo "═══════════════════════════════════════════════════"
    echo ""
    echo -e "${MAGENTA}1. deepseek-coder-v2${NC}"
    echo "   - 16B parameters, optimized for code"
    echo "   - Excellent for programming tasks"
    echo "   - Size: ~8.9GB"
    echo ""
    echo -e "${MAGENTA}2. deepseek-llm${NC}"
    echo "   - 7B parameters, general purpose"
    echo "   - Good for conversational AI"
    echo "   - Size: ~4.1GB"
    echo ""
    echo -e "${MAGENTA}3. deepseek-coder:6.7b${NC}"
    echo "   - 6.7B parameters, code-focused"
    echo "   - Lighter weight option"
    echo "   - Size: ~3.8GB"
    echo ""
    echo -e "${MAGENTA}4. deepseek-coder:1.3b${NC}"
    echo "   - 1.3B parameters, ultra-light"
    echo "   - Fast responses, lower resource usage"
    echo "   - Size: ~776MB"
    echo ""
}

# Pull DeepSeek model
pull_model() {
    local model=$1
    echo -e "${BLUE}📥 Pulling $model...${NC}"
    echo -e "${YELLOW}This may take several minutes depending on model size${NC}"
    
    if ollama pull "$model"; then
        echo -e "${GREEN}✅ Successfully pulled $model${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to pull $model${NC}"
        return 1
    fi
}

# Test model
test_model() {
    local model=$1
    echo ""
    echo -e "${BLUE}🧪 Testing $model...${NC}"
    
    local response=$(ollama run "$model" "Say 'Hello, I am DeepSeek running locally via Ollama' and nothing else" --verbose=false 2>/dev/null)
    
    if [[ -n "$response" ]]; then
        echo -e "${GREEN}✅ Model responds:${NC}"
        echo "$response"
        return 0
    else
        echo -e "${RED}❌ Model test failed${NC}"
        return 1
    fi
}

# Create configuration
create_config() {
    local model=$1
    local config_file="$BACKEND_DIR/.env.deepseek"
    
    echo ""
    echo -e "${BLUE}📝 Creating configuration...${NC}"
    
    cat > "$config_file" << EOF
# DeepSeek via Ollama Configuration
DEEPSEEK_ENABLED=true
DEEPSEEK_MODEL=$model
DEEPSEEK_BASE_URL=http://localhost:11434
DEEPSEEK_MODE=offline
DEEPSEEK_TEMPERATURE=0.7
DEEPSEEK_MAX_TOKENS=4096
DEEPSEEK_STREAM=true

# Privacy settings
DEEPSEEK_PRIVACY_MODE=true
DEEPSEEK_NO_TELEMETRY=true
DEEPSEEK_LOCAL_ONLY=true
EOF
    
    echo -e "${GREEN}✅ Configuration saved to $config_file${NC}"
}

# Main setup flow
main() {
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
    
    # Step 1: Check/Install Ollama
    if ! check_ollama; then
        echo ""
        read -p "Install Ollama now? (y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_ollama
            if ! check_ollama; then
                echo -e "${RED}❌ Installation failed${NC}"
                exit 1
            fi
        else
            echo -e "${YELLOW}⚠️  Ollama is required. Please install manually.${NC}"
            echo "Visit: https://ollama.com"
            exit 1
        fi
    fi
    
    # Step 2: Start Ollama
    start_ollama
    
    # Step 3: Show available models
    show_models
    
    # Step 4: Select model
    echo ""
    echo -e "${CYAN}Which model would you like to install?${NC}"
    echo "1) deepseek-coder-v2 (Best for code, 8.9GB)"
    echo "2) deepseek-llm (General purpose, 4.1GB)"
    echo "3) deepseek-coder:6.7b (Balanced, 3.8GB)"
    echo "4) deepseek-coder:1.3b (Lightweight, 776MB)"
    echo "5) Skip (use existing model)"
    echo ""
    read -p "Select (1-5): " choice
    
    case $choice in
        1)
            MODEL="deepseek-coder-v2"
            ;;
        2)
            MODEL="deepseek-llm"
            ;;
        3)
            MODEL="deepseek-coder:6.7b"
            ;;
        4)
            MODEL="deepseek-coder:1.3b"
            ;;
        5)
            echo -e "${YELLOW}Skipping model download${NC}"
            read -p "Enter existing model name: " MODEL
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
    
    # Step 5: Pull model (if not skipped)
    if [[ $choice -ne 5 ]]; then
        if ! pull_model "$MODEL"; then
            exit 1
        fi
    fi
    
    # Step 6: Test model
    if ! test_model "$MODEL"; then
        echo -e "${YELLOW}⚠️  Model test failed, but continuing setup${NC}"
    fi
    
    # Step 7: Create configuration
    create_config "$MODEL"
    
    # Step 8: Show completion
    echo ""
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║   ${GREEN}✅ DeepSeek Local Setup Complete!${NC}                  ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo ""
    echo "   Model: $MODEL"
    echo "   Status: Running locally via Ollama"
    echo "   Privacy: 100% offline, no data leaves your machine"
    echo ""
    echo "   Quick test:"
    echo "   ${CYAN}ollama run $MODEL \"Hello, World!\"${NC}"
    echo ""
    echo "   Integration:"
    echo "   ${CYAN}npm run deepseek:chat${NC}     # Terminal chat"
    echo "   ${CYAN}npm run deepseek:serve${NC}    # API server"
    echo ""
}

# Run main
main