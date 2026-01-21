#!/usr/bin/env bash
set -euo pipefail

# PHI Guardrails — fail CI if forbidden patterns are introduced.
# Keep this intentionally simple + grep-based: fast, loud, effective.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Only scan tracked files (avoids node_modules, build output, etc.)
FILES="$(cd "$ROOT" && git ls-files \
  'app/**/*.ts' 'app/**/*.tsx' \
  'lib/**/*.ts' 'lib/**/*.tsx' \
  'scripts/**/*.ts' \
  'database/migrations/**/*.sql' \
  2>/dev/null || true
)"

fail() {
  echo ""
  echo "❌ PHI guardrail failed:"
  echo "   $1"
  echo ""
  exit 1
}

warn() {
  echo "⚠️  PHI guardrail warning: $1"
}

# Check if rg (ripgrep) is available
if ! command -v rg &> /dev/null; then
  echo "Note: ripgrep not found, skipping PHI guardrails (install rg for full checks)"
  echo "✅ PHI guardrails: skipped (rg not available)"
  exit 0
fi

# 1) Check for PHI field VALUES being logged (not just field names)
# Look for patterns like: console.log(...${client_name}...) or log("...", client_name)
while IFS= read -r f; do
  [ -z "$f" ] && continue
  [ ! -f "$ROOT/$f" ] && continue
  
  # Pattern: logging with interpolated PHI variable
  # e.g., console.log(`... ${client_name} ...`) or console.log("...", client_name)
  if rg -n 'console\.log.*\$\{(client_name|preferred_name|client_email|client_phone|newName)\}' "$ROOT/$f" 2>/dev/null; then
    echo "PHI value logged in: $f"
    fail "File logs PHI field value via interpolation. Remove the value from logs."
  fi
  
  # Pattern: logging PHI as a separate argument
  if rg -n 'console\.log\([^)]*,\s*(client_name|preferred_name|client_email|client_phone|row\.name|row\.email)\s*[,)]' "$ROOT/$f" 2>/dev/null; then
    echo "PHI value logged in: $f"
    fail "File logs PHI field value as argument. Remove the value from logs."
  fi
done < <(printf "%s\n" $FILES)

# 2) Prevent "decrypt failure → plaintext fallback" in production paths
while IFS= read -r f; do
  [ -z "$f" ] && continue
  [ ! -f "$ROOT/$f" ] && continue
  
  case "$f" in
    scripts/backfill-*|scripts/**/backfill-*|scripts/**/migrate-*|scripts/guards/*) continue ;;
  esac

  # Look for catch blocks that fall back to plaintext name fields
  if rg -n 'catch.*\|\|.*\.name\b|\.catch\(\).*row\.name' "$ROOT/$f" 2>/dev/null; then
    echo "Suspicious decrypt fallback in: $f"
    warn "Potential decrypt-failure plaintext fallback detected. Review: $f"
  fi
done < <(printf "%s\n" $FILES)

# 3) SQL guardrail: warn on new plaintext PHI columns without _enc suffix
if [ -d "$ROOT/database/migrations" ]; then
  SUSPICIOUS=$(rg -l 'ADD COLUMN\s+(client_name|preferred_name|client_email|client_phone)\s+(VARCHAR|TEXT)' "$ROOT/database/migrations" 2>/dev/null | grep -v '_enc' || true)
  if [ -n "$SUSPICIOUS" ]; then
    warn "Migration may add plaintext PHI column. Confirm _enc columns exist:"
    echo "$SUSPICIOUS"
  fi
fi

echo "✅ PHI guardrails: OK"
