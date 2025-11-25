#!/bin/bash
# PROJECT DISCOVERY PROTOCOL
# ALWAYS RUN THIS FIRST before making any UI changes!

echo "🔍 === PROJECT DISCOVERY PROTOCOL === 🔍"
echo "🚨 RULE: DISCOVER BEFORE BUILDING!"
echo ""

echo "📂 Searching for existing components..."
echo ""

echo "🎯 ONBOARDING COMPONENTS:"
find . -name "*Welcome*" -o -name "*Onboarding*" -o -name "*Flow*" | grep -v node_modules | grep -v .next | head -10
echo ""

echo "🧠 CONSCIOUSNESS COMPONENTS:"
find . -name "*Between*" -o -name "*Field*" -o -name "*Consciousness*" | grep -v node_modules | grep -v .next | head -10
echo ""

echo "🔧 TRANSFORMATION COMPONENTS:"
find . -name "*Sacred*" -o -name "*Intention*" -o -name "*Sanctuary*" -o -name "*Threshold*" | grep -v node_modules | grep -v .next | head -10
echo ""

echo "📁 ALL TSX FILES IN APPS/WEB:"
find ./apps/web -name "*.tsx" 2>/dev/null | head -15
echo ""

echo "🎯 KEY DIRECTORIES:"
echo "  📂 apps/web/components/onboarding/"
ls apps/web/components/onboarding/ 2>/dev/null || echo "     (directory not found)"
echo "  📂 apps/web/components/consciousness/"
ls apps/web/components/consciousness/ 2>/dev/null || echo "     (directory not found)"
echo "  📂 apps/web/lib/consciousness/"
ls apps/web/lib/consciousness/ 2>/dev/null || echo "     (directory not found)"
echo ""

echo "⚡ CURRENT ACTIVE COMPONENTS:"
echo "  📂 components/onboarding/"
ls components/onboarding/ 2>/dev/null || echo "     (empty or not found)"
echo "  📂 components/consciousness/"
ls components/consciousness/ 2>/dev/null || echo "     (empty or not found)"
echo ""

echo "🚨 NEXT STEPS:"
echo "  1. Review existing components above"
echo "  2. Ask user which system they want: SageTeal or Consciousness Field"
echo "  3. Copy (don't recreate) from apps/web/"
echo "  4. NEVER build from scratch if it exists!"