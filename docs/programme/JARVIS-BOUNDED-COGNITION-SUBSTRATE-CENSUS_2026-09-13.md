# Bounded Cognition Substrate — Read-Only Census

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu` · **Base:** `e1c6f527`
**Ordered by:** founder, 2026-09-13, as the gate on FR-J-SEQ step 8.
**Standing:** ⛔ **READ-ONLY. BUILD NOT AUTHORIZED.** No code · no schema · no lane opened.
**Governing rulings:** FR-J1 · FR-J5 · FR-J6 · FR-J2 · FR-J3 · FR-J4 · FR-J7 · FR-J8
(`JARVIS-ORCHESTRATION-BOUNDARY-01_FOUNDER_RULINGS_2026-09-13.md`)

> **Question asked:** what existing freeze, digest, invalidation, queue/worker, resumability and
> dependency primitives can be **reused**, rather than creating another architecture?

---

## 0 · ⚠️⚠️ Correction to this lane's own earlier finding — **there IS a job substrate**

`JARVIS-ORCHESTRATION-BOUNDARY-01_INTAKE_2026-09-13.md` §6.2 states:

> *"🔴 **There is no job substrate** in `lib/` — no queue, no worker abstraction, no bounded-job
> model."*

⛔ **That is wrong, and it is corrected here rather than deleted.** The first search looked for
`lib/jobs` / `lib/queue` directories and a named framework (BullMQ, pg-boss) and concluded from
their absence. A **durable, database-backed job queue exists** and has existed —
`lib/ai/EmbeddingQueueService.ts` over the `embedding_jobs` table — plus two standalone worker
scripts.

⭐ **This is the inverse-drift failure named in CLAUDE.md, committed by this lane**: live
infrastructure stayed invisible because the search looked for a *name* instead of a
*responsibility*. The corrected finding changes step 8 materially — from *"build a job
substrate"* to *"generalize one that already runs."*

*What remains true from §6.2: FAST/CORE/DEEP are response-latency tiers and must not be
overloaded with the turn-exceeding job meaning.*

---

## 1 · Findings by primitive family

### 1.1 · QUEUE / WORKER — ⭐ **STRONG PRECEDENT, durable and DB-backed**

`lib/ai/EmbeddingQueueService.ts` + `embedding_jobs`:

```text
status        pending | processing | done | error     (CHECK-constrained)
attempts      integer, with EMBEDDING_MAX_ATTEMPTS ceiling
last_error    text
locked_at     claim lock
completed_at  terminal stamp
created_at · updated_at · target_table · target_id · model · input
```

API: `enqueue…()` · `claimNext()` (attempt-bounded claim) · `markDone()` · `markError()` ·
`backlogCount()` · `stats()`. Consumers include `scripts/run-media-worker.ts`,
`scripts/run-session-summary-worker.ts`, `app/api/embeddings/backlog/route.ts`.

⭐ **Mapped against the founder's lifecycle, this already covers the middle of it:**

```text
commissioned → scoped → frozen → QUEUED → RUNNING → partial findings →
               COMPLETED / FAILED / cancelled → standing results
               ▲ pending    ▲ processing/locked_at   ▲ done / error
```

🔴 **Absent:** `commissioned` / `scoped` / `frozen against Work state` (the front), **partial
findings** and **cancellation** (the middle-to-end), and any member- or Work-scoped identity —
`embedding_jobs` is keyed by `target_table`/`target_id`, not by member and Work.

⚠️ **Reuse question for design, not decided here:** generalize this table, or build a sibling
with the same shape? ⛔ Either way, under FR-J7 a job that touches member material must carry
its **authorization basis** and execution jurisdiction — `embedding_jobs` records `model` but no
authorization basis, and its default model is a local Ollama embedder.

### 1.2 · FREEZE — ⭐⭐ **STRONGEST FAMILY. Already the house discipline.**

Freeze appears as a first-class, repeated pattern:

```text
lib/manuscript/development/readState.ts   per-section (revisionNumber, code-point range,
                                          digest) frozen into the append-only revision store;
                                          structure context frozen inline; inputFingerprint
lib/manuscript/development/bind.ts        unforgeable BoundEvidence
lib/manuscript/developmentalReading/      commission.ts · freeze.ts · scope.ts
lib/manuscript/structure/proposalStore.ts frozen proposals, separate from member structure
lib/manuscript/structure/readerProvenance  frozenAt stamped by the store at write
lib/manuscript/ask/frozenReading.ts · frozenDevelopmentalReading.ts
```

⭐ *"Frozen against Work state"* is not a new concept to invent — **commission · freeze · scope
is an existing, tested triad**, and BUILD-07A already demonstrated digest-verified recovery of
what was frozen. ⭐ **Reuse, do not re-derive.**

### 1.3 · DIGEST / FINGERPRINT — ⭐ **PRESENT, three distinct instruments**

```text
lib/manuscript/structure/canonicalFingerprint.ts   canonical form → stable fingerprint
lib/manuscript/structure/structureDigest.ts        structure state digest
lib/manuscript/sections/draftStateDigest.ts        draft state digest
```

plus `inputFingerprint` in `development/readState.ts` and digest verification in
`development/{bind,capture,resolve}.ts`.

⭐ These are **change-detection primitives sufficient to answer "did this change?"** 🔴 Nothing
consumes them to answer **"what else must therefore be recomputed?"** — that is the dependency
gap (§1.6), not a digest gap.

### 1.4 · INVALIDATION / STALENESS — ⭐⭐ **STRONG AND UNEXPECTED PRECEDENT**

`lib/manuscript/ask/staleness.ts` is a **five-dimension, genuinely three-state** staleness
model, and its header already argues the semantics this substrate needs:

> *"FIVE INDEPENDENT DIMENSIONS, EACH GENUINELY THREE-STATE. A real thread can have moved text
> AND a moved reviewed tree AND a newer reading, all at once; a tagged union over the five would
> force a surface to pick one and drop the rest, which is the collapse the contract exists to
> forbid."*
>
> *"`unmeasured` IS A STATE, NOT AN ABSENCE … a surface that cannot say 'I do not know' will say
> 'no'."*

⭐⭐ **That is FR-J3's discipline arriving independently in the staleness layer** — `unmeasured`
is the staleness analogue of `EFFECT ESTABLISHED: UNKNOWN`. ⭐ The bounded-job substrate should
**adopt this model wholesale** for *"which prior findings became stale?"* rather than inventing
a boolean.

Adjacent: `lib/manuscript/ask/retry.ts`.

### 1.5 · RESUMABILITY — ⚠️ **PARTIAL**

`claimNext()` + `attempts` + `locked_at` + `EMBEDDING_MAX_ATTEMPTS` give **crash-tolerant
retry**: an abandoned claim is re-claimable and bounded. 🔴 **Not present:** resumption of a
*partially completed* job (no partial-findings representation, so a job restarts rather than
continues), and no cancellation path — `status` admits no `cancelled`.

⚠️ For a Whole-Work sweep the difference is material: re-running a 300k-word analysis from zero
after a failure is the cost profile step 8 exists to avoid.

### 1.6 · DEPENDENCY — 🔴 **THE REAL GAP**

Nothing in `lib/` represents *"finding F depended on sections S1…Sn at revisions R1…Rn."*

⭐ But the **ingredients already exist**: `EvidenceRef` (section · passage · section-run ·
structure-unit · structure-units · structure-topology) is precisely a typed pointer into the
Work, and `readState` already freezes `(revisionNumber, range, digest)` per section. ⭐ **A
dependency edge is an evidence ref plus the frozen revision it was read at** — both halves are
built; nothing joins them into an invalidation graph.

⛔ Under FR-J8 this is also the sharpest constitutional edge: a dependency graph over a Work is
**system perception**, and must be visibly derived, refusable and never leverage.

---

## 2 · Summary table

| Family | State | Reuse verdict |
|---|---|---|
| Queue / worker | ⭐ durable DB queue, live | **Generalize** — front and end of lifecycle missing |
| Freeze | ⭐⭐ house discipline, tested | **Reuse wholesale** (`commission · freeze · scope`) |
| Digest / fingerprint | ⭐ three instruments | **Reuse** — sufficient for change detection |
| Invalidation / staleness | ⭐⭐ five-dimension three-state | **Adopt the model**, do not invent a boolean |
| Resumability | ⚠️ retry yes, partial-resume no | **Extend** — partial findings + cancellation |
| Dependency | 🔴 absent | **Build** — but from `EvidenceRef` + frozen revision |

⭐⭐ **Four of six families are substantially present.** Step 8 is an **assembly and
generalization problem**, not a new architecture — which is the same shape every census in this
lane has produced.

---

## 3 · Questions the census leaves for design (⛔ none answered here)

1. Generalize `embedding_jobs`, or a sibling table with the same proven shape?
2. Where does a job's **authorization basis** live (FR-J7 §9) — the job row, or a referenced
   scope object?
3. What is a **partial finding**, and does it become visible before completion or only at
   terminal state?
4. Is cancellation a status, or a separate act with its own record?
5. Does a job carry **member + Work identity** directly, or reach it through a scope reference?
   (FR-J7 §5 — scopes are distinct and permission does not propagate between them.)
6. Do findings from a completed job enter a later turn as **offered material crossing the CMT-01
   boundary** (FR-J2), and what is their producer class?

---

## 4 · Standing

```text
CENSUS               COMPLETE, READ-ONLY, at e1c6f527
CORRECTION           intake §6.2 "no job substrate" — WRONG, corrected §0
BUILD                NOT AUTHORIZED · no design accepted · no lane opened
CODE / SCHEMA        UNTOUCHED
```

> **The bounded-job substrate is less missing than it looked.** What is genuinely absent is the
> dependency edge — and both of its halves are already built and merely unjoined.
