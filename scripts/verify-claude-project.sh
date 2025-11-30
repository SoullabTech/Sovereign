#!/bin/bash
# CLAUDE CODE PROJECT VERIFICATION SCRIPT
# ========================================

echo "🤖 Claude Code Project Verification"
echo "==================================="

# Check current directory
CURRENT_DIR=$(pwd)
EXPECTED_DIR="/Users/soullab/MAIA-SOVEREIGN"

if [ "$CURRENT_DIR" = "$EXPECTED_DIR" ]; then
    echo "✅ CORRECT: Working in MAIA-SOVEREIGN project"
    echo "   Path: $CURRENT_DIR"
else
    echo "❌ ERROR: Wrong directory!"
    echo "   Current: $CURRENT_DIR"
    echo "   Expected: $EXPECTED_DIR"
    echo ""
    echo "🔧 Fix: Run 'cd /Users/soullab/MAIA-SOVEREIGN'"
    exit 1
fi

# Check for project identifiers
echo ""
echo "🔍 Checking project structure..."

if [ -f ".claude-project" ]; then
    echo "✅ Found .claude-project identifier"
else
    echo "❌ Missing .claude-project identifier"
fi

if [ -f "app/maia/page.tsx" ]; then
    echo "✅ Found MAIA app (app/maia/page.tsx)"
else
    echo "❌ Missing MAIA app structure"
fi

if [ -f "app/intro/page.tsx" ]; then
    echo "✅ Found intro page (app/intro/page.tsx)"
else
    echo "❌ Missing intro page"
fi

if [ -f "components/onboarding/SageTealDaimonWelcome.tsx" ]; then
    echo "✅ Found SageTealDaimonWelcome component"
else
    echo "❌ Missing SageTealDaimonWelcome component"
fi

# Check package.json name
PKG_NAME=$(grep '"name"' package.json | cut -d'"' -f4)
if [ "$PKG_NAME" = "spiralogic-oracle-system" ]; then
    echo "✅ Correct package name: $PKG_NAME"
else
    echo "❌ Wrong package name: $PKG_NAME"
fi

echo ""
echo "🎨 Design Standards:"
echo "   ✅ Sage/Teal + Dark Navy ONLY"
echo "   ❌ NO PURPLE anywhere"
echo ""
echo "🚀 Ready for Claude Code development in MAIA-SOVEREIGN!"