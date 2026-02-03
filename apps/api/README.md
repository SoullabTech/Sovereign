# MAIA API Service

Standalone Express API service for the MAIA Sovereign platform.

## Architecture

```
╔════════════════════════════════════════════════════════════════╗
║                   MAIA-First Hierarchy                         ║
╠════════════════════════════════════════════════════════════════╣
║  MAIA = Platform/Product (temple, interface, relationship)    ║
║  AIN  = Engine (deliberative core, computation primitives)    ║
║                                                                ║
║  This service is the MAIA API.                                 ║
║  AIN is a DEPENDENCY called by MAIA, never the reverse.       ║
║  All external sites talk to THIS API.                          ║
╚════════════════════════════════════════════════════════════════╝
```

## Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Production
npm start
```

## API Endpoints

All endpoints are versioned under `/v1/*`.

### Health
- `GET /v1/health` - Full health check
- `GET /v1/health/ready` - Readiness probe
- `GET /v1/health/live` - Liveness probe

### Members
- `POST /v1/members/check` - Check if passkey exists
- `POST /v1/members/signin` - Sign in existing member

### Portal
- `GET /v1/portal/:slug/config` - Get portal configuration

### Tenant (Multi-site)
- `GET /v1/tenant/:slug/config` - Get tenant configuration
- `GET /v1/tenant/:slug/theme` - Get tenant theme
- `GET /v1/tenant/:slug/content` - Get tenant content

## Environment Variables

```env
PORT=3001
DATABASE_URL=postgresql://soullab@localhost:5432/maia_consciousness
CORS_ORIGINS=https://soullab.life,https://loralee.soullab.life
PASSWORD_SALT=your-password-salt
```

## Docker

```bash
# Build
docker build -t maia-api:prod -f apps/api/Dockerfile .

# Run
docker run -p 3001:3001 --env-file .env.production maia-api:prod
```

## Adding New Routes

1. Create route file in `src/routes/{domain}/{action}.ts`
2. Add router in `src/routes/{domain}/index.ts`
3. Import and use in `src/index.ts`
4. Update API client in `lib/api-client.ts`

## Migration Status

Routes migrated from Next.js `/app/api/*`:

- [x] /health
- [x] /members/check
- [x] /members/signin
- [x] /portal/[slug]/config
- [x] /tenant/:slug/config (new)
- [x] /tenant/:slug/theme (new)
- [x] /tenant/:slug/content (new)
- [ ] /members/register
- [ ] /members/recover
- [ ] ... (290+ remaining)

See [API Separation Plan](../../docs/plans/api-separation.md) for full migration strategy.
