# BW-01 — FREEZE RULING

**Lane**: `JARVIS-ORCHESTRATION-CORE-01` · **Founder act, 2026-09-13**
**Ruling**: ⭐ **BW-01 SUCCEEDS AS A PRIMITIVE AT ONE CROSSING. IT DOES NOT ESTABLISH SYSTEM-WIDE
WORK AUTHORITY.** BW-01 is **FROZEN** exactly where it is.

> *The primitive passed. The architecture taught us something larger. The system has not yet earned
> the larger claim.*

---

## 1. The finding that outranks the primitive

The new type is not the strongest result. What implementation exposed underneath the old seam is:

> ⭐⭐ **The system had conflated *load the Work* with *prove the member may access the Work*.**

That is a deeper architectural fact than the census could have shown, because it was invisible from
the outside: the seam behaved correctly, and its correctness was a property of one SQL predicate
rather than of any decision the code made.

**Authority geometry, before:**

```
memberId + workRef → SELECT content WHERE owner = memberId → content returned → therefore authorized
```

**After:**

```
minted identity → ownership predicate → BoundWorkScope → content operation
```

Authorization ran *after* materialization and was *inferred from* it. Now it runs before, and is
decided on its own terms.

---

## 2. ⭐ THE LAW — `BW-LAW-1` · Authorization precedes materialization

**Ratified in-lane, 2026-09-13. Founder wording.**

> **Authorization must precede materialization. Content retrieval may CONSUME authority; it may
> never MANUFACTURE authority.**

The narrower form discovered during implementation stands beneath it as the operative test:

> An authority primitive may depend on an **ownership predicate**; it must not depend on a **content
> loader**.

### 2.1 What the law separates

Three things that were previously easy to blur, and are **not interchangeable**:

| | Question |
|---|---|
| **IDENTITY** | who is acting? |
| **OWNERSHIP** | what may this identity access? |
| **CONSENT** | may this particular boundary crossing occur? |

⛔ At the focus crossing, `mayCrossBoundary` answered **consent** while the `SELECT` silently
answered **ownership**. That is *accidental authority composition* — safe at one seam, and the
category of thing that becomes dangerous exactly as a system grows and its seams multiply.

### 2.2 ⭐ The general principle this is an instance of

> **Data that names a thing must not silently become proof that one may act upon the thing.**

`memberId` names a member. `workRef` names Work. **Neither is authority.**

The same distinction will eventually matter for memory, practitioner relationships, connected
resources, authored material, agent actions, and whatever future envelopes Jarvis carries. ⛔ Noted
as a direction, **not** authorized as a lane.

---

## 3. Why the fixture result is the strongest single piece of evidence

```ts
identity: {} as never
```

coexisted with successful Work access. That is not "the tests were weak." It shows that **identity
was decorative with respect to Work authority at that seam** — the system could hold a sophisticated
identity architecture (branded types, private minting, a WeakSet, a single resolver) while the actual
access decision remained attached to an ordinary string.

After BW-01, that contradiction is **unrepresentable at the crossing**. ⭐ The improvement worth
caring about is not better comments. It is **fewer illegal states**.

---

## 4. Rulings on the three judgment calls

### 4.1 The `SELECT 1` duplication — ⛔ DO NOT REPAIR

The duplication with `memberOwnsWork()` is **currently informative**: it records that
`lib/manuscript/ask/frozenReading.ts` owns both an authorization-like predicate and content-loading
concerns. Pulling the primitive downward to reuse the query would damage the layering to remove a
handful of SQL tokens. **A bad trade.**

⭐ The test asserting the authority query cannot name `body` or `content` protects the **semantic
boundary**, not merely the import graph — which is why it is the right instrument here.

A canonical ownership-predicate module may eventually exist. ⛔ **BW-01 does not invent it because
duplication looks inelegant.**

### 4.2 `toJSON()` throwing — RATIFIED, and for a stronger reason than stated

Stronger than "non-serializable". It declares:

> ⭐ **A `BoundWorkScope` is an exercised judgment, not data.**

A serialized representation would invite later readers to treat it as an *authority token*, when it
is *the result of a particular authorization judgment in a particular execution context*. Destroying
it at a process boundary **forces the system to ask the question again** — which gives revocation,
changed ownership, policy change and stale queue jobs somewhere principled to live.

### 4.3 The C8 mock-state failure — KEEP IT IN THE RECORD

Not trivia. It establishes a methodological rule:

> ⭐ **`BW-METHOD-1` — Security symmetry tests require symmetric preconditions.**

Otherwise a stateful fixture can **manufacture apparent information leakage, or conceal real
leakage**. For the class BW-F4/C8 protects against, these must remain distinguishable:

```
a difference caused by AUTHORIZATION STATE
a difference caused by DISCLOSURE BEHAVIOUR
```

The corrected C8 tests the latter.

---

## 5. Evidence ladder — what has actually been proved

| Claim | Status |
|---|---|
| A minted Work authority primitive can exist independently of raw identifiers | ⭐ **PROVED at focus crossing** |
| The primitive requires minted identity rather than request `memberId` | ⭐ **PROVED at focus crossing** |
| Ownership can be adjudicated without loading content | ⭐ **PROVED** |
| Work authority cannot survive serialization | **ENFORCED by implementation** |
| Existence disclosure is symmetric at this crossing | **TESTED** |
| Binder authority cannot trivially relocate undetected | **ATTACK-TESTED** |
| All Work access uses this authority geometry | ⛔ **NOT PROVED** |
| Raw member identifiers no longer confer authority elsewhere | ⛔ **FALSE — 33 exceptions remain** |
| Runtime MAIA exercises the primitive correctly | ⛔ **UNWITNESSED** |
| Production possesses this property | ⛔ **NOT CLAIMED** |

---

## 6. ⛔ The tempting next move is REFUSED

> *"Great — replace all 33."*

**No.** BW-01 delivered a **diagnostic instrument** as much as a primitive. Use it to learn what
those 33 crossings actually are **before** generalizing. A migration performed before the
classification would encode today's guesses as tomorrow's structure, and some of the 33 should
probably never receive a `BoundWorkScope` at all.

---

## 7. Next act — IDENTIFIED, ⛔ NOT BEGUN

**A read-only classification of the 33 BW-F5 baseline entries against `BW-LAW-1`:**

| Class | Meaning |
|---|---|
| **A** | identifier transport only — no authority implication |
| **B** | legitimate ownership predicate |
| **C** | authorization embedded in content retrieval *(the BW-01 shape)* |
| **D** | raw identifier currently functions as authority |
| **E** | unclear — requires runtime evidence |

**What the classification decides**: whether BW-01 is a **local remedy** or **the first instance of a
much larger authority pattern**. That question cannot be answered by inspection of the primitive; it
can only be answered by reading the 33.

⛔ Not a migration. ⛔ Not a repair. ⛔ Requires a founder act to begin.

---

## 8. Standing

**BW-01 FROZEN · `BW-LAW-1` RATIFIED IN-LANE · `BW-METHOD-1` RECORDED · CLASSIFICATION IDENTIFIED
AND NOT BEGUN · NO MIGRATION OF THE 33 · NO REPAIR OF THE `memberOwnsWork` DUPLICATION · BP-1/BP-2/
BP-3/BP-4 OPEN · OPEN-1 UNTOUCHED · J9 PROPOSED AND BLOCKING FOR OPEN-1 · NO SCHEMA · NO DEPLOY ·
NO PRODUCTION WITNESS · BRANCH GATE STILL PREREQUISITE TO ANY SCHEMA FROM THIS LANE.**

> *Data that names a thing must not silently become proof that one may act upon the thing.*
