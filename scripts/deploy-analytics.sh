#!/bin/bash
set -e

echo "🚀 MAIA Analytics Dashboard - Docker Deployment"
echo "================================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️  No .env file found. Creating from .env.example..."
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "✅ Created .env file. Please review and update values."
    echo ""
  else
    echo "❌ .env.example not found. Please create .env manually."
    exit 1
  fi
fi

# Check Docker installation
if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found. Please install Docker first."
  exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  echo "❌ Docker Compose not found. Please install Docker Compose first."
  exit 1
fi

# Determine docker compose command
if docker compose version &> /dev/null; then
  DOCKER_COMPOSE="docker compose"
else
  DOCKER_COMPOSE="docker-compose"
fi

# Load environment variables
set -a
source .env
set +a

echo "📋 Deployment Configuration:"
echo "   Database: ${POSTGRES_DB:-maia_consciousness}"
echo "   User: ${POSTGRES_USER:-maia}"
echo "   Port: ${POSTGRES_PORT:-5432}"
echo ""

# Build and deploy
echo "🏗️  Building Docker images..."
$DOCKER_COMPOSE -f docker-compose.analytics.yml build --no-cache

echo ""
echo "🎬 Starting services..."
$DOCKER_COMPOSE -f docker-compose.analytics.yml up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check health
echo ""
echo "🏥 Health Check:"
if curl -f http://localhost:3000/api/analytics/system &> /dev/null; then
  echo "   ✅ Analytics API: healthy"
else
  echo "   ❌ Analytics API: not responding"
fi

if docker exec maia-analytics-postgres pg_isready -U ${POSTGRES_USER:-maia} &> /dev/null; then
  echo "   ✅ PostgreSQL: healthy"
else
  echo "   ❌ PostgreSQL: not ready"
fi

echo ""
echo "================================================"
echo "✅ Deployment complete!"
echo ""
echo "📊 Analytics Dashboard: http://localhost:3000/analytics"
echo "🔧 System Health: http://localhost:3000/api/analytics/system"
echo "📥 CSV Export: http://localhost:3000/api/analytics/export/csv"
echo "🔬 Research Export: http://localhost:3000/api/analytics/export/research"
echo ""
echo "📝 View logs: $DOCKER_COMPOSE -f docker-compose.analytics.yml logs -f"
echo "🛑 Stop services: $DOCKER_COMPOSE -f docker-compose.analytics.yml down"
echo "================================================"
