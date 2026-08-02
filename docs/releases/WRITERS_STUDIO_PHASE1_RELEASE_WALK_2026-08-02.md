# Writer's Studio Phase 1 — Release Walk Record

**Date**: 2026-08-02
**Unit under walk**: Writer's Studio Phase 1 (release object, not a PR sequence)
**Walk authority**: founder-directed release-acceptance walk
**Recorded by**: Claude (Record, not Ratify)

---

## Disposition

**Release walk FAILED at W8.**

**Phase 1 is not ready for founder acceptance or deployment.**

W9 and all later Workbench steps were **not reached**. They are not "pending" and not
"passing" — they are unreached, and no evidence exists for them either way.

---

## W8 — Failure (blocking)

**The acceptance path W8 was written to prove:**

> a member performs a genuine Keep gesture → that Keep becomes available on the
> Workbench Shelf.

**What the running product actually does:**

| Surface | Behavior |
|---|---|
| "Keep this moment" (the prominent member Keep gesture) | creates a **capsule** |
| Workbench Shelf | reads `member_memory_atoms` stamped `generated_by='member-gesture'` |
| `/maia/keep-capture` | can mint those atoms — but **only from pre-existing developed Idea candidates** |

**Consequence**: a member with an ordinary MAIA conversation and no developed Idea
candidate has **no reachable gesture** that puts anything on the Shelf.

The prominent member Keep gesture and the Workbench Shelf use **different persistence
substrates**. Capsules are not atoms.

### Why the endpoint is not admissible evidence

Calling `POST /api/psyche/portfolio/keep` directly would prove the endpoint works. It
would **not** prove that a member can perform the act the release claims to support.

The opposite world — where members cannot get anything onto the Shelf at all — produces
the **same** endpoint result. An instrument that cannot distinguish the two worlds is not
an instrument for this question.

Any atom created that way must be labeled **"diagnostic fixture — not release acceptance
evidence"** and may only be used for developer diagnosis of already-tested Workbench
mechanics.

---

## W4 — Not a clean pass (member-facing defect)

Recorded as:

- blank WriterField **rendered correctly**;
- **direct click-to-focus failed** — the field was hit-test reachable and programmatic
  `.focus()` worked, but a real click did not focus it;
- writing was possible **only after programmatic focus**.

The walk was able to continue through instrumentation. A member cannot call `.focus()`
from DevTools. This is a member-facing defect, and W4 is **qualified, not clean**.

---

## Return routing — known seam surfaced by the walk

- `Start writing` routes correctly **by manuscript identity**.
- `Continue Writing` returns through `/press/manuscript?tab=draft` **without `?m=`** —
  i.e. it returns **by position, not by identity**.

In this single-manuscript fixture it happened to reopen the correct manuscript. That is a
property of the fixture, not of the routing. **Not a failure in this walk; unsafe before
multiple expressions/projects exist.**

---

## Evidence preserved

Successful evidence from W1–W7 stands and is preserved (per-step evidence remains in the
walk session record). It does **not** dilute the W8 failure. Passing seven steps of a walk
whose eighth step is the acceptance claim does not produce a partial acceptance — the
release object either supports the member act or it does not.

---

## Blocking corrections (narrow and concrete)

1. **Connect a genuine, generally reachable member Keep act to the canonical Field Object
   substrate consumed by the Shelf** — or alter the Shelf's admitted sources through an
   **explicit ontology ruling**. Do **not** silently treat capsules as atoms.
2. **Fix blank WriterField click-to-focus** and repeat the **real user action** (not
   programmatic focus).
3. **Replace return-by-position with identity routing** before project multiplicity makes
   the ambiguity consequential.

---

## Notes on standing

- This record is a **Record**, not a ruling and not an acceptance.
- No fix in this list is authorized by this record. Authorization is a separate act.

---

## Founder ruling on correction (1) — 2026-08-02

Correction (1) was ruled the same day by Kelly. **The ruling is not restated here.** This
record is evidence — *why* correction is required; the ruling governs *what* the correction
must be, and lives in its own document so there is one authoritative copy:

> `docs/architecture/FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md`
> — *Capsule → Field Object promotion is an explicit member act.* Carries the preserved
> layer separation and the ten pre-registered acceptance criteria for the correction slice.

Corrections (2) and (3) are independent of that ruling and proceed on their own, as
**separate PRs or clearly separate commits** — each has its own acceptance and revert shape.

### Release state after the ruling — unchanged

> **FAILED at W8. Founder acceptance unavailable. Deployment unauthorized.**

### Implementation sequence

1. Fix real click-to-focus.
2. Fix return-by-identity.
3. Build explicit capsule → Field Keep promotion (10 pre-registered acceptance criteria in
   the ruling).
4. **Repeat the release walk from W1** — not resume at W8. The assembled release object
   will have changed.

⛔ **This record authorizes none of the above.** It records the failure and preserves the
evidence; authorization is a separate act, and the scope of (3) is governed by the ruling
document, not by this record.
