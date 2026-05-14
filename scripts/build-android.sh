#!/bin/bash

# MAIA-SOVEREIGN Android Build Script
# Mirrors scripts/ios/build.sh — runs the web export with MOBILE_MODE route
# patching, then Capacitor sync, then Gradle.
#
# Pipeline:
#   1. Patch dynamic routes for static export (MOBILE_MODE=1)
#   2. Build Next.js → out/ (CAPACITOR_BUILD=1)
#   3. Patch root index.html → /enter redirect
#   4. Revert route patches
#   5. Capacitor sync (cap sync android)
#   6. Gradle build (assembleDebug | assembleRelease | bundleRelease)
#
# Usage:
#   ./scripts/build-android.sh                  # debug APK
#   ./scripts/build-android.sh release          # signed release APK (needs .env.android)
#   ./scripts/build-android.sh bundle           # signed AAB for Play Store
#   ./scripts/build-android.sh debug --skip-web # reuse existing out/

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$REPO_ROOT/out"

echo "🤖 MAIA-SOVEREIGN Android Build Pipeline"
echo "========================================="

# Toolchain (use existing env vars if set, otherwise fall back to Mac defaults)
export JAVA_HOME=${JAVA_HOME:-/opt/homebrew/opt/openjdk@21}
export ANDROID_HOME=${ANDROID_HOME:-$HOME/Library/Android/sdk}
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Args: first positional is BUILD_TYPE (debug|release|bundle), flags supported.
BUILD_TYPE="debug"
SKIP_WEB=false
for arg in "$@"; do
  case "$arg" in
    debug|release|bundle) BUILD_TYPE="$arg" ;;
    --skip-web)           SKIP_WEB=true ;;
  esac
done

echo "📱 Building Android app (${BUILD_TYPE} mode)..."

# ── Web export with MOBILE_MODE route patching ────────────────────────────────
if $SKIP_WEB; then
  if [ -d "$OUT_DIR" ] && [ -n "$(ls -A "$OUT_DIR")" ]; then
    echo "⏭️  Skipping web build (--skip-web) — reusing $OUT_DIR"
  else
    echo "❌ out/ is missing or empty — cannot skip web build"
    exit 1
  fi
else
  echo "🩹 Patching dynamic routes for static export (MOBILE_MODE=1)..."
  export MOBILE_MODE=1
  "$REPO_ROOT/scripts/capacitor-patch-routes.sh" patch

  # Ensure patches are reverted even on failure
  trap '"$REPO_ROOT/scripts/capacitor-patch-routes.sh" revert 2>/dev/null || true' EXIT

  echo "🏗️  Building static export (CAPACITOR_BUILD=1)..."
  cd "$REPO_ROOT"
  CAPACITOR_BUILD=1 MAIA_AUDIT_FINGERPRINT_SECRET=build-placeholder npm run build

  if [ ! -d "$OUT_DIR" ] || [ -z "$(ls -A "$OUT_DIR")" ]; then
    echo "❌ out/ is missing or empty after npm run build"
    exit 1
  fi
fi

# Patch root index.html → /enter redirect (parity with iOS build.sh)
cat > "$OUT_DIR/index.html" << 'HTMLEOF'
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>html,body{margin:0;padding:0;background:#1A1513;}</style>
    <script>
      if (!window.__maiaRedirected) {
        window.__maiaRedirected = true;
        window.location.replace('/enter');
      }
    </script>
  </head>
  <body></body>
</html>
HTMLEOF
echo "✅ Root index.html → /enter redirect patched"

# Revert route patches before cap sync
if ! $SKIP_WEB; then
  "$REPO_ROOT/scripts/capacitor-patch-routes.sh" revert
  trap - EXIT
fi

# ── Capacitor sync ────────────────────────────────────────────────────────────
echo "🔄 Syncing Capacitor..."
cd "$REPO_ROOT"
npx cap sync android

# Build the Android app
if [ "$BUILD_TYPE" == "bundle" ]; then
    echo "📦 Building App Bundle (AAB) for Google Play Store..."
    cd android
    ./gradlew bundleRelease
    BUNDLE_PATH="app/build/outputs/bundle/release/app-release.aab"
    OUTPUT_TYPE="bundle"
elif [ "$BUILD_TYPE" == "release" ]; then
    echo "🏗️ Building release APK..."
    cd android
    ./gradlew assembleRelease
    # Signed output is app-release.apk when .env.android was sourced;
    # unsigned (no env) falls back to app-release-unsigned.apk.
    if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
        APK_PATH="app/build/outputs/apk/release/app-release.apk"
    else
        APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
    fi
    OUTPUT_TYPE="apk"
else
    echo "🔨 Building debug APK..."
    cd android
    ./gradlew assembleDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    OUTPUT_TYPE="apk"
fi

# Check if build output was created
if [ "$OUTPUT_TYPE" == "bundle" ]; then
    if [ -f "$BUNDLE_PATH" ]; then
        BUNDLE_SIZE=$(du -h "$BUNDLE_PATH" | cut -f1)
        echo "✅ Android App Bundle built successfully!"
        echo "📁 Location: $(pwd)/$BUNDLE_PATH"
        echo "📏 Size: $BUNDLE_SIZE"

        # Copy to root directory for easy access
        cp "$BUNDLE_PATH" "../maia-android-bundle.aab"
        echo "📋 Copied to: ../maia-android-bundle.aab"
    else
        echo "❌ Android App Bundle build failed!"
        exit 1
    fi
else
    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo "✅ Android APK built successfully!"
        echo "📁 Location: $(pwd)/$APK_PATH"
        echo "📏 Size: $APK_SIZE"

        # Copy to root directory for easy access
        cp "$APK_PATH" "../maia-android-${BUILD_TYPE}.apk"
        echo "📋 Copied to: ../maia-android-${BUILD_TYPE}.apk"
    else
        echo "❌ Android APK build failed!"
        exit 1
    fi
fi

echo ""
echo "🎉 Android build pipeline complete!"
echo ""
echo "Next steps:"
echo "  • Test the APK on an Android device or emulator"
echo "  • For release builds, sign the APK with your keystore"
echo "  • Deploy to Google Play Store or distribute directly"