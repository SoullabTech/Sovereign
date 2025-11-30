# 🚀 MAIA Sovereign - Production Deployment Guide

Complete guide for deploying MAIA Sovereign as a full production application with enterprise-grade infrastructure.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Infrastructure Setup](#infrastructure-setup)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Domain & SSL](#domain--ssl)
- [Monitoring & Analytics](#monitoring--analytics)
- [Security Configuration](#security-configuration)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Required Software
- **Docker & Docker Compose** (v20.0+)
- **Node.js** (v18 or v20)
- **Git** (v2.30+)
- **SSL Certificate** (Let's Encrypt recommended)

### Required Services
- **Domain name** with DNS control
- **PostgreSQL** database (v15+)
- **Redis** instance (v7+)
- **SMTP service** for emails
- **Object storage** (AWS S3 or compatible)

### API Keys & Credentials
- OpenAI API Key
- Anthropic API Key (optional)
- ElevenLabs API Key (for voice synthesis)
- Google Cloud Text-to-Speech (optional)
- Pinecone API Key (for vector storage)

## ⚡ Quick Start

```bash
# 1. Clone and setup
git clone <your-repo-url>
cd MAIA-SOVEREIGN

# 2. Configure environment
cp apps/web/.env.production.example .env.production
# Edit .env.production with your values

# 3. Deploy with Docker
./deploy.sh production

# 4. Access your application
open https://yourdomain.com
```

## 🏗️ Infrastructure Setup

### Option A: Single Server (Recommended for small-medium scale)

**Minimum Requirements:**
- 4 CPU cores
- 8GB RAM
- 100GB SSD storage
- Ubuntu 22.04 LTS

**Setup Script:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
cd /opt
sudo git clone <your-repo-url> maia-sovereign
cd maia-sovereign
sudo chown -R $USER:$USER .
```

### Option B: Multi-Server (Enterprise scale)

```bash
# Load Balancer + Web Servers + Database Cluster
# Recommended: 2x Web (4 CPU, 8GB), 1x Database (8 CPU, 16GB), 1x Redis (2 CPU, 4GB)

# Use Kubernetes with provided YAML files (coming in future release)
kubectl apply -f k8s/
```

## 🔐 Environment Configuration

### 1. Copy Environment Template
```bash
cp apps/web/.env.production.example .env.production
```

### 2. Configure Required Variables

**Core Application:**
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://maia.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**Database:**
```bash
DATABASE_URL=postgresql://username:password@host:5432/maia_production
REDIS_URL=redis://username:password@host:6379
```

**Security:**
```bash
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars
NEXTAUTH_SECRET=your_nextauth_secret_min_32_chars
CORS_ORIGIN=https://maia.yourdomain.com
```

**AI Services:**
```bash
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

**File Storage:**
```bash
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=maia-voice-recordings
```

### 3. Generate Secure Passwords
```bash
# Generate random secrets
openssl rand -hex 32  # For JWT_SECRET
openssl rand -hex 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For database passwords
```

## 🐳 Docker Deployment

### 1. Production Deployment
```bash
# Deploy all services
./deploy.sh production

# Monitor deployment
docker-compose logs -f web

# Check service health
docker-compose ps
curl http://localhost:3000/api/health
```

### 2. Service Management
```bash
# View logs
docker-compose logs -f [service]

# Restart specific service
docker-compose restart web

# Scale web service
docker-compose up -d --scale web=3

# Update application
git pull origin main
./deploy.sh production

# Backup database
docker-compose exec postgres pg_dump -U maia maia_production > backup.sql
```

### 3. Monitoring Services
```bash
# Access monitoring dashboards
open http://localhost:3001  # Grafana (admin:your_password)
open http://localhost:9090  # Prometheus
```

## 🔄 CI/CD Pipeline

### GitHub Actions Setup

1. **Add Repository Secrets:**
```bash
# Server access
STAGING_HOST=staging.yourdomain.com
STAGING_USER=deploy
STAGING_SSH_KEY=<private-key>

PRODUCTION_HOST=yourdomain.com
PRODUCTION_USER=deploy
PRODUCTION_SSH_KEY=<private-key>

# URLs for health checks
STAGING_URL=https://staging.yourdomain.com
PRODUCTION_URL=https://yourdomain.com

# Notifications
SLACK_WEBHOOK=https://hooks.slack.com/services/...
MONITORING_WEBHOOK=https://hooks.yourdomain.com/deploy
```

2. **Deploy Workflow:**
```bash
# Automatic deployment on push to main (staging)
git push origin main

# Manual production deployment
gh workflow run deploy.yml -f environment=production

# Deploy from tags
git tag v1.0.0
git push origin v1.0.0
```

## 🌐 Domain & SSL

### 1. DNS Configuration
```bash
# A records
yourdomain.com     -> YOUR_SERVER_IP
maia.yourdomain.com -> YOUR_SERVER_IP

# CNAME records (optional)
www.yourdomain.com -> yourdomain.com
api.yourdomain.com -> yourdomain.com
```

### 2. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt update
sudo apt install certbot

# Obtain certificate
sudo certbot certonly --standalone -d maia.yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/maia.yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/maia.yourdomain.com/privkey.pem ssl/
sudo chown $USER:$USER ssl/*

# Setup auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Update Nginx Configuration
```bash
# Edit nginx/nginx.conf
# Change server_name from maia.yourdomain.com to your actual domain
sed -i 's/maia.yourdomain.com/your-actual-domain.com/g' nginx/nginx.conf

# Restart nginx
docker-compose restart nginx
```

## 📊 Monitoring & Analytics

### 1. Application Monitoring
```bash
# Install monitoring stack
docker-compose up -d prometheus grafana

# Import MAIA dashboard
# Visit http://localhost:3001
# Login: admin / your_grafana_password
# Import dashboard from monitoring/grafana/maia-dashboard.json
```

### 2. Error Tracking (Sentry)
```bash
# Add to .env.production
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project

# Create Sentry project at https://sentry.io
# Add error tracking to your application
```

### 3. Analytics Setup
```bash
# Add to .env.production
ANALYTICS_ID=GA_MEASUREMENT_ID  # Google Analytics 4
POSTHOG_KEY=your_posthog_key    # PostHog (optional)

# Configure in apps/web/lib/analytics.ts
```

### 4. Uptime Monitoring
```bash
# External monitoring services
# UptimeRobot: https://uptimerobot.com
# Pingdom: https://pingdom.com
# StatusPage: https://statuspage.io

# Health check endpoint
curl https://yourdomain.com/api/health
```

## 🔒 Security Configuration

### 1. Firewall Setup
```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Security Headers
The application includes enterprise-grade security headers:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Cross-Origin policies

### 3. Rate Limiting
```bash
# Rate limiting is configured in nginx.conf
# API: 5 requests/second
# General: 10 requests/second
# Burst: 10-20 requests allowed

# Monitor rate limiting
docker-compose logs nginx | grep "limiting requests"
```

### 4. Database Security
```bash
# Use strong passwords
# Enable SSL for database connections
# Regular backups with encryption
# Network isolation (VPC/private networks)
```

## ⚡ Performance Optimization

### 1. Caching Strategy
- **Service Worker:** Offline caching for PWA
- **CDN:** Static assets via CloudFront/CloudFlare
- **Redis:** Session and API response caching
- **Database:** Query optimization and indexing

### 2. Bundle Optimization
```bash
# Analyze bundle size
cd apps/web
ANALYZE=true npm run build

# Optimize images
npm install -g @next/bundle-analyzer
npx bundle-analyzer
```

### 3. Database Performance
```bash
# PostgreSQL optimization
# Add to postgresql.conf:
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

### 4. CDN Configuration
```bash
# CloudFlare settings
# Page Rules:
# /_next/static/* -> Cache Level: Cache Everything, Edge TTL: 1 year
# /api/* -> Cache Level: Bypass
# /* -> Cache Level: Standard, Browser TTL: 4 hours
```

## 🔧 Troubleshooting

### Common Issues

**1. Service Won't Start**
```bash
# Check logs
docker-compose logs [service-name]

# Check configuration
docker-compose config

# Restart services
docker-compose restart
```

**2. Database Connection Issues**
```bash
# Check database is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U maia -d maia_production -c "SELECT 1;"

# Check database logs
docker-compose logs postgres
```

**3. SSL Certificate Issues**
```bash
# Verify certificates exist
ls -la ssl/

# Test SSL
openssl s_client -connect yourdomain.com:443

# Check certificate expiry
openssl x509 -in ssl/fullchain.pem -text -noout | grep "Not After"
```

**4. Memory Issues**
```bash
# Check memory usage
docker stats

# Increase Node.js memory limit
# Add to docker-compose.yml under web service:
environment:
  - NODE_OPTIONS=--max-old-space-size=2048
```

**5. Voice/Audio Not Working**
```bash
# Check browser compatibility
node test-browser-features.js

# Verify HTTPS (required for audio)
curl -I https://yourdomain.com

# Check microphone permissions in browser
# Ensure getUserMedia API is available
```

### Performance Issues
```bash
# Check application performance
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com

# Monitor resource usage
docker-compose exec web top
docker-compose exec postgres top

# Database query analysis
docker-compose exec postgres psql -U maia -d maia_production
# Run: SELECT * FROM pg_stat_activity;
```

### Logs Location
```bash
# Application logs
./logs/web/

# Nginx logs
./logs/nginx/

# Docker compose logs
docker-compose logs [service]

# System logs
sudo journalctl -u docker
```

## 📞 Support & Maintenance

### Backup Strategy
```bash
# Daily database backup
0 2 * * * /opt/maia-sovereign/backup.sh

# Weekly full backup
0 3 * * 0 /opt/maia-sovereign/full-backup.sh
```

### Updates
```bash
# Update application
git pull origin main
./deploy.sh production

# Update dependencies
cd apps/web
npm update
npm audit fix
```

### Scaling Considerations

**Horizontal Scaling:**
- Load balancer (Nginx/HAProxy)
- Multiple web server instances
- Separate database server
- Redis cluster
- CDN for static assets

**Vertical Scaling:**
- Increase server resources
- Database optimization
- Connection pooling
- Memory optimization

---

## 🎉 Success! Your MAIA Sovereign is now live!

- 🌐 **Web App:** https://yourdomain.com
- 📱 **PWA:** Installable on all devices
- 🔊 **Voice AI:** Full voice chat functionality
- 🛡️ **Security:** Enterprise-grade protection
- 📊 **Monitoring:** Full observability stack

### Next Steps:
1. **User Testing:** Test all features across devices
2. **Performance:** Monitor and optimize
3. **Analytics:** Track user engagement
4. **Feedback:** Collect and iterate
5. **Scale:** Expand infrastructure as needed

For additional support, see the main README.md or create an issue in the repository.