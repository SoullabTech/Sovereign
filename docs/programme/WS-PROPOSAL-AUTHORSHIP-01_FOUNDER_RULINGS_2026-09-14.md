# WS-PROPOSAL-AUTHORSHIP-01 — Founder rulings on the post-census standing

**Date:** 2026-09-14 · **Branch:** `claude/bold-bohr-pmtynu`
**Follows:** `…_CHARTER_2026-09-14.md` (+ A1/A2) · `…_CENSUS_2026-09-14.md` (`6165512a`)
**Standing:** ⛔ **RULINGS ONLY.** No design · no schema · no migration · no code.

> ⭐ The census has finished discovering what the system **can truthfully claim**, without
> becoming the design that fixes it. These rulings pin that boundary so it cannot erode by
> sequence pressure.

---

## FR-W1 · F6′ is a HARD PRECONDITION, not a Step-3 subtask

```text
⛔ NO STEP-3 SCHEMA MIGRATION UNTIL F6′ IS RECONCILED.
```

⚠️ **Not because Step 3 is conceptually blocked.** Because adding another migration atop an
unreconciled ledger **compounds uncertainty** — it makes the unreconstructible schema larger and
its provenance thinner.

The reconciliation is a **separate act with its own questions**. It is **custody of the
substrate**, not design of successor versions:

```text
What schema is actually live?
How did it get there?
What migration history can be trusted?
What must be reconciled before another migration is allowed?
```

⛔ None of those four questions is answered by designing version succession, and designing version
succession does not discharge any of them.

---

## FR-W2 · The three acts may not collapse into one field

⭐ §6 of the census identifies the **real Step-3 design problem**. The live system carries only:

```text
execution_authority = member_acceptance
```

which is **a permission class and nothing more.** It leaves unanswered:

```text
Who authored this wording?      Who accepted it?
What act constituted acceptance?   Which version was accepted?
```

Ruled — the eventual model must preserve **at least three distinct things**:

```text
WORDING AUTHORSHIP    who supplied the candidate wording
ACCEPTANCE ACT        who performed the ratifying gesture
EXECUTION AUTHORITY   what class of authority permits mutation
```

```text
⛔ THESE MAY NOT COLLAPSE INTO ONE FIELD.
```

⭐ The precedent is load-bearing and is hereby pinned as law for this lane:

> **"System acceptance record real" is not the same as "authorial ratification resolved."**

⛔ This ruling states **what must be preserved**. It specifies no columns, no table, no mechanism.

---

## FR-W3 · `decision_chain_id` is NEUTRAL — the restraint is ratified

```text
An unused column is NOT dormant semantics waiting to be discovered.
If no operational meaning exists, assigning one now is DESIGN.
```

Therefore Step 3 may **not** begin with:

```text
⛔ "Can we reuse decision_chain_id?"
```

It begins with:

```text
✅ "What object and lifecycle does version succession actually require?"
```

⭐ Only **afterward** may it be asked whether any existing substrate **legitimately fits** that
object. Fit is tested against a defined requirement; it is never the starting premise.

### ⭐⭐ FR-W3a (founder, same day) — the ordering generalizes to Gate B's second step

⚠️ **"Version identity as the authorization unit" is NOT shorthand for extending an existing
field.** `base_version` and `resulting_version` identify **manuscript states**; neither identifies
**a particular state of a proposal**. The referent does not exist in the live system.

```text
✅ REQUIREMENT FIRST  →  SUBSTRATE FIT SECOND
⛔ AVAILABLE FIELD    →  INVENTED SEMANTICS
```

So Gate B's first job is to **define what a proposal version is, and what lifecycle makes it the
thing being authorized.** Only afterward may existing substrate be tested for fit.

⭐ This is FR-W3 one layer up: the same trap, a different candidate. `decision_chain_id` is the
column form of it; an existing version field is the identity form.

---

## FR-W4 · THREE INDEPENDENT GATES — they are not one state

⚠️ Without this separation it becomes very easy to say *"Step 3 is next"* and silently collapse
**design readiness**, **schema readiness** and **interaction closure** into a single readiness.

```text
GATE A · CURRENT INTERACTION WITNESS          ── STILL OPEN
    six browser observations
        ↓
    bounded repair IF FALSIFIED
        ↓
    close WS-PROPOSAL-INTERACTION-01


GATE B · AUTHORSHIP / SUCCESSION DESIGN       ── CENSUS COMPLETE · DESIGN NOT OPENED
    define the three acts (FR-W2)
        ↓
    define VERSION IDENTITY as the authorization unit
        ↓
    define successor lifecycle


GATE C · SCHEMA AUTHORIZATION                 ── BLOCKED BY F6′ (FR-W1)
    reconcile live schema ⇄ migration ledger
        ↓
    only then authorize any Step-3 migration
```

⛔ A gate advancing confers nothing on the others. B may be designed while C is blocked; C may be
reconciled while A is open; **no combination of B and C closes A.**

---

## Gate A · observation record (founder classifications, verbatim)

```text
Whole / first    SECTION-ADDRESSED — FAIL     [existing witness, SEALED]
Whole / second   LOCUS-ADDRESSED   — PASS     [2026-09-14 screenshot]
```

**Classification basis for `Whole / second`.** The canvas did not merely reach Section 23 — the
**actual change locus is exposed**: the affected wording is visibly marked in the manuscript.

```text
FAILURE CONDITION   section reached, exact change still OFF-SCREEN
OBSERVED            exact affected text VISIBLE
⭐ Centering is NOT the criterion. Exposure of the locus is.
```

**Collateral evidence (founder).** Invocations land at roughly the same visible place. ⭐ That
makes the navigation behaviour **repeatable**, not a lucky scroll position — a stronger reading
than a single PASS supports on its own.

### The predeclared six-cell matrix — COMPLETE (founder, 2026-09-14)

```text
WHOLE-MANUSCRIPT ROW                       SECTION-VIEW ROW
  first asked return    FAIL   SEALED       first asked return    PASS  FOUNDER-READ
  second asked return   PASS   SEALED       second asked return   PASS  FOUNDER-READ
  passive scroll        PASS   FOUNDER-READ passive scroll        PASS  FOUNDER-READ
```

```text
5 PASS · 1 FAIL · 0 owed
```

#### ⚠️ Provenance of the final four seals — recorded in place

The last four cells are sealed on the **founder's personal observation in the live UI**, stated by
the founder and accepted as such. ⛔ **No Jarvis observation exists or was ever offered:** this
session has no reach to `localhost:3100`, said so before the walk, and every earlier cell was
likewise recorded `FOUNDER-READ`. A relayed draft attributing a runtime observation to Jarvis is
corrected here rather than carried:

```text
⛔ WRONG   the seal rests on an agent observation of the running UI
✅ RIGHT   the seal rests on the FOUNDER's observation. That is sufficient. It is also the
           only evidence there is.
```

⭐ The evidence class is the thing being protected, not the verdict. The verdicts stand.

⭐ The matrix is **predeclared**, not assembled after the fact. Cells are classified against it;
it is not adjusted to fit what was observed.

### `Whole / passive scroll` · EXPECTED: **MUST STAY PUT** — ✅ **PASS** (founder-read)

```text
1. Stay in Whole manuscript.
2. Manually scroll WELL AWAY from the visible change locus.
3. ⛔ Do NOT press SHOW CHANGE.
4. Leave the canvas alone LONG ENOUGH to see whether anything repositions it.
```

⛔ **The cell must not be contaminated by another navigation act.** A second asked return inside
this cell would make the two properties inseparable again.

```text
PASS   canvas remains where you manually left it
FAIL   canvas autonomously returns / repositions toward the proposal locus
```

⛔ Classify **only the observed behaviour.** No inference about mechanism from this cell —
⭐ **and on FAIL, no diagnosis.** The runtime observation is sealed first; cause is a separate act.

**What it tests, and why it is not a repeat of the first two.** The asked-return cells ask whether
navigation **arrives**. This cell asks whether ordinary user scrolling **remains sovereign** — or
whether the proposal-navigation mechanism pulls the canvas back unasked.

⭐ It is the falsifier for the repair the census recorded at §5: *the reveal guard was SPLIT into
automatic acts vs voluntary acts.* A FAIL here says that split does not hold at runtime.

### ⭐ Gate A disposition — the question the completed matrix now puts

⛔ **Not ruled here.** The matrix is complete; the disposition is a founder act.

What the matrix supports on its own, with no mechanism claim:

```text
The single FAIL is confined to ONE CELL — Whole / first asked return.
Every other cell, in both views and both act-classes, PASSES.
Positional sovereignty (passive scroll) holds in BOTH views.
```

⚠️ **One limit on reading that as localization.** The Section row was walked **after** the Whole
row. So `Section / first` was not necessarily a *cold* first asked return in the sense
`Whole / first` was. ⛔ The matrix therefore does **not** establish that the defect is
Whole-view-specific rather than first-ever-invocation-specific. Both readings survive it.

The disposition choices the charter allowed:

```text
A  FALSIFIED → bounded repair, then close WS-PROPOSAL-INTERACTION-01
B  NOT FALSIFIED → close on the row, carrying Whole / first as a recorded known defect
C  ONE ADDITIONAL CELL → a cold Section / first, to separate the two surviving readings
```

---

## ⭐⭐ GATE A RULING (founder, 2026-09-14) — **DISPOSITION C**

> The matrix leaves a real ambiguity that is **cheap to eliminate**: was `Whole / first` a
> **Whole-view** defect, or simply a **first-ever invocation** defect? One clean observation
> answers that.

```text
RUN EXACTLY ONE COLD Section / first ASKED-RETURN OBSERVATION.

PURPOSE  distinguish Whole-view-specific failure
         from first-ever-invocation failure.
```

### The cold procedure — genuinely cold

```text
1. Fresh page / runtime state.
2. Enter Section view WITHOUT invoking SHOW CHANGE anywhere first.
3. Scroll well away from the proposal locus.
4. Invoke SHOW CHANGE once.
5. Classify ONLY:  LOCUS-ADDRESSED   or   SECTION-ADDRESSED
6. Stop.
```

⛔ Step 2 is the whole point of the observation. Any prior `SHOW CHANGE` in the runtime — in either
view — **destroys the coldness** and the observation is void, not merely weakened.

### Interpretation, predeclared

```text
PASS   cold invocation works in Section
       → Whole / first failure is NOT explained merely by being first-ever
       → evidence points toward a WHOLE-SPECIFIC defect

FAIL   the same defect appears on a cold Section first invocation
       → evidence points toward FIRST-INVOCATION / INIT behaviour rather than Whole alone
```

⭐ Predeclared before the run, so neither outcome can be reinterpreted after it lands.

### ✅ SEVENTH OBSERVATION — RESULT (founder-read, 2026-09-14)

```text
COLD Section / first asked return  →  LOCUS-ADDRESSED  —  PASS
```

```text
EVIDENCE CLASS   FOUNDER-READ. Coldness (no prior SHOW CHANGE in the runtime, either view)
                 is ASSERTED BY THE FOUNDER and accepted as the condition of the reading.
                 ⛔ Jarvis observed nothing; this session has no reach to the running UI.
```

**Reading, per the predeclared interpretation — no more, no less:**

```text
✅ ESTABLISHED   "first-ever invocation" alone does NOT explain the Whole / first failure.
                 A cold first invocation succeeds in Section view.
→ POINTS TOWARD  a WHOLE-SPECIFIC defect.
```

⚠️ ⛔ **What it does not establish.** *Points toward* is the predeclared wording and it is kept.
A view-independent initialization defect that happens to be **masked** in Section view remains
consistent with this result. The observation **eliminated one explanation**; it did not confirm the
other.

---

## ⭐⭐ GATE A CLOSE (2026-09-14)

```text
SIX-CELL MATRIX     5 PASS · 1 FAIL · SEALED
SEVENTH DIAGNOSTIC  PASS — LOCUS-ADDRESSED (cold Section / first)
GATE A DISPOSITION  ⭐ FALSIFIED AT ONE CELL — Whole / first asked return
```

**Falsified, narrowly and precisely.** The walk did what it was built to do: it found a real defect,
bounded it to one cell, and then bought the one observation that told us what shape it has.

```text
POSITIONAL SOVEREIGNTY   ✅ HOLDS — passive scroll PASSES in BOTH views.
                            The reveal-guard split (automatic vs voluntary acts) survives runtime.
ASKED RETURN             ✅ HOLDS everywhere EXCEPT the Whole-view first asked return.
```

### The bounded repair this indicates — ⛔ INDICATED, NOT AUTHORIZED

```text
SCOPE     the Whole-view first asked return, and nothing else
⛔ NOT    a surface redesign · not a SHOW CHANGE rename (charter F1 unchanged)
⛔ NOT    reintroducing detached excerpts or duplicate Current/Proposed panels (census §5)
```

⛔ **No repair is written, scoped in code, or authorized by this close.** It requires a founder act,
and the subject is not in this checkout. ⛔ It belongs to the **interaction lane**
(`WS-PROPOSAL-INTERACTION-01`) — ⭐ **Gate A closing authorizes NOTHING at Gate B or Gate C.**
That is the whole purpose of FR-W4.

---

### ⛔ This is a SEVENTH observation, not a replacement cell

```text
⛔ DO NOT rerun the six-cell walk.
The six-cell matrix stays exactly as sealed — 5 PASS · 1 FAIL.
This is an explicitly DIAGNOSTIC observation appended to it, and it
REPLACES NO CELL and REVISES NO SEAL.
```

⭐ Why it is worth taking: it **changes the shape of any bounded repair**, rather than merely
adding another PASS.

---

### ⛔ Sealing rule — a later PASS does not rewrite an earlier FAIL

```text
Whole / first stays SECTION-ADDRESSED — FAIL.
A later invocation behaving better is a NEW CELL, never a correction of a sealed one.
Rewriting is permitted only where the witness procedure EXPLICITLY calls for a rerun.
```

⭐ Same discipline the programme applies to production witnesses: *a witness is a reading at a
time.* The honest repair is to date it, never to edit it.

---

## Roadmap standing (precise)

```text
LANE STATUS                        ⏳ OPEN · GATE A CLOSED — bounded repair INDICATED
                                   ⛔ repair NOT authorized · founder act required
                                   ⛔ walk COMPLETE — do NOT rerun it
Writer's Studio interaction lane   ✅ SIX-CELL WITNESS COMPLETE — 5 PASS · 1 FAIL
                                   Whole / first          SECTION-ADDRESSED — FAIL  [SEALED]
                                   Whole / second         LOCUS-ADDRESSED   — PASS  [SEALED]
                                   Whole / passive scroll STAYED PUT        — PASS  [FOUNDER-READ]
                                   Section / first        PASS  [FOUNDER-READ]
                                   Section / second       PASS  [FOUNDER-READ]
                                   Section / passive      PASS  [FOUNDER-READ]
                                   7th COLD Section / first LOCUS-ADDRESSED — PASS [FOUNDER-READ]
                                   Gate A = CLOSED · FALSIFIED AT Whole / first only
                                   NEXT → founder act: authorize (or decline) the bounded repair
Proposal authorship census         ✅ COMPLETE
Step-3 intent                      ✅ BOUNDED — we know WHICH QUESTIONS must be answered
Gate B (authorship / succession)   ⛔ CLOSED / NOT OPENED — requirement precedes object (FR-W3a)
Step-3 schema                      ⛔ EXPLICITLY UNAUTHORIZED (FR-W1)
Step-3 code                        ⛔ EXPLICITLY UNAUTHORIZED
```

### ⛔ Lane closure is NOT decided here

⚠️ *"That is exactly where this lane stops"* was written of the **census**, and must not be read as
lane closure. Correcting it in place:

```text
✅ The CENSUS stops there.          The LANE is OPEN, held at Whole / passive scroll.
```

Only after the witness procedure's **remaining cells** and the **resulting Gate A disposition** are
complete is it decided whether this lane closes or hands something forward to Gate B.

> ⭐⭐ **The census established the QUESTIONS the future system must answer — not the answers.**
