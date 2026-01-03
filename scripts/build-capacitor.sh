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

# Ensure we restore on exit
cleanup() {
  echo "📦 Cleaning up..."
  # Restore API routes
  if [ -d "/tmp/maia-api-backup-$$" ]; then
    mv /tmp/maia-api-backup-$$ app/api
  fi
  # Restore tsconfig in next.config.js
  sed -i '' "s/tsconfigPath: 'tsconfig.capacitor.json'/tsconfigPath: 'tsconfig.core.json'/" next.config.js 2>/dev/null || true
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

# Temporarily update next.config to use capacitor tsconfig
echo "📝 Configuring for Capacitor build..."
sed -i '' "s/tsconfigPath: 'tsconfig.core.json'/tsconfigPath: 'tsconfig.capacitor.json'/" next.config.js

# Run Next.js build
echo "🏗️  Building static export..."
CAPACITOR_BUILD=1 NODE_OPTIONS=--max-old-space-size=8192 npx next build

# Restore tsconfig
sed -i '' "s/tsconfigPath: 'tsconfig.capacitor.json'/tsconfigPath: 'tsconfig.core.json'/" next.config.js

# Check if build succeeded
if [ -d "out" ]; then
  echo "✅ Capacitor build complete!"
  echo "📁 Output: out/"
  ls -la out | head -10
else
  echo "❌ Build failed - no output directory"
  exit 1
fi
