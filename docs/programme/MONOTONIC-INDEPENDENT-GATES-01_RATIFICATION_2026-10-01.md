# MONOTONIC-INDEPENDENT-GATES-01 — ratified (founder, 2026-10-01)

**Kind:** reusable House / runtime governance law. **Standing:** RATIFIED (founder act, 2026-10-01).
Occasioned by EARLY-FIELD-01 (`EARLY_FIELD_*` → `LivingFieldInstrument`) and H1
(`HOUSE_STUDIO_H1_*` → explicit Work-context Studio arrival) being live in one runtime (`3421a2096`).

> **Independent feature admission gates compose monotonically: admitting or denying one feature
> never silently alters the admission state of another.**

## The law

For independently governed experimental capabilities:

1. Each gate owns its **own eligibility authority, configuration and admission endpoint**.
2. No gate reads another gate's eligibility or configuration as an input to its own decision.
3. Every gate **fails closed independently**.
4. Opening gate A must not implicitly open, close, weaken or reinterpret gate B.
5. Closing gate A must not make the underlying ungated capability unavailable unless A explicitly owns that capability.
6. The observable state of the system is the **product of the independent gate states**, never a hidden aggregate "experimental access" bit.
7. **Every reachable combination is witnessed independently.** Proof of `(0,0)`, `(1,0)` or `(0,1)` does not constitute proof of `(1,1)`.
8. Membership in one cohort confers **no evidence of membership in another**.
9. No cross-gate configuration coupling may be introduced merely for rollout convenience.

## Two-gate matrix (EARLY-FIELD × H1)

| Early Field | H1 | Must mean | Witness |
|---:|---:|---|---|
| 0 | 0 | neither experiment admitted | ⛔ not witnessed in production (R2 NO EVIDENCE: H1 was already open) |
| 1 | 0 | Early Field only | ⛔ not reached |
| 0 | 1 | H1 only | **running now**; R3 drafted, ⛔ not run |
| 1 | 1 | both independently admitted | ⛔ not reached |

*Experimentation becomes compositional rather than cumulative: admission to one emerging field
never accrues into a vague, expanding class of "beta access."*

## Current conformance (source, not production)

- Separate authorities: `lib/access/earlyFieldAccess.ts` and `lib/access/houseStudioH1Access.ts`.
  The H1 module's record states it imports no EARLY-FIELD, lab or founder authority. EARLY-FIELD's
  test asserts it imports no lab or founder authority. ⚠️ **No test yet asserts the two modules
  never import or read each other** (clauses 2 and 9). That is a candidate guard, ⛔ not built here.
- Separate endpoints: `/api/early-field/admission` · `/api/house-studio/admission`, each with its own exact, non-public access-matrix rule.
- Separate environment: `EARLY_FIELD_*` · `HOUSE_STUDIO_H1_*`.
- Each gate governs only its experiment. The Living Field and Writer's Studio stay ungated (clause 5).

⛔ This ratification changes no code, configuration or cohort.
