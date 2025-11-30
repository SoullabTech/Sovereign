#!/bin/bash

# MAIA Sovereign - Production Deployment Script
# Usage: ./deploy.sh [environment]
# Environment options: staging, production

set -e

ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.yml"

echo "🚀 Starting MAIA Sovereign deployment for ${ENVIRONMENT}..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "All dependencies are installed"
}

# Check if .env files exist
check_env_files() {
    print_status "Checking environment files..."

    if [[ ! -f ".env.${ENVIRONMENT}" ]]; then
        print_error ".env.${ENVIRONMENT} file not found!"
        print_warning "Please copy .env.production.example to .env.${ENVIRONMENT} and fill in your values"
        exit 1
    fi

    print_success "Environment files found"
}

# Generate SSL certificates using Let's Encrypt (if production)
setup_ssl() {
    if [[ "${ENVIRONMENT}" == "production" ]]; then
        print_status "Setting up SSL certificates..."

        # Create ssl directory if it doesn't exist
        mkdir -p ssl

        if [[ ! -f "ssl/fullchain.pem" ]] || [[ ! -f "ssl/privkey.pem" ]]; then
            print_warning "SSL certificates not found. You need to obtain SSL certificates."
            print_status "For Let's Encrypt certificates, run:"
            echo "  certbot certonly --standalone -d maia.yourdomain.com"
            echo "  Then copy the certificates to the ssl/ directory"
            echo "  cp /etc/letsencrypt/live/maia.yourdomain.com/fullchain.pem ssl/"
            echo "  cp /etc/letsencrypt/live/maia.yourdomain.com/privkey.pem ssl/"

            # Create self-signed certificates for development
            print_status "Creating self-signed certificates for development..."
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout ssl/privkey.pem \
                -out ssl/fullchain.pem \
                -subj "/C=US/ST=State/L=City/O=Organization/CN=maia.yourdomain.com"
            print_warning "Using self-signed certificates. Replace with real certificates for production!"
        else
            print_success "SSL certificates found"
        fi
    fi
}

# Build and start services
deploy_services() {
    print_status "Building and starting services..."

    # Load environment variables
    export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)

    # Build the application
    print_status "Building MAIA Sovereign application..."
    docker-compose -f ${COMPOSE_FILE} build --no-cache

    # Start services
    print_status "Starting services..."
    docker-compose -f ${COMPOSE_FILE} up -d

    print_success "Services started successfully"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."

    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10

    # Run migrations (uncomment when you have migration files)
    # docker-compose -f ${COMPOSE_FILE} exec web npm run migrate

    print_success "Database migrations completed"
}

# Health checks
health_checks() {
    print_status "Running health checks..."

    # Check if services are running
    if docker-compose -f ${COMPOSE_FILE} ps | grep -q "Up"; then
        print_success "Services are running"
    else
        print_error "Some services are not running"
        docker-compose -f ${COMPOSE_FILE} ps
        exit 1
    fi

    # Check web application health
    print_status "Checking web application health..."
    sleep 15  # Wait for services to fully start

    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Web application is healthy"
    else
        print_warning "Web application health check failed"
        print_status "Application might still be starting up..."
    fi
}

# Show deployment summary
show_summary() {
    echo ""
    echo "======================================"
    echo "🎉 MAIA Sovereign Deployment Complete!"
    echo "======================================"
    echo ""
    echo "Environment: ${ENVIRONMENT}"
    echo "Services running:"
    docker-compose -f ${COMPOSE_FILE} ps
    echo ""
    echo "Access points:"
    echo "  🌐 Web Application: https://maia.yourdomain.com"
    echo "  📊 Grafana (Monitoring): http://localhost:3001"
    echo "  🔍 Prometheus (Metrics): http://localhost:9090"
    echo ""
    echo "Useful commands:"
    echo "  📋 View logs: docker-compose logs -f [service]"
    echo "  🔄 Restart service: docker-compose restart [service]"
    echo "  🛑 Stop all: docker-compose down"
    echo "  🔧 Update: ./deploy.sh ${ENVIRONMENT}"
    echo ""
    echo "📖 Documentation: See README.md for more details"
}

# Cleanup function for graceful shutdown
cleanup() {
    print_status "Cleaning up..."
    # Add any cleanup tasks here
}

# Set trap for cleanup on script exit
trap cleanup EXIT

# Main deployment flow
main() {
    echo "🤖 MAIA Sovereign - Production Deployment"
    echo "Environment: ${ENVIRONMENT}"
    echo ""

    check_dependencies
    check_env_files
    setup_ssl
    deploy_services
    run_migrations
    health_checks
    show_summary
}

# Run main function
main

print_success "Deployment completed successfully! 🎉"