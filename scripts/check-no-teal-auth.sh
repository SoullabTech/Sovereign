#!/usr/bin/env bash
# ============================================================================
# check-no-teal-auth.sh — Prevent teal/sage palette regression in auth paths
#
# Auth pages use the maia.navy/spice/ink design system (AuthLayout).
# This script blocks any teal, sage-hex, or old palette references
# from creeping back into auth-related files.
#
# Runs in pre-commit hook and preflight.
# ============================================================================
set -euo pipefail

AUTH_PATHS=(
  "app/signin/"
  "app/welcome-back/"
  "app/test-elemental/"
  "app/magic-link/"
  "app/magic-link-error/"
  "app/magic-link-success/"
  "components/auth/"
  "components/onboarding/SacredSoulInduction"
)

# Patterns that must never appear in auth paths
BLOCKED_PATTERNS=(
  '#A0C4C7'
  '#7FB5B3'
  '#0d9488'
  'text-teal-'
  'bg-teal-'
  'border-teal-'
  'ring-teal-'
  'from-teal-'
  'to-teal-'
  'text-emerald-'
  'bg-emerald-'
  'border-emerald-'
  'maia-sage'
  'maia\.sage'
)

VIOLATIONS=0

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  for auth_path in "${AUTH_PATHS[@]}"; do
    if [ -d "$auth_path" ] || ls ${auth_path}* 1>/dev/null 2>&1; then
      # Search for pattern, excluding .DISABLED files and node_modules
      matches=$(grep -rn "$pattern" ${auth_path}* 2>/dev/null \
        | grep -v '\.DISABLED' \
        | grep -v 'node_modules' \
        | grep -v '\.test\.' \
        || true)
      if [ -n "$matches" ]; then
        if [ $VIOLATIONS -eq 0 ]; then
          echo ""
          echo "❌ AUTH PALETTE VIOLATION — teal/sage found in auth paths"
          echo "   Auth pages must use maia.navy / maia.spice / maia.ink tokens only."
          echo "   See: components/auth/AuthLayout.tsx"
          echo ""
        fi
        echo "$matches"
        VIOLATIONS=$((VIOLATIONS + 1))
      fi
    fi
  done
done

if [ $VIOLATIONS -gt 0 ]; then
  echo ""
  echo "🔧 Fix: Replace teal/sage references with maia tokens:"
  echo "   bg-teal-*     → bg-maia-navy-* or bg-maia-spice-*"
  echo "   text-teal-*   → text-maia-ink-* or text-maia-spice-*"
  echo "   #A0C4C7       → from-maia-navy-950"
  echo "   #7FB5B3       → to-maia-navy-800"
  echo ""
  exit 1
fi

echo "✅ Auth palette check: clean (no teal/sage in auth paths)"
exit 0
