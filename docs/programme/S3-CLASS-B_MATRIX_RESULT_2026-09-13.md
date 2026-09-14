# S3 CLASS-B · B-ii + B-iii MATRIX RESULT

**Lane** S3-DESIGN-01 · Class B
**Authority** founder rulings 2026-09-13 (typed contract · B-ii · discrimination)
**Date** 2026-09-13 · ⛔ **FREEZE NOT TAKEN — founder act**

---

## Result

```text
LETHALITY        ESTABLISHED — all 8 candidates died on their named falsifier
DISCRIMINATION   CLEAN — every collateral death is CLASSIFIED as irreducible
REFERENCE        clean — the conforming double passes all nine
```

| candidate | error | intended | failed |
|---|---|---|---|
| DC-1 | read-before-write claim | S3-F1 | S3-F1 |
| DC-2 | request-keyed idempotency | S3-F2 | S3-F1 · **S3-F2** · S3-F4 · S3-F6 |
| DC-3 | prose-derived identity | S3-F3 · S3-F4 | **S3-F3 · S3-F4** · S3-F10 |
| DC-4 | per-section consumption | S3-F5 | S3-F5 |
| DC-5 | regenerate on lost response | S3-F6 | S3-F6 |
| DC-6 | incomplete means resumable | S3-F7 | S3-F7 |
| DC-7 | client-carried scope authority | S3-F9 | S3-F9 |
| DC-8 | durable reusable authority | S3-F10 | S3-F10 |

⭐ Six of eight killed exactly one falsifier and nothing else. **The suite knows
why each machine is wrong, not merely that it is.**

---

## ⭐⭐ THE FINDING — SOME ERRORS HAVE AN IRREDUCIBLE BLAST RADIUS

Two candidates killed falsifiers outside their intended set. ⛔ **Neither is
candidate sloppiness, and neither is repaired by narrowing.**

> **A candidate narrowed until it kills only its named falsifier would no longer
> be the error it claims to model.**

So the matrix now distinguishes **classified** collateral (declared, with a
stated reason) from **unclassified** collateral (⛔ nobody accounted for it →
*repair candidate isolation*). Only the second is a defect.

### DC-2 · request-keyed idempotency — the most destructive of the eight

```text
S3-F1  if identity IS the request, two concurrent requests are two identities —
       act-level state is never consulted, so BOTH claim
S3-F4  no act-level completion is consulted, so a reworded replay under a new
       request re-executes
S3-F6  a lost-response retry carries a NEW request id, so it is a new identity
       rather than a recovery
```

⭐ **Substituting request identity for member-act identity does not weaken one
law. It defeats four of nine** — concurrency, replay, prose-mutation and
lost-response together. **The census had already proved this candidate is not
hypothetical** (`request_ref → runtime_consent_state(request_id)`), which makes
it the single most important machine in the corpus.

### DC-3 · prose-derived identity

```text
S3-F10  an unknown REFERENCE cannot be refused by a machine in which the
        reference is not what identifies
```

---

## Modelling limits — stated, not hidden

```text
⚠️ THE CORE IS A TEST DOUBLE, NOT AN IMPLEMENTATION
   a Map: no table, transaction, lock, durability or schema
   ⛔ evidence, never a seed — B-iv must not be derived from it, or storage
     decisions would be smuggled in from a double never designed to make them

⚠️ CONCURRENCY IS MODELLED, NOT PROVED
   JavaScript is single-threaded; the read-then-write race is modelled by an
   await between read and write — exactly what a DB round trip does
   ⭐ S3-F1 passing here is NECESSARY AND NOT SUFFICIENT: real atomicity must
     be proved against a database, in B-iv's own witness
```

---

## Reproducible instrument

```text
tsconfig.s3-constitutional.json   strict · noEmit · tests/constitutional/s3/**
npm run typecheck:s3-constitutional
npm run matrix:s3-constitutional
```

⛔ It does not widen `tsconfig.ship.json`, cannot move the baseline, and implies
nothing about constitutional test code being production code.

⚠️ **Run in this session with TypeScript/tsx resolved from a scratchpad**, since
the container has no `node_modules`: typecheck exit 0, matrix exit 0. ⭐ The
commands are repository-defined, so the founder's run is the evidence of record
— *"I happened to have TypeScript installed" is not an instrument.*

---

## Standing

```text
B-i   contract + falsifiers        CLOSED
B-ii  defeat candidates            COMPLETE · 8 disposable wrong machines
B-iii matrix                       LETHAL · DISCRIMINATING · reference clean
FREEZE                             ⛔ NOT TAKEN — founder act
B-iv  real implementation          ⛔ NOT AUTHORIZED
STORAGE · PRODUCT SOURCE           UNCHANGED
PRODUCTION                         UNTOUCHED
```
