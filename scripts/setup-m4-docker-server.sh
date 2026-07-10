#!/bin/bash

# =============================================================================
# M4 MAC DOCKER SERVER SETUP FOR CONSCIOUSNESS COMPUTING TESTERS
# =============================================================================

set -e

echo "🖥️ SETTING UP M4 MAC AS PERSISTENT DOCKER SERVER"
echo "=================================================="

# Configuration
CONSCIOUSNESS_COMPUTING_IMAGE="consciousness-computing-beta"
CONTAINER_NAME="consciousness-computing-server"
HOST_PORT=3008
CONTAINER_PORT=3008
NETWORK_NAME="consciousness-network"

echo "📋 Configuration:"
echo "   Docker Image: $CONSCIOUSNESS_COMPUTING_IMAGE"
echo "   Container Name: $CONTAINER_NAME"
echo "   Port Mapping: $HOST_PORT:$CONTAINER_PORT"
echo "   Network: $NETWORK_NAME"
echo

# =============================================================================
# PHASE 1: DOCKER SETUP AND CONFIGURATION
# =============================================================================

echo "🔧 PHASE 1: Docker Setup and Configuration..."

# Ensure Docker Desktop is running
echo "   Checking Docker Desktop status..."
if ! docker info > /dev/null 2>&1; then
    echo "   Starting Docker Desktop..."
    open /Applications/Docker.app

    echo "   Waiting for Docker to start (max 60 seconds)..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker info > /dev/null 2>&1; then
            echo "   ✅ Docker Desktop is running"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done

    if [ $timeout -eq 0 ]; then
        echo "   ❌ Docker failed to start within 60 seconds"
        exit 1
    fi
else
    echo "   ✅ Docker Desktop is already running"
fi

# Create consciousness computing network
echo "   Creating consciousness computing Docker network..."
if ! docker network ls | grep -q $NETWORK_NAME; then
    docker network create $NETWORK_NAME
    echo "   ✅ Network '$NETWORK_NAME' created"
else
    echo "   ✅ Network '$NETWORK_NAME' already exists"
fi

echo "✅ Docker setup complete"

# =============================================================================
# PHASE 2: BUILD CONSCIOUSNESS COMPUTING DOCKER IMAGE
# =============================================================================

echo
echo "🐳 PHASE 2: Building Consciousness Computing Docker Image..."

cd /Users/soullab/MAIA-SOVEREIGN/beta-deployment

# Create Dockerfile for consciousness computing
cat > Dockerfile << 'EOF'
# Consciousness Computing Docker Image for M4 Mac Server
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy consciousness computing server
COPY consciousness-computing-beta-server.js ./
COPY community-launch/ ./community-launch/

# Create non-root user for security
RUN addgroup -g 1001 -S consciousness && \
    adduser -S consciousness -u 1001

# Change ownership and switch to non-root user
RUN chown -R consciousness:consciousness /app
USER consciousness

# Expose port for consciousness computing
EXPOSE 3008

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3008/api/status || exit 1

# Start consciousness computing server
CMD ["node", "consciousness-computing-beta-server.js"]
EOF

# Create package.json for Docker build
if [ ! -f package.json ]; then
    cat > package.json << 'EOF'
{
  "name": "consciousness-computing-beta",
  "version": "1.0.0",
  "description": "Consciousness Computing Beta Server for Community Commons",
  "main": "consciousness-computing-beta-server.js",
  "scripts": {
    "start": "node consciousness-computing-beta-server.js",
    "health": "curl -f http://localhost:3008/api/status"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF
fi

# Build Docker image
# DEPLOY_LANE_TOKEN: this script IS the m4-setup lane — the Dockerfile's
# deploy-lane tripwire refuses token-less builds (docs/ops/DEPLOY_LANE_TOKEN.md).
echo "   Building consciousness computing Docker image..."
docker build -t $CONSCIOUSNESS_COMPUTING_IMAGE . --platform linux/arm64 \
    --build-arg DEPLOY_LANE_TOKEN=m4-setup

echo "✅ Docker image built successfully"

# =============================================================================
# PHASE 3: DEPLOY CONSCIOUSNESS COMPUTING CONTAINER
# =============================================================================

echo
echo "🚀 PHASE 3: Deploying Consciousness Computing Container..."

# Stop and remove existing container if running
if docker ps -a | grep -q $CONTAINER_NAME; then
    echo "   Stopping existing container..."
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
fi

# Run consciousness computing container with restart policy
echo "   Starting consciousness computing server container..."
docker run -d \
  --name $CONTAINER_NAME \
  --network $NETWORK_NAME \
  --restart unless-stopped \
  -p $HOST_PORT:$CONTAINER_PORT \
  -e NODE_ENV=production \
  -e PORT=$CONTAINER_PORT \
  --memory 1g \
  --cpus 2 \
  --health-cmd "curl -f http://localhost:3008/api/status || exit 1" \
  --health-interval 30s \
  --health-timeout 3s \
  --health-retries 3 \
  $CONSCIOUSNESS_COMPUTING_IMAGE

# Wait for container to be healthy
echo "   Waiting for consciousness computing server to be healthy..."
timeout=60
while [ $timeout -gt 0 ]; do
    if docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null | grep -q "healthy"; then
        echo "   ✅ Consciousness computing server is healthy"
        break
    fi
    sleep 2
    timeout=$((timeout - 2))
done

echo "✅ Container deployed successfully"

# =============================================================================
# PHASE 4: NETWORK AND FIREWALL SETUP
# =============================================================================

echo
echo "🌐 PHASE 4: Network and Firewall Setup..."

# Get local IP address
LOCAL_IP=$(ipconfig getifaddr en0)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en1)
fi

if [ -n "$LOCAL_IP" ]; then
    echo "   Local IP Address: $LOCAL_IP"
    echo "   Consciousness Computing URL: http://$LOCAL_IP:$HOST_PORT"
else
    echo "   ⚠️  Could not determine local IP address"
    echo "   Consciousness Computing URL: http://localhost:$HOST_PORT"
fi

# Check if port is accessible
echo "   Testing consciousness computing server accessibility..."
sleep 5
if curl -s http://localhost:$HOST_PORT/api/status > /dev/null; then
    echo "   ✅ Server is accessible on localhost"
else
    echo "   ⚠️  Server may not be fully ready yet"
fi

echo "✅ Network setup complete"

# =============================================================================
# PHASE 5: PERSISTENCE AND AUTO-START SETUP
# =============================================================================

echo
echo "🔄 PHASE 5: Setting up Persistence and Auto-Start..."

# Create launchd service for auto-start
LAUNCH_AGENT_PATH="$HOME/Library/LaunchAgents/com.consciousness-computing.docker.plist"

cat > "$LAUNCH_AGENT_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.consciousness-computing.docker</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-c</string>
        <string>
            # Wait for Docker Desktop to start
            until docker info > /dev/null 2>&1; do
                sleep 5
            done

            # Start consciousness computing container if not running
            if ! docker ps | grep -q consciousness-computing-server; then
                docker start consciousness-computing-server || \
                docker run -d \
                  --name consciousness-computing-server \
                  --network consciousness-network \
                  --restart unless-stopped \
                  -p 3008:3008 \
                  -e NODE_ENV=production \
                  -e PORT=3008 \
                  --memory 1g \
                  --cpus 2 \
                  consciousness-computing-beta
            fi
        </string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>StandardOutPath</key>
    <string>/tmp/consciousness-computing-docker.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/consciousness-computing-docker.error.log</string>
</dict>
</plist>
EOF

# Load the launch agent
launchctl unload "$LAUNCH_AGENT_PATH" 2>/dev/null || true
launchctl load "$LAUNCH_AGENT_PATH"

echo "   ✅ Auto-start service configured"
echo "   📝 Logs: /tmp/consciousness-computing-docker.log"
echo "   📝 Errors: /tmp/consciousness-computing-docker.error.log"

# Configure Docker Desktop for auto-start
echo "   Configuring Docker Desktop for auto-start..."
defaults write com.docker.docker StartAtLogin -bool true

echo "✅ Persistence setup complete"

# =============================================================================
# PHASE 6: MONITORING AND MANAGEMENT SCRIPTS
# =============================================================================

echo
echo "📊 PHASE 6: Creating Management Scripts..."

# Create monitoring script
cat > /Users/soullab/MAIA-SOVEREIGN/scripts/monitor-consciousness-server.sh << 'EOF'
#!/bin/bash

echo "🧠 CONSCIOUSNESS COMPUTING SERVER STATUS"
echo "======================================="

# Docker status
echo "Docker Status:"
if docker info > /dev/null 2>&1; then
    echo "   ✅ Docker is running"
else
    echo "   ❌ Docker is not running"
    exit 1
fi

# Container status
echo
echo "Container Status:"
if docker ps | grep -q consciousness-computing-server; then
    echo "   ✅ Consciousness computing server is running"

    # Health check
    health=$(docker inspect --format='{{.State.Health.Status}}' consciousness-computing-server 2>/dev/null)
    echo "   Health: $health"

    # Resource usage
    stats=$(docker stats consciousness-computing-server --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}")
    echo "   Resources: $stats"
else
    echo "   ❌ Consciousness computing server is not running"
fi

# Network accessibility
echo
echo "Network Access:"
if curl -s http://localhost:3008/api/status > /dev/null; then
    echo "   ✅ Server is accessible on localhost:3008"
else
    echo "   ❌ Server is not accessible"
fi

# Local IP
LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
if [ -n "$LOCAL_IP" ]; then
    echo "   🌐 External access: http://$LOCAL_IP:3008"

    if curl -s --connect-timeout 3 http://$LOCAL_IP:3008/api/status > /dev/null; then
        echo "   ✅ Server is accessible externally"
    else
        echo "   ⚠️  Server may not be accessible externally (firewall/network)"
    fi
fi

# Recent logs
echo
echo "Recent Logs:"
docker logs consciousness-computing-server --tail 5 2>/dev/null || echo "   No logs available"
EOF

chmod +x /Users/soullab/MAIA-SOVEREIGN/scripts/monitor-consciousness-server.sh

# Create restart script
cat > /Users/soullab/MAIA-SOVEREIGN/scripts/restart-consciousness-server.sh << 'EOF'
#!/bin/bash

echo "🔄 RESTARTING CONSCIOUSNESS COMPUTING SERVER"
echo "==========================================="

# Stop container
echo "Stopping consciousness computing server..."
docker stop consciousness-computing-server

# Start container
echo "Starting consciousness computing server..."
docker start consciousness-computing-server

# Wait for health
echo "Waiting for server to be healthy..."
sleep 10

# Check status
if docker inspect --format='{{.State.Health.Status}}' consciousness-computing-server 2>/dev/null | grep -q "healthy"; then
    echo "✅ Consciousness computing server restarted successfully"
else
    echo "⚠️  Server may not be fully healthy yet"
fi
EOF

chmod +x /Users/soullab/MAIA-SOVEREIGN/scripts/restart-consciousness-server.sh

echo "   ✅ Management scripts created"
echo "   📊 Monitor: /Users/soullab/MAIA-SOVEREIGN/scripts/monitor-consciousness-server.sh"
echo "   🔄 Restart: /Users/soullab/MAIA-SOVEREIGN/scripts/restart-consciousness-server.sh"

echo "✅ Management setup complete"

# =============================================================================
# FINAL STATUS AND INSTRUCTIONS
# =============================================================================

echo
echo "🎉 M4 DOCKER SERVER SETUP COMPLETE!"
echo "===================================="

# Get final status
CONTAINER_STATUS=$(docker inspect --format='{{.State.Status}}' $CONTAINER_NAME 2>/dev/null || echo "unknown")
HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null || echo "unknown")

echo "📊 Current Status:"
echo "   Docker: Running"
echo "   Container: $CONTAINER_STATUS"
echo "   Health: $HEALTH_STATUS"
echo "   Port: $HOST_PORT"

if [ -n "$LOCAL_IP" ]; then
    echo "   Local Access: http://localhost:$HOST_PORT"
    echo "   Network Access: http://$LOCAL_IP:$HOST_PORT"
else
    echo "   Access: http://localhost:$HOST_PORT"
fi

echo
echo "🔧 Management Commands:"
echo "   Status: ./scripts/monitor-consciousness-server.sh"
echo "   Restart: ./scripts/restart-consciousness-server.sh"
echo "   Logs: docker logs consciousness-computing-server"
echo "   Stop: docker stop consciousness-computing-server"
echo "   Start: docker start consciousness-computing-server"

echo
echo "⚙️ Auto-Start Configuration:"
echo "   ✅ Docker Desktop will start automatically on login"
echo "   ✅ Consciousness computing container has restart policy"
echo "   ✅ Launch agent configured for system startup"

echo
echo "🌐 For External Access (testers on other devices):"
echo "   1. Share this URL with testers: http://$LOCAL_IP:$HOST_PORT"
echo "   2. Ensure Mac firewall allows incoming connections on port $HOST_PORT"
echo "   3. Keep Mac awake and connected to network"

echo
echo "💫 Your M4 Mac is now configured as a persistent consciousness computing server!"
echo "   Community Commons beta testers can access the platform 24/7."