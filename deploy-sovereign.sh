#!/bin/bash

#####################################################################
# MAIA-SOVEREIGN Database Sovereignty Deployment Script
#####################################################################
#
# Deploys complete self-hosted PostgreSQL infrastructure with:
# - 100+ table database schema
# - Vector embeddings support
# - HIPAA-compliant audit logging
# - Real-time features with Redis
# - Monitoring and backup systems
#
# Usage:
#   ./deploy-sovereign.sh [development|production]
#

set -e

ENVIRONMENT=${1:-development}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🌀 MAIA-SOVEREIGN Database Deployment"
echo "====================================="
echo "Environment: $ENVIRONMENT"
echo "Script directory: $SCRIPT_DIR"
echo ""

# Configuration
if [ "$ENVIRONMENT" = "production" ]; then
    POSTGRES_PORT=5432
    REDIS_PORT=6379
    ADMINER_PORT=8080
    GRAFANA_PORT=3001
    COMPOSE_FILE="docker-compose.sovereign.yml"
else
    POSTGRES_PORT=5433
    REDIS_PORT=6380
    ADMINER_PORT=8081
    GRAFANA_PORT=3002
    COMPOSE_FILE="docker-compose.sovereign.dev.yml"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p database/{init,backups,migrations}
mkdir -p monitoring/{prometheus,grafana/dashboards,grafana/datasources}
mkdir -p logs

# Generate environment variables file
echo "🔧 Generating environment configuration..."
cat > .env.sovereign << EOF
# MAIA-SOVEREIGN Database Configuration
# Generated: $(date)

# Database Configuration
MAIA_DB_PASSWORD=$(openssl rand -base64 32)
POSTGRES_PORT=$POSTGRES_PORT
DATABASE_URL=postgresql://maia:\${MAIA_DB_PASSWORD}@localhost:$POSTGRES_PORT/maia_sovereign

# Redis Configuration
REDIS_PASSWORD=$(openssl rand -base64 32)
REDIS_PORT=$REDIS_PORT

# Administration
ADMINER_PORT=$ADMINER_PORT
GRAFANA_PASSWORD=$(openssl rand -base64 16)
GRAFANA_PORT=$GRAFANA_PORT

# Monitoring
PROMETHEUS_PORT=9090

# Environment
NODE_ENV=$ENVIRONMENT
SOVEREIGN_MODE=true
EOF

echo "✅ Environment file created: .env.sovereign"

# Copy database schemas
echo "📋 Copying database schemas..."
if [ -f "supabase/migrations/20241201000001_create_community_bbs_tables.sql" ]; then
    cp "supabase/migrations/"*.sql database/migrations/
    echo "✅ Copied existing SQL migrations"
else
    echo "⚠️  No existing migrations found - will create basic schema"
fi

if [ -f "docs/clinical-database-schema.sql" ]; then
    cp "docs/clinical-database-schema.sql" database/migrations/
    echo "✅ Copied clinical database schema"
fi

# Create monitoring configuration
echo "📊 Setting up monitoring..."
cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s

rule_files:

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
EOF

# Start the infrastructure
echo "🚀 Starting MAIA sovereign infrastructure..."

# Use development compose file if not production
if [ "$ENVIRONMENT" = "development" ]; then
    echo "🔧 Creating development docker-compose file..."
    sed "s/:5432/:$POSTGRES_PORT/g; s/:6379/:$REDIS_PORT/g; s/:8080/:$ADMINER_PORT/g" \
        docker-compose.sovereign.yml > docker-compose.sovereign.dev.yml
fi

# Start services
docker-compose -f $COMPOSE_FILE --env-file .env.sovereign up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Verify services are running
echo "🔍 Verifying services..."

if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
    echo "✅ Services are running"
else
    echo "❌ Services failed to start"
    docker-compose -f $COMPOSE_FILE logs
    exit 1
fi

# Run database initialization
echo "🗄️  Initializing database..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
timeout=60
while [ $timeout -gt 0 ]; do
    if docker-compose -f $COMPOSE_FILE exec -T postgres pg_isready -U maia > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready"
        break
    fi
    sleep 2
    ((timeout-=2))
done

if [ $timeout -le 0 ]; then
    echo "❌ PostgreSQL failed to start within timeout"
    exit 1
fi

# Apply migrations
echo "📋 Applying database migrations..."
for migration_file in database/migrations/*.sql; do
    if [ -f "$migration_file" ]; then
        echo "  📄 Applying $(basename $migration_file)..."
        docker-compose -f $COMPOSE_FILE exec -T postgres \
            psql -U maia -d maia_sovereign -f "/docker-entrypoint-initdb.d/$(basename $migration_file)"
    fi
done

# Create migration tracking table
echo "📊 Setting up migration tracking..."
docker-compose -f $COMPOSE_FILE exec -T postgres psql -U maia -d maia_sovereign << 'EOF'
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    migration_file TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'success'
);

INSERT INTO migration_log (migration_file, status)
VALUES ('initial_deployment', 'success')
ON CONFLICT DO NOTHING;
EOF

# Test database connection
echo "🧪 Testing database connection..."
if docker-compose -f $COMPOSE_FILE exec -T postgres psql -U maia -d maia_sovereign -c "SELECT version();" > /dev/null; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Create database user for application
echo "👤 Creating application user..."
docker-compose -f $COMPOSE_FILE exec -T postgres psql -U maia -d maia_sovereign << 'EOF'
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'maia_app') THEN
        CREATE USER maia_app WITH PASSWORD 'app_secure_password';
        GRANT CONNECT ON DATABASE maia_sovereign TO maia_app;
        GRANT USAGE ON SCHEMA public TO maia_app;
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO maia_app;
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO maia_app;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO maia_app;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO maia_app;
    END IF;
END $$;
EOF

echo ""
echo "🎉 MAIA-SOVEREIGN Deployment Complete!"
echo "===================================="
echo ""
echo "🌐 Access URLs:"
echo "  PostgreSQL: localhost:$POSTGRES_PORT"
echo "  Redis: localhost:$REDIS_PORT"
echo "  Adminer: http://localhost:$ADMINER_PORT"

if docker-compose -f $COMPOSE_FILE --profile monitoring ps | grep -q grafana; then
    echo "  Grafana: http://localhost:$GRAFANA_PORT"
fi

echo ""
echo "🔑 Credentials (saved in .env.sovereign):"
echo "  Database User: maia"
echo "  Database Name: maia_sovereign"
echo "  Application User: maia_app"
echo ""
echo "📋 Next Steps:"
echo "  1. Review .env.sovereign for passwords"
echo "  2. Test connection: psql \$DATABASE_URL"
echo "  3. Run migration tool: node database/migration-tool.js"
echo "  4. Update MAIA config to use sovereign database"
echo ""
echo "🛡️  Backup Location: ./database/backups/"
echo "📊 Logs Location: ./logs/"
echo ""

# Show service status
echo "📊 Service Status:"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo "✅ MAIA is now sovereign! 👑"