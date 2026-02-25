# Cloudflare Tunnel Setup for MinisForum

This document outlines the steps to set up Cloudflare Tunnel to expose your MinisForum services to the public internet while keeping your compute and data local.

## Prerequisites

- A Cloudflare account with access to your domain
- Your domain registered with Cloudflare (or properly configured DNS)
- A MinisForum running Docker with the core infrastructure in place
- A public IP address or dynamic DNS setup (if using CGNAT)

## Step-by-Step Setup

### 1. Create a Cloudflare Tunnel

1. Log into your Cloudflare dashboard
2. Navigate to **Zero Trust** → **Tunnels**
3. Click **Create Tunnel**
4. Name your tunnel: `maia-minisforum-tunnel`
5. Select **"Tunnel"** as the type
6. Click **Create Tunnel**

### 2. Generate the Tunnel Token

1. After creating the tunnel, click on the tunnel name
2. Click **"Generate Token"**
3. Copy the token (you'll need this for the environment file)
4. Save the token securely - you won't be able to see it again

### 3. Configure Environment Variables

Create or update your `.env` file in the `infra/` directory:

```bash
# Cloudflare Tunnel Token
CLOUDFLARE_TUNNEL_TOKEN=your_actual_tunnel_token_here
```

### 4. Update DNS Records

1. In your Cloudflare dashboard, go to **DNS** for your domain
2. Add a new **CNAME** record:
   - Name: `*`
   - Target: `your-tunnel-id.cfargotunnel.com`
   - TTL: 1 (automatic)
   - Proxy status: **On** (orange cloud)

### 5. Start the MinisForum Stack

From the `infra/` directory:

```bash
# Start the core services
docker compose -f compose/core.yml up -d

# Start the site services
docker compose -f compose/sites/jeremy.yml up -d
docker compose -f compose/sites/oldhead.yml up -d
docker compose -f compose/sites/loralee.yml up -d
docker compose -f compose/sites/marc.yml up -d
docker compose -f compose/sites/rudeboy.yml up -d
```

### 6. Verify Setup

1. Check that all containers are running:
   ```bash
   docker ps
   ```

2. Verify Cloudflared is connected:
   ```bash
   docker logs maia-cloudflared
   ```

3. Test access to your subdomains:
   ```bash
   curl -I https://jeremy.soullab.life
   curl -I https://oldhead.soullab.life
   curl -I https://loralee.soullab.life
   curl -I https://marc.soullab.life
   curl -I https://rudeboy.soullab.life
   curl -I https://api.soullab.life
   ```

## Security Considerations

- Keep your tunnel token secure
- Regularly rotate tokens
- Monitor your tunnel connections
- Ensure your local network firewall allows connections on ports 80 and 443

## Troubleshooting

### Common Issues

1. **Tunnel not connecting**: Check that the token is correct and the tunnel name matches
2. **DNS propagation delays**: Allow 5-10 minutes for DNS changes to propagate
3. **Port conflicts**: Ensure no other services are using ports 80/443
4. **Container startup issues**: Check container logs with `docker logs <container_name>`

### Verification Commands

```bash
# Check all containers
docker ps

# Check Caddy logs
docker logs maia-caddy

# Check Cloudflared logs
docker logs maia-cloudflared

# Test specific subdomains
curl -I https://jeremy.soullab.life
curl -I https://api.soullab.life
```

## Maintenance

- Regularly update your tunnel token
- Monitor connection status in Cloudflare dashboard
- Update your Docker containers periodically
- Review access logs for any unusual activity