# Sovereign Portability Invariant — Electron is a host, not the architecture

**Date:** 2026-08-29 · **Status:** standing constraint on MAIA Desktop
**Applies to:** ALL MAIA Desktop work — every unit, every capability, from here on. It is not
scoped to a named unit. Any later unit that acquires the "Companion" name inherits it by being
Desktop work, not by being named.
**Evidence class of §4:** SOURCE (a read of the tree as it stands, not a runtime or device claim)

---

## 1 · THE GOVERNING SENTENCE

> **Electron is a current embodiment of MAIA Desktop, not an authority in MAIA's architecture.**

Electron is useful today because it gives us a fast, controllable native shell around code we already
have. Nothing about identity, memory, conversation, permissions, Work, or MAIA's relational meaning
may become dependent on it.

The corollary, stated as the design test:

> **Electron is a host adapter, not a domain boundary.**

⛔ It would be a design failure if the full MAIA Desktop we build now made Electron impossible to
remove later. Electron exists to get us to the sovereign system faster — not to become it.

This is subordinate to, and an application of, the roadmap's governing sentence: *the Companion is
one MAIA realm across surfaces.* A Desktop whose sovereignty lives inside Chromium is a parallel
Desktop state wearing a native window.

---

## 2 · The architecture this protects

```text
                 CANONICAL MAIA / AIN
          identity · memory · conversation · Work
                      │
                      │ authenticated protocols
                      ▼
          MAIA DESKTOP SOVEREIGN CORE
          ────────────────────────────
          session custody
          voice lifecycle
          local permissions
          local encrypted state
          canonical API client
          files / notifications / OS integration
          background presence
                      │
             stable local protocol
                      │
          ┌───────────┼────────────┐
          ▼           ▼            ▼
       Electron     SwiftUI      future UI
       today        macOS        / device
```

The load-bearing object is the **Desktop Sovereign Core**. Electron is one client of it.

**Today**

```text
Electron main      ≈ embryonic sovereign core
Electron renderer  = presentation / audio edge
```

**Later** — the responsibilities currently held in Electron main are extracted into a standalone
local supervisor, and Electron can disappear without taking MAIA's Desktop intelligence with it.

Voice is the clearest case, and it is already half-won. `epoch`, VAD, utterance buffering, liveness
and turn orchestration are **not Electron concepts**. Only three things are currently
Chromium-specific: `getUserMedia`, IPC frame forwarding, and `BrowserWindow` lifecycle. When
`getUserMedia` becomes `AVAudioEngine` / `CoreAudio`, the VAD, the tail invariant, member-owned
completion, liveness and turn semantics must not be rewritten. That is what the ownership work of
MAIA-D01/D02A bought, and this invariant is what keeps it.

---

## 3 · The five questions

Any Desktop capability must answer these before it is written:

```text
1. Is this logic intrinsically Electron-specific?
2. If not, does it live outside the Electron-specific modules?
3. What interface would let a native supervisor replace Electron main?
4. Does the renderer depend on an abstract Desktop capability, or directly on
   Electron machinery?
5. Could this capability survive replacing BrowserWindow + IPC with Swift/Rust +
   local IPC without changing its semantics?
```

They are **answered, not passed**. A capability that cannot answer them is incomplete work, not
blocked work.

### FORBIDDEN

```text
canonical state inside the renderer
domain logic coupled to BrowserWindow
auth semantics coupled to the Electron session object
conversation semantics coupled to ipcMain
voice grammar coupled to Chromium APIs
```

### Substrate-neutral seams

These are the names the core speaks in. They are concepts, not a mandated file layout — some exist
today under other names, some do not exist at all, and this document does not authorize building the
ones that do not.

```text
MemberSession           who is signed in, and custody of the credential
CanonicalClient         authenticated transport to canonical MAIA
VoiceSupervisor         epoch · VAD · utterance · liveness · turn boundary
ConversationContinuity  joining and holding the one member thread
CapabilityRegistry      what this host can actually do
LocalPermissionBroker   mic · files · notifications, mediated
SecureStore             encrypted local state
```

The shape to write, in place of a renderer reaching through IPC into an ad-hoc handler:

```text
House
  ↓
DesktopRealmClient
  ↓
transport adapter        Electron adapter today · native service adapter tomorrow
```

---

## 4 · Where the tree actually stands (SOURCE census, 2026-08-29)

`maia-desktop/src` — 2,519 lines. Only **one** file imports Electron.

```text
PORTABLE — zero Electron references, would move to a native supervisor unchanged
  src/voice/epoch.js          249    src/conversation.js        389
  src/voice/vad.js            134    src/thread-watch.js        127
  src/voice/utterance.js       69    src/capture-liveness.js    163
  src/voice/wav.js             84    src/capture-worklet.js      21
  src/voice/transcription.js   91
  src/voice/diagnostics.js    128                        subtotal ≈ 1,455

ALREADY ADAPTER-SHAPED
  src/session.js              120    createSession({ app, safeStorage, fetchImpl })
                                     — host capabilities arrive by injection; the
                                       file never names Electron. Swap the three
                                       arguments and it runs under a native host.

SPEAKS AN ABSTRACT SURFACE
  src/renderer.js             341    calls window.maia.* only; never ipcRenderer,
                                     never require. The presentation edge is already
                                     talking to a capability surface rather than to
                                     Electron machinery.

HOST ADAPTER BY DEFINITION
  src/preload.js               89    contextBridge + ipcRenderer, ten ratified
                                     channels, reviewed in one place.

MIXED — the real portability debt
  src/main.js                 514    the ONLY `require('electron')`. Host wiring
                                     (BrowserWindow, ipcMain handlers, app lifecycle,
                                     broadcast via webContents) is interleaved with
                                     domain orchestration that is not Electron's:
                                     runTurn · joinMemberThread · pollCanonicalThread
                                     · capture watchdog · voice session lifecycle ·
                                     witness stream.
```

The honest read: **the Desktop Sovereign Core already exists in embryo, and it is legible.** The
portability debt is not spread through the tree — it is concentrated in `main.js`, where domain
orchestration and host wiring share a file. The obligation on Desktop work is therefore narrow and
specific: **do not add to that pile.** New domain logic goes in a module that does not name Electron;
`main.js` gets the wiring only.

---

## 5 · What this document does NOT authorize

⛔ It does not authorize extracting the sovereign supervisor now. No Swift, no Rust, no second
process, no new IPC surface, no refactor of `main.js` as a unit of its own.

⛔ It does not re-sequence the roadmap. D02A, D04's live re-adoption, D05, D06 keep their order.

⛔ It does not license a portability abstraction with one implementation. An interface introduced
"for the native host we will build later", with no caller today, is Cat 1 — preserved direction —
not architecture. Write the seam when the second capability needs it, not before.

What it does: it makes a **placement decision reviewable at the moment code is written**, at
approximately zero cost, so the extraction stays possible.

---

## 6 · Sovereignty is bigger than "not Electron"

The target, stated fully. A genuinely sovereign MAIA Desktop should eventually be able to:

```text
run without a browser
run without Electron
run without OpenAI
run without Apple cloud services
retain local identity / session custody
use local models when appropriate
operate meaningfully when the canonical core is temporarily unreachable
reconcile safely when connectivity returns
never manufacture canonical authority while offline
```

That last line is the one that carries relational weight, and it is already settled doctrine here:

> **Offline experience = deferred authorship, not automatic canon.**

A future fully native MAIA may be deeply capable locally without inventing relational truth while
disconnected. Local capability may hold, buffer, and defer. It may not author what only the
canonical realm can author, and it may not backfill authority on reconnect as though it had been
there all along. This is the same constraint the Constitutional Direction of Authority places on
every layer: authority moves upward through authored experience, and a disconnected host does not
get to manufacture a higher rung.

---

## 7 · Enforcement

Declaration is not liveness. The invariant is asserted structurally, in the same doctrine as the
preload allow-list — the list lives in ONE place and a new file has to argue for itself:

```text
maia-desktop/test/portability-01-host-boundary.test.mjs
```

It fails if a module outside the declared host adapters imports Electron or names `ipcMain`,
`ipcRenderer`, `BrowserWindow`, `contextBridge` or `webContents`; if the renderer reaches for
`require` or `ipcRenderer` instead of the capability surface; or if a new source file appears that
has not declared which side of the boundary it is on.

Two files are declared host adapters: `src/main.js` and `src/preload.js`. Adding a third is an
authority decision, not a convenience.

**Negative controls, run 2026-08-29 (TEST class):** adding `require('electron')` to a domain module
fails 3 of the 5 proofs; adding an undeclared source file under `src/` fails 1. The Desktop suite is
138/138 green with the proof in place. Decay is loud, not silent.

---

## 7A · Extraction carries proof obligations with semantics

**Added 2026-08-29, from DSC-01.** Learned by a negative control, not by reasoning:

> **When orchestration ownership moves across a boundary, tests must prove the caller-level ordering
> invariants, not merely the correctness of the extracted component.**

DSC-01 moved conversation continuity out of `main.js`. `thread-watch.js` was correct before the move
and correct after it, and its pure-function proofs (d04a) passed throughout. But one of its rules —
*the watch records an adoption only after that adoption succeeds* — is an obligation on the
**caller**, and extraction moved the caller. A mutation that recorded the adoption first passed the
entire suite, 153/153. Nothing was watching the seam the move created.

That mutation is not an implementation detail. It is an **authority-ordering invariant**:

```text
canonical adoption succeeds
        ↓
local state records the adoption
```

Inverting it converts an *attempted* transition into an *apparent fact*, and the apparent fact
suppresses the retry that continuity depends on — the next observation reads `unchanged` and the
member is stranded on the old thread permanently. The local host would be asserting something the
canonical realm never confirmed. That generalizes past Electron and past Desktop: it is the same
constraint as §6's offline clause, in miniature. **A host may record what canonical MAIA confirmed.
It may not record what it merely attempted.**

Before any extraction, therefore, identify every sequence of the form:

```text
canonical action → local state mutation → broadcast → completion / release
```

and decide which orderings are **semantic** rather than incidental. Prove the semantic ones at the
new caller. This is what keeps the portability programme from degenerating into *move functions
until main.js is small*. The objective is stricter and more useful:

> **Move authority to its proper owner, and move its proof with it.**

---

## 8 · The likely evolution

```text
NOW      Electron Companion
   ↓     proper boundaries / adapters          ← boundary work lives here
   ↓     extract sovereign supervisor
   ↓     Electron becomes optional frontend
   ↓     native macOS frontend
         Electron can be retired
```

For macOS the strongest eventual shape is a persistent native supervisor (Swift / Rust / hybrid)
owning OS-level audio, Keychain, notifications, filesystem mediation, background lifecycle, local
encrypted storage and local model access behind a stable IPC/API, with a SwiftUI/AppKit surface and
canonical AIN on the sovereign network. If cross-platform portability is wanted, a Rust sovereign
core behind native shells (macOS · iOS · Windows · Linux) is far more durable than making Chromium
the permanent center of gravity.

⭐ None of that is authorized here. It is written down so that the boundaries Desktop work draws
are drawn toward something, rather than toward nothing in particular.
