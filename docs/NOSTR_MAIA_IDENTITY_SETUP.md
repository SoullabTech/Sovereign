# MAIA Nostr Identity Setup (Phase 4)

## Model

MAIA participates in Nostr as a signed first-class entity using a tiered key structure:

```
Root keypair (OFFLINE — cold storage, never in app)
├── Oracle service key         — public reflections (kind 1)
├── Support service key        — DM responses (kind 14)
├── Retreat service key        — circle summaries, channel facilitation (kind 9)
└── Practitioner bridge key    — practitioner coordination (kind 9, 14)
```

Service private keys live in env vars (Docker secrets in production).
Delegation certificates (NIP-26 tokens) are stored in the database.
The root private key **never** enters the running application.

---

## Step 1 — Generate root keypair (OFFLINE)

**Disconnect from the network before this step.**

```bash
# Generate root keypair
node -e "
  const {generateSecretKey, getPublicKey} = require('nostr-tools');
  const {nsecEncode, npubEncode} = require('nostr-tools/nip19');
  const sk = generateSecretKey();
  const pk = getPublicKey(sk);
  const hex = b => Array.from(b).map(x => x.toString(16).padStart(2,'0')).join('');
  console.log('ROOT PRIVKEY (nsec — STORE SECURELY, NEVER IN APP):');
  console.log(nsecEncode(sk));
  console.log();
  console.log('ROOT PUBKEY (npub — safe to publish):');
  console.log(npubEncode(pk));
  console.log();
  console.log('ROOT PUBKEY (hex — add to MAIA_ROOT_NOSTR_PUBKEY env var):');
  console.log(pk);
"
```

Store the nsec in a physical safe or encrypted cold storage (e.g., hardware security key, encrypted USB).
**Delete it from your terminal history and environment immediately after use.**

---

## Step 2 — Generate service keypairs (once per role)

You need one keypair per service role. Service keys ARE stored in env vars.

```bash
# Run once per role. Replace 'oracle' in the label with actual role name.
for ROLE in oracle support retreat practitioner_bridge; do
  echo "=== $ROLE ==="
  node -e "
    const {generateSecretKey, getPublicKey} = require('nostr-tools');
    const {nsecEncode, npubEncode} = require('nostr-tools/nip19');
    const sk = generateSecretKey();
    const pk = getPublicKey(sk);
    const hex = b => Array.from(b).map(x => x.toString(16).padStart(2,'0')).join('');
    console.log('PRIVKEY (add to env as MAIA_${ROLE.toUpperCase()}_SERVICE_PRIVKEY):', hex(sk));
    console.log('PUBKEY (hex):', pk);
  "
  echo
done
```

Add the privkeys to `.env.production` or Docker secrets:

```bash
MAIA_ORACLE_SERVICE_PRIVKEY=<64-char hex>
MAIA_SUPPORT_SERVICE_PRIVKEY=<64-char hex>
MAIA_RETREAT_SERVICE_PRIVKEY=<64-char hex>
MAIA_PRACTITIONER_BRIDGE_SERVICE_PRIVKEY=<64-char hex>
MAIA_ROOT_NOSTR_PUBKEY=<root pubkey 64-char hex>
MAIA_INTERNAL_SERVICE_TOKEN=<random 32+ char secret for internal API auth>
```

---

## Step 3 — Generate delegation certificates (OFFLINE, with root key)

For each service role, generate a NIP-26 delegation certificate.
This requires the root private key — run offline.

```bash
# Oracle: signs public reflections (kind 1), valid 90 days
MAIA_ROOT_NOSTR_NSEC=nsec1... npx ts-node scripts/generate-maia-delegation.ts \
  --role oracle \
  --service-pubkey <oracle service pubkey hex> \
  --kinds 1 \
  --days 90 \
  > /tmp/oracle-delegation.sql

# Support: DM responses (kind 14), valid 90 days
MAIA_ROOT_NOSTR_NSEC=nsec1... npx ts-node scripts/generate-maia-delegation.ts \
  --role support \
  --service-pubkey <support service pubkey hex> \
  --kinds 14 \
  --days 90 \
  >> /tmp/oracle-delegation.sql

# Retreat: channel facilitation (kind 9), valid 90 days
MAIA_ROOT_NOSTR_NSEC=nsec1... npx ts-node scripts/generate-maia-delegation.ts \
  --role retreat \
  --service-pubkey <retreat service pubkey hex> \
  --kinds 9 \
  --days 90 \
  >> /tmp/oracle-delegation.sql

# Practitioner bridge: kind 9 + 14
MAIA_ROOT_NOSTR_NSEC=nsec1... npx ts-node scripts/generate-maia-delegation.ts \
  --role practitioner_bridge \
  --service-pubkey <practitioner bridge service pubkey hex> \
  --kinds 9 \
  --days 90 \
  >> /tmp/oracle-delegation.sql

MAIA_ROOT_NOSTR_NSEC=nsec1... npx ts-node scripts/generate-maia-delegation.ts \
  --role practitioner_bridge \
  --service-pubkey <practitioner bridge service pubkey hex> \
  --kinds 14 \
  --days 90 \
  >> /tmp/oracle-delegation.sql
```

**After running:**
```bash
unset MAIA_ROOT_NOSTR_NSEC
cat /tmp/oracle-delegation.sql   # review carefully
```

---

## Step 4 — Apply to database

Review the SQL, then:

```bash
psql -U soullab maia_consciousness < /tmp/oracle-delegation.sql
rm /tmp/oracle-delegation.sql
```

Verify:
```sql
SELECT service_role, service_pubkey, valid_since, valid_until, active
FROM maia_nostr_delegation_certs
ORDER BY service_role, created_at DESC;
```

---

## Step 5 — Publish MAIA's root identity profile (kind 0)

Once certs are loaded, publish MAIA's profile so it appears correctly in Nostr clients:

```bash
# Via the Soullab admin interface (Phase 4b) — not yet implemented
# For now, use any Nostr client with the oracle service key to publish kind 0
```

---

## Verification

```bash
# Check readiness for oracle role
curl -s https://soullab.life/api/nostr/maia/reflect \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: $MAIA_INTERNAL_SERVICE_TOKEN" \
  -d '{"content": "Test oracle reflection from MAIA."}' | jq .

# Expected: { eventId: "...", delegated: true, rootPubkey: "..." }
```

---

## 90-Day Rotation

When delegation certs expire, re-run Step 3 with the same or updated service pubkeys.
The INSERT statement automatically deactivates old certs (`UPDATE ... SET active = false`).
The root key is the only thing that needs to come out of cold storage for rotation.

---

## Key Inventory

| Key | Lives in | Renewed |
|-----|----------|---------|
| Root privkey (nsec) | Cold storage / physical safe | Never (unless compromised) |
| Root pubkey | `MAIA_ROOT_NOSTR_PUBKEY` env var | Never |
| Oracle service privkey | `MAIA_ORACLE_SERVICE_PRIVKEY` env var | Optional, on breach |
| Oracle delegation cert | `maia_nostr_delegation_certs` DB | Every 90 days |
| Support service privkey | `MAIA_SUPPORT_SERVICE_PRIVKEY` env var | Optional |
| Support delegation cert | DB | Every 90 days |
| Retreat service privkey | `MAIA_RETREAT_SERVICE_PRIVKEY` env var | Optional |
| Practitioner bridge privkey | `MAIA_PRACTITIONER_BRIDGE_SERVICE_PRIVKEY` env var | Optional |

---

## API Reference

### POST /api/nostr/maia/reflect

Publish a MAIA oracle reflection as a kind 1 Nostr event, signed with the
oracle service key and NIP-26 delegation tag.

**Headers:** `X-Internal-Token: <MAIA_INTERNAL_SERVICE_TOKEN>`

**Body:**
```json
{
  "content": "...",
  "memberPubkeyHex": "optional — tags the member (p tag)",
  "replyToEventId": "optional — thread reply (e tag)"
}
```

**Response:**
```json
{
  "eventId": "...",
  "pubkey": "<oracle service pubkey>",
  "rootPubkey": "<MAIA root pubkey>",
  "delegated": true,
  "publishedAt": 1234567890
}
```

Returns `503` if Phase 4 is not configured.
