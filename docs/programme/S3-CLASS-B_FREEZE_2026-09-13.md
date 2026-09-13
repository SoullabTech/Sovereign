# S3 CLASS-B FREEZE

**Taken** founder, 2026-09-13 · **Subject SHA** `2255b60d`
**Authority** S3-DESIGN-01 §15 · falsifier spec §6.4

---

## Frozen objects

```text
transition contract                tests/constitutional/s3/transitionContract.ts
falsifier suite                    tests/constitutional/s3/falsifiers.ts
                                   S3-F1…F7 · F9 · F10
eight defeat candidates            tests/constitutional/s3/candidates.ts
conforming reference double        candidates.ts · CONFORMING
execution matrix                   tests/constitutional/s3/matrix.ts
classified-collateral record       candidates.ts · expectedCollateral
constitutional typecheck           tsconfig.s3-constitutional.json
matrix instrument                  npm run matrix:s3-constitutional
```

## Evidence at freeze

```text
LETHALITY        8 / 8 candidates killed, each by its named falsifier
DISCRIMINATION   6 / 8 named falsifier ONLY
                 2 / 8 additional failures, CLASSIFIED as irreducible
                 unclassified collateral: NONE
REFERENCE        conforming double 9 / 9 PASS
TYPECHECK        strict · PASS
MATRIX           execution · PASS
```

---

## ⭐ RATIFIED — the collateral rule

```text
CLASSIFIED COLLATERAL      a necessary consequence of faithfully embodying the
                           named wrong architecture
                           → admissible evidence

⛔ UNCLASSIFIED COLLATERAL  accidental incompetence, missing behaviour, or an
                           unrelated defect in the candidate
                           → candidate-isolation defect
                           → must be repaired BEFORE freeze
```

**The test:**

> **If removing the collateral failure requires making the candidate cease to
> embody the constitutional error it was built to represent, that collateral is
> irreducible.**

⭐ **DC-2 stays exactly as it is.** Once `request == act`, the corruption
propagates naturally into concurrent claim · replay identity · completion
recovery · prose-mutated replay. Its four deaths are **not four unrelated
defects; they are four observable consequences of one wrong identity
primitive.** ⛔ Do not flatten it for a prettier matrix.

> ⭐⭐ **The architectural lesson B-iv inherits: act identity is not an
> implementation detail of idempotency. It is upstream constitutional identity
> from which concurrency, replay and recovery semantics follow.**

DC-3/F10 is the same shape: if the machine believes identity is prose, a
reference has no independent authority-bearing identity to isolate. **F10's
death follows from the ontology of the wrong machine.**

---

## ⚠️ Two limitations that the freeze CARRIES, and does not resolve

### The reference double

```text
PROVES        the frozen laws are mutually satisfiable
⛔ DOES NOT   say how S3 should be implemented
⛔ NOT        storage precedent · concurrency mechanism · schema precedent ·
              implementation seed
```

⛔ **Copy-forward from it during B-iv is prohibited except at the level of the
frozen contract.**

### S3-F1

```text
MODEL-LEVEL CONCURRENCY   PROVED
DATABASE ATOMICITY        ⛔ NOT PROVED
```

B-iv owes a **real concurrency witness** against whichever storage/transaction
mechanism is chosen. ⭐ The freeze **does not prejudice what that mechanism must
be.**

---

## What the freeze means

```text
LAWFUL       implementation fails frozen suite → the IMPLEMENTATION changes

⛔ FORBIDDEN implementation fails frozen suite → the contract or falsifier changes
```

Any change to a frozen object requires a **formal S3 Class-B freeze reopening**,
with evidence that the instrument or the law itself was wrong.

```text
⛔ convenience                                   NOT SUFFICIENT
⛔ implementation difficulty                     NOT SUFFICIENT
⛔ "storage would be simpler if F7 meant X"      DEFINITELY NOT SUFFICIENT
```

---

## Standing

```text
CLASS-B FREEZE        ⭐ TAKEN @ 2255b60d
B-i · B-ii · B-iii    CLOSED
B-iv                  AUTHORIZED — design/census first
STORAGE DESIGN        NOT TAKEN
MIGRATION             NOT AUTHORIZED
PRODUCT SOURCE        UNCHANGED
PRODUCTION            UNTOUCHED
```
