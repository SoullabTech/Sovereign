# Session Room Phase 3 — LiveKit Room: Design & Scope

- **Status**: **Finalized design — the five founder decisions are CLOSED (Kelly 2026-06-15; see §9).** This document answers the architecture/security/lifecycle/governance questions so that what follows is a *buildable architecture*, not a collection of implementation ideas. Next: security review of this finalized design → implementation plan → build behind the §7 gates. **No code or infra is authorized by this doc; build begins only on a separate explicit founder go.**
- **Date**: 2026-06-15
- **Direction**: Kelly Nezat
- **Depends on (Live)**: Phase 1 consent gate (`#451`), Phase 2 Sovereign Lobby (`#456`), write-time link hardening (`#457`) — all merged + deployed + prod-proven.
- **Supersedes**: the raw-WebRTC P2P signaling scaffold in `app/video-server/` (`@spiralogic/video-server`, socket.io) — see §1.6.
- **Canon**: MAIA Oath, Sovereignty Invariants, Attention Doctrine, **Sanctuary Mode invariants**, Marketing Claim Discipline, "self-hosted by design / no third party between users and their data."

---

## 0. Starting point (what already exists)

The consent/identity spine is built and live. Phase 3 reuses it; it does not rebuild it.

- **`scribe_sessions`** carries the agreement (`agreement_mode`, `consent_flags`, `agreement_version`, frozen statements, `video_provider`, `video_link`, `video_link_reveal_allowed`, `room_state ∈ {pre, active, closing, continuity}`).
- **`session_consent_events`** — append-only consent ledger (the gate's source of truth).
- **`session_join_tokens`** — opaque, sha256-hashed client join token bound to `(session_id, client_id, agreement_version)`.
- **`lib/session/ClientConsent.ts`** — pure reveal/decision logic (`evaluateLinkReveal`, `evaluateDecision`, `validateJoinToken`). **The reveal gate.**
- **`lib/session/SessionAgreements.ts`** — agreement model, retention profiles, `validateVideoLink` (https-only).
- **Sovereign Lobby** (`components/session/SovereignLobby.tsx`) — device check + retention display + "Enter session"; today the external/`soullab` Enter is a placeholder.
- **No LiveKit dependency exists in the tree.** This is greenfield for the media layer.

**The load-bearing continuity principle (do not break it):** today the gate reveals an *external URL* only after a client `accept` of the current `agreement_version`. **Phase 3 changes only *what is revealed* — a LiveKit room token instead of a URL — not *the gate itself*.** `evaluateLinkReveal` remains authoritative.

---

## 0.5 The central decision and its honesty boundary (read before §1)

**Self-hosted LiveKit, never LiveKit Cloud.** LiveKit Cloud would place a third party in the media path, which directly violates the non-negotiable *"No third party sits between users and their data"* and *"self-hosted by design."* The LiveKit-first decision (`spec §12`) meant **use LiveKit's open-source server + SDK so we don't hand-roll WebRTC signaling — and self-host it** — it did **not** mean adopt the managed cloud.

**The precise media-path claim (Marketing Claim Discipline).** LiveKit is an **SFU** (Selective Forwarding Unit): even a 2-person call relays media *through the server*, not browser-to-browser. So Phase 3's honest claim is **not** the raw-P2P "media never touches any server" of the deferred §6 design. The three tiers, stated plainly:

| Media path | Property | Status |
|---|---|---|
| Raw WebRTC P2P (spec §6) | media never touches *any* server | deferred (behind LiveKit) |
| **Self-hosted LiveKit SFU (Phase 3)** | media touches **only our own server**, relayed ephemerally, never recorded unless consented | **this design** |
| LiveKit Cloud | media flows through a third party | **rejected — violates canon** |

**Sanctuary under an SFU therefore means:** media transits our SFU but is **never recorded, never transcribed, never persisted** — relayed and dropped. That is a strong, sovereign guarantee, but it is *not* the absolute "touches no server at all" of P2P. The plain-language Sanctuary statement for `soullab`/LiveKit must claim *control of* the media path, **not** *absence from* it. The *"never touches our servers"* framing (this spec's deferred-P2P examples, `SESSION_ROOM_VIDEO_SPEC §3.3`) must not be used for the LiveKit path; and the live `soullab` Sanctuary statement in `SessionAgreements.ts` — today the generic preset with no provider notice — must be made **explicit** with the ratified copy below when soullab ships (with a `CURRENT_AGREEMENT_VERSION` bump). This is owned by an implementation PR (tracked as §6.1 finding **C-copy**), not left implicit.

**Ratified Sanctuary copy for the LiveKit / `soullab` path (Kelly 2026-06-15)** — use this when LiveKit ships; it replaces the deferred-P2P wording in `SessionAgreements.ts`:

> This session runs through Soullab-controlled infrastructure.
> Nothing is recorded, transcribed, summarized, or remembered.
> Only minimal operational metadata is retained.

Technically true under an SFU and sovereignty-aligned: it claims *control*, not *absence*, of the media path, and is precise about the little that is kept.

---

## 1. LiveKit architecture

### 1.1 Self-hosted vs Cloud — DECIDED: self-hosted
Per §0.5. `livekit-server` (open source, single Go binary / Docker image) added as a new service in `docker-compose.production.yml` on minisforum, alongside the existing 18 services.

### 1.2 Service placement
- **v1 (2-person beta): same host (minisforum).** SFU media for a handful of concurrent 2–3-participant rooms is light; co-locating avoids new hosts and keeps the sovereign single-box model.
- **Trigger to split out a dedicated media host:** sustained concurrent rooms or CPU/bandwidth contention with the app/DB. Named gate, not now.
- LiveKit single-node needs **no Redis** for 2-person v1 (Redis is for multi-node routing). Keep it single-node.

### 1.3 Network requirements — the real new surface
LiveKit needs three channels:
- **Signaling**: WSS (TCP) — can route through Caddy (reuse the `@ws` upgrade pattern already proven by the Nostr relay in `Caddyfile`).
- **Media**: WebRTC, which prefers a **UDP port range**. This is the one genuinely new network requirement — today the router forwards only **80/443 TCP** to minisforum.
- **TURN**: for clients behind restrictive NAT/firewalls.

**Key decision (flag for Kelly):**
- **Option A — open a UDP range** (e.g. 50000–60000/UDP) on the router → minisforum. Best media quality. Cost: a new router port-forward + a new inbound UDP surface (firewall/security review item).
- **Option B — TURN/TLS over 443 only** (LiveKit configured to force media over TCP/TLS via its embedded TURN on 443). **No new router forward** (reuses the existing 443 path), smallest network change, simplest firewall story. Cost: higher latency / lower quality, all media multiplexed on 443.
- **DECIDED (Kelly 2026-06-15): Option B** (sovereignty + minimal infra change + the LAN-IP-drift trap already documented for 443). Measure call quality with real 2-person sessions; open a UDP range (Option A) only if CPU/bandwidth/call-quality evidence requires it. This keeps the *network boundary* unchanged for v1.

### 1.4 TURN / STUN strategy
- Use **LiveKit's built-in TURN** (and its embedded ICE/STUN) — **no third-party STUN/TURN** (no Google STUN, no Twilio). Self-hosted end to end. STUN is only NAT reflection (low sensitivity), but the sovereign default is to host it ourselves.

### 1.5 Scaling assumptions
- **2-person sessions first**, plus the Scribe participant ⇒ **≤3 participants/room**.
- Single LiveKit node; no autoscaling. Beta-scale concurrency only.
- Out of scope: group (4+), breakout rooms, simulcast tuning beyond defaults.

### 1.6 The abandoned scaffold
`app/video-server/` (socket.io signaling for hand-rolled WebRTC) is **superseded** by LiveKit-first and should be removed or clearly quarantined when Phase 3 lands, so there is one media path, not two. (Cleanup item, not load-bearing.)

---

## 2. Room & token model

### 2.1 The three distinct credentials
1. **Session join token** (exists, `session_join_tokens`): opaque, hashed, identifies *which session + which client*. Authenticates the client to the join/consent/Lobby surface. Longer-lived (min(7d, session start)).
2. **Consent** — *not a token, a ledger state*: a client `accept` event for the **current** `agreement_version`, with no later `refuse`/`revoke`. This is the gate (`evaluateLinkReveal`).
3. **LiveKit room token** (NEW): a short-lived **JWT** signed with the LiveKit API key/secret, encoding `room` (the session id), `identity` (practitioner/client/scribe), and grants (`canPublish`, `canSubscribe`, never room-admin). Required by the LiveKit SDK to connect.

### 2.2 Issuance timing — the gate, restated for tokens
- **Never** mint the LiveKit token at invite, and **never** at consent-accept (no pre-minting).
- **Mint at room entry**, from the Lobby's "Enter session", via a new endpoint (e.g. `POST /api/session/join/[token]/room-token`) that **re-runs `evaluateLinkReveal` against the live ledger** and only then signs a LiveKit JWT. Same fail-closed gate as the URL reveal.
- The practitioner side mints through its own authenticated path (session-hardened `getMemberIdFromRequest`, ownership-checked), not the client join token.

### 2.3 Expiration & rejoin
- **JWT TTL: short**, scoped to a join window (proposed: minutes-to-enter; LiveKit keeps the connection alive after join, so a short join-TTL does not drop an active call). Exact TTL = a decision (proposed 15 min join window; revisit).
- **Rejoin** re-calls the room-token endpoint → **re-checks consent every time**. Consent revoked between sessions ⇒ no new token ⇒ no rejoin.
- **Mid-session revocation**: because the token is already spent on a live connection, revocation must also **forcibly remove** the participant via the LiveKit **server API** (`RemoveParticipant`) and stop any egress/scribe. (See §4, §6.)

### 2.4 Sanctuary in the token/room
- Recording is **server-side egress**, not a client grant — so Sanctuary is enforced by the **server never starting egress** and the **Scribe process never attaching**, plus a `sanctuary` flag in LiveKit **room metadata** that the server honors. The client token cannot turn recording on or off; that authority stays server-side and consent-bound.

---

## 3. Session lifecycle

Builds on `room_state ∈ {pre, active, closing, continuity}` plus the live-room dimension. The same session id is the LiveKit room name throughout.

| State | Who can enter | What is stored | What is visible | Allowed transitions |
|---|---|---|---|---|
| **Invite** | practitioner creates; client holds a join token | session + agreement (frozen statements, version); join token (hashed) | nothing to the client until they open the link | → Consent |
| **Consent** | client (token-auth) | consent ledger events (set/accept/refuse) | the two agreement statements; **no room token, no link** | → Lobby (on accept) · → refused (terminal for version) |
| **Sovereign Lobby** | client (accepted) / practitioner (authed) | nothing new (device check is local-only) | retention summary, Sanctuary state, device preview, Enter | → Room (mint token) · back to Consent if agreement re-set (new version) |
| **Enter Room** | only with a freshly-minted LiveKit token (ledger re-checked) | room-join event (metadata only) | "joining" | → Active |
| **Active Session** | participants holding valid tokens (practitioner, client, Scribe per agreement) | **only what the agreement allows** (see §4); media relayed, not stored | live A/V, participant list incl. visible Scribe, agreement status bar, session timer, Sanctuary/recording badges | → Closing |
| **Complete Session** | participants | the closing distillation the agreement permits (summary/notes); raw media/transcript discarded unless `learning` | "what was kept / not kept" ritual | → Continuity |
| **Continuity** | practitioner (relationship thread) | continuity record per agreement (Sanctuary = date+duration only) | prior-session thread | (persists) |

**Invariant across all states:** nothing in any later state may persist anything an earlier accepted agreement forbids.

---

## 4. Sanctuary semantics in-room (explicit, not implied)

| Capability | Sanctuary | Notes (default) | Reflection | Learning |
|---|---|---|---|---|
| Live A/V (SFU relay) | ✅ (ephemeral, not stored) | ✅ | ✅ | ✅ |
| **Recording (egress)** | ❌ never started | ❌ | ❌ | ✅ (mutual consent) |
| **Transcript** | ❌ none | ❌ | temporary → distilled, raw discarded | ✅ kept |
| **Scribe participant** | ❌ not attached | private notes only | ✅ attached | ✅ attached |
| **Metadata retained** | date, duration, consent events **only** | + notes/markers | + summary/themes | + recording/transcript |
| **Completion behavior** | timeline entry: occurred + duration, **no content** | notes saved | summary distilled, raw dropped | recording+transcript saved |

**Enforcement is server-side and structural, not UI-only:** Sanctuary ⇒ the server (a) never starts LiveKit Egress, (b) never attaches the Scribe subscriber, (c) sets room metadata `sanctuary=true`, (d) writes only the minimal-metadata row. Mid-session **downgrade to Sanctuary** stops any egress/scribe immediately and offers the discard-vs-keep-until-now choice (spec §3.4). This realizes Sanctuary Mode invariant #6 (absolute boundary) at the media layer.

---

## 5. Visible Scribe design

**Principle: the Scribe is a *visible participant* in the room model, not a hidden service.** If MAIA is listening, both people can see that it is.

- **Presence (DECIDED Kelly 2026-06-15)**: a **subscribe-only server identity** surfaced as a **visible indicator** — a clear "Scribe — transcribing / off" state in the UI — **not a full human-equivalent participant seat/tile**. Honestly visible to both parties; never a silent server tap. (Server identity so it can subscribe to audio; rendered as an indicator, not a person.)
- **Permissions**: **subscribe-only** (`canSubscribe: true`, `canPublish: false`) — it receives audio to transcribe and never sends media. It cannot record media itself (that's egress, separate and consent-bound).
- **Transcript ownership**: governed by the agreement's retention profile — practitioner-scoped for Notes/Reflection; the member remains the verifier of meaning (`meaning sovereignty`). Continuity entries follow `consent_flags`.
- **Sanctuary behavior**: the Scribe **does not join at all** under Sanctuary; the participant list shows no Scribe and the status bar says "Scribe off — Sanctuary."
- **UI placement**: a distinct, non-video tile / row in the participant strip with an explicit label and live state, plus reinforcement in the always-visible agreement status bar. It must read as presence, not surveillance (Attention Doctrine).

---

## 6. Security review (before implementation)

| Risk | Mitigation in this design |
|---|---|
| **Room hijacking** | Room token minted only via the ledger gate (`evaluateLinkReveal`); room name = session id but a valid JWT signed with our secret is required to join; tokens short-lived, identity-bound. |
| **Token leakage** | LiveKit JWT short-TTL, minted at entry, scoped to one room + identity + minimal grants; never logged; never in a shareable URL (delivered to the authenticated client, not embedded in the join link). Join token stays hashed-at-rest. |
| **Practitioner/client impersonation** | Practitioner path is session-hardened (`getMemberIdFromRequest` + practitioner ownership check); client path is the bound join token + accepted-consent ledger; LiveKit `identity` set server-side from the authenticated principal, never client-supplied. |
| **Screen-share permissions** | A grant, default off; enabled per role/agreement; visible to both parties; never silent. |
| **Rejoin attacks** | Each (re)join re-runs the consent gate + re-mints; revoked consent ⇒ no token; mid-session revocation ⇒ `RemoveParticipant` server-side. |
| **Session expiration** | Short JWT TTL; room auto-closes on empty + a max-duration; expired tokens cannot mint a connection. |
| **SFU as a new trust point** | The SFU is *ours* (self-hosted) — but it is now in the media path; secure the LiveKit API key/secret (server-only env), restrict the LiveKit admin API to localhost/Tailscale, and never expose the room-create API to clients. |

A dedicated security pass (e.g. `security-auditor`) on the implementation PR is a gate (see §7), mirroring the #456/#457 discipline.

### 6.1 Pre-implementation security review (2026-06-15) — findings folded in

A `security-auditor` threat-model pass on this finalized design confirmed the **consent gate is sound** (mint-at-entry + live ledger re-check; reuse of `evaluateLinkReveal` correct) and surfaced these gaps — now **requirements** carried into `SESSION_ROOM_PHASE3_IMPLEMENTATION_PLAN_2026-06-15.md`:

- **[CRITICAL] Distinct `join` token purpose + mint→present race.** `validateJoinToken` currently allows a `status='used'` token for the `reveal` purpose. Add a separate `'join'` purpose that also requires *no later ledger `revoke`*; on revocation, invalidate the in-flight LiveKit token (Admin API `RevokeTokens` / per-room secret rotation) **or** document a bounded race window. A spent reveal-token must not be reusable to join.
- **[CRITICAL] LiveKit secret + admin-API lockdown (deployment gate, not an assumption).** API key/secret never logged / never in token payload or room metadata; `identity` + `grants` set from the **server-side** authenticated principal only (never the request body); bind `livekit-server` HTTP API (7880) to `127.0.0.1` in compose and restrict to Tailscale via Caddy.
- **[HIGH] Sanctuary leak paths closed structurally.** Exclude `screen_share` at the **token** level (`canPublishSources`) for Sanctuary; server checks the `sanctuary` room-metadata flag before registering any egress-capable hook; raw media refs never leave the room renderer. (Client-side `MediaRecorder` is an environment threat the server can't undo — token-level + structural control is the only guard.)
- **[HIGH] Rate-limit the room-token mint endpoint** per `(session_id, client_id)` (≤5/min); log hits as security events (anti-DoS on the SFU).
- **[HIGH] Authenticate LiveKit webhooks.** Verify the webhook signature before acting on any lifecycle event — a spoofed `room_finished` could prematurely advance to `closing` and trigger the retention write.
- **[MED] `maxParticipants: 3` at room-create** (practitioner + client + Scribe); reject extra joins gracefully.
- **[MED] Option B TLS termination.** Confirm the Caddyfile TURN/WSS passthrough mode; document that TLS terminates at Caddy (our own host), not upstream.
- **[LOW] Room metadata = `sanctuary` bool + session id only** — no member/client/practitioner names or agreement text (all participants can read room metadata).
- **[LOW] Delete `app/video-server/`** (abandoned socket.io scaffold) as a **precondition** of the build — one media path, no undocumented signaling surface.
- **[CANON / Claim-Discipline — C-copy] Sanctuary copy swap for `soullab`/LiveKit.** When soullab ships, replace/augment the `soullab` Sanctuary statement in `SessionAgreements.ts` with the ratified §0.5 copy (control-not-absence) and **bump `CURRENT_AGREEMENT_VERSION`**. Shipping the deferred-P2P "never touches our servers" framing under an SFU would be a **false sovereignty claim**. (Traceability audit 2026-06-15 surfaced this as an orphan — it was a §0.5 mandate with no PR; now assigned to PR4.)

---

## 7. Deployment gates (proof requirements, defined before building)

```
Unit proof        token mint/gate logic, Sanctuary enforcement — pure tests, no infra
   ↓
Integration proof room-token endpoint re-checks the ledger; revoked ⇒ no token (like prod-lobby/track2 proofs)
   ↓
Room proof        a real 2-person LiveKit room connects on the self-hosted server (LAN)
   ↓
Multi-device proof practitioner + client on separate devices/networks (NAT traversal works)
   ↓
Cellular proof    client on cellular (the external edge — the rung that stays the human's to run)
   ↓
Production proof   gated deploy + in-container proof + caddy-route 200, per the Lobby/Track-2 playbook
```

Each rung must pass before the next. No rung is skipped silently (if one is deferred, it is named).

---

## 8. Boundary analysis — where the failures hide

*The lesson from Whisper, #455, and the Lobby cycle: the most important failures hide at the boundaries.* Each boundary below gets explicit design + a proof.

| Boundary | The failure that hides there | Design guard |
|---|---|---|
| **Consent → Lobby** | Lobby reachable without a current accept | Lobby renders only in `accepted` state; server re-checks ledger |
| **Lobby → Room** | room token issued without a fresh consent re-check | mint endpoint re-runs `evaluateLinkReveal` at entry, not at accept |
| **Room → Completion** | media/transcript persists beyond what was agreed | egress/scribe attach is consent-gated; completion writes only `consent_flags`-permitted artifacts |
| **Completion → Continuity** | Sanctuary session leaks content into the continuity record | Sanctuary completion writes date+duration only; enforced server-side |
| **MAIA → LiveKit** | secret/admin-API exposure; media path trust | API secret server-only; admin API bound to localhost/Tailscale; SFU self-hosted |
| **Client → Practitioner** | impersonation / identity spoofing | identity set server-side from the authenticated principal; never client-supplied |
| **Sanctuary → Stored Memory** | the absolute boundary (Sanctuary invariant #6) breached at the media layer | structural: no egress, no scribe attach, minimal-metadata only — not a UI toggle |

---

## 9. Resolved decisions (CLOSED by Kelly 2026-06-15)

All five founder decisions are closed; the design above is finalized around them.

1. **Network — DECIDED: Option B (TURN/TLS over 443 first).** No new router forward for v1; open a UDP range only if CPU/bandwidth/call-quality evidence requires it.
2. **Room-token TTL / join window — DECIDED: 15 minutes.** Short join window; LiveKit keeps the connection alive after join.
3. **Scribe model — DECIDED: a visible indicator backed by a subscribe-only server identity** — not a full human-equivalent room seat. Honestly visible to both parties; minimal room plumbing.
4. **Host placement — DECIDED: same host (minisforum) for v1.** Split to a dedicated media host only on CPU/bandwidth/call-quality evidence.
5. **Mid-session revocation UX — DECIDED: server-side `RemoveParticipant`, then prompt discard-vs-keep-until-now**, aligned with the existing §3.4 mid-session Sanctuary rule.

---

## 10. What this doc does NOT authorize

Design only. No code, no dependency added, no LiveKit service deployed, no router/network change. No "sovereign video" claim until a self-hosted LiveKit room ships **and** is verified through the §7 ladder — and even then the claim is *"media on our own server, nothing kept beyond the agreement,"* not raw-P2P "touches no server." Implementation is a **separate cycle** that begins only on an explicit founder go, and lands behind the deployment gates + a security pass.
