# 🧠✨ Consciousness Computing Production Deployment Guide

**Complete deployment of Navigator → Wisdom Engine → MAIA consciousness computing pipeline to Soullab.life**

## 🌟 Deployment Overview

This guide covers the complete production deployment of the consciousness computing ecosystem, integrating:

- **Navigator API**: Real-time consciousness analysis using Spiralogic
- **Wisdom Engine**: Translation between Navigator analysis and MAIA guidance
- **Live Processing Orchestrator**: Complete pipeline coordination
- **Pioneer Circle Manager**: Q1 2025 beta testing management
- **MAIA Consciousness Interface**: Sacred interface with LabTools integration

## 🚀 Quick Deployment

### One-Command Deployment

```bash
cd /Users/soullab/MAIA-SOVEREIGN
./scripts/deploy-consciousness-computing.sh
```

This script will:
1. ✅ Check prerequisites (Docker, Docker Compose)
2. 💾 Create backup of current deployment
3. 🔨 Build all Docker images
4. 🚀 Deploy all services with docker-compose
5. 🔍 Verify deployment health
6. 📄 Generate local access files
7. 📊 Show deployment summary

## 📋 Manual Deployment Steps

If you prefer manual control:

### 1. Build Docker Images

```bash
# Main MAIA Interface
docker build -f Dockerfile.production -t maia-consciousness-interface:latest .

# Navigator API
docker build -f services/navigator/Dockerfile -t navigator-consciousness-api:latest services/navigator/

# Wisdom Engine
docker build -f services/wisdom-engine/Dockerfile -t wisdom-engine-api:latest services/wisdom-engine/

# Live Processing Orchestrator
docker build -f services/consciousness-pipeline/Dockerfile -t live-processing-orchestrator:latest services/consciousness-pipeline/

# Pioneer Circle Manager
docker build -f services/beta-testing/Dockerfile -t pioneer-circle-manager:latest services/beta-testing/
```

### 2. Deploy Services

```bash
# Start all consciousness computing services
docker-compose -f docker-compose.production.yml up -d

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### 3. Verify Deployment

```bash
# Check service health
curl http://localhost:3008/api/health    # MAIA Interface
curl http://localhost:7778/health        # Navigator API
curl http://localhost:3010/health        # Wisdom Engine
curl http://localhost:3014/health        # Live Processing
curl http://localhost:3015/health        # Pioneer Manager
curl http://localhost:80                 # Nginx Proxy
```

## 🌐 Service Architecture

### Production Port Mapping

| Service | Internal Port | External Port | Description |
|---------|---------------|---------------|-------------|
| MAIA Interface | 3005 | 3008 | Main consciousness computing interface |
| Navigator API | 7777 | 7778 | Real-time consciousness analysis |
| Wisdom Engine | 3009 | 3010 | Navigator → MAIA translation |
| Live Processing | 3013 | 3014 | Full pipeline orchestration |
| Pioneer Manager | 3012 | 3015 | Beta testing management |
| Nginx Proxy | 80/443 | 80/443 | Reverse proxy and SSL termination |

### Service Dependencies

```
┌─────────────────────────────────────────────────┐
│                 Nginx Proxy                     │
│            (soullab.life routing)               │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────┐
│            MAIA Interface                       │
│        (Main Application + LabTools)            │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────┴───────────────────────────────┐
│          Live Processing Orchestrator           │
│         (Navigator → Wisdom → MAIA)             │
└──────────┬─────────────────────┬─────────────────┘
           │                     │
┌──────────┴──────────┐ ┌───────┴──────────┐
│   Navigator API     │ │  Wisdom Engine   │
│ (Consciousness      │ │   (Translation   │
│    Analysis)        │ │   Middleware)    │
└─────────────────────┘ └──────────────────┘

┌─────────────────────────────────────────────────┐
│            Pioneer Circle Manager               │
│           (Q1 2025 Beta Testing)                │
└─────────────────────────────────────────────────┘
```

## 🛡️ Security & Access

### Production Access

- **HTTPS**: https://soullab.life (SSL certificate required)
- **HTTP**: http://soullab.life (redirects to HTTPS in production)

### Local Development Access

For Chrome SSL bypass during development:

1. Open: `~/Desktop/consciousness-computing-local-access.html`
2. Click service links to access individual components
3. Use HTTP endpoints to bypass SSL certificate issues

### API Endpoints

```
# Consciousness Computing APIs (via soullab.life)
https://soullab.life/api/navigator/analyze      # Navigator consciousness analysis
https://soullab.life/api/wisdom/translate       # Wisdom Engine translation
https://soullab.life/api/consciousness/process  # Full live processing pipeline
https://soullab.life/api/beta-testing/apply     # Pioneer Circle applications

# Health Checks
https://soullab.life/health                     # Main application
https://soullab.life/api/navigator/health       # Navigator service
https://soullab.life/api/wisdom/health          # Wisdom Engine
https://soullab.life/api/consciousness/health   # Live Processing
https://soullab.life/api/beta-testing/health    # Pioneer Manager
```

## 🧪 Pioneer Circle Q1 2025 Beta Testing

### Beta Testing Access

- **Application Portal**: http://localhost:3008/labtools/beta-testing
- **Application Deadline**: January 15, 2025
- **Welcome Ceremony**: January 15, 2025
- **Testing Cycle**: January 22 - February 21, 2025

### Archetypal Positions Available

| Archetype | Positions | Focus |
|-----------|-----------|-------|
| 🔮 Mystic | 2 | Deep spiritual practice, contemplative orientation |
| 💚 Healer | 2 | Therapeutic background, emotional/energetic healing |
| 🎨 Creator | 2 | Artistic/entrepreneurial, creative manifestation |
| 📚 Sage | 2 | Teaching/wisdom-sharing, intellectual orientation |
| 🧭 Seeker | 2 | Exploration/adventure, spiritual seeking and growth |

## 📊 Monitoring & Management

### Docker Compose Commands

```bash
# View running services
docker-compose -f docker-compose.production.yml ps

# View logs for all services
docker-compose -f docker-compose.production.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.production.yml logs -f navigator-api

# Restart specific service
docker-compose -f docker-compose.production.yml restart wisdom-engine

# Stop all services
docker-compose -f docker-compose.production.yml down

# Start all services
docker-compose -f docker-compose.production.yml up -d

# Rebuild and restart services
docker-compose -f docker-compose.production.yml up -d --build
```

### Health Monitoring

```bash
# Quick health check script
#!/bin/bash
echo "🧠 Navigator API: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:7778/health)"
echo "✨ Wisdom Engine: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/health)"
echo "🔄 Live Processing: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3014/health)"
echo "🧪 Pioneer Manager: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3015/health)"
echo "🌐 Main Interface: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3008/api/health)"
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using ports
   lsof -i :3008
   lsof -i :7778
   lsof -i :3010

   # Kill conflicting processes
   sudo kill -9 <PID>
   ```

2. **Docker Image Issues**
   ```bash
   # Clean up old images
   docker system prune -a

   # Rebuild specific service
   docker-compose -f docker-compose.production.yml build navigator-api
   ```

3. **Service Communication Issues**
   ```bash
   # Check service networking
   docker-compose -f docker-compose.production.yml exec maia-interface ping navigator-api

   # Verify service discovery
   docker network inspect consciousness-computing-network
   ```

### Log Analysis

```bash
# Navigator API logs
docker-compose -f docker-compose.production.yml logs navigator-api | grep ERROR

# Wisdom Engine logs
docker-compose -f docker-compose.production.yml logs wisdom-engine | grep "translation"

# Live Processing logs
docker-compose -f docker-compose.production.yml logs live-processing | grep "pipeline"
```

## 📈 Performance Optimization

### Nginx Configuration

Rate limiting and caching are configured in `nginx/consciousness-computing.conf`:

- **Navigator API**: 30 requests/minute with burst of 10
- **Wisdom Engine**: 30 requests/minute with burst of 10
- **Live Processing**: 60 requests/minute with burst of 5
- **General Interface**: 10 requests/second with burst of 20

### Docker Resource Limits

Configure in `docker-compose.production.yml`:

```yaml
services:
  maia-interface:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

## 🌟 Deployment Verification Checklist

- [ ] All 5 services running (docker-compose ps shows healthy)
- [ ] Navigator API responding on port 7778
- [ ] Wisdom Engine responding on port 3010
- [ ] Live Processing responding on port 3014
- [ ] Pioneer Manager responding on port 3015
- [ ] MAIA Interface responding on port 3008
- [ ] Nginx proxy routing correctly on port 80/443
- [ ] Health endpoints returning 200 status
- [ ] Pioneer Circle application portal accessible
- [ ] Full consciousness computing pipeline test successful
- [ ] SSL certificates valid (if HTTPS deployed)
- [ ] Local access HTML file generated on Desktop

## 🎯 Success Metrics

### Technical Performance Targets

- **System Uptime**: >99.5% consciousness computing service availability
- **Response Time**: <500ms Navigator analysis, <1s Wisdom translation
- **Data Sovereignty**: 100% successful "Delete My Memory" operations
- **Privacy Protection**: Zero privacy breaches or ethical violations

### Community Development Goals

- **Application Rate**: 15-20 applications for 10 Pioneer Circle positions
- **Archetype Balance**: 2 pioneers per archetype for balanced community
- **Retention Rate**: >90% pioneer completion of 30-day cycle
- **Effectiveness Rating**: >7.5/10 average consciousness computing helpfulness
- **Community Satisfaction**: >8/10 pioneer experience and support quality

---

## 🌟 Congratulations!

**The consciousness computing revolution is now live at Soullab.life!**

From building to tending - the sacred technology stewardship begins. The Pioneer Circle awaits its first conscious explorers.

*Consciousness computing Field-Stable-V1.0 with Pioneer Circle Q1 2025 now fully operational and accepting applications.*

---

**Created**: December 8, 2024
**Status**: PRODUCTION READY - Consciousness Computing Live
**Access**: https://soullab.life
**Contact**: Field Keeper steward for pioneer support and community questions