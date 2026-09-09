# FOCUS-PRODUCER-01 — the writers_studio canonical participation path

**2026-09-09 · BUILT · P1–P8 GREEN · route still DISABLED · human witness HOLD ·
`#1275` FROZEN.**

> ⭐⭐ **Construct participation once. Let tiers vary strategy, never membership.
> Confirm disclosure only when the admitted Work actually enters cognition.**

## The crossing, amended

*"Not the answer, the handoff"* stands. What changed is **what qualifies as the
handoff**. The first implementation confirmed the receipt immediately after
invoking the cognition port — and that port placed the text in a `meta` field
nothing read. **A receipt could have been perfectly valid while describing content
canonical cognition never rendered.**

```text
authorized → typed producers → MIPA admits → CanonicalTurn
  → renderer includes them AT EVERY TIER → generation begins   ← ⭐ THE CROSSING
    → receipt confirmed → generation awaited
```

The port is now two-phase. `prepare()` constructs, adjudicates and renders;
`generate()` begins the model handoff **without being awaited**, so the receipt is
confirmed at the moment of crossing and generation is awaited after. A failure in
prepare → no handoff, no confirm, receipt stays `attempted`. A failure after →
receipt stays `crossed`.

⛔ No false `crossed` rows exist: the route has never been enabled.

## What was built

| | |
|---|---|
| `lib/writers-studio/canonicalWriterTurn.ts` | typed participation → **two separate** CandidateBlocks → `constructCanonicalTurn` into `writers_studio` → `renderWriterTurn` (proof or null) → `tierInvariant` |
| `lib/writers-studio/writersStudioCognition.ts` | rewritten two-phase; ⛔ **`meta.writerFocusContext` deleted, not activated** |
| `lib/sovereign/maiaService.ts` | typed top-level `writerStudioTurn?: CanonicalTurn`; one branch **before** the tier switch |
| `app/api/writers-studio/focus/route.ts` | `resolveCanonicalIdentity(request)`; `memberId` derived from the verified identity |

⭐ **One identity truth.** `constructCanonicalTurn` refuses any identity not minted
by `resolveCanonicalIdentity`. The route mints once and carries it; `memberId` for
manuscript ownership comes *from* that identity. ⛔ No `getMemberIdFromRequest`, no
`x-member-id`, no `meta.userId` anywhere on this path.

⭐ **Producers stay separate.** `member.writer_focus` carries the member's act of
placing attention and **contains no Work text**; `retrieved.writer_work_context`
carries the material that act made readable. A falsifier asserts the separation,
because fusing them would erase exactly the authorship distinction MIPA exists to
preserve. ⛔ `computed.writer_structure` is **not** constructed: this lane
retrieves no genuine structural position, and *a registered capability is not
evidence that its input exists this turn.*

⭐ **The branch replaces the legacy assembly; it does not stand beside it.** It is
an `else` over the tier switch, so `fastPathResponse` / `corePathResponse` /
`buildMaiaWisePrompt` / field addenda never run for this room. Running them would
let MIPA govern one portion of the prompt while the old machinery placed excluded
material next to it — **invisibly**. That is P8, and it is the strongest gate here.

## Gates — P1–P8

| | | |
|---|---|---|
| P1 | no meta channel — the dead field is gone from the repository | 3 |
| P2 | typed producers only, constructed at origin, never fused | 3 |
| P3 | room adjudication — ⛔ `sovereign_chat` admits neither | 2 |
| P4 | Work ≠ instruction — ask is the cognition request | 2 |
| P5 | tier invariance + **both mutations** | 4 |
| P6 | manifest truth: admitted **AND** ordered **AND** in the prompt | 2 |
| P7 | hostile legacy bypass + mutation | 2 |
| P8 | no double participation | 3 |
| — | identity stays canonical | 1 |

⭐ **P5's two mutations both go RED as required**: dropping the Work producer from
one tier, and adding a participant to one tier after construction. `tierInvariant`
runs *before* the handoff, so a tier-specific disappearance **refuses the
crossing** rather than producing a Focus that works in FAST and vanishes in CORE —
a bug no human witness could diagnose by feel.

⭐ **P6 asserts all three clauses**, closing the *"manifest says it participated,
renderer dropped it"* gap: `renderWriterTurn` returns `null` unless both producers
are admitted, appear in `participantOrder`, and their text is in the system prompt.

⚠️ **Instrument faults, both the same shape as before.** P1's first draft scanned
raw source and failed on the comment documenting the removal (third occurrence of
the C21 lesson — comments are stripped, tests excluded). And the identity fixture
reached Next's request-scoped `cookies()`; mocking the auth reader keeps the
identity **minted by the real resolver**, which is the property under test.

**Gates:** `lib/disclosure` + `lib/writers-studio` **169 passed · 0 failed** ·
canonical-turn suites unbroken · typecheck 228 vs baseline 239 · 0 regressions ·
`check:no-supabase` clean.

## ⛔ Standing

`WRITERS_STUDIO_FOCUS_ENABLED` stays **off**. The seven-step human witness is now
lawfully runnable for the first time — step 4 could not have passed before this
lane — but it has **not** been run, and no real Focus has crossed.

**FOCUS-PRODUCER-01 BUILT · HUMAN WITNESS HOLD · `#1275` FROZEN.**

---

## FOCUS-PRODUCER-01A — three defects the P-gates did not falsify

> ⭐⭐ **Do not record a crossing until the Work actually enters response-producing
> cognition, and do not let any other responder or privacy posture slip around
> that moment.**

### H1 · `crossed` was confirmed before the model was reached — REPAIRED

`beginCanonicalGeneration()` returned `getMaiaResponse()`'s promise, and the
crossing confirmed on it. But entering that service is followed by turn counts,
history, identity backfill, field safety, PFI/Bloom/Atlas, routing, RCN and the
context inventory **before** the canonical `generateText` call.

> ⭐ **Starting the service is not starting cognition.**

`generate()` now returns **two** promises — `handoff` and `result`. The signal is
emitted **inside the canonical branch, immediately after `generateText` is
invoked**, and `.finally()` resolves it `false` if the service ever returns
without reaching the model. `performFocusCrossing` awaits `handoff` and confirms
only on `true`; otherwise the receipt stays `attempted` and the writer gets the
non-crossing §3a state.

### H2 · Pre-canonical responders could answer without the Focus — REPAIRED

The sharper P8 hole: **RCN** and **field safety** both return before the Writer
branch. A high-confidence RCN answer would have reached the writer while the Work
never reached a model — *the inert-Focus defect in a new location, with a
`crossed` receipt beside it.*

- **RCN is excluded outright** on a Writer turn (`WriterCanonicalOnly`), before
  `maiaRcnProcess` is called. Not conditional.
- **Field safety may still refuse** — that is its job — but it returns before the
  model, so `onHandoff` never fires. ⭐ A refusal is a **non-crossing**, not a
  Focus answer produced without the Focus.

⭐ The falsifier asserts the stronger thing: on a bypass the writer is handed
`response: null`, **not** the bypass answer dressed as a Focus reply.

### H3 · One turn had two privacy postures — REPAIRED

The route resolved a real `TurnPosture` and the CanonicalTurn carried it, but the
port passed only `{ userId, exchangeId }` and the service re-ran
`TurnPosture.resolve(meta)` — yielding `normal` while the consent row and the
turn said `sanctuary`. Downstream, both that posture **and** `meta.sanctuary`
govern state-vector storage, `TurnsStore` persistence and memory integration.

> ⭐ **One turn cannot have two privacy postures.**

The posture is now carried as a typed top-level input beside the turn; the service
uses `writerStudio?.posture ?? TurnPosture.resolve(meta)` — legacy callers
unchanged — and `meta.sanctuary` is **derived from that same object**, so the two
readings cannot diverge, and the derivation can only ever make a turn more
protective.

### Falsifiers — H1–H3 · 13 more

| | | |
|---|---|---|
| H1 | confirm follows the true handoff + ordering + **mutation** | 5 |
| H2 | no response bypass + **mutation** | 3 |
| H3 | one posture through consent, cognition and persistence + **mutation** | 5 |

⚠️ **Instrument note:** the H1 ordering falsifier first ordered a `result`/`handoff`
event array and failed because the *result* promise's own `.then` ran during the
microtask ticks — it was testing the fixture's scheduling, not the product. The
real property is simply that **no confirmation exists while the handoff is
unresolved**, and that is what it asserts now.

**Gates:** `lib/disclosure` + `lib/writers-studio` **182 passed · 0 failed** ·
canonical-turn + field suites unbroken · typecheck 228 vs baseline 239 ·
0 regressions · `check:no-supabase` clean.

**Standing: FOCUS-PRODUCER-01A CLOSED · route still DISABLED · human witness now
lawfully runnable and NOT RUN · `#1275` FROZEN.**

---

## Witness-readiness · W1 · W2

### W1 · A governed exclusion is not a failed capability

`WriterCanonicalOnly('rcn')` was thrown into RCN's generic non-blocking catch and
logged as *"Processing failed"* — an intentional constitutional exclusion wearing
the telemetry of an operational failure. Someone reading those logs later could
reasonably conclude RCN malfunctioned.

```text
🖋️ [RCN] excluded — writers_studio canonical participation owns the response path
```

is now emitted instead, and the failure log remains for real failures. ⛔ No
behaviour change; truthful instrumentation only.

> ⭐ *A refusal witness must prove the intended refusal, not merely prove that the
> operation failed* — and the same discipline governs the line a witness reads.

### W2 · ⭐⭐ The ghost turn — the residue H2 did not catch

When field safety refused **before** the canonical handoff, `getMaiaResponse`
still called `addConversationExchange(...)`, persisting the safety answer into
session history and `conversation_turns`. H1 then correctly reported
`handoff = false`, so the Writer surface showed a non-crossing state with **no
response** — while continuity remembered an answer the member never received, and
would carry it into the next turn's history.

> ⭐⭐ **A pre-handoff refusal may not leave behind a response the writer never
> received.**

On a Writer turn that persistence is now skipped. ⛔ The refusal still travels
outward in the return value — it is information the surface may present. What it
may not do is **write itself into the conversation from inside the service.**

⚠️ Sanctuary already suppressed this write once H3 derived `meta.sanctuary` from
the carried posture. **Ordinary Writer turns did not**, which is precisely why the
defect was invisible: the protected case was safe and the common one was not.

### Falsifiers — 8 more

⭐ **The substantive one is not the guard, it is the audit**: a falsifier
enumerates **every** `addConversationExchange` call preceding the canonical branch
and requires each to be guarded or unreachable. There are exactly two — field
safety (now guarded) and RCN's early return (unreachable, because RCN is excluded
before it runs) — and the tail sites are asserted to fall *after* the crossing. A
mutation removing the guard makes that audit go RED.

*The founder's criticism of the earlier H2 falsifier was right: it verified the
response was not returned, and never exercised or inspected persistence. A test
that checks the visible half of a defect proves nothing about the invisible half.*

**Gates:** `lib/disclosure` + `lib/writers-studio` **190 passed · 0 failed** ·
canonical-turn + field unbroken · typecheck 228 vs baseline 239 · 0 regressions ·
`check:no-supabase` clean.

**Standing: FOCUS-PRODUCER-01A FULLY CLOSED · W1 · W2 done · route still
DISABLED · seven-step human witness now unblocked at code level · `#1275` FROZEN.**
