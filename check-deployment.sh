#!/bin/bash

# MAIA Sovereign - Deployment Readiness Check

echo "🔍 Checking MAIA Sovereign deployment readiness..."
echo "=============================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1"
        return 1
    fi
}

# Check files
echo -e "${YELLOW}📁 Files & Configuration:${NC}"
[ -f "Dockerfile" ] && check_status "Dockerfile exists" || check_status "Dockerfile missing"
[ -f "docker-compose.yml" ] && check_status "docker-compose.yml exists" || check_status "docker-compose.yml missing"
[ -f ".env.production" ] && check_status ".env.production exists" || check_status ".env.production missing"
[ -f "nginx/nginx.conf" ] && check_status "Nginx config exists" || check_status "Nginx config missing"
[ -f "ssl/fullchain.pem" ] && check_status "SSL certificate exists" || check_status "SSL certificate missing"
[ -f "ssl/privkey.pem" ] && check_status "SSL private key exists" || check_status "SSL private key missing"

echo ""
echo -e "${YELLOW}🔧 Build Configuration:${NC}"
[ -f "next.config.js" ] && check_status "Next.js config exists" || check_status "Next.js config missing"
[ -f "package.json" ] && check_status "package.json exists" || check_status "package.json missing"
[ -f "app/api/health/route.ts" ] && check_status "Health endpoint exists" || check_status "Health endpoint missing"

echo ""
echo -e "${YELLOW}🌐 Environment Configuration:${NC}"
if [ -f ".env.production" ]; then
    grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.production && check_status "Supabase URL configured" || check_status "Supabase URL missing"
    grep -q "soullab.life" .env.production && check_status "Domain configured for soullab.life" || check_status "Domain not configured"
    grep -q "ANTHROPIC_API_KEY" .env.production && check_status "Anthropic API key configured" || check_status "Anthropic API key missing"
fi

echo ""
echo -e "${YELLOW}🐋 Docker Services:${NC}"
docker info > /dev/null 2>&1 && check_status "Docker is running" || check_status "Docker is not running"
docker-compose config > /dev/null 2>&1 && check_status "Docker Compose config valid" || check_status "Docker Compose config invalid"

echo ""
echo -e "${YELLOW}📊 Summary:${NC}"
echo "• Application: MAIA Sovereign consciousness platform"
echo "• Domain: soullab.life"
echo "• Database: Supabase (external)"
echo "• Cache: Redis (containerized)"
echo "• Proxy: Nginx with SSL/TLS"
echo "• Voice: TURN server for WebRTC"
echo "• Monitoring: Prometheus + Grafana"
echo ""
echo "🚀 Ready to deploy with: ./deploy.sh"
echo ""
