# Promotion Drill Runbook
Date: 2026-06-13
Status: Documented — not yet drilled
Authors: Kelly Nezat + Claude

---

## What this document is

Step-by-step procedure to promote the Hetzner standby to primary and restore
MAIA service after minisforum failure. Two modes:

- **Drill** — minisforum running, Hetzner promoted for test, rolled back at end
- **Real failover** — minisforum genuinely down, Hetzner becomes production

This runbook covers both. Differences are called out inline.

---

## Infrastructure reference

| Node | Role | Public IP | Tailscale IP |
|---|---|---|---|
| minisforum | Primary | (home WAN, dynamic) | 100.119.226.84 |
| Hetzner CPX32 | Standby | 49.13.62.106 | 100.118.111.37 |

```
ssh soullab@minisforum          # via Tailscale MagicDNS
ssh root@100.118.111.37         # Hetzner via Tailscale IP
```

---

## Prerequisites (complete before drilling)

### P1 — DNS TTL already lowered (REQUIRED before first drill)
The DNS TTL for `soullab.life` must be at 300 seconds before any drill.
If not done: lower it now and wait for the current TTL to expire before proceeding.
Verify: `dig +short soullab.life TTL` or check your DNS registrar.

### P2 — App stack staged on Hetzner (REQUIRED before first drill)
The repo and env must be present on Hetzner before a failover is possible.
On Hetzner:
```bash
cd /root
git clone https://github.com/<org>/MAIA-SOVEREIGN.git
cd MAIA-SOVEREIGN
# Copy .env.production from minisforum (contains API keys — handle securely)
scp soullab@100.119.226.84:~/MAIA-SOVEREIGN/.env.production .
```

### P3 — Docker images pre-pulled on Hetzner
```bash
# On Hetzner — pull Caddy image so it's available at failover
docker pull caddy:2-alpine
# App image will be built at failover time from source
```

### P4 — Replication is healthy before drilling
```bash
# On minisforum — confirm standby is connected
docker exec maia-postgres psql -U soullab -d maia_consciousness -c \
  "SELECT state, replay_lag FROM pg_stat_replication;"
# Expected: state=streaming, replay_lag < 1s
```

---

## Failover procedure

### Phase 1 — Confirm primary is down (or isolated for drill)

**Real failover:**
```bash
# Try to reach minisforum
ssh soullab@minisforum 'echo alive' || echo "MINISFORUM UNREACHABLE"
curl -sk https://soullab.life/api/health || echo "SITE DOWN"
```

**Drill only:**
```bash
# Do NOT stop minisforum. Proceed with promotion on Hetzner in isolation.
# DNS will NOT be switched during a drill.
```

---

### Phase 2 — Promote Hetzner standby

```bash
ssh root@100.118.111.37

# Step 1: Promote the standby — it becomes primary immediately
docker exec maia-postgres-standby psql -U soullab -d maia_consciousness \
  -c "SELECT pg_promote();"

# Step 2: Confirm promotion succeeded
docker exec maia-postgres-standby psql -U soullab -d maia_consciousness \
  -c "SELECT pg_is_in_recovery();"
# Expected: f (false) — it is now a primary

# Step 3: Confirm data integrity (baseline counts)
docker exec maia-postgres-standby psql -U soullab -d maia_consciousness -c "
  SELECT
    (SELECT COUNT(*) FROM members) AS members,
    (SELECT COUNT(*) FROM maia_sessions) AS maia_sessions,
    (SELECT COUNT(*) FROM member_memory_atoms) AS atoms;
"
# Expected: members ≥ 69, maia_sessions ≥ 764, atoms ≥ 127
```

---

### Phase 3 — Start MAIA application stack on Hetzner

Use the pre-installed failover script (installed during P2 staging):

```bash
# On Hetzner — drill mode (minisforum stays up, DNS not switched)
DRILL_MODE=1 /root/MAIA-SOVEREIGN/scripts/hetzner-failover.sh

# On Hetzner — real failover (minisforum down, DNS will need switching)
/root/MAIA-SOVEREIGN/scripts/hetzner-failover.sh
```

The script handles:
1. Promoting the standby (`pg_promote()`) and verifying
2. Data integrity count
3. Pre-creating compose networks (`maia-sovereign_maia-internal`, `maia-sovereign_maia-public`) with correct Docker Compose labels
4. Connecting `maia-postgres-standby` to `maia-internal` with alias `maia-postgres` — DATABASE_URL needs zero changes
5. Starting `maia` and `caddy` with `--no-deps` (bypasses the `depends_on: postgres/whisper` check)
6. Health polling (up to 120s) then local health endpoint verification

**Why `--no-deps`**: The compose file declares `depends_on: postgres: condition: service_healthy`. On Hetzner we use the existing promoted standby instead of starting a new postgres container. `--no-deps` skips dependency startup and condition checks.

**Whisper**: `maia` also depends on `whisper`. Whisper won't run on Hetzner during failover. Voice transcription is degraded; core MAIA conversation works.

---

### Phase 4 — Verify health endpoint on Hetzner

```bash
# From Hetzner — test locally before exposing to internet
curl http://localhost:3000/api/health
# Expected: {"health":"ok", "components": {"database": {"status": "ok"}}}
```

---

### Phase 5 — Verify Continuity Recovery Test Account

1. Open browser, navigate to `http://49.13.62.106` (or via SSH tunnel if DNS not yet switched)
2. Log in with the Continuity Recovery Test Account credentials
3. Verify: member can sign in
4. Verify: past conversations visible
5. Verify: memory atoms surface in a MAIA conversation (start a conversation, confirm context appears)
6. Verify: practitioner account — client list intact, session history present

**Pass criteria:**
- [ ] Login succeeds
- [ ] Session history visible
- [ ] Memory retrieval works (MAIA references prior context)
- [ ] No database errors in `docker logs maia-sovereign`

---

### Phase 6 — Switch DNS (REAL FAILOVER ONLY, not drill)

```bash
# Lower TTL was done in P1 (300s) — propagation will take ≤ 5 min
```

1. Go to DNS registrar (where `soullab.life` is managed)
2. Update A record: `soullab.life` → `49.13.62.106` (Hetzner public IP)
3. Wait 300 seconds
4. Verify from external network (phone on cellular, not home WiFi):

```bash
curl https://soullab.life/api/health
# Expected: {"health":"ok"} from Hetzner
```

5. Verify IPv6 if set: update AAAA record to Hetzner IPv6 (`2a01:4f8:c015:e302::1` or similar)

---

### Phase 7 — Verify member-facing site

```bash
curl https://soullab.life/api/health
# Expected: {"health":"ok", uptime near-zero}

# Check Caddy logs for TLS certificate issue (first request triggers ACME)
docker logs maia-caddy --tail 20
```

If TLS fails: Caddy will auto-obtain a Let's Encrypt certificate. This requires port 80 to be reachable from the internet. Hetzner ufw allows 80/tcp — should work.

---

## Rollback procedure (drill only)

After a successful drill, roll back to minisforum as primary:

```bash
# 1. Stop app stack on Hetzner
docker compose -f /root/MAIA-SOVEREIGN/docker-compose.production.yml down

# 2. Stop the promoted Hetzner Postgres (it is now ahead of minisforum)
docker stop maia-postgres-standby

# 3. On minisforum — verify it is still primary and healthy
docker exec maia-postgres psql -U soullab -d maia_consciousness \
  -c "SELECT pg_is_in_recovery();"
# Expected: f (still primary — it was never demoted in the drill)

# 4. Re-sync Hetzner standby from minisforum via pg_basebackup
# (The promoted standby has diverged — must be re-initialized)
rm -rf /var/lib/postgresql/data
mkdir -p /var/lib/postgresql/data
docker run --rm \
  -v /var/lib/postgresql/data:/var/lib/postgresql/data \
  -e PGPASSWORD="R3pl1c4t0r!M41A2026" \
  pgvector/pgvector:pg16 \
  pg_basebackup -h 100.119.226.84 -p 5432 -U replicator \
  -D /var/lib/postgresql/data -P -R -X stream --checkpoint=fast

# 5. Restart the standby container
docker start maia-postgres-standby

# 6. Verify replication resumes
docker exec maia-postgres-standby psql -U soullab -d maia_consciousness \
  -c "SELECT pg_is_in_recovery();"
# Expected: t (back in standby mode)

# On minisforum — confirm standby reconnected
docker exec maia-postgres psql -U soullab -d maia_consciousness \
  -c "SELECT state, replay_lag FROM pg_stat_replication;"
```

---

## Replication health monitoring

Run this on minisforum to check standby lag at any time:

```bash
docker exec maia-postgres psql -U soullab -d maia_consciousness -c "
SELECT
  client_addr,
  state,
  replay_lag,
  sent_lsn = replay_lsn AS fully_caught_up
FROM pg_stat_replication;
"
```

**Healthy**: `state=streaming`, `replay_lag < 5s`, `fully_caught_up=t`
**Degraded**: `replay_lag > 30s` or no rows (standby disconnected)

If no rows: SSH to Hetzner, check `docker logs maia-postgres-standby --tail 20`.
Common cause: network interruption. Container will auto-reconnect.

---

## Drill results — 2026-06-13

**Start time:** ~15:47 UTC  
**Build complete / app healthy:** ~16:11 UTC (~24 min total)

| Gate | Result | Notes |
|------|--------|-------|
| 1 — App starts | ✅ PASS | docker-compose V1 legacy builder; 56-step Dockerfile |
| 2 — Public IP 200 | ✅ PASS | http://49.13.62.106 → 200 21ms |
| 3 — /api/health ok | ✅ PASS | database ok 3ms; memory 30% heap |
| 4 — Member sign-in | ⏳ pending | |
| 5 — History visible | ⏳ pending | |
| 6 — Memory/context | ⏳ pending | |
| 7 — Rollback/reseed | ⏳ pending | |

### Issues found and resolved

**OOM during concurrent builds (exit 137)**  
Two docker-compose build processes ran simultaneously — once from a background task and once from a manual terminal run — both hitting `next build` at the same time. The first container was OOM-killed (exit 137). The CPX32 (8 GB) can sustain one `next build` comfortably (~3 GB peak); two concurrent builds exceed the limit. Second build completed cleanly in ~15 min.  
**Rule: never run two Hetzner builds simultaneously.**

**docker compose plugin absent — V1 only**  
Docker 29.1.3 on Hetzner came from Ubuntu's `universe` repo, which does not include `docker-compose-plugin`. Only `docker-compose` 1.29.2 (V1 / legacy builder) is available. The failover script detects this automatically.  
**Fix if needed:** install Docker CE from Docker's official apt repo, which includes the V2 plugin.

**External stub networks (marc-studio_default, rudeboy-caddy-bridge)**  
Caddy's compose definition references networks from other service stacks that exist on minisforum but not Hetzner. The script creates empty stub networks before `up` to satisfy compose.

**Double pg_promote guard**  
The standby was promoted during an early partial run. Re-running called pg_promote() on an already-primary, which errors. The script now checks `pg_is_in_recovery()` first and skips promotion if already `f`.

### What worked correctly

**Docker network aliases behaved exactly as designed.**  
The `maia-postgres` alias on `maia-sovereign_maia-internal` resolved correctly for the app container. DATABASE_URL required zero changes on Hetzner — no env editing during a failover, no config drift. This was the central network architecture bet and it paid off.

**Script idempotency was load-bearing.**  
The script ran multiple times across partial failures (OOM kill, double-invoke). Each run correctly skipped already-completed phases: networks existed → no-op, standby already primary → no-op, alias already connected → no-op. The drill would have been far harder to recover without this. Treat idempotency as a hard requirement for any edits to this script.

**Replica data integrity confirmed.**  
At the moment of promotion: 69 members, 770 sessions, 127 atoms — all at or above the pre-drill baseline. Replication lag was negligible at the time of promotion.

---

## Drill schedule

First drill: **completed 2026-06-13** (Gates 1–3 confirmed; Gates 4–7 pending in same session).

Subsequent drills: quarterly. Each drill must complete all 7 gates and record results above.

After all 7 gates pass, this runbook is the operational failover procedure.
