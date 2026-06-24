# MinisForum Deployment Guide

This document provides instructions for managing the MinisForum infrastructure with multiple subdomain builds.

## Infrastructure Overview

The MinisForum uses a modular Docker Compose structure:
- `infra/compose/core.yml`: Core services (Caddy reverse proxy, Cloudflared tunnel)
- `infra/compose/sites/*.yml`: Individual site configurations
- `infra/Caddyfile`: Host-based routing configuration

## Prerequisites

- Docker and Docker Compose installed
- `.env` file with required environment variables
- Access to Cloudflare Tunnel token

## Starting the Stack

### 1. Start Core Services

```bash
cd infra/
docker compose -f compose/core.yml up -d
```

### 2. Start Individual Site Services

```bash
# Start all sites
docker compose -f compose/sites/jeremy.yml up -d
docker compose -f compose/sites/oldhead.yml up -d
docker compose -f compose/sites/loralee.yml up -d
docker compose -f compose/sites/marc.yml up -d
docker compose -f compose/sites/rudeboy.yml up -d
```

### 3. Verify Services

```bash
# Check all containers are running
docker ps

# Check Caddy logs
docker logs maia-caddy

# Check Cloudflared logs
docker logs maia-cloudflared
```

## Managing Individual Sites

### Starting a Specific Site

```bash
docker compose -f compose/sites/jeremy.yml up -d
```

### Stopping a Specific Site

```bash
docker compose -f compose/sites/jeremy.yml down
```

### Viewing Logs

```bash
# View logs for a specific site
docker compose -f compose/sites/jeremy.yml logs -f

# View logs for Caddy
docker logs maia-caddy -f

# View logs for Cloudflared
docker logs maia-cloudflared -f
```

## Adding a New Subdomain

### 1. Create Site Configuration

Create a new file `infra/compose/sites/newsite.yml`:

```yaml
version: '3.8'

services:
  newsite:
    image: newsite-web:latest
    container_name: newsite-web
    restart: unless-stopped
    networks:
      - maia-network
    depends_on:
      - caddy

networks:
  maia-network:
    external: true
```

### 2. Update Caddyfile

Add routing rules for the new subdomain in `infra/Caddyfile`:

```caddy
# newsite.soullab.life
newsite.soullab.life {
    reverse_proxy newsite:3000

    header {
        X-MAIA-Origin "caddy-sovereign-newsite"
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        -Server
    }

    encode gzip zstd
}
```

### 3. Restart Services

```bash
# Restart core services
docker compose -f compose/core.yml up -d

# Start the new site
docker compose -f compose/sites/newsite.yml up -d
```

## Testing Routing

### Verify All Subdomains

```bash
curl -I https://jeremy.soullab.life
curl -I https://oldhead.soullab.life
curl -I https://loralee.soullab.life
curl -I https://marc.soullab.life
curl -I https://rudeboy.soullab.life
curl -I https://api.soullab.life
```

### Test Specific Services

```bash
# Test individual services
curl -I http://localhost:3000  # Main MAIA app
curl -I http://localhost:3001  # API service
curl -I http://localhost:4321  # Oldhead service
curl -I http://localhost:4323  # Rudeboy service
```

## Troubleshooting

### Common Issues

1. **Service not starting**: Check container logs with `docker logs <container_name>`
2. **Routing not working**: Verify Caddyfile syntax and service names
3. **DNS issues**: Ensure Cloudflare DNS records are properly configured
4. **Port conflicts**: Check that ports 80/443 are not in use
5. **Disk pressure / root filesystem filling up**: Almost always accumulated Docker build cache from repeated `--build` deploys — see below

### Disk Pressure (Docker build cache)

Minisforum disk pressure is usually accumulated Docker build cache from repeated `--build` deploys. Don't guess and don't reach for `docker system prune` — diagnose first, then clear only what's rebuildable.

**Procedure:**

1. **Disk pressure observed** — SSH MOTD banner, or `df -h /` shows root filling up.
2. **Diagnose — run `docker system df`.** This is the command that identifies the cause; read the `RECLAIMABLE` column by type:
   ```bash
   docker system df
   ```
3. **If Build Cache is huge → reclaim it:**
   ```bash
   docker builder prune -f
   ```
   This only clears rebuildable cache — running containers, images, and volumes are untouched.
4. **Do not prune volumes.** Never `docker volume prune` or `docker system prune --volumes`: volumes hold PostgreSQL and Whisper data. Likewise leave the backups (`~/MAIA-SOVEREIGN/backups`, 30-day retention) — they are intentionally retained, not space to reclaim.
5. **Verify** the space was recovered:
   ```bash
   df -h /
   ```

A weekly cron runs step 3 automatically (`0 3 * * 0`, Sundays 03:00, after the daily backup window). Confirm the schedule and review what the last run reclaimed:

```bash
crontab -l | grep 'builder prune'
cat /tmp/docker-builder-prune.log
```

Precedent: on 2026-06-15 a deploy-heavy week pushed the disk to 87%. `docker system df` showed 709 GB of build cache (664 GB reclaimable); `docker builder prune -f` reclaimed 674.6 GB → 13%, with zero container disruption.

### Useful Commands

```bash
# Check all running containers
docker ps

# Check container status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# View specific container logs
docker logs <container_name>

# Restart a specific service
docker compose -f compose/sites/jeremy.yml restart

# View Caddy configuration
docker exec maia-caddy cat /etc/caddy/Caddyfile
```

## Security Best Practices

1. **Keep tunnel tokens secure** - never commit to version control
2. **Regular updates** - keep Docker images updated
3. **Monitor logs** - watch for unusual access patterns
4. **Firewall rules** - restrict external access to necessary ports only
5. **Regular backups** - backup your configuration files and data volumes

## Backup and Recovery

### Backup Configuration

```bash
# Backup compose files
tar -czf infra-backup-$(date +%Y%m%d).tar.gz infra/

# Backup Docker volumes
docker run --rm -v maia-caddy_data:/data -v /backup:/backup alpine tar czf /backup/caddy-data.tar.gz -C /data .
```

### Restore Configuration

```bash
# Restore compose files
tar -xzf infra-backup-YYYYMMDD.tar.gz

# Restore Docker volumes
docker run --rm -v maia-caddy_data:/data -v /backup:/backup alpine tar xzf /backup/caddy-data.tar.gz -C /data
```