#!/bin/bash
# scripts/ios/build.sh — MAIA iOS Deterministic Build Pipeline
#
# Runs the full pipeline from web export to IPA in a single deterministic command.
# All steps are explicit and validated. On any failure the script exits non-zero
# with a clear error pointing to the failed step.
#
# Pipeline:
#   1. Patch dynamic routes for static export
#   2. Build Next.js (CAPACITOR_BUILD=1)
#   3. Validate web export (out/ directory)
#   4. Patch root index.html → /enter redirect
#   5. Revert route patches
#   6. Capacitor sync (cap sync ios)
#   7. CocoaPods install (if needed)
#   8. Bump build number (increment CFBundleVersion in Info.plist by 1)
#   9. Archive (xcodebuild)
#  10. Export IPA (xcodebuild -exportArchive)
#
# Output:
#   ios/App/build/App.xcarchive
#   ios/App/build/MAIA.ipa
#
# Usage:
#   ./scripts/ios/build.sh
#   ./scripts/ios/build.sh --skip-web     # Reuse existing out/ (saves ~3 min)
#   ./scripts/ios/build.sh --skip-bump    # Keep current CFBundleVersion
#   ./scripts/ios/build.sh --skip-clean   # Don't pre-clean build dir
#
# Requirements:
#   Run ./scripts/ios/doctor.sh first to verify environment.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
IOS_APP="$REPO_ROOT/ios/App"
BUILD_DIR="$IOS_APP/build"
OUT_DIR="$REPO_ROOT/out"
INFO_PLIST="$IOS_APP/App/Info.plist"
EXPORT_OPTIONS="$IOS_APP/exportOptions.plist"

# UTF-8 required for CocoaPods (Ruby 3.4 + macOS locale quirk)
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# ── options ───────────────────────────────────────────────────────────────────
SKIP_WEB=false
SKIP_BUMP=false
SKIP_CLEAN=false

for arg in "$@"; do
  case "$arg" in
    --skip-web)   SKIP_WEB=true ;;
    --skip-bump)  SKIP_BUMP=true ;;
    --skip-clean) SKIP_CLEAN=true ;;
  esac
done

# ── colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

STEP=0

step() {
  STEP=$((STEP+1))
  echo ""
  echo -e "${BOLD}[Step $STEP] $1${NC}"
}
ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
fail() { echo -e "  ${RED}❌ FAILED: $1${NC}"; exit 1; }
info() { echo -e "  ${BLUE}→${NC}  $1"; }
warn() { echo -e "  ${YELLOW}⚠️ ${NC} $1"; }
skip() { echo -e "  ${YELLOW}⏭  Skipping: $1${NC}"; }

# ── start ─────────────────────────────────────────────────────────────────────
BUILD_START=$(date +%s)

echo ""
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo -e "${BOLD}  MAIA iOS Build${NC}"
echo -e "${BOLD}══════════════════════════════════════════${NC}"
info "Repo root : $REPO_ROOT"
info "Build dir : $BUILD_DIR"

# ── Step 1: Clean ─────────────────────────────────────────────────────────────
step "Pre-clean build directory"
if $SKIP_CLEAN; then
  skip "Pre-clean (--skip-clean)"
else
  # Remove stale build dir — Capacitor's pod install runs xcodebuild clean
  # which fails if build/ exists without the CreatedByBuildSystem xattr.
  rm -rf "$BUILD_DIR"
  ok "Removed stale build/ directory"
fi

# ── Step 2: Web export ────────────────────────────────────────────────────────
step "Next.js static export"

if $SKIP_WEB; then
  if [ -d "$OUT_DIR" ] && [ -n "$(ls -A "$OUT_DIR")" ]; then
    skip "Web build (--skip-web) — reusing existing out/"
    ok "out/ exists"
  else
    fail "out/ is missing or empty — cannot skip web build"
  fi
else
  info "Patching dynamic routes for static export (MOBILE_MODE=1)..."
  export MOBILE_MODE=1
  "$REPO_ROOT/scripts/capacitor-patch-routes.sh" patch

  # Ensure patches are reverted even on failure
  trap '"$REPO_ROOT/scripts/capacitor-patch-routes.sh" revert 2>/dev/null || true' EXIT

  info "Building (CAPACITOR_BUILD=1)..."
  cd "$REPO_ROOT"
  CAPACITOR_BUILD=1 MAIA_AUDIT_FINGERPRINT_SECRET=build-placeholder npm run build

  if [ ! -d "$OUT_DIR" ] || [ -z "$(ls -A "$OUT_DIR")" ]; then
    fail "out/ is missing or empty after npm run build"
  fi
  ok "Web export produced: $OUT_DIR"
fi

# ── Step 3: Embed maia.html directly as index.html ────────────────────────────
# The old /enter redirect stub is a structural loop under Capacitor's router:
# CapacitorRouter.route(for:) maps ANY extensionless path (including /enter)
# back to index.html, so the stub reloads itself forever (white screen).
# This is the same fix already governed in scripts/build-ios.sh (542b43a2f)
# and scripts/deploy-testflight.sh (256513b65): index.html IS the maia page —
# no document navigation occurs, and history.replaceState('/maia') runs
# synchronously before React hydrates so the router sees the right pathname.
step "Embed maia.html directly as index.html"

cd "$REPO_ROOT"
python3 - << 'PYEOF'
import sys, os

src = 'out/maia.html'
dst = 'out/index.html'

if not os.path.exists(src):
    print('  WARNING: out/maia.html not found — keeping build default index.html')
    sys.exit(0)

content = open(src, encoding='utf-8').read()

# Synchronous URL fixup: before React hydrates, set pathname to /maia.
fix = '<script>if(location.pathname==="/")history.replaceState(null,"","/maia");</script>'

patched = content.replace('<head>', '<head>' + fix, 1)
open(dst, 'w', encoding='utf-8').write(patched)
print(f'  OK index.html <- maia.html + URL fixup ({len(patched)} bytes)')
PYEOF

# Defensive URL fixups for key navigation pages (mirrors scripts/build-ios.sh)
python3 - << 'PYEOF'
import os

pages = ['maia', 'begin', 'signin', 'welcome-back', 'enter', 'onboarding', 'faq']
for page in pages:
    path = f'out/{page}.html'
    if not os.path.exists(path):
        continue
    content = open(path, encoding='utf-8').read()
    fix = f'<script>if(location.pathname==="/{page}.html")history.replaceState(null,"",\"/{page}\");</script>'
    if fix in content:
        continue
    open(path, 'w', encoding='utf-8').write(content.replace('<head>', '<head>' + fix, 1))
    print(f'  OK   {path} + URL fixup')
PYEOF

# Guard: index.html must be the maia embed, not a stale stub (white-screen trap)
INDEX_SIZE=$(wc -c < "$OUT_DIR/index.html" 2>/dev/null | tr -d ' ')
if [ "${INDEX_SIZE:-0}" -lt 5000 ]; then
  fail "out/index.html is too small (${INDEX_SIZE} bytes) — maia.html embed failed (expected ~30,000+)"
fi
ok "index.html verified (${INDEX_SIZE} bytes — maia.html embed)"

# ── Step 4: Revert route patches ──────────────────────────────────────────────
step "Revert dynamic route patches"
if ! $SKIP_WEB; then
  "$REPO_ROOT/scripts/capacitor-patch-routes.sh" revert
  trap - EXIT
  ok "Route patches reverted"
else
  info "No patches to revert (web was skipped)"
fi

# ── Step 5: Capacitor sync ────────────────────────────────────────────────────
step "Capacitor sync (cap sync ios)"
cd "$REPO_ROOT"

# Mark build dir as Xcode-owned BEFORE cap sync so pod install's
# xcodebuild clean doesn't fail looking for CreatedByBuildSystem xattr.
mkdir -p "$BUILD_DIR"
xattr -w com.apple.xcode.CreatedByBuildSystem true "$BUILD_DIR"

LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 CAPACITOR_BUILD=1 npx cap sync ios
ok "Capacitor sync complete"

# ── Step 6: CocoaPods install ─────────────────────────────────────────────────
step "CocoaPods install"
cd "$IOS_APP"

if [ -f "Podfile.lock" ]; then
  info "Podfile.lock present — running pod install (integrates existing lock)"
else
  warn "Podfile.lock missing — running pod install from scratch (this takes a while)"
fi

LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install
ok "CocoaPods install complete"
cd "$REPO_ROOT"

# ── Step 7: Bump build number ─────────────────────────────────────────────────
step "Bump build number"

if $SKIP_BUMP; then
  current_build=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$INFO_PLIST" 2>/dev/null || echo "unknown")
  skip "Bump (--skip-bump) — current build: $current_build"
else
  current_build=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$INFO_PLIST" 2>/dev/null | tr -d '[:space:]')
  new_build=$((current_build + 1))
  /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $new_build" "$INFO_PLIST"
  marketing=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$INFO_PLIST" 2>/dev/null || echo "unknown")
  ok "CFBundleVersion → $new_build  (was: $current_build, marketing version: $marketing)"
fi

# ── Step 8: Archive ───────────────────────────────────────────────────────────
step "Archive (xcodebuild Release)"
cd "$IOS_APP"

ARCHIVE_PATH="$BUILD_DIR/App.xcarchive"
info "Archive path: $ARCHIVE_PATH"

xcodebuild archive \
  -workspace App.xcworkspace \
  -scheme "App" \
  -configuration "Release" \
  -archivePath "$ARCHIVE_PATH" \
  -allowProvisioningUpdates \
  CODE_SIGN_STYLE=Automatic \
  -quiet

if [ ! -d "$ARCHIVE_PATH" ]; then
  fail "Archive not found at $ARCHIVE_PATH"
fi
ok "Archive created: $ARCHIVE_PATH"

# ── Step 9: Export IPA ────────────────────────────────────────────────────────
step "Export IPA"
IPA_PATH="$BUILD_DIR/MAIA.ipa"

xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$BUILD_DIR" \
  -exportOptionsPlist "$EXPORT_OPTIONS" \
  -allowProvisioningUpdates \
  2>&1 | grep -E "(EXPORT|Progress|Upload|error:|warning:)" || true

# xcodebuild names the IPA after the scheme ("App.ipa").
# Rename to MAIA.ipa for consistent upload path.
SCHEME_IPA="$BUILD_DIR/App.ipa"
if [ -f "$SCHEME_IPA" ] && [ ! -f "$IPA_PATH" ]; then
  mv "$SCHEME_IPA" "$IPA_PATH"
  ok "IPA renamed: App.ipa → MAIA.ipa"
fi

if [ ! -f "$IPA_PATH" ]; then
  fail "IPA not found at $IPA_PATH (also checked $SCHEME_IPA)"
fi
ok "IPA exported: $IPA_PATH"

# ── Summary ───────────────────────────────────────────────────────────────────
BUILD_END=$(date +%s)
ELAPSED=$(( BUILD_END - BUILD_START ))
MINUTES=$(( ELAPSED / 60 ))
SECONDS=$(( ELAPSED % 60 ))

cd "$REPO_ROOT"
BUILD_NUM=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$INFO_PLIST" 2>/dev/null || echo "unknown")

echo ""
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  BUILD COMPLETE${NC}"
echo -e "  Build     : ${BOLD}$BUILD_NUM${NC}"
echo -e "  Archive   : $ARCHIVE_PATH"
echo -e "  IPA       : $IPA_PATH"
echo -e "  Duration  : ${MINUTES}m ${SECONDS}s"
echo ""
echo -e "  Next step : ${BOLD}./scripts/ios/upload.sh${NC}"
echo -e "${BOLD}══════════════════════════════════════════${NC}"
echo ""
