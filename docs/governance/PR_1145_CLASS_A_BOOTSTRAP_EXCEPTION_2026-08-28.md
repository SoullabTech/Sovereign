# 2026-08-28 — PR #1145 Class A Bootstrap Phase 1 exception

**Status:** OPEN — one of two required acts recorded.
**Object:** NW-V1-CLIENT-01 — consequential return.
**Disposition:** canonical KEEP · not reverted · deployment BLOCKED until both acts exist.

> **This is not a Class A PASS.** The normal Class A Council gate was unavailable.
> The correct name for this disposition is
> **CLASS A BOOTSTRAP EXCEPTION** — *normal Council gate unavailable during
> active Bootstrap Phase 1.* Nothing in this record may be summarized as
> *"Class A gate passed"*, *"Council approved"*, or *"independent review
> complete"*.

---

## PIN — the exact object authorized

```
candidate      c0b3a5cd8499c968e0ca9530a57973a6dd99db27
merge commit   6ccd74795ab74a83d5f60d09342e28d839120571
base at merge  d332935aeb81b3508831c369d17c229b0773b8ac
PR             https://github.com/SoullabTech/Sovereign/pull/1145
```

Authority recorded here attaches to **those SHAs only**. A later code change
cannot inherit it.

---

## FACTS PRESERVED

1. **#1145 merged under Class B** — 2026-08-28 22:15:18Z, merged by `Soullab`,
   with **zero approving reviews**. The six green checks were CI and
   diagnostics, not human review.
2. **It was subsequently reclassified Class A**, correctly, on founder ruling —
   a persistent relation between member-authored memory acts is memory handling,
   and the higher applicable boundary governs the single-class declaration.
3. **The normal Class A gate requires** Founder-Steward + 2 Council votes +
   1 Mentor verification (`docs/GOVERNANCE_MENTOR_COVENANT.md` §Class A).
4. **Bootstrap Governance Phase 1 is still Active**
   (`docs/governance/BOOTSTRAP_GOVERNANCE_PHASE1.md`, Status: Active as of
   2026-06-27; superseded only by appointment of the Guardian Circle).
5. **No Guardian Circle / Council capable of supplying the two votes has been
   appointed.** Repository collaborators are exactly two: `Soullab` (admin) and
   `SoullabCovenant` (write).
6. **Therefore the normal Class A gate is presently unsatisfiable** — not
   because of anything about this change, but because two of its three roles
   have no eligible holder.
7. **`covenant-gates` does not count human approvals.** The Phase 2 redesign
   (2026-07-03) removed the FOUNDERS/MENTORS/GUARDIAN_CIRCLE approval engine,
   per-class approval counting, and the `covenant-signoff` bridge. The workflow
   performs constitutional validation and diagnostics only. **The Class A
   approval requirement is doctrinal but unenforced** — the covenant text and
   the enforcement mechanism have diverged.
8. **GitHub currently provides no independent two-person governance review for
   this repository.** The workflow states this itself: *"Until a second human
   GitHub collaborator exists, this repo is single-owner + admin-merge, NOT
   independent two-person review."*
9. **None of the above may be rewritten into a normal Class A PASS.**

### The timing defect is permanent

The change merged **before** it was correctly classified. Ratification can cure
the *missing review*. It cannot cure the *missing pre-merge sequencing*. The
record therefore always reads **"Class A ratified post-merge"**, never
"Class A gate passed."

---

## ACT A — FOUNDER-STEWARD RATIFICATION · RECORDED

**Authority:** `Soullab` (Kelly Nezat), Founder-Steward.
**Date:** 2026-08-28.
**Evidence:** founder directive of 2026-08-28 ruling on #1145 (*"revert NO ·
appoint Guardian Circle now NO · disposition DOCUMENTED BOOTSTRAP EXCEPTION"*),
authored by the Founder-Steward and recorded here in the founder's own words.

> I have reviewed #1145 as a Class A Sacred Boundary change against
> candidate `c0b3a5cd8` / merge `6ccd74795`.
>
> I ratify the specific memory relation introduced here: a kept lived act may
> record that it answers a prior member act.
>
> I ratify the following constraints:
>
> - member-grounded relation only
> - no inferred relation from adjacency
> - no inferred relation from session context
> - no progress/outcome semantics
> - no automatic practitioner visibility
> - cross-member relation refused
> - practice/offering do not inherit a lived relation
> - provenance of composition must be established, not inferred
>
> I authorize this change to remain in canonical under the documented
> Bootstrap Phase 1 exception.
>
> **This is not a claim that the normal Class A Council gate was satisfied.**

---

## ACT B — MENTOR VERIFICATION · OUTSTANDING

**Required from:** `SoullabCovenant` (Bootstrap Mentor / Release Steward).
**Status: NOT PERFORMED.**

This act cannot be produced by the Founder-Steward's account, and was not.
`SoullabCovenant` exists precisely to be *a governance identity distinct from
the author*; a verification issued from `Soullab` would impersonate it and
destroy the only property it supplies. It must be performed by whoever controls
that identity.

When performed, it must verify **the same pinned SHAs** and confirm:

- [ ] the migration is additive and nullable
- [ ] relation semantics are narrow
- [ ] negative controls cover composition and propagation
- [ ] privacy default remains false
- [ ] rollback disposition is truthful
- [ ] no downstream progress/outcome interpretation is introduced

and must state that **`SoullabCovenant` is a Bootstrap Mentor / governance
identity and is NOT being represented as independent Council review.**

---

## RECORD

```
NORMAL CLASS A GATE       UNSATISFIABLE
reason                    Guardian Circle not yet appointed
merged under              Class B
correct classification    Class A
founder ratification      RECORDED — Act A above (founder directive 2026-08-28)
mentor verification       OUTSTANDING — Act B, awaits SoullabCovenant
Council votes             NOT AVAILABLE
independent review        NOT CLAIMED
timing defect             PERMANENTLY RECORDED
canonical disposition     KEEP
exception precedent       NO — Bootstrap-specific
deployment eligibility    NOT RESTORED — requires Act A + Act B
```

**Not precedent.** This exception is specific to Bootstrap Phase 1 and to the
pinned SHAs. It does not establish that Class A changes may merge without
Council review, and it expires with Bootstrap Phase 1.

---

## WHAT WAS SUBSTANTIVELY RATIFIED

Adjudication points, with where each is evidenced in the merged object:

| # | Point | Evidence at `c0b3a5cd8` |
|---|---|---|
| 1 | `responds_to_thread_id` is a memory relation, therefore Class A | `database/migrations/20260828000002_field_note_responds_to.sql` |
| 2 | means only *"this kept lived act answers that prior member act"* | migration `COMMENT ON COLUMN`; `lib/nowWhat/livedRelation.ts` header |
| 3 | must not acquire progress/outcome/salience meaning downstream | test *"the relation is provenance, never a progress or outcome model"* |
| 4 | relation creation is member-grounded | `lib/nowWhat/livedRelation.ts` — written only alongside an explicit keep |
| 5 | composition cannot infer relationships from adjacency | `lib/nowWhat/carriedThread.ts`; § A2 negative controls 1, 2, 4 |
| 6 | session context cannot create relationship | § A2; three rows, one `source_session_ref`, one relation |
| 7 | practice/offering do not inherit the lived relation | `NowWhatRoom.tsx` `saveTagged()`; two controls + a one-call-site count |
| 8 | cross-member ids are refused | `resolveRespondsTo` member-scoped query; behavioural test |
| 9 | `can_be_shown_to_practitioner` remains false by default | unchanged from canonical; asserted in § E |
| 10 | `entry=lived` grants no practitioner visibility | § E |

Experiential status is unchanged by any of this:

```
cold witness             WAIVED FOR PRE-IMPLEMENTATION ONLY
experiential acceptance  STILL OUTSTANDING
V1 acceptance            NOT CLAIMED
```

---

## SEPARATE FOLLOW-UP — GOVERNANCE-BOOTSTRAP-02

**Recorded here, deliberately not solved here.**

Reconcile the permanent Covenant, the Bootstrap Phase 1 document, GitHub branch
protections / CODEOWNERS, and the redesigned `covenant-gates` workflow so the
repository has **one truthful answer** to:

> *Who must actually approve a Class A change today, and what enforces it?*

Today it has at least three answers that disagree: the Covenant names a gate,
the workflow says it deliberately stopped counting approvals, and GitHub permits
single-owner admin merge. #1145 did not create that divergence; it exposed it.

**Do not appoint a Guardian Circle as part of that technical reconciliation.**
Appointments are a founder governance act and should happen when real stewards
have been chosen — not because a checkbox needs two names.
