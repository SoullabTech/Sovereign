#!/bin/bash
# Capacitor Build Script
# Builds a static export for iOS/Android apps
# API routes are excluded since they run on the production server

set -e

echo "🔧 Starting Capacitor build..."

# Save API routes temporarily - move completely outside project to avoid import resolution
if [ -d "app/api" ]; then
  echo "📦 Moving API routes aside (they run on production server)..."
  mv app/api /tmp/maia-api-backup-$$
fi

# Move middleware aside - it's incompatible with static export
if [ -f "middleware.ts" ]; then
  echo "📦 Moving middleware aside (incompatible with static export)..."
  mv middleware.ts /tmp/maia-middleware-backup-$$
fi

# Move dynamic routes that can't be statically exported
echo "📦 Moving dynamic routes aside (served from production server)..."
mkdir -p /tmp/maia-dynamic-backup-$$
for route in "app/caseload" "app/admin/partners/prelude" "app/community/commons"; do
  if [ -d "$route" ]; then
    mv "$route" /tmp/maia-dynamic-backup-$$/
  fi
done

# Ensure we restore on exit
cleanup() {
  echo "📦 Cleaning up..."
  # Restore API routes
  if [ -d "/tmp/maia-api-backup-$$" ]; then
    mv /tmp/maia-api-backup-$$ app/api
  fi
  # Restore middleware
  if [ -f "/tmp/maia-middleware-backup-$$" ]; then
    mv /tmp/maia-middleware-backup-$$ middleware.ts
  fi
  # Restore dynamic routes
  if [ -d "/tmp/maia-dynamic-backup-$$" ]; then
    for item in /tmp/maia-dynamic-backup-$$/*/; do
      basename=$(basename "$item")
      case "$basename" in
        caseload) mv "$item" app/ ;;
        prelude) mkdir -p app/admin/partners && mv "$item" app/admin/partners/ ;;
        commons) mkdir -p app/community && mv "$item" app/community/ ;;
      esac
    done
    rm -rf /tmp/maia-dynamic-backup-$$
  fi
}
trap cleanup EXIT

# Clean build directories
echo "🧹 Cleaning build directories..."
rm -rf .next out

# Skip aetheric verification for mobile builds (API routes not included)
echo "⏭️  Skipping aetheric verification (API routes not in mobile build)..."

# Validate critical files (excluding API)
echo "🔍 Validating critical files..."
node scripts/validate-critical-files.js || true

# NOTE: Do NOT change tsconfig to tsconfig.capacitor.json - it breaks static HTML export
# The tsconfig.capacitor.json excludes too aggressively and causes Next.js to skip HTML generation
# Using tsconfig.core.json works because API routes are already moved aside

# Run Next.js build
# NEXT_PUBLIC_API_BASE_URL tells the app to call the production API server
# Without this, relative /api/* calls fail in the static iOS export
echo "🏗️  Building static export..."
CAPACITOR_BUILD=1 NEXT_PUBLIC_API_BASE_URL=https://soullab.life NODE_OPTIONS=--max-old-space-size=8192 npx next build

# Check if build succeeded
if [ -d "out" ]; then
  echo "✅ Capacitor build complete!"
  echo "📁 Output: out/"
  ls -la out | head -10
else
  echo "❌ Build failed - no output directory"
  exit 1
fi
