# Native Session Room Video — Repository Audit

**Status:** AUDIT ONLY. No code written. Branch not yet created.
**Date:** 2026-08-04
**Measured against:** trunk `clean-main-no-secrets` @ `f9a7326f1`; `fix/session-room-dual-channel-attribution` @ `a2bf26baf`

---

## 0. Branch custody (established before any edit)

| Fact | Value |
|---|---|
| Session-start `gitStatus` claimed branch | `redesign/labtools-intent-first` — **STALE** |
| Actual HEAD of main checkout | `feature/labtools-redesign` @ `949ec00aa`, **64 dirty files** (Lab Tools lane) |
| Trunk | `clean-main-no-secrets` @ `f9a7326f1` |
| Attribution branch **actual tip** | `a2bf26baf` — **3 commits ahead of the pinned `32fd60e41`** |
| Attribution branch worktree | `/Users/soullab/wt-dualchan`, **clean (0 dirty)** — isolated, no cross-lane risk |
| `feature/session-room-native-video-foundation` | does not exist |
| Total worktrees | 150 |

### ⚠️ Finding B-1 — the pinned acceptance referent is stale

The directive pins the attribution acceptance object at `32fd60e41`. That SHA is an **ancestor**, not the tip. Three commits have landed since:

```
a2bf26baf fix(session-room): embed the integrity notice in the JSON report body too
dd2f4c453 fix(session-room): carry capture-integrity loss into review and export
6f6df9c5e fix(session-room): make capture loss visible instead of silently incomplete
```

All three are capture-integrity work — exactly the semantics the native-video slice must inherit. **The integration + acceptance walk must be run against `a2bf26baf`, not `32fd60e41`.** Walking the older SHA measures a referent that lacks the integrity-visibility behavior. (Instrument ↔ referent matching.)

No action taken on that branch. It remains untouched.

---

## 1–8. What already exists — ON TRUNK, committed, not another lane's work

The foundation is substantially further along than "coturn is live + P2P has worked."

### 1. Native P2P Session Room — EXISTS
`app/open/session-room/[roomId]/page.tsx`
- Real `RTCPeerConnection` (:157), offer/answer/ICE, `addTrack` (:160), `ontrack` (:162)
- **`getUserMedia({ audio: true })` only (:268)** — remote attaches to an `<audio>` element
- Role is **server-derived** from the participant row (:106-111), not the `?role` query param
- Renders the door identity: `door: consented ✓ (<displayName> · <role>)` (:111)

### 2. Signaling — EXISTS, consent-gated
`app/api/open/session-room/[roomId]/signal/route.ts` — SSE (GET) + publish (POST). Threshold proof required on **every** request; `authorizeRoomEntry` re-checked per call; threshold token stripped before publish (:111). Heartbeat as a real event, per-IP throttle.

### 3. coturn / ICE — EXISTS, live
`app/api/open/session-room/[roomId]/turn-credentials/route.ts` — ephemeral HMAC-SHA1 coturn REST credentials, 300s TTL, gated by the same room-entry check. Self-hosted `stun:`/`turn:` (udp+tcp) only — **no public STUN fallback**. Room proceeds host-candidate-only if coturn is unconfigured.

### 4. Threshold / guest identity / consent — EXISTS
- `lib/encounters/threshold.ts` — HMAC-SHA256 participant-scoped capability tokens; `mintThresholdToken(encounterId, participantId)`; stateless
- `lib/encounters/roomDoor.ts` — `authorizeRoomEntry()` returns **`{ encounterId, participantId, role, displayName }`**
- `app/open/threshold/[token]/page.tsx` — the consent-authoring surface
- `database/migrations/20260705000001_encounter_streams_and_consent.sql`:
  - `encounter_consent_events` — per-participant, `kind IN ('join','record','share')`, `text_snapshot` of the exact language shown, UNIQUE per (participant, kind)
  - `encounter_media_streams` — **per-participant media lane**, `consent_event_id` NOT NULL, plus a **DB trigger** (`enforce_record_consent_before_stream`) that rejects any stream whose consent event is the wrong kind or the wrong person

> **The directive's entire "Threshold" section is already satisfied on trunk.** Stable participant IDs, authenticated practitioner role, consented guest, declared display name — all present and reaching the room.

### 5. Media device controls — **ABSENT**
No camera, no `<video>` in the native room, no device enumeration, no on/off toggles, no mute. This is the real gap.

### 6. Recording pipeline — TWO COMPETING IMPLEMENTATIONS
- **`lib/encounters/recordingCoordinator.ts`** (trunk) — opens/closes per-participant lanes against `/api/open/threshold/<token>/stream`, handles orphaned lanes (:108). This is the *participant-owned* lane model the directive describes.
- **`lib/studio/RecordingContext.tsx`** (trunk, extended on dualchan) — mic + tab-audio via `getDisplayMedia`, video tracks dropped immediately; `MediaRecorder` → `audio/webm;codecs=opus`. This is the *mic-vs-tab* model for the Teams bridge.

### 7. Capture-integrity semantics — **DUALCHAN-BRANCH ONLY, not on trunk**
`lib/studio/captureIntegrity.ts` (207 lines), `lib/studio/audioChannels.ts` (123), plus tests — exist only on `fix/session-room-dual-channel-attribution`.

### 8. Reconnection — EXISTS
Same `peerId` across reconnects (:306-308), exponential backoff (:323-327), 45s staleness watchdog forcing reconnect on background-tab reaping (:334-341), `sigState` surfaced to the UI as `reconnecting`.

---

## 9–10. Cross-lane risk

| Risk | State |
|---|---|
| Main checkout is another lane's dirty tree (64 files, Lab Tools) | **Do not branch from it.** Branch from trunk `f9a7326f1` in a fresh worktree. |
| `wt-dualchan` | clean, isolated — safe |
| `fix/journal-session-identity`, `fix/session-creation-team-id` | other session-adjacent worktrees; no file overlap with `app/open/session-room` |
| Worktree `.env.docker` trap | new worktree needs `cp /Users/soullab/MAIA-SOVEREIGN/.env.docker <wt>/` before `npm run preflight` |

---

## Governance decisions required BEFORE code

### D-1 — Which room becomes canonical? *(blocking for recording; not for media)*
Two rooms exist with **different identity models and different constitutional promises**:

| | `app/open/session-room` (native) | `app/studio/session-room` (bridge) |
|---|---|---|
| Transport | P2P WebRTC + coturn | none — link-out to Teams/Meet |
| Identity | `encounter_participants` → participantId + displayName | practitioner session + declared names |
| Lanes | `encounter_media_streams` (participant-owned) | `audioChannels` (mic vs tab) |
| Integrity | none yet | `captureIntegrity.ts` (dualchan only) |

The directive says the native room becomes canonical. But the dual-channel attribution work — the acceptance object being protected — lives in the **bridge** room. These are not the same object. Ruling needed: does native video *inherit* the integrity semantics (requiring dualchan to merge first), or does it re-derive them against `encounter_media_streams`?

### D-2 — The native room currently *promises* no recording *(blocking)*
`app/open/session-room/[roomId]/page.tsx:12` and rendered on screen at `:388`:

> "No recording, no transcript, no memory."

The requested slice ends with "correctly attributed transcript lanes." **Adding recording to this room changes a displayed constitutional promise.** That is a founder ruling, not an implementation detail. Options: (a) recording becomes conditional on a per-participant `record` consent event (the schema already supports exactly this, and the DB trigger already enforces it); (b) native video ships recording-free and recording arrives as a separately-consented slice.

### D-3 — Integrity primitive duplication *(blocking for recording)*
`captureIntegrity.ts` is dualchan-only. Building native integrity on trunk duplicates it — the failure mode that lost lane B's test suite in the detector collision. Either merge dualchan first, or branch native-video off `a2bf26baf`, or explicitly defer integrity out of slice 1.

---

## Smallest coherent implementation plan

**Slice 1a — Native video media (UNBLOCKED by D-1/D-2/D-3)**
Add the video half to the existing consent-gated native room. No recording, no transcript ⇒ the room's current promise is preserved *verbatim*.

1. `getUserMedia({ audio: true, video: true })` with graceful audio-only degradation
2. Local preview `<video muted playsInline>` + remote `<video>` (replaces `<audio>`)
3. Camera on/off + mic mute (track `.enabled`, no renegotiation)
4. `enumerateDevices` picker for camera + mic, applied via `replaceTrack` on the existing sender
5. Typed permission-failure states (`NotAllowedError` / `NotFoundError` / `NotReadableError`) surfaced distinctly, not as a generic error
6. Participant name + role rendered on each tile from the **server-derived** door identity
7. Verify video survives the existing reconnect path without duplicate senders

**Reused, not rebuilt:** signaling, threshold/consent gate, coturn credentials, reconnect machinery, role derivation, participant identity.
**True gaps:** items 1–6 above. That is the whole slice.

**Slice 1b — Recording lanes + attribution (BLOCKED on D-1, D-2, D-3)**
Bind `recordingCoordinator` lanes to participant IDs, transcription request, attributed rows, integrity events.

---

## Verification ladder for slice 1a

- **Implemented** — media path exists
- **Unit-verified** — device-selection reducer, permission-error mapping, track-enable state, sender replacement identity, reconnect produces no duplicate sender
- **Integration-verified** — one person / two devices: both cameras + mics connect; forced TURN relay (`iceTransportPolicy: 'relay'`) succeeds; names correct on both tiles; reconnect restores video without duplicate tiles
- **Accepted** — a genuine practitioner + remote participant hold a real session

**Passing integration authorizes the acceptance walk. It does not satisfy it.**
