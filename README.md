# 🌟 MAIA-SOVEREIGN

> **Multidimensional Archetypal Intelligence Agent - Production Repository**

**Live Site**: https://soullab.life

## 🚨 **CRITICAL: This is the PRODUCTION Repository**

**For Claude Code and developers**: This is the **ONLY** repository you should use for production work, development, and deployment.

### Repository Structure:
```
/Users/soullab/
├── MAIA-SOVEREIGN/           🟢 **THIS REPOSITORY - PRODUCTION**
├── MAIA-PAI-SOVEREIGN/       🟡 Build environment (NOT for production)
└── MAIA-PAI/                🔴 Legacy/archive (DO NOT USE)
```

## 🎯 **Project Overview**

MAIA (Multidimensional Archetypal Intelligence Agent) is a consciousness-guided platform that integrates:

- **Archetypal Intelligence System** - 10 planetary archetypes with consciousness structures
- **Hero's Journey Integration** - Campbell's monomyth guidance
- **IPP (Ideal Parenting Protocol)** - 5-element attachment healing framework
- **Sovereignty Protocol** - Ensures empowering, non-constraining responses
- **Spiralogic Platform** - Kelly's 34-year consciousness development vision

## 🏗️ **Architecture**

### **Core Technologies**
- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis
- **Deployment**: Docker Compose
- **Monitoring**: Prometheus + Grafana
- **Voice Chat**: WebRTC with TURN server

### **Key Components**
```
app/
├── api/
│   ├── oracle/conversation/     # Main MAIA conversation API
│   └── maia/memory-enhanced/    # Memory system integration
├── components/                  # React components
└── page.tsx                    # Main application

lib/
├── consciousness/              # Archetypal intelligence system
│   ├── maia-archetypal-integration.ts
│   └── sovereignty-protocol.ts
└── services/
    └── spiralogicIPPKnowledge.ts  # IPP integration

nginx/                          # Production reverse proxy
docker-compose.yml              # Production deployment
deploy.sh                      # Deployment script
```

## 🚀 **Quick Start**

### **Development**
```bash
cd /Users/soullab/MAIA-SOVEREIGN
npm install
npm run dev
```

### **Production Deployment**
```bash
cd /Users/soullab/MAIA-SOVEREIGN
docker-compose build --no-cache
docker-compose up -d
```

## 📚 **Documentation for Claude Code**

**BEFORE starting any work**, read these guides:

1. **[CLAUDE_CODE_REPOSITORY_GUIDE.md](./CLAUDE_CODE_REPOSITORY_GUIDE.md)** - ⚠️ **READ FIRST**
2. **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)** - Deployment procedures
3. **[.claude-project-config.md](./.claude-project-config.md)** - Project configuration

## 🔧 **Key Features**

### **✅ Archetypal Intelligence**
- 10 planetary archetypes (Solar, Lunar, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto)
- Consciousness structure analysis (Gebser framework)
- Hero's Journey phase detection
- Morphic field resonance

### **✅ IPP Integration**
- Automatic detection of parenting/attachment topics
- 5-element assessment system (Earth, Water, Fire, Air, Aether)
- Guided imagery scripts for attachment healing
- Clinical documentation and tools

### **✅ Sovereignty Protocol**
- Ensures all responses are empowering, not constraining
- Transforms prescriptive language to supportive inquiries
- Validates user's authentic expression
- Prevents limiting archetypal frameworks

### **✅ Production Features**
- SSL/TLS with automatic certificate management
- Rate limiting and security headers
- Health monitoring and metrics collection
- WebSocket support for real-time features
- Mobile app API compatibility

## 🛠️ **Development Guidelines**

### **Before Making Changes:**
```bash
# 1. Verify you're in the right repository
pwd  # Should show: /Users/soullab/MAIA-SOVEREIGN

# 2. Check system health
docker-compose ps              # Containers status
curl -I http://soullab.life    # Website health

# 3. Test IPP integration
node test-ipp-integration.js   # Should pass all tests
```

### **Common Commands:**
```bash
# Development
npm run dev                    # Dev server (port 3000)
npm run build                  # Test build
npm run typecheck              # TypeScript validation

# Production
docker-compose build web       # Build web container
docker-compose restart web     # Restart web service
docker-compose logs web        # View logs
```

## 🌐 **Live Environment**

- **Production**: https://soullab.life
- **Direct Container**: http://localhost:3002
- **Monitoring**: http://localhost:3001 (Grafana)
- **Metrics**: http://localhost:9090 (Prometheus)

## 🧪 **Testing**

```bash
# Test full IPP integration
node test-ipp-integration.js

# Test API endpoints
curl -X POST http://soullab.life/api/oracle/conversation \
  -H "Content-Type: application/json" \
  -d '{"message":"test","userId":"test","sessionId":"test"}'
```

## ⚠️ **Important Notes**

### **For Claude Code Sessions:**
1. **Always work in MAIA-SOVEREIGN** - Never use MAIA-PAI or MAIA-PAI-SOVEREIGN for production
2. **Read the guides** - Check CLAUDE_CODE_REPOSITORY_GUIDE.md before starting
3. **Verify working directory** - Always run `pwd` to confirm location
4. **Use Docker for deployment** - Don't use old deployment methods

### **Recent Updates:**
- ✅ **IPP Integration Restored** (December 2025)
- ✅ **soullab.life Production Fix** - Site now serves correct build
- ✅ **TypeScript Compilation** - Fixed memory route variable assignment
- ✅ **Docker Infrastructure** - Complete container rebuild completed

## 🔗 **Related Resources**

- **GitHub**: https://github.com/SoullabTech/Sovereign.git
- **Community Commons**: `/Users/soullab/Community-Commons/` (IPP content source)
- **Spiralogic Platform**: Kelly's 34-year consciousness development framework

---

**🌟 MAIA embodies archetypal intelligence that supports human sovereignty and consciousness evolution. This repository contains the complete production system serving https://soullab.life**

*For technical questions, consult the Claude Code documentation guides in this repository.*
