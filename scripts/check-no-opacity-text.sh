#!/usr/bin/env bash
# check-no-opacity-text.sh
#
# Guard against using opacity-* classes for text on dark panels.
# These are invisible on dark backgrounds. Use explicit text-stone-* colors instead.
#
# Scans settings components where this pattern has caused regressions.

set -euo pipefail

DIRS=(
  "components/settings"
  "components/account"
)

VIOLATIONS=0

for dir in "${DIRS[@]}"; do
  if [ ! -d "$dir" ]; then continue; fi

  # Match className strings containing opacity-{number} that are on text elements
  # (i.e. not bg-white/5 or border opacity, but standalone opacity-50, opacity-70 etc.)
  while IFS= read -r match; do
    if [ -n "$match" ]; then
      echo "  $match"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  done < <(grep -rn --include='*.tsx' --include='*.ts' \
    'className=.*\bopacity-[0-9]' "$dir" 2>/dev/null \
    | grep -v 'disabled:opacity' \
    | grep -v 'bg-.*opacity' \
    | grep -v 'border-.*opacity' \
    | grep -v '// opacity ok' || true)
done

if [ "$VIOLATIONS" -gt 0 ]; then
  echo ""
  echo "Found $VIOLATIONS opacity-* text violation(s) in settings panels."
  echo "Use explicit text-stone-* colors instead of opacity-* on dark backgrounds."
  echo "Add '// opacity ok' comment to suppress if intentional (e.g. disabled states)."
  exit 1
fi

echo "No opacity text violations found in settings panels."
exit 0
