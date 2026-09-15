# `TEMPORAL-MEMORY-RECONCILIATION-01` — PREPARED CHARTER

**Date** 2026-09-15 · ⛔⛔ **PREPARED, NOT OPENED.** ⛔ No repair · no redesign · no new memory
system · frozen decay note untouched · production `e57ca1baa` untouched.
**Opening requires an explicit founder act.**

**Occasioned by** `TEMPORAL_GOVERNANCE_INVERSION_FINDING_2026-09-15.md`.

> ⭐ **The lane's job is to RECONCILE the live decay mechanism with the emerging relational
> temporal law. ⛔ NOT to invent another memory system.**

---

## 1 · ⭐⭐ THE GOVERNING LAW

> ⭐⭐ **Decay may influence SALIENCE. It may not determine VALIDITY.**

⛔ The solution is **not to remove decay** — it is to **put decay in the right place.** Today it
acts as an *implicit temporal law*: it changes what survives retrieval while having **no single
authoritative definition.**

**Two systems, kept separate:**

| | question | carriers |
| --- | --- | --- |
| **Temporal meaning / truth** | *what does this memory MEAN now?* | `BEFORE` · `AFTER` · `SUPERSEDES` · `CORRECTED_BY` · `SAME_EPISODE` · `CURRENT \| SUPERSEDED \| UNMEASURED` |
| **Temporal salience** | *how likely is an otherwise-valid memory to surface RIGHT NOW?* | decay |

⛔ Decay **may affect ranking**; ⛔ it must **never** change truth, provenance, authority or
supersession.

**Three temporal questions — ⛔ never one scalar:**

```text
What happened?               → historical memory
What is true / current now?  → temporal relations + supersession
What matters in this encounter? → salience / accessibility / decay
```

---

## 2 · THE RUNTIME ORDER

```text
memory candidates → provenance / consent / authority gates → typed temporal relations
  → current-state / supersession resolution → contextual accessibility + salience
  → decay as ONE ranking signal → retrieval
```

⛔ **Not:** `old memory → decay score → falls below top 12 → effectively disappears.`

⭐ **Validity is decided BEFORE any score exists.** A corrected or superseded memory does not
become *more true* because it is recent; an old member statement does not become false because
it is old.

### 2.1 ⚠️ ONE TRAP IN THAT ORDER — supersession must LABEL, never FILTER

⛔ If *supersession resolution* removes superseded memories from the candidate set, MAIA loses
*"what did you believe before I corrected me?"* — ⭐ which is **query (5) of the predeclared
Episodic Phase 2 acceptance inputs, and its named discriminator.**

⭐⭐ **Enforcing present-truth by deleting historical access would make question 1 (*what
happened?*) unanswerable at retrieval** — the two systems collapsing in the other direction.
⛔ Resolution assigns state; it does not prune.

---

## 3 · THE TECHNICAL SEQUENCE

```text
1  reconcile the two decay implementations → ONE authoritative definition
     ⛔ NOT by picking the live one merely because it is live
2  WITNESS the real production path — does decay change what reaches
     MemoryBundle.build(), and therefore what Claude sees?
     ⭐ the witness comes BEFORE redesign
3  only then: make decay an EXPLICIT, INSPECTABLE component of a broader
     retrieval score rather than hidden temporal policy
```

### 3.0 ⭐⭐ THE TWO ACTS, AS RULED (founder, 2026-09-15)

```text
ACT 1   ratify temporal law
          ↓ bind both decay implementations
          ↓ compare EACH INDEPENDENTLY against "salience, never validity"
          ↓ STOP before choosing or changing either

ACT 2   use existing selectionTrace
          ↓ measure whether live decay changes what reaches MemoryBundle / MAIA
```

⛔ **Only after those two acts is reconciliation justified.**

⭐ **INDEPENDENTLY is load-bearing, and it is the same discipline `RELATIONAL-DISCOURSE-MEMORY-01`
carries**: *neither corpus may name the other before both have been independently described.*
⛔ **Do not diff the two implementations against each other in ACT 1.** Diffing them produces
*"they mostly agree — take the live one,"* which is the exact inheritance the finding refuses.
⭐ Each is judged against the LAW, alone. ⛔ And **if neither obeys it, neither inherits authority
merely because one is live.**

### 3.0a ⚠️⚠️ THE HAZARD BETWEEN THE ACTS — the evidence ACT 2 needs is PERISHABLE

⛔⛔ **No change to decay may land between ACT 1 and ACT 2.**

⭐ ACT 1 can plausibly conclude *neither implementation obeys the law* — and that conclusion
creates immediate pressure to repair. ⚠️ **But ACT 2 measures the behaviour of the UNRECONCILED
mechanism, and a repair destroys that state permanently.** Once decay is reconciled, ⛔ **what
the unreconciled decay was doing to members' prompts can never be measured again.**

⭐⭐ *This lane has already lost evidence exactly this way*: the `🌉 [L1/bridge]` line was
destroyed by a rollback — a legitimate act taken before the evidence was captured.
⛔ **A correct repair is as destructive to a perishable baseline as an incorrect one.**

⭐ So ACT 1's stop condition is not merely *stop before choosing*; it is **stop before changing,
and hold that freeze through ACT 2.**

### 3.1 ⭐ THE INSTRUMENTS ALREADY EXIST, AND ARE CO-LOCATED

```text
selectionTrace              lib/memory/MemoryBundle.ts   ← the 2026-09-06 audit named it
                                                            as what answers F2's open question
calculate_decayed_confidence  lib/memory/MemoryBundle.ts · PreferenceConfirmationStore.ts
                              · database/baseline · 20251231_memory_architecture_enhancements
```

⭐ **The witness and its subject are in the same file.** ⛔ Step 2 requires no new
instrumentation — which also means D2 applies: an observer that perturbs retrieval reports on
itself.

### 3.2 ⭐⭐ WHY THE LAW MUST PRECEDE THE RECONCILIATION

⚠️ *Which implementation is correct?* was previously **unanswerable** — there was **no stated
purpose for decay to be correct against.** ⭐ §1 supplies one: **salience, never validity.**
⛔ So step 1 is not a coin-flip between two functions, and ⛔ neither *"it is live"* nor *"it is
better specified"* decides it. **The law decides it.**

---

## 4 · ⛔ OUT OF SCOPE

⛔ The composite `retrieval relevance = referential + episode + discourse salience + semantic +
relational + bounded temporal salience` is **downstream design, not reconciliation.** ⚠️ It is
the shape this lane will be most tempted to build, and building it would make the lane *invent
another memory system* — the one thing §0 forbids.

⛔ Also out: removing decay · redefining memory types · opening Episodic Phase 2 · editing the
frozen temporal-memory direction note.

---

## 5 · STANDING

```text
lane ............................. ⛔ PREPARED · NOT OPENED
governing law .................... ⭐ DRAFTED (§1) · ⛔ not ratified
supersession labels ≠ filters .... ⚠️ TRAP NAMED (§2.1)
two acts ......................... ⭐ RULED (§3.0) · ACT 1 judges · ACT 2 measures
independent judgment ............. ⛔ do NOT diff the implementations against each other
decay frozen ACT 1 → ACT 2 ....... ⛔⛔ NO CHANGE MAY LAND BETWEEN THEM (§3.0a)
witness before redesign .......... ⭐ REQUIRED (§3)
instruments ...................... ⭐ EXIST · co-located · ⛔ no new instrumentation
decay ............................ ⛔ NOT REPAIRED · ⛔ NOT REMOVED · ⛔ NOT REDEFINED
composite score .................. ⛔ OUT OF SCOPE
production ....................... e57ca1baa · UNTOUCHED
```
