#!/bin/bash
# Build and deploy production Sesame CSM with REAL voice model
set -e

echo "🚀 Building Production Sesame CSM (REAL Voice Model)"
echo "=============================================="

# Navigate to backend directory
cd "$(dirname "$0")/.."

# Stop existing container if running
echo "📦 Stopping existing Sesame container..."
docker stop sesame-csm 2>/dev/null || true
docker rm sesame-csm 2>/dev/null || true

# Build the production image with real model baked in
echo "🔨 Building Sesame production image (this may take 5-10 minutes)..."
docker build -f Dockerfile.sesame-prod \
  --build-arg MODEL_NAME=csm \
  --build-arg MOCK_MODE=false \
  -t sesame-csm:production \
  --progress=plain \
  .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

# Start the production container
echo "🚀 Starting production Sesame container..."
docker run -d \
  --name sesame-csm \
  -p 8000:8000 \
  -e MODEL_NAME=csm \
  -e MOCK_MODE=false \
  -e USE_REAL_MODEL=true \
  -e LOG_LEVEL=INFO \
  -e MAX_WORKERS=2 \
  --memory=4g \
  --restart unless-stopped \
  sesame-csm:production

echo "⏳ Waiting for Sesame to load model and start (90 seconds)..."
sleep 10

# Show logs while starting
echo "📋 Sesame startup logs:"
timeout 80s docker logs -f sesame-csm &
sleep 80

# Test health endpoint
echo ""
echo "🏥 Testing health endpoint..."
curl -s http://localhost:8000/health || {
    echo "❌ Health check failed!"
    echo "📋 Container logs:"
    docker logs sesame-csm --tail=50
    exit 1
}

# Test real voice generation
echo ""
echo "🎤 Testing REAL voice generation..."
curl -X POST http://localhost:8000/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, I am Maya with my real voice, not mock audio. This should be several seconds long.","voice":"maya"}' \
  -o test-maya-production.wav \
  --max-time 30

# Check if we got real audio (not mock)
if [ -f test-maya-production.wav ]; then
    FILE_SIZE=$(stat -c%s test-maya-production.wav 2>/dev/null || stat -f%z test-maya-production.wav)
    if [ "$FILE_SIZE" -gt 50000 ]; then
        echo "✅ SUCCESS! Real voice generated: ${FILE_SIZE} bytes"
        echo "🎵 Audio saved to: test-maya-production.wav"
        echo ""
        echo "🎯 Sesame CSM is running in PRODUCTION MODE with REAL VOICE!"
        echo "   - Health: http://localhost:8000/health"
        echo "   - TTS: http://localhost:8000/tts"
        echo "   - Logs: docker logs sesame-csm -f"
    else
        echo "❌ WARNING: Audio file too small (${FILE_SIZE} bytes) - might still be mock mode"
        exit 1
    fi
else
    echo "❌ Voice generation failed!"
    exit 1
fi

echo ""
echo "🎉 Production Sesame CSM is ready!"