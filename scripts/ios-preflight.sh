#!/bin/bash
# iOS Preflight Checks
#
# Run this BEFORE any TestFlight upload.
# These checks catch the common mistakes that burn TestFlight slots:
# - Undefined refs that only crash in production
# - Wrong API base URL logic
# - Missing iOS-specific handling
# - Scattered timing values

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

echo "🔍 iOS Preflight Checks"
echo "======================="
echo ""

# 1. TypeScript compilation
echo "📝 Running TypeScript check..."
if npm run typecheck > /dev/null 2>&1; then
  echo -e "${GREEN}✅ TypeScript: OK${NC}"
else
  echo -e "${RED}❌ TypeScript: FAILED${NC}"
  echo "   Run: npm run typecheck"
  ERRORS=$((ERRORS + 1))
fi

# 2. Check for common "undefined ref" patterns that crash in production
echo ""
echo "🔎 Checking for undefined ref patterns..."

# Pattern: using .current on a ref that might not be defined in minified closures
UNSAFE_REFS=$(grep -rn "Ref\.current" --include="*.tsx" --include="*.ts" \
  components/OracleConversation.tsx \
  components/voice/ContinuousConversation.tsx \
  hooks/useStreamingVoice.ts 2>/dev/null | \
  grep -v "if.*Ref\.current" | \
  grep -v "Ref\.current\s*=" | \
  grep -v "const.*=.*Ref\.current" | \
  head -5 || true)

if [ -n "$UNSAFE_REFS" ]; then
  echo -e "${YELLOW}⚠️  Potentially unsafe ref access (check these manually):${NC}"
  echo "$UNSAFE_REFS"
else
  echo -e "${GREEN}✅ Ref patterns: OK${NC}"
fi

# 3. Check iOS audio constants are being used (not scattered magic numbers)
echo ""
echo "🔎 Checking for scattered iOS timing values..."

# Look for hardcoded delays that should use constants
SCATTERED_DELAYS=$(grep -rn -E "(setTimeout.*[0-9]{3,4}|delay.*=.*[0-9]{3,4}|[0-9]{3,4}ms)" \
  --include="*.tsx" --include="*.ts" \
  components/voice/ContinuousConversation.tsx \
  components/OracleConversation.tsx 2>/dev/null | \
  grep -v "IOS_" | \
  grep -v "// " | \
  grep -v "import" | \
  head -10 || true)

if [ -n "$SCATTERED_DELAYS" ]; then
  echo -e "${YELLOW}⚠️  Found hardcoded timing values (consider using ios-audio-constants.ts):${NC}"
  echo "$SCATTERED_DELAYS"
else
  echo -e "${GREEN}✅ iOS timing constants: OK${NC}"
fi

# 4. Check API base URL has iOS/Capacitor detection BEFORE localhost
echo ""
echo "🔎 Checking API base URL logic..."

API_BASE_FILE="lib/http/apiBase.ts"
if [ -f "$API_BASE_FILE" ]; then
  # Check that Capacitor check comes before localhost check
  CAPACITOR_LINE=$(grep -n "Capacitor" "$API_BASE_FILE" | head -1 | cut -d: -f1 || echo "9999")
  LOCALHOST_LINE=$(grep -n "localhost" "$API_BASE_FILE" | head -1 | cut -d: -f1 || echo "0")

  if [ "$CAPACITOR_LINE" -lt "$LOCALHOST_LINE" ] 2>/dev/null; then
    echo -e "${GREEN}✅ API base URL: Capacitor check before localhost${NC}"
  else
    echo -e "${YELLOW}⚠️  API base URL: Capacitor check should come BEFORE localhost check${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  API base URL: File not found${NC}"
fi

# 5. Check Swift files for syntax errors (no garbage text)
echo ""
echo "🔎 Checking Swift files for syntax errors..."

SWIFT_GARBAGE=$(grep -rn -E "^[a-z]{2,} [a-z]+ " \
  --include="*.swift" \
  ios/App/App/ 2>/dev/null | \
  grep -v "import \|func \|var \|let \|class \|struct \|enum \|case \|return \|if \|else \|for \|while \|switch \|guard \|protocol \|extension \|private \|public \|internal \|fileprivate \|open \|static \|override \|@\|// " | \
  head -5 || true)

if [ -n "$SWIFT_GARBAGE" ]; then
  echo -e "${RED}❌ Swift files contain garbage text:${NC}"
  echo "$SWIFT_GARBAGE"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ Swift files: OK${NC}"
fi

# 6. Check that useStreamingVoice handles audioChunksReceived in fallback
echo ""
echo "🔎 Checking streaming voice fallback..."

if grep -q "audioChunksReceived.*audioEventsSeenRef" hooks/useStreamingVoice.ts 2>/dev/null; then
  echo -e "${GREEN}✅ Streaming voice fallback: includes audioChunksReceived${NC}"
else
  echo -e "${YELLOW}⚠️  Streaming voice fallback: might not pass audioChunksReceived correctly${NC}"
fi

# 7. Check that iOS restart has lock to prevent double-starts
echo ""
echo "🔎 Checking for restart lock pattern..."

if grep -q "restartLockRef\|isRestartingRef" components/voice/ContinuousConversation.tsx 2>/dev/null; then
  echo -e "${GREEN}✅ Restart lock: Present${NC}"
else
  echo -e "${YELLOW}⚠️  Restart lock: Consider adding to prevent concurrent restart attempts${NC}"
fi

# Summary
echo ""
echo "======================="
if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}❌ PREFLIGHT FAILED: $ERRORS critical error(s)${NC}"
  echo ""
  echo "DO NOT upload to TestFlight until these are fixed."
  exit 1
else
  echo -e "${GREEN}✅ PREFLIGHT PASSED${NC}"
  echo ""
  echo "You can proceed with Local Device Gate testing."
  echo "After testing passes: touch ios/GATE_PASSED"
  exit 0
fi
