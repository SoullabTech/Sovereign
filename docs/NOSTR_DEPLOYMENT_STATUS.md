# Nostr Relay Deployment Status

## Public Endpoint

```
wss://nostr.soullab.life
```

## Confirmed (2026-03-10)

| Check | Status | Evidence |
|-------|--------|---------|
| DNS | ✅ | `nostr.soullab.life` resolves to Mac Studio public IP |
| TLS | ✅ | Caddy issued Let's Encrypt certificate; `curl -I https://nostr.soullab.life` returns HTTP/2 200 |
| Reverse proxy | ✅ | `via: 1.1 Caddy` header confirms proxy path active |
| Relay | ✅ | `server: strfry` header confirms upstream relay is answering |
| WebSocket | ✅ | `wscat -c wss://nostr.soullab.life` connects successfully |
| Write policy | ✅ | Member-only: registered pubkeys accepted, others rejected |

## Verification Commands

```bash
# DNS
dig +short nostr.soullab.life

# TLS + relay identity
curl -I https://nostr.soullab.life
# Expect: HTTP/2 200, server: strfry, via: 1.1 Caddy

# WebSocket relay access
wscat -c wss://nostr.soullab.life

# Internal relay health (from Mac Studio)
docker inspect --format='{{.State.Health.Status}}' maia-nostr-relay

# End-to-end: member pubkey validation
curl "https://soullab.life/api/nostr/validate-pubkey?pubkey=<hex>"
```

## Phase Progress

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Identity + relay (keypair gen, strfry relay, registration) | ✅ Complete |
| 2 | Encrypted DMs (NIP-17 gift-wrap, thread inbox) | ✅ Complete |
| 3 | Community channels (NIP-29, cohort/practitioners/retreat/alumni) | ✅ Complete |
| 4 | MAIA as Nostr entity (root key + NIP-26 delegated service keys) | 🔜 Next |
| 5 | Offline/retreat mode (iOS Bluetooth mesh, BitChat compatible) | ⏳ Future |

## Known Cleanup Items

- Caddy logs show certificate failures for `jlmasterhandyman.com` and unrelated domains — these are
  not affecting the Nostr relay or Soullab services, but should be cleaned up to reduce log noise.
  Check `Caddyfile` for stale or orphaned virtual host blocks.

## Configuration References

| Item | Value |
|------|-------|
| Relay software | strfry (Alpine Docker image) |
| Relay internal host | `maia-nostr-relay:7777` |
| Relay external | `wss://nostr.soullab.life` |
| TLS termination | Caddy (`maia-caddy` container) |
| Write policy | `scripts/nostr-write-policy.sh` → `GET /api/nostr/validate-pubkey` |
| Client constant | `SOULLAB_RELAY_URL` in `lib/nostr/utils.ts` |
| Docker compose | `docker-compose.production.yml` → `maia-nostr-relay` service |

## Environment Variable

Add to `.env` / `.env.production` for explicit configuration:

```bash
NOSTR_RELAY_URL=wss://nostr.soullab.life
```

Currently hardcoded as `SOULLAB_RELAY_URL` in `lib/nostr/utils.ts`. If relay URL ever changes,
update that constant and redeploy.
