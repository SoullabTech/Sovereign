# C4 DISCRIMINATORS — proposal-corpus census · arrival finding · O1 frozen

```text
Authority      FR-W5 · b4bb6252 · census result 2af6bafb
Mode           READ ONLY
Evidence class FOUNDER-READ throughout. ⛔ Jarvis read no source and no database.
EDIT           ⛔ NONE          IMPLEMENTATION ⛔ NOT PERFORMED
```

---

## 1 · Proposal-corpus census (founder-read, `maia_focus_witness`, no change)

```text
4 proposal rows TOTAL — ⭐ ALL FOUR target the SAME section:
   position 22  ·  Section 23 of 174  ·  1,355 characters

├─ 2 ALREADY ACCEPTED
└─ 2 UNACCEPTED
   ├─ inspection_only    a734…   current expected text PRESENT · locus begins ~char 899
   └─ member_acceptance  972…    current expected text ABSENT
```

⭐ **There is no X/Y pair at all**, let alone one separated beyond the virtualization window. The
only presently-matching unaccepted proposal is the one already under witness in Section 23.

### Consequences for the discriminator set

```text
O1   ✅ CONSTRUCTIBLE
O2   ⛔ NOT CONSTRUCTIBLE — no second current proposal near a section START to give the
                            required geometry contrast. Using an accepted or stale proposal
                            would CHANGE THE QUESTION rather than answer it.
O3   ⛔ FROZEN · UNSPENT · NOT CONSTRUCTIBLE
```

⭐⭐ **`UNCONSTRUCTIBLE` is not `INVALID`.** `INVALID` implies an attempt was made and spoiled. O3
was never performed. ⛔ And manufacturing a proposal B to rescue it would convert a read-only
discriminator into **fixture construction** — a change of evidence class, not a change of setup.

---

## 2 · ⭐⭐ ARRIVAL FINDING — the substrate fact that reshapes O1

```text
Proposal ARRIVAL itself invokes moveToProposal() AUTOMATICALLY, before any SHOW CHANGE.
The `jumpedFor` effect calls the SAME movement path once, as soon as the proposal target
is ready.
```

Two smaller corrections in the same read:

```text
⚠️ A fresh Whole load does NOT mean "nothing mounted."
   Whole begins with an initial virtualized window { first: 0, last: OVERSCAN*2 },
   while SHELLS exist for EVERY section.

⚠️ Route place, Whole mount state, and automatic proposal movement are THREE DISTINCT THINGS.
   The route's `s=` is read once into section-writing state; `wholeOpensAt` starts null.
```

### ⛔ Why this invalidates the original O1 draft

```text
⛔ WRONG   fresh load → first SHOW CHANGE → watch
```

By the time the button is available, an **automatic proposal-arrival move may already have
mounted and geometrically warmed Section 23.** That draft would have attributed to *"first asked
return"* state created by **arrival**.

### ⭐ The rule this establishes

> **Do not collapse automatic arrival and voluntary return merely because they call the same
> top-level movement function.**

⭐ That is **C1 / F6 in temporal form**: same mechanism name, different act. The lane has now
caught this shape three times — across views (C1), across same-named schema objects (F6), and now
across time.

### ⚠️ What it also means for the SEALED witness

```text
"first asked return"  ≠  "first movement to that section"
```

Arrival had already moved there. What re-establishes coldness is the **away-condition** — the
member scrolling away, moving the virtualization window off the target. ⛔ **That is why Phase A
step 5 is load-bearing**, and why substituting a different navigation act "for convenience" voids
the run rather than merely weakening it.

---

## 3 · O1 — FROZEN, RATIFIED AS AMENDED (founder, 2026-09-14)

```text
O1 · FIRST-ASKED-RETURN POST-LANDING SETTLE OBSERVATION

PURPOSE
  Test K1: whether the first ASKED return reaches a geometry that continues moving after
  its section-shell landing — WITHOUT assuming that proposal ARRIVAL and asked RETURN are
  the same act.

PRECONDITIONS
  runtime          FRESH DOCUMENT LOAD
  view             Whole
  proposal         existing witnessed proposal in Section 23; none created
  code/schema      unchanged
  instrumentation  none added
  asked returns    ZERO prior SHOW CHANGE presses in this runtime

  ⚠️ Fresh load does NOT mean "nothing mounted."
  ⚠️ Proposal ARRIVAL automatically calls moveToProposal once.
     Arrival must be allowed to finish before the asked-return observation.

PHASE A · ARRIVAL CUSTODY — ⛔ NOT THE O1 DATUM
  1. Fresh-load the existing proposal in Whole.
  2. Touch nothing.
  3. Allow the automatic proposal-arrival movement and subsequent rendering to become
     visibly still.
  4. Record only:
       arrival locus visible?             YES / NO
       unbidden movement after arrival?   YES / NO
  5. Establish the SAME away-from-target condition used by the sealed Whole/first witness.
     ⛔ Do not substitute a different navigation act merely for convenience.

     If the sealed witness's away-condition cannot be reproduced faithfully:
         O1 = INVALID · STOP

PHASE B · O1 DATUM
  6. Press SHOW CHANGE exactly once.
  7. Touch nothing thereafter.
  8. Watch from the asked-return landing until visibly still.

RECORD
  a. did the exact locus appear at any point?                          YES / NO
  b. did content move AFTER asked-return landing, no further input?    YES / NO
  c. where did it terminate?        LOCUS-ADDRESSED / SECTION-ADDRESSED

CLASSIFY   SHIFT-OBSERVED | NO-SHIFT | INVALID

INVALID IF
  automatic arrival had not visibly settled before the away-condition
  away-condition differed materially from the sealed witness
  a prior SHOW CHANGE had run
  any input occurred after the O1 press
  stillness could not be judged

STOP
  no second press · no repair · no mechanism claim from the observation
```

### Adjudication matrix — narrowed

```text
SHIFT-OBSERVED + locus appeared then displaced
  → K1 strongly supported. A section-shell landing can expose the locus transiently
    and lose it as geometry settles.

SHIFT-OBSERVED + locus never appeared
  → K1 remains live, but NOT as the simple "right landing, then displaced" account.

NO-SHIFT + SECTION-ADDRESSED
  → K1's POST-ASKED-LANDING settle account is falsified FOR THIS RUN.
  → the Whole/first vs Whole/second discrepancy still requires another distinction.
  ⛔ Do NOT yet promote K4, and do NOT infer that first and second target differently.

NO-SHIFT + LOCUS-ADDRESSED
  → the sealed Whole/first FAIL did not reproduce in this cold run.
  → ⛔ the sealed FAIL REMAINS SEALED.
  → first-asked failure becomes context-dependent / intermittent evidence, and any
    eventual repair must account for that.

INVALID
  → C4 unchanged.
```

### ⚠️ Prediction — amended. Jarvis's draft sentence was too strong

```text
⛔ WRONG (Jarvis draft)   "NO-SHIFT + locus never appeared → geometry alone SHOULD have
                           exposed it."
```

⛔ **Character fraction is not viewport geometry.** Wrapping, rendered width, line height,
proposal treatment, section heading and actual viewport height can all move character 899 below
the fold. Corrected in place:

```text
✅ PREDICTION
   Because the locus is LATE-BUT-NOT-TERMINAL in Section 23, stable shell-at-start geometry
   MAY expose it without a locus consumer. This makes an incidental-geometry PASS PLAUSIBLE.

   ⛔ It does NOT establish that the locus MUST be visible under stable geometry.
```

⭐ `899 / 1355` is **useful prior evidence** that makes K3 less comfortable. It is **not a
falsification premise.**

### Phase A may itself be informative — as a SEPARATE reading

If the fresh automatic arrival visibly lands and then shifts, that is direct support for the
virtualization-settle family **before** the asked-return datum is spent.

```text
⛔ It stays a SEPARATE reading. Arrival and voluntary return are not collapsed.
```

---

## 3a · ⛔⛔ O1 SPEND BLOCKED — the sealed away-condition is not recoverable

⭐ Found **before** contaminating O1, which is the point of freezing a procedure before running it.

```text
⛔ The durable record does NOT preserve the exact away-condition of the sealed
   `Whole / first = SECTION-ADDRESSED — FAIL`.
```

### Verified against the record, not assumed

```text
"well away" appears ONCE in the rulings record — in the COLD SECTION / FIRST
diagnostic procedure (a different act, a different cell).

`Whole / first` appears 15 times — ⭐ ALWAYS AS A RESULT, NEVER WITH A PROCEDURE.
```

⚠️ **And the asymmetry is explainable, which makes it worse rather than better:**

```text
Whole / second   away-condition IS recoverable — from this record's OWN HISTORY
                 (045e7498: "scroll well away, SHOW CHANGE")
Whole / first    ⛔ NOT recoverable — it entered as an ALREADY-SEALED PRIOR WITNESS,
                 carried in as a verdict with no procedure attached
```

⭐ The one cell the repair is scoped to is the one cell whose gesture was never written down.

### ⛔ What is NOT enough

```text
⛔ copying the passive-scroll procedure
⛔ copying the cold-Section procedure
⛔ reconstructing what "probably happened"
```

⛔ Any of those would violate the rule O1 itself carries — **no substituted navigation act for
convenience** — and would do it in the one place where the substitution is invisible in the result.

### ⭐⭐ FOURTH INSTANCE of the family

```text
C1  same control, same handler        different return mechanism     — across VIEWS
F6  same table name                   different object               — across SCHEMA
—   same movement function            different act                 — across TIME
⭐  SAME WORDING NEARBY               DIFFERENT HISTORICAL ACT       — across THE RECORD
```

> **Neighbouring procedures are evidence about their own cells. They are not authority to
> reconstruct a missing one.**

### The two lawful ways forward — ⛔ they are NOT equivalent

```text
P1  RECOVER    the original founder gesture from a stronger source — the originating
               session's transcript, a screenshot sequence, or the founder's direct
               recollection stated as such.
               → O1 then bears DIRECTLY on the sealed FAIL. This is the path O1 was frozen for.

P2  RE-SEAL    declare an away-condition explicitly, seal a NEW cold Whole / first cell under
               it, then run O1 against THAT cell.
               ⚠️ This CHANGES THE QUESTION. O1 would then adjudicate the new cell, and the
               sealed historical FAIL would become a cell whose conditions are unknown —
               ⛔ still sealed, but no longer the thing under investigation.
```

⛔ **Not chosen here.** P2 is legitimate but must be taken knowingly, and its cost recorded at the
moment of choosing — not discovered later when the repair is adjudicated against evidence that
turns out to be about a different act.

---

## 4 · Standing

```text
LANE   OPEN · FR-W5 authorized
C4     ⛔ UNRESOLVED
O1     ✅ RATIFIED AS AMENDED · FROZEN
       ⛔ SPEND NOT PERMITTED — sealed away-condition unrecoverable (§3a)
       ⛔ Jarvis's original draft NOT frozen verbatim
O2     ⛔ unconstructible on present corpus
O3     ⛔ frozen · unspent · unconstructible
EDIT   ⛔ none
NEXT   ⛔ BLOCKED — recover the sealed witness's away-condition (P1), or knowingly
       take P2 and record its cost. RUNTIME: do not touch yet.
Gate B CLOSED        Gate C CLOSED (blocked by F6′)
```

> ⭐⭐ **Arrival has already acted before return is asked for.**
> **O1 must witness the RETURN — not accidentally witness the ARRIVAL.**
