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

## 3b · P1 RECOVERY RULE (founder, frozen 2026-09-14)

```text
Recover the historical gesture as evidence ABOUT the sealed cell.
⛔ DO NOT RETROFIT the recovered procedure INTO the old seal.

If recovered from:
  originating transcript   → CONTEMPORANEOUS RECORD
  screenshot sequence      → CONTEMPORANEOUS VISUAL EVIDENCE
  founder recollection     → FOUNDER RECOLLECTION · stated as such

In every case:
  Whole / first FAIL remains HISTORICALLY SEALED.
  ⭐ Recovery adds provenance; it does not REWRITE provenance.
```

⚠️ **This matters most for recollection.** A clear founder memory can legitimately unblock O1 —
⛔ but it must never later read as though the gesture had been **documented contemporaneously**.
The evidence class travels with the fact, permanently.

### Decision tree

```text
P1 · transcript / visual evidence found
      → recover exact gesture → classify provenance
      → ✅ O1 may be spent against the HISTORICAL FAIL

P1 · only founder recollection available
      → record the EXACT recollection + its evidence class
      → ✅ O1 may be spent, with that provenance EXPLICIT

P1 · cannot recover the gesture
      → ⛔ historical O1 remains BLOCKED
      → founder may KNOWINGLY choose P2

P2    → predeclare a new away-condition
      → seal a NEW Whole / first cell
      → ⛔ historical FAIL remains UNTOUCHED
      → the investigation now concerns the NEWLY SPECIFIED ACT, not the inherited one
```

```text
⭐⭐ P2 DOES NOT REPAIR MISSING PROVENANCE. IT CREATES NEW PROVENANCE.
```

### P1 recovery attempts — status

```text
FOUNDER prior-context trail    ⛔ no historical ACT REPORT recovered
JARVIS  current-session record ⛔ INHERITED SEAL ONLY — 53 lines carry the classification and
                                  the EARLIEST already reads "Whole / first is ALREADY
                                  RECORDED"; the originating gesture was never in this
                                  conversation to begin with
ORIGINATING transcript         ⚠️ PARTIAL RECOVERY — see §3c
SCREENSHOT sequence            ⛔ shows the Whole proposal surface and Section 23 context,
                                  ⛔ but does NOT preserve the PRECEDING SCROLL GESTURE
FOUNDER recollection           available if needed
```

---

## 3c · ⚠️ P1 PARTIAL RECOVERY — protocol recovered, performance unproved

The originating walk **was found** in the prior-conversation trail (morning, Sep 14). It
predeclared the `Whole / first` act as:

```text
Whole / first
→ scroll well away from the change
→ invoke SHOW CHANGE
→ observe where it lands
```

and that cell is the one carried forward as `SECTION-ADDRESSED — FAIL`.

```text
RECOVERED
  ✅ a CONTEMPORANEOUS PREDECLARED PROCEDURE: "scroll well away" → SHOW CHANGE → classify
  ✅ it immediately precedes the lineage of the sealed Whole / first FAIL

NOT YET RECOVERED
  ⛔ direct evidence that the historical observation was ACTUALLY PERFORMED under that
     exact away-condition

EVIDENCE CLASS
  CONTEMPORANEOUS PROTOCOL
  ⛔ NOT YET CONTEMPORANEOUS ACT RECORD
```

⚠️ The prior-context trail also records that the founder could not personally run that walk, and
that some runtime classifications came through relayed / screenshot evidence. ⛔ That is a reason
for the distinction to be kept, not smoothed.

```text
BEFORE   away-condition ABSENT ENTIRELY
NOW      away-condition RECOVERED AS PROTOCOL · historical performance UNPROVED
```

⭐ **The blocker narrowed. It did not disappear.**

### ⭐⭐ THE SAME LAW, A THIRD TIME IN THIS LANE

```text
execution_authority = member_acceptance   structurally PERMITTED to cross
                                          ⛔ ≠ a member PERFORMED the acceptance
Sep-13 witness                            SYSTEM ACCEPTANCE RECORD REAL
                                          ⛔ AUTHORIAL RATIFICATION UNRESOLVED
⭐ HERE                                   the PRESCRIBED gesture
                                          ⛔ ≠ the PERFORMED gesture
```

> **The specification of an act is not the occurrence of it.**

⛔ Reading the recovered protocol as history would be exactly the move the P1 rule prohibits —
*"this was the prescribed gesture"* silently becoming *"this is what happened."*

### ⭐ RULING — do NOT spend O1 on this recovery alone. Two lawful endpoints:

```text
E1  Find the ACTION REPORT immediately following the predeclared protocol — a founder message,
    or sufficiently sequenced visual evidence, establishing the protocol WAS FOLLOWED.
    → P1 succeeds with CONTEMPORANEOUS provenance.

E2  If that cannot be recovered, FOUNDER RECOLLECTION may bridge the final gap —
    ⛔ but only AS `FOUNDER RECOLLECTION`, permanently attached to the recovered
    contemporaneous protocol, ⛔ never promoted into a contemporaneous act record.
```

---

## 3d · ⛔ E1 EXHAUSTED — temporal adjacency is not act provenance

A targeted pass was run on the originating conversation for the missing transition:

```text
prescribed   "scroll well away → SHOW CHANGE"
sought       "I scrolled well away…" · "after scrolling away…" · any contemporaneous
             statement establishing the gesture OCCURRED
```

```text
FOUND        the PROTOCOL, and the OUTCOME REPORT
⛔ NOT FOUND  any user-authored past-tense statement establishing that the historical
             Whole / first observation actually followed the prescribed away-condition
⛔ SCREENSHOTS preserve Writer's Studio state, the proposal control and Section 23 /
             change context — ⛔ NOT the preceding scrolling act
```

```text
E1 STATUS   ⛔ EXHAUSTED as an ACT-RECORD source
```

### ⭐⭐ The loophole this closes

> **An outcome reported after a procedure does not prove every prerequisite of that procedure
> was executed — unless the record says so.**
>
> ⭐⭐ **TEMPORAL ADJACENCY IS NOT ACT PROVENANCE.**

⭐ This is the sharpest form the lane's recurring law has taken. It is the same sentence as
*a permission is not an act* and *a prescribed gesture is not a performed one*, now applied to
**sequence** rather than to permission or specification: proximity in a record is not causation,
and it is not performance either.

### ⚠️ OPEN — E2's own availability is NOT established

```text
The prior-context trail records that the founder COULD NOT PERSONALLY RUN that walk,
and that some runtime classifications arrived through RELAYED / SCREENSHOT evidence.
```

⛔ If the historical `Whole / first` walk was run by relay, then **founder recollection of the
GESTURE may not exist at all** — only recollection of the **report**. Recollection of a report is
not recollection of an act, and substituting one for the other would repeat, at the last possible
step, the exact error this section just closed.

```text
So E2 must first answer:  did the founder PERSONALLY perform that scroll and that press?
  YES → recollection may bridge, as FOUNDER RECOLLECTION, recorded exactly as remembered
        and attached to the recovered contemporaneous protocol
  NO  → ⛔ E2 is CLOSED TOO, P1 is FORMALLY EXHAUSTED, and P2 becomes the only lawful path
  UNSURE → ⛔ treat as NO. An uncertain memory of an act is not evidence of the act.
```

```text
⛔ DISQUALIFIER — remembering that the RESULT was `SECTION-ADDRESSED — FAIL` IS NOT ENOUGH.
   The recollection must be of PERFORMING THE SCROLL AND THE PRESS.
   ⭐ Report-memory and act-memory are DIFFERENT OBJECTS.
```

⭐ Photographic evidence cannot substitute either: the surviving screenshots show the Writer's
Studio surface and `SHOW CHANGE`, ⛔ but establish neither **who operated the interface** nor
whether the preceding scroll-away gesture occurred.

⛔ **No further retrieval and no runtime observation can substitute for this distinction.**
It is the one question with no external check on it, which is exactly why its threshold is strict.

---

## 3e · ✅ E2 ANSWERED — P1 CLOSES · O1 MAY BE SPENT

### The recollection, recorded verbatim

```text
FOUNDER, 2026-09-14, asked whether he personally performed the scroll-away and the press
for the historical Whole / first observation:

    "I did scroll well away, many times"
```

```text
EVIDENCE CLASS   ⭐ FOUNDER RECOLLECTION — permanently.
                 ⛔ NOT a contemporaneous act record.
                 ⛔ NOT transcript evidence.
                 ⛔ NOT documented historical procedure.
ATTACHED TO      the recovered CONTEMPORANEOUS PROTOCOL (§3c):
                 "scroll well away → SHOW CHANGE → observe where it lands"
```

### ⚠️⚠️ CLASSIFICATION CORRECTED — `YES` → `UNSURE` (founder, same day)

⛔ **Jarvis's classification at `b250cf7d` was `YES`. It was too permissive under this lane's own
rule.** Corrected here in place rather than replaced:

```text
QUESTION ACTUALLY ASKED
  Do I personally remember performing the scroll + press
  FOR THAT HISTORICAL Whole / first observation?

EVIDENCE ACTUALLY PRESENT
  I remember performing that gesture MANY TIMES during the walk.

RESULT
  ⛔ linkage to the SPECIFIC SEALED CELL is not remembered
```

```text
⭐⭐ HABIT-MEMORY ≠ INSTANCE-MEMORY
```

⭐ *"Many times"* makes it **plausible** that the sealed cell followed the protocol. ⛔ **And
plausibility is exactly what this entire provenance exercise has been refusing to promote into
performance evidence.** Accepting it at the last step would have surrendered the thing the eight
preceding acts were protecting.

⚠️ Jarvis flagged the residual but banked the `YES` anyway. ⭐ **Flagging a weakness and then
relying on it is not the same as refusing it** — the record kept the caveat and the conclusion
ignored it. That is the failure mode this correction closes.

### The clean statement

> **The founder remembers performing the scroll-away gesture repeatedly during the walk, but does
> not have an instance-specific recollection tying that act to the sealed `Whole / first`
> observation. Therefore E2 is `UNSURE`, not `YES`.**

⭐ This does **not** weaken the historical FAIL. It says only that **its exact gesture provenance
cannot be recovered.**

### P1 disposition — FORMALLY EXHAUSTED

```text
E2                     ⛔ UNSURE  → closes exactly like NO (pinned rule)
P1                     ⛔ FORMALLY EXHAUSTED — all five sources closed
O1 against the SEALED  ⛔ DO NOT SPEND
sealed Whole / first   ⭐ REMAINS HISTORICALLY SEALED, unchanged, unrewritten
P2                     ⭐ THE ONLY LAWFUL PATH

---

## 4 · Standing

```text
LANE   OPEN · FR-W5 authorized
C4     ⛔ UNRESOLVED
O1     ✅ FROZEN · ⛔ NOT SPENDABLE AGAINST THE SEALED CELL — P1 exhausted
       ⛔ Jarvis's original draft NOT frozen verbatim
O2     ⛔ unconstructible on present corpus
O3     ⛔ frozen · unspent · unconstructible
EDIT   ⛔ none
P1     ⛔ FORMALLY EXHAUSTED (§3e) — E2 = UNSURE · habit-memory ≠ instance-memory
       ⚠️ Jarvis's YES at b250cf7d corrected to UNSURE by founder, recorded in place
P2     ⭐ ELECTED — the only lawful path. Cost recorded at the moment of choosing:
       the investigation now concerns a NEWLY SPECIFIED ACT, not the inherited one.
       ⭐ P2 does not repair missing provenance. It creates new provenance.
       predeclaration `…_P2_NEW_CELL_PREDECLARATION_2026-09-14.md` — Section 1 / position 0
       structural endpoint · pre-press screenshot as the act-condition record
NEXT   ratify the P2 predeclaration → seal the NEW cell → THEN O1
       ⚠️ O1's attachment point OPEN — R-a own runtime / R-b re-scope / R-c amend
RUNTIME ⛔ UNTOUCHED until the P2 predeclaration is pinned
Gate B CLOSED        Gate C CLOSED (blocked by F6′)
```

> ⭐⭐ **Arrival has already acted before return is asked for.**
> **O1 must witness the RETURN — not accidentally witness the ARRIVAL.**
