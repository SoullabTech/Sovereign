# Desktop host-boundary recensus — is Electron now reduced to what a host should know?

**Date:** 2026-08-29 · **HEAD:** `1e58e809` · **Evidence class:** SOURCE (read-only; nothing moved)
**Governing:** `docs/architecture/SOVEREIGN_PORTABILITY_INVARIANT_2026-08-29.md`
**Subject:** `maia-desktop/src/main.js`, **376 lines** (514 at the start of the DSC sequence)

Read fresh from current HEAD, not inferred from the DSC-01 census. The file materially changed
three times since.

---

## 0 · Outcome

**B — one remaining mixed responsibility**, plus two small findings that do not need units.

The extraction programme is **nearly** complete. Of the six remaining regions, four are legitimately
host and one is a legitimate projection. One is genuinely mixed: the **voice session lifecycle**,
which lives inside two `ipcMain` handlers.

⛔ **DSC-04 as previously sequenced (voice composition) is retired.** `newVoiceSession` is a
composition root and belongs in the host. It survived three extractions because it is in the right
place, not because it was overlooked.

---

## 1 · Census

| region | classification | another host needs… | extract? |
|---|---|---|---|
| `require('electron')`, dev `userData` path | HOST LIFECYCLE | same semantics, different mechanism | no |
| `broadcast()` | HOST TRANSPORT | same need, own mechanism | no |
| `witnessPath` / `witnessWrite` / `witnessStream` | LOCAL PERSISTENCE (host mediation) | same semantics, own filesystem | **no** — see §3 |
| `newVoiceSession()` | COMPOSITION ROOT | — | **no** — see §2, one caveat |
| `voiceStateSnapshot()` | PROJECTION | same facts, own payload shape | no — one defect, §4 |
| `pushState()` | HOST TRANSPORT | — | no |
| `voice-state`, `status`, `auth-state` handlers | HOST / delegation | — | no |
| `voice-capture-lost`, `sign-in`, `sign-out` handlers | validation + delegation + composition | — | no |
| **`voice-start` + `voice-frame` handlers** | **MIXED — see §5** | **yes, identically** | **yes, bounded** |
| `createWindow`, `whenReady`, `window-all-closed`, `activate` | HOST LIFECYCLE + HOST SECURITY | own mechanism | no |

---

## 2 · `newVoiceSession` — COMPOSITION ROOT, and it belongs here

It assembles portable capabilities (`diagnostics`, `epoch`, `vad`, `utterance`, `liveness`) with
host-owned adapters (the broadcast sink, the witness sink). A composition root is allowed to know
concrete constructors — that is its job. Extracting it to shrink `main.js` would replace a legible
assembly with a factory indirection and make the architecture worse. No `VoiceSupervisor`,
`DesktopCore`, DI container or service locator is warranted, and none is proposed.

⚠️ **One embedded semantic, recorded rather than moved:**

```js
onSalvage: (text) => { draft.push(text); return true; },
```

That is not wiring. It is a **member-authorship disposition** — salvaged material becomes the
member's own draft and is never silently re-fed to MAIA as though it had been recognised as final.
Another host must reproduce it exactly, and `return true` (Desktop accepts salvage) is a policy
choice a different host could get wrong.

**Coverage gap:** `test/d01-tail-invariant.test.mjs` proves the *epoch's* handling of an
`onSalvage` callback, passing its own stubs. Nothing asserts **Desktop's disposition** — that
salvage lands in the draft, that it is accepted, and that it never reaches MAIA as a final. Two
lines of policy with no proof.

This does not justify extracting composition. It justifies **one assertion**, and it belongs to the
§5 unit, which already owns the session's start sequence.

---

## 3 · `witnessWrite` — RULING: host filesystem mediation. Do not extract.

Answering the ownership questions directly:

```text
what is witnessed        diagnostic records the emitter already produced
who defines the record   voice/diagnostics.js (portable) — this forwards VERBATIM
who chooses location     app.getPath('userData') — host
does it establish authority?   NO. It records evidence, outside the capture path,
                               and swallows its own errors so a failed write can
                               never break capture.
```

The portable content is one rule — *forward verbatim, append the frame count, never throw* — with
no decision in it. Extracting it would yield a module whose entire body is a `try`/`catch` around
`JSON.stringify`, with one caller: the speculative abstraction §5 of the invariant forbids. Its
load-bearing property (privacy-refusing) is enforced **upstream at the emitter**, which throws on
transcript text, and is already asserted.

⚠️ **Latent, not reachable today.** The per-session diagnostics sink reads the *module-level*
`voice` for its frame count (`voice ? voice.frames : 0`). Session A's emitter would therefore report
session B's frame count if it ever emitted after replacement. Every current emit path is
synchronous and precedes `voice = null`, so it cannot occur. Recorded so a future async emitter does
not reintroduce it silently.

---

## 4 · `voiceStateSnapshot` — PROJECTION, correctly host-side, one defect

Against the three tests: it only **observes** authoritative owners (`epoch.snapshot()`,
`vad.state()`, `draft.length`, `liveness.state/cause/recoveriesUsed`); it **writes nothing**, so
changing it cannot alter semantic state; and another host would need the same facts in its own
payload shape. It stays.

⚠️ **Defect — the projection originates one claim it should be deferring:**

```js
if (!voice) return { active: false, capture: { state: 'idle', cause: null } };
```

`'idle'` is a hardcoded literal. `capture-liveness.js` **exports `IDLE`** and `main.js` does not
import it. Rename the state in the policy and the projection keeps asserting the old string —
silently, and about liveness, which is exactly the domain D02A exists to stop lying about.

One-line correction (import `IDLE`, use it). It is a coupling fix, not an ownership question, and
it needs no unit.

---

## 5 · The one remaining mixed responsibility — voice session lifecycle

Two handlers carry orchestration rather than validation-and-delegation.

**`maia:voice-start`** — after the host parts (signed-in gate, sample-rate clamp) there is a start
sequence with an ordering obligation:

```text
newVoiceSession() → epoch.startEpoch() → liveness.arm() → captureWatch.start() → pushState()
```

**`maia:voice-frame`** — after the host parts (length bounds, `frameMs` clamp) there is the whole
frame pipeline:

```text
frames++ → liveness.noteFrame() [→ push on transition] → utterance.push(frame)
        → vad.push() → map transitions → epoch.audioStarted / speechStarted
        → utterance_boundary → turn.run()
```

Every line of both is MAIA voice semantics. A CoreAudio host counts frames, notes liveness, buffers
the utterance, runs the VAD, maps its transitions onto the epoch, and dispatches a turn on a
boundary — identically. Only the IPC envelope and the payload validation are Electron's.

This produces a **current reusable capability**, not a speculative one, and it is the last such
cluster in the file.

⚠️ It is also the highest-risk extraction of the four: this is the hot path, the transitions are
authority-bearing (`alive/dead`, `heard/not heard`), and `voice-mic-result` carries an undocumented
asymmetry — it drops the session **without** calling `liveness.lost`, relying on capture-watch's
self-stop, where `voice-capture-lost` does call it. That asymmetry must be ruled on, not preserved
by accident.

**Proposed unit — DSC-04 (voice session lifecycle), replacing the retired composition unit.**
Scope: the start sequence, the frame pipeline, the salvage-disposition assertion, and a ruling on
the mic-denied asymmetry. Negative controls required — the doctrine's trigger conditions are met.
Not implemented in this pass.

---

## 6 · Session-capture inspection (§7B)

Every long-lived closure, timer and callback, checked against the revocation invariant:

```text
captureWatch   voice: () => voice                         re-resolved ✓  (proven, DSC-03)
turn           conversation / voice getters               re-resolved ✓  (proven, DSC-02)
continuity     conversation / session getters             re-resolved ✓  (proven, DSC-01)
broadcast      BrowserWindow.getAllWindows() + isDestroyed  re-resolved ✓
diagnostics    reads module-level `voice`                 re-resolved ✓  (see §3 latent note)
did-finish-load  captures webContents, `once`             bounded ✓
createConversation({ session: memberSession })            CAPTURED BY VALUE — correct ✓
```

**No zombie-authority defect found.** The one capture-by-value is the pattern §7B's snapshot clause
exists for: `memberSession` is assigned exactly once (`main.js:357`) and revocation is expressed by
internal mutation (`signOut()` clears token and member), never by replacement. Re-resolution would
buy nothing. Had sign-out replaced the object instead, the identical code would be a defect.

---

## 7 · Determination

```text
HOST-CLEAN, no action
  window + app lifecycle · permission handlers · broadcast · pushState
  newVoiceSession (composition root) · witnessWrite (filesystem mediation)
  voiceStateSnapshot (projection) · 8 of 10 ipcMain handlers

CORRECTIONS, no unit required
  voiceStateSnapshot hardcodes 'idle' instead of importing IDLE          (1 line)

ONE BOUNDED UNIT REMAINS
  DSC-04 — voice session lifecycle: the start sequence and the frame
  pipeline inside voice-start and voice-frame, plus the salvage-disposition
  assertion and a ruling on the mic-denied asymmetry.

RETIRED
  DSC-04 as previously sequenced (voice composition). newVoiceSession is a
  composition root and stays in the host.
```

**Electron has not yet been reduced to only what a host should know — but it is one bounded unit
away, and that unit is named.** Everything else in `main.js` is lifecycle, transport, security,
projection, composition, or justified local mediation.
