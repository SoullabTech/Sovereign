# CORPUS-BUILD-EA-01 · Elemental Alchemy dry-build witness

**Date:** 2026-09-17
**Canonical predecessor:** `clean-main-no-secrets` @ `7ee173db0d54f7340353316d11729b88480434a5`
**Predecessor act:** PR #1325 / `CORPUS-CLASSIFICATION-EA-01`
**Authority state:** classification/authority only; no production corpus ingestion was authorized by #1325.

## 1. Act boundary

This act answers one question only:

> Can the governed corpus machinery build and chunk exactly the one authorized Elemental Alchemy source, while excluding all other historical source files, before any production write is authorized?

This act does **not** authorize production embedding or ingestion, does not use `--force`, and does not classify any neighboring source.

## 2. Pinned source and authority

Authorized source:

`data/ain/source/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md`

Source SHA-256:

`f57f17e6ab82f911a4932c1f2d5fa0149e8fe499c7461f60bd87f86d0f657af0`

The digest independently recomputed from the pinned canonical worktree and matched the digest governed by `data/ain/corpus-admission.json` and `docs/corpus-authority/elemental-alchemy.md`.

Candidate corpus population at the pinned tree:

- 736 `.md` / `.txt` files under `data/ain/source`
- 1 admitted
- 735 excluded as `unclassified_legacy`
- 0 refused

## 3. Admission suite

Targeted suite:

`lib/corpus/__tests__/admission.test.ts`

Result:

- 29 / 29 PASS
- 1 / 1 suite PASS
- no corpus code changed for this witness

## 4. Local compiled-corpus dry build

Executed in an isolated detached worktree pinned to the canonical predecessor, reusing the already-installed local toolchain without installing or changing dependencies.

Result:

- `corpus admission: 1 admitted · 735 excluded · 0 REFUSED`
- compiled items: 1
- sole item: Elemental Alchemy
- source bytes: 3,326,452
- zero foreign source items

The generated `data/ain/build/` directory was local evidence only and was removed after witness. It is not part of this tranche.

The compiled markdown artifact contains a build timestamp, so its whole-file digest is intentionally **not** used as the stable corpus identity.

## 5. Deterministic chunk-set witness

`lib/ain/knowledge/ChunkingService.ts` was invoked directly, with no Ollama call, no embedding generation, and no database connection.

Result:

- source files: 1
- chunks: 1,238
- chunk indices: 0 through 1,237
- estimated token sum: 946,509
- foreign sources: 0

A stable chunk-set witness was derived as follows:

1. For each chunk in order, record `sourceFile`, `chunkIndex`, and `SHA-256(chunkText)`.
2. JSON-serialize that ordered array.
3. SHA-256 the serialized array.

Expected deterministic chunk-set SHA-256:

`87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852`

Boundary checks:

- first chunk SHA-256: `5b097f5fe4abd940f9aa9170bb4174ccf829b52b18642fa0fc172c31ba46c2b6`
- last chunk SHA-256: `7f9e097ce5f2954a63539f8641193e5b654268186c128f3bfb816def3eba75af`

The full chunk-set witness was recomputed twice from source in the same pinned tree. Both runs produced 1,238 chunks and the identical chunk-set digest.

## 6. Production pre-state, re-witnessed after #1325 merge

Using the existing founder-side counts-only production path on the Minisforum, with no selected chunk text or personal values:

- `ain_knowledge_chunks`: **0 rows / 0 distinct sources**
- `library_sources WHERE file_path LIKE 'data/ain/source/%'`: **0 rows / 0 completed**

No production write was made.

## 7. Pre-ingest finding: current embedder is not yet sufficient for the governed write gate

Two facts prevent this act from authorizing production ingestion as-is:

1. `ain_knowledge_chunks` records `source_file` but has no source-digest field. Filename alone cannot prove which exact revision produced a row.
2. `scripts/embed-ain-knowledge.ts` inserts rows individually without an enclosing transaction and catches per-chunk failures. A failed run can therefore leave a partial corpus. That does not satisfy the required rollback/atomicity boundary.

`--dry-run` is non-writing, but it contacts Ollama before returning its chunk summary. This is not a production-safety defect, but it is why the chunk witness above used `ChunkingService` directly.

## 8. Frozen production-ingest contract

A later, separate `CORPUS-INGEST-EA-01` act may proceed only if all of the following are true immediately before commit:

- canonical source SHA-256 = `f57f17e6ab82f911a4932c1f2d5fa0149e8fe499c7461f60bd87f86d0f657af0`
- corpus verdict = `1 admitted / 735 excluded / 0 refused`
- generated chunk count = `1,238`
- deterministic chunk-set SHA-256 = `87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852`
- generated sources = exactly the Elemental Alchemy source, with zero foreign sources
- production `ain_knowledge_chunks` pre-state = 0 rows unless a later governed act explicitly reconciles a changed pre-state
- no `--force`
- all database inserts are atomic: any embedding, insert, count, source, or chunk-set verification failure must leave the production pre-state unchanged
- before commit, the rows staged for insertion must mechanically match the frozen chunk count, source identity, and chunk-set digest

A filename-only post-hoc assertion is insufficient provenance.

## 9. Rollback law

The preferred rollback is **transactional non-commit**: production must remain unchanged unless the entire expected EA row-set passes verification.

An emergency post-commit rollback, if ever needed, must be a separately witnessed targeted act against the exact Elemental Alchemy source rows; it must not use `TRUNCATE`, must preserve unrelated corpus rows, and must verify the pre-state is restored afterward.

## 10. Verdict

**CORPUS-BUILD-EA-01: PASS for dry build and expected-output freeze.**

**Production ingestion: HELD CLOSED.**

Next act:

`CORPUS-INGEST-EA-01` — implement and review an atomic, preconditioned ingestion path that proves the exact authorized source revision and the frozen chunk set before commit; only after that act passes may production ingestion itself be authorized.
