# Bounded Cognition Substrate — Read-Only Census

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu` · **Base:** `e1c6f527`
**Ordered by:** founder, 2026-09-13, as the gate on FR-J-SEQ step 8.
**Standing:** ⛔ **READ-ONLY. BUILD NOT AUTHORIZED.** No code · no schema · no lane opened.
⭐ **AMENDED IN PLACE 2026-09-13 by founder act BCS-C2** — a second responsibility-level
inspection falsified three parts of the first pass. Amendments are marked **C2.x** and the
falsified statements are kept, struck, never deleted. ⛔ **D-J9 NOT OPENED.**
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

## 0b · BCS-C2 — Census Repair (founder act, 2026-09-13)

⭐⭐ **The methodological lesson, now stronger than the first correction:**

> **Do not generalize from the first substrate found. Generalize from the strongest
> responsibility already proved.**

⭐ **The defect underneath all five corrections is now recorded as a programme-method binding:**
`BCS-M1_IDENTIFIER_CLAIM_DISCIPLINE_2026-09-13.md` — *a name is a claim; its semantic strength
may not exceed what the evidence establishes.* Its preflight rule governs D-J9: **every proposed
field, type, status, table or API verb must state the predicate its name claims before the
design is accepted** — `finding · checkpoint · result · stale · cancelled · depends_on ·
authorization_basis` first among them.

The first pass found *a* queue and stopped. A responsibility-level sweep finds **four workers,
three independent stale-job reapers, and one substrate materially stronger than the one this
census nominated.**

### ⛔ C2.1 · The queue precedent was wrong — two corrections

~~*"QUEUE / WORKER — ⭐ STRONG PRECEDENT… `EmbeddingQueueService`"*~~ — **overstated.**
Confirmed at `e1c6f527`, `claimNext()` selects `WHERE status = 'pending' AND attempts < $1`.
⭐ It uses `FOR UPDATE SKIP LOCKED` and stamps `locked_at`, but **nothing in that service ever
reclaims an abandoned `processing` row.** A lock timestamp plus an attempt counter does **not**
establish abandoned-job reclamation.

~~*"Consumers include `scripts/run-media-worker.ts`, `scripts/run-session-summary-worker.ts`"*~~
— **false, and the error is instructive.** It came from grepping `claimNext|EmbeddingQueueService`
and reading a **shared method name as a consumer relationship**. Those workers implement their
own claim against their own tables. ⛔ Only `scripts/embedding_worker.ts` and
`app/api/embeddings/backlog/route.ts` relate to that service.

### ⭐⭐ The actual strongest precedent: `media_jobs` / `run-media-worker.ts`

Migration `20260407100001_media_studio_build_a.sql`:

```text
status        queued | processing | done | failed | skipped   (CHECK)
attempts · max_attempts        bounded retry
claimed_by · claimed_at        worker identity + claim time
heartbeat_at                   liveness
depends_on  UUID → media_jobs  EXECUTION dependency (self-FK)
is_critical · priority         scheduling + failure severity
input_data · output_data JSONB records of what went in and came out
queued_at · started_at · finished_at
```

Worker behaviour confirmed in `scripts/run-media-worker.ts`: **claim is dependency-aware**
(*"claimable only if it has no `depends_on`, or its dependency is done"*), **recursive
downstream failure propagation** (a recursive CTE marks dependents `skipped` with
`last_error = 'upstream_critical_failure'`), a **heartbeat interval**, and a **stale-job reaper**
calling the DB function `fn_requeue_stale_media_jobs($1::interval)`.

### ⭐ Crash recovery is proved three times independently, in SQL

```text
fn_requeue_stale_media_jobs · fn_requeue_stale_comms_jobs · fn_requeue_stale_summary_jobs
```

Four workers exist: `run-media-worker.ts` · `run-session-summary-worker.ts` ·
`run-comms-analysis-worker.ts` · `embedding_worker.ts`. `FOR UPDATE SKIP LOCKED` also appears in
`lib/supervision/SupervisionStore.ts` and `lib/comms/DeliveryService.ts`.

⭐ **Reaping lives in the database, not the worker** — a design choice worth carrying, since it
survives any particular worker process dying.

### ⛔ C2.2 · "Resumability" was two responsibilities under one word

```text
CRASH RECOVERY / RETRY      worker dies → stale claim returns to executable state   ⭐ PRESENT
PARTIAL COMPUTATION RESUME  job did N of M units → restart continues at N+1         🔴 NOT ESTABLISHED
```

⛔ **Neither may be called "resumability" without the qualifier.** Crash recovery is **not**
absent and is **not** merely implied by `EmbeddingQueueService` — it is proved three times, in
three reaper functions, with heartbeats. Partial-computation resume is genuinely unestablished:
no job substrate carries a checkpoint or progress column, and the `checkpoint|progress_` sweep
returns only unrelated consciousness/scheduling modules.

⭐ Also absent across every job substrate: **cancellation.** No `cancelled` status, no
cancel-request column. The `cancel` sweep hits only scheduling, focus and membership domains.

### ⛔ C2.3 · "Dependency is absent" was too broad

```text
EXECUTION DEPENDENCY   job B cannot execute until job A succeeds        ⭐ PRESENT
                       media_jobs.depends_on + recursive downstream propagation
EPISTEMIC DEPENDENCY   finding F depended on evidence E as read at       🔴 ABSENT
                       frozen Work state R                               ← the real Step-8 gap
⛔⛔ THE NAME "EPISTEMIC DEPENDENCY" IS SUPERSEDED — see §5 below. It promotes contribution
   into causal effect, which FR-J3 forbids. The relation is FROZEN INPUT LINEAGE.
```

⛔ **`media_jobs.depends_on` must never be generalized into epistemic provenance.** It is
precedent for **dependency mechanics** — self-FK, dependency-aware claim, recursive failure
propagation — and is a different relation entirely. Sharing the word would be the same class of
error as `conversation_memory_uses` (FR-J3) and as actor/material collapse (F-J2.3): *a name
asserting a stronger relation than the thing establishes.*

⭐ The epistemic candidate shape is unchanged, and both halves still exist unjoined:

```text
finding  ──depended upon──►  EvidenceRef  +  frozen revision / range / digest
```

---

## 1 · Findings by primitive family

### 1.1 · QUEUE / WORKER — ⚠️ **SUPERSEDED BY C2.1. Read §0b first.**

*Kept as written. `EmbeddingQueueService` is a real durable queue and a valid precedent for
claim-and-terminal-state; it is **not** the strongest one, and the consumer list below is wrong.*

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

### 1.5 · RESUMABILITY — ⚠️ **SUPERSEDED BY C2.2** — the word covered two responsibilities

`claimNext()` + `attempts` + `locked_at` + `EMBEDDING_MAX_ATTEMPTS` give **crash-tolerant
retry**: an abandoned claim is re-claimable and bounded. 🔴 **Not present:** resumption of a
*partially completed* job (no partial-findings representation, so a job restarts rather than
continues), and no cancellation path — `status` admits no `cancelled`.

⚠️ For a Whole-Work sweep the difference is material: re-running a 300k-word analysis from zero
after a failure is the cost profile step 8 exists to avoid.

### 1.6 · DEPENDENCY — ⚠️ **SUPERSEDED BY C2.3** — execution dependency exists; epistemic does not

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

⭐ **Revised by BCS-C2. Nine responsibilities, not six families.**

| Responsibility | State | Strongest precedent | Verdict |
|---|---|---|---|
| Queue / worker | ⭐ **PRESENT in several forms** | `media_jobs` / `run-media-worker.ts` | ⛔ strongest precedent **not finally selected** |
| Crash recovery / retry | ⭐ **PRESENT** | three `fn_requeue_stale_*` fns + heartbeats | **Reuse** — reaping in SQL, not the worker |
| Partial-computation resume | 🔴 **ABSENT / NOT ESTABLISHED** | — | **Build** |
| Cancellation | 🔴 **ABSENT** | — | **Build** (act + terminal state) |
| Execution dependency | ⭐ **PRESENT** | `media_jobs.depends_on` + recursive propagation | **Reuse mechanics only** |
| Frozen input lineage *(was "epistemic dependency" — superseded §3b)* | 🔴 **ABSENT** | — | ⭐ **the real Step-8 gap**; halves exist unjoined |
| Freeze | ⭐⭐ **PRESENT** | `commission · freeze · scope` | **Reuse wholesale** |
| Digest / fingerprint | ⭐ **PRESENT** | three instruments | **Reuse** |
| Three-state staleness | ⭐⭐ **PRESENT** | `ask/staleness.ts` | **Adopt the model** |

⭐⭐ **Six of nine responsibilities are already proved in production code.** Step 8 remains an
**assembly and generalization problem** — but generalized from *several* proven implementations,
⛔ never by mutating one embedding-specific table.

---

## 3 · Questions the census leaves for design (⛔ none answered here)

1. ⭐ **Revised by C2.1:** not *"generalize `embedding_jobs`"* — which substrate's proven
   responsibilities does a **sibling** bounded-cognition substrate inherit, and from which of
   the four workers does each one come?
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

## 3b · ⭐⭐ Supersession by FR-J9 — "epistemic dependency" → **frozen input lineage**

⛔ **This census's own provisional name for the missing relation is refused**, by founder act
opening D-J9 on 2026-09-13. Kept above, superseded here, never deleted.

`EvidenceRef + frozen revision` proves that material was **supplied to / read by** an execution
that produced an output. ⛔ It does **not** prove the output **causally depended** on it — and
FR-J3 already rules `CONTRIBUTED ≠ EFFECT ESTABLISHED`.

```text
FROZEN INPUT LINEAGE   E@R contributed to the execution that produced F   ← what Step 8 needs
EFFECT DEPENDENCY      a causal witness establishes F depended on E@R     ← only where establishable
```

⭐⭐ **BCS-M1 was recorded hours before this and caught it immediately** — the discipline's first
application was to this lane's own vocabulary, which is the strongest available evidence that it
is a working instrument rather than a slogan.

⭐ Invalidation therefore runs on **conservative lineage**: a changed input may require
re-evaluation even where no causal effect can be established.

### The six design questions — ⭐ all answered by FR-J9, none by inventing a runtime object

| # | Question | Answer (FR-J9 §) |
|---|---|---|
| 1 | Generalize `embedding_jobs`, or a sibling? | **Sibling; generalize responsibilities, not tables** (§5). ⛔ No table name chosen |
| 2 | Where does authorization basis live? | **The frozen commission/scope reference** (§4). IDs on the execution record are indexing only — *index identity may duplicate the scope; authority may not* |
| 3 | What is a partial finding? | ⛔ **The phrase is refused.** It is a **checkpoint** — execution progress, never epistemic standing (§6) |
| 4 | Is cancellation a status or an act? | **Both, kept separate**: `CANCELLATION REQUESTED` (act) vs `CANCELLED` (actual early terminus) (§7) |
| 5 | Member + Work identity direct, or by scope reference? | **Scope is authoritative**; duplicated ids operational only (§4) |
| 6 | Do findings cross CMT-01, and as what producer class? | **Only when later offered** (§12); ⛔ **the job confers no producer class** — material is classified by what it is (§11) |

⭐ Two protections carry the most weight: **lineage is not causality** (§1) and **invalidation is
not authorization** (§10) — the second prevents the incremental architecture from becoming a
standing permission to reprocess a writer's Work indefinitely.

---

## 4 · Standing (revised, BCS-C2)

```text
QUEUE / WORKER               PRESENT in several forms; strongest precedent NOT FINALLY SELECTED
CRASH RECOVERY               PRESENT  (3 reaper fns · heartbeats · 4 workers)
PARTIAL-COMPUTATION RESUME   ABSENT / NOT ESTABLISHED
CANCELLATION                 ABSENT
EXECUTION DEPENDENCY         PRESENT  (media_jobs.depends_on)
FROZEN INPUT LINEAGE         ABSENT   ← the Step-8 gap (renamed from "epistemic
                             dependency" by FR-J9 §1 — lineage is not causality)
FREEZE                       PRESENT · reuse
DIGEST                       PRESENT · reuse
THREE-STATE STALENESS        PRESENT · reuse

CENSUS        AMENDED IN PLACE, READ-ONLY, at e1c6f527
CORRECTIONS   (1) intake §6.2 "no job substrate" — WRONG (§0)
              (2) EmbeddingQueueService as strongest precedent — WRONG (C2.1)
              (3) media/summary workers as its consumers — FALSE (C2.1)
              (4) "resumability" as one property — WRONG (C2.2)
              (5) "dependency absent" — TOO BROAD (C2.3)
D-J9          ⭐ OPENED AND RULED (FR-J9) — all six design questions answered (§3b)
              ⛔ implementation lane NOT opened · no schema · no worker · no lineage store
```

### ⛔ Still not authorized

```text
⛔ no generic jobs table      ⛔ no bounded-cognition schema   ⛔ no producer registration
⛔ no CMT-01 M3               ⛔ no dependency graph           ⛔ no worker
⛔ no migration               ⛔ no implementation lane
```

### Founder directions carried forward as PROVISIONAL (⛔ not rulings — D-J9 is not open)

- Generalize **behavior**, not `embedding_jobs`; inherit proven responsibilities from several
  implementations.
- Authorization and Work/member identity should converge on **one frozen commission/scope
  reference**; IDs on the job are for indexing, authority comes from the frozen scope.
- ⭐ A **partial finding is a checkpoint, not yet an epistemic result** — persistence for
  resumption must not make it conversationally eligible.
- **Cancellation is both an act and a terminal state**: the act preserves who/when/why,
  `cancelled` is the lifecycle projection.
- **Result freshness and job status stay orthogonal** — a job stays `completed` while its
  results become `changed` / `unchanged` / `unmeasured` (§1.4's contract).
- ⭐⭐ **The producer class belongs to the material, not the job.** FR-J2 already says this.
  Completion confers no producer identity; `computed.writer_structure` exists for genuinely
  computed structure, but forcing every bounded-job finding through one class would recreate
  **actor/material collapse (F-J2.3) through the back door.** ⛔ **Step 8 should never have
  "the bounded-job producer."** The job is machinery; each finding is classified by what it
  actually is.

> **Do not generalize from the first substrate found. Generalize from the strongest
> responsibility already proved.**

⭐ **The defect underneath all five corrections is now recorded as a programme-method binding:**
`BCS-M1_IDENTIFIER_CLAIM_DISCIPLINE_2026-09-13.md` — *a name is a claim; its semantic strength
may not exceed what the evidence establishes.* Its preflight rule governs D-J9: **every proposed
field, type, status, table or API verb must state the predicate its name claims before the
design is accepted** — `finding · checkpoint · result · stale · cancelled · depends_on ·
authorization_basis` first among them.
