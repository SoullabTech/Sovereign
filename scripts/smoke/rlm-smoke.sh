#!/usr/bin/env bash
#
# RLM Navigator smoke test
#
# Validates that:
# 1. API endpoint responds
# 2. Returns valid structure
# 3. Indexes files correctly
#
# Usage:
#   ./scripts/smoke/rlm-smoke.sh
#
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

ts() { date +"%H:%M:%S"; }
log() { echo "[$(ts)] $*"; }
ok()  { echo "✅ $*"; }
no()  { echo "❌ $*"; exit 1; }

log "RLM Navigator smoke test starting…"
log "Base URL: $BASE_URL"

# Test 1: Basic query
log "Test 1: Basic navigation query…"

payload='{"query":"Where is synastry saved to timeline?","limit":5,"includeSnippets":false}'

resp="$(curl -sS -X POST "$BASE_URL/api/rlm/navigate" \
  -H "Content-Type: application/json" \
  -d "$payload")"

# Check success
echo "$resp" | jq -e '.success == true' >/dev/null || no "Expected success=true"
ok "API returned success=true"

# Extract stats
indexed=$(echo "$resp" | jq -r '.stats.indexedFiles')
ms=$(echo "$resp" | jq -r '.stats.ms')
confidence=$(echo "$resp" | jq -r '.confidence')
top_file=$(echo "$resp" | jq -r '.nextFiles[0].file // "none"')

log "Indexed: $indexed files in ${ms}ms"
log "Confidence: $confidence"
log "Top hit: $top_file"

# Verify reasonable index size
[[ "$indexed" -gt 100 ]] || no "Expected >100 indexed files, got $indexed"
ok "Index size looks reasonable ($indexed files)"

# Test 2: Query with snippets
log "Test 2: Query with snippets…"

payload='{"query":"explorerId UUID","limit":3,"includeSnippets":true}'

resp="$(curl -sS -X POST "$BASE_URL/api/rlm/navigate" \
  -H "Content-Type: application/json" \
  -d "$payload")"

echo "$resp" | jq -e '.success == true' >/dev/null || no "Snippet query failed"

# Check that snippets are present
has_snippet=$(echo "$resp" | jq -r '.nextFiles[0].snippet != null')
[[ "$has_snippet" == "true" ]] || log "⚠️  No snippet in first result (may be expected)"
ok "Snippet query works"

# Test 3: Empty query should fail
log "Test 3: Empty query validation…"

resp="$(curl -sS -X POST "$BASE_URL/api/rlm/navigate" \
  -H "Content-Type: application/json" \
  -d '{"query":""}' \
  -w "\n%{http_code}" || true)"

http_code=$(echo "$resp" | tail -1)
[[ "$http_code" == "400" ]] || no "Expected 400 for empty query, got $http_code"
ok "Empty query rejected with 400"

# Test 4: Grep queries generated
log "Test 4: Grep queries generated…"

payload='{"query":"synastry save timeline","limit":3}'

resp="$(curl -sS -X POST "$BASE_URL/api/rlm/navigate" \
  -H "Content-Type: application/json" \
  -d "$payload")"

grep_count=$(echo "$resp" | jq -r '.grepQueries | length')
[[ "$grep_count" -gt 0 ]] || no "Expected grep queries, got none"
ok "Generated $grep_count grep queries"

# Test 5: Open file endpoint
log "Test 5: Open file endpoint…"

resp="$(curl -sS -X POST "$BASE_URL/api/rlm/open" \
  -H "Content-Type: application/json" \
  -d '{"path":"lib/rlm/navigate.ts"}')"

echo "$resp" | jq -e '.success == true and (.content | type == "string") and (.content | length > 20)' >/dev/null \
  || no "Open file failed"
ok "Open file works"

# Test 6: Open file blocks sensitive paths
log "Test 6: Open file security…"

resp="$(curl -sS -X POST "$BASE_URL/api/rlm/open" \
  -H "Content-Type: application/json" \
  -d '{"path":".env.local"}' \
  -w "\n%{http_code}" || true)"

http_code=$(echo "$resp" | tail -1)
[[ "$http_code" == "400" ]] || no "Expected 400 for .env path, got $http_code"
ok "Sensitive paths blocked"

# Summary
echo ""
ok "RLM Navigator smoke test PASSED"
echo ""
echo "Summary:"
echo "  Indexed files: $indexed"
echo "  Response time: ${ms}ms"
echo "  Top result: $top_file"
echo ""
