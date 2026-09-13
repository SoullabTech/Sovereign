# BCS-01A · Step 1 — Predicate Preflight

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu` · **Base:** `e1c6f527`
**Authorization:** `BCS-01A_RECURRENCE_PROVING_IMPLEMENTATION_AUTHORIZATION_2026-09-13.md` §3, §14
**Gate:** **BCS-M1** — *a name is a claim; its semantic strength may not exceed what the evidence
establishes.*

**Standing:** ⛔ **NO CODE · NO SCHEMA · NO MIGRATION written or authorized by this document.**
This is the gate every later artifact must pass, not an implementation.

> **If the implementation cannot state what must be true for the word to remain honest, the word
> does not enter the design.**

---

## How to read each entry

```text
PREDICATE     the exact proposition the name asserts
HONEST WHEN   what must be established for the word to be usable
DOES NOT      the stronger reading the name invites and must not carry
SOURCE        the ruled section that fixes it
```

---

## 1 · `commission`

- **PREDICATE** — an authorizing act occurred, at a named time, by a named authority, defining
  purpose · material scope · authorization ceiling · maximum permitted execution jurisdiction.
- **HONEST WHEN** — the act is recorded separately from the execution it authorizes, and the
  execution references it rather than restating it.
- **DOES NOT** — assert that the execution ran, that the scope is still permitted **now**, or
  that the commission is irrevocable. *Freeze is not permanent consent* (FR-J9 §4).
- **SOURCE** — FR-J9 §3-4 · FR-J7 §9.

## 2 · `scope`

- **PREDICATE** — the finite set of material this execution is permitted to read, expressed so
  that membership is decidable **before** reading.
- **HONEST WHEN** — a reader can answer *"is passage X in scope?"* without consulting the
  execution's behaviour.
- **DOES NOT** — assert the material was read, or that everything in scope was reachable.
  ⭐ Permission for one scope never propagates to a neighbouring scope (FR-J7 §5).
- **SOURCE** — FR-J9 §4 · FR-J7 §5.

## 3 · `partition`

- **PREDICATE** — a disjoint, enumerable subdivision of the commissioned scope, each unit
  independently processable.
- **HONEST WHEN** — the partitioning is derivable from the frozen scope, and union-of-partitions
  = scope, with no overlap silently double-counting a repetition.
- **DOES NOT** — imply any partition was processed, or that partition boundaries are meaningful
  to the Work. ⚠️ **A partition is an execution convenience; the member's Work has its own
  structure and the two must not be conflated.**
- **SOURCE** — FR-J9 §3 · charter §5.

## 4 · `coverage` ⭐ *the load-bearing word of this workload*

- **PREDICATE** — the precise subset of the commissioned scope that was **actually read** by the
  execution that produced a given output.
- **HONEST WHEN** — it is attached to the **claim**, not only to the job, and is computed from
  what was read rather than from what was scheduled.
- **DOES NOT** — equal `scope`, equal "partitions marked complete", or license a whole-Work
  statement. ⭐⭐ The ratified phenomenon contract already rules a **whole-Work pattern asserted
  from partial coverage** INVALID — so coverage is **part of claim validity, not execution
  metadata**.
- **SOURCE** — `developmentalReading/contract.ts` (`recurrence.isNot`) · charter §5 · F-J9.3.

## 5 · `checkpoint`

- **PREDICATE** — a bounded portion of the commissioned computation completed successfully, and
  enough durable execution state exists to avoid unnecessarily repeating it.
- **HONEST WHEN** — it is readable only by the execution path, and nothing member-facing or
  MAIA-facing can reach it.
- **DOES NOT** — constitute a finding · conclusion · Work observation · CMT producer ·
  member-facing material · proof of truth · a completed job. ⭐ **Persistence for recovery does
  not confer epistemic standing.**
- **SOURCE** — FR-J9 §6 · F-J9.3.

## 6 · `complete` / `completed`

- **PREDICATE** — the commissioned computation reached its **normal execution terminus against
  its frozen scope**.
- **HONEST WHEN** — read strictly as a historical fact about one execution.
- **DOES NOT** — mean currently accurate · relevant · unchanged · approved · member-facing ·
  authoritative. ⭐ *Execution terminus is historical fact; currency is a comparison with now.*
- **SOURCE** — FR-J9 §8 · F-J9.4.

## 7 · `cancel-request`

- **PREDICATE** — a legitimate actor, at a named time and under named authority, asked this
  execution to stop.
- **HONEST WHEN** — the record answers **who/what authority · when · which execution** (and where
  appropriate, the stated reason), and can coexist with a still-running execution.
- **DOES NOT** — assert that execution stopped, or that anything was undone.
- **SOURCE** — FR-J9 §7 · F-J9.7.

## 8 · `cancelled`

- **PREDICATE** — execution **actually terminated before normal completion** because an accepted
  cancellation request.
- **HONEST WHEN** — the terminal transition is observed, not inferred from the request's
  existence. ⭐ The interval between request and termination must be **witnessable**.
- **DOES NOT** — apply to a completed execution. ⛔ Withdrawal/deletion/retirement of completed
  outputs is a **separate responsibility, not decided** (FR-J9 §7).
- **SOURCE** — FR-J9 §7 · F-J9.7.

## 9 · `lineage` (full name: **frozen input lineage**)

- **PREDICATE** — material E, at frozen revision/range/digest R, was **supplied to / read by** the
  execution that produced output F.
- **HONEST WHEN** — the frozen identity is sufficient to compare E@R against later Work state.
- **DOES NOT** — assert **F causally depended on E**. ⭐⭐ `CONTRIBUTED ≠ EFFECT ESTABLISHED`
  (FR-J3). ⛔ **Lineage is not causality.** ⛔ Also distinct from an execution prerequisite
  (`job B after job A`), which establishes no epistemic relation at all.
- **SOURCE** — FR-J9 §1, §9 · F-J9.5 · F-J9.6.

## 10 · `observation`

- **PREDICATE** — a claim about the Work, of a **ratified phenomenon type**, supported by named
  passages within stated coverage.
- **HONEST WHEN** — it names its phenomenon from the existing eight, carries its evidence refs,
  and its coverage supports its scope of claim.
- **DOES NOT** — assert truth, significance, member agreement, or authority. ⭐ **FR-J8: system
  perception, refusable, never accumulating authority.**
- **SOURCE** — FR-J8 · `developmentalReading/contract.ts`.

## 11 · `result`

- ⚠️ **FLAGGED: the weakest word in the set.** It names no relation at all — it invites *"the
  answer"*, and would silently span checkpoint, observation and rendered output.
- **RECOMMENDATION** — ⛔ **do not admit `result` into the design.** Use the specific term:
  `checkpoint` (progress) · `observation` (a phenomenon claim) · `output` (a durable artifact of
  an execution). ⭐ If a covering term is genuinely needed, **`durable output`** carries the
  predicate *"an artifact persisted by a completed or terminated execution"* and nothing more.
- **SOURCE** — BCS-M1 §5 (decomposition) · FR-J9 §6, §11.

## 12 · `currency`

- **PREDICATE** — a **comparison between** a durable output's frozen inputs **and the Work as it
  is now**, resolving to `UNCHANGED | CHANGED | UNMEASURED`.
- **HONEST WHEN** — it is stored and reasoned about **orthogonally to execution status**, and
  `UNMEASURED` is representable, never rendered or reasoned as current.
- **DOES NOT** — assert correctness, relevance, or that a changed input altered the output
  (that would be causal promotion, F-J9.5).
- **SOURCE** — FR-J9 §8-9 · F-J9.4 · `ask/staleness.ts` precedent.

## 13 · `stale`

- ⚠️ **FLAGGED: two-state word for a three-state condition.** "Stale/not stale" cannot express
  `UNMEASURED`, and a surface that cannot say *"I do not know"* will say *"no"* (the staleness
  contract's own doctrine).
- **RECOMMENDATION** — ⛔ **do not admit `stale` as a stored state.** Use `currency` with its
  three values. `stale` may appear only as informal prose for `currency = CHANGED`.
- **SOURCE** — BCS-M1 §5 · FR-J9 §8 · `ask/staleness.ts`.

## 14 · `authorization basis`

- **PREDICATE** — the identified commission/scope reference **under which** a specific governed
  act (a read, a material crossing, an execution) was permitted, resolvable to who authorized
  what, when, and up to which execution jurisdiction.
- **HONEST WHEN** — it points at the frozen commission rather than restating it, and effective
  permission is evaluated as **frozen ceiling ∩ current protection state** at the moment of the
  act.
- **DOES NOT** — grant permission by existing; ⛔ nor survive a later, more protective member
  state. **Index identity may duplicate the scope; authority may not.**
- **SOURCE** — FR-J9 §4 · FR-J7 §9 · F-J9.2.

---

## Summary — two words refused at the gate

| Word | Disposition |
|---|---|
| `commission · scope · partition · coverage · checkpoint · complete · cancel-request · cancelled · lineage · observation · currency · authorization basis` | ⭐ **ADMITTED** with the predicates above |
| **`result`** | ⛔ **REFUSED** — names no relation; use `checkpoint` / `observation` / `durable output` |
| **`stale`** | ⛔ **REFUSED as a stored state** — two-state word for a three-state condition; use `currency` |

⭐ **BCS-M1's first use inside an implementation removed two words before either could become a
column.** That is the gate working as intended — cheaper here than in a migration.

---

## Standing

```text
STEP 1        COMPLETE — predicate preflight recorded
ADMITTED      12 terms with stated predicates
REFUSED       `result` · `stale` (as a stored state)
NEXT          Step 2 — RED witnesses for P3 / P7 / P9 / P10, before any happy path
CODE/SCHEMA   NONE written · none authorized by this document
```

> Any field, status, type, table, API verb or durable relation entering this implementation
> without a stated predicate is a **charter failure, independent of whether the code works.**
