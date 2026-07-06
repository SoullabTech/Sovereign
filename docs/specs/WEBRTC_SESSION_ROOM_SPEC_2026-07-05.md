# In-Platform Recording Room — WebRTC Spec (Session Room / Team · Witness)

**Status:** DESIGN — not built. Scoped for review before implementation.
**Date:** 2026-07-05.
**Principle (load-bearing):** *Stop trying to overhear another platform. Create the relational
container inside ours.* Capturing another app's tab audio (`getDisplayMedia`) is inherently
fragile — a checkbox, tab-vs-window, browser-dependent. The correct answer is a call the two
people hold *inside* Session Room, where both audio streams are ours by construction. This is
architecturally cleaner and truer to Witness/Team work.

## The real primitive: an Encounter, not a microphone (reframe, 2026-07-05)

A real session exposed it: Session Room recorded only the practitioner's mic — it knew a
*microphone*, not the two people. The fix is not merely "capture the other side." The primary
object is the **Encounter between participants**; audio / transcript / summary / recognitions /
relational map are **views of one Encounter**, not separate artifacts. Converges with canon
(Encounter as Primitive; *relational before informational*).

Consequence for this build — the streams split into two **constitutional classes** that must never
be confused:
- **Per-participant streams (Practitioner / Client)** = **Evidence** — attributed, per-speaker,
  authored by the speaking. The WebRTC dual-track *is* what makes these structural (identity per
  source, not diarization guesswork).
- **Relational / Shared-Field layer** ("recognition," "repair," "the guide appeared," "meaning")
  = **authored, NOT detected.** A human marks these (the Team markers — Repair/Miss/Appreciation —
  are exactly this layer). MAIA must never *infer* "recognition occurred": that makes Session Room
  the interpreter of the relationship — the firewall breach the whole Relationship-Marker thread
  barred (R09 / authority-upward-only). Same word, opposite standing by who authored it.

Phase B therefore produces an **Encounter with attributed participant streams**, not "a
transcript." That is a constitutional change to the object model, not a cosmetic one.

### Refinement (2026-07-05): audio is evidence not source; Field is condition not artifact

Two mics is still media-centric if the Encounter isn't the source. **An Encounter is not the sum of
two audio streams — it is a relational event from which multiple forms of evidence arise.** The
Encounter is the single source; audio, transcript, speaker attribution, and recognitions are all
*evidence/views* derived from it. Recognitions are **candidate observations until a human accepts/
integrates them** — i.e. the Relationship-Marker lifecycle (proposed → adopted) at Encounter scope;
the two threads are **one architecture**, not two systems.

Three perspectives arise from one Encounter: **Practitioner** (guidance, intent — supervision
value), **Client** (experience, meaning-making — their journey), and **Relational** (a significant
silence, a shared realization, a shift in tone, mutual recognition, a recurring symbol, a completed
developmental movement) — the perspective no meeting software has, belonging to *neither*
participant. **"Belongs to the relationship" is NOT a license for MAIA to author it.** It means
**either participant may mark it, and a mark both make carries special standing** (mutually-authored
marker class). MAIA witnesses; it never concludes "recognition occurred."

**The Relational Field is the condition, not a branch of the Encounter.** Hierarchy: Relationship →
Relational Field → Encounter → traces. The Field is the lived context the Encounter emerges from; it
is **never a stored row.** Falsifier: *there is no `relational_field` record — if one appears, the
reification happened.* Only traces persist (audio, transcript, marked moments, reflections, memory).

**Feature test — governs every Phase B decision:** *Does it deepen the fidelity with which Soullab
can steward an Encounter?* Yes → it belongs. If it only adds a communication / recording / AI feature
without serving the Encounter, it belongs elsewhere. (Encounter-scoped form of the Field Architecture
Feature Test.)

## Scope
- **2 people only** (Team, Witness). Peer-to-peer WebRTC — **no SFU**. (3+ or server-side
  recording would later need a self-hosted SFU, e.g. LiveKit — explicit non-goal now.)
- **Audio-only** for transcription (video optional later; not recorded).
- Replaces the meeting-tab-capture path as the audio **source**; reuses ~80% of the existing
  recording + Whisper pipeline downstream.

## Architecture
1. **Signaling** — a WebSocket route (new `/api/studio/session-room/signal`, or reuse the comms
   worker). Exchanges SDP offer/answer + ICE candidates between the two peers. Room key = the
   `scribe_sessions.id` (or the pair's `relationship_spaces.id`). Steward opens; participant joins
   via a per-session join token (reuse the relationship-space invite/accept pattern).
2. **STUN/TURN — self-hosted `coturn` on minisforum** (sovereignty: no third-party media). STUN
   for reflexive candidates; TURN relay for symmetric-NAT fallback. New container in
   `docker-compose.production.yml`; ports 3478/5349 + a UDP relay range; short-lived TURN
   credentials minted server-side per session.
3. **Peer connection** — each browser publishes its mic track and receives the remote track. No
   media passes through our server in the P2P path (TURN only relays when NAT requires).

## Recording (the payoff)
- **Dual-track:** record the **local mic** and the **remote track** as *separate* tracks. Two
  tracks = **perfect speaker separation** (steward vs participant), strictly better than today's
  mix-and-guess. Each is a known, labeled speaker — no diarization guesswork.
- **Reuse the pipeline:** the same `AudioContext` + `MediaRecorder` chunking + WebM-header
  handling in `RecordingContext` already exists — we swap the *source* (two known tracks instead
  of mic+tab-capture) and keep the chunk → `/api/supervision/scribe` → Whisper path.
- **Transcription:** each track transcribed independently; merge by timestamp into one transcript
  with reliable speaker labels. Feeds the same review + markers UI.

## Constitutional
- **Both explicitly join → consent is structural** (not a checkbox about an offscreen app). The
  recording consent gate stays.
- Each participant's own MAIA, Sanctuary, and conversations remain theirs — the room records only
  the shared call. Stewardship holds the relationship, never a window into the other person.
- Team mode keeps **Session Support Off by default** (no referee) — unchanged.

## Verification debt closed AS PART of this (do not skip)
1. **recording-start against the canonical `scribe_sessions` schema** — last session the local dev
   DB was drifted (missing `container` / `memory_policy` / `consent_status`); the container CHECK
   migration `20260703000003` couldn't apply. Reconcile the schema, apply migrations, verify start.
2. **Admin browser E2E** of the full flow (join → talk → both tracks recorded → transcript).

## Phasing
- **A** — signaling + P2P audio call (two browsers hear each other via coturn). No recording.
- **B** — dual-track recording of the call.
- **C** — wire both tracks into the existing Whisper transcription + review.
- **D** — verify (schema/start + E2E). Keep the tab-audio path (now pre-flighted) as fallback
  until A–D are proven.

## Phase A / Transport Acceptance (strengthened, 2026-07-05)

Phase A does not prove "WebRTC works" (it does). It proves **Session Room can sustain an Encounter at
the transport layer.** Two layers of acceptance:

**1. Transport Acceptance (machine + observed):** practitioner joins · guest joins · both consent ·
both microphones active · practitioner hears guest · guest hears practitioner · latency acceptable ·
disconnect/reconnect clean · transport path measured (host/srflx/relay → decides coturn need).

**2. The Encounter Test (human — the real gate, un-automatable):** after transport passes, hold **one
genuine 10–15 minute practitioner conversation** — not a "hello." It surfaces what no smoke test can:
does silence feel natural, does reconnect disturb presence, does audio drift, can both people *forget
the technology*. The criterion is not "it connected" — it is: **did the technology disappear enough
that the relationship became primary?** That is a constitutional test, not a technical one, and no
harness can produce it — only lived use (cf. the Encounter Epistemic Verifier: PENDING until real
encounters).

**Phase A is complete only when both pass.** Only then does Encounter Stewardship (Phase B) begin.

## Phase A hardening — BUILT + VERIFIED (2026-07-05, same-machine scope)

Shipped in `app/open/session-room/[roomId]/page.tsx`, `app/api/open/session-room/[roomId]/signal/
route.ts`, `lib/webrtc/signalRelay.ts`:
- **Client reconnect, same peerId, exponential backoff (1s→10s)** — verified live: full dev-server
  restart mid-call; log showed `signaling lost — reconnecting in 1s/2s/4s`, then auto re-subscribe
  on the new process with the same peerIds and room re-formed via server re-announce.
- **P2P media survived the server restart** — `connection: connected` + `remote audible: yes`
  throughout the outage (no server in the media path). Client re-announce REBUILT the in-memory
  room on the fresh process — for the 2-party case this substitutes for a durable bus on restarts;
  the pg LISTEN/NOTIFY bus remains required for MULTI-INSTANCE only.
- **Visible signaling state** (`connected/reconnecting/off` row) + staleness watchdog (server pings
  every 15s as real events; >45s silence forces reconnect) — no silent dead streams.
- **Stale-abort race guarded** — old connection's abort after a same-peerId reconnect is ignored
  (`stale UNSUBSCRIBE ignored`), no spurious peer-leave (verified in isolation).
- **Healthy-media re-announce is a no-op** — no renegotiation when `connectionState === 'connected'`;
  dead PCs are rebuilt before re-offer/answer.
- **`connected via` fixed** — reads `candidateType` (host/srflx/relay), verified: `host ⇄ host`.

**coturn — DEPLOYED + RELAY PROVEN (2026-07-05).** Fixed the docker-bridge double-NAT
misdeployment (relay peers surfaced as 172.x and tripped coturn's own RFC1918 denied-peer rules):
coturn now runs `network_mode: host` on minisforum, `external-ip=32.219.7.166/192.168.0.104`
(PUBLIC/PRIVATE), `listening-ip=192.168.0.104`, narrow `allowed-peer-ip=192.168.0.104` (same-server
relay⇄relay only; all other RFC1918 denies intact), malformed fe80 denied-range corrected.
**Proof:** forced-relay (`iceTransportPolicy:'relay'`) loopback call from the Mac through minisforum:
`connected`, selected pair **relay(32.219.7.166:49192) ⇄ relay(32.219.7.166:49174)**, ~11KB audio
relayed; reproved after restart. Scope: client was on the same LAN — media reached the *public* IP
and returned (router hairpin worked), which implies the 49160–49200/udp forwards exist; **3478 from
a truly external network is the one unproven hop** (needs a phone-on-cellular test).
Dev env: `.env.local` TURN_PUBLIC_HOST=192.168.0.104 (LAN direct, avoids hairpin dependence);
prod uses soullab.life. Ops trap hit twice: interrupted `docker compose up` over ssh leaves a
zombie renamed container that blocks recreation — always `nohup`/detach long compose ops.

**Still open:** external (off-network) 3478+relay confirmation via phone-on-cellular · pg bus for
multi-instance · the human Encounter Test. Dev-ops note: a corrupted `.next` after heavy edit churn
can 404 the page chunk (black page, no console error) — fixed by `rm -rf .next` + restart.

## Non-goals (now)
3+ participants · server-side/SFU recording · video recording · any cloud media service.
