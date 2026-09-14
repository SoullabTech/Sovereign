# SPM-01 — BOUNDARY SPECIFICATION — **v0.3**

**Date:** 2026-09-13 · **Programme:** `SPM-00` · **Authorized by:** founder ruling 2026-09-13.
**Supersedes:** v0.2 (`…_v0.2_2026-09-13.md`), preserved unedited; v0.1 before it.
**Status:** ⛔ **SUPERSEDED BY v0.4** (`SPM-01_BOUNDARY_SPECIFICATION_v0.4_2026-09-14.md`) —
preserved unedited. v0.4 is a **new version, not an addendum**, because operative meaning changed:
the consume column is answered (G1), `superseded` becomes derived rather than stored (M1), `stale`
is refused (M2), and a new constraint enters (G2). ⛔ v0.3's formation gate, non-formation record,
ORIGIN set and prohibitions are **unchanged** and remain current here.

**Original status line:** ⛔ **NOT STABLE.** Stabilization conditions in §6. No schema · no storage · no migration ·
no implementation · no canon.

**What v0.3 changes:** the object gains a **pre-claim formation boundary**. The rights matrix, origin
set, status set and standing rules of v0.2 are **unchanged** and are not restated here.

---

## 1 · Why — canon rules on formation, and v0.2 had nowhere to put it

`GOV-SPM-01`'s reconciliation found that **`RIGHT_TO_REMAIN_UNPOSSESSED` (ratified canon) rules on
what may be formed**, with eight categories and default behaviours, and states:

> ⭐ *"Some inferences are violations **by formation**, not merely by exposure. A diagnostic label that
> the system silently holds but never displays has **already** desecrated."*

And `LONGITUDINAL_MEMORY_CATEGORY_GRADIENT` is the gate doctrine for exactly this question, with:

> ⭐⭐ *"MAIA may remember in service of continuity, but may not form identity around a member **faster
> than the member participates in that formation**."*

**v0.2 could not represent either.** Its object began at the claim.

## 2 · ⛔ Why formation is NOT a property on the claim

The obvious repair — a fourth field — **loses the thing it is meant to protect:**

```text
⛔ WRONG
CLAIM { ORIGIN · BASIS · STATUS · FORMATION: refused }
```

**If canon says a particular inference must never be formed, then creating a claim and marking it
`formation: refused` has already lost.** The proposition exists, in storage, about the person. The
canon's own test catches this exactly: *silently held and never displayed has already desecrated.*

## 3 · The object, v0.3

```text
        candidate material / possible inference
                        │
              FORMATION GOVERNANCE          ← governance-owned (which categories)
                        │
         ┌──────────────┴──────────────┐
         │                             │
     ADMITTED                      REFUSED
         │                             │
         ▼                             ▼
       CLAIM                  NON-FORMATION RECORD
         │
    ORIGIN (immutable)
    BASIS
    STATUS (mutable)
```

⭐ **The boundary is a gate, not a field.** Nothing crosses it and then carries a mark saying it
shouldn't have.

### 3.1 · ⛔ The non-formation record must not smuggle the proposition back

**A refused inference recorded as *"we refused to infer that Kelly is destined to X"* has stored the
prohibited proposition in the audit trail.** The refusal would become the leak.

```text
MAY RECORD                          ⛔ MAY NOT RECORD
rule invoked                        the refused proposition
category of prohibited edge         its subject matter
time                                any reconstructible paraphrase
decision provenance                 enough to re-derive it
```

⚠️ **ADDENDUM 2026-09-13 (founder) — the requirement is stronger than "do not store the
proposition":**

> ⭐ **A non-formation record must not contain enough contextual information to reconstruct the
> proposition it exists to prove was never formed.**

Even `rule · category · time` can reveal it in context. ⭐ **The refusal evidence is itself an
information-leakage problem** — the audit trail protecting the member becomes a channel for the thing
it protects them from. ⛔ **Solution open**; coarse timestamps, opaque category references,
aggregation and restricted audit custody are implementation choices and premature. Registered as
**F3** in `SPM-00_FLAGGED_ITEMS_2026-09-13.md`.

⚠️ **Note on versioning (this is an addendum, not v0.4) — RULED 2026-09-13, charter §6.**
SPM proposed *new version only on withdrawal*; the founder **refined it to a stronger test**:

> **New version when OPERATIVE MEANING changes. Dated addendum when meaning is only clarified or
> evidenced more precisely.**

⭐ Stronger because **a specification can gain a new obligation without withdrawing anything** — and
the weaker rule would have let requirements accumulate inside a version number that implied they were
not there. **This addendum qualifies:** it sharpens the leakage implication of an already-present
non-formation law and changes neither the claim object nor the formation gate.

### 3.2 · Jurisdiction across the gate

```text
GOVERNANCE OWNS      whether formation is permissible — which categories, on what conditions
SPM OWNS             how the substrate represents the outcome without violating that decision
```

> ⛔ **SPM may model the pre-claim boundary. It may not decide which categories are forbidden.**

That division is why §3 shows the gate without naming a single category. **The eight classes live in
`UNPOSSESSED` and are classified in the gradient; SPM does not copy them here** — copying would make
SPM the place the list is maintained, which is how jurisdiction quietly moves.

## 4 · ⭐ The discriminator SPM cannot represent per-claim

The gradient's invariant is about **tempo**: *faster than the member participates.*

> ⛔ **No per-claim property can express it.** "Ahead of the member" is a relation between the
> system's formation rate and the member's participation — **a property of the relationship over
> time**, not of any claim in it.

⛔ **v0.3 does not invent a mechanism for this.** It records that the object as specified — even with
the gate — **cannot yet carry the gradient's core invariant**, and that this is a known incompleteness
rather than an oversight. **Naming it is the whole of v0.3's obligation here.**

## 5 · ⭐ `BASIS` is confirmed as a genuine gap

`GOV-SPM-01`'s targeted reading resolved the open question about R22:

```text
S5 PROVENANCE CONSTITUTION    who created me · what generated me · what posture governed me
                              · may I persist / become collective / be restored / be forgotten
                              → GOVERNING PROVENANCE.  Ratified sentence, DB-enforced.

SPM-01 BASIS                  what evidence makes this proposition about the human warranted?
                              → ⛔ NOT ASKED BY S5. Genuine gap.
```

⭐ **A claim can have perfect creation provenance and no epistemic basis** — *"minted by the inference
pipeline under posture normal"* says nothing about *"rests on these three member statements and this
authored passage."* **`BASIS` stands as v0.2 defined it, now with the gap established rather than
suspected.**

## 6 · Stabilization conditions — ⛔ v0.3 is NOT stable

```text
✅ S5 / BASIS question            RESOLVED — S5 is not BASIS (GOV targeted reading)
⛔ MEMORY M1 / M2                 OUTSTANDING — supersession stored vs derived; whether `stale` belongs
⛔ GOV G1 / G2 residual           OUTSTANDING — first-person representation; consumption semantics
```

**Live dependency, recorded:** the gradient states that *inference-time wiring of longitudinal patterns
may not proceed until the category each pattern belongs to has been classified there.* ⛔ SPM specifies
an object whose claims include inferred ones; **that classification is a precondition on implementation,
not on specification** — but it is now on this document's record, not only in a doctrine SPM might not
have read.

## 7 · Unchanged from v0.2

Origin set · status set · the six member rights · the standing question *may this claim currently
function as model belief?* · the governance-owned consumption question · all six open questions ·
all prohibitions.

⚠️ **The procedural question raised at v0.2 §8 is still unanswered** — one file per revision, or
supersede in place with a version history. This is the third file for one object.
