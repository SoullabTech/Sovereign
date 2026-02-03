#!/bin/bash

# ===============================================
# SOULLAB PRODUCTION DEPLOYMENT SCRIPT
# Sacred Technology Platform - soullab.life
# ===============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# ===============================================
# PRE-DEPLOYMENT CHECKS
# ===============================================

log "🔮 Starting Soullab production deployment..."

# Check required environment variables
check_env_vars() {
    log "Checking environment variables..."

    required_vars=(
        "SUPABASE_URL"
        "SUPABASE_SERVICE_ROLE_KEY"
        "OPENAI_API_KEY"
        "JWT_SECRET"
        "REDIS_URL"
        "DOMAIN"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required environment variable $var is not set"
        fi
    done

    log "✅ Environment variables validated"
}

# Check SSL certificates
check_ssl() {
    log "Checking SSL certificates..."

    if [ ! -f "$SSL_CERT_PATH" ] || [ ! -f "$SSL_KEY_PATH" ]; then
        warn "SSL certificates not found. HTTPS will not be available."
    else
        log "✅ SSL certificates found"
    fi
}

# Test database connection
test_database() {
    log "Testing database connection..."

    if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        log "✅ Database connection successful"
    else
        error "Cannot connect to database"
    fi
}

# Test Redis connection
test_redis() {
    log "Testing Redis connection..."

    if redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1; then
        log "✅ Redis connection successful"
    else
        error "Cannot connect to Redis"
    fi
}

# ===============================================
# DATABASE MIGRATIONS
# ===============================================

run_migrations() {
    log "Running database migrations..."

    # Run Supabase migrations
    if command -v supabase &> /dev/null; then
        supabase db push
        log "✅ Supabase migrations completed"
    else
        warn "Supabase CLI not found, running migrations manually..."
        psql "$DATABASE_URL" -f "./supabase/migrations/20250529_production_deployment.sql"
        log "✅ Manual migrations completed"
    fi
}

# ===============================================
# APPLICATION BUILD
# ===============================================

build_application() {
    log "Building application..."

    # Install dependencies
    npm ci --only=production

    # Build TypeScript
    npm run build

    # Verify build
    if [ ! -d "dist" ]; then
        error "Build failed - dist directory not found"
    fi

    log "✅ Application built successfully"
}

# ===============================================
# BACKUP SETUP
# ===============================================

setup_backups() {
    log "Setting up backup systems..."

    # Create backup directories
    mkdir -p /var/backups/soullab/{database,redis,files}

    # Set up database backup cron job
    cat > /tmp/backup-cron << EOF
# Soullab database backup - daily at 2 AM
0 2 * * * /opt/soullab/scripts/backup-database.sh
# Redis backup - every 6 hours
0 */6 * * * /opt/soullab/scripts/backup-redis.sh
EOF

    crontab /tmp/backup-cron
    rm /tmp/backup-cron

    log "✅ Backup systems configured"
}

# ===============================================
# MONITORING SETUP
# ===============================================

setup_monitoring() {
    log "Setting up monitoring..."

    # Create log directories
    mkdir -p /var/log/soullab

    # Set up log rotation
    cat > /etc/logrotate.d/soullab << EOF
/var/log/soullab/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        systemctl reload soullab
    endscript
}
EOF

    log "✅ Monitoring configured"
}

# ===============================================
# SECURITY HARDENING
# ===============================================

setup_security() {
    log "Applying security hardening..."

    # Set proper file permissions
    chmod 600 .env.production
    chmod -R 755 dist/
    chown -R www-data:www-data dist/

    # Configure firewall (if ufw is available)
    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp    # SSH
        ufw allow 80/tcp    # HTTP
        ufw allow 443/tcp   # HTTPS
        ufw --force enable
    fi

    log "✅ Security hardening applied"
}

# ===============================================
# SERVICE CONFIGURATION
# ===============================================

setup_systemd_service() {
    log "Setting up systemd service..."

    cat > /etc/systemd/system/soullab.service << EOF
[Unit]
Description=Soullab Sacred Technology Platform
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/soullab
Environment=NODE_ENV=production
EnvironmentFile=/opt/soullab/.env.production
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=soullab

# Security settings
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/soullab/logs /tmp

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable soullab

    log "✅ Systemd service configured"
}

# ===============================================
# NGINX CONFIGURATION
# ===============================================

setup_nginx() {
    log "Setting up Nginx configuration..."

    cat > /etc/nginx/sites-available/soullab << EOF
# Soullab Sacred Technology Platform
server {
    listen 80;
    server_name soullab.life www.soullab.life;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name soullab.life www.soullab.life;

    ssl_certificate $SSL_CERT_PATH;
    ssl_certificate_key $SSL_KEY_PATH;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Static files
    location / {
        root /opt/soullab/frontend/dist;
        try_files \$uri \$uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
EOF

    ln -sf /etc/nginx/sites-available/soullab /etc/nginx/sites-enabled/
    nginx -t
    systemctl reload nginx

    log "✅ Nginx configured"
}

# ===============================================
# DEPLOYMENT EXECUTION
# ===============================================

main() {
    log "🌟 Deploying Sacred Technology Platform..."

    # Pre-deployment checks
    check_env_vars
    check_ssl
    test_database
    test_redis

    # Application deployment
    build_application
    run_migrations

    # Infrastructure setup
    setup_backups
    setup_monitoring
    setup_security
    setup_systemd_service
    setup_nginx

    # Start services
    systemctl start soullab
    systemctl status soullab

    log "🎉 Soullab deployment completed successfully!"
    log "🔮 Sacred Technology Platform is now live at https://soullab.life"
    log ""
    log "Next steps:"
    log "1. Verify the application is accessible at https://soullab.life"
    log "2. Run post-deployment health checks"
    log "3. Monitor system logs for any issues"
    log "4. Set up DNS records if not already configured"
    log ""
    log "May your technology serve the highest good! 🙏"
}

# Run deployment
main "$@"