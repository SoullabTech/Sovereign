#!/bin/bash

# MAIA-SOVEREIGN Android Build Script
# Builds and packages the Android application

set -e

echo "🤖 MAIA-SOVEREIGN Android Build Pipeline"
echo "========================================="

# Set Android environment
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Build type (debug or release)
BUILD_TYPE=${1:-debug}

echo "📱 Building Android app (${BUILD_TYPE} mode)..."

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
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
    APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
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