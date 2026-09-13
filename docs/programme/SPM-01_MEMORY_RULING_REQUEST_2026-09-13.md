# SPM-01 → MEMORY ARCHITECTURE — RULING REQUEST

**From:** `SPM-00` / SPM-01 v0.2 · **Date:** 2026-09-13 · **Authorized by:** founder ruling 2026-09-13.
**To:** the memory architecture authority (the lane that will own the Episodic Phase 2 spec).
**Standing:** ⛔ **QUESTIONS ONLY. SPM DOES NOT ADJUDICATE THESE AND WILL ACCEPT THE ANSWER.**

---

## Why SPM is asking rather than deciding

SPM-01 v0.2 decomposed a claim into `ORIGIN` (immutable) · `BASIS` · `STATUS` (mutable). That
decomposition **exposed** two questions about memory semantics. It does not license SPM to settle
them: they are about how memory represents change over time, which is memory architecture's, and
SPM's own charter forbids absorbing the systems it depends on.

## M1 — Is `superseded` stored, or derived?

> **Is `superseded` a mutable status held on the predecessor, or a fact derived from the successor's
> lineage?**

**Why it is live, with both answers already present in the tree** (census finding D5):

```text
BUILT       lib/consciousness/interpretiveLedger.ts
            UPDATE interpretive_ledger SET status = 'superseded' WHERE id = $1
            → stored on the predecessor, parent row mutated

DESIGNED    docs/architecture/TEMPORAL_MEMORY_DIRECTION_2026-09-06.md
            succession carried by the SUCCESSOR via `supersedes`;
            `superseded_by` is DERIVED, never stored

ABSENT      no supersession implementation in lib/memory/ or lib/anamnesis/ at all
```

**What turns on it for SPM:** `superseded` currently sits in SPM-01's `STATUS` list. If supersession
is *derived from lineage*, then `superseded` is **not a status at all** — it is a computed view of a
claim that something later replaced, and SPM-01 §2's status vocabulary is wrong by one entry.

⛔ SPM has written the question into a form memory can answer. It has not answered it.

## M2 — Does `stale` belong in the personal-model lifecycle?

> **Given the existing `detect → ask → record` temporal-memory direction, does a `stale` status belong
> at all?**

**The tension, stated exactly:** the Temporal Memory direction holds that **the system never sets a
validity bound from a timer** — staleness is detected, *asked about*, and then recorded from the
member's answer. A `stale` status that the system sets would contradict that. A `stale` status that
only the member's answer sets is arguably just `superseded` or `disputed` wearing a third name.

⛔ **SPM-01 v0.2 did not add `stale`** and records it as open (§6.6). ⛔ It also does not argue against
it here — the tension is presented, not resolved.

## What SPM will do with the answers

Incorporate them into **SPM-01 v0.3** and settle the `STATUS` vocabulary. ⛔ Nothing else. SPM will
not implement, will not propose storage, and will not treat silence as permission to decide.

**Related but not asked here:** SPM-01 §6 carries four further open questions (erasure vs BASIS,
erasing a superseded claim, traceability of `observed in interaction`, what export means for a claim).
⛔ Those are SPM's own and are not routed to memory.

---

**Reciprocal boundary, pinned in both directions:**

> **SPM may describe the human model without authorizing its use; governance may authorize uses of the
> model without redefining what the model says is true.**

Memory's equivalent: **memory decides how change over time is represented; SPM decides what a claim
is and what the member may do with it.** Neither redefines the other.
