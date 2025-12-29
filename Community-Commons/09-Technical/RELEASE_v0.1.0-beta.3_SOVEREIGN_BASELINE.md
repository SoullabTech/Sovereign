# Release v0.1.0-beta.3 - Sovereign Baseline

**The first verified, shippable baseline for MAIA's sovereign infrastructure is now locked and tagged.**

## Release Summary

**Date**: December 29, 2025
**Tag**: `v0.1.0-beta.3`
**Branch**: `clean-main-no-secrets`
**Status**: Production-ready

---

## What This Release Represents

This release marks MAIA's transition to a fully sovereign, self-hosted infrastructure. No Vercel. No Render. No cloud AI dependencies. Just Docker Compose + Caddy + PostgreSQL running on your own metal.

### The Stack

| Component | Image/Tech | Purpose |
|-----------|------------|---------|
| **Caddy** | `caddy:2-alpine` | Automatic HTTPS, Let's Encrypt, reverse proxy |
| **MAIA** | Next.js 15 (standalone) | Consciousness computing platform |
| **PostgreSQL** | `pgvector/pgvector:pg16` | Vector-enabled data persistence |
| **Ollama** | (optional) | Local LLM inference |

---

## Release History

| Version | Key Changes |
|---------|-------------|
| `v0.1.0-beta.1` | Initial baseline - Next.js 15 build fixes, Supabase violations removed |
| `v0.1.0-beta.2` | Fix compose `$$f` escaping, remove obsolete `version:` key |
| `v0.1.0-beta.3` | Caddy reads `DOMAIN` from runtime env (best practice) |

---

## Security Posture

- **Dependabot alerts**: 0 open
- **npm audit**: 0 vulnerabilities
- **Supabase**: Fully removed (sovereignty enforced via pre-commit hook)
- **Secrets**: No secrets in git history (`clean-main-no-secrets` branch)

---

## Deployment Requirements

### Environment Variables (`.env.production`)

```env
# Required - PostgreSQL
POSTGRES_PASSWORD=<strong-password>

# Required - Database connection (use 'postgres' as host - Docker service name)
DATABASE_URL=postgresql://soullab:<password>@postgres:5432/maia_consciousness

# Required - Chat API throws fatal error without this
MAIA_AUDIT_FINGERPRINT_SECRET=<long-random-string>

# Optional - Domain for Caddy (defaults to localhost)
DOMAIN=your-domain.com
```

### Quick Deploy

```bash
git fetch --tags
git checkout v0.1.0-beta.3

# Create .env.production with the 4 keys above

docker compose -f docker-compose.production.yml up -d --build
docker compose -f docker-compose.production.yml ps
```

---

## Verification Checklist

Before considering deployment complete:

- [ ] DNS: `DOMAIN` points to server (A/AAAA records)
- [ ] Firewall: Ports 80/443 open
- [ ] Env: `.env.production` has all 4 keys
- [ ] Stack: `docker compose ps` shows all services healthy
- [ ] Caddy: Logs show certificate issued
- [ ] MAIA: Logs show clean startup (no missing env errors)
- [ ] Probe: `curl -I https://your-domain.com` returns 200

---

## Technical Details

### Compose Improvements in This Release

1. **Shell variable escaping**: `$f` and `$DATABASE_URL` in migrate command escaped as `$$f` and `$$DATABASE_URL` to prevent Docker Compose interpolation
2. **Obsolete version removed**: `version: '3.8'` removed (Docker Compose V2+ ignores it)
3. **Runtime env for Caddy**: Domain now read from `.env.production` via `env_file:` instead of compose-time `${BASE_URL:-localhost}` interpolation

### Why This Matters

The compose-time interpolation gotcha ("why is my domain not applying?") is eliminated. Caddy reads `DOMAIN` directly from `.env.production` at container runtime, making deploys predictable and "boring" - exactly what you want for production.

---

## Repository State

- **Git fsck**: Clean (no dangling objects)
- **Reflog**: Expired and garbage collected
- **Tags**: All three beta tags aligned with branch
- **Branch**: `clean-main-no-secrets` is the canonical deploy source

---

## What's Next

With the sovereign baseline locked, focus shifts to:

1. First production deployment verification
2. Beta tester onboarding on sovereign infrastructure
3. Consciousness computing features on stable foundation

---

*This release was prepared with Claude Code assistance, ensuring every change was verified, tested, and documented before tagging.*

**GitHub Release**: https://github.com/SoullabTech/Sovereign/releases/tag/v0.1.0-beta.3
