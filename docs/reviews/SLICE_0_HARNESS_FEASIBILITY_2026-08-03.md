# Slice 0 — harness feasibility finding

**Status:** ⛔ **FINDING ONLY. Nothing built.** Deliverable of step 2 of the founder sequence —
*"Verify whether the proof can be achieved on existing substrate."*
**Referent:** `origin/clean-main-no-secrets` @ `136f580a0`.

**Authorization in force:** *Slice 0 trust-boundary demonstration. Slice 0 may proceed only as a
verification/harness lane until a finding demonstrates that product code is required.*

---

## The proof splits into three, not one

Slice 0's deliverable — *evidence that client-owned material remains inaccessible to the practitioner
environment* — is three distinct assertions with three different feasibilities.

### ① Structural — *no column exists by which to reach it* · ✅ ALREADY PROVEN

Proven on trunk today by `scripts/verify-coach-field-boundaries.ts`:

- **`1a`** — *person-owned tables have NO `relationship_id` to reach them by*
  (`coach_client_personal_notes`, `coach_client_selected_focus`)
- **`12g`** — *a client-selected focus has no relationship column to reach it by* — asserted as a
  **refusal**, matching `/relationship_id.*does not exist/`

⚠️ **Adding assertions here would duplicate existing coverage.** This half of Slice 0 is done, and it
was done before the authorization was issued.

### ② Static reachability — *no practitioner-scoped code path reads it* · ✅ PROVABLE TODAY, NO PRODUCT CODE

**Not currently asserted anywhere.** Measured directly:

| Table | App files referencing it |
|---|---|
| `coach_client_selected_focus` | **0** |
| `coach_client_processes` · `coach_program_enrollments` · `coach_program_stages` · `coach_program_definitions` · `coach_sessions` | **0** each |
| `practitioner_clients` | **58** |

⭐⭐⭐ **The invariant is currently TRUE by absence, and nothing holds it there.** That is precisely the
shape of #899: `sessions.team_id` was correct at migration time, no static check held it, and four
write paths drifted over five weeks without anyone noticing.

> **Freezing the zero is a real deliverable.** A harness asserting *no practitioner-scoped path
> references person-owned tables* is expressible over the codebase — no schema, no UI, no service
> code — and is A/B-testable against a deliberately planted violation, so it cannot pass vacuously.

This is the Slice 0 proof that is available now, and it fits inside the harness boundary.

### ③ Behavioral — *Larry's view does not vary with the client's private material* · ⛔ BLOCKED

The ruled form of this proof is the two-fixture diff: *render two fixtures differing only in private
material and diff them.*

It cannot be exercised, and the reason is not a gate:

- `lib/coachField/` exports **only** identity translation (`resolvePractitionerRecordFromMember`,
  `resolvePractitionerMemberFromRecord`, `authorizePractitionerClientRelationship`) and invitation
  (`createPendingRelationship`, `acceptInvitation`).
- **No `coach_*` process, program, or session table has a single application reader.**
- There is therefore **no "Larry's view of a client" composed from the coach-field spine** to diff.

> **You cannot prove that a view does not vary when there is no view.**

⭐⭐⭐ **This is the finding the authorization anticipated.** Per its own boundary — *"until a finding
demonstrates that product code is required"* — ③ requires product code, and that requirement surfaced
in **step 2 (verification)** rather than mid-build. The boundary worked as designed.

Per the standing rule, ③ **returns as a ruling candidate; it is not absorbed into implementation.**

---

## ⚠️ Adjacent finding — recorded, not resolved

`practitioner_clients` has **58 application readers** across studio · portal · comms · stellium ·
notifications, while every `coach_*` process table has **zero**. The Phase 0 inspection describes
`practitioner_clients` as the spine introduced by `20260802000002_practitioner_client_relationship.sql`
(#902), yet a large pre-existing surface already reads that table name.

Whether #902 created it, extended it, or collided with an older table of the same name is **not
established here.** It bears on **E-1** (*the existing `clientMessages.ts` sits on the OLD practitioner
lineage, not the `practitioner_clients` spine*) and on the lineage question the record already flags.

⛔ **Not resolved by this finding, and must not be resolved by building.**

---

## The decision this surfaces

1. **Is ② the Slice 0 deliverable?** A static-reachability harness that freezes the currently-true zero
   — inside the harness boundary, no product code, and it closes the exact drift class that produced
   #899.
2. **Does ③ return as a ruling candidate** for a bounded practitioner read surface, or does it wait?
3. **Does the `practitioner_clients` lineage question need its own look** before either?

Nothing has been built.

*The system does not outrun the evidence.*
