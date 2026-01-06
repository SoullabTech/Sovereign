# Async Embeddings Whitepaper

*(Design Rationale + Architecture + Guarantees)*

## Abstract

MAIA's caseload memory layer needs to support:

* fast practitioner workflows (no lag on save)
* sovereign/local intelligence (no cloud dependence)
* semantic retrieval (vector search) and pattern detection

Synchronous embedding generation can bottleneck UX, introduce timeouts, and couple reliability to model latency. This paper proposes an **asynchronous embedding pipeline** using a **Postgres-backed job queue**, a **local embedding worker**, and **observable system health** via a backlog indicator.

---

## Goals

1. **Non-blocking writes**

   * session notes and memory chunks must persist immediately
2. **Sovereignty**

   * embedding generation occurs locally (Ollama), no external providers required
3. **Consistency**

   * every chunk eventually becomes searchable once embedded
4. **Observability**

   * operators can see backlog and failures without deep inspection
5. **Scalability**

   * supports multiple workers safely (no double processing)

---

## System Architecture

### Entities

**`case_memory_chunks`**

* canonical store of chunked case memory
* may exist in a partially-complete state (no embedding yet)

**`embedding_jobs`**

* queue describing embedding work to be done
* minimal fields required for robust processing:

  * status: pending / processing / done / error
  * target_id: chunk id
  * model: nomic-embed-text
  * input: text chunk
  * attempts + last_error + locked_at for reliability

### Control Planes

1. **Write plane (request path)**
   Handles insertion of chunks + enqueue jobs quickly.

2. **Compute plane (worker)**
   Handles embedding compute and vector update.

3. **Read plane (search)**
   Uses only embedded vectors; improves as embeddings complete.

4. **Observability plane (badge + API)**
   Gives the operator feedback about system state.

---

## Concurrency & Correctness

### Claim strategy

The worker uses:

* `FOR UPDATE SKIP LOCKED`

This ensures:

* multiple workers can run concurrently
* only one worker claims a given job
* no thundering herd on the same job

### Idempotency

* Chunk inserts are canonical. Jobs refer to chunk IDs.
* Optional uniqueness constraint prevents duplicate pending/processing jobs for the same target.

### Eventual consistency

* Search quality improves over time as embeddings are generated.
* The system is resilient to temporary failures (Ollama downtime, worker restarts).

---

## Failure Handling

### Retries

* `attempts` increments on claim
* `EMBEDDING_MAX_ATTEMPTS` caps repeated failures
* errors are recorded in `last_error` for inspection

### Stuck jobs

If a worker dies mid-job:

* job can remain in `processing`
* requeue strategy (recommended):

  * move stale `processing` jobs back to `pending` after a timeout window

---

## Observability

### Backlog API

A simple endpoint returns:

* pending jobs count (and optionally processing/error/done counts)

### UI badge

A minimal indicator:

* "Green ⏳ 0" → healthy
* "Amber ⏳ N" → backlog building

This turns invisible system state into operational signal.

---

## Privacy & Sovereignty

* Embeddings are computed via local Ollama.
* Raw text chunks remain within the node's security boundary.
* Supports MAIA's core sovereignty requirement.

---

## Why Postgres as the Queue?

### Pros

* zero extra infrastructure
* transactional integrity
* easy inspection and operational tooling (`psql`)
* concurrency-safe with `SKIP LOCKED`

### Tradeoffs

* not a full-feature message bus
* best for moderate throughput
* extremely appropriate for MVP and early scaling

---

## Performance Characteristics

### Write latency

Queue mode reduces write latency to:

* chunk insert time + enqueue insert time
  No embedding compute in the request path.

### Read latency

Search does not slow down; it simply ignores missing embeddings.

### Throughput scaling

Add more workers:

* safe due to `SKIP LOCKED`
* effective until Ollama CPU/GPU becomes the limiting factor

---

## Security Considerations

* The backlog endpoint should remain inside authenticated/admin contexts if exposed publicly.
* Database access must be scoped to trusted processes.
* If multi-tenant later:

  * ensure RLS or case-level access controls for chunk retrieval
  * keep job queue access internal only

---

## Roadmap Enhancements

1. **Stuck job requeue script/button**
2. **Status breakdown in backlog endpoint**
3. **Case-scoped backlog** (join embedding_jobs → case_memory_chunks.case_id)
4. **Batch processing** (claim N jobs at once for fewer DB round trips)
5. **Metrics export** (Prometheus counters for pending/error rates)
6. **Priority jobs** (e.g., newest notes first)

---

## Conclusion

This design achieves MAIA's required balance:

* **fast practitioner UX**
* **sovereign local intelligence**
* **reliable eventual semantic indexing**
* **simple, visible operational feedback**

It is a strong "Phase 1" architecture that can scale by adding worker capacity and incremental reliability features without rewriting core systems.
