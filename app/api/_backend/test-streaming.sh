#!/bin/bash

# 🌊 Test Streaming Maya Pipeline
# Validates SSE streaming endpoint functionality

echo "🌊 Testing Sesame/Maya Streaming Pipeline"
echo "========================================"
echo ""

# Check if server is running
if ! lsof -iTCP:3002 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "❌ Server not running on port 3002"
    echo "Start with: APP_PORT=3002 ./start-backend.sh"
    exit 1
fi

echo "✅ Server running on port 3002"
echo ""

# Test streaming endpoint with curl
echo "🔥 Testing streaming endpoint (Fire element)..."
echo "curl -N 'http://localhost:3002/api/v1/converse/stream?element=fire&userId=test-user&q=guide+me+through+transformation'"
echo ""

curl -N 'http://localhost:3002/api/v1/converse/stream?element=fire&userId=test-user&q=guide+me+through+transformation' 2>/dev/null | head -10

echo ""
echo ""
echo "🌬️ Testing Air element (Claude routing)..."
echo ""

curl -N 'http://localhost:3002/api/v1/converse/stream?element=air&userId=test-user&q=help+me+communicate+clearly' 2>/dev/null | head -10

echo ""
echo ""
echo "✨ Streaming tests complete!"