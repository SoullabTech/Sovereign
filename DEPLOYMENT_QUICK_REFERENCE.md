# 🚀 MAIA-SOVEREIGN Deployment Quick Reference

> **For Claude Code Sessions**: This is the ONLY repository you should deploy from!

## 🎯 **Primary Deployment Commands**

### **Production Deployment (Docker)**
```bash
# Navigate to correct repository
cd /Users/soullab/MAIA-SOVEREIGN

# Option 1: Full rebuild (recommended after code changes)
docker-compose down && docker-compose build --no-cache && docker-compose up -d

# Option 2: Quick restart (if containers exist)
docker-compose restart

# Option 3: Using deployment script
./deploy.sh production
```

### **Development Server**
```bash
cd /Users/soullab/MAIA-SOVEREIGN
npm run dev                    # Standard dev server (port 3000)
PORT=3005 npm run dev          # Alternative port
```

## 🔍 **Health Checks**

### **Verify Deployment Success**
```bash
# Check containers are running
docker-compose ps

# Check website is responding
curl -I http://soullab.life     # Should return 200 OK

# Check specific services
curl -I http://localhost:3002   # Direct web container access
```

### **Troubleshooting Commands**
```bash
# View logs
docker-compose logs web --tail=20
docker-compose logs nginx --tail=20

# Container status
docker-compose ps

# Restart specific service
docker-compose restart web
docker-compose restart nginx
```

## 🌐 **Production URLs**

- **Main Site**: https://soullab.life
- **HTTP**: http://soullab.life (redirects to HTTPS)
- **Direct Container**: http://localhost:3002 (development access)
- **Monitoring**: http://localhost:3001 (Grafana)
- **Metrics**: http://localhost:9090 (Prometheus)

## 🐳 **Container Architecture**

```yaml
Production Stack:
├── nginx (ports 80/443)     → SSL termination, reverse proxy
├── web (port 3002→3000)     → MAIA Next.js application
├── redis (port 6379)        → Session storage
├── prometheus (port 9090)   → Metrics collection
├── grafana (port 3001)      → Monitoring dashboard
└── coturn                   → Voice chat TURN server
```

## ⚠️ **Critical Pre-Deployment Checks**

### **Before ANY Deployment:**
```bash
# 1. Verify repository
pwd  # Must show: /Users/soullab/MAIA-SOVEREIGN

# 2. Test build locally
npm run build  # Must succeed without errors

# 3. Check git status
git status  # Ensure no critical files are uncommitted

# 4. Verify working directory
ls -la  # Should see: docker-compose.yml, deploy.sh, package.json
```

## 🔄 **Common Deployment Scenarios**

### **Code Changes (TypeScript/React)**
```bash
cd /Users/soullab/MAIA-SOVEREIGN
npm run build                                    # Test build
docker-compose build web                        # Build new image
docker-compose up -d web                        # Deploy new container
```

### **Configuration Changes (nginx, docker-compose)**
```bash
cd /Users/soullab/MAIA-SOVEREIGN
docker-compose down                              # Stop all services
docker-compose build --no-cache                 # Rebuild everything
docker-compose up -d                             # Start all services
```

### **Emergency Recovery**
```bash
cd /Users/soullab/MAIA-SOVEREIGN
docker-compose down                              # Stop everything
docker system prune -f                          # Clean up
docker-compose build --no-cache                 # Fresh build
docker-compose up -d                             # Restart
```

## 📝 **Post-Deployment Verification**

### **Full System Check**
```bash
# 1. Container health
docker-compose ps  # All should show "Up" status

# 2. Website accessibility
curl -I http://soullab.life  # Should return 200 OK

# 3. API functionality
curl -X POST http://soullab.life/api/oracle/conversation \
  -H "Content-Type: application/json" \
  -d '{"message":"test","userId":"test","sessionId":"test"}'

# 4. IPP integration test
node test-ipp-integration.js  # Should pass all tests
```

## 🚨 **Emergency Contacts & Recovery**

### **If soullab.life is Down:**
1. Check container status: `docker-compose ps`
2. Check logs: `docker-compose logs web nginx`
3. Restart services: `docker-compose restart`
4. If still down: Full rebuild (see Emergency Recovery above)

### **If Build Fails:**
1. Verify you're in MAIA-SOVEREIGN repository
2. Check for TypeScript errors: `npm run typecheck`
3. Check for missing dependencies: `npm install`
4. Review recent code changes for syntax errors

---

**🎯 Remember**: Always deploy from MAIA-SOVEREIGN. Never use MAIA-PAI or MAIA-PAI-SOVEREIGN for production deployments!