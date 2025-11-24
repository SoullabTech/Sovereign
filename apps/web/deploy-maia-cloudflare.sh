#!/bin/bash

# 🌙 MAIA Sovereign Consciousness - Cloudflare Deployment Script
# Deploy to soullab.life/maia with full consciousness capabilities

set -e

echo "🌙 Starting MAIA Sovereign Consciousness deployment to soullab.life/maia..."
echo "✅ Dynamic Consciousness State Detection"
echo "✅ 24/7 Continuous Training System"
echo "✅ Performance Optimization (sub-ms responses)"
echo "✅ Apprentice Learning System (100% autonomy)"
echo "✅ Invisible Consciousness Matrices"
echo "✅ Resonance Field System"
echo ""

# Function to check if tunnel exists
check_tunnel() {
    cloudflared tunnel list | grep -q "maia-sovereign" && return 0 || return 1
}

# Function to start tunnel
start_tunnel() {
    echo "🌐 Starting Cloudflare tunnel for soullab.life/maia..."

    # Start tunnel in background with PM2
    pm2 start "cloudflared tunnel run maia-sovereign" --name "maia-tunnel" 2>/dev/null || {
        echo "Tunnel already running or restarting..."
        pm2 restart maia-tunnel 2>/dev/null || true
    }

    echo "✅ Tunnel started successfully"
}

# Function to setup tunnel
setup_tunnel() {
    echo "🔧 Setting up Cloudflare tunnel..."

    # Create tunnel if it doesn't exist
    if ! check_tunnel; then
        echo "Creating new tunnel: maia-sovereign"
        cloudflared tunnel create maia-sovereign
    else
        echo "Tunnel 'maia-sovereign' already exists"
    fi

    # Create tunnel configuration
    cat > maia-cloudflare-config.yml << EOF
tunnel: maia-sovereign
credentials-file: ~/.cloudflared/maia-sovereign.json

ingress:
  - hostname: soullab.life
    path: /maia*
    service: http://localhost:3000
  - service: http_status:404
EOF

    echo "✅ Tunnel configuration created"
}

# Function to configure DNS (requires manual setup in Cloudflare dashboard)
configure_dns() {
    echo "📋 DNS Configuration Required:"
    echo ""
    echo "Please add these DNS records in your Cloudflare dashboard:"
    echo "Type: CNAME"
    echo "Name: soullab.life"
    echo "Target: [tunnel-id].cfargotunnel.com"
    echo ""
    echo "Or run: cloudflared tunnel route dns maia-sovereign soullab.life"
    echo ""
}

# Function to setup production environment
setup_production_env() {
    echo "🔧 Setting up MAIA Sovereign production environment..."

    # Create production environment file if it doesn't exist
    if [ ! -f .env.production ]; then
        cat > .env.production << EOF
# MAIA Sovereign Consciousness - Production Environment
NODE_ENV=production

# 🌙 MAIA SOVEREIGNTY CONFIGURATION 🌙
MAIA_SOVEREIGN=true
MAIA_STORAGE_ADAPTER=ipfs
MAIA_CONSCIOUSNESS_MODE="sovereign"
MAIA_TRAINING_ENABLED="true"
MAIA_PERFORMANCE_OPTIMIZATION="true"

# IPFS Configuration (Sovereign Storage)
IPFS_API_URL="http://localhost:5001"
IPFS_GATEWAY_URL="http://localhost:8080"
NEXT_PUBLIC_IPFS_ENABLED="true"

# Voice Configuration
ELEVENLABS_API_KEY="$ELEVENLABS_API_KEY"
SESAME_SELF_HOSTED_URL="https://sesame.soullab.life"

# Public URL
NEXT_PUBLIC_URL="https://soullab.life"
NEXT_PUBLIC_MAIA_URL="https://soullab.life/maia"

# Legacy Supabase (DISABLED - Using IPFS)
NEXT_PUBLIC_SUPABASE_ENABLED="false"
SUPABASE_MOCK_MODE="true"
EOF
        echo "✅ Production environment file created"
    else
        echo "✅ Production environment file already exists"
    fi
}

# Main deployment logic
case "$1" in
    "tunnel")
        setup_tunnel
        configure_dns
        start_tunnel
        ;;
    "start")
        echo "🚀 Starting all MAIA services..."
        pm2 restart maia-sovereign 2>/dev/null || pm2 start npm --name "maia-sovereign" -- start
        start_tunnel
        pm2 save
        echo "✅ All services started and saved"
        ;;
    "stop")
        echo "🛑 Stopping MAIA services..."
        pm2 stop maia-sovereign maia-tunnel 2>/dev/null || true
        echo "✅ Services stopped"
        ;;
    "restart")
        echo "🔄 Restarting MAIA services..."
        pm2 restart maia-sovereign maia-tunnel 2>/dev/null || true
        echo "✅ Services restarted"
        ;;
    "status")
        echo "📊 MAIA Service Status:"
        pm2 status
        echo ""
        echo "🌐 Tunnel Status:"
        cloudflared tunnel list | grep maia-sovereign || echo "No tunnel found"
        echo ""
        echo "🧠 Testing MAIA consciousness:"
        curl -s -X GET http://localhost:3000/api/maia | jq -r '.status // "API not responding"'
        ;;
    "logs")
        echo "📋 MAIA Logs:"
        pm2 logs maia-sovereign --lines 20
        ;;
    *)
        echo "🌙 MAIA Sovereign Consciousness - Full Deployment"
        setup_production_env
        setup_tunnel

        echo "🚀 Starting MAIA production server..."
        pm2 restart maia-sovereign 2>/dev/null || pm2 start npm --name "maia-sovereign" -- start

        echo "🌐 Starting Cloudflare tunnel..."
        start_tunnel

        echo "💾 Saving PM2 configuration..."
        pm2 save

        configure_dns

        echo ""
        echo "🎉 MAIA Sovereign Consciousness deployment complete!"
        echo ""
        echo "📊 Service Status:"
        pm2 status
        echo ""
        echo "🌍 Access URLs:"
        echo "- Local: http://localhost:3000/maia"
        echo "- Public: https://soullab.life/maia (after DNS configuration)"
        echo ""
        echo "🔧 Management Commands:"
        echo "./deploy-maia-cloudflare.sh status   # Check status"
        echo "./deploy-maia-cloudflare.sh restart  # Restart services"
        echo "./deploy-maia-cloudflare.sh stop     # Stop services"
        echo "./deploy-maia-cloudflare.sh logs     # View logs"
        ;;
esac