# chart.soullab.life Status

## Current state

- `/chart` is live at https://soullab.life/chart
- `chart.soullab.life` is intentionally disabled until DNS exists

## Why disabled

Avoids repeated TLS certificate acquisition failures and log noise when DNS returns NXDOMAIN.

## Re-enable checklist

1. Add DNS A record: `chart -> 35.167.91.24`
2. Uncomment the chart site block in `/home/ubuntu/maia/Caddyfile`
3. Restart Caddy:
   ```bash
   docker compose -f docker-compose.production.yml restart caddy
   ```
4. Verify no ACME errors:
   ```bash
   docker compose logs --tail=50 caddy | grep -i chart
   ```

## Caddyfile location

- Server path: `/home/ubuntu/maia/Caddyfile`
- Bind-mounted to container at `/etc/caddy/Caddyfile`

## Notes

The chart block is commented out (lines ~70-95 in Caddyfile). When DNS is ready, simply remove the `#` prefix from each line in that block.

## Caddyfile intent comment

The block includes this header for future clarity:

```caddyfile
# chart.soullab.life block is intentionally disabled until DNS A record exists.
# Re-enable when ready: uncomment block, restart caddy.
```
