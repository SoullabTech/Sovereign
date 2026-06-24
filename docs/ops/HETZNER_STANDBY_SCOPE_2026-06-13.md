# Hetzner Standby Scope
Date: 2026-06-13
Status: Scoped — not yet provisioned
Gate cleared: Stage 3 restore exercise passed (2026-06-13)

---

## Server

| Parameter | Value |
|---|---|
| Provider | Hetzner Cloud |
| Node type | CX32 |
| vCPU | 4 |
| RAM | 8 GB |
| Disk | 80 GB SSD |
| Monthly cost | €8.29 |
| IPv4 (required for DNS failover) | +€0.50/mo |
| **Total** | **~€9/mo** |

CX32 is sufficient: current database is ~277MB compressed. App stack (Next.js + Caddy) fits comfortably in 8GB.

---

## Region

**Falkenstein, Germany (FSN1)**

Rationale:
- EU jurisdiction, GDPR-native
- No US surveillance exposure
- Hetzner's primary datacenter, best reliability
- Acceptable latency to US users (~120ms) — standby, not primary

---

## Firewall Rules

| Port | Source | Purpose |
|---|---|---|
| 22 (SSH) | Tailscale IPs only | Management (never public) |
| 443 (HTTPS) | 0.0.0.0/0 | MAIA app on failover |
| 80 (HTTP) | 0.0.0.0/0 | Caddy ACME challenge on failover |
| 5432 (Postgres) | minisforum Tailscale IP only (100.119.226.84) | Streaming replication |
| All else | BLOCK | — |

Replication traffic travels over the Tailscale tunnel — no public Postgres exposure required.

---

## Tailscale Enrollment

1. Install Tailscale on Hetzner node at provision time
2. `tailscale up --ssh --authkey <key>` — enroll in `soullab1@gmail.com` tailnet
3. Use MagicDNS name (`hetzner-standby` or similar) for all replication and admin traffic
4. Verify: `ssh soullab@hetzner-standby` from Mac Studio and minisforum both succeed

Tailscale provides:
- Encrypted replication transport (no public Postgres port)
- Out-of-band admin path (stable regardless of public IP / DNS state)

---

## Postgres Replication Method

**WAL streaming replication** (built into Postgres 16, same image: `pgvector/pgvector:pg16`)

### Setup sequence

**On minisforum primary (one-time config):**
```sql
-- Create replication user
CREATE USER replicator REPLICATION LOGIN ENCRYPTED PASSWORD '<strong-password>';
```

```conf
# postgresql.conf additions
wal_level = replica
max_wal_senders = 2
wal_keep_size = 64MB
```

```conf
# pg_hba.conf addition (use Hetzner Tailscale IP once known)
host replication replicator <hetzner-tailscale-ip>/32 md5
```

**On Hetzner standby (initial sync):**
```bash
# Run pg_basebackup from minisforum — initializes standby with full copy + replication config
pg_basebackup \
  -h <minisforum-tailscale-ip> \
  -U replicator \
  -D /var/lib/postgresql/data \
  -P -R
# -R flag auto-creates postgresql.auto.conf with primary_conninfo
```

After `pg_basebackup` completes, starting Postgres on Hetzner begins streaming replication automatically.

### Ongoing state
- Minisforum: primary (read-write)
- Hetzner: hot standby (read-only, streaming WAL)
- Replication lag: typically < 5 seconds

---

## DNS Failover Procedure

### Pre-failover (do now, before provisioning)
Lower TTL on `soullab.life` A record from current value → **300 seconds**.
This change takes effect at the current TTL — do it now so it's ready before the standby exists.

### Failover steps (if minisforum dies)
```
1. Promote Hetzner Postgres to primary
   docker exec maia-postgres psql -U soullab -c "SELECT pg_promote();"

2. Start full stack on Hetzner
   docker compose -f docker-compose.production.yml up -d

3. Update DNS A record: soullab.life → Hetzner public IP
   (via DNS registrar console)

4. Wait 300 seconds for propagation

5. Verify
   curl https://soullab.life/api/health
```

### Recovery time objective (RTO)
~10 minutes manual steps + 5 minutes DNS propagation = **~15 minutes total**

### Recovery point objective (RPO)
Seconds — WAL streaming replication lag is typically < 5s under normal load.

---

## Rollback Plan

### Before failover is ever triggered
Hetzner standby is read-only. Any problem with the standby (misconfigured replication, disk issue, etc.) has **zero impact on production**. Resolution: fix or reprovision Hetzner. Minisforum continues as primary throughout.

### After failover (if primary recovers)
Option A — Hetzner becomes permanent primary, minisforum becomes new standby (reverse replication).
Option B — Restore minisforum from Hetzner via `pg_basebackup` in reverse, re-promote minisforum.
Option C — Minisforum comes back with data intact; re-sync Hetzner standby from it.

In all cases: no data loss (WAL replication), no forced timeline.

---

## Provision Checklist (when ready to proceed)

- [ ] Lower DNS TTL to 300s now
- [ ] Create Hetzner account (if not existing) at console.hetzner.com
- [ ] Provision CX32 in FSN1, Ubuntu 24.04
- [ ] Install Docker, pull `pgvector/pgvector:pg16`
- [ ] Install Tailscale, enroll in tailnet, verify SSH from Mac Studio
- [ ] Apply Hetzner firewall rules
- [ ] Configure replication user + `postgresql.conf` on minisforum
- [ ] Run `pg_basebackup` from minisforum → Hetzner
- [ ] Verify streaming replication is live (`pg_stat_replication` on primary)
- [ ] Clone repo + configure `.env.production` on Hetzner (app stack dormant until failover)
- [ ] Test failover in staging window: promote → bring up stack → verify health → re-sync
- [ ] Document Tailscale name + Hetzner IP in CLAUDE.md infrastructure table
