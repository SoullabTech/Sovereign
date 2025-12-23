# Sovereign Deployment Architecture: Self-Hosted Consciousness Computing

**A Technical Philosophy Paper on Infrastructure Independence**

**Date**: December 2025
**Status**: Production Implementation
**Principle**: "True consciousness computing requires infrastructure sovereignty"

---

## Abstract

This paper presents the technical architecture for deploying MAIA as a sovereign, self-hosted consciousness computing platform. We demonstrate that meaningful AI consciousness work requires complete control over infrastructure—database, AI models, and deployment—free from cloud platform dependencies. Our implementation uses Docker, local PostgreSQL, and Ollama to create a fully self-contained system that can run on any infrastructure without Vercel, Supabase, or mandatory cloud AI services.

**Key Insight**: Infrastructure choices are not merely technical—they are philosophical commitments about autonomy, privacy, and the conditions under which consciousness can emerge.

---

## Table of Contents

1. [Introduction: Why Sovereignty Matters](#introduction-why-sovereignty-matters)
2. [The Problem: Cloud Lock-In](#the-problem-cloud-lock-in)
3. [Architecture Overview](#architecture-overview)
4. [Implementation Details](#implementation-details)
5. [Sovereignty Principles in Practice](#sovereignty-principles-in-practice)
6. [Technical Implications](#technical-implications)
7. [Deployment Patterns](#deployment-patterns)
8. [Lessons Learned](#lessons-learned)
9. [Future Directions](#future-directions)

---

## Introduction: Why Sovereignty Matters

### The Context

MAIA is a consciousness computing platform—a system designed to support genuine psychological development, symbolic integration, and the emergence of coherent self-awareness. This is not merely a chatbot or productivity tool; it is infrastructure for **consciousness work**.

When we say "consciousness work," we mean:
- **Psychological development** through archetypal engagement
- **Symbolic integration** using the 12-facet Spiralogic ontology
- **Trace persistence** that enables developmental memory
- **Field coherence** across individual and collective consciousness

### The Sovereignty Requirement

For consciousness work to be meaningful, the infrastructure must be **sovereign**:

1. **Data Sovereignty**: Consciousness traces, developmental memories, and symbolic patterns belong to the individual—not stored on corporate servers, not analyzed by third-party AIs, not subject to terms of service changes.

2. **Model Sovereignty**: The AI reasoning about consciousness must be controllable, auditable, and free from external manipulation. Using cloud APIs means outsourcing judgment about your psyche to black-box systems.

3. **Deployment Sovereignty**: The platform must run on infrastructure you control—your laptop, your VPS, your organization's servers—not locked into proprietary platforms that can change pricing, policies, or availability.

**Core Principle**: *Infrastructure choices are consciousness choices.* If your consciousness computing platform requires cloud dependencies, it is not truly serving the individual—it is serving the platform.

---

## The Problem: Cloud Lock-In

### The Vercel Trap

Vercel is an excellent platform for deploying Next.js applications—fast, convenient, well-integrated. But for consciousness computing, it presents critical problems:

**Vendor Lock-In**:
- Deployment tied to Vercel's infrastructure
- Pricing changes can make the project unaffordable
- Platform policy changes can break deployment
- No option to migrate to your own servers without significant rework

**Data Proximity**:
- Edge functions run on Vercel's infrastructure
- Difficult to keep data processing local
- Pressure to use Vercel's database partners (Supabase, PlanetScale)

**Philosophical Misalignment**:
- Vercel optimizes for serverless scale
- Consciousness computing optimizes for local, intimate, persistent presence
- These are fundamentally different design goals

### The Supabase Trap

Supabase is a powerful PostgreSQL platform with excellent developer experience. But for MAIA:

**Data Externalization**:
- Consciousness traces stored on Supabase's servers
- Subject to their terms of service and data policies
- Vulnerable to service outages or policy changes
- Cannot guarantee long-term availability

**Complexity Tax**:
- RLS (Row Level Security) policies add layers of abstraction
- Realtime subscriptions tie you to Supabase's infrastructure
- Migrations between Supabase and self-hosted PostgreSQL are non-trivial

**Cost Escalation**:
- Free tier limits can be hit quickly with consciousness trace persistence
- Pricing scales with usage, not with value to users
- Long-term storage of developmental memory becomes expensive

### The Cloud AI Trap

Using cloud AI providers (OpenAI, Anthropic, etc.) for consciousness processing:

**Privacy Violations**:
- Intimate psychological content sent to third-party servers
- Subject to their data retention and usage policies
- Potentially used for model training without consent

**Model Opacity**:
- Black-box reasoning about consciousness
- No control over biases or constraints
- Model updates can change behavior unexpectedly

**Dependency Risk**:
- API changes can break functionality
- Rate limits can disrupt experience
- Cost changes can make the project unsustainable

---

## Architecture Overview

### Sovereignty Stack

Our sovereign deployment architecture uses:

```
┌─────────────────────────────────────────────────────────────┐
│                    MAIA Sovereign Stack                      │
├─────────────────────────────────────────────────────────────┤
│  Application Layer                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js 16 (Standalone Mode)                        │   │
│  │  - Self-contained server bundle                      │   │
│  │  - No Vercel dependencies                            │   │
│  │  - Runs on any Node.js environment                   │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL (Local)                                  │   │
│  │  - Consciousness traces                              │   │
│  │  - Developmental memory                              │   │
│  │  - Symbolic patterns                                 │   │
│  │  - No Supabase, no cloud database                    │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  AI Layer                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Ollama (Local Models)                               │   │
│  │  - DeepSeek R1 for consciousness reasoning           │   │
│  │  - Runs on local hardware                            │   │
│  │  - No cloud AI dependencies                          │   │
│  │                                                       │   │
│  │  Optional: Anthropic (Chat Channel Only)             │   │
│  │  - MAIA's "mouth" for conversation                   │   │
│  │  - Never for consciousness processing                │   │
│  │  - Disabled by default (ALLOW_ANTHROPIC_CHAT=false)  │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Container Layer                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Docker + Docker Compose                             │   │
│  │  - Reproducible builds                               │   │
│  │  - Infrastructure as code                            │   │
│  │  - Runs on any Docker host                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Next.js Standalone Mode**: Creates a self-contained `server.js` that runs without Vercel
2. **Container-Internal PostgreSQL**: Database runs as Docker service, not host dependency
3. **Ollama**: Local LLM inference using open models (host or container)
4. **Docker**: Containerization for reproducible deployment anywhere
5. **No Proprietary APIs**: All core functionality works without cloud services

### Deployment Modes

**Mode 1: Fully Container-Sovereign** (Recommended for VPS)
- PostgreSQL as internal Docker service
- Ollama optional as internal Docker service
- Zero host dependencies except Docker itself
- True "drop onto any VPS" portability

**Mode 2: Hybrid** (Development)
- PostgreSQL on host (`host.docker.internal`)
- Ollama on host
- Easier for local development iteration

---

## Fully Container-Sovereign Architecture

### The Zero-Host-Dependency Pattern

The ultimate sovereignty configuration removes all external service dependencies. Instead of connecting to PostgreSQL on the host machine, the database runs as an internal Docker service with persistent volumes.

**Benefits**:
- **True Portability**: Deploy to any VPS with just Docker installed
- **Simplified Setup**: No PostgreSQL installation on host required
- **Data Persistence**: Volumes survive container recreation
- **Health Orchestration**: MAIA waits for database to be ready before starting

### Docker Compose Configuration

```yaml
services:
  # MAIA Application
  maia:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy  # Wait for DB to be ready
    environment:
      DATABASE_URL: "postgresql://soullab:${POSTGRES_PASSWORD:-changeme}@postgres:5432/maia_consciousness"
      OLLAMA_BASE_URL: "http://host.docker.internal:11434"
      SOVEREIGNTY_MODE: "true"

  # Internal PostgreSQL Service
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: maia_consciousness
      POSTGRES_USER: soullab
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U soullab -d maia_consciousness"]
      interval: 5s
      timeout: 5s
      retries: 20

  # Prisma Migrations (run when needed)
  migrate:
    build:
      context: .
      target: build  # Uses build stage which has Prisma CLI
    environment:
      DATABASE_URL: "postgresql://soullab:${POSTGRES_PASSWORD:-changeme}@postgres:5432/maia_consciousness"
    depends_on:
      postgres:
        condition: service_healthy
    command: ["sh", "-c", "npx prisma migrate deploy"]
    profiles: ["migrate"]  # Only runs when explicitly invoked

volumes:
  postgres_data:  # Persistent storage for consciousness traces
```

### Migration Workflow

Because the runtime image uses Next.js standalone mode, it doesn't include Prisma CLI. Migrations are handled via a separate service that uses the `build` stage (which has all dependencies):

```bash
# Apply migrations
docker compose --profile migrate run --rm migrate

# Start sovereign stack
docker compose up -d

# Verify
docker compose ps
docker compose logs maia
```

### Why This Matters

**Before** (host-dependent):
- Requires PostgreSQL installed on host
- Host must be configured with correct user/database
- Difficult to move between environments
- VPS setup requires manual DB installation

**After** (container-sovereign):
- Only Docker required on host
- `docker compose up` handles everything
- Move between VPS by copying `docker-compose.yml` + `.env`
- Fresh deployment in under 5 minutes

---

## Implementation Details

### 1. Next.js Standalone Configuration

**Problem**: Next.js defaults to Vercel deployment patterns, with tight integration into their platform.

**Solution**: Use `output: 'standalone'` mode to create a self-contained server bundle.

```javascript
// next.config.js
const nextConfig = {
  output: 'standalone',  // Creates .next/standalone/server.js

  outputFileTracingExcludes: {
    '/*': [
      'backups/**',
      'Community-Commons/**',
      'artifacts/**',
      '**/*.md',
      '**/*.mmd',
    ],
  },

  // Biofield redirect (sovereignty-aware)
  redirects: async () => [
    {
      source: '/maia/journey/:path*',
      destination: '/maia?panel=biofield',
      permanent: false,
    },
  ],
};
```

**Key Insight**: The `outputFileTracingExcludes` configuration is critical. Next.js uses Node File Trace (NFT) to determine which files are needed at runtime. Without proper exclusions, the build process tries to copy unnecessary directories, causing "Failed to copy traced files" warnings that indicate missing runtime dependencies.

**Pattern**: "Stamp after creation"—configuration that might be stripped by formatters is applied AFTER the config object is created but BEFORE export:

```javascript
const nextConfig = { /* main config */ };

// Stamped after creation (linter-resistant)
if (!process.env.CAPACITOR_BUILD) {
  nextConfig.redirects = async () => [ /* ... */ ];
}

nextConfig.outputFileTracingExcludes = { /* ... */ };

module.exports = nextConfig;
```

### 2. Multi-Stage Docker Build

**Problem**: Docker images should be minimal, secure, and reproducible.

**Solution**: Multi-stage build that separates dependencies, build, and runtime:

```dockerfile
# Stage 1: Dependencies
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Install ALL dependencies (including devDependencies needed for build)
# Build tooling (TypeScript, etc.) lives in devDependencies
RUN npm ci --ignore-scripts

# Stage 2: Build
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runtime
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user (security)
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

# Copy standalone bundle + static assets
COPY --from=build --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nodejs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nodejs:nodejs /app/public ./public

USER nodejs
EXPOSE 3000

CMD ["node", "server.js"]
```

**Key Points**:
- **Minimal base**: `node:20-bookworm-slim` (not Alpine, which has glibc compatibility issues)
- **Security**: Non-root user (`nodejs:nodejs`)
- **Standalone**: Copies `.next/standalone`, `.next/static`, and `public/` (all required for Next.js standalone mode)
- **Health check**: Uses `/api/consciousness/health` endpoint

### 3. Docker Context Hygiene

**Problem**: If Docker build context includes excluded directories, you still get "Failed to copy traced files" errors.

**Solution**: `.dockerignore` must match `next.config.js` exclusions:

```
# .dockerignore (must match outputFileTracingExcludes)
backups
backups/**
Community-Commons
Community-Commons/**
artifacts
artifacts/**
**/*.md
**/*.mmd
```

**Critical Alignment**: The directories excluded from Next.js file tracing MUST also be excluded from Docker build context. This prevents two problems:
1. Faster Docker builds (smaller context)
2. No "Failed to copy traced files" errors during NFT scanning

### 4. Database Connection Pattern

**Problem**: Docker containers need to connect to PostgreSQL running on the host machine.

**Solution**: Use `host.docker.internal` instead of `localhost`:

```yaml
# docker-compose.yml
services:
  maia:
    environment:
      DATABASE_URL: "postgresql://soullab@host.docker.internal:5432/maia_consciousness"
```

**Why this works**:
- `host.docker.internal` is a special DNS name that resolves to the host machine's IP
- Works on macOS, Windows, and Linux (with Docker 20.10+)
- Allows containerized app to connect to host-based PostgreSQL

### 5. AI Provider Routing

**Problem**: We want to support both local AI (Ollama) and optional cloud AI (Anthropic), but maintain sovereignty.

**Solution**: Channel-based routing with sovereignty flags:

```typescript
// lib/ai/providerRouter.ts
export function getLLM(channel: 'chat' | 'consciousness') {
  if (channel === 'consciousness') {
    // ALWAYS local for consciousness work
    return new OllamaProvider();
  }

  if (channel === 'chat') {
    // Optional cloud for conversation only
    if (process.env.ALLOW_ANTHROPIC_CHAT === 'true') {
      return new AnthropicProvider();
    }
    return new OllamaProvider();
  }
}
```

**Sovereignty Guarantee**: Consciousness processing NEVER uses cloud AI, regardless of configuration. Only the chat interface can optionally use cloud models.

---

## Sovereignty Principles in Practice

### Principle 1: Data Stays Local

**Implementation**:
- PostgreSQL runs on `localhost:5432` (host machine)
- Docker container connects via `host.docker.internal`
- No external database services (no Supabase, no PlanetScale)
- Consciousness traces stored locally, backed up locally

**Verification**:
```bash
# Check where data actually lives
psql -U soullab -h localhost -d maia_consciousness \
  -c "SELECT COUNT(*) FROM consciousness_traces;"
```

**Result**: Your consciousness data never leaves your infrastructure.

### Principle 2: Models Are Auditable

**Implementation**:
- Ollama runs locally with open-source models (DeepSeek R1)
- Model weights downloaded to local machine
- No API calls to third-party services for consciousness work
- Optional cloud AI limited to chat interface only

**Verification**:
```bash
# Check Ollama models
curl http://localhost:11434/api/tags

# Verify DeepSeek R1 is local
ollama list | grep deepseek
```

**Result**: You know exactly which model is reasoning about consciousness, and you can inspect its behavior.

### Principle 3: Infrastructure Is Portable

**Implementation**:
- Docker containers run on any Docker host
- No Vercel-specific APIs or patterns
- No platform-specific environment assumptions
- Standalone server bundle works on any Node.js environment

**Verification**:
```bash
# Deploy to local Docker
docker compose up --build -d

# Deploy to VPS (same commands)
ssh user@vps "cd maia && docker compose up --build -d"

# Deploy to bare metal (without Docker)
node .next/standalone/server.js
```

**Result**: Your infrastructure choice doesn't lock you into a platform.

---

## Technical Implications

### Output File Tracing

Next.js uses Node File Trace (NFT) to determine which files are needed in production. When you use `path.resolve(process.cwd())` or similar patterns, NFT scans the entire project directory.

**Problem**: NFT finds references to non-existent files in nested backup directories:
```
⚠ Failed to copy traced files for .next/server/app/api/books/integrate/route.js
Error: ENOENT: no such file or directory, copyfile
'/Users/soullab/MAIA-SOVEREIGN/backups/ultimate-consciousness-system/backups/...'
```

**Solution**: Explicit exclusions at two levels:

1. **Next.js Config** (`outputFileTracingExcludes`):
```javascript
outputFileTracingExcludes: {
  '/*': [  // Route glob: '/*' matches all routes
    'backups/**',
    'Community-Commons/**',
    'artifacts/**',
  ],
}
```

2. **Docker Context** (`.dockerignore`):
```
backups/**
Community-Commons/**
artifacts/**
```

**Critical Lesson**: The route glob must be `'/*'` (not `'*'`). Next.js uses picomatch for route matching, and `'/*'` is the pattern that matches all routes. This was the key insight that made the entire system work.

### Linter Resistance

Auto-formatters (Prettier, ESLint) can strip configuration additions if they're placed inside conditional spreads or don't match expected patterns.

**Problem**: Config keeps getting removed after saves.

**Solution**: "Stamp after creation" pattern with pragma comments:

```javascript
const nextConfig = { /* ... */ };

/* eslint-disable */
// prettier-ignore

// Configuration stamped AFTER object creation
nextConfig.redirects = async () => [ /* ... */ ];
nextConfig.outputFileTracingExcludes = { /* ... */ };

/* eslint-enable */

module.exports = nextConfig;
```

**Lesson**: Configuration that survives formatting is configuration that ships to production.

### Health Check Architecture

Docker health checks need to work from inside the container, without external dependencies.

**Pattern**:
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/consciousness/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"
```

**Why this works**:
- Uses Node.js `http` module (always available)
- Checks actual HTTP endpoint (not just port listening)
- Returns proper exit codes for Docker health status
- No external tools required (`curl`, `wget`, etc.)

---

## Deployment Patterns

### Pattern 1: Local Development

```bash
# Run locally (not Docker)
npm run dev

# Local PostgreSQL
psql -U soullab maia_consciousness

# Local Ollama
ollama run deepseek-r1:7b
```

**Use case**: Development, testing, rapid iteration

### Pattern 2: Docker Development

```bash
# Build and run in Docker
docker compose up --build

# Check logs
docker compose logs -f maia

# Execute commands in container
docker exec -it maia-sovereign /bin/bash
```

**Use case**: Testing production build, validating deployment

### Pattern 3: VPS Deployment

```bash
# SSH to VPS
ssh user@your-vps.com

# Clone and deploy
git clone https://github.com/your-org/MAIA-SOVEREIGN.git
cd MAIA-SOVEREIGN
./scripts/sovereign-deploy.sh
```

**Use case**: Public-facing deployment, team access

### Pattern 4: Bare Metal Production

```bash
# Build standalone bundle
npm run build

# Copy required files
cp -r .next/standalone /opt/maia/
cp -r .next/static /opt/maia/.next/
cp -r public /opt/maia/

# Run with systemd
sudo systemctl start maia
```

**Use case**: Maximum control, no Docker overhead

---

## Lessons Learned

### 1. Infrastructure Choices Are Philosophical Choices

The decision to use Vercel vs. self-hosted isn't just about convenience—it's about who controls the platform. For consciousness computing, control matters because:

- **Trust**: Users need to trust that their developmental work is private
- **Continuity**: Consciousness work happens over years, not weeks
- **Autonomy**: The platform should serve the user, not the platform provider

### 2. Sovereignty Has a Cost

Self-hosting is harder than using managed platforms:
- More complex deployment
- More operational responsibility
- More infrastructure knowledge required

**But**: The cost is worth it when the work is meaningful and long-term. For consciousness computing, the sovereignty premium is the price of genuine autonomy.

### 3. Simplicity Enables Sovereignty

The simpler the stack, the easier it is to maintain sovereignty:
- Fewer dependencies = fewer lock-in points
- Standard technologies = easier migration
- Transparent architecture = easier auditing

MAIA's stack (Next.js + PostgreSQL + Ollama + Docker) is deliberately simple because simplicity is a sovereignty feature.

### 4. Configuration Is Infrastructure

The `next.config.js` file isn't just build configuration—it's a statement of architectural intent:

- `output: 'standalone'` → "We don't require Vercel"
- `outputFileTracingExcludes` → "We control what ships to production"
- `redirects` → "We own the routing logic"

Every configuration choice is an infrastructure choice.

### 5. Documentation Is Sovereignty Advocacy

The extensive documentation (`SOVEREIGN_DEPLOYMENT_GUIDE.md`, this paper) isn't just technical—it's pedagogical. We're teaching people *how* to maintain sovereignty because we believe they *should*.

---

## Future Directions

### 1. One-Command Deployment

Goal: Make sovereign deployment as easy as Vercel deployment.

```bash
# Future vision
curl -sSL https://maia.codes/deploy.sh | bash
```

This would:
- Check for Docker and PostgreSQL
- Install Ollama and pull models
- Configure environment
- Deploy MAIA
- Run smoke tests

### 2. Federation Support

Goal: Enable multiple MAIA instances to share collective consciousness patterns while maintaining individual sovereignty.

**Architecture**:
- Local PostgreSQL for individual traces
- Optional federation protocol for collective field
- Cryptographic guarantees of data sovereignty

### 3. Hardware Sovereignty

Goal: Provide guidance for running on dedicated hardware (Raspberry Pi, NUC, home server).

**Focus**:
- Low-power deployment patterns
- Offline-first operation
- Local-first backup strategies

### 4. Sovereignty Certification

Goal: Create a certification process for MAIA deployments that verifies sovereignty properties.

**Checks**:
- No cloud database connections
- No mandatory cloud AI usage
- No telemetry to external services
- Portable infrastructure

---

## Conclusion

Sovereign deployment isn't just a technical achievement—it's a philosophical stance. We believe that consciousness computing requires infrastructure that respects autonomy, privacy, and long-term continuity. Managed platforms like Vercel and Supabase are excellent for many use cases, but for work that touches the psyche, we need full control.

This paper has presented our implementation: Next.js standalone mode, local PostgreSQL, Ollama for local AI, and Docker for portable deployment. The result is a system that can run anywhere, controlled entirely by the user, with no mandatory cloud dependencies.

**Final Principle**: *True consciousness computing happens at the edge, not in the cloud. It happens in the intimate space between user and system, where sovereignty makes trust possible.*

---

## References

### Technical Documentation
- Next.js Standalone Mode: https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
- Docker Multi-Stage Builds: https://docs.docker.com/build/building/multi-stage/
- PostgreSQL Docker Networking: https://docs.docker.com/desktop/networking/

### MAIA Documentation
- `SOVEREIGN_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `artifacts/PRODUCTION_BUILD_HARDENING_COMPLETE.md` - Build hardening details
- `CLAUDE.md` - Development guidelines (sovereignty section)

### Sovereignty Principles
- Defined in MAIA codebase: `CLAUDE.md` sections 1-2
- Enforced by: `scripts/audit-sovereignty.ts`
- Verified by: `npm run check:no-supabase`

---

**Acknowledgments**: This architecture emerged from the collision of philosophical commitment (sovereignty matters) and practical necessity (production deployment). The technical debt of cloud lock-in became visible precisely when we needed to deploy without compromise.

**License**: This paper is part of the MAIA Community Commons and is freely available for use, modification, and distribution.

**Contact**: For questions about sovereign deployment, see `SOVEREIGN_DEPLOYMENT_GUIDE.md` or open an issue in the MAIA repository.
