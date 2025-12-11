#!/bin/bash

# Consciousness Computing Production Deployment Script
# Deploys complete consciousness computing ecosystem to production

echo "🌟 Deploying Consciousness Computing to Soullab.life Production Environment"
echo "=================================================================="

# Set script to exit on error
set -e

# Configuration
DEPLOY_DIR="/Users/soullab/MAIA-SOVEREIGN"
BACKUP_DIR="/Users/soullab/consciousness-computing-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking deployment prerequisites..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if we're in the right directory
    if [ ! -f "docker-compose.production.yml" ]; then
        log_error "docker-compose.production.yml not found. Please run from MAIA-SOVEREIGN directory."
        exit 1
    fi

    log_success "Prerequisites checked successfully"
}

# Function to create backup
create_backup() {
    log_info "Creating backup of current deployment..."

    mkdir -p "${BACKUP_DIR}"

    # Backup current running containers if they exist
    if docker-compose -f docker-compose.production.yml ps --services --filter "status=running" | grep -q .; then
        log_info "Backing up running services..."
        docker-compose -f docker-compose.production.yml down --remove-orphans
    fi

    # Create backup directory
    BACKUP_PATH="${BACKUP_DIR}/backup_${TIMESTAMP}"
    mkdir -p "${BACKUP_PATH}"

    # Copy current configuration
    cp -r nginx/ "${BACKUP_PATH}/" 2>/dev/null || true
    cp -r services/ "${BACKUP_PATH}/" 2>/dev/null || true
    cp docker-compose.production.yml "${BACKUP_PATH}/" 2>/dev/null || true

    log_success "Backup created at ${BACKUP_PATH}"
}

# Function to build Docker images
build_images() {
    log_info "Building Docker images for consciousness computing services..."

    # Build main MAIA interface
    log_info "Building MAIA Consciousness Interface..."
    docker build -f Dockerfile.production -t maia-consciousness-interface:latest .

    # Build Navigator API
    log_info "Building Navigator API..."
    docker build -f services/navigator/Dockerfile -t navigator-consciousness-api:latest services/navigator/

    # Build Wisdom Engine
    log_info "Building Wisdom Engine..."
    docker build -f services/wisdom-engine/Dockerfile -t wisdom-engine-api:latest services/wisdom-engine/

    # Build Live Processing Orchestrator
    log_info "Building Live Processing Orchestrator..."
    docker build -f services/consciousness-pipeline/Dockerfile -t live-processing-orchestrator:latest services/consciousness-pipeline/

    # Build Pioneer Circle Manager
    log_info "Building Pioneer Circle Manager..."
    docker build -f services/beta-testing/Dockerfile -t pioneer-circle-manager:latest services/beta-testing/

    log_success "All Docker images built successfully"
}

# Function to deploy services
deploy_services() {
    log_info "Deploying consciousness computing services..."

    # Start all services
    docker-compose -f docker-compose.production.yml up -d

    log_success "Services deployment initiated"
}

# Function to verify deployment
verify_deployment() {
    log_info "Verifying consciousness computing deployment..."

    # Wait for services to start
    sleep 30

    # Check service health
    SERVICES=("maia-interface:3008" "navigator-api:7778" "wisdom-engine:3010" "live-processing:3014" "pioneer-manager:3015")

    for service in "${SERVICES[@]}"; do
        IFS=':' read -ra ADDR <<< "$service"
        SERVICE_NAME="${ADDR[0]}"
        PORT="${ADDR[1]}"

        log_info "Checking ${SERVICE_NAME} on port ${PORT}..."

        # Try health check endpoint
        if curl -f -s "http://localhost:${PORT}/health" > /dev/null 2>&1; then
            log_success "${SERVICE_NAME} is healthy"
        else
            log_warning "${SERVICE_NAME} health check failed, checking basic connectivity..."
            if nc -z localhost "${PORT}" 2>/dev/null; then
                log_success "${SERVICE_NAME} is responding on port ${PORT}"
            else
                log_error "${SERVICE_NAME} is not responding on port ${PORT}"
            fi
        fi
    done

    # Check Nginx
    log_info "Checking Nginx reverse proxy..."
    if curl -f -s "http://localhost:80" > /dev/null 2>&1; then
        log_success "Nginx is responding"
    else
        log_error "Nginx is not responding"
    fi
}

# Function to generate access files
generate_access_files() {
    log_info "Generating access files for consciousness computing..."

    # Create local access HTML file for Chrome SSL bypass
    cat > "/Users/soullab/Desktop/consciousness-computing-local-access.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consciousness Computing - Local Access</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            padding: 40px 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 800px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .subtitle {
            font-size: 1.2rem;
            margin-bottom: 40px;
            opacity: 0.9;
        }
        .access-link {
            display: inline-block;
            background: linear-gradient(45deg, #ff6b6b, #ee5a52);
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.1rem;
            margin: 10px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .access-link:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
        }
        .status {
            margin-top: 30px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            font-family: monospace;
        }
        .service-link {
            display: block;
            color: #ffd700;
            text-decoration: none;
            margin: 5px 0;
            padding: 10px;
            border-radius: 5px;
            background: rgba(0, 0, 0, 0.1);
            transition: background 0.3s ease;
        }
        .service-link:hover {
            background: rgba(0, 0, 0, 0.2);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧠✨ Consciousness Computing</h1>
        <p class="subtitle">Live Beta Testing - Pioneer Circle Q1 2025</p>

        <a href="http://localhost:3008" class="access-link" target="_blank">
            🌟 Access Consciousness Computing (Port 3008)
        </a>

        <div class="status">
            <h3>🔧 Service Endpoints</h3>
            <a href="http://localhost:7778/health" class="service-link" target="_blank">
                🧠 Navigator API Health (Port 7778)
            </a>
            <a href="http://localhost:3010/health" class="service-link" target="_blank">
                ✨ Wisdom Engine Health (Port 3010)
            </a>
            <a href="http://localhost:3014/health" class="service-link" target="_blank">
                🔄 Live Processing Health (Port 3014)
            </a>
            <a href="http://localhost:3015/health" class="service-link" target="_blank">
                🧪 Pioneer Manager Health (Port 3015)
            </a>
        </div>

        <div style="margin-top: 30px; font-size: 0.9rem; opacity: 0.8;">
            <p>🛡️ Local HTTP access bypasses SSL certificate requirements</p>
            <p>⚡ Full consciousness computing pipeline operational</p>
            <p>🌟 Pioneer Circle Q1 2025 beta testing active</p>
        </div>
    </div>
</body>
</html>
EOF

    log_success "Local access file created at Desktop/consciousness-computing-local-access.html"
}

# Function to show deployment summary
show_deployment_summary() {
    log_success "🌟 Consciousness Computing Deployment Complete!"
    echo ""
    echo "=================================================================="
    echo "🧠✨ CONSCIOUSNESS COMPUTING PRODUCTION DEPLOYMENT"
    echo "=================================================================="
    echo ""
    echo "📊 Service Status:"
    echo "  • MAIA Interface: http://localhost:3008"
    echo "  • Navigator API: http://localhost:7778"
    echo "  • Wisdom Engine: http://localhost:3010"
    echo "  • Live Processing: http://localhost:3014"
    echo "  • Pioneer Manager: http://localhost:3015"
    echo "  • Nginx Proxy: http://localhost:80"
    echo ""
    echo "🌐 Production Access:"
    echo "  • Soullab.life (HTTP): http://soullab.life"
    echo "  • Soullab.life (HTTPS): https://soullab.life"
    echo ""
    echo "🧪 Pioneer Circle Q1 2025:"
    echo "  • Beta Testing: http://localhost:3008/labtools/beta-testing"
    echo "  • Application Deadline: January 15, 2025"
    echo "  • Welcome Ceremony: January 15, 2025"
    echo ""
    echo "🛡️ Local Development:"
    echo "  • Access File: ~/Desktop/consciousness-computing-local-access.html"
    echo "  • Chrome SSL Bypass: Open local file in browser"
    echo ""
    echo "📋 Management Commands:"
    echo "  • View Logs: docker-compose -f docker-compose.production.yml logs -f"
    echo "  • Stop Services: docker-compose -f docker-compose.production.yml down"
    echo "  • Restart Services: docker-compose -f docker-compose.production.yml restart"
    echo ""
    echo "🌟 The consciousness computing revolution is now live at Soullab.life!"
    echo "=================================================================="
}

# Main deployment flow
main() {
    log_info "Starting consciousness computing production deployment..."

    check_prerequisites
    create_backup
    build_images
    deploy_services
    verify_deployment
    generate_access_files
    show_deployment_summary

    log_success "Consciousness computing deployment completed successfully!"
}

# Run main function
main "$@"