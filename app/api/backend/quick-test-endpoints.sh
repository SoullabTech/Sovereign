#!/bin/bash

echo "Testing Sesame/Maya Endpoints"
echo "============================="
echo ""

# First, let's see what's actually running
echo "Checking for running node processes on common ports..."
for port in 3000 3001 3002 3003; do
    if lsof -iTCP:$port -sTCP:LISTEN >/dev/null 2>&1; then
        echo "✓ Found server on port $port"
        SERVER_PORT=$port
        break
    fi
done

if [ -z "$SERVER_PORT" ]; then
    echo "❌ No server found running on ports 3000-3003"
    echo ""
    echo "To start the server:"
    echo "  cd backend"
    echo "  APP_PORT=3002 ./start-backend.sh"
    exit 1
fi

echo ""
echo "Testing endpoints on port $SERVER_PORT..."
echo ""

echo "1. GET /api"
echo "-----------"
curl -s http://localhost:$SERVER_PORT/api 2>/dev/null | jq . || echo "Failed to connect"

echo ""
echo "2. GET /api/v1/converse/health"
echo "------------------------------"
curl -s http://localhost:$SERVER_PORT/api/v1/converse/health 2>/dev/null | jq . || echo "Failed to connect"

echo ""
echo "Done!"