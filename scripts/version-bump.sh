#!/bin/bash

# MAIA-SOVEREIGN Cross-Platform Version Management
# Updates version across all platforms: package.json, iOS, Android, Capacitor

set -e

VERSION=$1
VERSION_TYPE=${2:-patch}  # major, minor, or patch

if [ -z "$VERSION" ]; then
    echo "❌ Usage: ./scripts/version-bump.sh <version> [type]"
    echo "   Examples:"
    echo "     ./scripts/version-bump.sh 1.0.0"
    echo "     ./scripts/version-bump.sh 1.0.0 minor"
    echo "     ./scripts/version-bump.sh auto patch  # Auto-increment patch version"
    exit 1
fi

echo "🔢 MAIA-SOVEREIGN Version Management"
echo "===================================="
echo ""

# If version is 'auto', use npm version to auto-increment
if [ "$VERSION" == "auto" ]; then
    echo "📈 Auto-incrementing $VERSION_TYPE version..."
    npm version $VERSION_TYPE --no-git-tag-version
    VERSION=$(node -p "require('./package.json').version")
    echo "✅ New version: $VERSION"
else
    # Manual version update
    echo "📝 Updating to version: $VERSION"
    npm version $VERSION --no-git-tag-version
fi

echo ""
echo "📱 Updating platform configurations..."

# Update Capacitor config
if [ -f "capacitor.config.ts" ]; then
    echo "  → Capacitor config (capacitor.config.ts)"
    # Use sed to update version in TypeScript config
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/version: ['\"].*['\"]/version: '$VERSION'/" capacitor.config.ts
    else
        # Linux
        sed -i "s/version: ['\"].*['\"]/version: '$VERSION'/" capacitor.config.ts
    fi
fi

# Update iOS Info.plist
if [ -f "ios/App/App/Info.plist" ]; then
    echo "  → iOS Info.plist"
    /usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION" ios/App/App/Info.plist 2>/dev/null || true

    # Also increment build number
    CURRENT_BUILD=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" ios/App/App/Info.plist 2>/dev/null || echo 0)
    BUILD_NUMBER=$((CURRENT_BUILD + 1))
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUMBER" ios/App/App/Info.plist 2>/dev/null || true
    echo "  → iOS build number: $BUILD_NUMBER"
fi

# Update Android build.gradle versionName
if [ -f "android/app/build.gradle" ]; then
    echo "  → Android build.gradle"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/versionName \".*\"/versionName \"$VERSION\"/" android/app/build.gradle
    else
        sed -i "s/versionName \".*\"/versionName \"$VERSION\"/" android/app/build.gradle
    fi

    # Also increment versionCode
    CURRENT_CODE=$(grep -oP 'versionCode \K\d+' android/app/build.gradle 2>/dev/null || echo 0)
    NEW_CODE=$((CURRENT_CODE + 1))
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/versionCode $CURRENT_CODE/versionCode $NEW_CODE/" android/app/build.gradle
    else
        sed -i "s/versionCode $CURRENT_CODE/versionCode $NEW_CODE/" android/app/build.gradle
    fi
    echo "  → Android version code: $NEW_CODE"
fi

# Update React Native mobile app if it exists
if [ -f "mobile-app/package.json" ]; then
    echo "  → React Native mobile-app/package.json"
    cd mobile-app
    npm version $VERSION --no-git-tag-version
    cd ..
fi

echo ""
echo "✅ All platforms updated to version $VERSION"
echo ""
echo "📋 Summary:"
echo "  • package.json: $VERSION"
echo "  • Capacitor: $VERSION"
if [ -f "ios/App/App/Info.plist" ]; then
    echo "  • iOS: $VERSION (build $BUILD_NUMBER)"
fi
if [ -f "android/app/build.gradle" ]; then
    echo "  • Android: $VERSION (code $NEW_CODE)"
fi

echo ""
echo "🎯 Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Commit version bump: git add -A && git commit -m \"Bump version to $VERSION\""
echo "  3. Tag release: git tag v$VERSION"
echo "  4. Build platforms:"
echo "     • iOS: npm run ios:release"
echo "     • Android: npm run android:release"
echo "     • PWA: npm run pwa:build"
