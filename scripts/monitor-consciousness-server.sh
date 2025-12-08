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
    echo "   Resource Usage:"
    docker stats consciousness-computing-server --no-stream --format "   CPU: {{.CPUPerc}}   Memory: {{.MemUsage}}"
else
    echo "   ❌ Consciousness computing server is not running"
    echo "   Starting container..."
    docker start consciousness-computing-server || echo "   Failed to start container"
fi

# Network accessibility
echo
echo "Network Access:"
if curl -s --connect-timeout 5 http://localhost:3008/api/status > /dev/null; then
    echo "   ✅ Server is accessible on localhost:3008"
else
    echo "   ❌ Server is not accessible on localhost"
fi

# Local IP and external access
LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
if [ -n "$LOCAL_IP" ]; then
    echo "   🌐 External access: http://$LOCAL_IP:3008"

    if curl -s --connect-timeout 3 http://$LOCAL_IP:3008/api/status > /dev/null; then
        echo "   ✅ Server is accessible externally for testers"
    else
        echo "   ⚠️  Server may not be accessible externally (check firewall/network)"
    fi
else
    echo "   ⚠️  Could not determine local IP address"
fi

# Recent logs
echo
echo "Recent Container Logs:"
docker logs consciousness-computing-server --tail 5 2>/dev/null || echo "   No logs available"

echo
echo "📊 Quick Stats:"
uptime_info=$(docker inspect --format='{{.State.StartedAt}}' consciousness-computing-server 2>/dev/null)
if [ -n "$uptime_info" ]; then
    echo "   Container started: $uptime_info"
fi

echo "   Port mapping: $(docker port consciousness-computing-server 2>/dev/null || echo 'Not available')"

echo
echo "🎯 URLs for Community Commons Testers:"
echo "   Local: http://localhost:3008"
if [ -n "$LOCAL_IP" ]; then
    echo "   Network: http://$LOCAL_IP:3008"
fi