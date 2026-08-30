# Final host-boundary proof — is Electron now holding host knowledge, or MAIA knowledge?

**Date:** 2026-08-29 · **HEAD:** `745ee539d` · **`main.js`:** 351 lines (514 at sequence start)
**Evidence class:** SOURCE · **Read-only.** No code moved; no tests added; no controls run.

```text
DSC-01  conversation continuity   CLOSED      DSC-03  capture supervision     CLOSED
DSC-02  turn orchestration        CLOSED      DSC-04  voice session lifecycle CLOSED
```

---

## OUTCOME: **B — one residual semantic defect** → **CORRECTED. See §8.**

Everything in `main.js` is host lifecycle, transport, validation, OS capability, composition,
evidence mediation, or projection — **with one exception**, and it is one of the exact claims the
proof's own list says must not originate in the host.

---

## 1 · Census

| region | classification | any MAIA decision here? |
|---|---|---|
| `require('electron')`, dev `userData` path | HOST LIFECYCLE | no |
| `broadcast()` | HOST TRANSPORT | no |
| `witnessPath` / `witnessWrite` / `witnessStream` | LOCAL EVIDENCE MEDIATION | no — forwards verbatim, records, decides nothing |
| `newVoiceSession()` | COMPOSITION ROOT | **yes, once — §3** |
| `voiceStateSnapshot()` / `pushState()` | PROJECTION / TRANSPORT | no — §4 |
| `captureWatch` / `lifecycle` / `turn` / `continuity` wiring | COMPOSITION ROOT | no — pure wiring |
| 10 `ipcMain` handlers | HOST SECURITY / VALIDATION + delegation | no — §2 |
| `createWindow`, `whenReady`, permission handlers, `window-all-closed`, `activate` | HOST LIFECYCLE / OS CAPABILITY | no |

---

## 2 · IPC ruling — CLEAN, all ten

Each handler is now some combination of validate · authorize · translate · delegate · shape result.

```text
voice-start        guard · signed-in gate · compose · clamp sample rate  → lifecycle.begin()
voice-mic-result   guard · coerce granted · truncate errorName           → lifecycle.micResult()
voice-frame        guard · bound length 1..65536 · clamp frameMs         → lifecycle.frame()
voice-capture-lost guard · truncate cause                                → lifecycle.captureLost()
voice-stop         guard                                                 → lifecycle.end()
voice-state                                                              → projection
status             host identity + build stamp
sign-in            validate · truncate · delegate · compose              → continuity.join()
sign-out           delegate · drop host references                       → continuity.stop()
auth-state                                                               → delegation
```

None decides continuity, turn ownership, voice lifecycle, liveness meaning, canonical authority or
session-revocation semantics. `voice-stop` — 20 lines of orchestration before DSC-04 — is now a
guard and a delegation.

⚠️ **One borderline, ruled host:** `if (!memberSession.state().signedIn) return 'sign in before
speaking'`. A MAIA rule, and another host must reproduce it — but it is an authorization gate on a
host-mediated device, which this proof explicitly lists as legitimate host responsibility, and it is
already asserted (`dc01`: *speaking requires a signed-in member*). Not debt.

⚠️ **Ruled NOT a defect:** `sessionId: \`desktop-${Date.now()}\`` mints a *candidate* id. The
decision about whether it survives belongs to `adoptMemberThread` in `conversation.js`, which
replaces it whenever the member has history anywhere. The host seeds; canonical decides. The format
is arbitrary to every consumer — adapter glue, not authority.

---

## 3 · THE DEFECT — `main.js:111-114`

```js
const draft = [];
const epoch = createEpochState({
  diagnostics,
  onSalvage: (text) => { draft.push(text); return true; },
});
```

**Semantic owner:** member authorship — the same owner as `turn.js`'s "this utterance is final".

This is one of the proof's own enumerated claims that must not originate in the host: *"this speech
belongs in the member's draft."* It is also the **only** callback in the file that decides anything.
Every other one main hands to a portable capability is pure wiring:

```text
announce      → pushState()            transport
publish       → broadcast(...)         transport
speak         → broadcast(...)         transport
dispatchTurn  → turn.run()             delegation
projectState  → voiceStateSnapshot()   projection
revokeSession → voice = null           host state the host owns
onSalvage     → draft.push · return true      ⛔ a POLICY VERB and a DESTINATION
```

**Why another host would have to reproduce it.** A Swift host writing its own composition root must
independently know two things the epoch does not tell it: that Desktop **accepts** salvage
(`return true` — returning false makes the epoch report `voice_tail_lost` instead), and that
salvaged speech **becomes the member's own draft** rather than being re-fed as a completed turn. Get
either wrong and speech the member nearly said is silently either lost or promoted to authored. The
regression would be invisible: no error, no diagnostic, just a different relationship to the
member's words.

DSC-04 proved the disposition, so it cannot silently drift **here**. Proof prevents drift; it does
not transfer ownership. A new host inherits none of that proof.

**Minimum bounded correction — ~2 lines, and NOT a composition extraction.** Give the disposition a
portable name (e.g. a `createMemberDraft()` in `voice/` exposing `accept(text)` and the list) and
have composition wire `onSalvage: draft.accept`. The policy becomes portable and named; the
composition root keeps doing exactly what a composition root does. **`newVoiceSession` stays.** Its
composition-root ruling is reconfirmed and unaffected — the remaining DSC-04 wiring inside it is
clean.

⛔ Not implemented in this pass. It is small enough to defer without risk, and deferring is a
legitimate call — but it is the one place where an Electron-shaped file still holds MAIA knowledge.

---

## 4 · Projection ruling — CLEAN

`voiceStateSnapshot` aggregates and originates nothing: liveness state from liveness, epoch state
from `epoch.snapshot()`, draft depth from the session, and — since `1dfef0798` — the no-session case
reports the liveness domain's exported `IDLE` rather than a private literal. No writes, so no
transport ordering can create authority.

## 5 · Session-lifetime ruling — CLEAN

Every long-lived consumer re-resolves: `captureWatch`, `lifecycle`, `turn`, `continuity` all hold
getters; `broadcast` re-resolves windows and checks `isDestroyed`; the diagnostics sink reads
module-level `voice`; `did-finish-load` is `once`. The single capture-by-value
(`createConversation({ session: memberSession })`) has evidenced snapshot semantics — `memberSession`
is assigned once and revoked by internal mutation, never replacement.

Run mentally against the mechanical scenario (use live → revoke → use again), no consumer can act
semantically on a revoked owner. The diagnostics frame-count hazard stays **latent**: every emit
path is synchronous and precedes revocation, so it is not present debt.

## 6 · Cross-host thought experiment

A macOS host supplying native frames, permission events, view transport, secure storage, a
filesystem path, timers and app lifecycle would:

```text
validate its native events            →  its own code
construct the portable capabilities   →  its own composition root
delegate begin / frame / micResult / captureLost / end
project the resulting state
transport announcements outward
```

It would **not** need to reconstruct any state machine from Electron handlers. Continuity, turn,
liveness, supervision and capture lifecycle all arrive as modules. The one thing it would have to
get right from scratch, with nothing to inherit, is the salvage disposition in §3.

---

## 7 · Determination

```text
IPC handlers          CLEAN
projection            CLEAN
session lifetime      CLEAN
composition root      RECONFIRMED — newVoiceSession stays
evidence mediation    CLEAN
host lifecycle        CLEAN

RESIDUAL              main.js:111-114 — the salvage disposition
```

**Electron holds host knowledge, with one line of MAIA knowledge left in it.** The portability
programme has achieved its purpose: Electron is replaceable. Whether to spend one more small
correction on §3, or to accept it and move outward to product, is a founder call — not an
architectural blocker either way.

**Do not create DSC-05 for anything other than §3.**


---

## 8 · DSC-FINAL — the residual is corrected · **OUTCOME A**

**Correction landed.** The salvage disposition has a portable owner:
`maia-desktop/src/voice/member-draft.js` (`createMemberDraft`, zero Electron). `accept()` is the
epoch's salvage sink; returning true **is** the decision that stops the epoch declaring the tail
lost. `main.js:114` is now `onSalvage: draft.accept` — a reference, not a definition.
`newVoiceSession` remains the composition root, the epoch is untouched, and no manager, service or
factory was introduced.

**Re-inspection at `main.js` (350 lines).** Every callback the host hands to a portable capability:

```text
voice · conversation · session · watch · turnInFlight   getters (§7B re-resolution)
announce · publish · speak                              transport
dispatchTurn                                            delegation
projectState                                            projection
revokeSession                                           host state the host owns
onSalvage                                               a REFERENCE to the portable rule
```

No decision verb remains. No MAIA semantic claim originates in `main.js`.

**Controls (narrow, authorship-bearing boundary only):** acceptance removed → 2 fail; draft
disposition removed → 3 fail; the host defining the policy again → 1 fail. Suite 212/212 green.

```text
OUTCOME A — HOST BOUNDARY CLEAN
DSC PORTABILITY PROGRAMME CLOSED
```

No DSC-05. No further extraction. No native-host work.

### The final architecture

```text
Electron main (350 lines)     validation · permissions · composition · transport · lifecycle
  voice-lifecycle             member capture semantics
  capture-watch               liveness supervision
  capture-liveness            liveness policy
  turn                        turn semantics
  continuity                  canonical conversation continuity
  member-draft                salvage authorship
```

> **Electron now contains host knowledge, not MAIA knowledge.**

### What the sequence cost and what it bought

```text
main.js         514 → 350 lines, and the 350 are host code
suite           138 → 212 tests
units           4 extractions + 1 census + 1 proof + 1 two-line correction
proof gaps      4, every one found by a negative control, none by review
```

⭐ The last defect was two lines governing what happens to a fragment of speech a member almost
lost. The large things — continuity, turns, liveness, lifecycle — were comparatively easy to
recognise. **Sovereignty lives in tiny disposition decisions, not in impressive machinery.**

The next work is product: building the Desktop experience on this substrate rather than refining
the substrate.
