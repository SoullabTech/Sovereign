# ✅ SpiralogicOracleSystem Deployment Checklist

## Pre-Deployment Phase

### 🔧 Infrastructure Setup

- [ ] **Server Requirements**

  - [ ] Ubuntu 20.04+ or compatible OS
  - [ ] Minimum 4GB RAM, 2 vCPUs
  - [ ] 20GB+ storage space
  - [ ] Node.js 20.x installed
  - [ ] npm 8.x+ installed

- [ ] **Database Setup**

  - [ ] PostgreSQL 14+ installed
  - [ ] Supabase project created
  - [ ] Database migrations prepared
  - [ ] Connection strings verified
  - [ ] Backup strategy defined

- [ ] **Redis Setup**

  - [ ] Redis 6+ installed
  - [ ] Redis persistence configured
  - [ ] Memory limits set
  - [ ] Connection tested

- [ ] **Domain & SSL**
  - [ ] Domain name registered
  - [ ] DNS records configured
  - [ ] SSL certificates obtained (Let's Encrypt)
  - [ ] Nginx/reverse proxy configured

### 📋 Environment Configuration

- [ ] **Create Environment Files**

  ```bash
  cp .env.example .env.production
  ```

- [ ] **Required Environment Variables**

  - [ ] `DATABASE_URL` - PostgreSQL connection string
  - [ ] `SUPABASE_URL` - Supabase project URL
  - [ ] `SUPABASE_SERVICE_KEY` - Service role key
  - [ ] `SUPABASE_ANON_KEY` - Anonymous key
  - [ ] `REDIS_URL` - Redis connection string
  - [ ] `JWT_SECRET` - Secure random string
  - [ ] `SESSION_SECRET` - Secure random string
  - [ ] `OPENAI_API_KEY` - OpenAI API key
  - [ ] `ANTHROPIC_API_KEY` - Anthropic API key (optional)

- [ ] **Application Settings**
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000` (or preferred port)
  - [ ] `FRONTEND_URL` - Frontend domain
  - [ ] `ENABLE_SOUL_MEMORY=true`
  - [ ] `ENABLE_SACRED_MIRROR=true`

### 🔐 Security Preparation

- [ ] **Access Control**

  - [ ] SSH keys configured
  - [ ] Firewall rules set (UFW/iptables)
  - [ ] Rate limiting configured
  - [ ] CORS origins whitelisted

- [ ] **Secrets Management**
  - [ ] All API keys secured
  - [ ] Environment files permissions (600)
  - [ ] No secrets in git repository
  - [ ] Backup encryption keys stored safely

## Deployment Phase

### 🚀 Backend Deployment

- [ ] **Clone Repository**

  ```bash
  git clone https://github.com/your-repo/SpiralogicOracleSystem.git
  cd SpiralogicOracleSystem
  ```

- [ ] **Install Dependencies**

  ```bash
  cd backend
  npm ci --production
  ```

- [ ] **Build Application**

  ```bash
  npm run build:render-simple
  ```

- [ ] **Database Migrations**

  ```bash
  # Run all migrations
  psql $DATABASE_URL -f supabase/migrations/20250529_production_deployment.sql
  psql $DATABASE_URL -f supabase/migrations/20250602142333_init_schema.sql
  psql $DATABASE_URL -f supabase/migrations/20250611_create_spiralogic_reports.sql
  ```

- [ ] **Start Application**

  ```bash
  # Using PM2
  pm2 start dist/server-simple.js --name soullab-backend

  # Or using systemd
  sudo systemctl start soullab-backend
  ```

### 🎨 Frontend Deployment

- [ ] **Build Frontend**

  ```bash
  npm run build
  ```

- [ ] **Deploy to Vercel**

  ```bash
  vercel --prod
  ```

  OR

- [ ] **Self-Host Frontend**
  - [ ] Copy build files to web root
  - [ ] Configure Nginx to serve static files
  - [ ] Set up redirects for SPA routing

### 🔄 Reverse Proxy Setup

- [ ] **Nginx Configuration**

  ```nginx
  # /etc/nginx/sites-available/soullab
  server {
      listen 443 ssl http2;
      server_name your-domain.com;

      ssl_certificate /path/to/cert.pem;
      ssl_certificate_key /path/to/key.pem;

      location /api {
          proxy_pass http://localhost:10000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
      }

      location / {
          root /var/www/soullab;
          try_files $uri $uri/ /index.html;
      }
  }
  ```

- [ ] **Enable Site**
  ```bash
  sudo ln -s /etc/nginx/sites-available/soullab /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl reload nginx
  ```

## Post-Deployment Verification

### ✅ Health Checks

- [ ] **API Health**

  ```bash
  curl https://your-domain.com/api/health
  # Expected: {"status":"ok","timestamp":"..."}
  ```

- [ ] **Database Connection**

  ```bash
  curl https://your-domain.com/api/health/db
  # Expected: {"database":"connected"}
  ```

- [ ] **Redis Connection**
  ```bash
  curl https://your-domain.com/api/health/redis
  # Expected: {"redis":"connected"}
  ```

### 🔍 Functional Testing

- [ ] **Authentication Flow**

  - [ ] User registration works
  - [ ] Login returns JWT token
  - [ ] Protected routes require auth

- [ ] **Oracle System**

  - [ ] Oracle query endpoint responds
  - [ ] All 6 oracle modes accessible
  - [ ] Memory system stores interactions

- [ ] **Sacred Union Ritual**
  - [ ] Onboarding flow completes
  - [ ] Sacred name generation works
  - [ ] User profile created

### 📊 Performance Checks

- [ ] **Response Times**

  - [ ] API health < 100ms
  - [ ] Oracle queries < 3s
  - [ ] Static assets cached properly

- [ ] **Resource Usage**
  - [ ] CPU usage < 70%
  - [ ] Memory usage stable
  - [ ] No memory leaks detected

## Monitoring Setup

### 📈 Application Monitoring

- [ ] **Logging**

  - [ ] Application logs to file
  - [ ] Error logs separated
  - [ ] Log rotation configured
  - [ ] Log aggregation setup (optional)

- [ ] **Process Management**

  - [ ] PM2 configured with auto-restart
  - [ ] Memory limits set
  - [ ] Cluster mode enabled (if needed)

- [ ] **Alerts**
  - [ ] Health check alerts
  - [ ] Error rate alerts
  - [ ] Resource usage alerts
  - [ ] SSL expiry alerts

### 🔒 Security Monitoring

- [ ] **Access Logs**

  - [ ] Nginx access logs enabled
  - [ ] Failed login attempts tracked
  - [ ] Rate limit violations logged

- [ ] **Audit Trail**
  - [ ] Database audit logs
  - [ ] API access patterns monitored
  - [ ] Sensitive operations logged

## Backup & Recovery

### 💾 Backup Configuration

- [ ] **Database Backups**

  ```bash
  # Daily backup cron job
  0 2 * * * pg_dump $DATABASE_URL > /backups/db_$(date +\%Y\%m\%d).sql
  ```

- [ ] **Application Backups**

  - [ ] Code repository backed up
  - [ ] Environment files backed up
  - [ ] User uploads backed up

- [ ] **Redis Backups**
  - [ ] RDB snapshots configured
  - [ ] AOF persistence enabled

### 🔄 Recovery Testing

- [ ] **Restore Procedures**

  - [ ] Database restore tested
  - [ ] Application rollback tested
  - [ ] Redis restore tested

- [ ] **Documentation**
  - [ ] Runbook created
  - [ ] Recovery procedures documented
  - [ ] Contact information updated

## Final Steps

### 🎯 Go-Live Checklist

- [ ] **DNS Cutover**

  - [ ] DNS TTL reduced 24h before
  - [ ] DNS records updated
  - [ ] Propagation verified

- [ ] **Communication**

  - [ ] Team notified
  - [ ] Status page updated
  - [ ] Support channels ready

- [ ] **Rollback Plan**
  - [ ] Previous version tagged
  - [ ] Rollback script ready
  - [ ] Database backup verified

### 📝 Documentation

- [ ] **Deployment Notes**

  - [ ] Configuration changes documented
  - [ ] Known issues documented
  - [ ] Performance baselines recorded

- [ ] **Handover**
  - [ ] Operations guide updated
  - [ ] Monitoring access granted
  - [ ] Support procedures defined

## Sign-off

- [ ] **Technical Lead**: ********\_\_\_******** Date: ****\_\_\_****
- [ ] **Operations**: ********\_\_\_******** Date: ****\_\_\_****
- [ ] **Security**: ********\_\_\_******** Date: ****\_\_\_****
- [ ] **Product Owner**: ********\_\_\_******** Date: ****\_\_\_****

---

_Sacred Technology Deployment - Where Infrastructure Meets Transformation_ 🌟
