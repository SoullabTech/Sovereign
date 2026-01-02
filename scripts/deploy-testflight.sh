#!/bin/bash

# MAIA-SOVEREIGN TestFlight Deployment Script
# Builds iOS app and uploads to App Store Connect for TestFlight distribution

set -e

echo ""
echo "=============================================="
echo "  MAIA TestFlight Deployment Pipeline"
echo "=============================================="
echo ""

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
IOS_DIR="$PROJECT_DIR/ios/App"
IPA_PATH="$IOS_DIR/output/App.ipa"

# App Store Connect API credentials
API_KEY_ID="${APPSTORE_API_KEY_ID:-RZJ852Y4NZ}"
API_ISSUER_ID="${APPSTORE_ISSUER_ID:-}"
API_KEY_PATH="${APPSTORE_API_KEY_PATH:-$HOME/.appstoreconnect/private_keys/AuthKey_${API_KEY_ID}.p8}"

# Parse arguments
SKIP_BUILD=false
BUILD_ONLY=false
UPLOAD_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --upload-only)
            UPLOAD_ONLY=true
            SKIP_BUILD=true
            shift
            ;;
        --issuer)
            API_ISSUER_ID="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --skip-build    Skip the build step, use existing IPA"
            echo "  --build-only    Build IPA but don't upload"
            echo "  --upload-only   Upload existing IPA (implies --skip-build)"
            echo "  --issuer ID     Set App Store Connect Issuer ID"
            echo "  --help          Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  APPSTORE_API_KEY_ID    API Key ID (default: RZJ852Y4NZ)"
            echo "  APPSTORE_ISSUER_ID     Issuer ID (required for upload)"
            echo "  APPSTORE_API_KEY_PATH  Path to .p8 key file"
            echo ""
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Preflight checks
echo "1. Preflight Checks"
echo "-------------------"

# Check for Issuer ID if we're uploading
if [ "$BUILD_ONLY" = false ] && [ -z "$API_ISSUER_ID" ]; then
    echo ""
    echo "  Missing APPSTORE_ISSUER_ID!"
    echo ""
    echo "  Get your Issuer ID from:"
    echo "  https://appstoreconnect.apple.com/access/api"
    echo ""
    echo "  Then run:"
    echo "    export APPSTORE_ISSUER_ID='your-issuer-id'"
    echo "    $0"
    echo ""
    echo "  Or pass it directly:"
    echo "    $0 --issuer 'your-issuer-id'"
    echo ""
    exit 1
fi

# Check for API key
if [ ! -f "$API_KEY_PATH" ]; then
    echo "  API key not found at: $API_KEY_PATH"
    exit 1
fi
echo "  API Key: $API_KEY_ID"
echo "  Issuer ID: ${API_ISSUER_ID:-'(not set - build only)'}"

# Check for existing IPA if skipping build
if [ "$SKIP_BUILD" = true ]; then
    if [ ! -f "$IPA_PATH" ]; then
        echo "  No existing IPA found at: $IPA_PATH"
        echo "  Run without --skip-build to create one"
        exit 1
    fi
    echo "  Using existing IPA: $IPA_PATH"
fi

cd "$PROJECT_DIR"

# Build phase
if [ "$SKIP_BUILD" = false ]; then
    echo ""
    echo "2. Configuring Capacitor for Beta"
    echo "----------------------------------"

    # For beta/prod builds, the app loads from soullab.life remote server
    # No static export needed - the iOS app is a WebView to the live site
    export CAPACITOR_MODE=beta
    export NODE_ENV=production

    echo "  Mode: beta (remote server: https://soullab.life)"
    echo "  Note: App content served from remote server, no static build needed"

    echo ""
    echo "3. Syncing Capacitor"
    echo "--------------------"
    CAPACITOR_MODE=beta npx cap sync ios

    echo ""
    echo "4. Building iOS Archive"
    echo "-----------------------"
    cd "$IOS_DIR"

    # Clean previous builds
    echo "  Cleaning previous builds..."
    xcodebuild clean \
        -workspace App.xcworkspace \
        -scheme App \
        -configuration Release \
        -quiet

    # Build archive
    echo "  Creating archive..."
    xcodebuild archive \
        -workspace App.xcworkspace \
        -scheme App \
        -configuration Release \
        -archivePath ./build/App.xcarchive \
        -allowProvisioningUpdates \
        -quiet

    if [ ! -d "./build/App.xcarchive" ]; then
        echo "  Archive failed!"
        exit 1
    fi
    echo "  Archive created successfully"

    echo ""
    echo "5. Exporting IPA"
    echo "----------------"

    # Remove old output
    rm -rf ./output
    mkdir -p ./output

    # Export and upload directly to App Store Connect
    # Note: With method=app-store-connect + destination=upload, this uploads directly
    xcodebuild -exportArchive \
        -archivePath ./build/App.xcarchive \
        -exportPath ./output \
        -exportOptionsPlist exportOptions.plist \
        -allowProvisioningUpdates \
        -authenticationKeyPath "$API_KEY_PATH" \
        -authenticationKeyID "$API_KEY_ID" \
        -authenticationKeyIssuerID "$API_ISSUER_ID"

    UPLOAD_STATUS=$?

    cd "$PROJECT_DIR"
fi

# Build-only mode check
if [ "$BUILD_ONLY" = true ]; then
    echo ""
    echo "Build complete!"
    exit 0
fi

if [ $UPLOAD_STATUS -eq 0 ]; then
    echo ""
    echo "=============================================="
    echo "  TestFlight Upload Complete!"
    echo "=============================================="
    echo ""
    echo "Next steps:"
    echo "  1. Go to App Store Connect: https://appstoreconnect.apple.com"
    echo "  2. Select your app -> TestFlight tab"
    echo "  3. Wait for build processing (5-30 minutes)"
    echo "  4. Complete Export Compliance questionnaire"
    echo "  5. Add beta testers or groups"
    echo ""
else
    echo ""
    echo "Upload failed with status: $UPLOAD_STATUS"
    echo ""
    echo "Common issues:"
    echo "  - Invalid Issuer ID"
    echo "  - API key permissions (needs App Manager role)"
    echo "  - Version/build number already exists"
    echo ""
    exit $UPLOAD_STATUS
fi
