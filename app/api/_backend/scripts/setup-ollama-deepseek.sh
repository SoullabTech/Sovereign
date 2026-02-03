#!/bin/bash
# 🧠 Setup Ollama + DeepSeek for local AI coding assistant

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${PURPLE}🧠 Ollama + DeepSeek Local Setup${NC}"
echo "═════════════════════════════════════════════════════"
echo ""

# Check if Ollama is installed
echo -e "${BLUE}🔍 Checking for Ollama...${NC}"
if command -v ollama &> /dev/null; then
    OLLAMA_VERSION=$(ollama --version 2>&1 | head -1)
    echo -e "${GREEN}✅ Ollama is already installed${NC}"
    echo "   Version: $OLLAMA_VERSION"
else
    echo -e "${YELLOW}⚠️  Ollama not found${NC}"
    echo ""
    echo "Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    
    if command -v ollama &> /dev/null; then
        echo -e "${GREEN}✅ Ollama installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install Ollama${NC}"
        exit 1
    fi
fi

# Check if Ollama service is running
echo ""
echo -e "${BLUE}🔄 Checking Ollama service...${NC}"
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Ollama service is running${NC}"
else
    echo -e "${YELLOW}Starting Ollama service...${NC}"
    ollama serve > /dev/null 2>&1 &
    sleep 3
    if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Ollama service started${NC}"
    else
        echo -e "${YELLOW}⚠️  Ollama service not responding${NC}"
        echo "   You may need to start it manually: ollama serve"
    fi
fi

# List available models
echo ""
echo -e "${BLUE}📦 Available DeepSeek models:${NC}"
echo ""
echo "   1. deepseek-r1:1.5b  - Fast, lightweight (good for quick tasks)"
echo "   2. deepseek-r1:7b    - Balanced performance (recommended)"
echo "   3. deepseek-r1:14b   - Better quality, slower"
echo "   4. deepseek-r1:32b   - High quality (needs good GPU/RAM)"
echo ""

# Ask which model to download
echo -n "Which model would you like to install? [1-4, default=2]: "
read -r choice

MODEL="deepseek-r1:7b"  # default
case $choice in
    1) MODEL="deepseek-r1:1.5b" ;;
    2) MODEL="deepseek-r1:7b" ;;
    3) MODEL="deepseek-r1:14b" ;;
    4) MODEL="deepseek-r1:32b" ;;
    *) MODEL="deepseek-r1:7b" ;;
esac

echo ""
echo -e "${BLUE}📥 Pulling $MODEL...${NC}"
echo -e "${YELLOW}This may take a while depending on model size and internet speed${NC}"
echo ""

ollama pull "$MODEL"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Model downloaded successfully${NC}"
else
    echo -e "${RED}❌ Failed to download model${NC}"
    exit 1
fi

# Create helper scripts directory
HELPER_DIR="$HOME/.local/bin"
mkdir -p "$HELPER_DIR"

# Create main deepseek command
echo ""
echo -e "${BLUE}📝 Creating helper commands...${NC}"

cat > "$HELPER_DIR/deepseek" << 'EOF'
#!/bin/bash
# DeepSeek CLI wrapper
MODEL="${DEEPSEEK_MODEL:-deepseek-r1:7b}"

if [ $# -eq 0 ]; then
    # Interactive mode
    ollama run "$MODEL"
else
    # Command mode
    echo "$*" | ollama run "$MODEL"
fi
EOF
chmod +x "$HELPER_DIR/deepseek"

# Create deepseek-file command
cat > "$HELPER_DIR/deepseek-file" << 'EOF'
#!/bin/bash
# Analyze a file with DeepSeek
MODEL="${DEEPSEEK_MODEL:-deepseek-r1:7b}"

if [ $# -lt 1 ]; then
    echo "Usage: deepseek-file <file> [prompt]"
    exit 1
fi

FILE="$1"
PROMPT="${2:-Analyze this file and explain what it does:}"

if [ ! -f "$FILE" ]; then
    echo "Error: File '$FILE' not found"
    exit 1
fi

echo "🔍 Analyzing: $FILE"
echo ""
(echo "$PROMPT"; echo ""; cat "$FILE") | ollama run "$MODEL"
EOF
chmod +x "$HELPER_DIR/deepseek-file"

# Create deepseek-refactor command
cat > "$HELPER_DIR/deepseek-refactor" << 'EOF'
#!/bin/bash
# Get refactoring suggestions with DeepSeek
MODEL="${DEEPSEEK_MODEL:-deepseek-r1:7b}"

if [ $# -lt 1 ]; then
    echo "Usage: deepseek-refactor <file> [focus-area]"
    exit 1
fi

FILE="$1"
FOCUS="${2:-error handling and code clarity}"

if [ ! -f "$FILE" ]; then
    echo "Error: File '$FILE' not found"
    exit 1
fi

echo "🔧 Refactoring suggestions for: $FILE"
echo "   Focus: $FOCUS"
echo ""
(echo "Suggest refactoring improvements for this code, focusing on $FOCUS. Be specific with code examples:"; echo ""; cat "$FILE") | ollama run "$MODEL"
EOF
chmod +x "$HELPER_DIR/deepseek-refactor"

# Create deepseek-explain command
cat > "$HELPER_DIR/deepseek-explain" << 'EOF'
#!/bin/bash
# Explain code with DeepSeek
MODEL="${DEEPSEEK_MODEL:-deepseek-r1:7b}"

if [ $# -lt 1 ]; then
    echo "Usage: deepseek-explain <file>"
    exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
    echo "Error: File '$FILE' not found"
    exit 1
fi

echo "📚 Explaining: $FILE"
echo ""
(echo "Explain this code clearly, including its purpose, how it works, and any important patterns or techniques used:"; echo ""; cat "$FILE") | ollama run "$MODEL"
EOF
chmod +x "$HELPER_DIR/deepseek-explain"

# Create deepseek-review command
cat > "$HELPER_DIR/deepseek-review" << 'EOF'
#!/bin/bash
# Code review with DeepSeek
MODEL="${DEEPSEEK_MODEL:-deepseek-r1:7b}"

if [ $# -lt 1 ]; then
    echo "Usage: deepseek-review <file>"
    exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
    echo "Error: File '$FILE' not found"
    exit 1
fi

echo "👀 Code Review: $FILE"
echo ""
(echo "Perform a code review on this file. Look for bugs, performance issues, security concerns, and suggest improvements:"; echo ""; cat "$FILE") | ollama run "$MODEL"
EOF
chmod +x "$HELPER_DIR/deepseek-review"

# Create deepseek-test command
cat > "$HELPER_DIR/deepseek-test" << 'EOF'
#!/bin/bash
# Generate tests with DeepSeek
MODEL="${DEEPSEEK_MODEL:-deepseek-r1:7b}"

if [ $# -lt 1 ]; then
    echo "Usage: deepseek-test <file>"
    exit 1
fi

FILE="$1"

if [ ! -f "$FILE" ]; then
    echo "Error: File '$FILE' not found"
    exit 1
fi

echo "🧪 Generating tests for: $FILE"
echo ""
(echo "Generate comprehensive unit tests for this code. Include edge cases and error scenarios:"; echo ""; cat "$FILE") | ollama run "$MODEL"
EOF
chmod +x "$HELPER_DIR/deepseek-test"

# Create shell functions file
SHELL_FUNCTIONS="$HOME/.deepseek-functions"
cat > "$SHELL_FUNCTIONS" << 'EOF'
# DeepSeek Shell Functions
# Source this file in your .bashrc or .zshrc

# Set default model
export DEEPSEEK_MODEL="${DEEPSEEK_MODEL:-deepseek-r1:7b}"

# Quick deepseek chat
ds() {
    deepseek "$@"
}

# Analyze current directory
ds-analyze-dir() {
    local dir="${1:-.}"
    echo "Analyzing directory structure of $dir" | ollama run "$DEEPSEEK_MODEL"
    find "$dir" -type f -name "*.ts" -o -name "*.js" -o -name "*.py" | head -20
}

# Compare two files
ds-compare() {
    if [ $# -lt 2 ]; then
        echo "Usage: ds-compare <file1> <file2>"
        return 1
    fi
    (echo "Compare these two files and explain the differences:"; 
     echo "=== File 1: $1 ==="; cat "$1"; 
     echo "=== File 2: $2 ==="; cat "$2") | ollama run "$DEEPSEEK_MODEL"
}

# Quick fix suggestion
ds-fix() {
    local file="$1"
    local error="${2:-error}"
    if [ ! -f "$file" ]; then
        echo "Usage: ds-fix <file> [error-description]"
        return 1
    fi
    (echo "This file has an issue: $error. Suggest a fix:"; echo ""; cat "$file") | ollama run "$DEEPSEEK_MODEL"
}

# List available DeepSeek commands
ds-help() {
    echo "DeepSeek Commands:"
    echo "  ds [prompt]          - Quick chat with DeepSeek"
    echo "  deepseek-file        - Analyze a file"
    echo "  deepseek-explain     - Explain code in detail"
    echo "  deepseek-refactor    - Get refactoring suggestions"
    echo "  deepseek-review      - Perform code review"
    echo "  deepseek-test        - Generate unit tests"
    echo "  ds-analyze-dir       - Analyze directory structure"
    echo "  ds-compare           - Compare two files"
    echo "  ds-fix               - Get fix suggestions"
    echo ""
    echo "Current model: $DEEPSEEK_MODEL"
    echo "Change with: export DEEPSEEK_MODEL=deepseek-r1:14b"
}
EOF

# Add to shell config
echo ""
echo -e "${BLUE}🔧 Setting up shell integration...${NC}"

# Detect shell
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
else
    SHELL_RC="$HOME/.bashrc"
fi

# Add PATH if needed
if [[ ":$PATH:" != *":$HELPER_DIR:"* ]]; then
    echo "" >> "$SHELL_RC"
    echo "# DeepSeek CLI tools" >> "$SHELL_RC"
    echo "export PATH=\"\$PATH:$HELPER_DIR\"" >> "$SHELL_RC"
fi

# Add functions source
if ! grep -q "deepseek-functions" "$SHELL_RC" 2>/dev/null; then
    echo "source ~/.deepseek-functions" >> "$SHELL_RC"
fi

# Add Maya Oracle commands
ORACLE_COMMANDS="$SCRIPT_DIR/deepseek-oracle-commands.sh"
if [ -f "$ORACLE_COMMANDS" ]; then
    echo "" >> "$SHELL_RC"
    echo "# Maya Oracle DeepSeek Commands" >> "$SHELL_RC"
    echo "source $ORACLE_COMMANDS" >> "$SHELL_RC"
    echo -e "${GREEN}✅ Maya Oracle commands added${NC}"
fi

echo -e "${GREEN}✅ Shell integration added to $SHELL_RC${NC}"

# Test the setup
echo ""
echo -e "${BLUE}🧪 Testing setup...${NC}"
echo "What is 2+2?" | ollama run "$MODEL" | head -5

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${GREEN}✅ Ollama + DeepSeek Setup Complete!${NC}"
echo "═════════════════════════════════════════════════════"
echo ""
echo "   Model installed: $MODEL"
echo "   API endpoint: http://localhost:11434"
echo ""
echo "   🚀 Quick Start Commands:"
echo ""
echo "   ${YELLOW}deepseek${NC}                    # Interactive chat"
echo "   ${YELLOW}deepseek \"explain git rebase\"${NC}"
echo "   ${YELLOW}deepseek-file main.ts${NC}       # Analyze a file"
echo "   ${YELLOW}deepseek-explain utils.ts${NC}   # Explain code"
echo "   ${YELLOW}deepseek-review agent.ts${NC}    # Code review"
echo "   ${YELLOW}deepseek-test memory.ts${NC}     # Generate tests"
echo ""
echo "   🔮 Maya Oracle Commands:"
echo "   ${YELLOW}ds-oracle review${NC}            # Full system review"
echo "   ${YELLOW}ds-oracle agents${NC}            # Analyze all agents"
echo "   ${YELLOW}ds-oracle memory${NC}            # Memory system analysis"
echo "   ${YELLOW}ds-oracle improve${NC}           # Get improvements"
echo ""
echo "   📚 More commands: ${YELLOW}ds-help${NC} or ${YELLOW}ds-oracle help${NC}"
echo ""
echo "   ⚠️  Restart your terminal or run:"
echo "   ${YELLOW}source $SHELL_RC${NC}"
echo ""