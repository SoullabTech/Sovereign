# Zero-OpenAI Deploy Checklist

_Run this checklist once after merging the sovereignty cleanup PR, and again after every
production deploy until egress denial is confirmed clean._

---

## Prerequisites

```bash
# All commands run from Mac Studio host unless marked [container]
# Assumes Docker stack is running: maia-sovereign, maia-caddy, maia-postgres

cd ~/MAIA-SOVEREIGN
```

---

## Step 1 — Purge secrets from all env files

```bash
# Confirm which env files carry the key
grep -l "OPENAI_API_KEY" .env .env.local .env.production .env.staging .auto-claude/.env 2>/dev/null
```

For each file listed, remove or comment out the `OPENAI_API_KEY` line:

```bash
# .env.local (development)
sed -i '' '/^OPENAI_API_KEY=/d' .env.local

# .env.production (production)
sed -i '' '/^OPENAI_API_KEY=/d' .env.production

# .env.staging
sed -i '' '/^OPENAI_API_KEY=/d' .env.staging

# .auto-claude/.env (scheduled tasks runner)
sed -i '' '/^OPENAI_API_KEY=/d' .auto-claude/.env
```

**Do not delete the entry from template files** — instead mark it disabled:

```bash
# .env.docker.template — mark explicitly disabled
sed -i '' 's/^OPENAI_API_KEY=.*/OPENAI_API_KEY=  # DISABLED — zero-OpenAI doctrine/' .env.docker.template
```

Verify nothing remains:

```bash
grep -r "OPENAI_API_KEY" .env .env.local .env.production .env.staging .auto-claude/.env 2>/dev/null
# Expected: no output
```

---

## Step 2 — Verify no key in running containers

```bash
# Check all running containers for the env var
for c in maia-sovereign maia-api maia-comms-worker maia-whisper maia-rlm; do
  echo "=== $c ==="
  docker exec "$c" env 2>/dev/null | grep -i openai || echo "(not found)"
done
```

If any container shows the key, it was injected via `docker-compose.production.yml` or a Docker
secret. Find and remove it:

```bash
# Check compose file
grep -i openai docker-compose.production.yml

# Check Docker secrets
docker secret ls 2>/dev/null | grep -i openai
```

---

## Step 3 — Deny outbound to api.openai.com

### Option A: DNS-level block (simplest, survives reboots)

```bash
# Add to /etc/hosts on the Mac Studio host
echo "0.0.0.0 api.openai.com" | sudo tee -a /etc/hosts
echo "0.0.0.0 openai.com" | sudo tee -a /etc/hosts

# Flush DNS cache
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder

# Verify block
ping -c 1 api.openai.com
# Expected: can't reach host or resolves to 0.0.0.0
```

**Note:** DNS blocking on the host does not block resolution inside Docker containers
on a custom network. For container-level enforcement, use Option B.

### Option B: Container egress block (stronger)

Add to `docker-compose.production.yml` under each service that should not call OpenAI:

```yaml
# Under each service definition:
extra_hosts:
  - "api.openai.com:0.0.0.0"
  - "openai.com:0.0.0.0"
```

Or use macOS `pfctl` to block at the network level:

```bash
# Create a pf rule (edit /etc/pf.conf or add an anchor)
# Block outbound to OpenAI IP ranges (check current ranges at api.openai.com)
# This is a permanent firewall block that survives container restarts

# Get current OpenAI IP
dig +short api.openai.com

# Add blocking rule (replace IP with actual resolved address)
echo "block out quick to <OPENAI_IP>/32" | sudo pfctl -ef -
```

### Option C: Allowlist model (strongest — recommended long-term)

Rather than blocking OpenAI specifically, only allow approved outbound providers.
Add to `docker-compose.production.yml`:

```yaml
networks:
  sovereign:
    driver: bridge
    driver_opts:
      com.docker.network.bridge.name: maia-net
```

Then use host-level rules to allow only:
- `api.anthropic.com` (Claude)
- Local services (`localhost`, Docker bridge range)
- `smtp.resend.com` (email)
- Your own domain / CDN

---

## Step 4 — Deploy

```bash
cd ~/MAIA-SOVEREIGN
git pull origin main

docker compose -f docker-compose.production.yml up -d --build
```

Wait for containers to stabilize:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
curl -sf http://localhost/api/health | jq .
```

---

## Step 5 — Verify zero OpenAI egress

### Code check (on deployed revision)

```bash
# Run the sovereignty check inside the container
docker exec maia-sovereign bash scripts/check-no-openai-runtime.sh
# Expected: ✅ check:no-openai-runtime — no live OpenAI access found
```

### Log scan

```bash
# Scan last 1000 lines of app logs for any OpenAI reference
docker logs maia-sovereign --tail 1000 2>&1 | grep -i "openai"
# Expected: no output

# Scan for the key itself (should never appear in logs)
docker logs maia-sovereign --tail 1000 2>&1 | grep -i "sk-"
# Expected: no output
```

### Network trace (optional but definitive)

```bash
# Monitor outbound connections from the app container for 60 seconds
# while generating some TTS and sending a message
docker exec maia-sovereign bash -c "cat /proc/net/tcp6" | grep -v "00000000:0000"
# Or use nsenter if available

# On the Mac host, watch DNS queries during a test session
sudo tcpdump -i any -n 'port 53' 2>/dev/null | grep openai
# Expected: no openai DNS queries
```

### Test TTS still works

```bash
curl -X POST https://soullab.life/api/voice/local-tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Sovereignty check. Local voice is active.", "voice": "af_heart"}' \
  -o /tmp/test.mp3 -w "status=%{http_code} provider=%{header.X-TTS-Provider}\n"
# Expected: status=200 provider=kokoro
```

---

## Step 6 — Confirm clean state

Run this final confirmation block:

```bash
echo "=== 1. Env files ===" && \
  grep -rl "OPENAI_API_KEY" .env .env.local .env.production .env.staging 2>/dev/null \
  && echo "FAIL: key found in env files" || echo "PASS: no key in env files"

echo "=== 2. Container envs ===" && \
  for c in maia-sovereign maia-api; do
    docker exec "$c" env 2>/dev/null | grep -i "openai" \
    && echo "FAIL: key in $c" || echo "PASS: $c clean"
  done

echo "=== 3. Code check ===" && \
  docker exec maia-sovereign bash scripts/check-no-openai-runtime.sh

echo "=== 4. Log scan ===" && \
  docker logs maia-sovereign --tail 500 2>&1 | grep -i "openai" \
  && echo "FAIL: openai in logs" || echo "PASS: no openai in logs"

echo "=== 5. TTS smoke ===" && \
  curl -sf -X POST http://localhost/api/voice/local-tts \
    -H "Content-Type: application/json" \
    -d '{"text": "test", "voice": "af_heart"}' -o /dev/null \
  && echo "PASS: local TTS responding" || echo "FAIL: TTS down"
```

---

## Ongoing drift prevention

```bash
# Add to crontab on Mac Studio host — weekly sovereignty check
# crontab -e
0 9 * * 1 cd ~/MAIA-SOVEREIGN && docker exec maia-sovereign bash scripts/check-no-openai-runtime.sh >> ~/sovereignty-check.log 2>&1
```

If the check ever fails:
1. Identify the file and pattern (from the `[openai-sdk]`, `[openai-fetch]`, `[openai-key]` tag)
2. Follow the incident response process in `SOVEREIGNTY_PROVIDER_POLICY.md`
3. Do not deploy until clean

---

_See also: `SOVEREIGNTY_PROVIDER_POLICY.md`, `lib/ai/openaiPolicy.ts`_
