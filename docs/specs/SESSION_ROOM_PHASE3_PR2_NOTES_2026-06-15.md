# Session Room Phase 3 — PR2 (LiveKit service + lockdown): build notes & surfaced finding

- **Status**: PR2 authored — **review only, NOT deployed.** Decision #1 **resolved: dedicated TURN port** (Kelly 2026-06-15). The LiveKit service, `livekit.yaml`, Caddy signaling route, and verified webhook receiver are all authored. No secrets created here; deploy + the security pass + media proofs are later gates.
- **Date**: 2026-06-15
- **Plan**: `SESSION_ROOM_PHASE3_IMPLEMENTATION_PLAN_2026-06-15.md` PR2 · **Design** `SESSION_ROOM_PHASE3_LIVEKIT_DESIGN_2026-06-15.md` §6.1.

---

## ⚠️ Surfaced finding — "Option B (TURN/TLS over 443, no new forward)" is not directly achievable

The build hit the boundary the audit flagged as **§6.1 M2** ("Option B TLS-termination ambiguity"). Confirmed against the live infra on `clean-main-no-secrets`:

- Caddy owns **443** across **15 `*.soullab.life` TLS sites**, using the **standard HTTP Caddy build** — **no `caddy-l4` / layer4 plugin** present.
- **No UDP or TURN ports** are published today (the external surface is TCP 80/443 only).

A second process (LiveKit's embedded TURN) **cannot also bind host :443**, and standard Caddy (HTTP reverse-proxy) **cannot SNI-route raw TURN-over-TLS**. So decision #1 as written needs one of:

| Option | Keeps "no new forward"? | Cost | Reliability |
|---|---|---|---|
| **(a) Caddy + `caddy-l4`** — SNI-route `turn.livekit.soullab.life:443` → LiveKit TURN | ✅ yes | **Custom Caddy image** (rebuild with the l4 plugin) + raw-TLS passthrough tuning — non-trivial, itself a new infra surface | high |
| **(b) Dedicated TURN port** (e.g. `5349/tcp+udp`) + one router forward | ❌ one new forward | small, well-understood; a single inbound port (firewall-reviewable) | high |
| **(c) No TURN for v1** — host-reflexive ICE/STUN only | ✅ yes | zero new infra | **degraded** — fails for clients behind symmetric/restrictive NAT (some sessions won't connect) |

**RESOLVED (Kelly 2026-06-15): Option (b) — dedicated TURN port.** Built under this assumption: TURN on **3478 (TCP+UDP)** is the single router forward; RTC ports (7881/7882) stay internal, reached via the embedded TURN relay; **7880 is never host-published**; Caddy keeps HTTPS/web as-is and only adds the signaling route. **Known v1 gap:** clients on 443-only networks may fail to connect (revisit `caddy-l4` consolidation later if real usage shows it). Rationale (Kelly): for a first media deployment, reliability + debuggability + rollback-ability beat architectural elegance — don't add a custom infra surface while still proving the product.

---

## Authored in this PR

- **`config/livekit.yaml`** — single-node SFU config: rtc (internal), **dedicated TURN on 3478**, webhook URL, logging. Secret-free (keys via `LIVEKIT_KEYS` env).
- **`docker-compose.production.yml`** — `livekit` service: pinned image, config mount, `LIVEKIT_KEYS` env, **only 3478 TCP+UDP published** (no 7880/RTC host-publish), `maia-internal` + `maia-public` networks, `no-new-privileges`.
- **`Caddyfile`** — `livekit.soullab.life` signaling WSS route → `livekit:7880`, **`/twirp/*` blocked publicly**, security headers + access log; the rest of Caddy unchanged.
- **`app/api/session/livekit-webhook/route.ts`** — verified webhook receiver (**§6.1 H3**). LiveKit signs each webhook as an HS256 JWT (Authorization header) with the API secret, carrying a `sha256` body-hash claim. The route verifies the signature (via `jose`, no new dep) **and** the body hash, checks `iss` == API key, and **fails closed** (503 unconfigured, 401 unsigned/invalid/tampered). It only acknowledges — lifecycle handling is PR5, gated on this verification (so a forged `room_finished` cannot trigger a retention write).

## Lockdown plan (TURN-independent — lands with the compose service once the media decision is made)

- **No host publish of `7880`** (LiveKit signaling + Twirp API). It stays on the Docker networks only: `maia-internal` (so the maia app can reach `livekit:7880` for room management — `RemoveParticipant` in PR5) + `maia-public` (so Caddy can reach signaling). **§6.1 C2b.**
- **Caddy exposes only signaling** (`wss://livekit.soullab.life` → `livekit:7880`, WS-upgrade path) and **blocks the `/twirp/*` API paths publicly** — the room-management API is reachable only from the internal network (the maia app), never the public internet.
- **Keys via env, never in the mounted config or logs**: `LIVEKIT_KEYS: "${LIVEKIT_API_KEY}: ${LIVEKIT_API_SECRET}"` from `.env.production`. **§6.1 C2a.** Identity + grants are always server-derived (PR1's `authorizeClientRoomJoin` + PR3 signing), never client-supplied (**§6.1 C2c**).

## Required provisioning (Kelly, before deploy — not created here)

- `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` in prod `.env.production` (server-only, like the `POSTGRES_BIND` preflight). **I do not generate or write secret values.**
- **Router**: forward **3478 TCP+UDP → 192.168.0.104** (the one TURN port).
- **DNS**: add **`livekit.soullab.life`** → the public IP (Caddy auto-obtains the TLS cert on first request).
- **`livekit.yaml` `webhook.api_key`**: set to the provisioned public key id at deploy (not a secret; LiveKit does not env-substitute YAML).

## Security review (security-auditor, 2026-06-15) — findings folded in

Verdict: sound for an infra-only PR. **Fixed in PR2:**
- **Caddy allowlist inversion (HIGH)** — the block previously denied only `/twirp/*` and *proxied everything else*, leaking `/rtc/validate` and other 7880 paths publicly. Now: only the `@ws` signaling upgrade is proxied; **default-deny `403`** for all else.
- **Webhook issuer hardening** — explicitly reject empty/missing `iss` before the exact match (never trust an event signed with an empty/absent key).
- **`cap_drop: [ALL]`** added to the `livekit` service (the Go binary needs no elevated caps).
- Image-pin comment → **immutable digest** at deploy.

**Deploy-gate items (verify before/at deploy — not PR2 code):**
- **`webhook.api_key` must not ship empty** — set it to the provisioned key id (or `envsubst` it at container start); confirm webhooks are accepted in the room-proof.
- **`LIVEKIT_KEYS` preflight** — assert both `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are set (empty → malformed key spec), alongside the `POSTGRES_BIND` preflight.
- **Webhook idempotency** on `(event, room)` — required when **PR5** acts on lifecycle events (not before).
- **Plain TURN (3478) carries relay credentials in the clear** — accepted v1 tradeoff; note in the runbook for clients on untrusted networks.

## Deferred to a separate gate (per plan)

Deploy of the LiveKit service + the room / multi-device / cellular proofs — none happen in this PR.
