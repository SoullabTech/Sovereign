# BCS-01A · Step 3 — Coverage Falsification + Uniformity Trap · Evidence

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu`
**Prior:** `BCS-01A_STEP2_RED_WITNESS_EVIDENCE_2026-09-13.md`
**Scope:** recurrence **validity** only. ⛔ No sweep · no persistence · no checkpoints · no
worker · no queue · no model call · no CMT participation.

> **Purpose:** prove that partitioned execution cannot manufacture a recurrence observation
> whose evidentiary coverage does not support its claim.

---

## 0 · Boundary honoured: `classify.ts` untouched

⭐ Confirmed at `e1c6f527` and left exactly as found. The classifier sees claim text, commissioned
lens and non-conclusions; it sees **no** prose, **no** `DevelopmentalCoverage`, **no** frozen
scope. **That is a sovereignty boundary, not a deficiency** — classification must not reach back
into the Work and quietly become a second reader.

```text
LAWFUL   candidate → evidence + actual coverage → validity boundary → if admissible → classifier
⛔ NOT   classifier says recurrence → therefore recurrence is valid
```

⭐ The taxonomy may **describe** an observation. It may neither manufacture its evidence nor cure
invalid coverage.

## 1 · What was built

```text
lib/boundedCognition/recurrenceAdmission.ts          admitRecurrence()  — one pure function
lib/boundedCognition/__tests__/w-recurrence-admission.test.ts   14 assertions
```

⛔ No new architectural noun. ⭐ Reuses the existing `DevelopmentalCoverage` / `ReadDepth`
vocabulary from `lib/manuscript/development/readState.ts` rather than inventing a parallel one.

**Verdicts are propositions, not success vocabulary:**
`ADMISSIBLE · PARTIAL_COVERAGE · REGULARITY · INSUFFICIENT_SEPARATION · EVIDENCE_OUTSIDE_COVERAGE`.
⛔ No `valid_result`, no `recurrence_score`, no `confidence`, no `complete_enough`.

### ⭐ Coverage-as-bookkeeping is refused **structurally**

`admitRecurrence` accepts **no partition, job, checkpoint or progress input**. There is no type
through which *processed* could be mistaken for *read*. Only `DevelopmentalCoverage` enters, and
**only `body`-depth sections count** — knowing a section's position is not reading the thing that
supposedly recurred.

### Order of checks is part of the law

```text
1 EVIDENCE_OUTSIDE_COVERAGE   an occurrence never read is not evidence
2 PARTIAL_COVERAGE            a claim reaching past what was read is refused for THAT reason
3 INSUFFICIENT_SEPARATION     "two refs in an array" ≠ "two separated points"
4 REGULARITY                  uniform across every unit read, even at full coverage
```

⭐ Ordering matters for *truthfulness of the refusal*, not only for control flow: a refusal must
name the actual defect.

---

## 2 · ⚠️ FINDING — the §3 "lawful neighbour" fixture is REGULARITY under the ratified definition

The Step-3 act offers, as the lawful neighbour to the prohibited whole-scope claim:

```text
coverage  s1 · s2        occurrences  s1 · s2        extent = COVERAGE
"Within s1–s2, gesture X recurs."   → "may proceed if the other recurrence predicates hold"
```

⭐ **Taken literally, the other predicates do not hold.** The ratified `isNot` excludes *"a
property holding uniformly across every unit read"* — and here the gesture is present in **2 of 2**
covered units. That fixture is **REGULARITY**, not admissible recurrence. The act's own
conditional *"if the other recurrence predicates hold"* anticipated this; the implementation makes
it concrete.

⛔ **Not treated as a contract challenge, and nothing was softened.** The implementation follows
the ratified definition literally, and the witness uses a three-unit coverage
(`read s1·s2·s3, found s1·s3`) so that the coverage predicate and the uniformity predicate can be
distinguished rather than fused.

⚠️ **Consequence worth a founder eye, not decided here:** under the literal rule, recurrence is
**unprovable in a two-unit coverage** — any repetition across both units is uniformity. That is
conservative and truthful, and it may be exactly right. ⛔ It is recorded as an open question, not
resolved by implementation convenience.

---

## 3 · Witness evidence

| Witness | Result |
|---|---|
| **W-COVERAGE** · partial coverage may not become whole-scope recurrence | 4 assertions GREEN — `PARTIAL_COVERAGE` on the prohibited claim, `bodyRead = [s1,s2]` showing the repetition is genuine, lawful neighbour `ADMISSIBLE`, full-scope claim `ADMISSIBLE` once the scope was read |
| **W-COVERAGE-SOURCE** · reads, not bookkeeping | 3 assertions GREEN — a position-depth section is not read; evidence there is `EVIDENCE_OUTSIDE_COVERAGE`; a commissioned-scope claim over position-depth remainder is `PARTIAL_COVERAGE` |
| **W-UNIFORMITY** · regularity is not recurrence | 3 assertions GREEN — `X X X X → REGULARITY` at full coverage with separation; `X . X . → ADMISSIBLE`; all three geometries distinguished in one assertion so reject-everything cannot pass |
| **W-SEPARATION** | 2 assertions GREEN — two passages in one covered unit, and a single occurrence, both `INSUFFICIENT_SEPARATION` |
| **W-EVIDENCE-MEMBERSHIP** | 2 assertions GREEN — in-scope-but-unread evidence refused; membership checked before every other predicate, so the refusal names the right reason |

### The geometry, established

```text
X X X X   → REGULARITY
X . X .   → candidate RECURRENCE
X X ? ?   → not whole-scope recurrence (PARTIAL_COVERAGE)
```

---

## 4 · Mutation evidence — five bad implementations, five REDs

Each mutation made the prohibited behavior real in the lawful module; the same witness was re-run.

```text
M1  ignore coverage completeness          → Tests: 3 failed, 11 passed
M2  ≥2 separated occurrences ⇒ admissible → Tests: 2 failed, 12 passed
M3  listed counts as read (depth ignored) → Tests: 3 failed, 11 passed
M4  evidence membership unchecked         → Tests: 3 failed, 11 passed
M5  separation by array length            → Tests: 1 failed, 13 passed

RESTORED   5 suites · 39 tests · 39 passed
```

⚠️ **M3 is a deliberate substitution, named rather than glossed.** The act specifies *"derive
coverage from scheduled/processed partitions"*. That mutation is **unwritable here** — the
signature admits no partition input, which is the structural defence. M3 therefore expresses the
same class of error at the only place it can exist: **treating a listed section as a read one**,
dropping the body-depth filter. *Bookkeeping counted as reading.*

---

## 5 · Exit gate

```text
PARTIAL COVERAGE     M1 RED · coverage-local claim GREEN · whole-scope partial REFUSED   ✅
UNIFORMITY           M2 RED · uniform → REGULARITY · separated non-uniform → ADMISSIBLE  ✅
COVERAGE SOURCE      M3 RED · actual body-depth reads govern                             ✅
EVIDENCE MEMBERSHIP  M4 RED · evidence outside coverage REFUSED                          ✅
SEPARATION           M5 RED · distinct covered units required                            ✅
```

⭐ **Step 3 closes.** Next authorized stage: **minimum durable execution** — ⛔ not recurrence
discovery.

## 6 · Claim ceiling

A Step-3 PASS establishes **only** that the deterministic recurrence-admission boundary
distinguishes evidence-supported recurrence from coverage inflation and regularity, **for
explicitly supplied occurrence locations and coverage**.

```text
⛔ does NOT establish   that a sweep can discover recurrence
                        that partitions are implemented correctly
                        that coverage is captured from real execution
                        that checkpoints are durable
                        that a model identifies repeated gestures correctly
                        that a recurrence observation is persisted
                        that the classifier will choose recurrence
                        that Whole-Work cognition exists
```

⛔ **Separation is deliberately narrower than the phenomenon's natural language:** it requires
occurrences in **distinct covered units**, because the evidence representation cannot yet
establish ordered separation *within* a section. ⭐ Narrow and truthful beats broad and
manufactured; broadening waits until the representation can actually establish the relation.

⛔ **Project gates still owed** — `npm run typecheck` and `npm run test` have not run in this
environment (no `node_modules`); a minimal toolchain in the session scratchpad was used.
