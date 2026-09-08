# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## INSTRUMENT READ — binding lane discipline

**Founder act** 2026-09-07, on the Notes witness
**Standing** BINDING on every act in this lane
**Occasioned by** three false instrument readings in a single session

---

> ## An instrument result is PROVISIONAL until the instrument's own timing,
> ## subject, and observation semantics are established.

```text
INSTRUMENT READ

1. BIND         exact served subject
2. WAIT         prove the state being queried has settled
3. READ         collect the observation
4. CORROBORATE  where feasible, compare against an independent layer
                (DB / rendered UI / server response / source)
5. REPORT       only then call PASS / FAIL / DEFECT
```

## The three readings that produced this rule

```text
count() == 0 before hydration        ≠  no object
tsc exits on config diagnostics      ≠  code typechecked
initial render says unavailable      ≠  hydrated capability state
```

1. **`tsc` in a container with no `node_modules`** exited on
   `tsconfig.ship.json` deprecation diagnostics without type-checking anything,
   and reported two errors. That reads as *clean*. It was **no measurement at
   all** — reported as a gate result before the subject was established.
2. **A rail probe read before hydration settled** and returned
   `notes=unavailable`. Reported as a defect. It was the pre-hydration render.
3. **`count()` does not auto-wait.** Counting `li` immediately after opening a
   panel races the fetch and returns 0 — indistinguishable from a note that was
   never written. Reported as `WITNESS FAIL`. The row was in the database and
   rendering correctly throughout.

**All three were reported as findings before the instrument was understood.**
None was a defect in the code.

## A FOURTH READING — and the one the repo had already answered

```text
prose describing a prohibition   ≠   the prohibited behaviour returning
```

Two FR-15 absence tests failed on the module's own docstring: it says *"there is
no `lastSupportedAt`, no cadence"*, and a scan for `lastSupportedAt` matched the
sentence saying it is absent. **A file that documents its own compliance fails a
scan looking for the thing it documents.**

This repository had already hit it and already answered it — the Circles
verifier's **C6 and C21** strip comments before scanning, for exactly this
reason, after C21 failed on a page whose prose said *"nothing here reads
`circle_invites`"*. The founder's ruling then applies unchanged here:

> *A prose ban must never read as the banned behaviour returning.*

**The reusable rule:**

> ### An absence test must examine EXECUTABLE SURFACE, not prose describing the prohibition.

Practically: strip block and line comments before any scan asserting something
is *not* there. Presence assertions about documentation may still read raw
source — they are asking a different question.

This one belongs to a different family from the three above. Those were timing
and subject errors — an instrument read before its subject had settled. This is
a **scope** error: the instrument read the right subject at the right time and
could not tell code from commentary about code.

## A FIFTH READING — TEMPORAL ADJACENCY IS NOT CAUSAL ATTRIBUTION

```text
a response matching the endpoint   ≠   the response to the act you just performed
```

A witness registered `waitForResponse` before clicking "met" and caught the
still-in-flight PATCH from the **previous** click — a grant change, whose null
occasion is correct — then printed it under the MET label. It read as a defect
in code that was behaving exactly as ruled.

**An instrument must BIND an observation to the act that caused it**, exactly as
a founder witness binds to the served commit. Matching the endpoint is not
binding; arriving next is not binding.

## THE DISCIPLINE, AT FOUR LAYERS

The same epistemic move, asked four times:

```text
SOURCE     what code was actually served?
ACT        what action actually occurred?
RESPONSE   which observation actually belongs to that act?
READ       what does that observation actually establish?
```

Every false reading in this session failed at one of these four and at no other.

## A SEVENTH FAILURE — AND THE NASTIEST, BECAUSE NOTHING LOOKED WRONG

The lane built for a day on a branch **28 commits behind canonical**, missing the
entire Studio atmosphere system, the Appearance control, and the rewritten
Develop room (`91414f2ba`). Notes and Goals were correct, tested, witnessed —
**and designed against a Studio that no longer existed.**

```text
everything internally correct   ≠   built against the current product
```

No test could see it. No conflict announced it. A founder looked at the screen
and said *"this build is strange."*

### MANDATORY PRE-BUILD CUSTODY CHECK

```bash
git fetch origin

git rev-list --count HEAD..origin/clean-main-no-secrets
# must be 0 before substantial product work

git merge-base --is-ancestor origin/clean-main-no-secrets HEAD
# must succeed
```

This joins binding a witness to its served commit. **Bind the witness to what
was served; bind the BUILD to current canonical.**

### THE COMPANION RULE, from the duplicated D4 repair

Canonical already carried the D4 fix — `WS-WORKDRAWER-01`, the same founder
ruling, with its own module and better copy. A second implementation was written
without knowing.

> ### Before implementing a ratified repair, search current CANONICAL for the ruling and the capability — not merely the current branch.

The GOVERNING-RECORD RULE said to follow a pointer when documentation names one.
This is its other half: **look for the thing itself, in the place the product
actually lives**, before building it again.

## Why this is not ceremony

> **It prevents the testing apparatus from manufacturing defects.**

A manufactured defect is worse than a missed one: it spends attention on
repairing something that works, and — the real cost — it teaches everyone
downstream to distrust the instrument that is supposed to be the evidence.

Step **4 · CORROBORATE** is the one that catches this class. Each false reading
above dissolved the moment a second layer was consulted: the database held the
row, the rendered HTML held the body, the running compiler had never run.

## Applied

`scripts/witness/notes-v1-witness.mjs` carries the count-without-waiting trap in
its header. Every gate figure in this lane's records now names how it was
obtained, not only what it said.
