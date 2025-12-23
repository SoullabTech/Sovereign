#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# MAIA Sovereign Deployment Script
# ═══════════════════════════════════════════════════════════════════════════════
# Self-hosted Docker deployment (NOT Vercel)
# ═══════════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

cd "$(dirname "$0")/.."

echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                     MAIA Sovereign Deployment                              ║"
echo "║                    Self-Hosted Docker Build                                ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check Next.js config
echo "🔍 Verifying Next.js configuration..."
if node - <<'NODE'
const c = require('./next.config.js')
const hasStandalone = c.output === 'standalone' || (typeof c.output === 'function' && c.output().includes('standalone'))
const hasExcludes = !!c.outputFileTracingExcludes
const hasRedirects = typeof c.redirects === 'function'

console.log('  output mode:', c.output)
console.log('  outputFileTracingExcludes:', hasExcludes ? '✅' : '❌')
console.log('  redirects:', hasRedirects ? '✅' : '❌')

if (!hasExcludes || !hasRedirects) {
  console.error('\n❌ Config missing required settings. Run sovereign-fix-config.sh first.')
  process.exit(1)
}
NODE
then
    echo "✅ Next.js config verified"
else
    echo "❌ Config check failed"
    exit 1
fi
echo ""

# Build Docker image
echo "🏗️  Building Docker image..."
docker compose build --no-cache

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully"
else
    echo "❌ Docker build failed"
    exit 1
fi
echo ""

# Start containers
echo "🚀 Starting containers..."
docker compose up -d

if [ $? -eq 0 ]; then
    echo "✅ Containers started"
else
    echo "❌ Failed to start containers"
    exit 1
fi
echo ""

# Wait for health check
echo "⏳ Waiting for health check..."
sleep 5

MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker compose ps | grep -q "healthy"; then
        echo "✅ Container is healthy"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    echo "   Attempt $ATTEMPT/$MAX_ATTEMPTS..."
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "⚠️  Health check timeout - check logs with: docker compose logs maia"
fi
echo ""

# Smoke tests
echo "🧪 Running smoke tests..."
echo ""

echo "📍 Test 1: Main MAIA page"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/maia)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ /maia → $HTTP_CODE OK"
else
    echo "   ❌ /maia → $HTTP_CODE (expected 200)"
fi

echo "📍 Test 2: Biofield redirect"
REDIRECT=$(curl -s -I http://localhost:3000/maia/journey | grep -i "location:" | awk '{print $2}' | tr -d '\r')
if echo "$REDIRECT" | grep -q "panel=biofield"; then
    echo "   ✅ /maia/journey → 307 redirect to $REDIRECT"
else
    echo "   ❌ Redirect failed (got: $REDIRECT)"
fi

echo "📍 Test 3: Consciousness health API"
STATUS=$(curl -s http://localhost:3000/api/consciousness/health | jq -r '.status' 2>/dev/null || echo "error")
if [ "$STATUS" != "error" ]; then
    echo "   ✅ /api/consciousness/health → status: $STATUS"
else
    echo "   ❌ Health API failed"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════╗"
echo "║                          Deployment Complete!                              ║"
echo "╚═══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 MAIA is running at: http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f maia    # View logs"
echo "  docker compose stop            # Stop containers"
echo "  docker compose restart         # Restart containers"
echo "  docker compose down            # Stop and remove containers"
echo ""
