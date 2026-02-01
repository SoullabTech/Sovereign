# MAIA Docker Deployment Guide

## Overview

This document explains how to deploy MAIA using Docker, including environment configuration, database connectivity, and common troubleshooting scenarios.

## Prerequisites

- Docker Desktop installed and running
- PostgreSQL running locally (or in a container)
- Access to required API keys (Anthropic, ElevenLabs, etc.)

---

## Directory Structure

All Docker operations should be run from the project root:

```
/Users/soullab/.claude-worktrees/MAIA-SOVEREIGN/quizzical-payne/
├── docker-compose.yml          # Main compose file
├── Dockerfile                   # Container build instructions
├── .env.production.template    # Template with all required vars
├── .env.production             # Your actual secrets (git-ignored)
└── ...
```

---

## Two Separate Issues to Understand

### Issue 1: Working Directory

Docker Compose looks for files relative to where you run the command.

**Wrong:**
```bash
cd ~
docker compose --env-file .env.production up -d maia
# Error: couldn't find env file: /Users/soullab/.env.production
```

**Correct:**
```bash
cd /Users/soullab/.claude-worktrees/MAIA-SOVEREIGN/quizzical-payne
docker compose --env-file .env.production up -d maia
```

### Issue 2: Environment Values

The `.env.production` file must contain actual values, not placeholders.

---

## Quick Setup

### Step 1: Navigate to Project Directory

```bash
cd /Users/soullab/.claude-worktrees/MAIA-SOVEREIGN/quizzical-payne
```

### Step 2: Create Environment File

```bash
cp .env.production.template .env.production
```

### Step 3: Edit Environment Values

Open `.env.production` and fill in real values. See the Configuration Options section below.

### Step 4: Build and Run

```bash
# Build the image
docker compose build maia

# Start the container
docker compose --env-file .env.production up -d maia

# Check logs
docker logs -f maia
```

---

## Configuration Options

### Option A: Local Development Mode

For testing the container against your local PostgreSQL:

```env
# Database - connect to host machine's PostgreSQL
# host.docker.internal resolves to the host machine from inside Docker
DATABASE_URL=postgresql://soullab@host.docker.internal:5432/maia_consciousness

# Core
NODE_ENV=production
PORT=3000
BASE_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# AI - use local Ollama
OLLAMA_BASE_URL=http://host.docker.internal:11434

# Optional: Add API keys if needed
# ANTHROPIC_API_KEY=sk-ant-...
# ELEVENLABS_API_KEY=sk_...

# Security - generate these with: openssl rand -hex 32
JWT_SECRET=your_64_char_hex_here
MAIA_AUDIT_FINGERPRINT_SECRET=your_32_char_hex_here

# Feature flags
SOVEREIGNTY_MODE=true
FORCE_LOCAL_EMBEDDINGS=true
NEXT_TELEMETRY_DISABLED=1
```

### Option B: Full Production Mode

For production deployment with all services:

```env
# Database - containerized PostgreSQL
POSTGRES_PASSWORD=generate_with_openssl_rand_hex_32
DATABASE_URL=postgresql://soullab:${POSTGRES_PASSWORD}@postgres:5432/maia_consciousness

# Core
NODE_ENV=production
PORT=3000
BASE_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com

# AI Providers
ANTHROPIC_API_KEY=sk-ant-your_key_here
OLLAMA_BASE_URL=http://host.docker.internal:11434

# Voice
ELEVENLABS_API_KEY=sk_your_key_here
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
ELEVENLABS_MODEL_ID=eleven_multilingual_v2

# Security
JWT_SECRET=generate_64_char_hex
MAIA_AUDIT_FINGERPRINT_SECRET=generate_32_char_hex

# Sovereignty
SOVEREIGNTY_MODE=true
FORCE_LOCAL_EMBEDDINGS=true
ORCHESTRATOR=spiralogic
SPIRALOGIC_ENABLED=true
```

---

## Database Connectivity

### From Docker Container to Host PostgreSQL

When running MAIA in Docker but PostgreSQL on the host machine:

```env
DATABASE_URL=postgresql://soullab@host.docker.internal:5432/maia_consciousness
```

`host.docker.internal` is a special DNS name that Docker Desktop provides to reach the host machine.

### PostgreSQL Authentication

If you get authentication errors, ensure PostgreSQL allows connections:

1. Check `pg_hba.conf` for Docker network access
2. Or use password authentication:
   ```env
   DATABASE_URL=postgresql://soullab:yourpassword@host.docker.internal:5432/maia_consciousness
   ```

### Both in Containers

If running PostgreSQL in a container alongside MAIA:

```env
# Uses Docker's internal networking
DATABASE_URL=postgresql://soullab:${POSTGRES_PASSWORD}@postgres:5432/maia_consciousness
```

Ensure both containers are on the same Docker network (handled by docker-compose).

---

## Port Management

### Default Ports

| Service | Port | Purpose |
|---------|------|---------|
| MAIA (Docker) | 3000 | Production container |
| MAIA (dev) | 3000-3003 | Development server |
| PostgreSQL | 5432 | Database |
| Ollama | 11434 | Local LLM |

### Port Conflicts

If port 3000 is in use:

```bash
# Check what's using port 3000
lsof -i :3000

# Stop the conflicting process
docker stop maia  # if Docker container
# or kill the dev server with Ctrl+C
```

---

## Common Commands

### Build and Deploy

```bash
# Build fresh image
docker compose build maia --no-cache

# Start in detached mode
docker compose --env-file .env.production up -d maia

# View logs
docker logs -f maia

# Stop container
docker stop maia

# Remove container
docker rm maia
```

### Debugging

```bash
# Shell into running container
docker exec -it maia sh

# Check environment variables inside container
docker exec maia env | grep DATABASE

# Test database connection from container
docker exec maia node -e "
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  pool.query('SELECT 1').then(() => console.log('DB OK')).catch(console.error);
"
```

### Health Checks

```bash
# Check if container is running
docker ps | grep maia

# Check if server is responding
curl http://localhost:3000/api/health

# Test dream endpoints
curl -X POST http://localhost:3000/api/dreams/record \
  -H "Content-Type: application/json" \
  -d '{"dreamText": "test dream", "userId": "test-user"}'
```

---

## Troubleshooting

### "couldn't find env file"

**Cause:** Running Docker from wrong directory.

**Fix:**
```bash
cd /Users/soullab/.claude-worktrees/MAIA-SOVEREIGN/quizzical-payne
docker compose --env-file .env.production up -d maia
```

### "ECONNREFUSED" to Database

**Cause:** Container can't reach PostgreSQL.

**Fix:** Use `host.docker.internal` instead of `localhost`:
```env
DATABASE_URL=postgresql://soullab@host.docker.internal:5432/maia_consciousness
```

### Old Code Being Served

**Cause:** Container wasn't rebuilt after code changes.

**Fix:**
```bash
docker compose build maia --no-cache
docker compose --env-file .env.production up -d maia
```

### Port Already in Use

**Cause:** Dev server or old container on same port.

**Fix:**
```bash
# Find and stop the process
lsof -i :3000
docker stop maia  # or kill dev server
```

---

## Security Notes

1. **Never commit `.env.production`** - It's in `.gitignore`
2. **Generate secrets properly:**
   ```bash
   # For JWT_SECRET (64 chars)
   openssl rand -hex 32

   # For other secrets (32 chars)
   openssl rand -hex 16
   ```
3. **Rotate secrets** if they're ever exposed
4. **Use different secrets** for dev vs production

---

## Development vs Production

| Aspect | Development (`npm run dev`) | Production (Docker) |
|--------|---------------------------|---------------------|
| Hot reload | Yes | No |
| Build | Not required | Required |
| Database | localhost:5432 | host.docker.internal:5432 |
| Port | Auto-increments (3000, 3001...) | Fixed (3000) |
| Env file | `.env` or `.env.local` | `.env.production` |

For rapid iteration, use `npm run dev`. For deployment testing, use Docker.

---

## Quick Reference

```bash
# Full deployment sequence
cd /Users/soullab/.claude-worktrees/MAIA-SOVEREIGN/quizzical-payne
cp .env.production.template .env.production
# Edit .env.production with real values
docker compose build maia
docker compose --env-file .env.production up -d maia
docker logs -f maia
```
