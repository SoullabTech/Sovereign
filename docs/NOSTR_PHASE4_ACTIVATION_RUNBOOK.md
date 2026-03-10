# Phase 4 Activation Runbook — MAIA Oracle Identity

## Scope

This runbook activates MAIA as a delegated Nostr entity.

**Start with one role only: oracle.**
Do not activate support, retreat, or practitioner_bridge until oracle is confirmed working end-to-end.

**What this unlocks:** MAIA can publish signed kind 1 events (reflections, notes)
that are verifiably authored by the MAIA root identity, signed by a hot service key,
and delegated via NIP-26 on Nostr.

---

## Prerequisites

- Phase 1–3 are deployed and working (`wss://nostr.soullab.life` live, DMs and channels functional)
- Docker and Caddy are running
- You have access to `.env.production` and `docker-compose.production.yml`
- `wscat` is installed: `npm install -g wscat`

---

## Step 1 — Generate the oracle service keypair

Run online (network OK for this step).

```bash
node -e "
  const {generateSecretKey, getPublicKey} = require('nostr-tools');
  const {nsecEncode, npubEncode} = require('nostr-tools/nip19');
  const sk = generateSecretKey();
  const pk = getPublicKey(sk);
  const hex = b => Array.from(b).map(x => x.toString(16).padStart(2,'0')).join('');
  console.log('ORACLE SERVICE PRIVKEY (hex — goes in env):');
  console.log(hex(sk));
  console.log();
  console.log('ORACLE SERVICE PUBKEY (hex):');
  console.log(pk);
  console.log();
  console.log('ORACLE SERVICE NPUB (for display):');
  console.log(npubEncode(pk));
"
```

Save:
- `ORACLE_SERVICE_PRIVKEY_HEX` — goes in `.env.production` (secret)
- `ORACLE_SERVICE_PUBKEY_HEX` — needed for Step 3

---

## Step 2 — Generate the MAIA root keypair (OFFLINE)

**Disconnect from the network before this step.**

```bash
node -e "
  const {generateSecretKey, getPublicKey} = require('nostr-tools');
  const {nsecEncode, npubEncode} = require('nostr-tools/nip19');
  const sk = generateSecretKey();
  const pk = getPublicKey(sk);
  const hex = b => Array.from(b).map(x => x.toString(16).padStart(2,'0')).join('');
  console.log('MAIA ROOT NSEC (NEVER in app — cold storage only):');
  console.log(nsecEncode(sk));
  console.log();
  console.log('MAIA ROOT PUBKEY (hex — goes in env):');
  console.log(pk);
  console.log();
  console.log('MAIA ROOT NPUB (public MAIA Nostr identity):');
  console.log(npubEncode(pk));
"
```

Save:
- Root nsec → **cold storage** (physical safe, encrypted USB, or hardware key)
- `ROOT_PUBKEY_HEX` → goes in `.env.production` as `MAIA_ROOT_NOSTR_PUBKEY` (this is public)

**Immediately after noting the nsec, disconnect again if you reconnected.**

---

## Step 3 — Generate oracle delegation cert (OFFLINE)

Keep the root nsec in your shell env only for the duration of this step.

```bash
# Set root nsec (offline machine, shell only)
export MAIA_ROOT_NOSTR_NSEC="nsec1..."    # root nsec from Step 2

# Generate oracle delegation cert (valid 90 days)
npx ts-node scripts/generate-maia-delegation.ts \
  --role oracle \
  --service-pubkey <ORACLE_SERVICE_PUBKEY_HEX from Step 1> \
  --kinds 1 \
  --days 90 \
  > /tmp/oracle-delegation.sql

# Review the SQL before applying
cat /tmp/oracle-delegation.sql

# Clear root nsec from env immediately
unset MAIA_ROOT_NOSTR_NSEC
echo "Root nsec cleared from env."
```

Expected SQL output contains:
- `INSERT INTO maia_nostr_service_keys ...`
- `UPDATE maia_nostr_delegation_certs SET active = false ...`
- `INSERT INTO maia_nostr_delegation_certs ...` with a 128-char delegation_token

---

## Step 4 — Apply delegation cert to database

```bash
psql -U soullab maia_consciousness < /tmp/oracle-delegation.sql

# Clean up
rm /tmp/oracle-delegation.sql

# Verify
psql -U soullab maia_consciousness -c "
  SELECT service_role, service_pubkey,
         to_timestamp(valid_since) AS valid_from,
         to_timestamp(valid_until) AS valid_until,
         active
  FROM maia_nostr_delegation_certs
  ORDER BY created_at DESC;
"
```

Expected output: one row for oracle, `active = true`, dates ~90 days out.

---

## Step 5 — Add env vars

Edit `.env.production`:

```bash
# MAIA Nostr Identity (Phase 4)
MAIA_ROOT_NOSTR_PUBKEY=<ROOT_PUBKEY_HEX from Step 2>
MAIA_ORACLE_SERVICE_PRIVKEY=<ORACLE_SERVICE_PRIVKEY_HEX from Step 1>
MAIA_INTERNAL_SERVICE_TOKEN=<generate with: openssl rand -hex 32>
```

Generate the internal token if not already set:

```bash
openssl rand -hex 32
```

---

## Step 6 — Redeploy

```bash
cd ~/MAIA-SOVEREIGN
docker compose -f docker-compose.production.yml up -d --build maia
```

Wait for the container to show `(healthy)`:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}" | grep maia-sovereign
```

---

## Step 7 — Verify activation

Run the activation test script:

```bash
MAIA_INTERNAL_SERVICE_TOKEN=<your token> bash scripts/test-phase4-oracle.sh
```

The script runs three tests:

**Test 1 — Readiness** (`GET /api/nostr/maia/status`):
```json
{
  "phase4Active": true,
  "rootPubkey": "<ROOT_PUBKEY_HEX>",
  "roles": {
    "oracle": {
      "ready": true,
      "serviceKeyConfigured": true,
      "delegationCertActive": true,
      "rootPubkeyConfigured": true,
      "delegationValidUntil": "2026-06-08T..."
    }
  }
}
```

**Test 2 — Reflect publish** (`POST /api/nostr/maia/reflect`):
```json
{
  "eventId": "...",
  "pubkey": "<ORACLE_SERVICE_PUBKEY>",
  "rootPubkey": "<ROOT_PUBKEY_HEX>",
  "delegated": true,
  "publishedAt": 1234567890
}
```

**`delegated: true` is the critical success signal.**

**Test 3 — Relay verification** (wscat subscription):
```json
["EVENT", "test", {
  "kind": 1,
  "pubkey": "<ORACLE_SERVICE_PUBKEY>",
  "tags": [
    ["delegation", "<ROOT_PUBKEY_HEX>", "kind=1&created_at>...&created_at<...", "<128-char sig>"],
    ["client", "maia-sovereign"]
  ],
  "content": "MAIA oracle activation test..."
}]
```

The `delegation` tag links the event to the MAIA root identity via NIP-26.

---

## Manual relay verification

If the test script's relay check doesn't show the event, verify manually:

```bash
# Connect to relay
wscat -c wss://nostr.soullab.life

# Query for the event by ID (paste into wscat)
["REQ","test",{"ids":["<eventId>"]}]

# Query for all oracle events (by service pubkey)
["REQ","test",{"kinds":[1],"authors":["<ORACLE_SERVICE_PUBKEY>"]}]

# Close subscription
["CLOSE","test"]
```

---

## Rollback

If something goes wrong:

```bash
# Deactivate the delegation cert
psql -U soullab maia_consciousness -c "
  UPDATE maia_nostr_delegation_certs
  SET active = false
  WHERE service_role = 'oracle';
"

# Remove env vars from .env.production and redeploy
# The reflect endpoint returns 503 gracefully when not configured
```

No relay events are retractable (Nostr is append-only), but deactivating the cert
stops any future delegation-signed events from being published.

---

## Env var reference (oracle activation only)

| Variable | Required | Notes |
|----------|----------|-------|
| `MAIA_ROOT_NOSTR_PUBKEY` | Yes | Hex pubkey of root identity (public) |
| `MAIA_ORACLE_SERVICE_PRIVKEY` | Yes | Hex privkey of oracle service key (secret) |
| `MAIA_INTERNAL_SERVICE_TOKEN` | Yes | Random 32+ char secret for internal API auth |

**Do not add** `MAIA_ROOT_NOSTR_NSEC` to any env file. The root nsec is never in the running application.

---

## After successful oracle activation

- Test one oracle reflection daily for a few days (confirm events appear on relay)
- Add MAIA's root npub to docs and member-facing materials
- Then, when ready, activate `support` and `retreat` roles using the same sequence

**The next role after oracle:** `support` (kind 14 DM responses — requires NIP-17 gift-wrap on the server side, Phase 4b work).

---

## 90-Day rotation

When `delegationValidUntil` approaches:

1. Run `generate-maia-delegation.ts` again (same or new service pubkey, offline)
2. Apply the SQL — old cert is automatically deactivated
3. Redeploy is NOT required if service pubkey hasn't changed

The root key comes out of cold storage only for rotation.
