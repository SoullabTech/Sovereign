# Session Room Video & Consent Spec

- **Status**: Designed — not built. Decisions ratified 2026-06-14; Phase 1 build scoped in `SESSION_ROOM_VIDEO_PHASE1_SCOPE_2026-06-14.md`. (Per Marketing Claim Discipline: Live = nothing yet; Designed = this document; Vision = native sovereign video as default.)
- **Date**: 2026-06-14
- **Direction**: Kelly Nezat
- **Governs**: practitioner ⇄ client live sessions inside Studio Session Room
- **Canon**: MAIA Oath, Sovereignty Invariants, Attention Doctrine, Sanctuary Mode invariants, Marketing Claim Discipline

---

## 0. Core principle

Session Room is the host. Video is a module inside it — not a separate product that later integrates. Most telehealth (Zoom, Meet, Doxy) puts video at the center and treats relationship, consent, notes, and continuity as attachments. MAIA inverts this: the session container is primary; the video stream is one component of it.

Consequence: this is a much smaller build than a standalone video product. The relationship model (`practitioner_clients`), consent concepts (Sanctuary), scribe, continuity, and the Session Room shell already exist — roughly 70–80% of the structure. What is missing is (a) the practitioner session workflow around a call and (b) the real-time media layer (WebRTC + signaling + TURN), and (b) is deferred behind (a).

---

## 1. Layered architecture

```
Session Room (host)
├── Presence Layer        video · audio · chat
├── Consent Layer         sanctuary · recording · transcript · memory
├── Scribe Layer          markers · reflections · summary · follow-up
├── Continuity Layer      client history · themes · prior sessions · agreements
└── Practitioner Workspace notes · timeline · resources · MAIA
```

The Consent Layer governs the Presence Layer's outputs and what the Scribe/Continuity Layers are permitted to retain. Nothing in Scribe or Continuity may persist anything the active agreement forbids.

---

## 2. Same room, different states

Not a separate lobby. One room, four states:

```
Session Room: Pre-session → Active Session → Session Closing → Continuity Record
```

- **Pre-session** — choose the session agreement, equipment check, both-present signal, both agree, begin.
- **Active session** — presence + workspace; the agreement status bar is always visible.
- **Session closing** — the ritual: what was kept vs not kept, confirm, close.
- **Continuity record** — the relationship thread (persists before, during, after).

State lives on the session record (`room_state`). The same URL transitions states; continuity is never broken by leaving and re-entering.

---

## 3. Session agreements (the consent primitive)

Different sessions need different agreements. Instead of one mode with scattered toggles, the practitioner and client choose a named agreement at entry. This is the load-bearing sovereignty feature — for a platform built on relationship and sovereignty it may matter more than the video technology.

### 3.1 Retention matrix

| Agreement | Video | Recording | Transcript | Scribe | Memory | Retained |
|---|---|---|---|---|---|---|
| **Sanctuary** | live only | no | no | no | no | date, duration only |
| **Notes** (default) | live | no | no | private notes | practitioner-scoped | notes, markers, follow-ups |
| **Reflection** | live | no | temporary (in-session, then discarded) | active | summary + themes | summary, themes, action items |
| **Learning** | live | yes | yes | active | yes | recording, transcript, summary |
| **Custom** | live | toggle | toggle | toggle | toggle | per choices |

Notes on the matrix:
- **Sanctuary** implements the Sanctuary Mode invariants exactly: no content retention, no training data, minimal metadata (date + duration), absolute boundary (nothing can be saved/extracted/inferred even on request mid-session).
- **Reflection** uses a *transient* transcript: processed in-session to produce the summary/themes, then the raw transcript is discarded. No raw recording is ever kept. (Pattern: transient processing → durable distillation → raw discarded.)
- **Learning** (supervisory/educational) is the only preset that keeps raw recording + transcript, and requires explicit mutual consent.
- **Default = Notes.** Sanctuary remains opt-in (Sanctuary invariant #5: default off). Notes is the likely working default for most practitioners.
- **Memory** column = whether anything enters the client's continuity record / MAIA long-term store. Notes keeps practitioner-scoped notes only (not MAIA semantic memory of session content).

### 3.2 The agreement is part of entering, not a hidden setting

```
Pre-session
  Session type:  ○ Sanctuary  ○ Notes  ○ Reflection  ○ Learning  ○ Custom
  [plain-language statement of what will / won't be kept]
  ☐ Both participants agree
  [ Begin session ]
```

During the session a visible status bar always shows the active agreement. Consent is never "something someone clicked once six months ago" — it is visible, current, and specific to the session happening now.

### 3.3 Plain-language statement generator

The system translates the resolved agreement into one sentence, frozen at consent time and stored on the session record. Examples:

- Reflection (Soullab Video): *"This session will create a summary and themes for your continuity record. No video is recorded. The live transcript is used only during the session and then discarded."*
- Sanctuary (Soullab Video): *"This session won't be remembered. The video runs directly between you and your client and never touches our servers. Only the date and duration are kept."*
- Custom: *"This session will create a summary and practitioner notes. No video recording will be stored."*

### 3.4 Mutual consent + mid-session revocation

- **Entry**: every agreement is mutually agreed before Begin. Recording (Learning, or Custom with recording on) requires explicit, separately-acknowledged both-party consent.
- **Downgrade** (toward less retention) — either party, instantly, forward-applying. Invoking Sanctuary mid-session stops all capture immediately and prompts: *discard everything from this session* (default, strongest) or *keep what was agreed until now, nothing further*.
- **Upgrade** (toward more retention, e.g., turning recording on) — requires fresh mutual consent, applies forward only, never retroactive. The status bar updates; both parties see the change.
- **Audit**: every agreement change is recorded (actor, from→to, scope, timestamp). Sovereignty requires an auditable trail.

---

## 4. Provider strategy & the sovereignty boundary

Bring-your-own-video first, sovereign video later. Do not force the choice. A practitioner setting selects the default; each session inherits or overrides it.

```
Video provider:  ○ Soullab Video  ○ Zoom  ○ Google Meet  ○ Doxy.me  ○ Custom link
```

### 4.1 The honest boundary (do not paper over this)

The pragmatic external-video path creates one real tension with the "no third party between users and their data" invariant. The resolution is to be precise about *what MAIA governs*:

| | Soullab Video | External (Zoom / Meet / Doxy / custom) |
|---|---|---|
| **Media transport** | sovereign — P2P, DTLS-SRTP encrypted, never touches your server or any cloud | third-party — governed by their policy, outside MAIA's control |
| **MAIA retention envelope** (notes, scribe, summary, memory, continuity) | sovereign | sovereign |
| **Sanctuary guarantee** | total (media + record) | partial — MAIA keeps nothing; the provider's policy is separate and must be named |

MAIA sovereignly governs *its own* retention envelope regardless of provider. The *media path* is sovereign only with Soullab Video. The plain-language statement must scope its guarantees accordingly and explicitly name the provider's separate policy for external video, e.g.:

- Sanctuary (Zoom): *"MAIA will keep nothing from this session except the date and duration. Your video runs on Zoom, which has its own recording and privacy policies we don't control."*

This honesty is itself a differentiator and is required by Marketing Claim Discipline. The external phase must never be marketed as "sovereign video" — it is "a sovereign session container around your existing video."

At the client gate this is enforced as two distinct statements — a MAIA retention agreement and an external provider notice — and the external video link is withheld until the client has accepted (see Phase 1 scope, Consent flow). The frozen statements plus `agreement_version` make every past consent auditable.

---

## 5. Data model (minimal additions, reuse-first)

Extend the existing session record (`scribe_sessions` / `sessions`), do not create a parallel store:

- `agreement_type` enum: `sanctuary | notes | reflection | learning | custom`
- `consent_flags` jsonb: `{ recording, transcript, summary, memory, video_archive }`
- `agreement_version` text — version of the agreement template the statements were generated from
- `agreement_statement` text — the MAIA-retention statement, frozen at consent
- `provider_notice` text — the external-provider notice shown at the client gate (null for Soullab Video)
- `consent_practitioner_at`, `consent_client_at` timestamptz — mutual consent record
- `video_provider` enum: `soullab | zoom | meet | doxy | simplepractice | custom`
- `video_link` text — for external providers
- `room_state` enum: `pre | active | closing | continuity`
- For Soullab Video: `signaling_room_id`; recording artifact persisted only if `consent_flags.recording`
- New table `session_consent_events` — append-only consent ledger: session_id, actor (practitioner|client), action (set|accept|refuse|change), agreement_type, agreement_version, consent_flags snapshot, prev_agreement_type, at. Metadata only, no session content. Covers initial consent, client accept/refuse, and mid-session changes.

Reuse as-is: markers/insights (`supervision_*`), session artifacts (`session_artifacts`), continuity (client history / `case_memories` / atoms), relationship link (`practitioner_clients`).

---

## 6. Sovereign media layer (Soullab Video — native phase)

- **1:1 = peer-to-peer WebRTC.** Encrypted media (DTLS-SRTP, always on) flows browser-to-browser; the server only brokers signaling. Media never touches your server or any cloud.
- **Signaling**: finish `app/video-server/server.js` (Socket.IO scaffold exists; ICE candidate exchange + peer offer/answer incomplete). Deploy as a service in `docker-compose.production.yml`.
- **TURN**: self-hosted `coturn` in Docker for NAT traversal when P2P is blocked. No third-party TURN.
- **Caddy**: add a WebSocket route for the signaling service (reuse the existing `@ws` upgrade pattern proven by the Nostr relay in `Caddyfile`).
- **Recording capture** (decision in §9): recommended peer-side capture, uploaded as an artifact only on consent — preserves "media never touches your server." For external providers, recording is theirs.
- **Group (3+)**: later, via self-hosted SFU (LiveKit or Jitsi). Out of scope for 1:1.
- **iOS / Capacitor**: WebRTC works in WKWebView with camera/mic usage strings + permission; external provider links open via system handler; signaling/force-dynamic routes need the Capacitor exclusion handling (see CLAUDE.md traps).
- **No AI provider involved**: video transport needs none — it sidesteps the cloud-AI question entirely.

---

## 7. Reconciled roadmap

Merges the feature axis (Live → Intelligence → Continuity) with the provider axis (external → native). Fastest adoption first; long-term architecture uncompromised.

- **Phase 1 — Container around external video** (mostly wiring existing pieces). Video provider setting + per-session link; the session-agreement entry gate + visible status bar; wire the existing scribe / notes / continuity around the call. No new media infrastructure. *This is the 70–80%-already-built path.*
- **Phase 2 — Session intelligence.** Live markers + timestamps during the call; consent-state enforcement; the closing ritual; continuity-record surfacing (prior insights, themes, agreements).
- **Phase 3 — Soullab Video (native).** WebRTC 1:1 + self-hosted signaling + TURN + consent-aware recording, offered as a provider *option*. Sanctuary now becomes *fully* sovereign (media included).
- **Phase 4 — Native default.** Soullab Video becomes the recommended default; external providers remain supported.

---

## 8. Studio Camera demotion

`app/studio/camera/page.tsx` is a local mirror + local recorder (`audio:false` at :116; Record downloads a local `.webm` at :166; a hardcoded personal Camo device id at :33 that won't generalize). It becomes the **pre-session equipment check**, not the session experience. Reusable pieces carried forward: device enumeration, quality/fps constraints, fullscreen, recording indicator, connection panel. Camo stays as one selectable camera source, never the architecture.

---

## 9. Ratified decisions (Kelly 2026-06-14)

All five ratified as recommended. §4 honest split blessed as written.

1. **Recording capture model** — RATIFIED: peer-side capture first (preserves media-never-touches-server; applies to the native phase).
2. **Default agreement** — RATIFIED: Notes Session is the default.
3. **Mid-session Sanctuary** — RATIFIED: discard, with an explicit keep-option presented before crossing.
4. **External-video honesty framing** — RATIFIED: never market external video as sovereign video; the plain-language statement must name the provider's separate policy.
5. **Notes Session scope** — RATIFIED: practitioner-only for now (not MAIA semantic memory), unless Reflection/Learning.

**Product line (ratified)**: *"With external video, MAIA can keep the session memory sovereign. It cannot make the video provider sovereign."*

---

## 10. Doctrine checks

- **Attention Doctrine** — leaves the interior space undisturbed (the person controls what is witnessed); justifies its presence (consent is load-bearing, not engagement); deepens attention (calm room, one workspace panel at a time). Pass.
- **Sovereignty Invariants** — increases agency (explicit per-session agreement); pushes life outward (supports the real human relationship rather than substituting for it); reduces psychological centrality (MAIA is a scribe/reflection aide inside the practitioner–client relationship, not its center). Pass — provided Phase 3 MAIA reflection support assists the practitioner and never diagnoses or displaces.

---

## 11. What this spec does NOT authorize

Designed, not Live. No "sovereign video" claim until Soullab Video (Phase 3) ships and is verified. The external-video phases are "a sovereign session container around your existing video," not sovereign video. Center of gravity today: Live = nothing built; Designed = this document; Vision = native sovereign default.
