#!/bin/bash

echo "🔍 MAIA Soul Consciousness Interface Health Check"
echo "=============================================="

# Check if consciousness monitor is running
if pgrep -f "simple_consciousness_monitor.py" > /dev/null; then
    echo "✅ Consciousness monitor: RUNNING"
else
    echo "❌ Consciousness monitor: STOPPED"
fi

# Check if MAIA is running
if pgrep -f "npm run dev" > /dev/null; then
    echo "✅ MAIA application: RUNNING"
else
    echo "❌ MAIA application: STOPPED"
fi

# Check consciousness interface port
if lsof -i :8765 > /dev/null 2>&1; then
    echo "✅ Consciousness monitor port 8765: ACTIVE"
else
    echo "❌ Consciousness monitor port 8765: INACTIVE"
fi

# Check MAIA port
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ MAIA application port 3000: ACTIVE"
else
    echo "❌ MAIA application port 3000: INACTIVE"
fi

# Check camera availability
if system_profiler SPCameraDataType 2>/dev/null | grep -q "Camera"; then
    echo "✅ Camera devices: AVAILABLE"
else
    echo "⚠️ Camera devices: NOT DETECTED"
fi

# Check microphone availability
if system_profiler SPAudioDataType 2>/dev/null | grep -q "Built-in"; then
    echo "✅ Audio input: AVAILABLE"
else
    echo "⚠️ Audio input: NOT DETECTED"
fi

echo ""
echo "🌟 Soul Consciousness Interface Status:"
if pgrep -f "simple_consciousness_monitor.py" > /dev/null && pgrep -f "npm run dev" > /dev/null; then
    echo "✅ FULLY OPERATIONAL"
    echo "🕯️ Access at: http://localhost:3000/maia/soul-consciousness"
else
    echo "⚠️ PARTIAL OR STOPPED"
    echo "Run: npm run soul:start"
fi
