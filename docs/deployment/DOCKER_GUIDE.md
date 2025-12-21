# MAIA Analytics Dashboard - Docker Deployment Guide

**Phase 4.4D - Production Deployment**

This guide covers Docker deployment of the MAIA Analytics Dashboard with PostgreSQL backend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Deployment](#deployment)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)
7. [Maintenance](#maintenance)
8. [Performance Tuning](#performance-tuning)

---

## Prerequisites

### Required Software

- **Docker**: Version 20.10 or later
- **Docker Compose**: Version 2.0 or later (or `docker compose` plugin)
- **Git**: For cloning the repository
- **curl**: For health checks and testing

### System Requirements

- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 10GB free space
- **Ports**: 3000 (app), 5432 (PostgreSQL)

### Installation

**macOS:**
```bash
brew install docker docker-compose
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose-plugin
```

**Verify installation:**
```bash
docker --version
docker compose version
```

---

## Quick Start

### 1. Clone and Configure

```bash
# Clone repository
git clone https://github.com/your-org/MAIA-SOVEREIGN.git
cd MAIA-SOVEREIGN

# Copy environment template
cp .env.example .env

# Edit configuration (optional)
nano .env
```

### 2. Deploy

```bash
# Run automated deployment script
./scripts/deploy-analytics.sh
```

### 3. Access

- **Analytics Dashboard**: http://localhost:3000/analytics
- **System Health**: http://localhost:3000/api/analytics/system
- **CSV Export**: http://localhost:3000/api/analytics/export/csv
- **Research Export**: http://localhost:3000/api/analytics/export/research

---

## Configuration

### Environment Variables

Edit `.env` file to customize deployment:

```bash
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=maia_consciousness
POSTGRES_USER=maia
POSTGRES_PASSWORD=maia_secure_pass

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=http://localhost:3000
PORT=3000

# Feature Flags
ANALYTICS_ENABLED=true
ELEMENTAL_THEMES_ENABLED=true
EXPORT_ENABLED=true
```

See `.env.example` for complete list of configuration options.

### Docker Compose Configuration

The `docker-compose.analytics.yml` file defines two services:

1. **postgres**: PostgreSQL 15 database
2. **analytics**: Next.js application

To customize ports or resources, edit this file directly.

---

## Deployment

### Automated Deployment (Recommended)

```bash
./scripts/deploy-analytics.sh
```

This script will:
1. Verify prerequisites
2. Build Docker images
3. Start services
4. Run health checks
5. Display access URLs

### Manual Deployment

```bash
# Build images
docker compose -f docker-compose.analytics.yml build

# Start services
docker compose -f docker-compose.analytics.yml up -d

# Check logs
docker compose -f docker-compose.analytics.yml logs -f
```

### Development Mode

For development with hot-reload:

```bash
# Start dev server (outside Docker)
npm run dev

# Or use docker-compose.yml for full stack
docker compose up -d
```

---

## Verification

### Health Checks

**Automated verification:**
```bash
curl http://localhost:3000/api/analytics/verify | jq
```

Expected response:
```json
{
  "ok": true,
  "results": {
    "system": "ok",
    "csv": "ok",
    "research": "ok"
  },
  "timestamp": "2025-01-XX..."
}
```

**Manual checks:**

```bash
# System health
curl http://localhost:3000/api/analytics/system

# CSV export
curl http://localhost:3000/api/analytics/export/csv

# Research export
curl http://localhost:3000/api/analytics/export/research

# Dashboard page
curl -I http://localhost:3000/analytics
```

### Container Status

```bash
# Check running containers
docker ps

# View logs
docker compose -f docker-compose.analytics.yml logs

# Check container health
docker inspect maia-analytics | jq '.[0].State.Health'
```

### Database Verification

```bash
# Connect to PostgreSQL
docker exec -it maia-analytics-postgres psql -U maia -d maia_consciousness

# List tables
\dt

# Check connection
SELECT version();
```

---

## Troubleshooting

### Issue 1: Port Already in Use

**Symptom:**
```
Error: port 3000 is already allocated
```

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or change port in .env
PORT=3001
```

### Issue 2: Database Connection Failed

**Symptom:**
```
Error: connect ECONNREFUSED localhost:5432
```

**Solution:**
```bash
# Check PostgreSQL status
docker exec maia-analytics-postgres pg_isready -U maia

# View database logs
docker logs maia-analytics-postgres

# Restart database
docker compose -f docker-compose.analytics.yml restart postgres
```

### Issue 3: Build Fails

**Symptom:**
```
ERROR: failed to build: ...
```

**Solution:**
```bash
# Clear Docker cache
docker builder prune -a

# Rebuild with no cache
docker compose -f docker-compose.analytics.yml build --no-cache

# Check disk space
df -h
```

### Issue 4: Analytics API Returns 404

**Symptom:**
```
GET /api/analytics/system → 404
```

**Solution:**
```bash
# Verify routes exist
docker exec maia-analytics ls -la app/api/analytics

# Check build output
docker logs maia-analytics

# Restart container
docker compose -f docker-compose.analytics.yml restart analytics
```

### Issue 5: Slow Performance

**Symptom:**
API response time > 200ms

**Solution:**
```bash
# Check resource usage
docker stats

# Increase PostgreSQL connections in .env
DB_POOL_MAX=50

# Enable query caching
API_CACHE_TTL=120

# Restart services
docker compose -f docker-compose.analytics.yml restart
```

### Issue 6: Theme Not Persisting

**Symptom:**
Elemental theme resets on page reload

**Solution:**
- Check browser localStorage is enabled
- Verify ElementalThemeContext is wrapping components
- Clear browser cache and reload

---

## Maintenance

### Viewing Logs

```bash
# All services
docker compose -f docker-compose.analytics.yml logs -f

# Specific service
docker compose -f docker-compose.analytics.yml logs -f analytics

# Last 100 lines
docker compose -f docker-compose.analytics.yml logs --tail=100
```

### Updating the Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.analytics.yml up -d --build
```

### Database Backup

```bash
# Create backup
docker exec maia-analytics-postgres pg_dump -U maia maia_consciousness > backup-$(date +%Y%m%d).sql

# Restore from backup
cat backup-20250121.sql | docker exec -i maia-analytics-postgres psql -U maia -d maia_consciousness
```

### Cleanup

```bash
# Stop services
docker compose -f docker-compose.analytics.yml down

# Remove volumes (WARNING: deletes data)
docker compose -f docker-compose.analytics.yml down -v

# Remove images
docker rmi maia-sovereign-analytics

# Full cleanup
docker system prune -a --volumes
```

---

## Performance Tuning

### Database Optimization

Edit `docker-compose.analytics.yml`:

```yaml
postgres:
  command: >
    postgres
    -c max_connections=100
    -c shared_buffers=256MB
    -c effective_cache_size=1GB
    -c work_mem=4MB
```

### Application Caching

In `.env`:

```bash
# Enable aggressive caching
API_CACHE_TTL=300
DB_POOL_MAX=50
DB_QUERY_TIMEOUT=3000
```

### Resource Limits

Add to `docker-compose.analytics.yml`:

```yaml
analytics:
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 2G
      reservations:
        cpus: '0.5'
        memory: 512M
```

### Monitoring

```bash
# Real-time stats
docker stats maia-analytics maia-analytics-postgres

# Health endpoint
watch -n 5 'curl -s http://localhost:3000/api/analytics/system | jq'
```

---

## Static Export (Offline Demo)

For offline demonstrations or static hosting:

```bash
# Generate static bundle
./scripts/export-static-demo.sh

# Extract and run
tar -xzf demo-bundle-*.tar.gz
cd demo-bundle-*/
./start-demo.sh
```

Access at: http://localhost:8080/analytics

---

## Production Checklist

Before deploying to production:

- [ ] Change default passwords in `.env`
- [ ] Set `SESSION_SECRET` to random string
- [ ] Configure `ALLOWED_ORIGINS` for your domain
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Set up automated backups
- [ ] Configure monitoring (Prometheus, Grafana)
- [ ] Test disaster recovery procedure
- [ ] Document custom configuration
- [ ] Set up log rotation
- [ ] Configure firewall rules

---

## Support

### Logs Location

- **Application**: `docker logs maia-analytics`
- **Database**: `docker logs maia-analytics-postgres`
- **System**: Check Docker daemon logs

### Common Commands

```bash
# Restart everything
docker compose -f docker-compose.analytics.yml restart

# View resource usage
docker stats

# Execute command in container
docker exec -it maia-analytics sh

# Inspect container
docker inspect maia-analytics

# Network troubleshooting
docker network inspect maia-analytics
```

### Getting Help

1. Check logs first: `docker compose logs`
2. Verify configuration: Review `.env` file
3. Test connectivity: Run health checks
4. Review this guide's troubleshooting section
5. Check GitHub issues: Search for similar problems

---

## Architecture Reference

```
┌─────────────────────────────────────┐
│   Client Browser                    │
│   http://localhost:3000/analytics   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Docker: maia-analytics            │
│   ┌─────────────────────────────┐   │
│   │  Next.js App (Port 3000)    │   │
│   │  - Analytics Dashboard      │   │
│   │  - API Routes               │   │
│   │  - Server Components        │   │
│   └──────────┬──────────────────┘   │
└──────────────┼──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Docker: maia-analytics-postgres   │
│   ┌─────────────────────────────┐   │
│   │  PostgreSQL 15 (Port 5432)  │   │
│   │  - maia_consciousness DB    │   │
│   │  - Persistent volume        │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

**Generated**: Phase 4.4D Day 3
**Version**: 1.0
**Last Updated**: 2025-01-21
