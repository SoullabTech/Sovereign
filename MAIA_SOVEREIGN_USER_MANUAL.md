# MAIA Sovereign Fail-Proof Management System
## User Manual & Operations Guide

*Version 2.0 - Complete Solo Developer Management System*

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Quick Start Guide](#quick-start-guide)
3. [Control Center Usage](#control-center-usage)
4. [Environment Management](#environment-management)
5. [Monitoring & Health Checks](#monitoring--health-checks)
6. [Soulguard AI Intelligence](#soulguard-ai-intelligence)
7. [Backup & Recovery](#backup--recovery)
8. [Emergency Procedures](#emergency-procedures)
9. [Common Workflows](#common-workflows)
10. [Troubleshooting](#troubleshooting)

---

## System Overview

### What This System Does
The MAIA Sovereign Fail-Proof Management System provides a complete solo developer operations platform that allows you to:

- **Safely test and deploy** without taking production offline
- **Monitor system health** through multiple layers of intelligence
- **Automatically backup** and recover from failures
- **Manage multiple environments** (Production, Staging, Development)
- **Receive intelligent alerts** through Soulguard AI monitoring
- **Control everything** from an interactive command center

### Architecture Overview
```
┌─── Production (https://soullab.life) ────┐
│    Docker + Nginx + PostgreSQL + Redis   │
├─── Staging (localhost:3010) ─────────────┤
│    Parallel testing environment          │
├─── Development (localhost:3000-3006) ────┤
│    Live development with hot reload      │
├─── Monitoring (Prometheus + Grafana) ────┤
│    Real-time metrics and dashboards      │
├─── Soulguard AI ─────────────────────────┤
│    Archetypal intelligence monitoring    │
└─── Control Center ───────────────────────┘
     Interactive management interface
```

---

## Quick Start Guide

### Daily Startup Sequence
```bash
# 1. Start the control center
./scripts/maia-control-center.sh

# 2. Or use individual commands
npm run dev           # Development server
npm run staging       # Staging environment
npm run production    # Production management
```

### Key Locations
- **Control Center**: `./scripts/maia-control-center.sh`
- **Health Checks**: `./scripts/check-deployment.sh`
- **Process Cleanup**: `./scripts/stop-all-dev.sh`
- **Backups**: `./backups/` directory
- **Logs**: `./logs/` directory
- **Configuration**: `./config/ecosystem.config.js`

---

## Control Center Usage

### Launching the Control Center
```bash
./scripts/maia-control-center.sh
```

### Main Menu Options

#### 1. System Status & Health
- **Real-time status** of all environments
- **Docker container** health
- **Process monitoring**
- **Resource usage** (CPU, Memory, Load)

#### 2. Environment Management
- **Start/Stop** development servers
- **Switch between** environments
- **Parallel testing** setup
- **Port management** (avoid conflicts)

#### 3. Deployment Operations
- **Production deployment** with rollback
- **Staging testing** before production
- **Health verification** after deployment
- **Automatic backup** before changes

#### 4. Monitoring Dashboard
- **Soulguard status** (AI monitoring)
- **Container health** overview
- **Performance metrics**
- **Recent alerts** and notifications

#### 5. Backup & Recovery
- **Manual backup** creation
- **Backup rotation** management
- **Recovery procedures**
- **Backup verification**

#### 6. Emergency Tools
- **Kill all processes** (clean slate)
- **Docker restart** procedures
- **System recovery** steps
- **Emergency contacts/procedures**

---

## Environment Management

### Production Environment
- **URL**: https://soullab.life
- **Port**: 80/443 (Docker + Nginx)
- **Database**: Production PostgreSQL
- **Redis**: Production cache
- **Status**: Always stable, never take down

### Staging Environment
- **URL**: http://localhost:3010
- **Purpose**: Test changes before production
- **Database**: Staging PostgreSQL (port 5433)
- **Redis**: Staging cache (port 6380)
- **Use**: Safe testing with production-like setup

### Development Environment
- **Primary**: http://localhost:3000
- **Alternatives**: localhost:3005, 3006 (conflict resolution)
- **Features**: Hot reload, debug mode, fast iteration
- **Database**: Development/local connection

### Environment Switching
```bash
# Switch to different environments
npm run dev           # Development (3000)
npm run dev:staging   # Development staging mode
npm run staging       # Full staging environment (3010)
npm run production    # Production management

# Alternative ports for conflicts
DISABLE_ESLINT_PLUGIN=true PORT=3005 npm run dev
DISABLE_ESLINT_PLUGIN=true PORT=3006 npm run dev
```

---

## Monitoring & Health Checks

### Automated Health Monitoring
```bash
# Manual health check
./scripts/check-deployment.sh

# Continuous monitoring (via PM2)
pm2 start ecosystem.config.js
```

### Health Check Components
1. **Production API** endpoints
2. **Database** connectivity
3. **Redis** cache status
4. **Docker** container health
5. **Disk space** and resources
6. **SSL certificates**
7. **Network connectivity**

### Grafana Dashboard
- **URL**: http://localhost:3001
- **Metrics**: CPU, Memory, Network, Application performance
- **Alerts**: Configurable thresholds
- **History**: Performance trends over time

### Prometheus Metrics
- **URL**: http://localhost:9090
- **Data**: Raw metrics collection
- **Targets**: All system components
- **Retention**: Configurable storage period

---

## Soulguard AI Intelligence

### What Soulguard Does
Soulguard provides **archetypal intelligence** monitoring that interprets system states through elemental consciousness patterns, going beyond traditional metrics.

### Elemental Analysis

#### 🔥 FIRE - System Overload Detection
- **Monitors**: CPU usage, memory saturation, load spikes
- **Triggers**: >80% resource utilization, sustained high load
- **Meaning**: "The system burns with intensity"
- **Actions**: Scale resources, implement load shedding

#### 🌊 WATER - Process Stagnation Analysis
- **Monitors**: Hung processes, stagnant connections, flow blockages
- **Triggers**: High cumulative CPU with low current activity
- **Meaning**: "Water energy blocked, flow requires clearing"
- **Actions**: Restart stagnant services, clear connection pools

#### 🌍 EARTH - Configuration Drift Monitoring
- **Monitors**: File changes, environment misalignment
- **Triggers**: MD5 hash changes in critical config files
- **Meaning**: "Earth energy shifting, foundation requires attention"
- **Actions**: Review configuration changes, update deployment

#### 💨 AIR - Communication Error Detection
- **Monitors**: API failures, network issues, connectivity problems
- **Triggers**: Failed HTTP requests, DNS resolution errors
- **Meaning**: "Air element disturbed, communication channels disrupted"
- **Actions**: Check network connectivity, verify service status

#### ✨ AETHER - Orchestration Fault Analysis
- **Monitors**: Service integration issues, timing problems
- **Triggers**: Container failures, PM2 process issues, slow response times
- **Meaning**: "Aether plane disrupted, orchestration requires rebalancing"
- **Actions**: Restart failed services, verify orchestration configuration

### Running Soulguard

#### Manual Analysis
```bash
# Single archetypal analysis
python3 soulguard/soulguard.py --test

# Start continuous monitoring
python3 soulguard/soulguard.py
```

#### Via PM2 (Recommended)
```bash
# Start with process manager
pm2 start ecosystem.config.js

# Check Soulguard status
pm2 status soulguard
pm2 logs soulguard
```

### Soulguard Configuration
```bash
# Set webhook for alerts
export SOULGUARD_WEBHOOK="https://discord.com/api/webhooks/your-webhook"

# Set monitoring interval (seconds)
export SOULGUARD_INTERVAL=900  # 15 minutes
```

---

## Backup & Recovery

### Automated Backups
```bash
# Manual backup creation
./scripts/maia-auto-backup.sh

# Via PM2 (automatic daily at 3 AM)
pm2 start ecosystem.config.js  # Includes backup daemon
```

### Backup Features
- **Timestamped**: Each backup has unique timestamp
- **Rotation**: Keeps latest 10 backups automatically
- **Compression**: tar.gz format for space efficiency
- **Exclusions**: Automatically excludes .next, node_modules, logs
- **Symlink**: Always points to latest backup

### Backup Contents
- Application code (`app/`, `lib/`, `components/`, `pages/`)
- Configuration files (`package.json`, `next.config.js`, `docker-compose.yml`)
- Scripts and documentation
- Environment templates

### Recovery Procedure
```bash
# List available backups
ls -la backups/

# Restore from specific backup
cd backups/
tar -xzf maia-backup-YYYYMMDD_HHMMSS.tar.gz

# Or restore from latest
tar -xzf latest.tar.gz
```

---

## Emergency Procedures

### 🚨 Complete System Recovery

#### Step 1: Stop Everything
```bash
# Use our fail-safe cleanup
./scripts/stop-all-dev.sh

# Or manual cleanup
sudo pkill -f "npm.*dev\|next\|react\|node.*dev"
```

#### Step 2: Docker Recovery
```bash
# Restart Docker Desktop
osascript -e 'quit app "Docker Desktop"'
sleep 10
open -a "Docker Desktop"

# Wait for startup, then verify
docker ps
```

#### Step 3: Clean Development Environment
```bash
# Remove problematic build files
rm -rf .next node_modules/.cache

# Fresh install if needed
npm install

# Start clean development
npm run dev
```

#### Step 4: Verify All Systems
```bash
# Check health
./scripts/check-deployment.sh

# Start control center
./scripts/maia-control-center.sh
```

### 🔧 Common Emergency Commands

#### Process Management
```bash
# Kill all development processes
./scripts/stop-all-dev.sh

# Kill specific processes by port
lsof -ti:3000 | xargs kill -9
lsof -ti:3005 | xargs kill -9
lsof -ti:3006 | xargs kill -9
```

#### Docker Issues
```bash
# Restart Docker completely
osascript -e 'quit app "Docker Desktop"' && sleep 10 && open -a "Docker Desktop"

# Clear Docker cache
docker system prune -f

# Rebuild containers
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

#### Database Recovery
```bash
# Check database connection
docker exec -it maia-sovereign-postgres-1 psql -U maia -d maia_sovereign

# Restart database container
docker restart maia-sovereign-postgres-1
```

---

## Common Workflows

### 🚀 Starting Development Work
```bash
# 1. Clean start
./scripts/stop-all-dev.sh

# 2. Start control center
./scripts/maia-control-center.sh

# 3. Choose development environment (usually option 2)
# 4. Start coding!
```

### 🧪 Testing Changes
```bash
# 1. Develop on localhost:3000
npm run dev

# 2. Test on staging
npm run staging
# Visit: http://localhost:3010

# 3. If staging looks good, deploy to production
./scripts/maia-control-center.sh
# Choose deployment options
```

### 🎯 Production Deployment
```bash
# 1. Backup current state
./scripts/maia-auto-backup.sh

# 2. Use control center deployment
./scripts/maia-control-center.sh
# Select deployment operations

# 3. Verify deployment health
./scripts/check-deployment.sh

# 4. Monitor with Soulguard
python3 soulguard/soulguard.py --test
```

### 🔍 Investigating Issues
```bash
# 1. Check Soulguard analysis
python3 soulguard/soulguard.py --test

# 2. Review system health
./scripts/check-deployment.sh

# 3. Check logs
tail -f logs/soulguard.log
tail -f logs/production-error.log
tail -f logs/dev-error.log

# 4. Check container status
docker ps
docker logs maia-sovereign-web-1
```

---

## Troubleshooting

### Common Issues & Solutions

#### "Port already in use"
```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9

# Or use alternative port
PORT=3005 npm run dev
```

#### "Docker can't start"
```bash
# Full Docker reset
osascript -e 'quit app "Docker Desktop"'
sleep 10
open -a "Docker Desktop"

# If still issues, check system resources
top -l 1 | grep -E "^(CPU|PhysMem|Load)"
```

#### "Too many processes running"
```bash
# Use our cleanup script
./scripts/stop-all-dev.sh

# Check what's still running
ps aux | grep -E "(npm|node|next)" | grep -v grep
```

#### "Database connection error"
```bash
# Check database status
docker exec -it maia-sovereign-postgres-1 psql -U maia -d maia_sovereign -c "SELECT 1;"

# Restart database if needed
docker restart maia-sovereign-postgres-1
```

#### "Soulguard permission errors"
```bash
# Run with specific Python path
PYTHONPATH=/Users/soullab/MAIA-SOVEREIGN python3 soulguard/soulguard.py --test

# Check Python dependencies
pip3 install psutil requests
```

### Performance Optimization

#### High System Load
1. **Check Soulguard** for Fire element alerts
2. **Kill unnecessary processes** with stop-all-dev.sh
3. **Monitor container resources** with `docker stats`
4. **Check disk space** with `df -h`

#### Slow Development Server
1. **Clear .next cache**: `rm -rf .next`
2. **Restart with clean slate**: Use control center
3. **Check for port conflicts**: Switch to alternative port
4. **Monitor with Grafana**: Check performance metrics

---

## Advanced Configuration

### PM2 Ecosystem Management
```bash
# Start all managed processes
pm2 start ecosystem.config.js

# Manage specific processes
pm2 restart maia-production
pm2 stop maia-development
pm2 logs soulguard

# Save PM2 configuration
pm2 save
pm2 startup
```

### Webhook Notifications
```bash
# Configure Discord webhook
export SOULGUARD_WEBHOOK="https://discord.com/api/webhooks/your-webhook"
export EMERGENCY_WEBHOOK_URL="https://discord.com/api/webhooks/emergency-webhook"

# Test notification system
./scripts/notify-webhook.sh test "System test message"
```

### Custom Environment Variables
```bash
# Development optimizations
export DISABLE_ESLINT_PLUGIN=true
export NEXT_IGNORE_TYPE_ERRORS=true

# Production settings
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
```

---

## Support & Maintenance

### Daily Checklist
- [ ] Check Soulguard analysis for any archetypal disturbances
- [ ] Review system health via control center
- [ ] Verify backup completion (automatic)
- [ ] Monitor production via https://soullab.life

### Weekly Checklist
- [ ] Review Grafana performance trends
- [ ] Clean up old logs and backup rotation
- [ ] Update dependencies if needed
- [ ] Test emergency recovery procedures

### Monthly Checklist
- [ ] Review and update this manual
- [ ] Performance optimization review
- [ ] Security updates and patches
- [ ] Backup system verification

---

## Quick Reference

### Essential Commands
```bash
./scripts/maia-control-center.sh     # Main control interface
./scripts/check-deployment.sh       # Health verification
./scripts/stop-all-dev.sh          # Emergency cleanup
python3 soulguard/soulguard.py --test  # AI analysis
npm run dev                         # Development start
```

### Important URLs
- **Production**: https://soullab.life
- **Staging**: http://localhost:3010
- **Development**: http://localhost:3000
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090

### Emergency Contacts
- **Documentation**: This manual
- **Logs**: `./logs/` directory
- **Backups**: `./backups/` directory
- **Configuration**: `./config/ecosystem.config.js`

---

*This manual is your complete guide to managing MAIA Sovereign as a solo developer. Keep it handy and update it as your system evolves.*

**Remember**: The system is designed to be fail-proof. When in doubt, use the control center, check Soulguard, and trust the automated processes we've built together.