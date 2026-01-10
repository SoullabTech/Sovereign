#!/usr/bin/env bash
#
# RLM Codebase Navigator smoke test
#
# Validates that:
# 1. Ollama is available for local LLM
# 2. RLM module compiles without errors
# 3. A simple navigation query works
#
# Usage:
#   ./scripts/smoke/rlm-codebase-smoke.sh
#
set -euo pipefail

ts() { date +"%H:%M:%S"; }
log() { echo "[$(ts)] $*"; }
ok()  { echo "✅ $*"; }
no()  { echo "❌ $*"; exit 1; }

log "RLM Codebase Navigator smoke test starting…"

# Test 1: Check Ollama availability
log "Test 1: Checking Ollama availability…"

OLLAMA_HEALTH=$(curl -s http://localhost:11434/api/version 2>/dev/null || echo "offline")

if [[ "$OLLAMA_HEALTH" == "offline" ]]; then
  no "Ollama not running. Start with: ollama serve"
fi
ok "Ollama is running"

# Test 2: Check TypeScript compilation
log "Test 2: Checking RLM module compiles…"

npx tsc --noEmit lib/rlm/index.ts lib/rlm/types.ts lib/rlm/tools.ts lib/rlm/CodebaseNavigator.ts 2>&1 || {
  no "TypeScript compilation failed"
}
ok "RLM module compiles"

# Test 3: Run a simple query
log "Test 3: Running simple codebase query…"

QUERY="Where is the postgres database client defined?"

RESULT=$(npx tsx -e "
import { navigateCodebase } from './lib/rlm/CodebaseNavigator';

async function main() {
  const result = await navigateCodebase('$QUERY', {
    maxIterations: 4,
    verbose: true,
  });
  console.log('---RESULT---');
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
" 2>&1)

echo "$RESULT"

# Check for answer
if echo "$RESULT" | grep -q '"answer"'; then
  ok "Navigation query returned an answer"
else
  no "Navigation query failed to produce an answer"
fi

# Check for sources
if echo "$RESULT" | grep -q '"sources"'; then
  ok "Answer includes source references"
fi

# Summary
echo ""
ok "RLM Codebase Navigator smoke test PASSED ✅"
echo ""
echo "The RLM module can:"
echo "  • Search for code patterns"
echo "  • Read files for context"
echo "  • Synthesize answers using local LLM"
