#!/bin/bash

# Clean Maya Backend Restart
# Clears stale environment variables and forces fresh .env load

set -e

echo "🔄 Clean Maya Backend Restart"
echo "============================="

# 1. Kill any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "server-minimal" 2>/dev/null || true
pkill -f "node.*3002" 2>/dev/null || true
sleep 2

# 2. Clear stale environment variables
echo "🧹 Clearing stale environment..."
unset PORT
unset ANTHROPIC_API_KEY
unset OPENAI_API_KEY
unset ELEVENLABS_API_KEY

# 3. Set clean port
export APP_PORT=3002

# 4. Validate .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "💡 Create .env with your API keys first"
    exit 1
fi

# 5. Test Anthropic key before starting
echo "🔑 Validating Anthropic API key..."
if ! ./test-claude-key.sh; then
    echo ""
    echo "❌ Anthropic API key validation failed"
    echo "💡 Update ANTHROPIC_API_KEY in .env with a valid key"
    echo "📝 Format: ANTHROPIC_API_KEY=sk-ant-api03-..."
    exit 1
fi

echo ""
echo "✅ API key valid - starting Maya backend..."

# 6. Start with clean environment
echo "🚀 Starting Maya backend on port $APP_PORT..."
APP_PORT=3002 npm run start:minimal &

# 7. Wait for startup
echo "⏳ Waiting for server startup..."
sleep 3

# 8. Health check
if curl -s http://localhost:3002/api/v1/converse/health > /dev/null; then
    echo "✅ Maya backend is live!"
    echo ""
    echo "🎯 Test endpoints:"
    echo "   Health: http://localhost:3002/api/v1/converse/health"
    echo "   Stream: curl -N \"http://localhost:3002/api/v1/converse/stream?element=air&q=hello\""
    echo "   Message: curl -X POST http://localhost:3002/api/v1/converse/message -H 'Content-Type: application/json' -d '{\"userText\":\"hello\",\"element\":\"air\"}'"
else
    echo "❌ Health check failed - server may not be running"
    exit 1
fi