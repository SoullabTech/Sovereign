# 🖥️ M4 Mac Docker Server Setup for Consciousness Computing Testers

**Keep your M4 Mac running as a persistent server for Community Commons beta testing**

---

## 🚀 **QUICK SETUP (Automated)**

Run the automated setup script:
```bash
cd /Users/soullab/MAIA-SOVEREIGN
chmod +x scripts/setup-m4-docker-server.sh
./scripts/setup-m4-docker-server.sh
```

This will:
- ✅ Configure Docker Desktop for auto-start
- ✅ Build consciousness computing Docker container
- ✅ Set up persistent container with restart policies
- ✅ Configure network access for external testers
- ✅ Create monitoring and management scripts

---

## 🔧 **MANUAL SETUP (Step by Step)**

### **1. Ensure Docker Desktop is Running**
```bash
# Start Docker Desktop
open /Applications/Docker.app

# Verify Docker is running
docker info
```

### **2. Build Consciousness Computing Docker Image**
```bash
cd /Users/soullab/MAIA-SOVEREIGN/beta-deployment

# Create simple Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY consciousness-computing-beta-server.js ./
EXPOSE 3008
USER 1001:1001
CMD ["node", "consciousness-computing-beta-server.js"]
EOF

# Create package.json if needed
echo '{"name":"consciousness-computing","dependencies":{"express":"^4.18.2","cors":"^2.8.5"}}' > package.json

# Build Docker image
docker build -t consciousness-computing-beta . --platform linux/arm64
```

### **3. Run Persistent Container**
```bash
# Run with restart policy for persistence
docker run -d \
  --name consciousness-computing-server \
  --restart unless-stopped \
  -p 3008:3008 \
  --memory 1g \
  --cpus 2 \
  consciousness-computing-beta
```

### **4. Configure Auto-Start**
```bash
# Configure Docker Desktop to start at login
defaults write com.docker.docker StartAtLogin -bool true

# Container will auto-restart due to --restart unless-stopped policy
```

---

## 🌐 **NETWORK ACCESS FOR TESTERS**

### **Get Your Mac's IP Address**
```bash
# Get local network IP
LOCAL_IP=$(ipconfig getifaddr en0)
echo "Share this URL with testers: http://$LOCAL_IP:3008"
```

### **Configure Mac for External Access**

**1. System Settings → Security & Privacy → Firewall**
- Allow incoming connections for Docker or port 3008

**2. System Settings → Energy Saver**
- Prevent Mac from sleeping when testers need access
- Or use `caffeinate -d` command

**3. Network Requirements**
- Keep Mac connected to stable internet
- Use ethernet connection if possible for reliability

---

## 📊 **MONITORING & MANAGEMENT**

### **Check Server Status**
```bash
# Quick status check
docker ps | grep consciousness-computing-server

# Detailed health check
./scripts/monitor-consciousness-server.sh
```

### **Management Commands**
```bash
# View logs
docker logs consciousness-computing-server

# Restart server
docker restart consciousness-computing-server

# Stop server
docker stop consciousness-computing-server

# Start server
docker start consciousness-computing-server
```

### **Test Accessibility**
```bash
# Test local access
curl http://localhost:3008/api/status

# Test external access (replace with your IP)
curl http://YOUR_LOCAL_IP:3008/api/status
```

---

## ⚙️ **PERSISTENCE CONFIGURATION**

### **Docker Auto-Restart Policies**
- **Container**: `--restart unless-stopped` ensures container restarts after Mac reboot
- **Docker Desktop**: Configured to start at login
- **Launch Agent**: Additional system-level auto-start for reliability

### **Keeping Mac Awake**
```bash
# Prevent display sleep while keeping system active
caffeinate -d

# Or use System Settings → Energy Saver → Prevent sleeping
```

### **Network Stability**
- Use wired ethernet connection when possible
- Configure static IP if needed for consistent access
- Ensure router doesn't block connections to your Mac

---

## 🧪 **BETA TESTING ACCESS**

### **Share with Community Commons Testers**
```
🧠 Consciousness Computing Beta Access:
URL: http://YOUR_LOCAL_IP:3008

Available 24/7 for testing
- Individual consciousness sessions
- Collective consciousness features
- Real-time consciousness optimization
- Personalized healing protocols
```

### **Tester Instructions**
1. **Access URL**: Open http://YOUR_LOCAL_IP:3008 in web browser
2. **Test Individual Sessions**: Enter personal questions/situations for consciousness computing analysis
3. **Try Collective Sessions**: Join group consciousness experiences
4. **Provide Feedback**: Use built-in feedback system for Phase 2 development

---

## 🔧 **TROUBLESHOOTING**

### **Container Not Starting**
```bash
# Check Docker status
docker info

# Restart Docker Desktop
killall Docker && open /Applications/Docker.app

# Rebuild container if needed
docker build -t consciousness-computing-beta . --no-cache
```

### **Network Access Issues**
```bash
# Check firewall settings
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Test port accessibility
nc -zv localhost 3008

# Check container port mapping
docker port consciousness-computing-server
```

### **Performance Optimization**
```bash
# Monitor resource usage
docker stats consciousness-computing-server

# Adjust container resources if needed
docker update --memory 2g --cpus 4 consciousness-computing-server
```

---

## 🎯 **PRODUCTION CONSIDERATIONS**

### **Security**
- Container runs as non-root user (1001:1001)
- Limited memory and CPU allocation
- No sensitive data exposed
- Read-only filesystem where possible

### **Reliability**
- Health checks monitor server status
- Automatic restart on failure
- Resource limits prevent system overload
- Comprehensive logging for debugging

### **Scalability**
- Architecture supports multiple testers simultaneously
- Docker provides isolation and resource management
- Can easily scale to cloud deployment when ready

---

## 📞 **SUPPORT**

### **Quick Commands**
```bash
# Full status report
./scripts/monitor-consciousness-server.sh

# Restart everything
./scripts/restart-consciousness-server.sh

# Emergency stop
docker stop consciousness-computing-server
```

### **Log Locations**
- **Container logs**: `docker logs consciousness-computing-server`
- **System logs**: `/tmp/consciousness-computing-docker.log`
- **Error logs**: `/tmp/consciousness-computing-docker.error.log`

---

## 🌟 **SUCCESS INDICATORS**

✅ **Docker Desktop starts automatically on Mac login**
✅ **Consciousness computing container runs persistently**
✅ **Server accessible on local network at http://YOUR_IP:3008**
✅ **Beta testers can access 24/7 for consciousness computing testing**
✅ **Automatic restart on Mac reboot or container failure**

**Your M4 Mac is now a dedicated consciousness computing server for Community Commons pioneers!** 🧠✨🚀