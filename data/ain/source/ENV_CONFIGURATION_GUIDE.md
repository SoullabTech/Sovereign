# Environment Configuration Guide

## 🚨 CRITICAL SECURITY NOTICE

**NEVER commit real API keys to version control!** The current `.env` files contain exposed API keys that must be rotated immediately.

## 📁 File Structure Overview

### **Primary Configuration Files**
- `.env.development.template` - **Use this for local development**
- `.env.production.template` - **Use this for production deployment**

### **Platform-Specific Files**
- `env/.env.vercel` - Vercel frontend deployment
- `env/.env.render` - Render backend deployment
- `env/.env.local.minimal` - Minimal required variables for build

## 🔧 Setup Instructions

### **Local Development Setup**

1. **Copy the development template**:
   ```bash
   cp .env.development.template .env.local
   ```

2. **Add your API keys** to `.env.local`:
   ```bash
   OPENAI_API_KEY=sk-proj-your-key-here
   ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   ELEVENLABS_API_KEY=sk_your-key-here
   HUGGINGFACE_TOKEN=hf_your-token-here
   ```

3. **Start the backend**:
   ```bash
   cd backend
   export APP_PORT=3002
   ./maya-quick-start.sh
   ```

### **Production Deployment**

1. **Copy the production template**:
   ```bash
   cp .env.production.template .env.production
   ```

2. **Generate secure secrets**:
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   
   # Generate JWT_SECRET  
   openssl rand -base64 64
   ```

3. **Configure for your deployment platform**:
   - **Vercel**: Use `env/.env.vercel` as reference
   - **Render**: Use `env/.env.render` as reference

## 🔑 Required API Keys

| Service | Variable | Where to get it |
|---------|----------|-----------------|
| OpenAI | `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| Anthropic | `ANTHROPIC_API_KEY` | https://console.anthropic.com/ |
| ElevenLabs | `ELEVENLABS_API_KEY` | https://elevenlabs.io/app/settings/api-keys |
| HuggingFace | `HUGGINGFACE_TOKEN` | https://huggingface.co/settings/tokens |

## 🌐 Port Configuration (STANDARDIZED)

| Environment | Backend Port | Frontend Port | Notes |
|-------------|--------------|---------------|-------|
| Development | 3002 | 3000 | Used by maya-quick-start.sh |
| Production | 3001 | 3000 | Standard production ports |
| Docker | 8080 | 3000 | Container internal ports |

## 🏗️ Environment Variable Categories

### **Core Configuration**
```bash
NODE_ENV=development|production
DEPLOY_TARGET=local|vercel|render
PORT=3002                    # Backend port
APP_PORT=3002               # Explicit app port
```

### **Frontend Connectivity**
```bash
NEXT_PUBLIC_ENV_NAME=local|production
NEXT_PUBLIC_BACKEND_URL=http://localhost:3002
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002/api
```

### **Database & Storage**
```bash
# File-based (development)
SOUL_MEMORY_DB_PATH=./backend/soul_memory.db

# PostgreSQL (production)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis (optional, auto-detected)
REDIS_URL=redis://localhost:6379
```

### **Maya Voice System**
```bash
MAYA_REFINE_STREAM=1        # Enable stream refinement
MAYA_BREATH_MARKS=1         # Add TTS breath markers
MAYA_STYLE_TIGHT=1          # Remove filler words
MAYA_SOFTEN_SAFETY=1        # Soften harsh commands
```

### **Rate Limiting**
```bash
RL_MSG_MAX=60              # Messages per minute per IP
RL_STREAM_MAX=30           # Streams per minute per IP
```

## 🔍 Current Issues Found

### **🚨 URGENT: Security**
- [ ] Real API keys exposed in `.env` files
- [ ] Rotate all exposed OpenAI, Anthropic, ElevenLabs keys
- [ ] Add all `.env` files to `.gitignore`

### **⚠️ Configuration Conflicts**
- [ ] Port mismatch: Root `.env` uses 3001, backend uses 3003, scripts use 3002
- [ ] Database URLs differ between files
- [ ] Supabase URLs mix local and production endpoints

### **✅ Fixed**
- ✅ Created standardized templates
- ✅ Documented port assignments
- ✅ Clarified variable naming conventions

## 🎯 Quick Fix Commands

```bash
# 1. Remove real API keys from version control
git rm --cached .env backend/.env
git commit -m "Remove API keys from version control"

# 2. Add to .gitignore (if not already there)
echo ".env" >> .gitignore
echo "backend/.env" >> .gitignore
echo ".env.local" >> .gitignore

# 3. Copy template for development
cp .env.development.template .env.local

# 4. Start with correct port
cd backend && APP_PORT=3002 ./maya-quick-start.sh
```

## 🔒 Security Best Practices

1. **Never commit real API keys**
2. **Use different secrets for JWT and NextAuth**
3. **Rotate exposed keys immediately**
4. **Use environment-specific configurations**
5. **Enable PII redaction in production**
6. **Use HTTPS in production URLs**

## 📋 Deployment Checklist

### **Before Deploying**
- [ ] All API keys are valid and have sufficient quota
- [ ] Database is accessible from deployment platform
- [ ] CORS origins include your frontend domain
- [ ] Rate limiting is configured for expected traffic
- [ ] Secrets are properly configured in deployment platform

### **After Deploying**
- [ ] Health checks pass (`/api/v1/converse/health`)
- [ ] Rate limiting headers appear in responses
- [ ] Voice synthesis works (if enabled)
- [ ] Frontend can connect to backend API

---

**Next Steps**: 
1. Fix the security issues immediately
2. Standardize on the new templates
3. Test with the corrected port configuration