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
