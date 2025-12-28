#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

# Only scan production API routes (not scripts, examples, tests, generated code)
# These are the files that run in production and could leak user data
FILES="$(git ls-files | grep -E '^(app/api/between|app/api/maia|app/api/consciousness|lib/consciousness|lib/sovereign|lib/memory|lib/services|lib/voice)/.*\.(ts|tsx)$' | grep -vE '(dist|\.d\.ts|\.test\.|__tests__|/examples/|/scripts/)' || true)"

if [[ -z "${FILES}" ]]; then
  echo "Leak guard: no target files found."
  exit 0
fi

# HIGH SEVERITY: Patterns that indicate USER CONTENT being logged
# These will cause the check to fail
# Focus on: message, content, prompt, input, text (user-generated content)
HIGH_SEVERITY_PATTERNS=(
  'console\.(log|info|warn|error).*(message|content|prompt|input|text)\.(substring|slice)\('
  'console\.(log|info|warn|error).*\.(substring|slice)\(0,.*\).*(message|content|prompt|input|text)'
)

# EXCLUDED SAFE PATTERNS (fingerprinting IDs is fine):
# - userId.slice/substring (ID fingerprinting for privacy)
# - sessionId.slice/substring
# - token.substring (partial token logging)
# - hash.substring (hash fingerprinting)
# - key.substring (cache key fingerprinting)

FOUND_HIGH=0

while IFS= read -r f; do
  [[ -f "$f" ]] || continue

  # Skip backup files
  if [[ "$f" =~ \.backup\.|\.bak\. ]]; then
    continue
  fi

  # Check high severity patterns (blocking)
  for p in "${HIGH_SEVERITY_PATTERNS[@]}"; do
    # Exclude lines with explicit ignore comments or length-only logging
    MATCHES="$(grep -nE "$p" "$f" | grep -v 'leak-guard:ignore' | grep -v 'Never log content' | grep -v '\.length' || true)"
    if [[ -n "$MATCHES" ]]; then
      echo ""
      echo "🚫 [HIGH] Content leak in: $f"
      echo "$MATCHES"
      FOUND_HIGH=1
    fi
  done
done <<< "$FILES"

if [[ "$FOUND_HIGH" -eq 1 ]]; then
  echo ""
  echo "Fix: use .length instead of .substring()/.slice(), or add // leak-guard:ignore if truly safe."
  exit 1
fi

echo "✅ Leak guard passed - no content leaks detected in production paths."
