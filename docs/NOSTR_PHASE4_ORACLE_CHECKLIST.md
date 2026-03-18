# Phase 4 Oracle Activation — Operator Checklist

**Role: oracle only.** Do not activate other roles until oracle is confirmed end-to-end.

---

## Pre-Activation Requirements

Before starting, confirm all of these are true:

- [ ] `wss://nostr.soullab.life` responds to wscat (`wscat -c wss://nostr.soullab.life`)
- [ ] `GET https://soullab.life/api/nostr/maia/status` returns HTTP 200
- [ ] You have access to `.env.production` on the production host
- [ ] `nostr-tools` is installed in the project: `ls node_modules/nostr-tools` — returns files
- [ ] You have a machine (or can disconnect this machine) for offline key generation

**GO** → all checked
**NO-GO** → do not proceed; fix missing prerequisites first

---

## GATE 1 — Service Keypair

**Run online (network OK)**

```bash
node -e "
  const {generateSecretKey, getPublicKey} = require('nostr-tools');
  const {nsecEncode, npubEncode} = require('nostr-tools/nip19');
  const sk = generateSecretKey();
  const pk = getPublicKey(sk);
  const hex = b => Array.from(b).map(x => x.toString(16).padStart(2,'0')).join('');
  console.log('ORACLE_SERVICE_PRIVKEY_HEX:', hex(sk));
  console.log('ORACLE_SERVICE_PUBKEY_HEX: ', pk);
  console.log('ORACLE_SERVICE_NPUB:       ', npubEncode(pk));
"
```

**Record:**

```
ORACLE_SERVICE_PRIVKEY_HEX = ________________________________  (secret — .env.production only)
ORACLE_SERVICE_PUBKEY_HEX  = ________________________________  (needed for Gate 2)
```

**Gate 1 check:**
- [ ] `ORACLE_SERVICE_PRIVKEY_HEX` is 64 lowercase hex chars
- [ ] `ORACLE_SERVICE_PUBKEY_HEX` is 64 lowercase hex chars
- [ ] Both recorded before proceeding

**GO** → proceed
**STOP** → if either is missing or wrong length, re-run and record again

---

## GATE 2 — Root Keypair (OFFLINE)

**Disconnect from network before this step.**

```bash
node -e "
  const {generateSecretKey, getPublicKey} = require('nostr-tools');
  const {nsecEncode, npubEncode} = require('nostr-tools/nip19');
  const sk = generateSecretKey();
  const pk = getPublicKey(sk);
  const hex = b => Array.from(b).map(x => x.toString(16).padStart(2,'0')).join('');
  console.log('MAIA_ROOT_NSEC (COLD STORAGE — never in app):');
  console.log(nsecEncode(sk));
  console.log('MAIA_ROOT_PUBKEY_HEX (goes in .env.production):');
  console.log(pk);
  console.log('MAIA_ROOT_NPUB (public identity):');
  console.log(npubEncode(pk));
"
```

**Record:**

```
MAIA_ROOT_NSEC     = nsec1________________________________  (cold storage: physical safe or encrypted USB)
MAIA_ROOT_PUBKEY   = ________________________________       (goes in .env.production)
MAIA_ROOT_NPUB     = npub1________________________________  (public MAIA Nostr identity)
```

**Gate 2 check:**
- [ ] Root nsec noted and physically secured (written down or copied to encrypted offline storage)
- [ ] `MAIA_ROOT_PUBKEY` is 64 lowercase hex chars
- [ ] Network is still disconnected

**GO** → proceed
**STOP** → if root nsec cannot be secured, abort — generating an unsecured root key is worse than no key

---

## GATE 3 — Delegation Certificate (OFFLINE)

**Keep network disconnected. Set nsec in shell env for this step only.**

```bash
export MAIA_ROOT_NOSTR_NSEC="nsec1..."   # root nsec from Gate 2

npx ts-node scripts/generate-maia-delegation.ts \
  --role oracle \
  --service-pubkey <ORACLE_SERVICE_PUBKEY_HEX from Gate 1> \
  --kinds 1 \
  --days 90 \
  > /tmp/oracle-delegation.sql

# Immediately clear root nsec
unset MAIA_ROOT_NOSTR_NSEC
echo "Root nsec cleared."
```

**Review the SQL before applying:**

```bash
cat /tmp/oracle-delegation.sql
```

**Expected output contains:**
1. `INSERT INTO maia_nostr_service_keys ...` — service pubkey registration
2. `UPDATE maia_nostr_delegation_certs SET active = false ...` — deactivate any prior certs
3. `INSERT INTO maia_nostr_delegation_certs ...` — new cert with 128-char `delegation_token`

**Gate 3 check:**
- [ ] SQL file exists and is non-empty
- [ ] `delegation_token` in the INSERT is 128 hex chars
- [ ] `root_pubkey` in the INSERT matches `MAIA_ROOT_PUBKEY` from Gate 2
- [ ] `service_pubkey` in the INSERT matches `ORACLE_SERVICE_PUBKEY_HEX` from Gate 1
- [ ] `valid_until` timestamp is ~90 days from now (verify: `date -d @<unix_timestamp>` or `python3 -c "import datetime; print(datetime.datetime.fromtimestamp(<unix>))"`)
- [ ] Root nsec is unset: `echo ${MAIA_ROOT_NOSTR_NSEC:-cleared}` returns `cleared`

**GO** → proceed
**STOP** → if SQL looks wrong, re-run the script (do not apply bad SQL); if root nsec failed to clear, clear it now

---

## GATE 4 — Apply to Database

**Reconnect to network here if needed.**

```bash
psql -U soullab maia_consciousness < /tmp/oracle-delegation.sql

# Clean up immediately
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

**Gate 4 check:**
- [ ] psql returns no errors on the INSERT
- [ ] Verification query returns exactly one row for `oracle`
- [ ] `active = t`
- [ ] `valid_until` is ~90 days out
- [ ] `/tmp/oracle-delegation.sql` is deleted: `ls /tmp/oracle-delegation.sql` → "No such file or directory"

**GO** → proceed
**STOP** → if DB insert failed, check psql error, fix, re-run from Gate 3

---

## GATE 5 — Environment Variables

**Edit `.env.production`:**

```bash
# MAIA Nostr Identity (Phase 4 — oracle)
MAIA_ROOT_NOSTR_PUBKEY=<MAIA_ROOT_PUBKEY from Gate 2>
MAIA_ORACLE_SERVICE_PRIVKEY=<ORACLE_SERVICE_PRIVKEY_HEX from Gate 1>
MAIA_INTERNAL_SERVICE_TOKEN=<generate if not set: openssl rand -hex 32>
```

**Generate internal token if not already present:**

```bash
openssl rand -hex 32
```

**Gate 5 check:**
- [ ] `MAIA_ROOT_NOSTR_PUBKEY` is in `.env.production` (64 hex chars)
- [ ] `MAIA_ORACLE_SERVICE_PRIVKEY` is in `.env.production` (64 hex chars)
- [ ] `MAIA_INTERNAL_SERVICE_TOKEN` is in `.env.production` (32+ random chars)
- [ ] Root nsec is **NOT** in `.env.production` — grep confirms: `grep -i nsec .env.production` → empty

**GO** → proceed
**STOP** → if root nsec appears in env file, remove it immediately

---

## GATE 6 — Redeploy

```bash
cd ~/MAIA-SOVEREIGN
docker compose -f docker-compose.production.yml up -d --build maia
```

**Wait for healthy:**

```bash
docker ps --format "table {{.Names}}\t{{.Status}}" | grep maia-sovereign
```

**Gate 6 check:**
- [ ] Container shows `(healthy)` in Status column
- [ ] No build errors in `docker logs maia-sovereign --tail 20`

**GO** → proceed
**STOP** → check build logs, fix error, rebuild

---

## GATE 7 — Activation Verification (Critical Gate)

```bash
MAIA_INTERNAL_SERVICE_TOKEN=<your token> bash scripts/test-phase4-oracle.sh
```

**Stage 1 — Readiness** (must all pass before Stage 2 runs):

```
✓ Service key configured
✓ Delegation cert active (valid until: 2026-06-08T...)
✓ Root pubkey configured: <64-char hex>
✓ Oracle: READY
```

**Stage 2 — Reflect publish:**

```json
{
  "eventId": "...",
  "pubkey": "<ORACLE_SERVICE_PUBKEY>",
  "rootPubkey": "<MAIA_ROOT_PUBKEY>",
  "delegated": true,
  "publishedAt": 1234567890
}
```

**Stage 3 — Relay verification:**

```
✓ Event found on relay
  kind: 1
  pubkey: <ORACLE_SERVICE_PUBKEY>
  delegation tag: PRESENT ✓
✓ Delegation tag present in relay event
```

**Gate 7 — Go/No-Go criteria:**

| Signal | Required | Status |
|--------|----------|--------|
| `oracle.ready: true` in status endpoint | YES | [ ] |
| `delegated: true` in reflect response | YES — **this is the critical signal** | [ ] |
| Event found on relay | YES | [ ] |
| `delegation` tag present in relay event | YES | [ ] |

**GO** → all four rows checked — MAIA oracle is now a first-class Nostr entity
**NO-GO** → any unchecked row — see rollback below

---

## Rollback

If any gate fails after Gate 4, deactivate the cert and remove env vars:

```bash
# Deactivate delegation cert
psql -U soullab maia_consciousness -c "
  UPDATE maia_nostr_delegation_certs
  SET active = false
  WHERE service_role = 'oracle';
"

# Remove Phase 4 env vars from .env.production, then redeploy
# Status endpoint will return phase4Active: false gracefully
```

Note: Any events already published to the relay are permanent (Nostr is append-only). Deactivating the cert stops future delegation-signed events only.

---

## Post-Activation

After Gate 7 passes:

1. **Daily test** — Run `scripts/test-phase4-oracle.sh` once daily for 3 days; confirm events appear on relay
2. **Publish MAIA kind 0 profile** — Publish root npub identity event (see `docs/NOSTR_MAIA_IDENTITY_SETUP.md`)
3. **Add root npub to member-facing materials** — `MAIA_ROOT_NPUB` from Gate 2
4. **90-day rotation reminder** — Calendar reminder before `delegationValidUntil`; rotation does not require redeployment if service pubkey stays the same

**Next role after oracle:** `support` (NIP-17 gift-wrap DM responses — Phase 4b, not yet built).
Do not activate until oracle has been stable for at least 3 days.

---

## Quick Reference

| Variable | Where | Value source |
|----------|-------|--------------|
| `MAIA_ROOT_NOSTR_PUBKEY` | `.env.production` | Gate 2 — root pubkey hex |
| `MAIA_ORACLE_SERVICE_PRIVKEY` | `.env.production` | Gate 1 — service privkey hex |
| `MAIA_INTERNAL_SERVICE_TOKEN` | `.env.production` | `openssl rand -hex 32` |
| Root nsec | Cold storage only | Gate 2 — **never in app** |

**The go/no-go signal that closes the rite:** `delegated: true` in the relay event.
