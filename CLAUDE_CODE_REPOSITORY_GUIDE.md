# 🤖 Claude Code Repository Guide
## **CRITICAL: Repository Structure & Deployment Guide**

> **⚠️ IMPORTANT**: This guide is specifically for Claude Code sessions to prevent common repository confusion.

## 🎯 **PRIMARY RULE: MAIA-SOVEREIGN is the PRODUCTION BUILD**

### **Repository Structure:**
```
/Users/soullab/
├── MAIA-SOVEREIGN/           🟢 **PRODUCTION REPOSITORY**
│   ├── app/                  ✅ Main Next.js application
│   ├── lib/                  ✅ Core MAIA libraries
│   ├── components/           ✅ React components
│   ├── docker-compose.yml    ✅ Production Docker config
│   ├── nginx/                ✅ Production nginx config
│   └── deploy.sh            ✅ Production deployment script
│
├── MAIA-PAI-SOVEREIGN/       🟡 **BUILD ENVIRONMENT**
│   └── (Development/testing environment - NOT production)
│
└── MAIA-PAI/                🔴 **LEGACY/ARCHIVE**
    └── (Old repository - DO NOT USE)
```

## 🚨 **Common Mistakes to AVOID:**

### ❌ **WRONG Repository Assumptions:**
- "Let me check MAIA-PAI for the latest code"
- "I should work in MAIA-PAI-SOVEREIGN since it has 'sovereign' in the name"
- "The main repository is probably MAIA-PAI"

### ✅ **CORRECT Approach:**
- **ALWAYS work in `/Users/soullab/MAIA-SOVEREIGN/`**
- **ALWAYS deploy from MAIA-SOVEREIGN**
- **ALWAYS check MAIA-SOVEREIGN for latest code**

## 🎯 **Quick Reference for Claude Code Sessions:**

### **Before Starting ANY Task:**
1. **Verify you're in MAIA-SOVEREIGN**: `pwd` should show `/Users/soullab/MAIA-SOVEREIGN`
2. **If not, navigate there**: `cd /Users/soullab/MAIA-SOVEREIGN`
3. **Check git status**: Confirm you're in the correct repository

### **For Web Development Tasks:**
- **Main app**: `/Users/soullab/MAIA-SOVEREIGN/app/`
- **API routes**: `/Users/soullab/MAIA-SOVEREIGN/app/api/`
- **Components**: `/Users/soullab/MAIA-SOVEREIGN/components/`
- **Libraries**: `/Users/soullab/MAIA-SOVEREIGN/lib/`

### **For Deployment Tasks:**
```bash
# CORRECT deployment from MAIA-SOVEREIGN
cd /Users/soullab/MAIA-SOVEREIGN
./deploy.sh production

# OR for Docker rebuild
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

## 🌐 **Live Site Information:**

- **Production URL**: https://soullab.life
- **Served by**: Docker container built from MAIA-SOVEREIGN
- **Port mapping**:
  - External 80/443 → nginx → web:3000 (Docker internal)
  - Direct access: localhost:3002 → web:3000

## 🔧 **Key Integration Points:**

### **MAIA Features in MAIA-SOVEREIGN:**
- ✅ **Archetypal Intelligence System** (`lib/consciousness/`)
- ✅ **Sovereignty Protocol** (`lib/consciousness/sovereignty-protocol.ts`)
- ✅ **IPP Integration** (`lib/services/spiralogicIPPKnowledge.ts`)
- ✅ **Oracle API** (`app/api/oracle/conversation/route.ts`)
- ✅ **Memory System** (`app/api/maia/memory-enhanced-response/route.ts`)

## 📋 **Common Tasks Checklist:**

### **When Adding Features:**
- [ ] Navigate to `/Users/soullab/MAIA-SOVEREIGN/`
- [ ] Read existing code in correct repository
- [ ] Make changes in MAIA-SOVEREIGN
- [ ] Test locally with `npm run dev`
- [ ] Deploy with Docker if needed

### **When Debugging Issues:**
- [ ] Check MAIA-SOVEREIGN logs: `docker-compose logs web`
- [ ] Test MAIA-SOVEREIGN endpoints: `curl http://soullab.life/api/...`
- [ ] Verify MAIA-SOVEREIGN container status: `docker-compose ps`

### **When Deploying:**
- [ ] Ensure working in MAIA-SOVEREIGN
- [ ] Run build test: `npm run build`
- [ ] Deploy: `./deploy.sh production` OR Docker rebuild
- [ ] Verify: Check soullab.life is working

## 🚨 **Emergency Recovery:**

If soullab.life is not working:

```bash
# 1. Navigate to correct repository
cd /Users/soullab/MAIA-SOVEREIGN

# 2. Check container status
docker-compose ps

# 3. Rebuild if needed
docker-compose down && docker-compose build --no-cache && docker-compose up -d

# 4. Verify
curl -I http://soullab.life
```

## 📞 **Need Help?**

When asking for help, always specify:
- "I'm working in MAIA-SOVEREIGN repository"
- Current directory: `/Users/soullab/MAIA-SOVEREIGN`
- Task context: what you're trying to accomplish

---

**🔗 Remember**:
- **MAIA-SOVEREIGN** = Production build (the real one)
- **MAIA-PAI-SOVEREIGN** = Build environment
- **MAIA-PAI** = Legacy/archive (don't use)

**Always start with MAIA-SOVEREIGN. Always deploy from MAIA-SOVEREIGN. Always check MAIA-SOVEREIGN first.**