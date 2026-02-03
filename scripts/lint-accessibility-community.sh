#!/usr/bin/env bash
set -euo pipefail

echo "Running community accessibility lint (disallow text-stone-300/text-stone-400)..."

# Only scan community UI surfaces
TARGETS=(
  "app/maia/community"
  "components/community"
)

# Exclude:
# - dark mode variants (dark:text-stone-300/400 - light text on dark bg is fine)
# - placeholder text (placeholder:text-stone-400 - intentionally lighter)
# - disabled state indicators (cursor-not-allowed - intentionally lighter to show disabled)
#
# For dark-themed pages, use explicit dark: prefix to mark intent in code
# rather than file-level exclusions.
PATTERN='(?<!dark:)(?<!placeholder:)text-stone-(300|400)(?!.*cursor-not-allowed)'

FOUND=0

for t in "${TARGETS[@]}"; do
  if [ -d "$t" ]; then
    if rg -Pn --hidden --glob '!**/.next/**' --glob '!**/node_modules/**' "$PATTERN" "$t"; then
      FOUND=1
    fi
  fi
done

if [ "$FOUND" -eq 1 ]; then
  echo ""
  echo "❌ Accessibility lint failed:"
  echo "Found disallowed low-contrast classes in community UI."
  echo "Use text-stone-500 (minimum) for labels/captions/meta text."
  exit 1
fi

echo "✅ Community accessibility lint passed."
