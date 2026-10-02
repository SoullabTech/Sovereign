# REVIEW-CUSTODY-01 · SUITE FREEZE

**Date** 2026-09-20 · **Status** ⭐ **FREEZE TAKEN** · INTACT
**Authority** founder act, 2026-09-20 — S3 Class-B precedent
**Freeze commit** `bbb5ff5c65edf7a7e3851c5a6379e6414e3e3f8d`
**Manifest** `tests/constitutional/review-custody/FREEZE.json`
**Guard** `npm run verify:review-custody-freeze`

---

## What is frozen, and by what identity

⭐ **Blob hashes, not a commit diff.** Blob identity survives history rewriting and says
exactly which bytes are law.

```text
scripts/review-custody-core.ts                     b215072f2df934af38ef52007a72b6a2251800b3
tests/constitutional/review-custody/falsifiers.ts  f2b24f38c9952baf08d68eb0fe2a7e3e564b4b82
tests/constitutional/review-custody/candidates.ts  7ebe72d80e059a134033e723be78223db942b7db
```

That is the contract, the `CustodyDecisions` seam, `STRICT`, the fourteen falsifier
definitions and the fourteen defeat candidates.

**Deliberately NOT frozen**, each for a stated reason:

| Path | Why |
|---|---|
| `tests/constitutional/review-custody/matrix.ts` | the instrument that RUNS the law; extending it to run additional suites cannot weaken the law it runs |
| `scripts/review-custody.ts` | the CLI shell; it composes the core and may adopt additional gates |
| `tsconfig.review-custody.json` | typecheck configuration; widening its include set cannot weaken a falsifier |

---

## The law

> **Implementation fails suite → repair the implementation.**
> ⛔ Forbidden: reinterpret the law → weaken the test.

Modifying any RC-F1…RC-F14 expectation, the `CustodyDecisions` interface, or `STRICT`
requires a **formal, named founder act** carrying evidence the **LAW or the INSTRUMENT**
was wrong — never that an implementation was inconvenient.

### ⭐ Additive law is lawful; editing is not

The freeze is **not** a prohibition on new law. New law lands at **its own address** with
its own falsifiers and defeat candidates, and the frozen blob hashes are the mechanical
proof that nothing was edited to accommodate it. Step 2 exercised exactly this: eight new
laws (`RC-C1…RC-C8`), eight new candidates, **zero frozen bytes changed.**

---

## The guard is proven in both directions

A guard never observed failing is a claim. Verified in-session:

```text
intact   → FREEZE INTACT · exit 0
drifted  → appended two comment lines to falsifiers.ts
           ⛔ expected f2b24f38c995…, live cb086b81bbd4… · exit 1
restored → exit 0
```

⛔ **Intact means the law was not edited.** It says nothing about whether any
implementation satisfies it — that is what the matrices are for.

---

## Standing

**FREEZE TAKEN @ `bbb5ff5c` · 3 FILES FROZEN BY BLOB HASH · GUARD LANDED AND PROVEN
LETHAL BOTH WAYS · ADDITIVE LAW PERMITTED AT ITS OWN ADDRESS · ⛔ EDITING A FROZEN FILE
REQUIRES A NAMED FOUNDER ACT WITH EVIDENCE THE LAW OR INSTRUMENT WAS WRONG · FROZEN
MATRIX 14/14 AT FREEZE AND AFTER STEP 2 · PRODUCTION UNTOUCHED.**
