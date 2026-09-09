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
