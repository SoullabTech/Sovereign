#!/usr/bin/env bash
set -euo pipefail

#
# DARK TEXT OPACITY GUARD
#
# Prevents "invisible text on dark panels" regressions in settings UI.
# Catches bare opacity-* used for text dimming (the footgun that makes
# text unreadable on dark gradients).
#
# What this DOES catch:
#   - className="text-sm opacity-70"       (bare opacity dims text)
#   - className="text-xs opacity-50 px-1"  (same pattern)
#   - text-opacity-* anywhere              (Tailwind text-opacity utility)
#
# What this does NOT catch (intentionally allowed):
#   - disabled:opacity-50   (button disabled state — fine)
#   - hover:opacity-*       (hover effects — fine)
#   - group-hover:opacity-* (group hover — fine)
#   - bg-opacity-*          (background opacity — fine)
#   - data-[state=*]:opacity-* (Radix/shadcn state variants — fine)
#   - opacity-0 group-hover:opacity-100  (tooltip pattern — fine)
#
# Fix: use explicit text-stone-*/text-amber-*/etc. tokens instead.
#
# @see CLAUDE.md — Voice settings contrast fix (2026-02)
#

echo "🔍 Checking for dark-text opacity footguns..."

# Scoped paths: only check UI surfaces with dark panels
SCOPED_DIRS="components/settings/ components/account/ app/account/"

# In pre-commit context, scan only staged files in scoped dirs
if [ "${GIT_PRE_COMMIT:-0}" = "1" ]; then
  FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(tsx?|mdx)$' | grep -E "$(echo ${SCOPED_DIRS} | tr ' ' '|')" || true)
else
  FILES=$(git ls-files | grep -E '\.(tsx?|mdx)$' | grep -E "$(echo ${SCOPED_DIRS} | tr ' ' '|')" || true)
fi

if [ -z "${FILES}" ]; then
  echo "✅ No scoped files to check."
  exit 0
fi

FAILED=0

# 1) Hard ban: text-opacity-* (Tailwind utility that dims text via opacity)
HITS=$(echo "${FILES}" | xargs grep -nE 'text-opacity-[0-9]+' 2>/dev/null || true)
if [ -n "${HITS}" ]; then
  echo ""
  echo "❌ Found 'text-opacity-*' — use explicit text color tokens instead:"
  echo "${HITS}"
  FAILED=1
fi

# 2) Catch bare opacity-* (not prefixed with disabled:/hover:/group-hover:/bg-)
#    used alongside text-* in the same class string.
#    The negative lookbehind excludes variant-prefixed opacity which is intentional.
HITS=$(echo "${FILES}" | xargs grep -nP 'class(?:Name)?="[^"]*text-(?!opacity)[a-zA-Z0-9/:-]+[^"]*(?<![a-z]:)\bopacity-[0-9]+' 2>/dev/null || true)
# Fallback: filter out known-safe patterns if perl regex not available
if [ -z "${HITS}" ]; then
  HITS=$(echo "${FILES}" | xargs grep -nE 'class(Name)?="[^"]*text-[a-zA-Z0-9/:-]+[^"]*\bopacity-[0-9]+' 2>/dev/null | grep -vE 'disabled:opacity|hover:opacity|group-hover:opacity|focus:opacity|active:opacity|bg-opacity|bg-black bg-opacity|data-\[' || true)
fi
if [ -n "${HITS}" ]; then
  echo ""
  echo "❌ Found bare 'opacity-*' combined with 'text-*' in a class string:"
  echo "${HITS}"
  echo ""
  echo "   Replace opacity-based text dimming with explicit text color tokens."
  echo "   e.g. 'text-sm opacity-70' → 'text-sm text-stone-400'"
  FAILED=1
fi

if [ "${FAILED}" = "1" ]; then
  echo ""
  echo "📋 Fix: replace opacity-based text with explicit tokens:"
  echo "   Primary labels:   text-stone-200"
  echo "   Secondary values:  text-stone-400"
  echo "   Muted/endpoints:  text-stone-500"
  echo "   Page titles:      text-stone-100"
  echo ""
  exit 1
fi

echo "✅ No dark-text opacity footguns found."
exit 0
