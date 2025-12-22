#!/bin/bash

# Deploy Emergence Tracking to All Platforms
# Usage: bash scripts/deploy-emergence.sh [platform]
# Platforms: ios | android | pwa | all

set -e

PLATFORM="${1:-all}"

echo "🌟 Deploying Kauffman Emergence Tracking"
echo "Platform: $PLATFORM"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check environment variables
if [ -z "$EMERGENCE_SERVICE_URL" ]; then
  echo "⚠️  Warning: EMERGENCE_SERVICE_URL not set"
  echo "Using default: http://localhost:8001"
  export EMERGENCE_SERVICE_URL="http://localhost:8001"
fi

# Enable emergence tracking
export NEXT_PUBLIC_EMERGENCE_ENABLED=true
export NEXT_PUBLIC_BETA_FEATURES="emergence_tracking,o4_niche_detection"

deploy_pwa() {
  echo -e "${BLUE}📱 Deploying PWA to Vercel...${NC}"

  # Build Next.js app
  echo "Building Next.js app..."
  npm run build

  # Deploy to Vercel
  echo "Deploying to Vercel..."
  vercel --prod

  echo -e "${GREEN}✅ PWA deployed${NC}"
}

deploy_ios() {
  echo -e "${BLUE}🍎 Building iOS app...${NC}"

  # Build Next.js
  echo "Building Next.js app..."
  npm run build

  # Sync to Capacitor
  echo "Syncing to Capacitor..."
  npx cap sync ios

  # Open Xcode for manual archive
  echo "Opening Xcode..."
  echo ""
  echo "In Xcode:"
  echo "1. Product > Archive"
  echo "2. Distribute App > App Store Connect"
  echo "3. Upload"
  echo "4. Add beta testers in App Store Connect"
  echo ""
  npx cap open ios

  echo -e "${GREEN}✅ iOS ready for archive${NC}"
}

deploy_android() {
  echo -e "${BLUE}🤖 Building Android app...${NC}"

  # Build Next.js
  echo "Building Next.js app..."
  npm run build

  # Sync to Capacitor
  echo "Syncing to Capacitor..."
  npx cap sync android

  # Open Android Studio for manual build
  echo "Opening Android Studio..."
  echo ""
  echo "In Android Studio:"
  echo "1. Build > Generate Signed Bundle/APK"
  echo "2. Select Android App Bundle"
  echo "3. Upload to Google Play Console > Internal Testing"
  echo "4. Add beta testers"
  echo ""
  npx cap open android

  echo -e "${GREEN}✅ Android ready for build${NC}"
}

# Deploy based on platform
case "$PLATFORM" in
  pwa)
    deploy_pwa
    ;;
  ios)
    deploy_ios
    ;;
  android)
    deploy_android
    ;;
  all)
    echo "Deploying to all platforms..."
    deploy_pwa
    deploy_ios
    deploy_android
    ;;
  *)
    echo "❌ Unknown platform: $PLATFORM"
    echo "Usage: bash scripts/deploy-emergence.sh [platform]"
    echo "Platforms: ios | android | pwa | all"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}🌟 Emergence tracking deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify service health: curl $EMERGENCE_SERVICE_URL/api/emergence/health"
echo "2. Send beta tester invites"
echo "3. Monitor first 24 hours"
echo ""
