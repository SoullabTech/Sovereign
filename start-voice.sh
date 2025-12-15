#!/bin/bash

# MAIA Voice-Enabled Dev Server with Secure HTTPS Tunnel
# Simple one-command solution - no certificates needed!

echo "🎤 Starting MAIA with Voice Support..."
echo ""

# Stop any existing servers
echo "Stopping existing servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
pkill -f "localtunnel" 2>/dev/null
pkill -f "lt --port" 2>/dev/null
sleep 2

# Start Next.js dev server on port 3000
echo "Starting Next.js dev server on port 3000..."
PORT=3000 npm run dev > /tmp/maia-dev.log 2>&1 &
NEXTJS_PID=$!

# Wait for Next.js to start
echo "Waiting for Next.js to initialize..."
sleep 8

# Start localtunnel to create secure HTTPS URL
echo "Creating secure HTTPS tunnel..."
lt --port 3000 > /tmp/localtunnel.log 2>&1 &
TUNNEL_PID=$!

# Wait for tunnel to start
sleep 3

# Get the public URL
TUNNEL_URL=$(cat /tmp/localtunnel.log | grep -o 'https://[^ ]*')

echo ""
echo "✅ MAIA Voice Server Running!"
echo ""
echo "🌐 Secure HTTPS URL (works on ALL devices):"
echo "   $TUNNEL_URL"
echo ""
echo "📱 iPhone: Open the URL above in Safari"
echo "💻 Desktop: Open the URL above in any browser"
echo "🔒 Local: http://localhost:3000 (no voice)"
echo ""
echo "✨ NO security warnings - real HTTPS certificate!"
echo "🎤 Just grant microphone permission when prompted"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping servers...'; kill $NEXTJS_PID $TUNNEL_PID 2>/dev/null; pkill -f 'lt --port'; exit" INT
wait
