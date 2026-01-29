#!/bin/bash

# iOS Static Build Script
# Handles all the workarounds needed for Next.js static export with Capacitor
#
# Usage:
#   ./scripts/build-ios-static.sh        # Full build + sync
#   ./scripts/build-ios-static.sh build  # Build only (no sync)
#   ./scripts/build-ios-static.sh sync   # Sync only (requires prior build)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[BUILD]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }

cleanup() {
    log_info "Reverting patches..."
    ./scripts/capacitor-patch-routes.sh revert 2>/dev/null || true
}

do_build() {
    trap cleanup EXIT

    log_step "=== iOS Static Build ==="

    # Step 1: Clean
    log_info "Cleaning build directories..."
    rm -rf .next out

    # Step 2: Apply patches
    log_info "Applying patches (moving app/api, middleware, pages)..."
    CAPACITOR_BUILD=1 ./scripts/capacitor-patch-routes.sh patch

    # Step 3: Run Next.js build with static export
    log_info "Running Next.js build with static export..."
    CAPACITOR_BUILD=1 NODE_OPTIONS="--max-old-space-size=8192" npx next build

    # Step 4: Check if build succeeded
    if [ -d "out" ]; then
        log_info "✅ Static export successful!"
        local page_count=$(find out -name "*.html" | wc -l | tr -d ' ')
        log_info "Generated $page_count HTML pages"
    else
        log_error "❌ Static export failed - no 'out' directory created"
        exit 1
    fi

    # Cleanup is handled by trap
}

do_sync() {
    if [ ! -d "out" ]; then
        log_error "No 'out' directory found. Run build first."
        exit 1
    fi

    log_step "=== Syncing to iOS ==="

    # Copy assets to iOS
    log_info "Copying web assets to iOS..."
    npx cap copy ios

    # Verify
    if [ -f "ios/App/App/public/index.html" ] || [ -f "ios/App/App/public/maia.html" ]; then
        log_info "✅ iOS sync successful!"
        log_info "Open Xcode: npx cap open ios"
    else
        log_error "❌ iOS sync may have failed"
        exit 1
    fi
}

# Main
case "${1:-}" in
    build)
        do_build
        ;;
    sync)
        do_sync
        ;;
    *)
        # Default: full build + sync
        do_build
        do_sync
        log_step "=== iOS Build Complete ==="
        log_info "Next steps:"
        log_info "  1. Open Xcode: npx cap open ios"
        log_info "  2. Archive: Product > Archive"
        log_info "  3. Upload to TestFlight"
        ;;
esac
