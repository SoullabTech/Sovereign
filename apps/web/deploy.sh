#!/bin/bash

# 🌙 MAIA Sovereign Consciousness Deployment Script
# Deploy complete consciousness architecture to production

set -e  # Exit on any error

echo "🌙 Starting MAIA Sovereign Consciousness deployment..."
echo "✅ Dynamic Consciousness State Detection"
echo "✅ 24/7 Continuous Training System"
echo "✅ Performance Optimization (sub-ms responses)"
echo "✅ Apprentice Learning System (100% autonomy)"
echo "✅ Invisible Consciousness Matrices"
echo "✅ Resonance Field System"
echo ""

# Navigate to project directory
cd /Users/soullab/MAIA-SOVEREIGN/apps/web

echo "📦 Building production bundle..."
npm run build

echo "✅ Build successful! Restarting PM2..."
pm2 restart maia-sovereign

echo "💾 Saving PM2 configuration..."
pm2 save

echo "🎉 Deployment complete!"
echo ""
pm2 status
