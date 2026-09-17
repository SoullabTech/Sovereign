# JARVIS Governed Knowledge Flow · J6 Production Knowledge Boundary

**Date:** 2026-09-17
**Class:** A — knowledge sovereignty / representation boundary
**J5 deployed predecessor:** `78a85f652d9ecd3b993c183d67423f2215a46730`
**Reconciled canonical base:** `9e11eedb7574714fce60a1e9489cbf80fa032c4c`
**Execution standing:** EA production ingestion remains CLOSED.

## 1. Why J6 exists

J5 proved the governed ingestion mechanism could be deployed. J6 asks the question that must be answered before the first production corpus write:

> Is governed ingestion the only path by which material can become globally retrievable as MAIA knowledge, and can production hold the exact authorized subject without inheriting the historical source directory?

The answer at first witness was **no** on both halves. This tranche repairs those boundaries without ingesting or deleting corpus material.

## 2. J5 deployment witness

The canonical deploy completed on minisforum and the running container reported:

- `GIT_COMMIT=78a85f652`
- `ain_knowledge_chunks`: 0 rows / 0 sources
- `library_sources WHERE file_path LIKE 'data/ain/source/%'`: 0 rows / 0 completed
- governed EA script: present

No corpus write occurred during deployment.

## 3. J6A finding — production subject custody was absent

The first deployed witness-only run refused because the authorized EA manuscript did not exist at:

`/app/data/ain/source/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md`

This was structural, not accidental:

- `.dockerignore` excluded `data/ain/` wholesale;
- markdown/docs were broadly excluded;
- the runtime Docker stage copied scripts and lib but no corpus subject or authority record;
- production compose had no `data/ain/source` mount.

The correct repair is **not** to expose the 736-file historical source directory to production.

## 4. J6A repair — minimal governed runtime bundle

Production image custody is reduced to three governed files:

1. `data/ain/corpus-admission.json`
2. `data/ain/source/Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md`
3. `docs/corpus-authority/elemental-alchemy.md`

`.dockerignore` now keeps the historical AIN tree excluded and explicitly re-includes only those governed artifacts. The runner stage copies only that filtered bundle.

The Docker builder runs the non-writing EA witness in `--runtime-custody` mode before the application build. A missing, changed, unauthorized, or foreign subject therefore fails the image build.

Two custody truths are deliberately distinct:

- canonical repository: `736 candidates → 1 admitted / 735 excluded / 0 refused`
- production runtime bundle: `1 candidate → 1 admitted / 0 excluded / 0 refused`

Both must produce:

- source SHA-256 `f57f17e6ab82f911a4932c1f2d5fa0149e8fe499c7461f60bd87f86d0f657af0`
- 1,238 chunks
- chunk-set SHA-256 `87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852`

A manual three-file runtime-bundle witness reproduced those exact values with no Ollama or database connection.

## 5. J6B writer census

### `ain_knowledge_chunks`

Two live production write implementations exist:

1. `lib/corpus/eaIngestTransaction.ts` — exact EA contract, admission-bound, atomic, rollback/falsification governed.
2. `scripts/embed-ain-knowledge.ts` — reaches `processAllSources → decideAdmission`, so corpus authority is enforced; legacy `--force`/`TRUNCATE` and per-row write behavior remain separate technical debt.

No third tracked writer was found.

### `library_sources` / `library_chunks`

This is a shared registry with several legitimate kinds of writers:

- `scripts/ingest-library.ts` Phase A for `data/ain/source` — admission-gated;
- `scripts/ingest-library.ts` Phase B curated teachings — no corpus authority decision;
- generic TXT/PDF ingestion through `LibraryService` — identity/completeness governed, but no global knowledge-authority decision;
- Practice Field materials — practitioner/field scoped, governed by a different authority stream;
- evaluation/maintenance writers that do not establish global knowledge authority.

Therefore the correct law cannot be "every library_sources row must use the EA manifest." `library_sources` is storage shared by multiple authority domains.

## 6. J6C finding — global Library retrieval inherited authority from state

`LibraryService.search()` was globally eligible on the shape:

`completed + identity-valid + embedded`

It did not require:

- corpus authority;
- provenance/authority stream;
- practitioner/member scope exclusion;
- governed source checksum.

Both live global reader families cross `LibraryService`:

- Oracle conversation retrieval / use-frame activation;
- `LibraryOfAlexandria` adapter and its downstream consumers.

No separate live application query of `library_chunks` was found outside the centralized LibraryService path.

## 7. Production legacy population witness

Counts only; no titles or content were selected.

Production contained:

- 2,228 `library_sources` rows;
- 1,752 `completed` rows;
- 1,751 completed sources with embeddings;
- 0 `data/ain/source` rows;
- 0 Phase-B `wisdom-library.ts` rows;
- 0 practitioner/field-scoped rows.

All 2,228 rows reported:

- `meta.ingested_by = ingestTxtSources.ts`;
- `type = txt`;
- `review_status = uploaded`;
- no separate consent grant.

Their coarse folder topology mixes Books/AIN material with development, roadmap, marketing, agents, tools, video, coaching-platform and other operational collections. They therefore cannot honestly be treated as a pre-adjudicated global wisdom corpus.

**Ruling:** these rows remain stored but become legacy quarantine for global MAIA retrieval. This tranche deletes or rewrites none of them.

## 8. J6C repair — authority at the global read boundary

`lib/library/globalRetrievalAuthority.ts` derives the globally retrievable source set mechanically from the same repository corpus declaration used by AIN admission.

For each admitted source it binds:

`repository-relative source path + SHA-256(source bytes)`

The centralized Library semantic and full-text queries now additionally require:

- `practitioner_member_id IS NULL`;
- `field_slug IS NULL`;
- an exact admitted `file_path`;
- the exact governed source checksum.

If governed custody is missing or admission yields no sources, the SQL boundary is `AND FALSE`.

Consequences:

- `completed + embedded` is no longer global knowledge authority;
- generic TXT/PDF imports remain stored but not globally MAIA-retrievable;
- unadjudicated curated teachings remain stored but not globally MAIA-retrievable;
- practitioner-scoped materials cannot leak into inherited/global wisdom retrieval;
- EA can become globally Library-retrievable only when an exact admitted EA Library row exists with the authorized checksum.

This is a representation boundary, not a deletion or generic storage restriction.

## 9. Evidence

Targeted local result:

- 4 suites PASS
- 47 / 47 tests PASS
- canonical custody reproduces 736 / 1 / 735 / 0 and frozen EA chunk identity
- minimal runtime custody reproduces 1 / 1 / 0 / 0 and the same frozen EA chunk identity
- global authority resolves exactly one path/checksum pair
- missing governed custody fails closed to zero global retrieval
- both semantic and full-text readers cross the centralized authority seam
- Docker custody test refuses a blanket `data/ain/` inclusion

Type standing:

- ship TypeScript: 229 vs baseline 239 · 0 regressions
- scripts TypeScript: 40 existing diagnostic lines · 0 attributable to J6
- `git diff --check`: PASS

## 10. Non-authorizations

This tranche does not authorize:

- EA corpus ingestion;
- deletion or mutation of the 2,228 legacy Library rows;
- bulk classification of those rows;
- treating practitioner authority as corpus authority;
- treating storage, embedding, review status, or completion as representation authority;
- re-enabling legacy global retrieval without a governed authority decision.

## 11. Next gate

After Class A review, merge and deployment of J6:

1. verify running SHA;
2. run `scripts/ingest-elemental-alchemy-governed.ts --runtime-custody` in production;
3. require `1 / 1 / 0 / 0`, exact source SHA, 1,238 chunks, exact chunk-set SHA;
4. prove `ain_knowledge_chunks` remains 0 before execution;
5. prove the legacy Library rows remain stored while unauthorized rows return zero candidates from global retrieval;
6. only then may J7 — EA production ingestion — be considered.

## 12. Canonical reconciliation

While J6 was being constructed, `clean-main-no-secrets` advanced from `78a85f652…` to `9e11eedb…`. The intervening range changed 25 paths, all documentary SPM/F5/CLAUDE programme material, with **zero overlap** against the ten J6 files. J6 was rebased onto `9e11eedb…` without conflict and its witnesses were rerun on the reconciled tree.
