#!/bin/bash
# scripts/ios/clean.sh — MAIA iOS Artifact Cleaner
#
# Removes all Xcode and Capacitor build artifacts so the next build
# starts from a known-clean state.
#
# Usage:
#   ./scripts/ios/clean.sh              # Standard clean
#   ./scripts/ios/clean.sh --full       # Also reinstall Pods (slowest, most thorough)
#   ./scripts/ios/clean.sh --dry-run    # Preview what would be deleted, no action taken
#
# Safe to run at any time. Does not touch source files or node_modules.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
IOS_APP="$REPO_ROOT/ios/App"

# ── options ───────────────────────────────────────────────────────────────────
FULL=false
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    --full)    FULL=true ;;
    --dry-run) DRY_RUN=true ;;
  esac
done

# ── colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

log_info()    { echo -e "  ${BLUE}→${NC}  $1"; }
log_success() { echo -e "  ${GREEN}✅${NC} $1"; }
log_warn()    { echo -e "  ${YELLOW}⚠️ ${NC} $1"; }
log_dry()     { echo -e "  ${YELLOW}[dry-run]${NC} would remove: $1"; }

remove() {
  local target="$1"
  if [ ! -e "$target" ]; then
    log_info "Skipping (not found): $target"
    return
  fi
  if $DRY_RUN; then
    log_dry "$target"
  else
    rm -rf "$target"
    log_success "Removed: $target"
  fi
}

echo ""
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo -e "${BOLD}  MAIA iOS Clean${NC}$([ "$FULL" = true ] && echo " (--full)" || true)$([ "$DRY_RUN" = true ] && echo " (dry-run)" || true)"
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo ""

# ── 1. Next.js web export ─────────────────────────────────────────────────────
echo -e "${BOLD}[1] Next.js export${NC}"
remove "$REPO_ROOT/out"
remove "$REPO_ROOT/.next"

# ── 2. Xcode build output ─────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[2] Xcode build output${NC}"
remove "$IOS_APP/build"
remove "$IOS_APP/output"

# ── 3. Xcode DerivedData ──────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[3] DerivedData${NC}"
DERIVED_DATA="$HOME/Library/Developer/Xcode/DerivedData"
if [ -d "$DERIVED_DATA" ]; then
  matches=( "$DERIVED_DATA"/App-* )
  if [ -e "${matches[0]}" ]; then
    for d in "${matches[@]}"; do
      remove "$d"
    done
  else
    log_info "No App-* DerivedData found"
  fi
else
  log_info "DerivedData directory not found"
fi

# ── 4. CocoaPods build cache (optional --full) ────────────────────────────────
echo ""
echo -e "${BOLD}[4] CocoaPods cache${NC}"
if $FULL; then
  remove "$IOS_APP/Pods"
  log_info "Removing Podfile.lock so pods are reinstalled fresh"
  remove "$IOS_APP/Podfile.lock"
  log_warn "You must run 'cd ios/App && pod install' (or let build.sh do it) before building"
else
  log_info "Skipping Pods directory (use --full to also wipe pods)"
fi

# ── 5. Fastlane derived artifacts ─────────────────────────────────────────────
echo ""
echo -e "${BOLD}[5] Fastlane${NC}"
remove "$IOS_APP/fastlane/report.xml"
remove "$IOS_APP/fastlane/Preview.html"
remove "$IOS_APP/fastlane/logs"
remove "$IOS_APP/fastlane/screenshots"

# ── 6. Temp/patch artifacts ───────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[6] Temp artifacts${NC}"
# Route patches should have been reverted, but clean anyway
ROUTE_BACKUP_PATTERN="$REPO_ROOT/app/api/**/*.bak"
if ls $ROUTE_BACKUP_PATTERN 2>/dev/null | head -1 | grep -q '.'; then
  log_warn "Found .bak patch files — revert first: ./scripts/capacitor-patch-routes.sh revert"
else
  log_info "No stale route patch files found"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}══════════════════════════════════════════${NC}"
if $DRY_RUN; then
  echo -e "  ${YELLOW}Dry run complete — no files were deleted${NC}"
else
  echo -e "  ${GREEN}✅ Clean complete${NC}"
  echo -e "  Next step: ${BOLD}./scripts/ios/build.sh${NC}"
fi
echo ""
