# Session Room Video & Consent Spec

- **Status**: Phase 1 (Threshold — the consent gate) is **Live** on production (deployed + internally proven 2026-06-14). Phases 2–4 are Designed. **Amendment 2026-06-14 (evening): LiveKit-first** — see §12; the external-first sequencing in §4/§7 is superseded. (Per Marketing Claim Discipline: Live = the consent gate only; Designed = Lobby + LiveKit room + continuity; Vision = sovereign video as the default.)
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

> **Superseded by §12 (2026-06-14 evening): LiveKit-first.** The external-first sequencing below is no longer the plan — the v1 media layer is LiveKit (self-hostable), entered directly from the Sovereign Lobby so the session never hands off to a third-party app. External providers remain *supported* (the consent gate's provider abstraction + the §4.1 honesty boundary still apply) but are no longer the first phase. Read §4 as the provider-honesty reference; read §12 for the roadmap.

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

## 7. Roadmap (LiveKit-first — amended 2026-06-14 evening)

Supersedes the external→native sequencing. Four phases; the consent gate is the foundation all of them build on.

- **Phase 1 — Threshold (Live).** Invitation links, consent ledger, session join tokens, practitioner + client agreement flow, ledger-gated join authorization. Deployed + internally proven 2026-06-14. The video link / room join is revealed only by acceptance of the current agreement version.
- **Phase 2 — Sovereign Lobby.** Before anyone enters: camera preview, mic preview, device selection, session information, privacy summary (the frozen MAIA-retention statement), recording status, transcription status, Sanctuary state, Enter Session button. Pure UI on top of the live consent gate; no new media infra. This is where Session Room first feels unlike Zoom/Meet.
- **Phase 3 — LiveKit Room.** LiveKit as the `soullab` provider: consent-accept yields a LiveKit room join token instead of an external URL. Two-person video, presence indicators, session timer, Sanctuary badge, recording badge, visible Scribe panel (a named participant, not hidden surveillance), session completion screen. Own the experience; do not operate a raw WebRTC/TURN stack on v1.
- **Phase 4 — Continuity.** After the session: summary, action items, follow-up links, Sanctuary completion state, memory integration — each gated by the accepted agreement's retention profile, wired into the existing scribe/continuity stores.

Native raw-WebRTC P2P (§6) is not abandoned — it moves *behind* LiveKit as a later sovereignty deepening (self-host LiveKit first; raw P2P/TURN only if/when owning the full stack is warranted).

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

No "sovereign video" claim until the LiveKit room (Phase 3) ships and is verified. Until then the live surface is "a sovereign consent container around the call," not sovereign video. Center of gravity today: **Live = the consent gate (Phase 1)**; Designed = Lobby + LiveKit room + continuity; Vision = sovereign video as the default.

---

## 12. LiveKit-first decision (Kelly 2026-06-14, evening)

**Decision:** commit to LiveKit-first and skip the external Zoom/Meet handoff phase. The reasoning is architectural, not technical:

- The consent gate already establishes sovereignty.
- The Lobby establishes presence and choice.
- A Zoom/Meet handoff breaks continuity at the exact moment the product becomes meaningful.
- LiveKit lets Session Room remain a single experience while avoiding the burden of building and operating a WebRTC stack from scratch.

**Product framing:** *"Practitioners conducting real sessions through Session Room."* The MVP that makes that true = Sovereign Lobby + LiveKit room + Sanctuary + visible Scribe + completion screen, built directly on the deployed consent gate.

**The consent-gate seam (already built for this).** The gate abstracts the provider (`video_provider`) and reveals on acceptance. Phase 3 implements a `soullab` provider where acceptance returns a **LiveKit room join token** instead of an external URL — the ledger gate, agreement versioning, frozen statements, and Sanctuary semantics carry over unchanged. The reveal keeps the same shape: *no room access until the current agreement is accepted.*

**Sanctuary in the Lobby is a state indicator, not a free toggle.** Retention is fixed by the agreement version the client already accepted. The Lobby **displays** the retention state (recording / transcription / Sanctuary) derived from that accepted agreement; it must not offer a control that silently changes retention after consent. Changing retention requires a fresh agreement version and fresh mutual consent (§3.4 upgrade/downgrade rules) — never a lobby switch. This keeps the consent gate, not the UI, authoritative over what is kept.

**External providers remain supported, not first.** The provider abstraction + the §4.1 honesty boundary still apply to any external session; LiveKit is simply the default path and the only one that keeps the experience single and the media sovereign-capable.
