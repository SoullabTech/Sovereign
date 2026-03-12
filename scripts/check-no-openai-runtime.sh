#!/usr/bin/env bash
# check-no-openai-runtime.sh
#
# Fails if any live TypeScript file contains evidence of OpenAI runtime access:
#   1. SDK imports:  from 'openai' / require('openai') / new OpenAI(
#   2. Raw egress:   fetch('https://api.openai.com/...')
#   3. Key injection: OPENAI_API_KEY being passed as a call argument or used in
#                    headers/auth (not just being declared absent or logged)
#
# Enforces the zero-access doctrine declared in lib/ai/openaiPolicy.ts.
#
# Allowed files (tombstones / policy declarations / legacy check):
#   lib/openai-client.ts        — original tombstone
#   lib/ai/openaiClient.ts      — sovereignty tombstone
#   lib/ai/openaiPolicy.ts      — doctrine declaration
#   scripts/audit-sovereignty.ts — lists the key name for auditing purposes
#
# If you see this fail:
#   1. Find the file in the list below.
#   2. Replace the OpenAI call with Claude / Kokoro / local embeddings.
#   3. See lib/ai/openaiPolicy.ts for approved alternatives.

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

VIOLATIONS=()

while IFS= read -r file; do
  # Skip archived / disabled paths
  case "$file" in
    */app/api/_backend/*) continue ;;
    */lib/maia-sdk.DISABLED/*) continue ;;
    */node_modules/*) continue ;;
    # Allowed tombstones / policy files
    */lib/openai-client.ts) continue ;;
    */lib/ai/openaiClient.ts) continue ;;
    */lib/ai/openaiPolicy.ts) continue ;;
    # Audit script that legitimately references key names
    */scripts/audit-sovereignty.ts) continue ;;
    # Test files
    */__tests__/*) continue ;;
    *.test.ts) continue ;;
    *.spec.ts) continue ;;
  esac

  # Pattern 1: SDK import or instantiation
  if grep -qE "from ['\"]openai['\"]|require\(['\"]openai['\"]\)|new OpenAI\(" "$file" 2>/dev/null; then
    VIOLATIONS+=("$file [openai-sdk]")
    continue
  fi

  # Pattern 2: Direct egress to OpenAI domains (non-comment lines only)
  if grep -E "api\.openai\.com|openai\.com/v1" "$file" 2>/dev/null | \
     grep -vE "^\s*//|^\s*\*|SOVEREIGNTY|tombstone|Was:|quarantine|blocked|disabled|sovereignty" | \
     grep -qE "api\.openai\.com|openai\.com/v1"; then
    VIOLATIONS+=("$file [openai-fetch]")
    continue
  fi

  # Pattern 3: OPENAI_API_KEY used as a value (not a guard/tombstone/comment)
  # Allow: lines that check absence (!OPENAI_API_KEY), are comments, or are tombstone/sovereignty notes
  if grep -E "process\.env\.OPENAI_API_KEY" "$file" 2>/dev/null | \
     grep -vE "^\s*//|^\s*\*|!process\.env\.OPENAI_API_KEY|SOVEREIGNTY|tombstone|zero-OpenAI|openaiPolicy|blocked|quarantine|sovereignty|ignored|not used|no.*key|key.*not|key.*absent|audit" | \
     grep -qE "process\.env\.OPENAI_API_KEY"; then
    VIOLATIONS+=("$file [openai-key]")
    continue
  fi

done < <(find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  ! -path "*/dist/*")

if [ ${#VIOLATIONS[@]} -eq 0 ]; then
  echo "✅ check:no-openai-runtime — no live OpenAI access found"
  exit 0
else
  echo "❌ check:no-openai-runtime — SOVEREIGNTY VIOLATION: live OpenAI access detected"
  echo ""
  echo "These files contain OpenAI runtime access outside approved tombstones:"
  for f in "${VIOLATIONS[@]}"; do
    echo "  $f"
  done
  echo ""
  echo "Approved alternatives: lib/ai/openaiPolicy.ts"
  exit 1
fi
