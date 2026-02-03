#!/bin/bash

# MAIA-SOVEREIGN iOS Build Script
# Builds and packages the iOS application

set -e

echo "🍎 MAIA-SOVEREIGN iOS Build Pipeline"
echo "====================================="

# Build type (debug or release)
BUILD_TYPE=${1:-release}
SCHEME="App"
CONFIGURATION="Release"

if [ "$BUILD_TYPE" == "debug" ]; then
    CONFIGURATION="Debug"
fi

echo "📱 Building iOS app (${CONFIGURATION} mode)..."

# Patch force-dynamic routes for static export
echo "🔧 Patching routes for static export..."
./scripts/capacitor-patch-routes.sh patch

# Ensure routes are reverted even if build fails
trap './scripts/capacitor-patch-routes.sh revert' EXIT

# Build web content first (required for Capacitor)
echo "🌐 Building Next.js web content..."
CAPACITOR_BUILD=1 npm run build

# Verify out directory exists
if [ ! -d "out" ]; then
    echo "❌ Web build failed - out/ directory not created!"
    exit 1
fi

# Revert patches after successful build
./scripts/capacitor-patch-routes.sh revert
trap - EXIT

# Sync Capacitor
echo "🔄 Syncing Capacitor to iOS..."
npx cap sync ios

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
