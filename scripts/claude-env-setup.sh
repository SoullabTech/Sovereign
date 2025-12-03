#!/bin/bash

# Claude Code Environment Setup for MAIA-Sovereign
# Ensures we're always working in the correct repository environment

echo "🤖 Setting up Claude Code environment for MAIA-Sovereign..."

# Verify we're in the correct repository
CURRENT_DIR=$(pwd)
EXPECTED_DIR="/Users/soullab/MAIA-SOVEREIGN"

if [[ "$CURRENT_DIR" != "$EXPECTED_DIR" ]]; then
    echo "❌ ERROR: Not in correct repository!"
    echo "   Current: $CURRENT_DIR"
    echo "   Expected: $EXPECTED_DIR"
    echo "   Please cd to $EXPECTED_DIR"
    exit 1
fi

# Verify git remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
EXPECTED_REMOTE="https://github.com/SoullabTech/Sovereign.git"

if [[ "$REMOTE_URL" != "$EXPECTED_REMOTE" ]]; then
    echo "❌ ERROR: Incorrect git remote!"
    echo "   Current: $REMOTE_URL"
    echo "   Expected: $EXPECTED_REMOTE"
    exit 1
fi

# Clean up any conflicting processes
echo "🧹 Cleaning up conflicting development processes..."
pkill -f "node.*3000" 2>/dev/null || true
pkill -f "node.*3001" 2>/dev/null || true
pkill -f "node.*3002" 2>/dev/null || true
pkill -f "node.*3003" 2>/dev/null || true
pkill -f "node.*3004" 2>/dev/null || true

# Wait for cleanup
sleep 2

echo "✅ Environment verified:"
echo "   📁 Repository: MAIA-Sovereign"
echo "   🔗 Remote: SoullabTech/Sovereign"
echo "   📦 Package: spiralogic-oracle-system"
echo "   🧹 Ports: Cleaned up"

echo ""
echo "🚨 DEPLOYMENT INFRASTRUCTURE REMINDER:"
echo "   ✅ Production: https://soullab.life (Docker + Nginx)"
echo "   ✅ Database: Supabase (managed PostgreSQL)"
echo "   ✅ Cache: Redis, Monitoring: Prometheus/Grafana"
echo "   ❌ NOT using Vercel or Cloudflare"
echo ""

# Offer to start clean development server
echo "🚀 Ready for development!"
echo "   Run 'npm run dev' for clean development server"
echo "   Run 'npm run build:sovereign' for Sovereign-specific build"
echo "   Run 'npm run typecheck' for TypeScript validation"
echo "   Run './deploy.sh' for production deployment to soullab.life"

exit 0