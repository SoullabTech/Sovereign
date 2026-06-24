# Session Room Phase 3 — Implementation Plan

- **Status**: **Implementation plan — NO code yet.** Sequencing for the build that follows the finalized design. The build begins only on a **separate explicit founder go**, and lands PR-by-PR behind the gate ladder + governance.
- **Date**: 2026-06-15
- **Design**: [SESSION_ROOM_PHASE3_LIVEKIT_DESIGN_2026-06-15.md](./SESSION_ROOM_PHASE3_LIVEKIT_DESIGN_2026-06-15.md) (finalized; 5 decisions closed §9; security findings §6.1)
- **Discipline**: same as #451/#456/#457 — class-a/class-b PRs, covenant gate, founder-directed merge, gated deploy, in-container proof, caddy-route check. Infra in source (#455 lesson).

---

## Principles

1. **One PR per gate-ladder rung** where possible; each PR ships with its proof.
2. **Security findings (§6.1) are baked into the PR that owns them**, not deferred to a "harden later" pass.
3. **Pure logic before infra before UI** — testable units first, LiveKit service second, room UI last (mirrors how the consent gate was built).
4. **The consent gate is reused, never rebuilt** — the room JWT is the new payload of the *existing* reveal gate.
5. **Each infra/security PR gets a `security-auditor` pass** before merge.

---

## Gate-ladder → PR mapping

```
Unit proof         → PR1 (gate + room-token authorization logic, pure)
Integration proof  → PR3 (mint endpoint re-checks ledger; revoked ⇒ no token; rate-limit)
Room proof         → PR4 (real 2-person room on the self-hosted SFU, LAN)
Multi-device proof → PR4 (practitioner + client, separate devices/networks)
Cellular proof     → after PR4 (the external rung — stays the human's to run)
Production proof   → final gated deploy after PR5/PR6 (in-container proof + caddy 200)
```

---

## Preconditions (before PR1)

- **P0 — delete `app/video-server/`** (the abandoned socket.io scaffold). One media path; removes an undocumented signaling surface. [§6.1 LOW] Tiny PR or folded into PR1.
- **Provision LiveKit secrets**: `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` in prod `.env.production` (server-only), like the `POSTGRES_BIND` preflight pattern — set before the infra PR deploys, inert until then.
- **Confirm Option-B network**: no new router forward needed (TURN/TLS over 443); verify against the existing 443 path + the LAN-IP-drift trap.

---

## PR sequence

### PR1 — Gate + room-token authorization (pure logic, no LiveKit dep) · *unit proof*
- Add a distinct **`'join'` purpose** to `validateJoinToken` (`lib/session/ClientConsent.ts`): valid token **+** accepted consent for the current `agreement_version` **+ no later `revoke`**; a spent `reveal` token cannot be reused to join. **[§6.1 CRITICAL]**
- Pure `authorizeRoomToken(...)` decision function (reuses `evaluateLinkReveal`): returns the **server-derived** `identity` + `grants` to sign, or a denial — signing abstracted behind an interface (no LiveKit dep yet). **[§6.1 CRITICAL: identity/grants server-side]**
- Unit tests (the existing `lib/session/__tests__` pattern): no-accept→deny · accept→allow · revoke→deny · stale-version→deny · spent-reveal-token→deny-for-join.
- Governance: class-a (`lib/session/`) → covenant gate → founder merge. No deploy (pure logic).

### PR2 — LiveKit service + lockdown (infra) · *enables room/integration proofs; deploy-gated*
- Add a single-node `livekit` service to `docker-compose.production.yml`: embedded TURN on **443 (Option B)**, **HTTP API bound `127.0.0.1:7880`** (not `0.0.0.0`), Caddy WSS route for signaling restricted to the room path. **[§6.1 CRITICAL]**
- `LIVEKIT_API_KEY/SECRET` wired server-only; never logged. **[§6.1 CRITICAL]**
- **Webhook receiver** with **signature verification** (reject unsigned/forged lifecycle events). **[§6.1 HIGH]**
- Confirm + document **Caddy TURN/WSS passthrough mode**; TLS terminates at Caddy (our host). **[§6.1 MED]**
- Proof: `livekit-server` healthy; admin API unreachable externally; webhook rejects unsigned.
- Governance: class-b infra (compose/Caddy) + **security-auditor pass** + gated deploy (infra in source, #455 discipline).

### PR3 — Room-token mint endpoint · *integration proof*
- `POST /api/session/join/[token]/room-token` (client) + the practitioner mint path (session-hardened, ownership-checked). Re-runs PR1's `authorizeRoomToken` against the **live ledger at entry**; signs a short-TTL (**15-min join window** §9.2) LiveKit JWT with server-set identity + grants. **[§6.1 CRITICAL]**
- **Rate-limit per `(session_id, client_id)` ≤5/min**, log hits. **[§6.1 HIGH]**
- Sanctuary grants: **exclude `screen_share`** (`canPublishSources`), no egress. **[§6.1 HIGH]**
- `maxParticipants: 3` at room-create **[§6.1 MED]**; room metadata = `{sanctuary, sessionId}` only **[§6.1 LOW]**.
- Integration proof (extend the `prod-lobby` / `prod-track2` in-container pattern): accept→token · **revoke→no *new* token** (this proves *next-join* denial only; killing a *live* connection mid-session is PR5's deliverable — do not read this rung as "revocation fully handled") · stale→no token · rate-limit hit.
- Governance: class-a (`app/api/session/`) → covenant gate → founder merge → **security pass** → gated deploy.

### PR4 — Live room UI + Lobby "Enter" wiring · *room proof + multi-device proof*
- Replace `SovereignLobby`'s `soullab` Phase-3 placeholder: on Enter → mint token (PR3) → connect to the LiveKit room.
- Room UI: 2-person video, presence indicators, session timer, always-visible agreement status bar, Sanctuary/recording badges, **visible Scribe indicator** (subscribe-only, "off" under Sanctuary), session completion screen.
- **Sanctuary copy (audit-surfaced orphan, now owned here)**: wire the ratified §0.5 Sanctuary statement for the `soullab` provider into `SessionAgreements.ts` (control-not-absence) and **bump `CURRENT_AGREEMENT_VERSION`** *before* soullab is offered to users — shipping the deferred-P2P "never touches our servers" wording under an SFU would be a false sovereignty claim. **[design §6.1 C-copy / Claim Discipline]**
- Proof: real 2-person room on the LAN (room proof) → practitioner + client on separate devices/networks (multi-device proof).
- **Then: cellular proof** — client on cellular (the external rung, the human's to run).
- Governance: class-a-adjacent UI → covenant gate → founder merge → gated deploy.

### PR5 — Scribe + Sanctuary structural enforcement + mid-session revocation · *security-critical*
- **Scribe**: subscribe-only server identity → STT → existing scribe/supervision store, **consent-gated**; visible indicator; **absent entirely under Sanctuary**. **[§6.1 HIGH structural]**
- **Mid-session revocation — owns the *live-connection* half of §6.1 C1** (PR1 owns the *next-join gate* half; together they are the whole of C1): ledger revoke → **`RemoveParticipant`** + the discard-vs-keep-until-now prompt (§3.4). Invalidate the in-flight token (Admin API `RevokeTokens` / per-room secret rotation) **or** document a bounded race window. The **maia app server** holds the LiveKit admin credentials and reaches the localhost-bound admin API (7880) over the same host (§6.1 C2b) — name this path explicitly so it isn't a late "the app can't reach the locked-down API" surprise. **[§6.1 CRITICAL]**
- Webhook-driven lifecycle (empty room → `closing`) only on **verified** webhooks. **[§6.1 HIGH]**
- Proof: a Sanctuary session leaves **no transcript/recording** (DB-verified); revoke kicks the participant + prompts.
- Governance: class-a → covenant gate → founder merge → **security pass** → gated deploy.

### PR6 — Completion → continuity per agreement · *bridges Phase 4*
- Room "Complete Session" → the closing ritual (kept / not-kept, from `keptAndNotKept`) → retention writes **per `consent_flags`** (Sanctuary = date + duration only).
- Proof: completion writes only what the agreement permits, **per mode** — discrete checks that **Reflection** discards the raw transcript after distillation (summary/themes kept only), **Learning** keeps recording + transcript, and **Sanctuary** writes date + duration only. (Closes the §8 Room→Completion boundary for *all* modes, not just Sanctuary.)
- Governance: class-a → covenant gate → founder merge → gated deploy.

### Final — production proof
Gated deploy of the assembled feature + an in-container proof script (the `prod-*-proof.js` pattern, with **valid-hex** marked test data + resilient cleanup) + caddy-route 200 + the cellular rung. Then, and only then, may the "sovereign video" claim be made — and even then as *"media on our own server, nothing kept beyond the agreement,"* not raw-P2P (§0.5).

---

## What this plan does NOT authorize

No code, no dependency added, no LiveKit service deployed, no `.env`/network change. Each PR above is a **separate explicit founder go**; the build does not start as a batch. The plan exists so that when a build does start, it is sequenced, gated, and security-baked — not improvised.
