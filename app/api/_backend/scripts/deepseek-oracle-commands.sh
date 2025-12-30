#!/bin/bash
# 🔮 DeepSeek Oracle Commands - Specialized for Maya Oracle System

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Model configuration
MODEL="${DEEPSEEK_MODEL:-deepseek-r1:7b}"

# Core Maya Oracle files
ORACLE_CORE_FILES=(
    "src/agents/PersonalOracleAgent.ts"
    "src/agents/FireAgent.ts"
    "src/agents/WaterAgent.ts"
    "src/agents/AirAgent.ts"
    "src/agents/EarthAgent.ts"
    "src/agents/AetherAgent.ts"
)

MEMORY_FILES=(
    "src/memory/SoulMemoryService.ts"
    "src/memory/SemanticJournalingService.ts"
    "src/types/memory.ts"
)

AIN_FILES=(
    "src/ain/AINOrchestrator.ts"
    "src/ain/collective/CollectiveIntelligence.ts"
    "src/ain/collective/PatternRecognitionEngine.ts"
    "src/ain/collective/EvolutionTracker.ts"
)

# Main ds-oracle command
ds-oracle() {
    local cmd="${1:-help}"
    shift
    
    case "$cmd" in
        "review")
            ds-oracle-review "$@"
            ;;
        "analyze")
            ds-oracle-analyze "$@"
            ;;
        "agents")
            ds-oracle-agents "$@"
            ;;
        "memory")
            ds-oracle-memory "$@"
            ;;
        "ain")
            ds-oracle-ain "$@"
            ;;
        "architecture")
            ds-oracle-architecture "$@"
            ;;
        "improve")
            ds-oracle-improve "$@"
            ;;
        "test-coverage")
            ds-oracle-test-coverage "$@"
            ;;
        "help"|*)
            ds-oracle-help
            ;;
    esac
}

# Full system review
ds-oracle-review() {
    echo -e "${PURPLE}🔮 Maya Oracle System Review${NC}"
    echo "Analyzing core components..."
    echo ""
    
    local prompt="Review this Maya Oracle system architecture. Focus on:
1. Agent communication and coordination
2. Memory persistence and retrieval patterns
3. AIN collective intelligence integration
4. Potential bottlenecks or improvements
5. Security and error handling

Here are the core files:"
    
    # Collect all core files
    local files=("${ORACLE_CORE_FILES[@]}" "${MEMORY_FILES[@]}" "${AIN_FILES[@]:0:2}")
    
    (
        echo "$prompt"
        echo ""
        for file in "${files[@]}"; do
            if [ -f "$file" ]; then
                echo "=== $file ==="
                head -50 "$file"
                echo ""
            fi
        done
    ) | ollama run "$MODEL"
}

# Analyze system health
ds-oracle-analyze() {
    local focus="${1:-overall health}"
    echo -e "${BLUE}🔍 Analyzing Maya Oracle: $focus${NC}"
    echo ""
    
    local prompt="Analyze the Maya Oracle system focusing on: $focus

Key areas to examine:
- Agent initialization and lifecycle
- Memory consistency and performance
- Stream processing efficiency
- Error handling patterns
- TypeScript type safety"
    
    (
        echo "$prompt"
        echo ""
        echo "=== Core Server ==="
        head -100 src/server.ts 2>/dev/null
        echo ""
        echo "=== API Routes ==="
        head -100 src/api/index.ts 2>/dev/null
        echo ""
        echo "=== Types ==="
        cat src/types/index.ts 2>/dev/null
    ) | ollama run "$MODEL"
}

# Analyze all agents
ds-oracle-agents() {
    local query="${1:-Show how agents interact}"
    echo -e "${PURPLE}🤖 Maya Oracle Agents Analysis${NC}"
    echo "Query: $query"
    echo ""
    
    (
        echo "Analyze the Maya Oracle agent system. $query"
        echo ""
        echo "Agent files:"
        for file in "${ORACLE_CORE_FILES[@]}"; do
            if [ -f "$file" ]; then
                echo ""
                echo "=== $(basename $file) ==="
                grep -E "(class|interface|export|async|processMessage|generateResponse)" "$file" | head -30
            fi
        done
    ) | ollama run "$MODEL"
}

# Memory system analysis
ds-oracle-memory() {
    local aspect="${1:-persistence strategy}"
    echo -e "${BLUE}🧠 Memory System Analysis: $aspect${NC}"
    echo ""
    
    (
        echo "Analyze the Maya Oracle memory system, specifically: $aspect"
        echo ""
        for file in "${MEMORY_FILES[@]}"; do
            if [ -f "$file" ]; then
                echo "=== $file ==="
                cat "$file"
                echo ""
            fi
        done
    ) | ollama run "$MODEL"
}

# AIN system analysis
ds-oracle-ain() {
    local focus="${1:-collective intelligence}"
    echo -e "${YELLOW}🌐 AIN System Analysis: $focus${NC}"
    echo ""
    
    (
        echo "Analyze the AIN (Adaptive Intelligence Network) focusing on: $focus"
        echo ""
        for file in "${AIN_FILES[@]}"; do
            if [ -f "$file" ]; then
                echo "=== $(basename $file) ==="
                head -100 "$file"
                echo ""
            fi
        done
    ) | ollama run "$MODEL"
}

# Architecture overview
ds-oracle-architecture() {
    echo -e "${PURPLE}🏗️ Maya Oracle Architecture Overview${NC}"
    echo "Generating comprehensive analysis..."
    echo ""
    
    # Find all TypeScript files
    local ts_files=$(find src -name "*.ts" -type f | grep -E "(agent|memory|ain|api|route)" | sort)
    
    (
        echo "Create a comprehensive architecture diagram and explanation for the Maya Oracle system based on these files:"
        echo ""
        echo "$ts_files"
        echo ""
        echo "Include:"
        echo "1. Component relationships"
        echo "2. Data flow patterns"
        echo "3. Key architectural decisions"
        echo "4. Scalability considerations"
    ) | ollama run "$MODEL"
}

# Improvement suggestions
ds-oracle-improve() {
    local component="${1:-all}"
    echo -e "${GREEN}💡 Improvement Suggestions: $component${NC}"
    echo ""
    
    local files_to_analyze=()
    case "$component" in
        "agents")
            files_to_analyze=("${ORACLE_CORE_FILES[@]}")
            ;;
        "memory")
            files_to_analyze=("${MEMORY_FILES[@]}")
            ;;
        "ain")
            files_to_analyze=("${AIN_FILES[@]}")
            ;;
        *)
            files_to_analyze=("src/server.ts" "src/api/index.ts" "${ORACLE_CORE_FILES[0]}")
            ;;
    esac
    
    (
        echo "Suggest concrete improvements for the Maya Oracle $component components:"
        echo ""
        for file in "${files_to_analyze[@]}"; do
            if [ -f "$file" ]; then
                echo "=== $file ==="
                head -80 "$file"
                echo ""
            fi
        done
        echo ""
        echo "Provide specific code examples for the top 3 improvements."
    ) | ollama run "$MODEL"
}

# Test coverage analysis
ds-oracle-test-coverage() {
    echo -e "${YELLOW}🧪 Test Coverage Analysis${NC}"
    echo "Analyzing what needs testing..."
    echo ""
    
    # Find test files
    local test_files=$(find . -name "*.test.ts" -o -name "*.spec.ts" | sort)
    local src_files=$(find src -name "*.ts" -not -path "*/node_modules/*" | grep -v test | sort)
    
    (
        echo "Analyze test coverage gaps in the Maya Oracle system:"
        echo ""
        echo "Existing test files:"
        echo "$test_files"
        echo ""
        echo "Source files that need testing:"
        echo "$src_files" | head -20
        echo ""
        echo "Identify the top 5 most critical files that need tests and explain why."
    ) | ollama run "$MODEL"
}

# Quick oracle status check
ds-oracle-status() {
    echo -e "${PURPLE}🔮 Maya Oracle Quick Status${NC}"
    echo ""
    
    # Check file counts
    echo "📊 Component Overview:"
    echo "   Agents: $(ls src/agents/*.ts 2>/dev/null | wc -l) files"
    echo "   Memory: $(ls src/memory/*.ts 2>/dev/null | wc -l) files"
    echo "   AIN: $(find src/ain -name "*.ts" 2>/dev/null | wc -l) files"
    echo "   Routes: $(find src/routes -name "*.ts" 2>/dev/null | wc -l) files"
    echo ""
    
    # Quick health check
    echo "Analyzing overall health..."
    (
        echo "Based on this package.json and tsconfig, give a one-paragraph health assessment:"
        echo ""
        cat package.json 2>/dev/null | head -30
        echo ""
        cat tsconfig.json 2>/dev/null
    ) | ollama run "$MODEL" | head -10
}

# Help command
ds-oracle-help() {
    echo -e "${PURPLE}🔮 Maya Oracle DeepSeek Commands${NC}"
    echo ""
    echo "Usage: ds-oracle <command> [options]"
    echo ""
    echo "Commands:"
    echo "  ${YELLOW}review${NC}        - Full system architecture review"
    echo "  ${YELLOW}analyze${NC}       - Analyze system health (optional: focus area)"
    echo "  ${YELLOW}agents${NC}        - Analyze all agent interactions"
    echo "  ${YELLOW}memory${NC}        - Memory system deep dive"
    echo "  ${YELLOW}ain${NC}           - AIN collective intelligence analysis"
    echo "  ${YELLOW}architecture${NC}  - Generate architecture overview"
    echo "  ${YELLOW}improve${NC}       - Get improvement suggestions [agents|memory|ain|all]"
    echo "  ${YELLOW}test-coverage${NC} - Identify testing gaps"
    echo "  ${YELLOW}status${NC}        - Quick system status"
    echo ""
    echo "Examples:"
    echo "  ds-oracle review"
    echo "  ds-oracle analyze \"streaming performance\""
    echo "  ds-oracle agents \"explain Fire and Water interaction\""
    echo "  ds-oracle memory \"vector similarity search\""
    echo "  ds-oracle improve agents"
    echo ""
    echo "Current model: $MODEL"
}

# Export the function
export -f ds-oracle
export -f ds-oracle-review
export -f ds-oracle-analyze
export -f ds-oracle-agents
export -f ds-oracle-memory
export -f ds-oracle-ain
export -f ds-oracle-architecture
export -f ds-oracle-improve
export -f ds-oracle-test-coverage
export -f ds-oracle-status
export -f ds-oracle-help