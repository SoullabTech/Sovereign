# BCS-01 — Bounded Cognition Implementation Charter / Acceptance Contract

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu` · **Base:** `e1c6f527`
**Derived mechanically from:** FR-J9 (`JARVIS-ORCHESTRATION-BOUNDARY-01_FOUNDER_RULINGS_2026-09-13.md` §2h)
**Governed by:** FR-J1 · J5 · J6 · J2 · J3 · J4 · J7 · J8 · J9 · **BCS-M1**
**Census of record:** `JARVIS-BOUNDED-COGNITION-SUBSTRATE-CENSUS_2026-09-13.md` (repaired BCS-C2, superseded in part by FR-J9 §1)

**Standing:** ⛔ **CHARTER RECORDED. IMPLEMENTATION NOT AUTHORIZED.**
No lane opened · no code · no schema · no migration · no worker · no producer registration.
⭐ **This is an acceptance contract, not a design.** It adds no new concept; every clause traces
to a ruled section.

---

## 0 · ⭐⭐⭐ The rule above the whole implementation phase

> **If the first implementation requires changing the constitutional contract to make the code
> easier — stop.**
>
> **If contact with reality reveals the contract described something falsely — reopen the
> contract with evidence.**
>
> **Those are very different events.**

⭐ The distinction is the entire protection. The first is convenience rewriting law; the second
is law being corrected by evidence, which is how every correction in this lane has already
worked. ⛔ An implementation may not conflate them, and "it was hard to build" is never
evidence that a contract described something falsely.

---

## 1 · What the constitutional sequence achieved (why this stops here)

```text
1  PREVENTED ACCIDENTAL CENTRALIZATION
   no orchestration runtime object · no universal provenance store ·
   no generic bounded-cognition service · no canonical jobs table

2  SEPARATED RELATIONS THAT WOULD HAVE BECOME SHORTCUTS
   retrieved ≠ used            execution ≠ participation
   participation ≠ authority   lineage ≠ causality
   completion ≠ currency       invalidation ≠ authorization
   freeze ≠ permanent consent

3  CONVERTED SCALABILITY FROM MYSTERY TO BOUNDED ENGINEERING
   six of nine substrate responsibilities already proved in production code;
   the genuinely new work is now narrowly identifiable
```

⭐ **More abstraction now produces diminishing returns. The next useful knowledge must come from
contact with an implementation.**

---

## 2 · Subject

> **ONE bounded Writer's Studio cognition flow.** ⛔ Not a platform, not a general capability,
> not a substrate release.

---

## 3 · MUST PROVE — the acceptance obligations

Each obligation names the ruled section it discharges and the falsifier it defends.

| # | Must prove | Source | Defends |
|---|---|---|---|
| P1 | **Commissioned scope** — the execution runs against an explicit commission, not an ambient trigger | FR-J9 §3-4 | F-J9.1 |
| P2 | **Frozen Work state** — scope frozen with recoverable identity before execution | FR-J9 §4-5 | F-J9.1 |
| P3 | **Current-consent contraction** — a later, more protective member state narrows the frozen ceiling *during* the run | FR-J9 §4 | **F-J9.2** |
| P4 | **Durable execution** — enqueue, claim, worker identity, heartbeat, bounded attempts, terminal states | census §0b (media-job precedent) | — |
| P5 | **Crash recovery** — an abandoned claim returns to executable state | census §0b (three reaper fns) | — |
| P6 | **Checkpoint resume** — restart continues at unit N+1, not from zero | FR-J9 §6 | F-J9.3 |
| P7 | **Cancellation** — request act distinct from actual terminal state | FR-J9 §7 | **F-J9.7** |
| P8 | **Frozen input lineage** — output → `EvidenceRef` @ frozen revision/range/digest | FR-J9 §9 | F-J9.5 · F-J9.6 |
| P9 | **Three-state currency** — `UNCHANGED \| CHANGED \| UNMEASURED`, orthogonal to execution status | FR-J9 §8-9 | **F-J9.4** |
| P10 | **No automatic recomputation** — staleness produces a reason, never permission | FR-J9 §10 | **F-J9.9** |
| P11 | **Output classified by material type** — never by the fact a job produced it | FR-J9 §11 | F-J9.8 |
| P12 | **CMT boundary preserved** — outputs reach MAIA only as later-offered, classified material | FR-J9 §12 | F-J2.1 |

⭐ **P3, P7, P9, P10 are the four least likely to be proved by accident** — each is a place where
the convenient implementation and the lawful one differ. They should be falsified first, not
last.

---

## 4 · MUST NOT INTRODUCE

```text
⛔ universal jobs service            ⛔ generic bounded-job producer
⛔ orchestration object              ⛔ causal claims derived from lineage
⛔ standing processing permission    ⛔ CMT-01 M3 by implication
```

⭐ The last is the quiet one: an implementation that needs its outputs to reach a live response
**has authorized M3 by implication**. ⛔ It has not. Until M3, an admission is evidence about the
shadow (FR-J3 §CONTRIBUTED caveat).

---

## 5 · Proving workload — **recurrence sweep** ("have I already said this?")

⛔ **Not** the contradiction pass, the Whole-Work developmental pass, coherence, voice drift or
structural development.

### Why this one

```text
large Work → bounded commission → frozen scope → partitioned computation → checkpoints
→ lineage back to exact passages → incremental invalidation when passages change
→ durable observations → later MAIA retrieval
```

⭐ It exercises nearly every Step-8 responsibility **with comparatively modest interpretive
authority**: a recurrence observation is grounded in exact passages and does not require the
system to decide what the repetition *means*.

### ⭐⭐ Census finding — recurrence is a better substrate proof than it first appears

`recurrence` is one of the **eight ratified phenomena** (`lib/manuscript/developmentalReading/contract.ts`),
with an is/isNot definition already in canonical, and `classify.ts` already exists. So the
workload **reuses ratified vocabulary rather than inventing a taxonomy** — which is what FR-J8
and BCS-M1 both require.

⭐ And its ratified `isNot` clause contains, verbatim:

> *"…**a whole-Work pattern asserted from partial coverage**…"*

⭐⭐⭐ **That is precisely the hazard a partitioned, checkpointed sweep creates.** A job that
computes per-partition and reports across partitions must not let *coverage* drift from *claim* —
which is the same boundary as **F-J9.3 (progress is not a finding)**, arriving independently from
the phenomenon contract. ⭐ The proving workload therefore comes with an acceptance test already
ratified: **a recurrence claim whose coverage does not support it is invalid by the existing
definition, before any FR-J9 falsifier is applied.**

⚠️ Also ruled out by the same definition: *a property holding uniformly across every unit read*
is **regularity, not recurrence** — a partitioned implementation must not manufacture recurrence
out of uniformity.

---

## 6 · BCS-M1 preflight — predicates owed before any design is accepted

> **Every proposed field, type, status, table or API verb must state the predicate its name
> claims before the design is accepted.**

Owed for at least these, each of which has already been caught promoting itself in this lane or
its neighbours:

```text
finding · checkpoint · result · stale · cancelled · depends_on · authorization_basis
observation · coverage · partition · complete · lineage · commission · scope
```

⛔ Any of these entering a schema, type or route without a stated predicate is a charter failure,
independent of whether the code works.

---

## 7 · Sequence held

```text
LAW      complete   FR-J1 · J5 · J6 · J2 · J3 · J4 · J7 · J8 · J9
METHOD   complete   BCS-M1
CENSUS   complete   run · repaired (BCS-C2) · superseded in part (FR-J9 §1)
DESIGN   complete   FR-J9

NEXT     ACCEPTANCE CONTRACT (this document)
              ↓
         ONE proving cognition flow
              ↓
         falsify substrate
              ↓
         only then generalize
```

⛔ **Generalization is the last step, not the first.** A second cognition flow is not authorized
by the first one working.

---

## 8 · Standing

```text
CHARTER              RECORDED
IMPLEMENTATION       NOT AUTHORIZED — requires an explicit founder act
LANE                 NOT OPENED
SUBJECT              one bounded Writer's Studio cognition flow (recurrence sweep proposed)
CODE / SCHEMA        UNTOUCHED
CMT-01 M3            UNAUTHORIZED
NEW CONSTITUTIONAL   none owed; a further ruling is warranted ONLY if implementation
RULINGS              discovers a real unanswered authority question
```

> **Nine rulings, one method binding, one census and one repair produced no code — which is the
> correct output for a sequence whose purpose was to decide what may be built before anything
> is.** What exists now is not an architecture proposal. It is **a governed permission boundary
> for future implementation.**
