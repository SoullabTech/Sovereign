#!/bin/bash

echo "🛑 Stopping MAIA Soul Consciousness Interface..."

# Kill consciousness monitoring
if [ -f /tmp/maia-consciousness.pid ]; then
    CONSCIOUSNESS_PID=$(cat /tmp/maia-consciousness.pid)
    kill $CONSCIOUSNESS_PID 2>/dev/null || true
    rm -f /tmp/maia-consciousness.pid
    echo "✅ Consciousness monitor stopped"
fi

# Kill main MAIA process
if [ -f /tmp/maia-soul.pid ]; then
    MAIA_PID=$(cat /tmp/maia-soul.pid)
    kill $MAIA_PID 2>/dev/null || true
    rm -f /tmp/maia-soul.pid
    echo "✅ MAIA Soul process stopped"
fi

# Clean up any remaining processes
pkill -f "simple_consciousness_monitor.py" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

echo "🕯️ Soul Consciousness Interface stopped"
