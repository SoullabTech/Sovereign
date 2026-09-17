# CORPUS-BUILD-EA-01 · Elemental Alchemy Controlled Build

**Date:** 2026-09-17
**Classification authority:** merge `7ee173db0d54f7340353316d11729b88480434a5`
**State:** IMPLEMENTATION CANDIDATE · EXECUTION HELD

## Purpose

CORPUS-CLASSIFICATION-EA-01 established that exactly one historical source is presently admissible:

`data/ain/source/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md`

This act does not widen that authority. It creates the smallest execution path capable of turning that one authorized revision into retrievable knowledge while preserving exact provenance, atomic visibility, pre/post witnesses, and exact rollback.

No command in this implementation record authorizes the production write itself.

## Authorized raw subject

- rights holder: **Kelly Nezat**
- authority: `rights_holder_authorized`
- governed record: `docs/corpus-authority/elemental-alchemy.md`
- raw source SHA-256: `f57f17e6ab82f911a4932c1f2d5fa0149e8fe499c7461f60bd87f86d0f657af0`
## Preflight finding: image transport is not knowledge text

The authorized Markdown file is **3,324,566 characters**. Census found:

- 82 embedded `data:image/...;base64,...` definition lines;
- those lines carry about 2.77 million characters;
- 86 reference-style image markers, all with empty alt text;
- zero semantic image captions/alt strings.

A raw chunk plan produced **1,238 AIN chunks / 1,391 Library chunks**, demonstrating that embedded image transport was being treated as text.

The build therefore defines a deterministic derivative, `ea01-text-v1`:

1. normalize line endings to LF;
2. remove only embedded `data:image/...;base64,...` definition lines;
3. remove every empty-alt `![][imageN]` marker token;
4. remove a line only when marker removal leaves Markdown-formatting characters and whitespace only;
5. preserve all other authored characters.

The prose-bearing case `moments of ![][image4]synchronicity` becomes `moments of synchronicity` rather than losing the sentence.
## Frozen derivative and plan

`ea01-text-v1` produces:

- normalized text SHA-256: `0b34063412c8d3594ee7cc0694c30c95c4d74e4851ffb895a750444ccdd1ae8d`
- normalized characters: **549,387**
- embedded data-image payloads remaining: **0**
- empty image-reference markers remaining: **0**
- AIN chunks: **215**
- AIN estimated tokens: **158,508**
- Living Library chunks: **244**
- Living Library estimated tokens: **156,555**

The build law freezes the normalization id, normalized digest, and both chunk counts. A change to the raw work, normalization output, or chunk count is a refusal requiring a new governed build decision.

The default executor mode is plan-only. Its witnessed plan exits `0` without an Ollama call and without a database connection.

## Persistent provenance

New AIN rows gain mandatory-for-new-write provenance:

- `source_checksum` — authorized raw source SHA-256;
- `content_checksum` — normalized derivative SHA-256;
- `normalization_id` — `ea01-text-v1`;
- `authority_ref` — governed authorization record;
- `corpus_build_id` — `CORPUS-BUILD-EA-01`.
The migration uses `NOT VALID` constraints deliberately: it does not manufacture provenance for historical rows, while PostgreSQL still enforces the provenance requirement on every new or updated row.

Living Library source/chunk metadata carries the same raw checksum, normalized checksum, normalization id, authority ref, rights holder, and build id. `library_sources.checksum` remains the raw-source digest.

## Execution law

`--execute` is unavailable by accident: it requires both `DATABASE_URL` and an explicit confirmation token bound to **both** raw and normalized digests.

Execution order is fixed:

1. rebuild the exact one-subject plan from the current manifest;
2. verify governed authorization and raw digest;
3. verify `ea01-text-v1`, normalized digest, and frozen chunk counts;
4. witness the production pre-state;
5. precompute **all 215 + 244 embeddings in memory** before opening a transaction;
6. begin a DB transaction and lock the three target tables;
7. re-witness the pre-state under lock;
8. insert only provenance-bound Elemental Alchemy AIN + Library rows;
9. verify exact post-state inside the transaction;
10. commit;
11. verify exact post-state again after commit.

AIN has no source-status retrieval membrane, so it is especially important that no AIN row exists until every embedding is already available and the whole document can be committed atomically.
## First-build production gate

This act is deliberately not an incremental general corpus writer. Immediately before production execution it must newly witness:

- `ain_knowledge_chunks = 0` total rows;
- zero `library_sources` whose `file_path` is under `data/ain/source/`;
- zero existing Elemental Alchemy rows/chunks;
- the provenance migration is applied;
- the admitted set is still exactly one path: Elemental Alchemy;
- the current source raw digest and normalized digest still match the frozen values;
- local Ollama `nomic-embed-text` returns 768-dimensional embeddings.

Any non-empty corpus state means **STOP** and a successor act; the executor will not merge into an unknown existing corpus.

## Exact rollback

Rollback is never table-wide. It deletes only AIN rows matching:

`source_file + raw source checksum + normalized checksum + normalization id + CORPUS-BUILD-EA-01`

and only the Living Library source matching:

`exact file path + raw checksum + normalized checksum + normalization id + CORPUS-BUILD-EA-01`

Library chunks disappear only through that source row's `ON DELETE CASCADE` relation. After rollback, the first-build empty-state assertion must hold again.
## Legacy side-door closure

Classification made three generic corpus paths dangerous because they could now see one admitted work without carrying EA-01's normalization/provenance law.

This act therefore retires generic **writes** for governed source content:

- `scripts/embed-ain-knowledge.ts` may still dry-run, but refuses a non-dry source write when admitted chunks exist;
- `scripts/ingest-library.ts` refuses non-dry Phase A source writes when admitted sources exist; intentionally separate Phase B remains available through `--skip-sources`;
- `scripts/build-ain-corpus.ts` refuses runtime-facing compiled-corpus output when admitted governed files exist.

Direct witness: with the current one-item manifest, the generic compiled builder exits `1` at the governed-content refusal and leaves `data/ain/build` **absent**.

Book Companion currently fails gracefully when that build directory is absent. Compiling a normalized Book Companion artifact is outside this first DB-ingest act and requires its own governed execution path.

## Local evidence

- admission + EA-01 build suites: **37/37 PASS**;
- root TypeScript: **229 vs baseline 239 · 0 regressions**;
- `typecheck:scripts`: **40 base / 40 head**, head-only **0**, base-only **0**, identity sets identical;
- plan-only executor: PASS, no Ollama/DB access;
- generic compiled-corpus refusal: PASS, exit `1`, no output directory created;
- `git diff --check`: PASS at the pre-charter checkpoint.

## Explicit hold

Merging or deploying this implementation does **not** authorize `--execute`. Production corpus writes remain held until this implementation passes Class A review/CI, its migration is live, and the production pre-state is freshly re-witnessed under the first-build gate.

## Final implementation-candidate gates

On the exact implementation tree before commit:

- admission + EA-01 build suites: **37/37 PASS**;
- plan-only build witness: **215 AIN / 244 Library**, exact raw + normalized digests;
- root TypeScript: **229 vs baseline 239 · 0 regressions**;
- `typecheck:scripts`: **40 base / 40 head**, head-only **0**, base-only **0**, identity sets identical;
- provider governance: PASS;
- no-Supabase: PASS;
- design canon: PASS;
- `git diff --check`: PASS;
- `npm run db:verify-bootstrap`: **PASS** — blank PostgreSQL reconstructed and all migrations applied cleanly.

The scripts compiler remains repository-red on the same 40 pre-existing diagnostic identities; this act introduced zero script diagnostics.

## Independent review amendment

Review found that the first executor version set `library_sources.identity_valid = true` from governed knowledge without actually invoking the repository's existing identity validators.

That shortcut is removed. `buildEa01Plan` now requires both:

- `validateTitle('Elemental Alchemy The Ancient Art of Living a Phenomenal Life')` to pass; and
- `validateAuthor('Kelly Nezat')` to pass.

Only after those established integrity checks succeed may the controlled Library row be marked identity-valid. The build-law suite witnesses the exact governed title and Kelly attribution.

## Schema rollback boundary

Migration rollback is separate from corpus-row rollback. Companion file:

`database/rollbacks/20260917160000_ain_knowledge_provenance_ROLLBACK.sql`

removes only the `ain_knowledge_new_rows_require_provenance` enforcement gate so legacy code can write again after a code rollback. It deliberately retains the additive provenance columns, checksum-shape constraint, and indexes.

This follows the repository's evidence-preserving rollback rule: a rollback may relax a new writer gate, but it must not erase custody evidence already recorded in the database. B9 binds that the rollback contains no `DROP COLUMN`, `DROP TABLE`, or `DROP INDEX` operation.
