#!/bin/bash
# Start a mock Sesame CSM server without Docker build

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🎤 Starting Mock Sesame CSM Server..."

# Check if Python is available
if ! command -v python3 >/dev/null 2>&1; then
    echo -e "${RED}❌ Python3 not found${NC}"
    exit 1
fi

# Create a temporary directory for the mock server
MOCK_DIR="/tmp/sesame-csm-mock-$$"
mkdir -p "$MOCK_DIR"

# Create the mock server script
cat > "$MOCK_DIR/server.py" << 'EOF'
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import base64

class MockSesameHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
                "status": "healthy",
                "model": "mock-csm",
                "model_loaded": True,
                "gpu_available": False,
                "provider": "Mock Sesame CSM"
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        if self.path == '/tts':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            # Create mock WAV data
            wav_header = (
                b'RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00'
                b'\x01\x00\x01\x00D\xAC\x00\x00\x88X\x01\x00'
                b'\x02\x00\x10\x00data\x00\x00\x00\x00'
            )
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response = {
                "audio": base64.b64encode(wav_header).decode(),
                "format": "wav",
                "duration": 0.1,
                "engine": "sesame-mock"
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        # Suppress request logs
        pass

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = HTTPServer(('0.0.0.0', port), MockSesameHandler)
    print(f'Mock Sesame CSM running on http://localhost:{port}')
    print(f'Health check: http://localhost:{port}/health')
    print(f'TTS endpoint: POST http://localhost:{port}/tts')
    server.serve_forever()
EOF

# Find available port
PORT=${SESAME_PORT:-8000}
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}Port $PORT is in use, finding alternative...${NC}"
    for p in 8001 8002 8003 8004 8005; do
        if ! lsof -Pi :$p -sTCP:LISTEN -t >/dev/null 2>&1; then
            PORT=$p
            break
        fi
    done
fi

# Start the server
echo -e "${BLUE}Starting mock server on port $PORT...${NC}"
cd "$MOCK_DIR"
python3 server.py $PORT &

# Store the PID
echo $! > "$MOCK_DIR/server.pid"

# Wait for server to start
sleep 2

# Test the server
if curl -s http://localhost:$PORT/health | grep -q "healthy"; then
    echo -e "${GREEN}✅ Mock Sesame server is running on port $PORT${NC}"
    echo "   PID: $(cat "$MOCK_DIR/server.pid")"
    echo "   URL: http://localhost:$PORT"
    echo "   To stop: kill $(cat "$MOCK_DIR/server.pid")"
    
    # Export the port for other scripts
    echo "export SESAME_URL=http://localhost:$PORT" > "$MOCK_DIR/env.sh"
else
    echo -e "${RED}❌ Failed to start mock server${NC}"
    exit 1
fi