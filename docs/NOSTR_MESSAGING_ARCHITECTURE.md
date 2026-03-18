# Soullab Sovereign Messaging Architecture

## Overview

Soullab's sovereign messaging layer uses the **Nostr protocol** as its communications spine. This gives every member a self-owned cryptographic identity, with end-to-end encrypted direct messages and community group channels — all hosted on Soullab's own relay, with no third party intermediary.

BitChat (Jack Dorsey's app) is treated as an optional compatible edge client. Any Nostr-compatible client can participate on the Soullab relay once a member has registered their public key.

---

## Protocol Layers

```
Phase 1 ✅  Identity + Relay         — keypair generation, relay setup
Phase 2 ✅  Encrypted DMs            — NIP-17 gift-wrapped messages
Phase 3 ✅  Community Channels       — NIP-29 relay-based groups
Phase 4 🔜  MAIA as Nostr Entity     — root identity + NIP-26 delegated keys
Phase 5 🔜  Offline/Retreat          — iOS Bluetooth mesh (BitChat compatible)
```

---

## Identity Model

### Member Identity

Every member gets **one keypair**:
- **Private key (nsec)**: generated client-side, stored in `localStorage` only, never sent to server
- **Public key (npub)**: registered with the server at `/api/nostr/register`, stored in `members.nostr_pubkey`

The public key is the member's permanent Nostr identity. Private key loss means DM history is inaccessible (by design — sovereignty means no server-held fallback).

**Key storage path**: `localStorage['nostr_privkey_{memberId}']`

**Key validation**: On every load, the stored privkey is used to derive the public key and compared against the registered server-side pubkey. Mismatch → recovery UI.

**Recovery path**: Member imports their nsec backup. The nsec must derive the registered pubkey; mismatched nsec is rejected.

### MAIA Identity (Phase 4)

MAIA will have a **tiered identity**:

```
Root keypair (offline / cold storage)
├── Oracle service key         (NIP-26 delegated, 90-day rotation)
├── Support service key        (NIP-26 delegated)
├── Retreat facilitator key    (NIP-26 delegated)
└── Practitioner bridge key    (NIP-26 delegated)
```

Delegated keys sign events on behalf of the root, scoped by kind and time window. The root key never touches the hot application — only delegation certificates are deployed.

---

## Relay

**URL**: `wss://nostr.soullab.life`
**Software**: [strfry](https://github.com/hoytech/strfry) (C++ relay, Alpine Linux Docker image)
**Hosted on**: Mac Studio (self-hosted, no cloud intermediary)
**TLS**: Caddy with Let's Encrypt auto-cert

### Write Policy

strfry enforces a member-only write policy via a shell script plugin (`scripts/nostr-write-policy.sh`):

1. For each incoming event, the plugin calls `http://maia-sovereign:3000/api/nostr/validate-pubkey?pubkey=<hex>`
2. If the pubkey is in `members.nostr_pubkey`, the event is **accepted**
3. Otherwise **rejected**
4. AUTH events (kind 22242) and ephemeral events (kinds 20000–29999) pass through unconditionally

**Phase 4 enhancement**: Write policy will be extended to enforce channel membership for kind 9 events (require pubkey to be in `nostr_channel_memberships` for the target channel).

---

## Direct Messages (Phase 2)

### Protocol: NIP-17 (gift-wrapped DMs)

Wrapping layers:
```
Kind 14 rumor      — plaintext DM content, signed by sender, NOT published
    ↓ NIP-44 encrypt (sender priv → recipient pub)
Kind 13 seal       — content is encrypted rumor, signed by sender's real key
    ↓ NIP-44 encrypt (ephemeral random key → recipient pub)
Kind 1059 gift wrap — content is encrypted seal, signed by ephemeral key
    ↓ published to relay (what relay stores)
```

**Metadata privacy**: The gift wrap is signed by a random ephemeral key, so observers of the relay cannot determine who sent a message to whom.

### Send flow

```
sendDM(senderPrivkey, senderPubkey, recipientPubkey, message)
  → wrapManyEvents(senderPrivkey, [recipient, self], message)
  → publishEvent(wrap1)   ← recipient's copy
  → publishEvent(wrap2)   ← sender's self-copy (to see sent messages)
```

Both gift wraps have the recipient's pubkey in the `p` tag, so:
- The recipient fetches `kind 1059, #p:[recipientPubkey]`
- The sender fetches `kind 1059, #p:[senderPubkey]` to see their sent messages

### Receive flow

```
subscribeToDMs(privkey, myPubkey, onMessage)
  → relay filter: { kinds: [1059], '#p': [myPubkey] }
  → per event: unwrapEvent(event, recipientPrivkey)
     → decrypts gift wrap → seal → rumor (kind 14)
  → onMessage(decryptedDM)
```

### Thread grouping

Peer identification:
- Sent message (`rumor.pubkey === myPubkey`): peer = `p` tag value (original recipient)
- Received message: peer = `rumor.pubkey` (sender)

Deduplication: by gift-wrap event ID (relay may deliver twice; self-copies can overlap).

---

## Community Channels (Phase 3)

### Protocol: NIP-29 (relay-based groups)

Channel messages use **kind 9** events with an `h` tag:

```json
{
  "kind": 9,
  "content": "Hello Soullab cohort",
  "tags": [
    ["h", "cohort", "wss://nostr.soullab.life"]
  ]
}
```

### Predefined channels

| Channel ID      | Name            | Access                    | Type        |
|-----------------|-----------------|---------------------------|-------------|
| `cohort`        | Cohort          | All Nostr members         | Open        |
| `practitioners` | Practitioners   | `is_practitioner = true`  | Closed      |
| `retreat`       | Retreat         | Explicit membership (DB)  | Closed      |
| `alumni`        | Alumni          | Explicit membership (DB)  | Closed      |

### Access control

Current (Phase 3):
- Server-side: `/api/nostr/channels` returns only eligible channels
- DB: `nostr_channel_memberships` tracks who has joined
- Relay: no enforcement (all registered members can publish any kind 9)

Phase 4:
- strfry write policy extended to check `nostr_channel_memberships` per kind 9 event
- Prevents non-members from posting to closed channels at the relay level

### Channel auto-join

Open channels (cohort) are automatically joined server-side when the member first loads the channels list. This creates a `nostr_channel_memberships` row — no explicit action required.

---

## Event Cache (Foundation for Phase 4)

Table: `member_nostr_events`

Stores raw encrypted gift-wrap events (kind 1059) and channel messages (kind 9) per member. Content remains encrypted — only the client can decrypt.

Phase 3: **not yet written to** (relay is the source of truth)
Phase 4: MAIA will read from this cache to compose circle summaries and facilitate channels

---

## Database Schema

```sql
-- Identity
members.nostr_pubkey         VARCHAR(64)    -- registered pubkey (hex)
members.nostr_registered_at  TIMESTAMPTZ

-- Event cache (Phase 4 foundation)
member_nostr_events (
  member_id, event_id, event_kind, peer_pubkey, raw_event JSONB, event_ts
)

-- Channels
nostr_channels (
  id VARCHAR(64) PRIMARY KEY,   -- e.g. 'cohort'
  name, about, channel_type, is_open, relay_url
)

nostr_channel_memberships (
  channel_id, member_id, role, joined_at
)
```

---

## Key Files

```
lib/nostr/
  crypto.ts       — keypair gen, signing, NIP-44 encryption, import/validate
  dm.ts           — NIP-17 gift-wrap send/receive/decrypt/group
  channels.ts     — NIP-29 post/fetch/subscribe
  client.ts       — SimplePool relay connection
  utils.ts        — NOSTR_KINDS constants, formatters, validators

app/api/nostr/
  register/       — POST: register member pubkey
  identity/       — GET: current member's Nostr identity
  validate-pubkey/— GET: strfry write policy endpoint (no auth)
  contacts/       — GET: resolve pubkeys to member names
  channels/       — GET: list accessible channels
  channels/[id]/join/  — POST: join a channel

components/nostr/
  NostrIdentitySetup.tsx    — first-time keypair wizard
  NostrIdentityCard.tsx     — key display, export, reset
  NostrMessagingSection.tsx — settings panel (Identity | Messages | Channels tabs)
  NostrMessenger.tsx        — DM inbox thread list
  NostrDMThread.tsx         — individual DM thread
  NostrChannels.tsx         — channel list
  NostrChannelThread.tsx    — channel conversation view

config/
  strfry.conf              — relay configuration

scripts/
  nostr-write-policy.sh    — strfry write policy plugin

Dockerfile.strfry          — custom strfry image with curl + jq
```

---

## Phase 4: MAIA as Nostr Entity

MAIA will participate as a first-class Nostr actor, not just a background assistant.

### Planned identity structure

```typescript
// lib/nostr/maiaIdentity.ts
const MAIA_ROOT_PUBKEY = process.env.MAIA_ROOT_NOSTR_PUBKEY;

// NIP-26 delegation certificates — stored in DB, rotated on schedule
// Each cert authorises a service key to sign specific event kinds
// on behalf of the root identity
interface DelegationCert {
  serviceKey: string;    // hot key pubkey
  allowedKinds: number[];
  since: number;
  until: number;
  sig: string;           // signed by root key offline
}
```

### Services

| Service Key | Use | Kinds |
|---|---|---|
| Oracle | MAIA conversation reflections | 1 (text note) |
| Support | Member support responses | 14 (DM) |
| Retreat | Circle summaries, facilitation | 9 (channel msg) |
| Practitioner Bridge | Practitioner coordination | 9, 14 |

### Rule: root key never goes online

The root keypair is generated offline and stored in cold storage. Only the NIP-26 delegation certificates are deployed to the application. If a service key is compromised, the root rotates it without changing MAIA's public identity.

---

## Phase 5: Offline / Retreat Mode

BitChat's Bluetooth mesh enables fully offline messaging during retreats:
- Members with the iOS app can communicate without internet
- BitChat uses Nostr key identity natively
- Messages sync back to the Soullab relay when connectivity is restored

Implementation: iOS Capacitor bridge in `scripts/build-ios.sh` + Bluetooth permission declarations in `ios/App/App/Info.plist`.

---

## DNS

| Record | Type | Value |
|---|---|---|
| `nostr.soullab.life` | A | Mac Studio public IP |

**Status**: ✅ Live — confirmed 2026-03-10.

```bash
# Verify:
dig +short nostr.soullab.life
curl -I https://nostr.soullab.life
# HTTP/2 200, server: strfry, via: 1.1 Caddy

wscat -c wss://nostr.soullab.life
# Connects — relay accepts WebSocket upgrade
```

Public relay endpoint: **`wss://nostr.soullab.life`**
