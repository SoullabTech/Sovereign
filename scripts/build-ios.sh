#!/bin/bash

# MAIA-SOVEREIGN iOS Build Script
# Builds and packages the iOS application

set -e

# CocoaPods requires UTF-8 locale; Ruby's unicode_normalize crashes without it
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

echo "🍎 MAIA-SOVEREIGN iOS Build Pipeline"
echo "====================================="

# Build type (debug or release)
BUILD_TYPE=${1:-release}
SCHEME="App"
CONFIGURATION="Release"

if [ "$BUILD_TYPE" == "debug" ]; then
    CONFIGURATION="Debug"
fi

# ─── Preflight checks ─────────────────────────────────────────────────────────
# Run before any patching so failures are fast and safe.

preflight_check() {
    # Guard 1: Stale patch backup
    # Any .capacitor-*-backup directory means a previous patch was never reverted.
    # Proceeding would silently delete the live backup and lose route trees.
    local stale=()
    for b in \
        ".capacitor-api-backup" \
        ".capacitor-mobile-excluded-backup" \
        ".capacitor-pages-backup" \
        ".capacitor-dynamic-pages-backup" \
        ".capacitor-og-backup" \
        ".capacitor-patched-pages-backup"
    do
        [ -d "$b" ] && stale+=("$b")
    done
    if [ ${#stale[@]} -gt 0 ]; then
        echo ""
        echo "❌  Stale patch backup detected — repo is still in a patched state:"
        for b in "${stale[@]}"; do echo "      $b"; done
        echo ""
        echo "    Run:  ./scripts/capacitor-patch-routes.sh revert"
        echo "    Then: npm run ios:build"
        echo ""
        exit 1
    fi

    # Guard 2: Dirty working tree
    # Unintentional build-time changes make builds non-reproducible.
    # Override with:  ALLOW_DIRTY=1 npm run ios:build
    local dirty_ok="${ALLOW_DIRTY:-0}"
    if [ "$dirty_ok" != "1" ]; then
        # Exclude Info.plist from the dirty check: build pipelines (fastlane bump_build,
        # scripts/ios/build.sh Step 7) intentionally modify it and don't commit every bump.
        # Everything else must be clean.
        local dirty
        dirty=$( { git diff --name-only 2>/dev/null; git diff --cached --name-only 2>/dev/null; } \
                 | grep -v '^ios/App/App/Info\.plist$' || true )
        if [ -n "$dirty" ]; then
            echo ""
            echo "❌  Working tree has uncommitted changes:"
            echo ""
            git status --short 2>/dev/null | grep -v "ios/App/App/Info.plist" | head -20
            echo ""
            echo "    Commit or stash before building."
            echo "    To override:  ALLOW_DIRTY=1 npm run ios:build"
            echo ""
            exit 1
        fi
    else
        echo "⚠️  ALLOW_DIRTY=1 — building with uncommitted changes"
    fi
}

preflight_check

echo "📱 Building iOS app (${CONFIGURATION} mode)..."

# Patch force-dynamic routes for static export
echo "🔧 Patching routes for static export..."
./scripts/capacitor-patch-routes.sh patch

# Ensure routes are reverted even if build fails
trap './scripts/capacitor-patch-routes.sh revert' EXIT

# Build web content first (required for Capacitor)
echo "🌐 Building Next.js web content..."
CAPACITOR_BUILD=1 NODE_OPTIONS=--max-old-space-size=4096 npm run build

# Verify out directory exists
if [ ! -d "out" ]; then
    echo "❌ Web build failed - out/ directory not created!"
    exit 1
fi

# ─── iOS entry point: embed maia.html directly as index.html ──────────────────
#
# WHY NOT meta-refresh or JS redirect to /enter:
#   - meta-refresh navigates the WKWebView document → Safari Inspector
#     disconnects (losing all console output for debugging)
#   - /enter's router.replace('/maia') stalls: CapacitorHttp intercepts
#     the Next.js RSC payload fetch and the router hangs waiting for RSC JSON
#
# WHY DIRECT EMBED of maia.html:
#   - index.html IS the maia page — no navigation of any kind occurs
#   - history.replaceState('/maia') runs synchronously before React hydrates
#     so React sees pathname=/maia and hydrates the static HTML correctly
#   - MobileRouteGuard allows /maia immediately (non-Studio route)
#   - maia page reads localStorage:
#       Returning user (beta_user set) → loads normally, no redirect needed
#       Fresh install / sign-out → router.replace('/begin' or '/signin')
#         served via CapacitorHttp which passes RSC payloads to the router
#
echo "📄 Patching index.html ← maia.html direct embed (no document navigation)..."
python3 - << 'PYEOF'
import sys, os

src = 'out/maia.html'
dst = 'out/index.html'

if not os.path.exists(src):
    print('  WARNING: out/maia.html not found — keeping build default index.html')
    sys.exit(0)

content = open(src, encoding='utf-8').read()

# Synchronous URL fixup: before React hydrates, set pathname to /maia.
# React's router then sees /maia and hydrates the static HTML correctly.
fix = '<script>if(location.pathname==="/")history.replaceState(null,"","/maia");</script>'

patched = content.replace('<head>', '<head>' + fix, 1)
open(dst, 'w', encoding='utf-8').write(patched)
print(f'  OK index.html <- maia.html + URL fixup ({len(patched)} bytes)')
PYEOF

# ─── URL fixup for key navigation destination pages ────────────────────────────
# Capacitor maps /page → page.html internally but keeps the URL as /page.
# These fixups are defensive: they correct the URL if .html ever surfaces
# (e.g. direct link from another page, stale cache, or future runtime change).
echo "📄 Adding URL fixup scripts to key navigation pages..."
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
        print(f'  SKIP {path} (already patched)')
        continue
    open(path, 'w', encoding='utf-8').write(content.replace('<head>', '<head>' + fix, 1))
    print(f'  OK   {path} + URL fixup')
PYEOF

# Revert patches after successful build
./scripts/capacitor-patch-routes.sh revert
trap - EXIT

# Guard: Verify index.html is the maia embed, not a stale redirect stub.
# If the Python patching step failed silently, this stops the build before
# a broken index.html gets synced to iOS (which would produce a white screen).
INDEX_SIZE=$(wc -c < out/index.html 2>/dev/null | tr -d ' ')
if [ "${INDEX_SIZE:-0}" -lt 5000 ]; then
    echo ""
    echo "❌  out/index.html is too small (${INDEX_SIZE} bytes) — maia.html patching failed!"
    echo "    Expected: ~30,000+ bytes (maia.html embed)"
    echo "    Got: ${INDEX_SIZE} bytes (likely stale redirect stub)"
    echo ""
    echo "    Fix: check that out/maia.html exists and the Python patching step above succeeded."
    echo ""
    exit 1
fi
echo "✅ index.html verified (${INDEX_SIZE} bytes — maia.html embed confirmed)"

# Remove stale build directory BEFORE cap sync — pod install fails if it exists
rm -rf ios/App/build

# Sync Capacitor (LANG must be inline — npx spawns child process that may not inherit export)
echo "🔄 Syncing Capacitor to iOS..."
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx cap sync ios

# Navigate to iOS directory
cd ios/App

# Clean previous builds
echo "🧹 Cleaning previous builds..."
xcodebuild clean \
    -workspace App.xcworkspace \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION"

# Build archive
echo "🏗️ Building iOS archive..."
xcodebuild archive \
    -workspace App.xcworkspace \
    -scheme "$SCHEME" \
    -configuration "$CONFIGURATION" \
    -archivePath ./build/App.xcarchive \
    -allowProvisioningUpdates

# Check if archive was created
if [ ! -d "./build/App.xcarchive" ]; then
    echo "❌ iOS archive build failed!"
    exit 1
fi

echo "✅ iOS archive created successfully!"

# Export IPA / Upload to App Store Connect
if [ "$BUILD_TYPE" == "release" ]; then
    # Check export destination from plist
    DESTINATION=$(/usr/libexec/PlistBuddy -c 'Print :destination' exportOptions.plist 2>/dev/null || echo "export")

    echo "📦 Exporting archive (destination: ${DESTINATION})..."
    xcodebuild -exportArchive \
        -archivePath ./build/App.xcarchive \
        -exportPath ./output \
        -exportOptionsPlist exportOptions.plist \
        -allowProvisioningUpdates

    EXPORT_EXIT=$?

    if [ "$DESTINATION" = "upload" ]; then
        # Direct upload mode - no local IPA produced
        if [ $EXPORT_EXIT -eq 0 ]; then
            echo "✅ Build uploaded to App Store Connect!"
            echo "📱 Check TestFlight for processing status"
        else
            echo "❌ Upload to App Store Connect failed!"
            exit 1
        fi
    else
        # Local export mode - check for IPA file
        if [ -f "./output/App.ipa" ]; then
            IPA_SIZE=$(du -h "./output/App.ipa" | cut -f1)
            echo "✅ iOS IPA exported successfully!"
            echo "📁 Location: $(pwd)/output/App.ipa"
            echo "📏 Size: $IPA_SIZE"

            # Copy to root directory for easy access
            cp "./output/App.ipa" "../../maia-ios-${BUILD_TYPE}.ipa"
            echo "📋 Copied to: ../../maia-ios-${BUILD_TYPE}.ipa"
        else
            echo "❌ IPA export failed!"
            exit 1
        fi
    fi
fi

echo ""
echo "🎉 iOS build pipeline complete!"
echo ""
echo "Next steps:"
echo "  • Test the build on an iOS device or simulator"
echo "  • For App Store submission, use: fastlane pilot upload"
echo "  • Or upload manually to App Store Connect"
