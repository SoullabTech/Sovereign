# Writer's Studio · Develop — refusal rendering defect

**Observed in production**, `soullab.life/writers-studio/develop`, 2026-09-11.
⛔ **OBSERVED ONLY. Not diagnosed to root cause, not repaired, nothing deployed.**

## What was seen

Three `POST /api/sovereign/manuscripts/<id>/readings` calls returned **409**. The
Develop panel then displayed, together, in one state:

> This work has changed since the last version you kept. Keep a version in the
> Writer Canvas, then ask MAIA to read again. **Nothing has changed.**
>
> The Studio could not determine the cause.

## Classification — founder, 2026-09-11

**TRUTHFULNESS / STATE-RENDERING DEFECT.** ⛔ Not copy polish.

Those three propositions are **mutually incompatible in the same response
state**: the work changed, the work did not change, and the cause is unknown.

> ⭐⭐ **A system should never state, deny, and disclaim knowledge of the same
> condition at once.** *That is the UI equivalent of the epistemic discipline
> developed everywhere else in this programme — and a surface that asserts and
> retracts in one breath teaches the member that none of its statements are
> load-bearing.*

## The architectural fact that matters

**The backend refusal is already typed.** `app/api/sovereign/manuscripts/[id]/readings/route.ts`
returns `{ refusal, stage, detail }` and maps stage + refusal to a status
(`statusFor()`), with `capture` and `recover` both able to yield 409. Its own
header comment states the intent plainly: *"the stage and the typed refusal come
back so the surface can say what did not happen."*

⭐ **So the repair probably does not require inventing better explanatory prose.**
The server already names which condition obtained; the surface is not obeying it.

```text
   WANTED                          OBSERVED
   one typed refusal               409
        ↓                            ↓
   one interpretation           several fallback explanations
        ↓                        render simultaneously
   one coherent message
```

## Where the copy lives

- `lib/writersStudio/developRefusalCopy.ts` — holds `CAUSE_UNKNOWN_LINE`
  (*"The Studio could not determine the cause."*)
- `app/writers-studio/develop/DevelopRoom.tsx` — holds the *"Nothing has
  changed."* line
- `app/writers-studio/__tests__/classifyRefusalCopy.test.ts` — an existing test
  file over this classification, so the seam is already under test and a repair
  has somewhere to be falsified

⛔ **None of these files was read beyond locating the strings, and none was
changed.**

## Standing

```text
defect                OBSERVED IN PRODUCTION
classification        TRUTHFULNESS / STATE RENDERING
root cause            NOT ESTABLISHED
repair                NOT AUTHORIZED · SEPARATE LANE
relation to RC-GEN-01 NONE — recorded here to keep it out of that lane
```


---

## REPAIR — one of the two authorized repairs landed; the other is BLOCKED by ratified doctrine

### ⭐ REPAIR 2 — LANDED, and it alone fixes the production case

`causeLineFor(sentence, axes)` in `developRefusalCopy.ts`: the cause line
renders only beside the **neutral** outcome, identified by identity with
`OUTCOME_SENTENCE` rather than by re-deciding which refusals are named — a second
copy of that branch could drift out of step; identity cannot.

**Falsifiers** — `lib/writersStudio/__tests__/developRefusalCopy.namedRefusal.test.ts`,
which imports `refusalSentence` directly (now exported) instead of scanning
source text, the method that produced the C21 false positive in the Circles
verifier.

⭐ **Falsified against the pre-repair renderer: 1 of 5 goes red** — and *which*
one is the point. Only `revision_not_current + a KNOWN cause` discriminates,
because the unknown path is governed by O-3, not by this repair. The test file
was written with a genuinely-known case for exactly that reason, and the result
confirms the design: **Repair 2 has its own falsification and cannot hide behind
Repair 1.**

### ⛔⛔ REPAIR 1 — REVERTED. It contradicts a ratified obligation.

```text
refusalTruth.test.ts:140   O-3 · an unknown cause is named as unknown
  expect(causeLine({ completion: 'unknown', attribution: 'unknown' }))
    .toBe(CAUSE_UNKNOWN_LINE);
```

**The behaviour I diagnosed as a bug is pinned by a test, under a named
obligation, from this lane's own constitution** (`WS-DEVELOP-REFUSAL-TRUTH-OBS-01`,
2026-09-08):

> **O-3 · An unknown cause is named as unknown.** The failure mode this lane
> exists to prevent is a confident wrong attribution… *Falsifier:* a refusal
> whose cause cannot be classified renders copy that **claims neither**.

⛔ **I did not edit that test to fit the repair.** Making a ratified obligation
pass by rewriting its falsifier is the worst available act here.

⭐ **And Repair 1 turns out to be unnecessary: Repair 2 alone fixes the
production screenshot**, with O-3 fully intact. The contradiction was never
*"cause unknown"* as such — beneath the neutral sentence that line adds a true
fact. It was that line appearing beneath a sentence that had **already named the
cause.**

### ⚠️ A REAL AMBIGUITY IN O-3, which is the founder's to resolve

Its **title** says *"named as unknown"* — an explicit line. Its **falsifier**
says only *"claims neither"* — which **silence also satisfies**. The existing
test implements the stronger, title reading. Both readings serve O-3's stated
purpose, since neither makes a confident wrong attribution.

### ⭐⭐ AND THERE IS A THIRD REPAIR THAT NEEDS NO DOCTRINE CHANGE AT ALL

The deeper defect is upstream, in the route:

```ts
const cause = outcome.cause ?? CAUSE_UNKNOWN;     // readings/route.ts:206
```

`CAUSE_UNKNOWN` means *"Nothing was learned"* — **we looked and learned nothing**.
But `revision_not_current` arises in `readState.ts` at the **capture** stage,
**before any model call**. For such refusals there was never anything to look at:
no completion and no attribution exist even in principle.

> ⛔ **Stamping a pre-inference refusal `unknown/unknown` asserts that a
> measurement was taken and came back empty. No measurement was taken.**

The module already distinguishes these: no axes → silence, *"an older server, or
a refusal raised before anything could be known."* **That second clause describes
capture-stage refusals exactly** — and the route's blanket default is what
prevents them from reaching it.

**Sending no axes for pre-inference stages** would restore that distinction, make
the silent branch reachable for the refusals it was written for, keep O-3
untouched for the refusals it was written about, and require no change to
`causeLine` at all.

```text
REPAIR 2     LANDED · tests green · 901/901 on the surrounding surface
REPAIR 1     REVERTED · collides with O-3 · NOT re-authorized
O-3 reading  title vs falsifier — FOUNDER QUESTION, unresolved
REPAIR 3     PROPOSED, not built — pre-inference stages send no axes
deploy       NOT DONE · NOT REQUESTED
```


---

## REPAIR 3 — LANDED. Absence and unknown are distinct statements again.

### ⭐ The domain layer already said so. Only the route disagreed.

```ts
/* WS-DEVELOP-REFUSAL-TRUTH-OBS-01. Present only where a model response
   existed to classify; a capture or recover refusal never reached one. */
cause?: RefusalCause          // commission.ts:46
```

**The distinction the founder ruled for was already constituted, in this lane's
own type, eight days before the defect was seen.** `cause` is optional, and
absent exactly where no causal inquiry occurred. ⛔ **One line in the route
erased it** — `outcome.cause ?? CAUSE_UNKNOWN` — and that single default is the
whole of the production defect.

### The repair

- **The default is gone.** `const cause = outcome.cause ?? null`.
- **New pure seam** `lib/manuscript/developmentalReading/refusalAxes.ts`:
  `axesForWire` **omits** absent axes rather than sending `unknown`, and
  `axesForRecord` writes `null`. The client already drops keys it did not
  receive, so absence arrives at the surface as absence and `causeLine`'s
  original `undefined` guard fires — **with O-3 untouched**.
- **`RefusalRecord.completion` / `.attribution` are nullable**, matching the
  convention already in that interface (`readerVersion: string | null`,
  *"Null when no response existed to attribute"*). An operator reading a record
  months later can still tell which question was never asked from which went
  unanswered (O-4).

⭐ **No change to `causeLine`. No change to O-3. No copy written.**

### Falsifiers — `refusalAxes.test.ts`, 7/7

```text
R3-1 capture-stage refusal, no cause   → absence preserved
R3-2 capture-stage refusal             → must NOT become CAUSE_UNKNOWN
R3-3 sought but unresolved             → CAUSE_UNKNOWN, and stays so
R3-4 known cause                       → preserved exactly
R3-5 round-trip                        → absent stays absent, unknown stays unknown
     end-to-end  capture + no cause    → named sentence only, no cause line
     end-to-end  neutral + CAUSE_UNKNOWN → OUTCOME_SENTENCE + CAUSE_UNKNOWN_LINE
```

⭐ **Falsified against the pre-repair default: 4 of 7 go red**, and the three
that stay green are exactly R3-3, R3-4 and the **O-3 composition** — the cases
the repair must not disturb. *The O-3 protection and the absence protection live
in the same file on purpose: they must never be repaired into each other.*

### ⚠️ TWO ARCHITECTURE GUARDS FIRED, AND THEY WERE RIGHT

Adding a module to the reading unit broke `readingBoundaries.test.ts` (*"is a
known module"*) and `developSurfaceCannotAct.test.ts` (*"reaches the reading
unit on its durable side only"*). **Neither was a defect in the repair.** A new
module must be **admitted deliberately**, with its import allow-list declared,
rather than appearing silently inside a boundary that exists to be narrow.

`refusalAxes` is admitted on the same terms as `scope`: **pure**, importing only
the reader's contract for types, carrying no behaviour. Reaching it cannot reach
anything else, and the gate those tests hold — *the surface may not perform the
read* — is untouched.

```text
REPAIR 1   REJECTED — conflicts with O-3
REPAIR 2   RATIFIED · landed
REPAIR 3   LANDED — root semantic repair
O-3        RETAINED, scope clarified: epistemic unknown only
tests      969/969 green across the Writer's Studio + reading surface
typecheck  no regressions
deploy     HELD · NOT DONE
```

> ⭐⭐ **"We looked and do not know" is not the same statement as "we never looked,
> because the process stopped before that question existed."** The type knew.
> The route did not. Now both do.


---

## ⭐⭐ THE REUSABLE FAILURE CLASS — founder, 2026-09-11

```text
semantic distinction exists in the domain model
        ↓
transport / default normalizes two states together
        ↓
UI becomes epistemically false
```

> ## Do not normalize absence into uncertainty.
>
> **absent** — this question never became applicable
> **unknown** — this question was applicable, but remained unanswered

⛔ **This is not a Writer's Studio finding.** Any `?? DEFAULT` at a boundary is a
candidate: the default is written to make a type total, and it silently answers a
question the system was never in a position to ask. The domain model here had the
distinction; a single coalesce at the wire destroyed it; and the surface then
stated something false in the member's own language.

⚠️ **Where to look for the same shape elsewhere**: any optional field made
required at a transport boundary, any `?? 'unknown'`, any enum whose vocabulary
contains a value meaning *"we don't know"* that is also used as a fallback for
*"not applicable"*.

---

## RUNTIME WITNESS — the original 409, on a real server

⛔ **NOT YET RUN. Deploy is held behind it.** Everything below the wire is
falsified by tests; **the one link they do not touch is the JSX call site** —
that the panel calls `causeLineFor(refusalSentence(...), ...)` and not the old
`causeLine(...)`. A render is the only honest witness of that.

**The panel carries its own instrumentation**, which is what makes this
observable without reading code:

```text
data-develop-refused      the refusal code
data-develop-completion   present ONLY when the axis was sent
data-develop-attribution  present ONLY when the axis was sent
data-develop-cause        present ONLY when a cause line rendered
```

### Reproduce

1. Open a Work in **Writer's Studio → Develop** whose draft has changed since
   the last kept version — the `revision_not_current` state. *(The observed case:
   `soullab.life/writers-studio/develop?m=848bbd74-d1ad-41a4-bfe0-238c34763e03`.)*
2. Choose any lens and **Ask MAIA to read this developmentally**.
3. Confirm in the Network panel: `POST …/readings` → **409**.

### Observe — five assertions, each one a thing the defect did

```text
1. the response body has NO `completion` and NO `attribution` key
      (before: both present as "unknown")
2. exactly ONE refusal paragraph renders
3. it is the named sentence — "This work has changed since the last version
   you kept…"
4. ⭐ NO element with [data-develop-cause] exists
      (before: "The Studio could not determine the cause.")
5. NO [data-develop-completion] / [data-develop-attribution] attribute exists
      on the panel
```

One line in the console checks 2, 4 and 5 together:

```js
({ panels: document.querySelectorAll('[data-develop-refused]').length,
   cause:  document.querySelectorAll('[data-develop-cause]').length,
   axes:   document.querySelectorAll('[data-develop-completion],[data-develop-attribution]').length })
// expected: { panels: 1, cause: 0, axes: 0 }
```

### And the case that must NOT have changed — O-3 still speaks

A refusal that **did** reach a model response and learned nothing must still say
so. On such a refusal:

```text
the neutral outcome sentence renders
AND [data-develop-cause] IS present, reading
   "The Studio could not determine the cause."
```

⛔ **If the cause line has disappeared there too, the repair has gone too far and
O-3 has been silently broken.** That is the failure mode this witness exists to
catch, and it is the reason the witness has two halves rather than one.

### No troubleshooting during the witness

Record what happens. ⛔ **A failure is recorded, not rescued and re-run** —
a witness that was intervened in is not a witness.

```text
code repair          CLOSED
boundary falsifiers  PASS  (7/7, 4 red against the defect)
surface regressions  PASS  (969/969)
typecheck            PASS  (no regressions)
runtime witness      NOT RUN
deploy               HELD behind it
```
