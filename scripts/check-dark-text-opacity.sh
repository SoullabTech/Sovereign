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
SCOPED_DIRS="components/settings/ components/account/ app/account/ app/model-studio/ app/studio/ components/studio/ app/library/ app/labtools/"

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

# 2) Catch bare opacity-* used to dim a foreground element, in a class
#    string that also carries a text-* token.
#
#    Single deterministic path (no PCRE). The previous implementation had a
#    `grep -P` primary with a `grep -E` fallback whose filter list disagreed
#    with it on the same input, so this gate's verdict depended on whether
#    the host grep was built with PCRE support: red on GNU grep, green on a
#    grep without -P. A gate that answers differently per host is not
#    truthful on any host. See docs/programme/
#    JARVIS-IDEAS-PREFLIGHT-RESTORATION-01_FIND.md.
#
#    The exemption is exactly the reveal pattern this file documents above,
#    and nothing wider:
#
#      opacity-0 + group-hover:opacity-100   → allowed (hidden until hover)
#      opacity-50 + group-hover:opacity-100  → STILL A VIOLATION
#
#    i.e. the only bare opacity token permitted is `opacity-0`, and only when
#    `group-hover:opacity-100` appears in the same class string. Bare opacity
#    at any other value dims a foreground element that is visible at rest —
#    the footgun this guard exists to prohibit — regardless of what hover
#    state accompanies it. Variant-prefixed opacity (`disabled:`, `hover:`,
#    `group-hover:`, `focus:`, `active:`, `data-[...]:`) and `bg-opacity-*`
#    are not bare and are never flagged.
HITS=$(echo "${FILES}" | xargs awk '
function scan(inner,   n, toks, i, t, hasText, bareOther, bareZero, hasReveal) {
  n = split(inner, toks, /[ \t]+/)
  hasText = 0; bareOther = 0; bareZero = 0; hasReveal = 0
  for (i = 1; i <= n; i++) {
    t = toks[i]
    if (t ~ /^text-/ && t !~ /^text-opacity-/) { hasText = 1 }
    else if (t ~ /^opacity-[0-9]+$/) {
      if (t == "opacity-0") { bareZero++ } else { bareOther++ }
    }
    else if (t == "group-hover:opacity-100") { hasReveal = 1 }
  }
  if (!hasText) return 0
  if (bareOther > 0) return 1
  if (bareZero > 0 && !hasReveal) return 1
  return 0
}
{
  rest = $0
  re = "class(Name)?=\"[^\"]*"
  while (match(rest, re)) {
    seg = substr(rest, RSTART, RLENGTH)
    rest = substr(rest, RSTART + RLENGTH)
    p = index(seg, "=\"")
    inner = substr(seg, p + 2)
    if (scan(inner)) { print FILENAME ":" FNR ":" $0; next }
  }
}
' 2>/dev/null || true)
if [ -n "${HITS}" ]; then
  echo ""
  echo "❌ Found bare 'opacity-*' combined with 'text-*' in a class string:"
  echo "${HITS}"
  echo ""
  echo "   Replace opacity-based text dimming with explicit text color tokens."
  echo "   e.g. 'text-sm opacity-70' → 'text-sm text-stone-400'"
  echo "   Reveal-on-hover controls: use 'opacity-0 group-hover:opacity-100'."
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
