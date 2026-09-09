# FOCUS-PRODUCER-01A · RECOVERY BRIEF

> **Read this first, then the repository. Do not treat this as a new
> architecture lane and do not redesign the Writer's Studio canonical path.**

⭐ **The authoring conversation is lost. The authored substrate is not.**

This document exists because the previous loss was conversational: the ruling,
the reasoning and the defect list lived in a chat that is gone, while the code
survived in git. The brief is therefore committed, not pasted.

---

## 1 · CUSTODY — what you are recovering

```text
branch          feature/jarvis-ws2-sel0-production-discovery-2026-09-08
census          a5902102d   FOCUS-PRODUCER-01 census — three tier seams, not one
implementation  a5fbafc8a   FOCUS-PRODUCER-01 — canonical participation for the Work
                            ← THIS is the implementation subject
```

⛔ **Do not work from another lane's HEAD merely because it is current.**

**First establish, mutating nothing:**

```text
branch containing a5fbafc8a
HEAD / ancestry
working tree state
relationship to current canonical
whether later commits already modified the same seams
```

## 2 · THE EXISTING RULING — do not reopen it

FOCUS-PRODUCER-01 established the narrow Writer's Studio canonical path:

```text
Writer's Studio request
→ typed top-level WriterStudioContext
→ typed CandidateBlocks
→ constructCanonicalTurn() once
→ MIPA / writers_studio adjudication
→ fixed admitted participant membership
→ tier-specific rendering strategy
→ response-producing MAIA cognition
```

```text
authorized producers   member.writer_focus
                       retrieved.writer_work_context
computed.writer_structure   ABSENT unless genuine structural evidence exists
meta.writerFocusContext     REMOVED — a dead unlawful channel is deleted, not activated
```

⭐ Writer's Studio canonical participation must **replace**, not accompany, legacy
participant injection. FAST / CORE / DEEP may vary **strategy**, never **admitted
membership**. The route remains disabled.

⛔ **Do not reopen these rulings unless the recovered code contradicts the
recorded state.**

## 3 · WHY RECOVERY IS NECESSARY — three defects, independently verified

An independent read-only pass against `a5fbafc8a` (§5 below carries the evidence)
found three unresolved runtime defects. They define the continuation.

### H1 — TRUE MODEL HANDOFF

> **Do not record a crossing until the admitted Work actually enters
> response-producing cognition.**

Required semantics:

```text
prepare/adjudicate/render fails   → no handoff · no confirm · receipt stays `attempted`
actual model invocation begins    → handoff established · confirmDisclosureCrossed()
generation later fails            → receipt remains `crossed`
```

### H2 — NO PRE-CANONICAL RESPONDER

> **No response-producing path may bypass the Writer canonical handoff and still
> yield a crossed Focus.**

⭐ **Two categories, and they must not be conflated:**

```text
alternate responder   produces an ordinary answer around the canonical path
                      ⛔ must not be possible for a Writer turn
safety refusal        may legitimately refuse the turn
                      ⛔ but must produce NO crossing
```

RCN is expected to be excluded from this first Writer lane.

### H3 — ONE TRUSTED TURN POSTURE

> **One turn may not have two privacy postures.**

The route must resolve posture once and carry that trusted object through
consent, `CanonicalTurn.sovereignty`, cognition and persistence. Legacy callers
may keep their existing resolution path.

## 4 · RECOVERY PHASE — READ ONLY FIRST

Independently verify H1, H2 and H3 against the recovered code before editing.
Return `CONFIRMED` / `PARTIALLY CONFIRMED` / `CONTRADICTED` with exact
file/function evidence.

Also verify that the recorded **P1–P8** implementation actually exists at the
recovered subject and that no later commit has silently changed its premises.

⛔ **If the repository now contains a material divergence from this record, STOP
and report it rather than forcing the old ruling onto new code.**

⭐ **Do not claim to remember why a local implementation choice was made.**
Reconstruct it from `a5fbafc8a`, its tests, the census and the recorded defects.
Once your reconstruction agrees with the record, you are the lawful continuation
of the lane — not before.

## 5 · THE INDEPENDENT WITNESS — evidence as read, 2026-09-09

Produced by a separate session against `a5fbafc8a`, read-only. **Corroborate it;
do not inherit it.** Line numbers are as of that commit.

### H1 — CONFIRMED

`beginCanonicalGeneration` (`lib/writers-studio/writersStudioCognition.ts:101`)
calls `getMaiaResponse(...)` and returns its promise via `.then()`. Being
`async`, that call runs only to its **first `await`**, then yields a pending
promise.

```text
maiaService.ts:2679   export async function getMaiaResponse(
maiaService.ts:2725   const turnCount = await incrementTurnCount(sessionId)   ← control returns HERE
focusCrossing.ts:172  await confirmDisclosureCrossed(...)                    ← confirm happens HERE
maiaService.ts:3311   await generateText({ systemPrompt: rendered.systemPrompt … })
                                                                             ← the real handoff
```

⭐ **The receipt is confirmed ~585 lines and many awaits before the model is
invoked.** Between them: turn count, history, identity backfill, field safety,
PFI/Bloom/Atlas/memory, routing, RCN, context inventory.

**The lawful handoff seam is `maiaService.ts:3311`** — the first point at which
the *rendered canonical Writer prompt* reaches a response-producing model.
⛔ Rendering is preparation, not handoff.

### H2 — CONFIRMED, two paths, both between the confirm point and line 3310

```text
RCN            maiaService.ts:3156  await maiaRcnProcess(...)
               maiaService.ts:3163  if (confidence >= 0.7 && completedNormally)
                                    → rawResponse = formatRcnForMaia(...)
                                    → its own comment: "Store conversation and return early"
               ⭐ A GENUINE ALTERNATE RESPONDER. The admitted Writer turn never
                 reaches generateText, and the receipt already says `crossed`.

field safety   maiaService.ts:2812  if (!fieldSafety.allowed) → returns a message
               ⭐ A LEGITIMATE REFUSAL, not a bypass — but on the current
                 ordering the receipt is already `crossed` when it fires.
```

No third response-producing early exit was found between `:2679` and `:3310`.

### H3 — CONFIRMED

```text
route.ts:72                     posture: TurnPosture.resolve(body)     ← boundary
maiaService.ts:639              writerStudioTurn?: CanonicalTurn|null  ← MaiaRequest has NO posture field
writersStudioCognition.ts:113   meta: { userId, exchangeId }           ← no sanctuary signal
maiaService.ts:2689             const turnPosture = TurnPosture.resolve(meta)  ← SECOND posture
```

`turnPosture.ts:11` — *"resolved **ONCE** per request at the serving boundary and
passed **by reference** to every content writer"*; `:40` — *"Absence of any signal
is an ordinary turn."*

⛔ So a Sanctuary Writer turn resolves **sanctuary** at the route and in
`CanonicalTurn.sovereignty`, and **normal** inside `getMaiaResponse` — which then
governs state-vector storage, `TurnsStore` persistence and memory writes.
⭐ **A violation of a written contract, not an inference.**

### Fourth item — ⛔ A CONTAINMENT LAW, NOT A CENSUS

`beginCanonicalGeneration` passes `meta: { userId, exchangeId }` only. Whatever
else `getMaiaResponse` reads from `meta` on this path is **absent by
construction**.

⛔ **DO NOT turn this into an organism-wide `meta` census.** That would reopen
whole-organism machinery this lane has no authority over. It becomes a bounded
rule instead:

> ⭐ **A Writer's Studio turn may not silently derive sovereignty- or
> persistence-relevant state from an incomplete legacy `meta` object.**

`TurnPosture` is the **proven** violation. While making 01A, if another `meta`
default demonstrably changes:

```text
privacy / Sanctuary behaviour
persistence
canonical identity
admitted participant membership
```

**STOP and name that specific field before broadening the repair.** ⛔ Do not
enumerate unrelated legacy consumers.

## 5.1 · THE CROSSING ORDER — the shape the runtime must take

```text
authorize Focus
→ construct producers
→ canonical adjudication
→ render admitted Writer turn
→ perform any lawful pre-handoff gates
→ invoke response-producing canonical model
→ signal handoff
→ confirmDisclosureCrossed()
→ await model result
```

⛔ **Not:**

```text
start getMaiaResponse()
→ confirm
→ eventually reach model
```

⭐ **Do not infer handoff merely because `getMaiaResponse()` returned a Promise.**
The acknowledgement must be emitted **from** the Writer canonical
response-producing seam.

### On the two H2 categories, restated as repairs

```text
RCN            exclude / bypass RCN response production for a properly typed
               Writer's Studio canonical turn.
               ⛔ Do not redesign RCN globally.

field safety   a legitimate refusal before handoff:
                 no Writer model handoff · no disclosure confirmation
                 receipt remains non-crossed · the refusal may be returned
               ⛔ Never force unsafe content through merely to create a crossing.
```

## 6 · IF AND ONLY IF RECOVERY AGREES WITH THE RECORD

Continue the same lane as **FOCUS-PRODUCER-01A**. A contained runtime-binding
repair, **not an architecture reset**. Implement only what closes H1–H3.

Hostile falsifiers required:

```text
H1  moving the acknowledgement before actual model invocation        → RED
H2  forcing RCN / a pre-canonical responder on a Writer turn
    must not yield an ordinary Focus response AND a crossed receipt
H3  Sanctuary Writer turn carries the same trusted TurnPosture through
    consent, cognition and persistence; substituting normal           → RED
```

⭐ **And one POSITIVE proof, not only hostile ones:**

```text
pre-handoff field-safety refusal → NO crossed receipt
```

Preserve P1–P8.

```text
WRITERS_STUDIO_FOCUS_ENABLED   off
HUMAN WITNESS                  HOLD
#1275                          FROZEN
```

⛔ Do not enable the route. Do not spend the seven-step human witness.

## 7 · REPORT WHEN COMPLETE

```text
recovered branch / HEAD
relationship to a5fbafc8a
material divergence found?  YES / NO

H1   verified seam · repair · hostile falsifier
H2   RCN handling · field-safety handling · hostile falsifier
H3   trusted posture path · persistence proof · hostile falsifier

P1–P8   status
H1–H3   status

tests
typecheck / regression comparison
new commit SHA

WRITERS_STUDIO_FOCUS_ENABLED   OFF
human witness                  UNSPENT
production                     UNTOUCHED
```

## 8 · Lanes that are NOT yours

```text
claude/maia-turns-derivative-custody   @ aed7ebbb3   B5 derivative custody — SEPARATE
claude/focus-disclosure-contract       @ 56606ff3f   Lane A — receipt design on HOLD
claude/ws-field-substrate-integration  @ 18d8c7004   PR #1275 — FROZEN
```

⛔ **None of these inherits Writer's Studio work merely because a chat
disappeared.**

---

> **Construct participation once. Let tiers vary strategy, never membership.
> Confirm disclosure only when the admitted Work actually enters
> response-producing cognition.**
>
> **And for 01A: do not record a crossing until the Work actually enters
> response-producing cognition, and do not let any other responder or privacy
> posture slip around that moment.**
