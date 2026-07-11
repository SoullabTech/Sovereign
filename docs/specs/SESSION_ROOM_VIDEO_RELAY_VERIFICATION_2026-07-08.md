# Two-Party Audio → Video Relay Verification

**Date:** 2026-07-08
**Author:** verification runbook (pre-spec)
**Principle:** *Prove the transport before designing the experience.* This runbook does **not** design Live Camera. It answers whether the current room path can carry a live two-party session between two real people on two real networks — first audio (Phase 0, no code change), then a throwaway video flag (Phase 1) — and records precisely what breaks first.

**Status vocabulary:** each check yields `PROVEN` (observed), `NOT PROVEN` (observed to fail), or `PENDING` (not yet run). Nothing here is claimed LIVE until the two-party run produces the evidence.

---

## 0. What the room path actually is (as-built, verified 2026-07-08)

- **Room UI + P2P:** `app/open/session-room/[roomId]/page.tsx` — real `RTCPeerConnection`, offer/answer, ICE, reconnect + staleness watchdog. **Audio-only today:** `getUserMedia({ audio: true })` (line 268). Practitioner is the offerer (`makeOffer` gated on `roleRef.current === 'practitioner'`).
- **Signaling:** `app/api/open/session-room/[roomId]/signal/route.ts` (SSE + POST relay) over `lib/webrtc/signalRelay.ts` — **in-memory, single-process**, pinned to a `globalThis` singleton. Logs `[signal]` with a per-process `MODULE_ID`.
- **ICE/TURN:** `app/api/open/session-room/[roomId]/turn-credentials/route.ts` — mints 300s coturn REST creds; **fails closed (503)** to host-candidate-only if unconfigured. Self-hosted only (refusal R-A5).
- **Door (consent):** `lib/encounters/roomDoor.ts` re-checks a `join` consent row on **every** signal request. No consent row → no signaling → no media.
- **The room's own UI already reports the answer to Q2.** `measureSelectedPair()` reads `getStats()` and renders `connected via: <local> ⇄ <remote>` with `(TURN relay used → coturn NEEDED)` when either candidate is `relay`. Relay-vs-host is observable in the UI, not inferred.

### Pre-flight infra state — verified this session (2026-07-08)

| Check | Result | Evidence |
|---|---|---|
| coturn container running | **PROVEN** | `maia-coturn` — Up 2 days |
| TURN env set in `maia-sovereign` | **PROVEN** | `TURN_PUBLIC_HOST`, `TURN_STATIC_AUTH_SECRET`, `TURN_EXTERNAL_IP` all SET |
| coturn LAN listener up | **PROVEN** | `ss`: `192.168.0.104:3478` UDP + TCP listening; 16 servers / 9 auth threads |
| Signaling shares one process in prod | **PROVEN (by topology)** | single `maia-sovereign` container; `globalThis` singleton is per-process |
| Consent path routes exist | **PROVEN** | create / mint / cross / door all present (see §2) |
| **Public :3478 + relay range forwarded off-LAN** | **PENDING** | router forward not verifiable from LAN; **this is the whole point of Phase 0** |

**Read:** the transport is not a placeholder. Every precondition except *external reachability of the relay* is already proven. Phase 0 exists to resolve that one PENDING row under real two-network conditions.

---

## 1. The five questions → explicit probes

| # | Question | Probe | PASS |
|---|---|---|---|
| Q1 | Two external users connect reliably? | Both browsers reach `connection: connected`, `remote audible: yes` | both peers, 3/3 trials |
| Q2 | TURN relay holds? | `connected via` shows `relay ⇄ *` OR `* ⇄ relay` for the off-LAN peer; audio persists ≥5 min | relay path selected AND stable |
| Q3 | Consent/threshold still correct? | Un-crossed token → room shows `door: unconsented`, **no** `[signal] SUBSCRIBE`; wrong-room token → `refused` | door refuses before any mic/signal |
| Q4 | Transcript/MAIA rail stable w/ media active? | (Companion rail is a *separate* surface — see §5) | rail unaffected / N/A Phase 0 |
| Q5 | What breaks first? | Fill the triage table (§4) at first failure | one named layer, with evidence |

---

## 2. Setup — exact runnable path (practitioner is authenticated)

All `/api/studio/*` calls require a practitioner session (`getCurrentPractitioner`). Run these as the signed-in practitioner (browser devtools console on soullab.life, or a script carrying the session cookie).

1. **Create encounter with two participants** (one MUST be `role: "practitioner"` — that peer is the offerer):
   ```
   POST /api/studio/encounters
   { "title": "relay-verify", "encounter_type": "session",
     "participants": [
       { "display_name": "Prac",  "role": "practitioner" },
       { "display_name": "Guest", "role": "guest" } ] }
   → { encounter: { id: <ENC> } }
   ```
2. **Mint threshold links:**
   ```
   POST /api/studio/encounters/<ENC>/threshold
   → { links: [ { role, thresholdPath: "/open/threshold/<TOKEN>" }, ... ] }
   ```
3. **Each participant crosses their own threshold** (writes join+record consent, idempotent):
   Open `/open/threshold/<TOKEN>` in that participant's browser and consent → `POST /api/open/threshold/<TOKEN>`.
4. **Each participant enters the room:**
   `/open/session-room/<ENC>?threshold=<TOKEN>` — practitioner's client auto-offers once the guest's `peer-join` arrives.

**Two-network requirement (Q1/Q2):** the two browsers must be on **different networks** (e.g. guest on cellular/hotspot, practitioner on home wifi) so at least one peer is behind a NAT that forces the relay. Two tabs on one LAN will connect host-to-host and **cannot** prove Q2.

---

## 3. Phase 0 — verify the current AUDIO room (no code change)

Run the §2 setup. Then, for **3 trials** (both-cellular, one-cellular/one-wifi, one behind symmetric NAT if available), record from **both** browsers' on-screen status block **and** the server log.

**Server log tail (run during the test):**
```bash
ssh soullab@minisforum 'docker logs maia-sovereign -f --since 2m 2>&1 | grep -E "\[signal\]|MODULE_ID"'
```

**Per-trial evidence to capture:**
- On each peer's status block: `door`, `mic`, `signaling`, `connection`, `ice`, `remote audible`, **`connected via`**.
- Server log: one `[signal] SUBSCRIBE` per peer with the **same `MODULE_ID`** (a mismatch = split process = Q1 fails at signaling), and `[signal] PUBLIC ... -> [peer]` showing offer/answer/ice reaching the other peer.

**Phase 0 exit criteria:**
- Q1 PROVEN: both peers `connected` + `remote audible: yes`, 3/3.
- Q2 PROVEN: off-LAN peer's `connected via` shows `relay` and audio survives 5 min. *(If it shows `srflx ⇄ srflx` you got lucky STUN traversal — still note it, but force a relay path with a symmetric-NAT peer to actually exercise coturn.)*
- Q3 PROVEN: repeat setup but **skip step 3** for the guest → guest room shows `door: unconsented`, and the log shows **no** guest `SUBSCRIBE`.

If Q2 fails here (no relay, or relay unreachable off-LAN), **stop** — the fix is router-forward / coturn `external-ip`, not video. This is the "infrastructure hardening first" branch (§6).

---

## 4. Failure-triage table — "what breaks first"

Fill this at the first failure. Each row is a distinct layer with a distinct fingerprint.

| Layer | Fingerprint | Where to look |
|---|---|---|
| **Signaling** | peers never see each other; `MODULE_ID` differs between the two `SUBSCRIBE` logs, or `PUBLISH ... NO ROOM` | `lib/webrtc/signalRelay.ts` (multi-instance? → needs pg LISTEN/Redis bus) |
| **Permissions** | `mic: denied` / (Phase 1) `camera: denied`; getUserMedia throws | browser prompt, OS privacy, non-HTTPS origin |
| **Relay/TURN** | `connection: failed`; `connected via` never resolves or off-LAN peer stuck at `ice: checking` | router forward of `3478` **and** `49160-49200/udp`; coturn `--external-ip`; 503 from turn-credentials |
| **Bandwidth** | connects then audio drops / (Phase 1) video freezes; ICE flaps `connected`↔`disconnected` | relay throughput, uplink, codec; watch `getStats` bitrate |
| **UI** | media fine but status block wrong / rail stalls | `page.tsx` render, `ontrack`, autoplay-block (`Play remote audio` button) |

---

## 5. Note on the companion rail (Q4) — do not conflate two surfaces

The **recording/transcript/MAIA-marker rail** lives in `app/studio/session-room/page.tsx` (practitioner-side companion). The **P2P media room** is `app/open/session-room/[roomId]/page.tsx`. They are **separate surfaces today** — the media room has no rail, by design ("transport only; no recording, no transcript, no memory"). So in Phase 0/1, Q4 is **N/A**: adding a video track cannot destabilize a rail that isn't in the same component. Q4 becomes real only when the video-track cut spec proposes *rendering media inside the companion*, which is a Phase-2 experience decision — out of scope here.

---

## 6. Phase 1 — throwaway video flag (only if Phase 0 passes)

Goal: re-run Q1/Q2 with a video payload to see if the **relay holds under video load** and what breaks. **No product polish. Local, un-merged, behind a flag.**

Minimal change set (revert after measuring):
1. **Constraint** — `app/open/session-room/[roomId]/page.tsx:268`
   `getUserMedia({ audio: true })` → `getUserMedia({ audio: true, video: <FLAG> })`, `<FLAG>` from a query param (`?video=1`) so it is opt-in and trivially reversible.
2. **Render** — `ontrack` (line 162) currently pipes `e.streams[0]` into the hidden `<audio>`. Add a `<video autoPlay playsInline>` sink and set `.srcObject` when the stream has a video track. ~5 lines. No layout work.
3. **Re-measure** — same §3 procedure, `?video=1` on both peers. Capture `connected via` (still relay for the off-LAN peer?), plus `getStats` outbound/inbound video bitrate + `framesDropped`. Watch for ICE flapping (bandwidth fingerprint).

Phase 1 does **not** touch signaling, TURN, or the door — those are proven in Phase 0. It isolates exactly one variable: does the proven transport survive a video payload.

---

## 7. Phase 2 — decision gate (after Phase 1 evidence)

- **Room holds under video** (relay stable, acceptable bitrate/drop, no ICE flap): proceed to draft the real Session Room Video-Track Cut spec — reconciling the **stale** pre-existing specs `docs/specs/SESSION_ROOM_VIDEO_SPEC_2026-06-14.md` and `SESSION_ROOM_VIDEO_PHASE1_SCOPE_2026-06-14.md`, which **predate** the 2026-07-05 transport rebuild and must not be reused verbatim.
- **Room fails under video** (relay unreachable off-LAN, or bandwidth collapse on the single relay path): spec **infrastructure hardening first** — router-forward audit, coturn relay-range/`external-ip`, and the named multi-instance signaling-bus item — before any experience work.

Either way, ungating Live Camera (`comingSoon: true` at `lib/studio/moduleDefinitions.ts:336`) happens **last**, only after a two-party video call is PROVEN, never before.
