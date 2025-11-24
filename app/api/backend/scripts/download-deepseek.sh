#!/bin/bash
# Download deepseek-engineer avoiding macOS resource fork issues

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "═════════════════════════════════════════════════════"
echo "   📥 Downloading deepseek-engineer"
echo "═════════════════════════════════════════════════════"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
cd "$BACKEND_DIR"

# Clean up any existing attempts
rm -rf deepseek-engineer 2>/dev/null || true

# Method 1: Try downloading as zip
echo -e "${BLUE}📦 Downloading as ZIP archive...${NC}"
curl -L -o deepseek.zip https://github.com/Doriandarko/deepseek-engineer/archive/refs/heads/main.zip

if [ -f deepseek.zip ]; then
    echo -e "${BLUE}📂 Extracting...${NC}"
    unzip -q deepseek.zip
    mv deepseek-engineer-main deepseek-engineer
    rm deepseek.zip
    
    # Clean any resource forks
    find deepseek-engineer -name "._*" -delete 2>/dev/null || true
    find deepseek-engineer -name ".DS_Store" -delete 2>/dev/null || true
    
    echo -e "${GREEN}✅ Downloaded successfully${NC}"
else
    echo -e "${RED}❌ Download failed${NC}"
    exit 1
fi

# Check what we got
cd deepseek-engineer
echo ""
echo -e "${BLUE}📁 Repository contents:${NC}"
ls -la

# Check for Python files
if [ -f "deepseek_engineer.py" ] || [ -f "main.py" ] || [ -f "app.py" ]; then
    echo ""
    echo -e "${BLUE}📋 Found Python files:${NC}"
    find . -name "*.py" -type f | head -10
fi

# Check for requirements
if [ -f "requirements.txt" ]; then
    echo ""
    echo -e "${BLUE}📦 Requirements file found:${NC}"
    cat requirements.txt
fi

# Check for README
if [ -f "README.md" ]; then
    echo ""
    echo -e "${BLUE}📚 README preview:${NC}"
    head -20 README.md
fi

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   ${GREEN}✅ deepseek-engineer downloaded!${NC}"
echo "═════════════════════════════════════════════════════"
echo ""
echo "   Location: $BACKEND_DIR/deepseek-engineer"
echo ""
echo "   Next steps:"
echo "   1. cd deepseek-engineer"
echo "   2. Check README.md for setup instructions"
echo "   3. Install dependencies"
echo ""