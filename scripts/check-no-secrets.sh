#!/usr/bin/env bash
set -euo pipefail

# Scans ONLY what you're about to push (staged diff) for obvious secret patterns.
# Keep it conservative to avoid false positives.

DIFF="$(git diff --cached --unified=0)"

PATTERNS=(
  "sk-ant-"                 # Anthropic
  "sk-proj-"                # OpenAI project keys
  "sk-[A-Za-z0-9]{20,}"     # generic sk-
  "AIza[0-9A-Za-z_-]{20,}"  # Google API key
  "BEGIN PRIVATE KEY"
  "PRIVATE KEY-----"
  "xox[baprs]-"             # Slack tokens
  "ghp_[A-Za-z0-9]{20,}"    # GitHub token
)

for p in "${PATTERNS[@]}"; do
  if echo "$DIFF" | rg -n --pcre2 "$p" >/dev/null 2>&1; then
    echo "❌ Secret-like pattern detected in staged changes: $p"
    echo "   Fix it (remove/rotate/move to env), then re-stage."
    exit 1
  fi
done

echo "✅ No secret-like patterns detected in staged diff."
