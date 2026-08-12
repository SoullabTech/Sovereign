# RME-001 — Relational Memory Evaluation laboratory

**Phase 1 = A/B only. C is RESERVED. No member execution. Stop at COR-B.**

Built at canonical `52a3b924b7cf52013c1c8b0d635359c2cad672fc` (`origin/clean-main-no-secrets`) in a detached worktree. **Nothing committed.** Placement — inside this repo vs. a separate one — is a founder decision; note that an evaluation whose purpose is isolation from MAIA has an argument for living outside MAIA's tree.

## Governing invariant

> **RME may learn about MAIA from encounters. MAIA may not learn about members from RME.**

## Layout

| Path | Role |
|---|---|
| `boundary/isolation.ts` | The one-way barrier. Nominal `Quarantined<T>` brand, scope-bound capability tokens, enumerated + prefix-guarded forbidden sinks, egress ledger. |
| `schema/encounter.ts` | Evidence schema. Primary object is an **encounter**; there is no member record and no place to put one. Epoch-stamped. |
| `conditionB/competentB.ts` | Competent-B spec construction. Execution refuses at COR-B. C refuses to construct. |
| `rubric/dimensions.ts` | Nine dimensions, preserved individually. Composite scoring throws. |
| `consent/cohort.ts` | Consent statement, covenant, two selection routes, inspection gate, feedback surface (disabled). |
| `__tests__/isolation.falsification.ts` | 26 adversarial attacks. `npx tsx rme/__tests__/isolation.falsification.ts` |

## How the barrier is structural rather than reviewed

- **Nominal brand.** `Quarantined<T>` carries a module-private symbol. No MAIA signature accepts it and TypeScript cannot structurally coerce it.
- **No unbranded reader.** There is no export that turns a quarantined value into a plain value without a live token. Adding one is the only way through, and it is a reviewable act.
- **Scope-bound capability.** Tokens are minted only inside `withEvaluationBoundary()` and revoked on exit. A token captured by a closure is dead on use — attacked and refused in group 2.
- **Sink declaration + prefix defence.** Nine enumerated sinks are refused by name; any unenumerated `maia.*` sink is refused by prefix, so a future MAIA subsystem is covered before it exists.
- **Witnessed egress.** Every unwrap is recorded, so a test can assert no MAIA-bound egress occurred rather than infer it.

## Designed-in decisions that cannot be retrofitted

- **Epoch stamping** (`schema/encounter.ts`). Once encounters exist unstamped, Soul Lab capability exposure makes condition A a moving target and cross-time comparison is unrecoverable.
- **`'C'` absent from the `ConditionId` union.** Not a flag — the type has no C. A simulated "better memory" cannot be recorded as evidence.
- **No member aggregate type.** Permitted: *"In encounter E, A was more presumptuous than B."* A per-member rolling score would recreate `cognitiveAltitude` in a new costume.
- **Pre-registered interpretation in code** (`rubric/dimensions.ts`): **B > A is a successful finding**, recorded before any run so it cannot be quietly revised after a result arrives.

## Design finding — Q2 (recorded as a finding, not a weakness)

> **Longitudinal evaluation necessarily permits relational sequencing; safety therefore resides in prohibiting derived member traits, not prohibiting encounter linkage.**

A longitudinal programme cannot be prevented from grouping encounters by person without destroying the question it exists to ask. Two categorically different acts:

| Act | Status |
|---|---|
| `Encounter 1 → 4 → 9 → correction → later change in MAIA's attending` | **Evidence about relationship through time.** Permitted. |
| `member.relational_depth = 0.74` | **A new representation of the person.** Refused. |

The falsification suite attacks five named derivations by name rather than asserting none were written.

## Falsification result

**38 attacks, 38 refused, 0 failed.** Covers all five founder falsification questions:
Q1 RME→MAIA consumption · Q2 implicit profile via aggregation · Q3 B contamination
(and its inverse, **fresh ≠ impoverished**) · Q4 B write-back · Q5 judgment mistaken for member fact.

## Open, requiring founder ruling

1. **COR-B** — both flags false. `/list` write-footprint inventory correction, and a guarantee that B generation is non-persisting **by construction**, not by cleanup.
2. **Covenant last line** — *"You remain the authority on your own experience"* reads as a deference rule, which CANON-002 explicitly is not. Recommended pairing noted inline at `consent/cohort.ts`.
3. **Placement and commit.** Nothing has been committed.
4. **Cohort overlap** with Soul Lab (SL-001 obs. 4). Epoch stamping implements option 1; the ruling is still owed.
