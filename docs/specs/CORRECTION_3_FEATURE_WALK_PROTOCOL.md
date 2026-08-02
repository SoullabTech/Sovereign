# Correction 3 — Feature Walk Protocol (FROZEN)

**Status**: FROZEN on authoring. Pre-registered **before** execution.
**Authored**: 2026-08-02
**Derived from**: `docs/specs/CORRECTION_3_FIELD_OBJECT_DECLARATION_2026-08-02.md` (#895,
OPEN) — the ten already-governing acceptance criteria, unchanged in substance.
**Governed by**: `MEMBER_FIELD_AND_STUDIO_DIRECTIVE.md` Amendment 5 (canonical `1e15f9c71`)
· `FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md` (canonical `d61872e2a`)

---

## ⛔ What this instrument is NOT

This is a **bounded feature-verification walk**. It proves one member act works.

It is **not** the Phase 1 release walk, and **cannot** be used for founder acceptance.
Release acceptance requires the founder-authored, frozen **Phase 1 Walk Specification**
run against one assembled candidate SHA. That document does not exist yet, and this one is
not a draft of it.

⛔ **Feature evidence does not substitute for release acceptance.** A green run here permits
exactly one decision: *whether the implementation is ready to publish as a PR.*

⛔ Passing this walk does not change the Phase 1 verdict, which remains **FAILED at W8**.

---

## Preconditions

- Run against the Correction 3 implementation branch at a **named commit**, recorded in the
  evidence.
- A **fresh disposable member**, with a baseline captured **before any mutation**, per
  [`reference-walk-fixture-baseline-protocol`]: member id · login · credential hash digest
  (not the password) · reset flags · counts and ids for capsules, atoms, workbench rows ·
  database version.
- ⛔ `walk.878` is contaminated and inadmissible.
- The persistence half is already evidenced separately on PostgreSQL 16.13 and is **not**
  re-proven here. This walk is the **browser/member path only**.

---

## The steps

Numbered **F1–F10** deliberately — *not* W-numbers. W-numbers belong to the Phase 1 release
walk, and reusing them would invite the two instruments to be confused.

| # | Step | Passes when |
|---|---|---|
| **F1** | Create a capsule through the real capture gesture | a capsule exists, created by the member path — not by direct insert |
| **F2** | Save / review the capsule | **no atom is minted** |
| **F3** | Open the Workbench Shelf | **unchanged** — nothing appeared |
| **F4** | Inspect the capsule surface | **Save for later** and **Keep in my Field** are visibly distinct acts; a not-yet-eligible capsule shows the declaration **disabled with an honest reason**, and reaching for it does **not** flip `draft` |
| **F5** | Make the capsule eligible, then press **Keep in my Field** in the browser | exactly **one** atom exists |
| **F6** | Inspect the atom | `source_type='capsule'` · `source_id` = the capsule · `generated_by='member-gesture'` · owned by this member · body carries the **reviewed formulation** |
| **F7** | Press again | same atom id; the surface reads **Kept in your Field**, not a second creation |
| **F8** | Open `/maia/workbench` | the Field Object **appears on the Shelf** |
| **F9** | Place it, then remove the placement | capsule and atom both **unchanged** |
| **F10** | Reopen or archive the capsule | the Field Object **survives**; no historical capsule was converted |

**Closing obligation** — not a step, a duty: **restore the fixture exactly** to the recorded
baseline, and record any part that cannot be restored.

---

## Admissible evidence

- A real pointer interaction for F4, F5 and F7. ⛔ A programmatic `.focus()`, a direct
  `fetch()` to the declaration route, or a SQL insert is **not** evidence that a member can
  perform the act — the failing world produces the same result. (This is the W8 lesson:
  an endpoint call cannot prove a missing member path.)
- Database reads **are** admissible for F2, F3, F6, F9 and F10, because those are assertions
  about state, not about reachability.

---

## Dispositions

Exactly one, recorded with the evidence:

- **Feature walk passed** — implementation ready to publish as a PR
- **Additive correction required**
- **Founder ruling required**

⛔ None of these is founder acceptance, and none authorizes deployment.
