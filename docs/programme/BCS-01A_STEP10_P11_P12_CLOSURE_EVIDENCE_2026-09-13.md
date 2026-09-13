# BCS-01A · Step 10 — P11/P12 Closure · Evidence

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu` · **Base:** `de67eff0`
**Suite:** 10 suites · **122 tests · 122 passed**

> ⛔ No recurrence discovery · no model call · no new producer · no fake `member.atoms`
> CandidateBlock · no CMT-01 M3 · no direct renderer/prompt/served-turn path.

---

## 1 · Built

```text
database/migrations/20260913000005_recurrence_sweep_observations.sql
lib/boundedCognition/recurrenceObservation.ts
lib/boundedCognition/__tests__/w-observation-participation.pg.test.ts   14 assertions
```

`recurrence_sweep_observations` columns, exactly: `id · execution_id · claim_text ·
claim_extent · created_at`. ⛔ No `producer_id`, `model_id`, `worker_id`, `job_type`,
`output_type`, `result`, `confidence`, `meaning`, `importance`. `claim_extent` reuses Step-3's
vocabulary — no second scope vocabulary exists.

`recurrence_sweep_observation_evidence` is `(observation_id, partition_id) PK · occurrence`, with
the FK to **`checkpoint_inputs`** — so an observation can only rest on material whose acquisition
lineage is already recoverable.

⭐ **The coverage constructor's signature is the guard.** `buildRecurrenceClaimCoverage(uses)`
takes only explicit per-claim evidentiary uses; there is no parameter through which an
`executionId`, a checkpoint list, or "all lineage" could arrive, so the automatic derivation is
**unwritable** rather than merely forbidden. That is the third narrowing of M8, done by relation.

## 2 · P11 — materially exercised

| | Result |
|---|---|
| **POSITIVE** coverage `s1·s2·s3`, occurrences `s1·s3`, extent `coverage` | ADMISSIBLE → **1 observation · 3 evidence rows · 2 with `occurrence`** · `materialKind = recurrence_observation` |
| **PARTIAL_COVERAGE** | refused · 0 rows |
| **REGULARITY** (2/2 covered units) | refused · 0 rows — ⭐ the two-unit ruling now pinned **through the real output path** |
| **INSUFFICIENT_SEPARATION** | refused · 0 rows |
| **evidence not in this execution** | refused · 0 rows |

## 3 · P12 — the boundary discriminates

```text
POSITIVE ARM   member.atoms → adjudicateParticipation → ADMITTED
               under its existing conditions, unchanged: writers_studio · identity verified
               · notSanctuary · memberAboutAllowed

RECURRENCE     no producer key matching /recurrence|sweep|bounded/ exists
ARM            the observation module exports no CandidateBlock converter and does not
               mention CandidateBlock, producerId or adjudicateParticipation at all
               an untrusted offer bearing `system.recurrence_observation` →
               CanonicalTurnRefused('unregistered_producer') — the G2 lock already in MIPA
```

⭐ **Not built from a fake `member.atoms` block.** That would have tested whether the boundary
trusts a lie under a lawful identity. The recurrence arm fails because **no truthful producer
classification exists**, while a separate, real, registered producer proves the positive arm.

### ⭐⭐ Finding — the nearest neighbour exists, and still cannot carry it

My first registry lock banned the token `observation` and immediately matched two **legitimate
pre-existing producers**: `practitioner.atoms_observations` and
**`system.writer_pursued_observation`**. That was the R1 failure again — a word ban where a
relation was meant.

⭐ Narrowing it produced a **stronger** negative arm than the one specified.
`system.writer_pursued_observation` is `authoredBy: 'system'`, `participationClass: 'retrieved'`,
`rooms: WRITERS_ONLY` — a system-authored Writer's Studio observation producer, the closest
possible neighbour. And it **still cannot truthfully carry a recurrence observation**, because its
declared provenance is *`writerStudioContext.pursuit` — MAIA's own earlier words, returned to the
turn*. A bounded-cognition sweep artifact is not MAIA's earlier words.

> **The P12 negative arm rests on provenance truthfulness, not on name absence.** The witness
> asserts that provenance directly, so a future producer whose name merely avoids "recurrence"
> could not silently become a vehicle.

## 4 · Mutation evidence — R2 applied, bad effect first

| | Bad effect proved | Witness |
|---|---|---|
| **F11-A** | same material, different classification once a worker is named | ⚠️ **GREEN first** → instrument repaired → **RED** |
| **F11-B** | observation row exists with zero evidence rows | RED (1 failed) |
| **F11-C** | admission bypassed: REGULARITY/PARTIAL candidates persist | RED (3 failed) |
| **F11-D/E** | coverage inflated to whole commissioned scope; partial claims pass | RED (2 failed) |
| **F12-A** | module imports the canonical-turn adjudicator | RED (2 failed) |
| **F12-B** | material identity renamed to `recurrence_sweep_job_output` | ⚠️ **GREEN first** → instrument repaired → **RED** |
| **F12-C** | registry surface gains `system.recurrence_observation` | RED (2 failed) |
| **F12-D** | `member.atoms` fails its lawful admission (`sanctuary: true`) | RED (1 failed) |

⭐ **F12-D is the one that keeps P12 honest**: breaking the *positive control* REDs the witness,
so universal refusal cannot pass as a working boundary.

### ⚠️⚠️ Two mutants stayed GREEN, and the repair went to the instrument

**F11-A** and **F12-B** both performed their forbidden relation and were not detected. Under R2
that is an instrument defect, not a mutation to tidy:

- the classifier was only ever called one way, so an added machinery parameter went unseen;
- the identity was compared to a hardcoded literal, so a mutant renaming it **in lockstep** passed.

⭐ The repaired F-J2.3 instrument now (i) calls the classifier through **two construction paths
with different machinery metadata outside the classified value** and requires equality, (ii)
asserts the identity **does not name machinery** — `/job|sweep|worker|model|queue|execution|result|output/`
— which is the *relation*, not a string a mutant can move, and (iii) asserts structurally that the
classifier signature has exactly one parameter and names no machinery.

⭐⭐ **This is the fourth time in the lane that a prohibition needed its instrument at the surface
where the relation could actually appear** — and the first time the defect was *a literal
comparison that a mutation could satisfy by moving both sides.* Worth carrying: **an assertion
against a constant is only as strong as the constant's independence from the code under test.**

### A third C21 recurrence, recorded

The no-direct-path scan initially RED'd on the module's **own header comment**, which names the
forbidden surfaces in order to document that it avoids them. Comments are now stripped first —
the same lesson, third occurrence in this lane.

## 5 · Exit

```text
P11 materially exercised                 GREEN
F11-A…E                                  RED
P12 positive neighbour (member.atoms)    GREEN
P12 recurrence boundary (type + runtime) GREEN
F12-A…D                                  RED
registry surface                         UNCHANGED (member.atoms spec asserted intact)
CMT-01 M3                                UNTOUCHED
suite                                    122 / 122
```

⛔ **BCS-01A is NOT declared accepted from this suite.** The P1–P12 census must be rerun.

## 6 · Owed / not established

```text
⛔ project gates     npm run typecheck · npm run test still not run (no node_modules here)
⛔ no general recurrence discovery · no model recurrence judgment · no automatic sweeps
⛔ no producer registration · no M3 · no served-response contribution
⛔ production readiness NOT PROVED — the provider remains a fixture seam
⚠️ prior witnesses restated once more: the Step-4 and Step-6 "zero epistemic output" claims are
   now asserted in ROW COUNTS rather than table names, which is strictly stronger and survives
   future tables. Recorded because an assertion that changes is a claim that changed
```
