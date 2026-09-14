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
Writer's Studio interaction lane   ⏳ GATE A OPEN — six-cell browser witness in progress
                                   Whole / first  = SECTION-ADDRESSED — FAIL  [sealed]
                                   Whole / second = LOCUS-ADDRESSED   — PASS  [2026-09-14]
                                   remaining cells per the witness procedure (external to
                                   this checkout; the walk holds the six-cell table)
Proposal authorship census         ✅ COMPLETE
Step-3 intent                      ✅ BOUNDED — we know WHICH QUESTIONS must be answered
Gate B (authorship / succession)   ⛔ CLOSED / NOT OPENED — requirement precedes object (FR-W3a)
Step-3 schema                      ⛔ EXPLICITLY UNAUTHORIZED (FR-W1)
Step-3 code                        ⛔ EXPLICITLY UNAUTHORIZED
```

> ⭐⭐ **The census established the QUESTIONS the future system must answer — not the answers.**
>
> That is exactly where this lane stops.
