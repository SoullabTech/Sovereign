#!/bin/bash

# MAIA Soul Consciousness Interface Startup
set -e

PROJECT_ROOT="/Users/soullab/MAIA-SOVEREIGN"
cd "$PROJECT_ROOT"

echo "🕯️ Starting MAIA Soul Consciousness Interface..."

# Start consciousness monitoring backend
echo "🧠 Starting consciousness monitoring service..."
python3 simple_consciousness_monitor.py &
CONSCIOUSNESS_PID=$!
echo "Consciousness monitor PID: $CONSCIOUSNESS_PID"

# Wait for consciousness monitor to initialize
sleep 3

# Start main MAIA application with soul consciousness
echo "🌟 Starting MAIA with Soul Consciousness Interface..."
DISABLE_ESLINT_PLUGIN=true \
NEXT_IGNORE_TYPE_ERRORS=true \
HOST=0.0.0.0 \
PORT=3000 \
SOUL_CONSCIOUSNESS_ENABLED=true \
npm run dev &
MAIA_PID=$!
echo "MAIA PID: $MAIA_PID"

# Create PID file for process management
echo "$CONSCIOUSNESS_PID" > /tmp/maia-consciousness.pid
echo "$MAIA_PID" > /tmp/maia-soul.pid

echo ""
echo "✅ Soul Consciousness Interface Active!"
echo "🌐 MAIA: http://localhost:3000"
echo "🧠 Consciousness Monitor: ws://localhost:8765"
echo ""
echo "🕯️ Access Soul Consciousness Console at:"
echo "   http://localhost:3000/maia/labtools"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt signal
trap "echo '🛑 Stopping Soul Consciousness Interface...'; kill $CONSCIOUSNESS_PID $MAIA_PID 2>/dev/null || true; rm -f /tmp/maia-*.pid; exit 0" INT

wait
