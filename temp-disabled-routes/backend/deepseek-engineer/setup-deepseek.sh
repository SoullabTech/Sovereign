#!/bin/bash
# Setup script for DeepSeek Engineer v2

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "═════════════════════════════════════════════════════"
echo "   🐋 DeepSeek Engineer v2 Setup"
echo "═════════════════════════════════════════════════════"
echo ""

# Check Python version
echo -e "${BLUE}🐍 Checking Python version...${NC}"
PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
REQUIRED_VERSION="3.11"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$PYTHON_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then 
    echo -e "${GREEN}✅ Python $PYTHON_VERSION meets requirements${NC}"
else
    echo -e "${YELLOW}⚠️  Python 3.11+ recommended (you have $PYTHON_VERSION)${NC}"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
    echo ""
    echo "To use DeepSeek Engineer, you need an API key:"
    echo "1. Get your API key from: https://platform.deepseek.com"
    echo "2. Create a .env file with:"
    echo ""
    echo "   DEEPSEEK_API_KEY=your_api_key_here"
    echo ""
    read -p "Do you have a DeepSeek API key? (y/N): " has_key
    
    if [[ "$has_key" =~ ^[Yy]$ ]]; then
        read -p "Enter your DeepSeek API key: " api_key
        echo "DEEPSEEK_API_KEY=$api_key" > .env
        echo -e "${GREEN}✅ Created .env file${NC}"
    else
        echo ""
        echo -e "${BLUE}Creating .env template...${NC}"
        cat > .env.template << 'EOF'
# DeepSeek API Configuration
DEEPSEEK_API_KEY=your_api_key_here

# Optional: API endpoint (default: https://api.deepseek.com)
# DEEPSEEK_API_ENDPOINT=https://api.deepseek.com
EOF
        echo -e "${GREEN}✅ Created .env.template${NC}"
        echo ""
        echo "Add your API key to .env when ready."
    fi
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Create virtual environment
echo ""
echo -e "${BLUE}📦 Setting up Python environment...${NC}"

# Check if uv is available
if command -v uv &> /dev/null; then
    echo -e "${GREEN}✅ Using uv (fast package manager)${NC}"
    METHOD="uv"
    
    if [ ! -d ".venv" ]; then
        echo "Creating virtual environment..."
        uv venv
    fi
    
    echo "Installing dependencies..."
    uv pip install -r requirements.txt
else
    echo -e "${YELLOW}ℹ️  Using pip (install uv for faster setup: pip install uv)${NC}"
    METHOD="pip"
    
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    echo "Activating environment..."
    source venv/bin/activate
    
    echo "Installing dependencies..."
    pip install -r requirements.txt
fi

# Create launcher script
echo ""
echo -e "${BLUE}🚀 Creating launcher script...${NC}"
cat > run-deepseek.sh << 'LAUNCHER'
#!/bin/bash
# DeepSeek Engineer Launcher

# Check for .env
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Create .env with: DEEPSEEK_API_KEY=your_key_here"
    exit 1
fi

# Check for API key
if ! grep -q "DEEPSEEK_API_KEY=" .env || grep -q "DEEPSEEK_API_KEY=your_api_key_here" .env; then
    echo "❌ Error: DEEPSEEK_API_KEY not set in .env!"
    echo "Get your key from: https://platform.deepseek.com"
    exit 1
fi

# Run with appropriate method
if command -v uv &> /dev/null && [ -d ".venv" ]; then
    echo "🚀 Starting DeepSeek Engineer with uv..."
    uv run python deepseek-eng.py "$@"
elif [ -d "venv" ]; then
    echo "🚀 Starting DeepSeek Engineer with venv..."
    source venv/bin/activate
    python deepseek-eng.py "$@"
else
    echo "🚀 Starting DeepSeek Engineer..."
    python3 deepseek-eng.py "$@"
fi
LAUNCHER

chmod +x run-deepseek.sh

echo -e "${GREEN}✅ Created run-deepseek.sh${NC}"

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${GREEN}✅ Setup Complete!${NC}"
echo "═════════════════════════════════════════════════════"
echo ""
echo "   DeepSeek Engineer v2 is ready to use!"
echo ""
echo "   To start:"
echo -e "   ${YELLOW}./run-deepseek.sh${NC}"
echo ""
if [ "$METHOD" = "uv" ]; then
    echo "   Or directly with uv:"
    echo -e "   ${YELLOW}uv run python deepseek-eng.py${NC}"
else
    echo "   Or manually:"
    echo -e "   ${YELLOW}source venv/bin/activate${NC}"
    echo -e "   ${YELLOW}python deepseek-eng.py${NC}"
fi
echo ""
echo "   📚 Usage examples:"
echo "   - Ask it to read and analyze your code"
echo "   - Request file creation or editing"
echo "   - Get code reviews and improvements"
echo ""
if [ ! -f ".env" ] || ! grep -q "DEEPSEEK_API_KEY=" .env || grep -q "DEEPSEEK_API_KEY=your_api_key_here" .env; then
    echo -e "   ${RED}⚠️  Remember to add your API key to .env!${NC}"
    echo ""
fi