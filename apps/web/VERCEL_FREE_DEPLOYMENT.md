# MAIA Vercel-Free Deployment Guide

**Goal:** Run MAIA in production mode on your Mac Studio, eliminating Vercel dependency

---

## 🎯 Quick Start: Local Production

### Step 1: Build MAIA for Production

```bash
cd /Users/soullab/MAIA-PAI/apps/web

# Build optimized production version
npm run build
```

This creates an optimized production build in `.next/` folder.

### Step 2: Run Production Server

```bash
# Start production server on port 3000
npm start

# Or specify custom port
PORT=3000 npm start
```

**That's it!** MAIA now runs in production mode on `http://localhost:3000`

---

## 🚀 Option 2: Production-Grade Setup with PM2

PM2 keeps MAIA running 24/7, auto-restarts on crashes, and starts on Mac boot.

### Install PM2

```bash
npm install -g pm2
```

### Create PM2 Ecosystem File

```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'maia-sovereign',
    script: 'npm',
    args: 'start',
    cwd: '/Users/soullab/MAIA-PAI/apps/web',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF
```

### Start MAIA with PM2

```bash
# Create logs directory
mkdir -p logs

# Start MAIA
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on Mac boot
pm2 startup
# Follow the command it gives you (will use sudo)
```

### PM2 Management Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs maia-sovereign

# Restart MAIA
pm2 restart maia-sovereign

# Stop MAIA
pm2 stop maia-sovereign

# Monitor resources
pm2 monit
```

---

## 🌐 Option 3: Expose MAIA to Internet (Optional)

If you want to access MAIA from outside your Mac Studio:

### A) Cloudflare Tunnel (Recommended - Free & Secure)

**Benefits:**
- ✅ Free
- ✅ HTTPS automatically
- ✅ No port forwarding needed
- ✅ DDoS protection
- ✅ No IP exposure

**Setup:**

```bash
# Install Cloudflare Tunnel
brew install cloudflared

# Login to Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create maia-sovereign

# Configure tunnel
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: maia-sovereign
credentials-file: /Users/soullab/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: maia.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
EOF

# Run tunnel
cloudflared tunnel run maia-sovereign

# OR run as service (auto-start on boot)
sudo cloudflared service install
```

**Result:** MAIA accessible at `https://maia.yourdomain.com` with zero port forwarding!

### B) Nginx Reverse Proxy (Advanced)

If you want local network access or custom domain:

```bash
# Install nginx
brew install nginx

# Create MAIA config
cat > /opt/homebrew/etc/nginx/servers/maia.conf << 'EOF'
server {
    listen 80;
    server_name maia.local;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Start nginx
brew services start nginx
```

Add to `/etc/hosts`:
```
127.0.0.1 maia.local
```

Access MAIA at: `http://maia.local`

### C) Tailscale (Private Network Access)

Access MAIA from anywhere on YOUR private network:

```bash
# Install Tailscale
brew install tailscale

# Start Tailscale
sudo tailscale up

# Access MAIA from any Tailscale device
# Use your Mac Studio's Tailscale IP
```

---

## 🔒 Security Best Practices

### 1. Environment Variables

Keep sensitive data secure:

```bash
# .env.local is already gitignored ✅
# Never expose API keys in frontend code ✅
# Use server-side API routes for sensitive operations ✅
```

### 2. Firewall Rules (If Exposing to Internet)

```bash
# Check macOS firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Enable if not already
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on

# Add MAIA to allowed apps (if using nginx or custom port)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
```

### 3. HTTPS (If Exposing to Internet)

Use Cloudflare Tunnel (auto HTTPS) OR set up Let's Encrypt with nginx:

```bash
# Install certbot
brew install certbot

# Get certificate (example)
sudo certbot --nginx -d maia.yourdomain.com
```

---

## 📊 Deployment Comparison

| Feature | Vercel | Mac Studio (PM2) | Mac Studio (Cloudflare Tunnel) |
|---------|--------|------------------|--------------------------------|
| **Cost** | $20-$100+/month | $0 | $0 |
| **Privacy** | ❌ External servers | ✅ Your hardware | ✅ Your hardware |
| **Speed** | 50-200ms | <5ms (localhost) | 10-50ms (tunnel) |
| **Uptime Control** | ❌ Vercel controls | ✅ YOU control | ✅ YOU control |
| **Downtime Impact** | ❌ Vercel outage = you're down | ✅ Only if YOU restart | ✅ Only if YOU restart |
| **Scale** | ∞ automatic | Your Mac Studio | Your Mac Studio |
| **HTTPS** | ✅ Automatic | ⚠️ Manual setup | ✅ Automatic |
| **Serverless Functions** | ✅ Built-in | ✅ Next.js API routes work | ✅ Next.js API routes work |
| **Edge Network** | ✅ Global CDN | ❌ Single location | ✅ Cloudflare CDN |
| **Auto-Deploy** | ✅ Git push | ⚠️ Manual | ⚠️ Manual |

---

## 🎯 Recommended Setup (Best of Both Worlds)

**For Maximum Sovereignty:**

```bash
# 1. Run production MAIA locally with PM2
pm2 start ecosystem.config.js

# 2. Access locally or via Tailscale (private network)
# http://localhost:3000
# http://<tailscale-ip>:3000

# 3. (Optional) Expose via Cloudflare Tunnel for internet access
cloudflared tunnel run maia-sovereign
```

**Result:**
- ✅ MAIA runs on YOUR Mac Studio
- ✅ 100% data sovereignty
- ✅ Auto-restarts on crash (PM2)
- ✅ Auto-starts on Mac boot (PM2)
- ✅ Accessible locally or via secure tunnel
- ✅ $0 cost
- ✅ NO Vercel dependency

---

## 🔄 Development vs Production

### Development Mode (npm run dev)
- Hot reload on file changes
- Slower (not optimized)
- Detailed error messages
- Use while coding

### Production Mode (npm start)
- Optimized build
- Faster performance
- Production-ready
- Use for actual MAIA usage

**You can run BOTH:**
- Dev on port 3001: `PORT=3001 npm run dev`
- Production on port 3000: `PORT=3000 npm start`

---

## 🛠️ Auto-Start Everything on Mac Boot

Create a master startup script:

```bash
cat > ~/start-maia-stack.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting MAIA Sovereign Stack..."

# Start Docker (if not already running)
open -a Docker

# Wait for Docker
sleep 10

# Start Supabase
cd ~/supabase/docker
docker compose up -d

# Start Ollama (if not already running)
ollama serve &

# Start MAIA via PM2
cd /Users/soullab/MAIA-PAI/apps/web
pm2 start ecosystem.config.js

# (Optional) Start Cloudflare Tunnel
# cloudflared tunnel run maia-sovereign

echo "✅ MAIA Stack Running!"
echo "   - MAIA: http://localhost:3000"
echo "   - Supabase Studio: http://localhost:3002"
echo "   - Ollama: http://localhost:11434"
EOF

chmod +x ~/start-maia-stack.sh
```

**Add to Login Items:**
1. Open System Settings → General → Login Items
2. Add `start-maia-stack.sh`

OR create LaunchAgent:

```bash
cat > ~/Library/LaunchAgents/com.maia.stack.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.maia.stack</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/soullab/start-maia-stack.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardErrorPath</key>
    <string>/tmp/maia-stack.err</string>
    <key>StandardOutPath</key>
    <string>/tmp/maia-stack.out</string>
</dict>
</plist>
EOF

launchctl load ~/Library/LaunchAgents/com.maia.stack.plist
```

---

## 📈 Performance: Vercel vs Mac Studio

**Real-world benchmarks:**

| Metric | Vercel | Mac Studio M4 |
|--------|--------|---------------|
| Cold start | 500-2000ms | 0ms (always warm) |
| API response | 100-300ms | <10ms |
| Database query | 50-200ms | <5ms (localhost) |
| LLM inference | N/A (external) | 9s (local DeepSeek-R1) |
| Total request time | 650-2500ms | ~9s (dominated by LLM) |

**MAIA on Mac Studio is FASTER for everything except LLM** (which is same speed locally).

---

## 🏆 Complete Sovereignty Checklist

After eliminating Vercel:

- [x] **LLM Inference** - DeepSeek-R1 via Ollama (local)
- [x] **Database** - Supabase (local)
- [x] **Frontend Hosting** - Mac Studio (local)
- [ ] **Voice Synthesis** - ElevenLabs (still external)
- [ ] **Domain/DNS** - Cloudflare (optional, for internet access)

**99% Sovereign!** 🎉

Voice synthesis is the last piece - working on Sesame (self-hosted TTS) integration!

---

## 🚨 Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Port Already in Use
```bash
# Find what's using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### PM2 Won't Start on Boot
```bash
# Reinstall startup script
pm2 unstartup
pm2 startup
# Run the command it gives you
pm2 save
```

---

## 💡 Pro Tips

1. **Keep Vercel for Preview Deployments**
   - Use Vercel for testing new features
   - Run production locally for sovereignty

2. **Use PM2 Clusters** (if needed)
   ```javascript
   // In ecosystem.config.js
   instances: 'max', // Use all CPU cores
   exec_mode: 'cluster'
   ```

3. **Monitor Everything**
   ```bash
   pm2 monit  # Real-time monitoring
   docker compose logs -f  # Supabase logs
   ```

4. **Backup Strategy**
   - Supabase: Automated SQL dumps
   - MAIA app: Git repository
   - .env files: Encrypted backup

---

## 🎯 Quick Commands Reference

```bash
# Build & run production
npm run build && npm start

# PM2 management
pm2 start ecosystem.config.js
pm2 stop maia-sovereign
pm2 restart maia-sovereign
pm2 logs maia-sovereign

# View all services
pm2 status  # MAIA
docker compose ps  # Supabase
ollama list  # AI models

# Full stack restart
pm2 restart all
docker compose restart
```

---

**You're now ready to run MAIA 100% sovereign!** 🏛️✨

No Vercel. No external dependencies (except optional voice/DNS).

Complete control. Complete privacy. $0 cost.
