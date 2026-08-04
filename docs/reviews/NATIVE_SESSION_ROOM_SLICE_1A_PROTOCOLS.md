# Native Session Room — Slice 1a (native presence) verification protocols

**Object under test:** `feature/session-room-native-video-foundation`
**Scope:** 1:1 audio + video presence in the native room. Recording, transcription,
attribution, capture integrity, review and export are **out of scope** and must not be
claimed by either protocol below.

**Not this object:** `fix/session-room-dual-channel-attribution` @ `a2bf26baf` is the
acceptance object for *capture* through the external-meeting bridge. It runs its own
sequence, unchanged. Neither protocol proves anything about the other.

---

## State of the ladder

| Rung | Status |
|---|---|
| **Implemented** | ✅ the native 1:1 media path exists |
| **Unit-verified** | ✅ 25 tests in `lib/session/__tests__/nativeMedia.test.ts`; typecheck gate 239/239, no regressions |
| **Integration-verified** | ⛔ not run — requires Protocol A below (two real devices, two real cameras) |
| **Accepted** | ⛔ not run — requires Protocol B below |

**Passing Protocol A authorizes the real native-room walk. It does not satisfy acceptance.**

> Note on browser evidence: this branch lives in the worktree `/Users/soullab/wt-native-video`.
> The session preview tool binds to the main checkout, so no rendered screenshot of *this*
> branch was taken. Rendering is proven by Protocol A step 3, not by a developer screenshot.

---

## Protocol A — Integration (one person, two devices)

Two physical devices, each with a working camera and microphone. Not two tabs on one
machine: one machine cannot prove device selection, and a shared camera will fail to open
twice, producing a false `device-busy`.

### Setup

1. Deploy the branch, or run it locally over **https** — `getUserMedia` is unavailable on an
   insecure origin and will surface as `insecure-context`.
2. Create an encounter with exactly two participants and mint a threshold link for each:
   `POST /api/studio/encounters/[id]/threshold`
3. On each device, open that participant's own threshold link, author the `join` consent, and
   follow through to the room. **Do not reuse one link on both devices** — the room is opened
   by a participant-scoped capability, and sharing it invalidates the identity half of the test.

### Checks

| # | Step | Pass condition |
|---|---|---|
| A1 | Both devices press **Join** | Both prompt for camera *and* microphone; `mic` reads `live`, `camera` reads `on` |
| A2 | Observe both screens | Each shows a remote tile with the other person moving, and a small self-preview. `remote audible` = yes, `remote video` = yes on both |
| A3 | Read the header | "Recording is not yet available in the native room." No recording control is present anywhere |
| A4 | Speak on each device in turn | Heard on the other. Self-preview is silent (no echo) — the local tile must be muted |
| A5 | Press **Mute** on device 1 | Device 2 stops hearing device 1; device 1's own tile is labelled `· muted`; video keeps flowing |
| A6 | Press **Camera off** on device 1 | Device 2 shows "Their camera is off", not a black rectangle. Audio continues. `connection` stays `connected` — **no renegotiation** |
| A7 | Press **Camera on** again | Video resumes on device 2 within a second or two, still without renegotiation |
| A8 | With ≥2 cameras present, switch camera on device 1 | Device 2 sees the new camera. Run `pc.getSenders().filter(s=>s.track?.kind==='video').length` in the console — **must be 1**, not 2 |
| A9 | Mute device 1, then switch microphone | Device 1 stays muted. Switching a device must never un-mute you |
| A10 | Force TURN: in the console, rejoin with `iceTransportPolicy: 'relay'`, or block UDP direct paths | `connected via` shows `relay ⇄ …` and reads "TURN relay used → coturn NEEDED". Media still flows both ways |
| A11 | Disable device 1's network for ~20s, then restore | `signaling` goes `reconnecting`, then `connected`. Media returns. Log shows the same `p_…` peer id as before the drop — **identity survives reconnect** |
| A12 | After A11, count participants and senders | One remote tile, not two. No duplicate peer announced in the log |
| A13 | Press **Leave** on device 1 | Camera light goes out on device 1; both tiles clear; device 2 shows "Waiting for the other participant…" |
| A14 | Rejoin device 1 | Reconnects cleanly to the same room with the same displayed name |

### Deliberate failure checks (these are the point, not an afterthought)

| # | Step | Pass condition |
|---|---|---|
| A15 | Deny **camera only** at the browser prompt | Room still joins, audio-only. Amber line names the camera as the cause. Camera button is disabled with a reason — **not** a button that silently does nothing |
| A16 | Deny **microphone** | Room refuses to join and shows "Camera and microphone are blocked" with the address-bar remedy. No half-joined state |
| A17 | Hold the camera open in another app, then join | "The device is in use by another app" — not a generic failure |
| A18 | Open the room with no `?threshold=` | "This room opens from a consent threshold". No media prompt fires at all |
| A19 | Open a threshold link before authoring consent | "You haven't crossed the threshold yet" + link back. No media prompt |

**A18 and A19 are the constitutional checks.** If a camera or microphone prompt appears
before consent exists, the slice fails regardless of how well the video works.

---

## Protocol B — Acceptance (two people, one real conversation)

A practitioner and a genuine remote participant hold an actual session in the native room.
Not a test call between two staff — a real conversation with something at stake in it.

Run Protocol A first. Do not run B on a build that has not passed A.

### What is being established

Not "did the feature work". Whether the room is somewhere a session can happen.

1. **Entry is understandable** — the participant reached the room from their link without
   being talked through it, and understood that agreeing at the threshold was theirs to do.
2. **Consent is trustworthy** — they can say, unprompted, what the room does and does not
   do with what they say in it.
3. **Audio and video feel stable** — no attention was spent on the connection. If they
   dropped, the recovery was intelligible rather than alarming.
4. **Names stay correct** — each person is labelled as themselves throughout, including
   after any reconnection.
5. **Controls are reachable** — mute and camera were found without hunting, mid-conversation,
   without looking away from the other person.
6. **Interruptions are intelligible** — when something degraded, they knew what had happened
   and what to do, without asking.
7. **The room supported the encounter** — the practitioner was not managing software. Ask
   them afterwards what they noticed about the room; "nothing" is the strongest pass.

### Recording the outcome

Acceptance is a judgement by the practitioner, recorded as a walk with named observations.
It is **not** satisfied by A1–A19 passing. If any of B1–B7 fails, the finding is recorded
and the slice is not accepted, regardless of green tests.

### Explicitly not established by Protocol B

- Anything about recording, transcript, or attribution — absent from this slice by design
- Group sessions — 1:1 only
- Whether the external-meeting bridge is trustworthy — that is `a2bf26baf`'s walk
