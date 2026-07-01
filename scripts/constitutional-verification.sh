#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Constitutional Verification — Release Gate
#
# Runs all constitutional verifiers in sequence and produces a unified
# release report. A release is not ready until this passes.
#
# Usage (from minisforum, inside the running container):
#   docker exec maia-sovereign sh -c \
#     'DATABASE_URL="$DATABASE_URL" bash scripts/constitutional-verification.sh'
#
# Usage (local, against a DATABASE_URL):
#   DATABASE_URL=postgres://... bash scripts/constitutional-verification.sh
#
# Exit code:
#   0 — all verifiers passed (warnings are noted but do not block)
#   1 — one or more verifiers failed
#
# Philosophy:
#   The constitution exists in prose in docs/canon/.
#   This script is its executable expression.
#   Every deployment demonstrates that the platform still honors its principles.
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║         Constitutional Verification — Release Gate           ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BLUE}Platform:${NC}  MAIA-SOVEREIGN"
echo -e "  ${BLUE}Date:${NC}      $(date -u '+%Y-%m-%d %H:%M UTC')"
if [ -n "${GIT_COMMIT:-}" ]; then
  echo -e "  ${BLUE}Commit:${NC}    $GIT_COMMIT"
elif git rev-parse --short HEAD >/dev/null 2>&1; then
  echo -e "  ${BLUE}Commit:${NC}    $(git rev-parse --short HEAD)"
fi
echo ""

# ── Verifier registry ─────────────────────────────────────────────────────────
# Each entry: "script_path|display_name|required"
# required=true  → failure blocks release
# required=false → failure is a warning (subsystem not yet wired)

declare -a VERIFIERS=(
  "scripts/verify-constitution-colab.ts|Co-Lab Boundaries|true"
  "scripts/verify-constitution-memory.ts|Memory|true"
  "scripts/verify-constitution-relationships.ts|Relationships|true"
  "scripts/verify-constitution-development.ts|Development|false"
  "scripts/verify-constitution-maia.ts|MAIA|false"
)

overall_passed=true
declare -a results=()

run_verifier() {
  local script="$1"
  local name="$2"
  local required="$3"

  if [ ! -f "$SCRIPT_DIR/../$script" ] && [ ! -f "$script" ]; then
    results+=("SKIP|$name|script not found")
    echo -e "  ${YELLOW}SKIP${NC}  $name  (script not found)"
    return
  fi

  local script_path
  if [ -f "$SCRIPT_DIR/../$script" ]; then
    script_path="$SCRIPT_DIR/../$script"
  else
    script_path="$script"
  fi

  echo -e "\n${BOLD}── $name $( printf '─%.0s' $(seq 1 $((58 - ${#name}))) )${NC}"

  local output exit_code
  output=$(DATABASE_URL="${DATABASE_URL:-}" npx tsx "$script_path" 2>&1) || exit_code=$?
  exit_code=${exit_code:-0}

  echo "$output"

  # Extract summary line
  local summary
  summary=$(echo "$output" | grep -E "passed.*failed.*warned" | tail -1 | sed 's/.*║\s*//' | sed 's/\s*║.*//' | xargs || echo "")

  if [ $exit_code -eq 0 ]; then
    results+=("PASS|$name|$summary")
  else
    if [ "$required" = "true" ]; then
      results+=("FAIL|$name|$summary")
      overall_passed=false
    else
      results+=("WARN|$name|$summary — not required (subsystem pending)")
    fi
  fi
}

# ── Run all verifiers ─────────────────────────────────────────────────────────

for entry in "${VERIFIERS[@]}"; do
  IFS='|' read -r script name required <<< "$entry"
  run_verifier "$script" "$name" "$required"
done

# ── Summary report ────────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║         Constitutional Verification — Release Report         ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

for result in "${results[@]}"; do
  IFS='|' read -r status name detail <<< "$result"
  case "$status" in
    PASS) echo -e "  ${GREEN}✅ PASS${NC}  $name  ${BLUE}($detail)${NC}" ;;
    FAIL) echo -e "  ${RED}❌ FAIL${NC}  $name  → $detail" ;;
    WARN) echo -e "  ${YELLOW}⚠️  WARN${NC}  $name  ($detail)" ;;
    SKIP) echo -e "  ${YELLOW}⏭  SKIP${NC}  $name  ($detail)" ;;
  esac
done

echo ""

if $overall_passed; then
  echo -e "  ${GREEN}${BOLD}Release gate: PASSED${NC}"
  echo -e "  ${GREEN}The platform's constitutional invariants hold.${NC}"
  echo -e "  ${GREEN}This release is ready to proceed.${NC}"
else
  echo -e "  ${RED}${BOLD}Release gate: FAILED${NC}"
  echo -e "  ${RED}One or more required constitutional invariants are violated.${NC}"
  echo -e "  ${RED}Do not invite testers or send this release until failures are resolved.${NC}"
fi

echo ""
echo -e "  ${BLUE}Principle:${NC} A release is not ready because the UI looks correct."
echo -e "  ${BLUE}           ${NC} It is ready when the platform proves it still honors its constitution."
echo ""

if ! $overall_passed; then
  exit 1
fi
