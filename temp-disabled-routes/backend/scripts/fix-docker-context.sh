#!/usr/bin/env bash
set -euo pipefail

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "═════════════════════════════════════════════════════"
echo -e "   🔧 ${BLUE}Docker Context Fix${NC}"
echo "═════════════════════════════════════════════════════"
echo ""

# Check current Docker context
echo -e "${BLUE}📍 Current Docker context:${NC}"
docker context ls

CURRENT_CONTEXT=$(docker context show)
echo -e "   Active: ${YELLOW}$CURRENT_CONTEXT${NC}"

# Fix common issues
echo ""
echo -e "${BLUE}🔧 Fixing Docker build issues...${NC}"

# 1. Reset to default context
echo -n "   Resetting to default context... "
docker context use default 2>/dev/null || docker context use desktop-linux 2>/dev/null
echo -e "${GREEN}✓${NC}"

# 2. Clean up builder cache
echo -n "   Cleaning builder cache... "
docker builder prune -f >/dev/null 2>&1 || true
echo -e "${GREEN}✓${NC}"

# 3. Check Docker daemon
echo -n "   Checking Docker daemon... "
if docker ps >/dev/null 2>&1; then
  echo -e "${GREEN}✓ Running${NC}"
else
  echo -e "${RED}✗ Not running${NC}"
  echo ""
  echo -e "${YELLOW}Starting Docker Desktop...${NC}"
  open -a Docker
  
  for i in {1..30}; do
    if docker ps >/dev/null 2>&1; then
      echo -e "${GREEN}✓ Docker started${NC}"
      break
    fi
    echo -n "."
    sleep 2
  done
fi

# 4. Test build capability
echo ""
echo -e "${BLUE}🧪 Testing Docker build...${NC}"

# Create a minimal test Dockerfile
TEST_DIR="/tmp/docker-test-$$"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

cat > Dockerfile << 'EOF'
FROM alpine:latest
RUN echo "Docker build test successful"
EOF

# Try to build
if docker build -t test-build . >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Docker build is working!${NC}"
  docker rmi test-build >/dev/null 2>&1 || true
else
  echo -e "${RED}❌ Docker build still failing${NC}"
  echo ""
  echo "Try these fixes:"
  echo "1. Restart Docker Desktop completely"
  echo "2. Reset Docker to factory defaults:"
  echo "   Docker Desktop → Settings → Reset → Reset to factory defaults"
  echo "3. Check disk space: df -h"
fi

# Cleanup
cd - >/dev/null
rm -rf "$TEST_DIR"

echo ""
echo -e "${BLUE}📊 Docker Info:${NC}"
docker version --format 'Client: {{.Client.Version}}' || echo "Client: unknown"
docker version --format 'Server: {{.Server.Version}}' || echo "Server: unknown"

echo ""
echo "═════════════════════════════════════════════════════"
echo ""

# Now try the actual build
PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CSM_DIR="$PROJECT_ROOT/backend/csm"

if [ -d "$CSM_DIR" ]; then
  echo -e "${BLUE}🔄 Retrying Sesame CSM build...${NC}"
  echo ""
  
  cd "$CSM_DIR"
  
  # Extra cleanup
  export COPYFILE_DISABLE=1
  find . -name "._*" -delete 2>/dev/null || true
  find . -name ".DS_Store" -delete 2>/dev/null || true
  
  # Try build with explicit platform
  echo "Building with explicit platform..."
  if docker build --platform linux/amd64 -t sesame-csm -f Dockerfile . ; then
    echo -e "${GREEN}✅ Build successful!${NC}"
  else
    echo -e "${RED}❌ Build failed${NC}"
    echo ""
    echo "Alternative approach:"
    echo "1. Use the pre-built mock server instead:"
    echo "   ./scripts/start-mock-sesame.sh"
    echo ""
    echo "2. Or try building with --no-cache:"
    echo "   docker build --no-cache -t sesame-csm ."
  fi
else
  echo -e "${YELLOW}⚠️  CSM directory not found${NC}"
  echo "Run setup-local-csm.sh first"
fi