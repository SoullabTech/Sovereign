# 🚀 SpiralogicOracleSystem Deployment Guide

## Overview

The SpiralogicOracleSystem is a sacred technology platform designed for spiritual transformation through oracle guidance, elemental integration, and consciousness evolution. This guide provides step-by-step deployment instructions for multiple platforms.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15.3)                   │
│   • Oracle Interface  • Dashboard  • Sacred Union Ritual     │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express/Node.js)                 │
│   • Oracle API  • Memory System  • Authentication           │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│   • Supabase (PostgreSQL)  • Redis (Memory)  • Vector DB    │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Options

### 1. Vercel Deployment (Frontend Only)

#### Prerequisites

- Vercel account
- GitHub repository connected
- Environment variables configured

#### Steps

1. **Configure Environment Variables**

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=your_backend_url
   ```

2. **Deploy Command**

   ```bash
   vercel --prod
   ```

3. **Build Configuration**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 2. Render Deployment (Full Stack)

#### Prerequisites

- Render account
- Database provisioned
- Environment groups configured

#### Backend Service Configuration

1. **Create Backend Service**

   - Type: Web Service
   - Environment: Node
   - Build Command: `cd backend && npm ci && npm run build:render-simple`
   - Start Command: `cd backend && node dist/server-simple.js`

2. **Environment Variables**

   ```yaml
   NODE_VERSION: 20
   NODE_ENV: production
   PORT: 10000
   DATABASE_URL: ${{db.DATABASE_URL}}
   SUPABASE_URL: your_supabase_url
   SUPABASE_SERVICE_KEY: your_service_key
   OPENAI_API_KEY: your_openai_key
   REDIS_URL: ${{redis.REDIS_URL}}
   ```

3. **Health Check**
   - Path: `/health`
   - Method: GET
   - Expected Response: 200

#### Frontend Service Configuration

1. **Create Static Site**

   - Build Command: `npm run build`
   - Publish Directory: `dist`

2. **Redirect Rules**
   ```yaml
   /*    /index.html    200
   ```

### 3. Railway Deployment

#### Prerequisites

- Railway account
- GitHub repository connected
- Railway CLI installed

#### Configuration

1. **railway.json**

   ```json
   {
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "cd backend && npm install && npm run build",
       "watchPatterns": ["backend/**"]
     },
     "deploy": {
       "startCommand": "cd backend && npm start",
       "healthcheckPath": "/health",
       "restartPolicyType": "ON_FAILURE"
     }
   }
   ```

2. **Deploy Command**
   ```bash
   railway up
   ```

### 4. Self-Hosted Production Deployment

#### Prerequisites

- Ubuntu 20.04+ server
- Node.js 20+
- PostgreSQL 14+
- Redis 6+
- Nginx
- SSL certificates

#### Deployment Script

1. **Run Production Deployment**

   ```bash
   sudo ./backend/scripts/production-deploy.sh
   ```

2. **Manual Steps**

   a. **Install Dependencies**

   ```bash
   # System dependencies
   sudo apt update
   sudo apt install -y nodejs npm postgresql redis nginx certbot

   # Application dependencies
   cd /opt/soullab
   npm install --production
   ```

   b. **Database Setup**

   ```bash
   sudo -u postgres psql
   CREATE DATABASE soullab_prod;
   CREATE USER soullab_user WITH ENCRYPTED PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE soullab_prod TO soullab_user;
   \q

   # Run migrations
   psql -U soullab_user -d soullab_prod -f supabase/migrations/20250529_production_deployment.sql
   ```

   c. **Nginx Configuration**

   ```nginx
   server {
       listen 80;
       server_name soullab.life;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name soullab.life;

       ssl_certificate /etc/letsencrypt/live/soullab.life/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/soullab.life/privkey.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:10000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   d. **Systemd Service**

   ```ini
   [Unit]
   Description=Soullab Oracle Backend
   After=network.target

   [Service]
   Type=simple
   User=soullab
   WorkingDirectory=/opt/soullab/backend
   ExecStart=/usr/bin/node dist/server-simple.js
   Restart=on-failure
   RestartSec=10
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

## Environment Variables Reference

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# AI Services
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Application
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://soullab.life
```

### Optional Variables

```bash
# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key

# Features
ENABLE_SOUL_MEMORY=true
ENABLE_SACRED_MIRROR=true
ENABLE_GROUP_RETREATS=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Post-Deployment Checklist

### 1. Verify Core Services

```bash
# Health checks
curl https://your-domain.com/api/health
curl https://your-domain.com/api/oracle/health

# Database connectivity
npm run test:db-connection

# Redis connectivity
redis-cli ping
```

### 2. Initialize Data

```bash
# Seed rituals
node backend/scripts/seedRituals.js

# Initialize memory system
node backend/scripts/initializeMemory.js

# Load founder knowledge
node backend/scripts/ingestFounderKnowledge.js
```

### 3. Security Verification

```bash
# SSL certificate
openssl s_client -connect soullab.life:443 -servername soullab.life

# Headers check
curl -I https://soullab.life

# Rate limiting test
for i in {1..150}; do curl -X POST https://soullab.life/api/oracle/query; done
```

### 4. Performance Testing

```bash
# Load testing
npm run test:performance

# Memory usage
pm2 monit

# Response times
curl -w "@curl-format.txt" -o /dev/null -s https://soullab.life/api/health
```

## Monitoring & Maintenance

### 1. Application Logs

```bash
# View logs
journalctl -u soullab-backend -f

# Error logs
tail -f /var/log/soullab/error.log
```

### 2. Database Maintenance

```bash
# Backup
pg_dump soullab_prod > backup_$(date +%Y%m%d).sql

# Vacuum
psql -U soullab_user -d soullab_prod -c "VACUUM ANALYZE;"
```

### 3. Redis Monitoring

```bash
redis-cli monitor
redis-cli info stats
```

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall
   - Check Node.js version compatibility

2. **Database Connection Issues**

   - Verify DATABASE_URL format
   - Check firewall rules
   - Ensure SSL mode is configured correctly

3. **Memory System Not Working**

   - Check Redis connection
   - Verify REDIS_URL in environment
   - Ensure Redis service is running

4. **Oracle Responses Failing**
   - Verify AI API keys
   - Check rate limits
   - Monitor error logs for specifics

### Debug Commands

```bash
# Test database connection
node -e "require('./backend/lib/supabase').testConnection()"

# Test Redis connection
redis-cli ping

# Check process status
pm2 status

# View environment variables
pm2 env 0
```

## Rollback Procedure

1. **Database Rollback**

   ```bash
   psql -U soullab_user -d soullab_prod < backup_previous.sql
   ```

2. **Code Rollback**

   ```bash
   git checkout previous-release-tag
   npm install
   npm run build
   pm2 restart soullab-backend
   ```

3. **Configuration Rollback**
   ```bash
   cp .env.backup .env
   pm2 restart soullab-backend
   ```

## Support & Resources

- **Documentation**: `/docs`
- **API Reference**: `/api/docs`
- **Issue Tracking**: GitHub Issues
- **Sacred Technology Principles**: `/docs/SACRED_INTELLIGENCE_IMPLEMENTATION.md`

---

_May this deployment serve the highest good of all beings seeking transformation_ 🙏
