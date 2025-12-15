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

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
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

# Export IPA
if [ "$BUILD_TYPE" == "release" ]; then
    echo "📦 Exporting IPA for App Store distribution..."
    xcodebuild -exportArchive \
        -archivePath ./build/App.xcarchive \
        -exportPath ./output \
        -exportOptionsPlist exportOptions.plist \
        -allowProvisioningUpdates

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

echo ""
echo "🎉 iOS build pipeline complete!"
echo ""
echo "Next steps:"
echo "  • Test the build on an iOS device or simulator"
echo "  • For App Store submission, use: fastlane pilot upload"
echo "  • Or upload manually to App Store Connect"
