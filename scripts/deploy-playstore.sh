#!/bin/bash
# ==============================================
#   MAIA Google Play Deployment Pipeline
# ==============================================
#
# Builds and uploads Android app to Google Play Store
#
# Prerequisites:
#   1. Google Play Service Account JSON key
#   2. fastlane installed (brew install fastlane)
#   3. Android keystore configured
#
# Usage:
#   ./scripts/deploy-playstore.sh                    # Full build + upload to internal
#   ./scripts/deploy-playstore.sh --track beta       # Upload to beta track
#   ./scripts/deploy-playstore.sh --track production # Upload to production
#   ./scripts/deploy-playstore.sh --build-only       # Build AAB only
#   ./scripts/deploy-playstore.sh --upload-only      # Upload existing AAB
#
# Environment variables:
#   GOOGLE_PLAY_JSON_KEY     Path to service account JSON (default: ~/play-store-key.json)
#   ANDROID_KEYSTORE_PATH    Path to release keystore
#   ANDROID_KEYSTORE_PASSWORD
#   ANDROID_KEY_ALIAS
#   ANDROID_KEY_PASSWORD

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ANDROID_DIR="$PROJECT_ROOT/android"
AAB_PATH="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
PACKAGE_NAME="com.soullab.maia"

# Defaults
GOOGLE_PLAY_JSON_KEY="${GOOGLE_PLAY_JSON_KEY:-$HOME/play-store-key.json}"
TRACK="internal"
BUILD_ONLY=false
UPLOAD_ONLY=false
SKIP_BUILD=false

# Keystore defaults (can be overridden via env)
ANDROID_KEYSTORE_PATH="${ANDROID_KEYSTORE_PATH:-$HOME/keystores/maia-release.keystore}"
ANDROID_KEYSTORE_PASSWORD="${ANDROID_KEYSTORE_PASSWORD:-}"
ANDROID_KEY_ALIAS="${ANDROID_KEY_ALIAS:-maia}"
ANDROID_KEY_PASSWORD="${ANDROID_KEY_PASSWORD:-}"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --track)
            TRACK="$2"
            shift 2
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
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --json-key)
            GOOGLE_PLAY_JSON_KEY="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --track TRACK      Release track: internal, alpha, beta, production (default: internal)"
            echo "  --build-only       Build AAB but don't upload"
            echo "  --upload-only      Upload existing AAB (implies --skip-build)"
            echo "  --skip-build       Skip building, use existing AAB"
            echo "  --json-key PATH    Path to Google Play service account JSON"
            echo "  --help             Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  GOOGLE_PLAY_JSON_KEY       Path to service account JSON"
            echo "  ANDROID_KEYSTORE_PATH      Path to release keystore"
            echo "  ANDROID_KEYSTORE_PASSWORD  Keystore password"
            echo "  ANDROID_KEY_ALIAS          Key alias"
            echo "  ANDROID_KEY_PASSWORD       Key password"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo ""
echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}  MAIA Google Play Deployment Pipeline${NC}"
echo -e "${BLUE}==============================================${NC}"
echo ""

# ==============================================
# 1. Preflight Checks
# ==============================================
echo -e "${YELLOW}1. Preflight Checks${NC}"
echo "-------------------"

# Check for fastlane
if ! command -v fastlane &> /dev/null && [ "$BUILD_ONLY" = false ]; then
    echo -e "${RED}  fastlane not found!${NC}"
    echo ""
    echo "  Install with:"
    echo "    brew install fastlane"
    echo ""
    exit 1
fi
echo -e "  ${GREEN}✓${NC} fastlane installed"

# Check for JSON key (only if uploading)
if [ "$BUILD_ONLY" = false ]; then
    if [ ! -f "$GOOGLE_PLAY_JSON_KEY" ]; then
        echo -e "${RED}  Google Play JSON key not found at: $GOOGLE_PLAY_JSON_KEY${NC}"
        echo ""
        echo "  Set up a service account:"
        echo "    1. Go to https://console.cloud.google.com"
        echo "    2. Create a service account with JSON key"
        echo "    3. Link it in Google Play Console → Setup → API access"
        echo "    4. Save the JSON key to: $GOOGLE_PLAY_JSON_KEY"
        echo ""
        echo "  Or specify a different path:"
        echo "    ./scripts/deploy-playstore.sh --json-key /path/to/key.json"
        echo ""
        exit 1
    fi
    echo -e "  ${GREEN}✓${NC} JSON key found: $GOOGLE_PLAY_JSON_KEY"
fi

# Check for keystore (only if building)
if [ "$SKIP_BUILD" = false ]; then
    if [ ! -f "$ANDROID_KEYSTORE_PATH" ]; then
        echo -e "${RED}  Keystore not found at: $ANDROID_KEYSTORE_PATH${NC}"
        exit 1
    fi
    echo -e "  ${GREEN}✓${NC} Keystore found: $ANDROID_KEYSTORE_PATH"

    if [ -z "$ANDROID_KEYSTORE_PASSWORD" ]; then
        echo -e "${RED}  ANDROID_KEYSTORE_PASSWORD not set${NC}"
        exit 1
    fi
    echo -e "  ${GREEN}✓${NC} Keystore password set"
fi

# Check for existing AAB (if skipping build)
if [ "$SKIP_BUILD" = true ]; then
    if [ ! -f "$AAB_PATH" ]; then
        echo -e "${RED}  No AAB found at: $AAB_PATH${NC}"
        echo "  Run without --skip-build to create one"
        exit 1
    fi
    echo -e "  ${GREEN}✓${NC} Existing AAB found"
fi

echo -e "  Track: ${GREEN}$TRACK${NC}"
echo ""

# ==============================================
# 2. Build Capacitor Static Export
# ==============================================
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${YELLOW}2. Building Capacitor Static Export${NC}"
    echo "------------------------------------"

    cd "$PROJECT_ROOT"

    # Run the capacitor build script
    if [ -f "./scripts/build-capacitor.sh" ]; then
        ./scripts/build-capacitor.sh
    else
        echo "  Running Next.js static export..."
        CAPACITOR_BUILD=1 npm run build
    fi

    echo ""
fi

# ==============================================
# 3. Sync Capacitor to Android
# ==============================================
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${YELLOW}3. Syncing Capacitor to Android${NC}"
    echo "--------------------------------"

    cd "$PROJECT_ROOT"
    npx cap sync android

    echo ""
fi

# ==============================================
# 4. Build Android AAB
# ==============================================
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${YELLOW}4. Building Android Release Bundle${NC}"
    echo "-----------------------------------"

    cd "$ANDROID_DIR"

    # Clean previous builds
    echo "  Cleaning previous builds..."
    ./gradlew clean

    # Build release bundle
    echo "  Building release AAB..."
    ANDROID_KEYSTORE_PATH="$ANDROID_KEYSTORE_PATH" \
    ANDROID_KEYSTORE_PASSWORD="$ANDROID_KEYSTORE_PASSWORD" \
    ANDROID_KEY_ALIAS="$ANDROID_KEY_ALIAS" \
    ANDROID_KEY_PASSWORD="$ANDROID_KEY_PASSWORD" \
    ./gradlew bundleRelease

    if [ ! -f "$AAB_PATH" ]; then
        echo -e "${RED}  Build failed - AAB not created${NC}"
        exit 1
    fi

    AAB_SIZE=$(du -h "$AAB_PATH" | cut -f1)
    echo -e "  ${GREEN}✓${NC} AAB created: $AAB_SIZE"
    echo ""
fi

# Exit if build-only
if [ "$BUILD_ONLY" = true ]; then
    echo -e "${GREEN}==============================================${NC}"
    echo -e "${GREEN}  Build Complete!${NC}"
    echo -e "${GREEN}==============================================${NC}"
    echo ""
    echo "  AAB location: $AAB_PATH"
    echo ""
    echo "  To upload manually:"
    echo "    fastlane supply --aab $AAB_PATH --track $TRACK --json_key $GOOGLE_PLAY_JSON_KEY --package_name $PACKAGE_NAME"
    echo ""
    exit 0
fi

# ==============================================
# 5. Upload to Google Play
# ==============================================
echo -e "${YELLOW}5. Uploading to Google Play ($TRACK)${NC}"
echo "-------------------------------------"

cd "$PROJECT_ROOT"

# Upload using fastlane supply
fastlane supply \
    --aab "$AAB_PATH" \
    --track "$TRACK" \
    --json_key "$GOOGLE_PLAY_JSON_KEY" \
    --package_name "$PACKAGE_NAME" \
    --skip_upload_metadata \
    --skip_upload_images \
    --skip_upload_screenshots

echo ""
echo -e "${GREEN}==============================================${NC}"
echo -e "${GREEN}  Google Play Upload Complete!${NC}"
echo -e "${GREEN}==============================================${NC}"
echo ""
echo "  Track: $TRACK"
echo "  Package: $PACKAGE_NAME"
echo ""
echo "  Next steps:"
echo "    1. Go to https://play.google.com/console"
echo "    2. Select MAIA app"
echo "    3. Review the release in '$TRACK' track"
if [ "$TRACK" = "internal" ]; then
    echo "    4. Add internal testers if needed"
elif [ "$TRACK" = "production" ]; then
    echo "    4. Complete the rollout percentage"
fi
echo ""
