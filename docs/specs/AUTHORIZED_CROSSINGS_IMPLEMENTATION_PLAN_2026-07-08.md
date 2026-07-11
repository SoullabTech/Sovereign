# Authorized Crossings — Implementation Plan

**Date:** 2026-07-08
**Status:** Executable design. **Introduces no new constitutional concepts** — it makes existing ones (`case_memories_maia_held`, the foreseen `authorized_crossings` table, ADR-013 assembly enforcement, write-event provenance) enforceable. Writing this plan is *not* a ladder advance; shipping it and having it **refuse a wanted crossing** is (rung 4).
**Implements:** `PRACTITIONER_KNOWLEDGE_PROVENANCE_GATE_CANDIDATE_2026-07-08.md` (B′) against the subsystem verified in the caseload audit (2026-07-08).
**Framing:** the migration comment in `20260626000002_case_memories_crossing_check.sql:11–14` already anticipated *"an authorized_crossings table with a separate write path. Do not silently bypass it."* This plan **completes an intentionally unfinished pathway** — it does not add architecture.

---

## Principle

Admissibility is a **multi-axis predicate**, not a single field:

```
crossing admissible IF
    origin qualifies            (authorship = 'practitioner_authored')
AND transformation qualifies    (an approving authorized_crossings event exists)
AND consent qualifies           (consent_basis recorded on that event)
```

Not `authorship == 'practitioner_authored'` alone. The existing constraint supplies axis 1; this plan adds axes 2 and 3. **Do not drop `case_memories_maia_held`** — build on it.

## Step 1 — Enforcement point (read first, then mirror the member side)

The member side already solves this shape: `member_memory_atoms.crossing_allowed` is enforced where memory enters the prompt (audit: `portfolio.ts ~82`; assembly at `MemoryOrchestrator.formatForPrompt()` and `app/api/sovereign/app/maia/list/route.ts`).

1. **Read** `MemoryOrchestrator.buildContext()/formatForPrompt()`, the sovereign `maia/list` route, and the member-side `crossing_allowed` enforcement in `portfolio.ts` — confirm the exact signature where candidates become prompt text.
2. **Single choke-point.** Case-derived material may enter assembly through **exactly one** loader — `loadAdmissibleCaseCrossings(practitionerId, fieldContext)` — and nowhere else. Bypass-prevention must be *structural* (one door), not vigilance. (`structure-is-the-safeguard`.)
3. That loader joins the admissibility ledger (Step 2) and returns only rows whose derived status = `approved`. Default deny.

## Step 2 — The append-only crossing record

De-individuation is the **outcome of an accountable review event**, never a stored boolean:

```sql
CREATE TABLE authorized_crossings (
  id             UUID PRIMARY KEY,
  memory_id      UUID NOT NULL REFERENCES case_memories(id),   -- origin, never mutated
  decision       TEXT NOT NULL CHECK (decision IN ('approved','refused','revoked')),
  decision_reason TEXT NOT NULL,
  de_individuation_basis TEXT NOT NULL,   -- HOW it was judged no longer to encode one person
  consent_basis  TEXT,                    -- present iff transformation incomplete (MAIA_MEMORY_CANON:61)
  reviewed_by    UUID NOT NULL REFERENCES members(id),
  reviewed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- **Append-only.** No UPDATE/DELETE. `revoked` is a new row, not an edit. Admissibility = latest event per `memory_id` (`approved` and not later `revoked`).
- **Origin immutable.** `case_memories` is never mutated; `crossing_allowed` is *no longer flipped in place* — admissibility becomes derived from this ledger. (Satisfies B′ §2.)
- **Who may decide:** `reviewed_by` must be the **practitioner**, not a Studio Steward — a steward cannot read client data (`STUDIO_STEWARD_MODEL_2026-07-08.md` §3.A), so a steward cannot judge de-individuation. Enforce this, don't just document it.
- The decision is the **new authored write event**. *Writable ≠ admissible* (`authority-from-write-event`).

## Step 3 — Replace the single-axis decision with the multi-axis predicate

`loadAdmissibleCaseCrossings` admits a row only if:

```sql
authorship = 'practitioner_authored'                             -- axis 1 (existing constraint)
AND latest(authorized_crossings.decision) = 'approved'           -- axis 2 (transformation, reviewed)
AND (transformation_complete OR consent_basis IS NOT NULL)       -- axis 3 (consent, MAIA_MEMORY_CANON:61)
```

A `practitioner_authored` row with **no** approving crossing event is **held** — which is the correction to the latent single-axis gap (a practitioner-authored but still client-entangled memory must not cross on the label alone).

## Step 4 — Prove no alternate path can bypass the ledger

Structural, then tested:

1. **Structural:** the only reader of `case_memories` that feeds assembly is `loadAdmissibleCaseCrossings`. Any other code path reading `case_memories` into a prompt is a defect by construction.
2. **Add a check to `scripts/verify-colab-boundaries.ts`** (the Co-Lab Release Gate — must pass in prod before tester waves; already triggers on "memory atoms / any migration touching those tables"). New assertion: *no code path outside `loadAdmissibleCaseCrossings` reads `case_memories` content into field/prompt context; every admitted crossing has a corresponding `approved` `authorized_crossings` row.* This makes the boundary survive future refactors, not just today's review.

## Definition of done (the rung-4 experiment, encoded as a test)

1. Seed a `practitioner_authored` `case_memory` with **no** crossing event → assert the loader **refuses** it (this is the "not yet" against a wanted recognition).
2. Append an `approved` `authorized_crossings` row with `de_individuation_basis` → assert the loader now **admits** it.
3. Append a `revoked` row → assert it is **held again**.
4. Throughout, assert the origin `case_memories` row is **byte-for-byte unchanged**.
5. `verify-colab-boundaries.ts` passes with the new assertion.

Test 1 passing against something a practitioner *wanted* admitted is the first rung-4 evidence. Until then this remains a plan.

## Explicitly out of scope (do not expand)

- No case→member-atom promotion path (a different seam; not needed for field crossing).
- No automated de-individuation classifier — the basis is a human review event, by design.
- No steward involvement in the decision (jurisdiction bound).

## Session handoff (2026-07-08) — where this stands and the next pass

**Done this session:** Step-2 ledger migration `20260708000001_authorized_crossings.sql` written + applied to the **local** `maia-postgres` (Mac Studio, not prod) + verified by `scripts/verify-authorized-crossings.sql` (all assertions pass, rolled back). Behavior-neutral, not deployed, not wired. Recorded in `REFUSAL_REGISTRY.md` as **Proposed → R17** (R-number withheld until a live-spine refusal exists — R16 is already the Developmental State Shaping Guard).

**Gate before loader work — migration-ledger reconciliation.** The loader depends on schema truth; building it against a drifted local DB tests a false substrate. Local diagnosis (2026-07-08): `schema_migrations` records **340** of **415** on-disk files (**75-file gap**); newest *recorded* filename is `20260504000001` (tracker appears stalled ~2026-05-04); `20260626000002` (the `authorship`/`crossing_allowed`/`case_memories_maia_held` migration the loader's axis-1 needs) is **genuinely unapplied locally**. Do **not** bulk-apply blindly (that worsens drift).

**Confirmed next order:**
1. **Reconcile migration ledger** — classify the 75-file gap into: applied-but-unrecorded · unapplied · obsolete/superseded. Reconcile via the established ledger process, not ad-hoc.
2. **Confirm `20260626000002` state** — `authorship`, `crossing_allowed`, `case_memories_maia_held` all present locally.
3. **Build Step-3 loader** — `loadAdmissibleCaseCrossings`, multi-axis predicate (§3), single assembly door.
4. **Add verifier** — `verify-colab-boundaries.ts` assertion: no alternate prompt path reads `case_memories`; every admitted crossing has an `approved` ledger event.
5. **Deploy schema + loader + verifier together** — Constitutional Completion; deploy is currently **held** by directive.
