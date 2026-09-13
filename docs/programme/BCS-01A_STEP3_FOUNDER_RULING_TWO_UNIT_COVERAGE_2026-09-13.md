# BCS-01A · Step 3 — Founder Ruling: Two-Unit Coverage

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu`
**Raised by:** `BCS-01A_STEP3_COVERAGE_UNIFORMITY_EVIDENCE_2026-09-13.md` §2
**Ruling:** ⭐ **HOLD THE LITERAL CONTRACT. NO AMENDMENT.**

> **Under the current section-granular evidence representation, a recurrence observation is not
> admissible when every body-read unit contains the claimed repeated element or gesture.**
>
> **Therefore, where exactly two units have been read at body depth and the claimed element
> occurs in both, the truthful verdict is `REGULARITY`, not `RECURRENCE`.**
>
> **This does not establish that recurrence cannot exist across two units. It establishes only
> that the current evidence geometry cannot distinguish recurrence from the ratified exclusion
> "a property holding uniformly across every unit read."**

⭐⭐⭐ **Governing principle:**

> **When the evidence cannot distinguish two phenomena the contract distinguishes, the system
> narrows its claim; it does not blur the distinction.**

---

## 1 · Why this is not a contract challenge

The ratified definition carries both propositions, and with evidence at body-read section
granularity **both appear to hold** for `coverage s1·s2 / occurrences s1·s2`. ⭐ The `isNot`
clause is the **narrower prohibition and therefore governs admission**.

⛔ Nothing in implementation showed the definition false. It showed a **resolution boundary in the
evidence available to apply it.** *(BCS-01A §12: a CONTRACT CHALLENGE requires evidence that the
relationship itself is false or impossible to represent honestly — this is neither.)*

## 2 · The correct statement is about **provability**

```text
⛔ DO NOT RECORD   "Recurrence requires at least three sections."
                   — that promotes an implementation limit into the meaning of recurrence

⭐ RECORD          At the current section-level evidence resolution, admissible recurrence
                   requires evidence geometry that is not uniform across every body-read unit.
```

The smallest currently representable admissible geometry is therefore
`body-read ≥ 3 · occurrence units ≥ 2 · occurrence units < body-read` — ⭐ **a consequence of the
representation, not new phenomenon law.**

## 3 · Early and partial execution

A partitioned sweep may meet genuine repetition **before** it has enough coverage for an
admissible observation. That state stays:

```text
✅ execution evidence exists  +  recurrence not yet admissible
⛔ checkpoint → provisional recurrence → later upgraded
```

⭐ Reinforces **progress is not a finding**. A checkpoint may retain occurrence evidence for later
evaluation; **no recurrence observation exists until the admission predicate is satisfied.**

## 4 · No third state

⛔ `POSSIBLE_RECURRENCE` · `LIKELY_RECURRENCE` · `RECURRENCE_PENDING` are **not** to be added.
They would invent epistemic vocabulary to soften a truthful refusal. The execution may know
*"occurrences observed at s1 and s2"* without turning that fact into a phenomenon claim.

## 5 · Bound to the current representation

```text
OccurrenceLocation    → sectionId
DevelopmentalCoverage → section × position|body
```

A future representation that can truthfully establish finer-grained separated locations **may
justify reopening** how the contract applies at that resolution. ⛔ It does **not** authorize
silently redefining "unit read", weakening the regularity exclusion, or broadening this
implementation now. That needs its own evidence and ruling.

---

## 6 · The pin — implemented and mutation-proved

`W-TWO-UNIT` added to `lib/boundedCognition/__tests__/w-recurrence-admission.test.ts`, 4
assertions:

```text
2 body-read units, element in both              → REGULARITY
NEIGHBOURING POSITIVE CONTROL
3 body-read units, element in two               → ADMISSIBLE
same two occurrence units, only READING differs → REGULARITY vs ADMISSIBLE
no third state exists to soften the refusal     → verdict ∈ the five propositions
```

⭐ **The third assertion is the one that states the ruling precisely in code:** identical
occurrence geometry (`s1`, `s3`), differing only in how much was **read**, yields different
verdicts — which is exactly what the ruling says the verdict turns on. The floor is about
reading, not about the phenomenon.

**Mutation proof** — the broadening this pin exists to stop (`>= 2 separated units ⇒
admissible`):

```text
MUTANT   uniformity check removed  →  Tests: 5 failed, 13 passed
         W-TWO-UNIT REDs on 3 of its 4 assertions, by name
RESTORED 5 suites · 43 tests · 43 passed
```

---

## 7 · Standing

```text
RECURRENCE DEFINITION    UNCHANGED
STEP-3 IMPLEMENTATION    CORRECT AS WRITTEN — no repair indicated
TWO-BODY-UNIT 2/2 CASE   REGULARITY, pinned by regression witness
CONTRACT CHALLENGE       NO
NEW TAXONOMY             NO          NEW PHENOMENON STATE   NO
INTERPRETATION           evidence-resolution limit, not a claim that recurrence
                         cannot exist in two units
NEXT                     minimum durable execution
```

> ⭐ `admitRecurrence()` is not claiming that X is regularity in some metaphysical sense. It is
> saying that, **given only `sectionId` occurrence geometry and body-depth coverage, the stronger
> recurrence claim is not licensed because every observed unit carries X.**
