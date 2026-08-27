# MAIA-D01 — Native Voice Desktop Witness

**Date:** 2026-08-25 · **Authority:** founder ruling, MAIA-D01 authorized unit
**Canonical start:** `5944bda` (MAIA-D00A) · trunk `0c4638a`

```
LINEAGE
  ea0dc0c   D01 native voice implementation
     ↓
  468b52e   D01 witness instrumentation   ← THE SHA TO WITNESS

IMPLEMENTATION:  COMPLETE
SOURCE/TEST:     GREEN — 55 assertions / 0 failures · 11 negative controls, all bite
RUNTIME PROOF:   ⭐ OBTAINED 2026-08-27 — the shell launches on macOS
DEVICE WITNESS:  ⭐ PARTIAL 2026-08-27 — capture chain proven; class E defect found
STATUS:          SUPERSEDED by DESKTOP-CONVERSATION-01
```

## ⭐ First device walk — 2026-08-27, Kelly's Mac Studio

```
voice_listening_started  at=1787844577559  epochId=1
voice_mic_granted        at=1787844577983  epochId=1
voice_audio_started      at=1787844578003  epochId=1
voice_speech_started     at=1787844578716  epochId=1
```

**Four of six links proven on hardware, first attempt:**

```
mic permission → getUserMedia → AudioWorklet → PCM frames → bridge → main → VAD   ✓
                                                            transcription          ✗
```

`voice_speech_started` fires only after three consecutive frames above the RMS threshold — positive
evidence of **real human speech in real PCM crossing the bridge**. ⭐ The VAD thresholds, named in
§7.3 as *"the single most likely thing to need adjustment,"* **acknowledged real speech unmodified.**

### ⛔ DEFECT — class E, transcription transport

`main.js` constructed the transcription client and **nothing ever called it.** The frame handler ran
VAD, updated epoch state, and returned; no audio buffered, nothing dispatched. Hence `finals 0` and
no tail to test.

⭐ **The walk found what 55 green assertions did not.** Every proof covered a COMPONENT in isolation;
none proved the assembled path dispatches audio at all. SOURCE ≠ RUNTIME, biting its own author.
Repaired in DESKTOP-CONVERSATION-01, with `CLASS E REGRESSION` standing guard and a negative control
that replays this exact defect.

### ⭐ PREMISE-CHANGING — D01 and D03 are coupled in the real system

`/api/voice/transcribe-simple` requires an authenticated member (401 without a session) and sits
behind `ALLOW_AUDIO_TRANSCRIPTION`. **Even with dispatch wired, it would have 401'd.**

⛔ **Native transcription cannot be accepted independently of authenticated transport, because the
production transcription endpoint requires member identity.** The roadmap treated D01 → D02 → D03 as
sequential; they are not separable. Only the device walk could have shown this — which is why the
unit boundary was dissolved rather than defended.

⭐ **`468b52e` is not a new functional unit and not D02 work.** It is the same D01 voice
architecture made empirically auditable — founder ruling, 2026-08-25. §11 records what it adds and,
just as importantly, the exact limits of the assertions that guard it.

⛔ **This unit does not close here.** The founder's refinement is applied literally: SOURCE/TEST
completion is not DEVICE proof, and the 2–5 minute monologue has been proven against a *synthesized*
frame stream, not against a human voice. Closing on Linux tests would be the old
*"packaged in source therefore proven on Mac"* error in a new costume.

---

## 1 · What was built

`maia-desktop/` — the canonical member-facing tree (ruling R1). **Not** a fork of JARVIS: the
governed shell *pattern* was inherited as precedent per R5, the application was not.

```
maia-desktop/
  package.json                    identity + test script only; no packaging (out of scope)
  src/
    main.js                       governed shell · owns VAD, epoch, transcription, diagnostics
    preload.js                    narrow bridge — 7 invoke + 2 push, exact allow-list
    renderer.js                   getUserMedia + AudioWorklet → forwards frames, nothing else
    capture-worklet.js            audio-thread processor: PCM out, no interpretation
    index.html                    the witness surface
    voice/
      epoch.js        ⭐ the tail invariant, structurally enforced
      vad.js             pure segmentation; pauses are not boundaries
      transcription.js   transport to the EXISTING self-hosted whisper route
      diagnostics.js     VoiceDiagEvent emission, privacy-refusing
  test/
    d01-preload-allowlist.mjs     the reviewed channel list (one place, per D00A)
    d01-tail-invariant.test.mjs   26 assertions
    d01-boundary.test.mjs         17 assertions
    d01-pauses-and-duration.test.mjs  5 assertions
    d01-no-web-speech.test.mjs    4 assertions
```

⭐ **The design decision that makes this unit provable at all:** the entire voice core is **pure** —
no Electron, no audio API, no timers, no clock, no I/O; every dependency injected. That is why the
tail invariant can be proven exhaustively on Linux while the microphone that feeds it can only be
witnessed on macOS. The two evidence classes are separable *because the code was built to separate
them*.

---

## 2 · ARCHITECTURE — and one honest limitation, stated rather than glossed

```
renderer  ── getUserMedia ─► MediaStream ─► AudioWorklet ─► Float32 PCM frames
                                                                │
                                                    (bridge: frames only)
                                                                ▼
main      ── VAD ─► epoch state ─► transcription transport ─► partial/final ─► MAIA-ready utterance
                         │
                         └─► diagnostics (structure only, never text)
```

**Why the renderer touches the microphone.** In Electron, microphone acquisition runs through
Chromium's media stack, which lives in the renderer. So `getUserMedia` is called there. What makes
this desktop-owned in the sense the ruling requires is everything after: the renderer hands over raw
PCM and has **no further authority**. Segmentation, epoch state, the tail invariant, transcription
and diagnostics all execute in main, where the renderer cannot reach them. No browser recognition
service is involved at any point, and **there is no recognition lifecycle to lose control of** —
which is the dependency §XII actually rules out.

⚠️ **The limitation, named:** this is Chromium's audio *input* stack, not CoreAudio directly. If the
programme later needs device-level control (exclusive-mode capture, sample-rate pinning, capture
that survives renderer death), that is a further unit — not something this one quietly delivered.

---

## 3 · TRANSCRIPTION BACKEND

The **existing** self-hosted `maia-whisper`, reached through the app's own
`/api/voice/transcribe-simple`. MAIA-D00 §5.4 witnessed that this substrate already exists; the scope
ruling forbids creating a parallel MAIA backend, so D01 introduces no transcription service of its
own. A proof asserts the route is ours and that no third-party recognition host (OpenAI, Google,
Azure, Deepgram, AssemblyAI) is referenced.

**Failure is a boundary, not a hole.** After its retries, the client returns `ok:false, text:null` —
it never returns empty text as success. A transcription failure that quietly returned `''` would
satisfy every type signature and lose the member's words; that is the defect class this unit exists
to make impossible, so it is asserted directly (NC10).

---

## 4 · VOICE DIAGNOSTICS — 15 events reused, 1 added, with the argument for it

Reused verbatim from `lib/voice/voiceDiagnostics.ts`, so browser and native results stay comparable
(MAIA-D00 §5.3): `voice_mic_granted · voice_listening_started · voice_audio_started ·
voice_speech_started · voice_result_interim · voice_result_final · voice_transcribe_sent ·
voice_transcribe_result · voice_transcribe_error · voice_recognition_ended ·
voice_transcript_salvaged · voice_capture_lost · voice_turn_commit_requested ·
voice_turn_committed · voice_result_after_commit`.

Surface is carried as **metadata** (`surface: 'desktop'`), not as a name prefix. The iOS path earns
its `ios_voice_*` prefix because the Capacitor plugin genuinely emits different things (no
final-result event at all). Desktop crosses the *same* boundaries as the web path, so a prefix would
assert a difference that does not exist and break the comparison the instrumentation is for.

### ⚠️ One new event: `voice_tail_lost`

The tail invariant requires that unfinished speech is preserved **or explicitly surfaced as lost**.
The canonical union expresses the first half and not the second. The near misses, and why each is
wrong rather than merely awkward:

| Candidate | Why it cannot carry this |
|---|---|
| `voice_capture_lost` | names the CAPTURE dying, not the MATERIAL. Independent: capture can die with nothing pending; material can be lost while capture is healthy. |
| `voice_transcript_salvaged` w/ `chars: 0` | a false statement — "salvaged" asserts a rescue that did not happen. |
| `voice_result_after_commit` | ordering F (a late result), not an epoch ending with material open. |

The browser path never needed the name because its salvage either succeeded or there was nothing
pending — loss was not a reachable outcome there. On the native path it is reachable, so it must be
nameable. **One event.** A proof asserts `NEW_EVENTS.length === 1` and fails if a second appears, and
fails again if `voice_tail_lost` ever becomes canonical (at which point it must be reused, not
re-declared).

⭐ **The emitter REFUSES rather than passes through.** An unknown event name throws — that is how a
parallel vocabulary starts: one call site, then five, then a second language. A non-allow-listed
string in metadata also throws. **That guard caught this unit's own first emission** (`tailOutcome`);
the fix was to review the field and list it as the closed vocabulary it is, not to relax the rule.

---

## 5 · ⭐ THE TAIL INVARIANT — enforced structurally, not by discipline

> No capture/transcription epoch may end with nonempty human speech state that is silently
> discarded. At a boundary, unfinished material must be preserved/salvaged, or explicitly surfaced
> as lost.

`openPartial` is private, and **exactly one function** — `closeOpenPartial()` — can clear it. Every
boundary (final, restart, user stop, capture loss, transcription failure, device change, commit,
reset, *and a duplicate final*) routes through it, and it cannot return without emitting
`voice_transcript_salvaged` or `voice_tail_lost`. **There is no path that clears the field quietly,
because there is no other path that clears the field.**

Proven across all five epoch-closing boundaries × three states (pending material salvageable /
salvage refused / nothing pending) = 15 assertions, plus:

- a **final supersedes** a partial without claiming a salvage — committing is the stronger outcome;
- a **duplicate final** still accounts for pending material (otherwise it becomes a hole);
- **commit carries only committed finals** — an open partial never masquerades as final;
- **reset mid-epoch** still accounts for pending material.

### Pauses are not boundaries

Nothing in this seam ends an epoch because of silence. `endOfUtteranceMs` is **2500 ms**, chosen to
sit above ordinary mid-thought pauses rather than above ordinary word gaps, and when it elapses the
VAD says *"an utterance ended, a final may be requested"* — never *"tear down capture."*
A proof asserts an **800 ms pause (the typical dictation cutoff) does not end an utterance**, and
that twelve seconds of silence leaves the epoch open with its finals intact.

---

## 6 · TEST PROOF — 52 assertions, 0 failures

| Suite | Assertions |
|---|---:|
| `d01-tail-invariant.test.mjs` | 26 |
| `d01-boundary.test.mjs` | 17 |
| `d01-pauses-and-duration.test.mjs` | 5 |
| `d01-no-web-speech.test.mjs` | 4 |
| **Total** | **52 / 0** |

Required witness behaviours, mapped to where each is proven:

| # | Behaviour | Proven |
|---|---|---|
| 1 | microphone acquisition | boundary (permission handler: audio only) · renderer proof |
| 2 | audio start | tail-invariant ordering · fires once per epoch |
| 3 | sustained speech | duration witness (5 min) |
| 4 | partial transcript arrival | tail-invariant ordering |
| 5 | final transcript arrival | tail-invariant ordering + dedupe |
| 6 | long reflective pauses | pauses (12 s silence, epoch survives) |
| 7 | speech resuming after pauses | pauses (same epoch, finals intact) |
| 8 | capture/transcription boundary restart | restart preserves finals · mid-monologue restart |
| 9 | unfinished-tail preservation or explicit loss | **15 assertions across 5 boundaries** |
| 10 | user stop | tail invariant · commit |
| 11 | clean recovery from capture interruption | `captureLost` → boundary → restart |

### 6.1 Negative controls — all 11 required classes, each injected into real source

| # | Injected defect | Caught by |
|---|---|---|
| NC1 | Web Speech dependency introduced | `no Web Speech API dependency` |
| NC2 | browser recognition lifecycle appears | `no recognition object lifecycle` |
| NC3 | renderer bypasses the preload surface (8th channel) | `exactly the ratified invoke channels` |
| NC4 | raw device authority exposed to renderer | `renderer cannot name a device/endpoint/epoch` |
| NC5 | **tail discarded at a capture boundary** | ⭐ **15 assertions** |
| NC6 | duplicate finals accumulate | 2 assertions |
| NC7 | restart loses accumulated finals | 2 assertions |
| NC8 | transcript state crosses sessions | `reset clears every session-scoped field` |
| NC9 | pause treated as a dictation cutoff (700 ms) | `boundary is generous enough for mid-thought silence` |
| NC10 | transcription failure returns empty text as success | `never returns empty text as success` |
| NC11 | transcript text leaks into telemetry | `emitter REFUSES transcript text` |

Each mutated real source, ran the suite, and was reverted; the tree returns to 52/0.

⚠️ **Method correction, recorded rather than hidden.** The first control run restored with
`git checkout` on a tree that was still **untracked**, so two injected defects persisted into the
baseline and the "baseline" briefly read 49/3. The corrupted state was found, the leftovers removed,
the true 52/0 baseline re-established, and every control re-run from a *verified-clean* backup. The
lesson is the programme's own: a restore that cannot fail loudly will fail quietly.

---

## 7 · RUNTIME / DEVICE PROOF — ⛔ NONE, and why

| Class | State | Reason |
|---|---|---|
| SOURCE | ✅ | full tree, `node --check` clean on every file |
| TEST | ✅ | 52 / 0, 11 negative controls |
| RUNTIME | ⛔ **none** | no Electron binary installed; the shell has never been launched |
| DEVICE | ⛔ **blocked** | Linux x86_64 container · no macOS · **no `/dev/snd`** — no audio input device exists here |

**What has NOT been witnessed** — the list the founder walk must actually close:

1. A real `getUserMedia` grant on macOS.
2. Real PCM frames crossing the bridge from a real microphone.
3. The VAD's thresholds against a **real human voice** — `speechRms 0.020` / `silenceRms 0.012` are
   reasoned defaults calibrated against synthesized frames. Real rooms, real mics and real speakers
   will move them. **This is the single most likely thing to need adjustment after the first walk.**
4. The 2–5 minute monologue as *speech*, not as a synthesized frame stream.
5. Whether an AudioWorklet posting a frame per 128 samples sustains 5 minutes without IPC backpressure.
6. AirPods / device-change behaviour, sleep/wake, real transcription-stream failure.

⭐ The synthesized duration witness proves the **state machine** survives five minutes of alternating
speech and long pauses. It does **not** prove a microphone does. Those are different claims and this
record keeps them apart.

---

## 8 · SCOPE — what was deliberately NOT built

Per the ruling, D01 built no House, no Realm, no same-conversation resume, no Session Room, no
production packaging, no auto-updates, no JARVIS redesign, no filesystem access, no parallel MAIA
backend. Authentication was **not touched at all**: MAIA-D00 §5.1 established that the server-side
contract already exists and that D03 is wiring, so D01 wires none of it — this shell does not yet
talk to MAIA. `package.json` carries no `electron-builder` block, so the tree cannot be packaged
even accidentally.

---

## 9 · SECURITY / SOVEREIGNTY

- **Preload:** 7 invoke + 2 push, exact allow-list, one file, each channel with a documented purpose
  and naming ruling — MAIA-D00A's discipline applied from the first commit rather than after a
  second regression. A proof asserts main handles *exactly* the ratified set and no others.
- **Main validates everything:** frame length bounded (1…65536), `frameMs` clamped (1…1000), every
  renderer string truncated to 64 chars. The renderer cannot name a device, endpoint, or epoch.
- **Permission is audio-only**, granted to our own loaded file; video, geolocation, notifications and
  display capture are refused. Renderer is `sandbox: true`, `contextIsolation: true`,
  `nodeIntegration: false`, `loadFile` only — a proof fails on any `loadURL`.
- **Privacy:** telemetry carries `chars` and closed-vocabulary reason codes; the emitter *throws* on
  transcript text. This implements `docs/design/contracts/conversation-room-voice-capture.md`, which
  exists because a previous surface wrote member speech verbatim to a console.
- **Growth-obligation check.** New capability: native-owned listening. *Uncertainty preserved* — the
  VAD reports observation (`speech_started`), never interpretation ("the member finished"); an
  utterance boundary is an offer, not a verdict. *Provenance* — salvaged material is handed to the
  member's **draft**, not re-fed to MAIA as if recognized, so the member decides what to do with
  words the system nearly lost. *New responsibility* — a system that listens continuously must be
  able to say what it lost; `voice_tail_lost` exists so it can.
- **Sovereignty invariants:** capture is member-initiated (a button), stoppable, and the surface
  shows epoch, finals, salvaged and lost counts. No ambient listening, no covert capture.

---

## 10 · KNOWN LIMITATIONS

1. **No device witness.** The headline. Nothing here has heard a human being.
2. **VAD thresholds are unvalidated against real audio** (§7.3) — expect to tune them.
3. **Chromium's audio stack, not CoreAudio** (§2) — named, not smoothed over.
4. **Not connected to MAIA.** Transcription reaches whisper; the utterance goes nowhere. D03.
5. **`maia-desktop` is not installable.** No packaging, no signing, no updater — and the root
   `npm run desktop:package` foot-gun (MAIA-D00 §2.1) is still live and still uncorrected.
6. **The AudioWorklet posts one message per 128-sample block** (~2.7 ms at 48 kHz). Deliberately
   simple for the witness; if IPC backpressure appears on device, batching is the repair.
7. Frames cross the bridge as plain arrays, which copies. Acceptable for a witness; a
   transferable/shared buffer is the optimization if §7.5 shows it is needed.

---

## 11 · The witness apparatus (`468b52e`) — and the precise limits of its guards

Added after the implementation was accepted, because `ea0dc0c` could only show diagnostics
**transiently in the renderer**. §6 of the device-witness ruling requires the walk to be judged on
*diagnostic evidence*, not on whether the final transcript "looks mostly right" — and a judgment
read off a screen and recalled afterwards is the kind of witness this programme has already had to
correct twice. That judgment needs a file.

| Addition | What it does |
|---|---|
| `scripts/witness-env.mjs` | §1 environment record at execution time; every field observed or explicitly UNKNOWN; refuses to let a dirty tree pass unnamed |
| evidence sink in `main.js` | forwards the emitted record verbatim + one number, into JSONL under `userData` |
| `scripts/witness-verify.mjs` | judges the eleven §11 closure criteria mechanically from the event stream |

⭐ **The verifier's load-bearing property: `UNWITNESSED` is not a pass.** A criterion the walk never
exercised cannot close, and the script exits non-zero on it. A 20-second command-style test therefore
cannot accidentally close D01 just because everything it happened to touch worked. Criterion 11 (no
renderer authority expansion) reads `SEE SOURCE SUITE` rather than being quietly marked green by a
script that cannot see it.

Verified by four controls against synthesized walks: a complete walk passes · a **silent tail loss
FAILs** · leaked transcript text FAILs · a short walk returns UNWITNESSED on four criteria.

### 11.1 ⭐ The accepted claim, in its exact form

> The evidence sink is outside the capture-**state-mutation** path. It executes **synchronously
> during diagnostic emission**, but current source inspection shows it does not modify PCM/frame
> handling, VAD, epoch/tail state, transcription, or preload bridge behavior.

⛔ Do not restate this as *"the sink is completely off-path."* That is the weaker and less accurate
claim. The sink runs inside the diagnostic emission that epoch transitions trigger; what it cannot do
is **change** anything — it takes an already-emitted record, reads `voice.frames`, and writes.

Verified by direct inspection at `468b52e`: zero code references to the sink in `epoch.js`, `vad.js`,
`transcription.js`, `diagnostics.js`, `preload.js`, `renderer.js`, `capture-worklet.js` (the three
textual hits in the pure core are prose). It is called **zero** times from the frame handler, so it
writes on diagnostic events — a handful per epoch — and cannot contribute to the 128-sample IPC
cadence the device walk is watching.

### 11.2 ⚠️ The guard is LEXICAL — carried forward deliberately, not forgotten

`test/d01-boundary.test.mjs` catches the sink **by name**. A future sink introduced into `epoch.js`
or `vad.js` under a *different* name would not trip it.

**It proves the current implementation shape. It is not a semantic guarantee.**

This is the third generation of the same lesson — JOP-00 §4.1, MAIA-D00A §3.2, and now a guard this
programme wrote itself. The correct response is not to distrust the assertion but to remember what
class of thing it is: *absence from a lexical search is evidence about the search.* The current code
is verified above by direct inspection, not only by the guard. Whoever extends this next inherits
that obligation.
