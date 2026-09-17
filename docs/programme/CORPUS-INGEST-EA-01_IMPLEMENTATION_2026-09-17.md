# CORPUS-INGEST-EA-01 · governed ingestion implementation

**Date:** 2026-09-17
**Class:** A — corpus sovereignty / production knowledge boundary
**Predecessor:** `CORPUS-BUILD-EA-01`
**Execution standing:** CLOSED — this record governs implementation/review only. It does not authorize a production ingest.

## 1. Purpose

Implement a one-shot ingestion path for the sole currently governed AIN corpus item, Elemental Alchemy, without weakening the authority law established by `CORPUS-CLASSIFICATION-EA-01` or the frozen output witnessed by `CORPUS-BUILD-EA-01`.

The implementation must make partial production ingestion mechanically impossible under its own write path: the full expected corpus either commits after exact verification, or the database returns to its pre-state.

## 2. Frozen subject

The implementation is deliberately specific rather than generic.

- source: `data/ain/source/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md`
- authorized source SHA-256: `f57f17e6ab82f911a4932c1f2d5fa0149e8fe499c7461f60bd87f86d0f657af0`
- candidate files: 736
- admission verdict: 1 admitted / 735 excluded / 0 refused
- expected chunks: 1,238
- expected chunk indices: 0 through 1,237
- deterministic chunk-set SHA-256: `87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852`
- embedding model: `nomic-embed-text`
- embedding dimensions: 768

Any drift in these facts is a refusal, not an invitation to update a constant during an ingest run. A changed source or corpus shape requires a new governed reconciliation.

## 3. New implementation seam

### `lib/corpus/eaIngestContract.ts`

Owns the frozen subject and the reusable mechanical checks:

1. recompute exact source SHA-256;
2. enumerate the current candidate corpus;
3. run the existing `decideAdmission` authority boundary;
4. require exactly the frozen 1 / 735 / 0 verdict and exact admitted path;
5. call the existing `processAllSources` chunking path, which independently crosses corpus admission again;
6. require 1,238 chunks, one source only, contiguous indices, and the frozen chunk-set digest;
7. verify database rows against the expected chunk text and metadata exactly.

This does not create a second corpus authority model. It composes the existing admission and chunking authorities and freezes the already-witnessed EA result.

### `lib/corpus/eaIngestTransaction.ts`

Owns the database mutation itself on one caller-supplied PostgreSQL client. It begins the transaction, takes the write-excluding lock, proves pre-state, inserts the complete prepared corpus, verifies the staged rows and frozen digest, and owns both `COMMIT` and `ROLLBACK`. This seam is dependency-injected specifically so rollback behavior can be falsified without touching a real database.

### `scripts/ingest-elemental-alchemy-governed.ts`

A one-shot executable surface. Its default invocation is a non-writing witness. It prepares and validates embeddings, reacquires the governed build witness, acquires one database client, and delegates the complete mutation to `commitPreparedEaChunks`.

Default:

```text
npx tsx scripts/ingest-elemental-alchemy-governed.ts
```

performs source/admission/chunk verification only. It does not contact Ollama and does not open PostgreSQL.

Write mode requires both independent acts:

```text
--execute=CORPUS-INGEST-EA-01
CORPUS_INGEST_EA_01_AUTHORIZED=YES
```

and a database connection. Absence of either explicit authorization refuses before embedding or database mutation.

The existence of write mode in the reviewed script is not production execution authority. Execution remains a separate post-merge, post-deploy act with a fresh production pre-state witness.

## 4. Embedding preparation boundary

All 1,238 embeddings are generated before a database transaction is opened.

For every embedding, the runner requires:

- the explicitly selected `nomic-embed-text` model path;
- exactly 768 dimensions;
- every vector value finite;
- the vector not be the all-zero vector.

Any embedding failure stops before a database write exists to roll back.

After the potentially long embedding phase, the runner recomputes the entire governed build witness again. A source SHA, admission, count, or chunk-set change refuses before PostgreSQL is opened.

## 5. Atomic production write boundary

The production mutation uses one acquired PostgreSQL client for the complete act. `commitPreparedEaChunks` owns the transaction from `BEGIN` through `COMMIT`/`ROLLBACK`; the runner never opens a second connection inside that mutation.

Within that one client:

```text
BEGIN
  ↓
LOCK TABLE ain_knowledge_chunks IN EXCLUSIVE MODE
  ↓
re-read production pre-state
  require 0 rows / 0 sources
  ↓
insert exactly 1,238 prepared rows
  ↓
read all staged rows inside the same transaction
  ↓
exactly compare source_file, source_title, chunk_index,
chunk_text, chunk_tokens, categories, domain
  ↓
recompute staged chunk-set digest
  require 87b0cbaa…
  ↓
require 1,238 rows / 1 source / 1,238 non-null embeddings
  ↓
COMMIT
```

Normal read-only retrieval may continue to see the previously committed state while this transaction is open. Competing writes cannot cross the table lock before the pre-state and staged verification complete.

The pre-state check occurs after the write-excluding lock. Therefore a concurrent writer that completed before the lock is visible to the pre-state query and causes refusal; a writer arriving after the lock waits until this act resolves.

## 6. Rollback law

Any exception after `BEGIN` and before successful `COMMIT` executes `ROLLBACK` on the same acquired client.

The script contains no `TRUNCATE` path and no force mode.

Because the required production pre-state is empty, successful rollback restores:

- `ain_knowledge_chunks`: 0 rows
- distinct source files: 0

The implementation does not rely on a sequence of individually committed inserts and does not describe cleanup of a partial corpus as rollback. Partial visibility is prevented by the transaction boundary itself.

## 7. Persistent provenance without a schema migration

`ain_knowledge_chunks` has no source-digest column. This act does not introduce a new schema solely to duplicate corpus identity.

Instead, the governed chain is mechanically reproducible from repository authority plus row content:

```text
exact authorized source SHA-256
        ↓
existing corpus admission decision
        ↓
frozen deterministic 1,238-chunk set
        ↓
frozen chunk-set SHA-256
        ↓
exact staged DB row-text/metadata comparison
        ↓
commit only on exact match
```

After commit, the same database rows can be re-read and recomputed against the governed contract. A filename alone is not used as provenance evidence.

## 8. Tests and falsification

Targeted tests cover both the subject contract and the executable shape.

Current local result:

- `lib/corpus/__tests__/admission.test.ts`
- `lib/corpus/__tests__/eaIngestContract.test.ts`
- `lib/corpus/__tests__/eaIngestTransaction.test.ts`
- 3 suites PASS
- 40 / 40 tests PASS

The tests establish, among other things:

- the canonical tree still reproduces the frozen source/admission/chunk witness;
- changing chunk text changes the chunk-set digest;
- staged database text/metadata drift is refused;
- the new bulk path crosses existing corpus admission;
- write mode carries two independent explicit gates;
- embeddings precede database opening;
- one client owns `BEGIN`, lock, pre-state, insert, verification, `COMMIT`;
- a changed non-empty pre-state triggers `ROLLBACK` before any insert;
- a synthetic insert failure triggers `ROLLBACK` and never `COMMIT`;
- staged row tampering after all 1,238 inserts triggers `ROLLBACK` and never `COMMIT`;
- a prepared-set mismatch refuses before `BEGIN`;
- the successful behavioral path issues exactly 1,238 inserts and commits only after exact staged verification;
- the one-shot runner contains no `TRUNCATE ain_knowledge_chunks`.

Manual refusal witnesses also passed:

- execute flag without `CORPUS_INGEST_EA_01_AUTHORIZED=YES` → exit 1 before Ollama/DB;
- authorization env without `DATABASE_URL` → exit 1 before embeddings/DB write;
- default invocation → witness only, no embeddings, no DB connection.

## 9. TypeScript standing

Repository typehealth at this implementation tree:

- ship TypeScript: 229 diagnostics vs baseline 239 — 0 regressions;
- scripts TypeScript: 40 diagnostic lines;
- diagnostics attributable to `eaIngestContract` / `ingest-elemental-alchemy-governed`: 0.

The scripts set remains repository-red at its existing baseline; this lane adds no script diagnostics.

## 10. Explicit non-authorizations

This implementation act does not authorize:

- executing the production write mode;
- `--force` or `TRUNCATE`;
- admitting any of the 735 excluded files;
- Living Library ingestion;
- retrieval claims merely because rows exist;
- changing the frozen source or chunk constants to accommodate drift during execution.

## 11. Next gate

After this implementation is reviewed, merged, and deployed, `CORPUS-INGEST-EA-01` execution may be considered only after a fresh read-only production witness proves the required pre-state and the deployed code is pinned to the reviewed implementation.

If execution is authorized and succeeds, the next separate act is a retrieval/provenance witness:

```text
INGESTED
  ↓
RETRIEVABLE
  ↓
RETRIEVED
  ↓
SURFACED WITH PROVENANCE
```

No later stage is inferred from an earlier one.
