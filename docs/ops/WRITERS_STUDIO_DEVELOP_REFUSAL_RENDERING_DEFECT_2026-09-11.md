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
