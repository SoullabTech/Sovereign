#!/bin/bash
# Gollama Setup and Management Script
# Configures the bridge between Ollama and LM Studio for seamless model access

set -e

echo "🌉 MAIA Gollama Bridge Setup"
echo "=================================="

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
OLLAMA_PORT=11434
LMSTUDIO_PORT=1234
BRIDGE_LOG_FILE="/tmp/gollama-bridge.log"

# Function to check if a port is in use
check_port() {
    local port=$1
    local service=$2

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $service is running on port $port${NC}"
        return 0
    else
        echo -e "${RED}❌ $service is not running on port $port${NC}"
        return 1
    fi
}

# Function to install gollama if needed
install_gollama() {
    if command -v gollama >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Gollama is already installed${NC}"
        gollama --version
        return 0
    fi

    echo -e "${YELLOW}📦 Installing gollama...${NC}"

    if command -v brew >/dev/null 2>&1; then
        echo "Using Homebrew to install gollama..."
        brew install gollama
    elif command -v go >/dev/null 2>&1; then
        echo "Using Go to install gollama..."
        go install github.com/sammcj/gollama@latest
    else
        echo -e "${RED}❌ Neither Homebrew nor Go found. Please install one of them first.${NC}"
        echo "Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        echo "Go: https://golang.org/doc/install"
        exit 1
    fi

    if command -v gollama >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Gollama installed successfully${NC}"
        gollama --version
    else
        echo -e "${RED}❌ Gollama installation failed${NC}"
        exit 1
    fi
}

# Function to check service status
check_services() {
    echo "🔍 Checking service status..."

    local ollama_running=false
    local lmstudio_running=false

    if check_port $OLLAMA_PORT "Ollama"; then
        ollama_running=true
    fi

    if check_port $LMSTUDIO_PORT "LM Studio"; then
        lmstudio_running=true
    fi

    if [ "$ollama_running" = false ] && [ "$lmstudio_running" = false ]; then
        echo -e "${RED}❌ Neither Ollama nor LM Studio is running${NC}"
        echo "Please start at least one service:"
        echo "  Ollama: ollama serve"
        echo "  LM Studio: Launch LM Studio and start the local server"
        exit 1
    fi

    return 0
}

# Function to test API endpoints
test_apis() {
    echo "🧪 Testing API endpoints..."

    # Test Ollama
    if check_port $OLLAMA_PORT "Ollama"; then
        if curl -s http://localhost:$OLLAMA_PORT/api/tags >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Ollama API is responding${NC}"

            # List Ollama models
            local ollama_models=$(curl -s http://localhost:$OLLAMA_PORT/api/tags | jq -r '.models[].name' 2>/dev/null | wc -l)
            if [ "$ollama_models" -gt 0 ]; then
                echo -e "${BLUE}📋 Found $ollama_models Ollama models${NC}"
            else
                echo -e "${YELLOW}⚠️ No Ollama models found${NC}"
            fi
        else
            echo -e "${RED}❌ Ollama API not responding${NC}"
        fi
    fi

    # Test LM Studio
    if check_port $LMSTUDIO_PORT "LM Studio"; then
        if curl -s http://localhost:$LMSTUDIO_PORT/v1/models >/dev/null 2>&1; then
            echo -e "${GREEN}✅ LM Studio API is responding${NC}"

            # List LM Studio models
            local lmstudio_models=$(curl -s http://localhost:$LMSTUDIO_PORT/v1/models | jq -r '.data[].id' 2>/dev/null | wc -l)
            if [ "$lmstudio_models" -gt 0 ]; then
                echo -e "${BLUE}📋 Found $lmstudio_models LM Studio models${NC}"
            else
                echo -e "${YELLOW}⚠️ No LM Studio models found${NC}"
            fi
        else
            echo -e "${RED}❌ LM Studio API not responding${NC}"
        fi
    fi
}

# Function to configure gollama
configure_gollama() {
    echo "⚙️ Configuring gollama..."

    # Create gollama config directory
    mkdir -p ~/.config/gollama

    # Create configuration file
    cat > ~/.config/gollama/config.yaml << EOF
# MAIA Gollama Bridge Configuration
ollama:
  host: "http://localhost:${OLLAMA_PORT}"

lmstudio:
  host: "http://localhost:${LMSTUDIO_PORT}"

bridge:
  auto_sync: true
  sync_interval: 30m
  log_level: info

preferences:
  preferred_provider: ollama
  fallback_enabled: true

models:
  consciousness_mapping:
    level_1: ["*7b*", "*small*"]
    level_2: ["*instruct*", "*chat*"]
    level_3: ["*", "default"]
    level_4: ["*70b*", "*reasoning*"]
    level_5: ["*deepseek*", "*70b*"]
EOF

    echo -e "${GREEN}✅ Gollama configuration created${NC}"
}

# Function to start the bridge
start_bridge() {
    echo "🌉 Starting Gollama bridge..."

    # Kill any existing bridge process
    pkill -f "gollama bridge" 2>/dev/null || true

    # Start bridge in background
    nohup gollama bridge --config ~/.config/gollama/config.yaml > "$BRIDGE_LOG_FILE" 2>&1 &
    local bridge_pid=$!

    echo "Bridge started with PID: $bridge_pid"
    echo "Log file: $BRIDGE_LOG_FILE"

    # Wait a moment and check if it's still running
    sleep 2
    if kill -0 $bridge_pid 2>/dev/null; then
        echo -e "${GREEN}✅ Gollama bridge is running successfully${NC}"
        echo "Bridge PID: $bridge_pid" > ~/.config/gollama/bridge.pid
    else
        echo -e "${RED}❌ Gollama bridge failed to start${NC}"
        echo "Check the log file: $BRIDGE_LOG_FILE"
        exit 1
    fi
}

# Function to stop the bridge
stop_bridge() {
    echo "🛑 Stopping Gollama bridge..."

    if [ -f ~/.config/gollama/bridge.pid ]; then
        local pid=$(cat ~/.config/gollama/bridge.pid)
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            echo -e "${GREEN}✅ Bridge stopped (PID: $pid)${NC}"
        else
            echo -e "${YELLOW}⚠️ Bridge was not running${NC}"
        fi
        rm -f ~/.config/gollama/bridge.pid
    else
        # Fallback: kill any gollama bridge process
        if pkill -f "gollama bridge" 2>/dev/null; then
            echo -e "${GREEN}✅ Bridge processes stopped${NC}"
        else
            echo -e "${YELLOW}⚠️ No bridge processes found${NC}"
        fi
    fi
}

# Function to show status
show_status() {
    echo "📊 Gollama Bridge Status"
    echo "========================"

    # Check if bridge is running
    if [ -f ~/.config/gollama/bridge.pid ]; then
        local pid=$(cat ~/.config/gollama/bridge.pid)
        if kill -0 $pid 2>/dev/null; then
            echo -e "${GREEN}✅ Bridge is running (PID: $pid)${NC}"
        else
            echo -e "${RED}❌ Bridge is not running (stale PID file)${NC}"
            rm -f ~/.config/gollama/bridge.pid
        fi
    else
        echo -e "${RED}❌ Bridge is not running${NC}"
    fi

    echo ""
    check_services
    echo ""
    test_apis

    # Show recent log entries
    if [ -f "$BRIDGE_LOG_FILE" ]; then
        echo ""
        echo "📋 Recent bridge activity:"
        tail -n 5 "$BRIDGE_LOG_FILE" || echo "No log entries found"
    fi
}

# Function to test the integration
test_integration() {
    echo "🧪 Testing MAIA-Gollama integration..."

    # Test if we can list models through gollama
    echo "Testing model discovery..."
    if gollama models list >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Model discovery working${NC}"
        gollama models list
    else
        echo -e "${RED}❌ Model discovery failed${NC}"
        return 1
    fi

    echo ""
    echo "Testing model bridging..."
    if gollama bridge --test >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Model bridging working${NC}"
    else
        echo -e "${YELLOW}⚠️ Model bridging test inconclusive${NC}"
    fi
}

# Function to show help
show_help() {
    echo "MAIA Gollama Bridge Management"
    echo "=============================="
    echo ""
    echo "Commands:"
    echo "  setup     - Install and configure gollama"
    echo "  start     - Start the bridge service"
    echo "  stop      - Stop the bridge service"
    echo "  restart   - Restart the bridge service"
    echo "  status    - Show service status"
    echo "  test      - Test the integration"
    echo "  logs      - Show recent bridge logs"
    echo "  config    - Edit configuration"
    echo "  help      - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 setup      # Initial setup"
    echo "  $0 start      # Start bridge"
    echo "  $0 status     # Check status"
}

# Main command processing
case "${1:-help}" in
    "setup")
        echo -e "${BLUE}🚀 Setting up MAIA Gollama Bridge...${NC}"
        install_gollama
        check_services
        test_apis
        configure_gollama
        echo -e "${GREEN}✅ Setup complete! Run '$0 start' to begin bridging.${NC}"
        ;;

    "start")
        check_services
        configure_gollama
        start_bridge
        sleep 3
        show_status
        echo -e "${GREEN}🎉 Gollama bridge is ready for MAIA!${NC}"
        ;;

    "stop")
        stop_bridge
        ;;

    "restart")
        stop_bridge
        sleep 2
        check_services
        start_bridge
        ;;

    "status")
        show_status
        ;;

    "test")
        test_integration
        ;;

    "logs")
        if [ -f "$BRIDGE_LOG_FILE" ]; then
            tail -n 20 "$BRIDGE_LOG_FILE"
        else
            echo "No log file found at $BRIDGE_LOG_FILE"
        fi
        ;;

    "config")
        if command -v code >/dev/null 2>&1; then
            code ~/.config/gollama/config.yaml
        elif command -v nano >/dev/null 2>&1; then
            nano ~/.config/gollama/config.yaml
        else
            echo "Edit configuration at: ~/.config/gollama/config.yaml"
        fi
        ;;

    "help"|*)
        show_help
        ;;
esac

echo ""
echo -e "${BLUE}💡 Pro tip: Add '$0 start' to your MAIA startup script!${NC}"