#!/bin/bash

# Script to stop all development processes

echo "🛑 Stopping all development processes..."

# Kill all npm dev processes
pkill -f "npm.*dev" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
pkill -f "npm run maya" 2>/dev/null
pkill -f "npm run build" 2>/dev/null
pkill -f "npm run dist" 2>/dev/null

# Kill Next.js processes
pkill -f "next.*dev" 2>/dev/null
pkill -f "next dev" 2>/dev/null

# Kill React Native processes
pkill -f "react-native" 2>/dev/null
pkill -f "xcodebuild" 2>/dev/null

# Kill Node.js dev processes
pkill -f "node.*dev" 2>/dev/null
pkill -f "npx.*dev" 2>/dev/null

# Kill localtunnel and other dev tools
pkill -f "lt --port" 2>/dev/null

# Wait a moment for processes to terminate
sleep 3

echo "✅ All development processes stopped"

echo ""
echo "🚨 DEPLOYMENT INFRASTRUCTURE REMINDER:"
echo "   ✅ Production: https://soullab.life (Docker + Nginx)"
echo "   ✅ Database: Supabase (managed PostgreSQL)"
echo "   ❌ NOT using Vercel or Cloudflare"
echo ""

echo "🚀 Ready for clean development:"
echo "   Run 'npm run claude:env' to verify environment"
echo "   Run 'npm run dev' for clean development server"
echo ""

# Show any remaining node/npm processes
echo "🔍 Checking for remaining processes..."
ps aux | grep -E "(npm|node|next)" | grep -v "grep" | head -10