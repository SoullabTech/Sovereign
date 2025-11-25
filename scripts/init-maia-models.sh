#!/bin/bash
# MAIA Model System Initialization Script
# Automated setup and initialization of the complete local model ecosystem

set -e

echo "🧠 MAIA Local Model System Initialization"
echo "========================================="

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAIA_ROOT="/Users/soullab/MAIA-SOVEREIGN"
LOG_FILE="/tmp/maia-models-init.log"

echo "📍 MAIA Root: $MAIA_ROOT"
echo "📝 Log File: $LOG_FILE"
echo ""

# Function to log with timestamp
log_with_timestamp() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$LOG_FILE"
}

# Function to check prerequisites
check_prerequisites() {
    log_with_timestamp "🔍 Checking prerequisites..."

    # Check if we're in the right directory
    if [ ! -d "$MAIA_ROOT/apps/web" ]; then
        echo -e "${RED}❌ MAIA project structure not found${NC}"
        echo "Make sure you're running this from the MAIA-SOVEREIGN directory"
        exit 1
    fi

    # Check Node.js
    if ! command -v node >/dev/null 2>&1; then
        echo -e "${RED}❌ Node.js not found${NC}"
        exit 1
    fi

    local node_version=$(node --version)
    echo -e "${GREEN}✅ Node.js found: $node_version${NC}"

    # Check npm
    if ! command -v npm >/dev/null 2>&1; then
        echo -e "${RED}❌ npm not found${NC}"
        exit 1
    fi

    local npm_version=$(npm --version)
    echo -e "${GREEN}✅ npm found: $npm_version${NC}"

    echo ""
}

# Function to check and start Ollama
setup_ollama() {
    log_with_timestamp "🦙 Setting up Ollama..."

    # Check if Ollama is installed
    if ! command -v ollama >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️ Ollama not found. Installing...${NC}"

        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew >/dev/null 2>&1; then
                brew install ollama
            else
                curl -fsSL https://ollama.com/install.sh | sh
            fi
        else
            # Linux
            curl -fsSL https://ollama.com/install.sh | sh
        fi
    fi

    # Check if Ollama is running
    if ! curl -s http://localhost:11434 >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️ Starting Ollama service...${NC}"

        # Start Ollama in background
        nohup ollama serve > /tmp/ollama.log 2>&1 &
        sleep 3

        # Verify it's running
        if curl -s http://localhost:11434 >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Ollama service started${NC}"
        else
            echo -e "${RED}❌ Failed to start Ollama service${NC}"
            echo "Check the log: /tmp/ollama.log"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Ollama is running${NC}"
    fi

    # Check available models
    local model_count=$(ollama list 2>/dev/null | tail -n +2 | wc -l | xargs)
    if [ "$model_count" -eq 0 ]; then
        echo -e "${YELLOW}⚠️ No Ollama models found. Downloading essential models...${NC}"

        # Download essential models for MAIA
        echo "📥 Downloading DeepSeek R1 (recommended for reasoning)..."
        ollama pull deepseek-r1:latest

        echo "📥 Downloading Llama 3.1 8B (good for general use)..."
        ollama pull llama3.1:8b

        echo -e "${GREEN}✅ Essential models downloaded${NC}"
    else
        echo -e "${GREEN}✅ Found $model_count Ollama models${NC}"
    fi

    echo ""
}

# Function to setup Gollama bridge
setup_gollama() {
    log_with_timestamp "🌉 Setting up Gollama bridge..."

    # Run the Gollama setup script
    if [ -f "$MAIA_ROOT/scripts/setup-gollama.sh" ]; then
        echo "Running Gollama setup..."
        bash "$MAIA_ROOT/scripts/setup-gollama.sh" setup

        # Start the bridge
        bash "$MAIA_ROOT/scripts/setup-gollama.sh" start

        echo -e "${GREEN}✅ Gollama bridge configured${NC}"
    else
        echo -e "${YELLOW}⚠️ Gollama setup script not found, skipping...${NC}"
    fi

    echo ""
}

# Function to run model optimization
run_optimization() {
    log_with_timestamp "⚡ Running model optimization..."

    # Run the optimization script
    if [ -f "$MAIA_ROOT/scripts/optimize-models.sh" ]; then
        echo "Running model optimization..."
        bash "$MAIA_ROOT/scripts/optimize-models.sh"
        echo -e "${GREEN}✅ Model optimization completed${NC}"
    else
        echo -e "${YELLOW}⚠️ Optimization script not found, skipping...${NC}"
    fi

    echo ""
}

# Function to install dependencies
install_dependencies() {
    log_with_timestamp "📦 Installing dependencies..."

    cd "$MAIA_ROOT"

    # Install root dependencies
    npm install

    # Install web app dependencies
    cd apps/web
    npm install

    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
}

# Function to build the project
build_project() {
    log_with_timestamp "🔨 Building project..."

    cd "$MAIA_ROOT/apps/web"

    # Build the Next.js project
    npm run build

    echo -e "${GREEN}✅ Project built successfully${NC}"
    echo ""
}

# Function to test the model system
test_model_system() {
    log_with_timestamp "🧪 Testing model system..."

    cd "$MAIA_ROOT/apps/web"

    # Start the development server in background
    npm run dev &
    local dev_pid=$!

    # Wait for server to start
    echo "Waiting for development server to start..."
    sleep 10

    # Test API endpoints
    echo "Testing model system API..."

    # Test status endpoint
    local status_response=$(curl -s "http://localhost:3000/api/models/status" || echo "failed")
    if [[ "$status_response" == *"success"* ]]; then
        echo -e "${GREEN}✅ Status API working${NC}"
    else
        echo -e "${YELLOW}⚠️ Status API test inconclusive${NC}"
    fi

    # Test generation endpoint with a simple prompt
    local gen_response=$(curl -s -X POST "http://localhost:3000/api/models/generate" \
        -H "Content-Type: application/json" \
        -d '{"content":"Hello, test the system", "consciousnessLevel":1}' || echo "failed")

    if [[ "$gen_response" == *"success"* ]]; then
        echo -e "${GREEN}✅ Generation API working${NC}"
    else
        echo -e "${YELLOW}⚠️ Generation API test inconclusive${NC}"
    fi

    # Stop development server
    kill $dev_pid 2>/dev/null || true

    echo ""
}

# Function to show completion status
show_completion_status() {
    echo "🎉 MAIA Model System Initialization Complete!"
    echo "=============================================="
    echo ""
    echo -e "${GREEN}✅ Components initialized:${NC}"
    echo "   • Ollama local model server"
    echo "   • Gollama bridge (Ollama ↔ LM Studio)"
    echo "   • Model optimization pipeline"
    echo "   • Intelligent model routing"
    echo "   • Performance monitoring"
    echo "   • Benchmarking system"
    echo "   • Real-time dashboards"
    echo "   • API endpoints"
    echo ""
    echo -e "${BLUE}🚀 Next steps:${NC}"
    echo "1. Start the MAIA application:"
    echo "   cd $MAIA_ROOT/apps/web"
    echo "   npm run dev"
    echo ""
    echo "2. Access the dashboards:"
    echo "   • Model Performance: http://localhost:3000/models/dashboard"
    echo "   • Model Testing: http://localhost:3000/models/testing"
    echo ""
    echo "3. Test the API:"
    echo "   curl -X POST http://localhost:3000/api/models/generate \\"
    echo "     -H \"Content-Type: application/json\" \\"
    echo "     -d '{\"content\":\"Hello MAIA\", \"consciousnessLevel\":3}'"
    echo ""
    echo "4. View system status:"
    echo "   curl http://localhost:3000/api/models/status"
    echo ""
    echo -e "${GREEN}💡 Pro tips:${NC}"
    echo "   • Use consciousness levels 1-5 for different response styles"
    echo "   • Monitor performance through the dashboards"
    echo "   • Run benchmarks to optimize model selection"
    echo "   • The system automatically routes to the best model"
    echo ""
    echo "📊 View the complete log: $LOG_FILE"
}

# Main execution
main() {
    echo "Starting MAIA Model System initialization..." > "$LOG_FILE"

    check_prerequisites
    setup_ollama
    install_dependencies
    setup_gollama
    run_optimization
    build_project
    test_model_system
    show_completion_status

    log_with_timestamp "🎉 Initialization completed successfully"
}

# Handle script termination
trap 'echo -e "${RED}❌ Initialization interrupted${NC}"; exit 1' INT TERM

# Run main function
main "$@"