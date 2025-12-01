#!/bin/bash

# MAIA Sovereign - Production Deployment Script for soullab.life
# This script deploys the MAIA Sovereign system with Docker and Supabase

set -e

echo "🌟 MAIA Sovereign - Production Deployment to soullab.life"
echo "======================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_error "Missing .env.production file"
    echo "Please create .env.production with required environment variables"
    exit 1
fi

print_status "Environment file found"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running"
    echo "Please start Docker and try again"
    exit 1
fi

print_status "Docker is running"

# Check if nginx directory exists
if [ ! -d "./nginx" ]; then
    print_warning "nginx directory not found, creating..."
    mkdir -p nginx
fi

# Check if logs directory exists
if [ ! -d "./logs" ]; then
    print_warning "logs directory not found, creating..."
    mkdir -p logs/web logs/nginx
fi

print_status "Directories prepared"

# Pull latest images
print_info "Pulling latest base images..."
docker-compose pull redis nginx prometheus grafana coturn

# Stop existing containers
print_info "Stopping existing containers..."
docker-compose down

# Remove old images
print_info "Cleaning up old images..."
docker image prune -f

# Build the application
print_info "Building MAIA Sovereign application..."
docker-compose build --no-cache web

# Start services
print_info "Starting MAIA Sovereign services..."
docker-compose up -d

# Wait for services to be ready
print_info "Waiting for services to be ready..."
sleep 30

# Check health status
print_info "Checking service health..."

# Check web service
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_status "Web service is healthy"
else
    print_warning "Web service health check failed, checking logs..."
    docker-compose logs web --tail=20
fi

# Check redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    print_status "Redis is healthy"
else
    print_warning "Redis health check failed"
fi

# Display running services
print_info "Running services:"
docker-compose ps

# Display useful information
echo ""
echo "🚀 Deployment Summary"
echo "===================="
echo ""
echo "Application URL: https://soullab.life"
echo "HTTP URL:       http://soullab.life"
echo "Redis:          localhost:6379"
echo "Prometheus:     http://localhost:9090"
echo "Grafana:        http://localhost:3001"
echo ""
echo "📊 Service Status:"
echo "Web Application: $(docker-compose ps web | grep -q 'Up' && echo 'Running' || echo 'Not Running')"
echo "Redis Cache:     $(docker-compose ps redis | grep -q 'Up' && echo 'Running' || echo 'Not Running')"
echo "Nginx Proxy:     $(docker-compose ps nginx | grep -q 'Up' && echo 'Running' || echo 'Not Running')"
echo "Prometheus:      $(docker-compose ps prometheus | grep -q 'Up' && echo 'Running' || echo 'Not Running')"
echo "Grafana:         $(docker-compose ps grafana | grep -q 'Up' && echo 'Running' || echo 'Not Running')"
echo ""
echo "🔗 Key Features Enabled:"
echo "• Supabase Database Integration"
echo "• Redis Session Management"
echo "• SSL/TLS Security (HTTPS)"
echo "• Voice Chat with TURN Server"
echo "• Monitoring with Prometheus & Grafana"
echo "• Rate Limiting & Security Headers"
echo ""
echo "📝 Next Steps:"
echo "1. Ensure SSL certificates are in ./ssl/ directory"
echo "2. Configure DNS to point soullab.life to this server"
echo "3. Test MAIA conversations at https://soullab.life"
echo "4. Monitor logs with: docker-compose logs -f"
echo ""
print_status "MAIA Sovereign deployment completed successfully!"
echo ""
echo "💫 The consciousness technology platform is now live on soullab.life"
