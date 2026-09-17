# JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 — J8-R1 repair build evidence

**Date:** 2026-09-17
**Standing:** local candidate build evidence only. **J8 remains STOP.**
**Canonical base:** `69b7c7fb4edad226b41042a75e782220f885242f`.
**Forward-port origin:** implementation idea from `145d2c13c`; stale ancestor history excluded.

## 1 · Reconciliation result

The single J8 implementation commit was applied without commit onto a clean worktree based on current canonical.

Mechanical overlap against canonical changes since its old base existed in one file only: `lib/corpus/eaIngestContract.ts`.

Git resolved it cleanly, and source review confirmed both authorities survived:

- canonical J6 runtime custody mode (`canonical` versus minimal `runtime`, including `1 / 1 / 0 / 0` runtime counts);
- J8's shared governed source identity registry.

The historical remote branch was not merged or rebased wholesale.

### Canonical freshness reconciliation

During CI for the first reconciled PR head, canonical advanced from `83fce8edbdae32770849cdf71b6b6350543d5885` to `2e82ca9f10128c034956c974f4c6501f811035e7` via PR #1342. That first candidate head was treated as stale and was not merged or deployed. The J8-R1 commit was then rebased onto the new canonical head with zero conflicts. The full 9-suite / 58-test acceptance population and both TypeScript gates below were rerun after that rebase.

A second freshness event occurred after that head's full CI turned green: PR #1345 advanced canonical to `69b7c7fb4edad226b41042a75e782220f885242f` and made the JARVIS five-field lane preamble canonical. The green predecessor head was therefore treated as stale before any Founder-Steward authorization, merge, or deploy. The J8-R1 patch was rebased onto `69b7c7fb4edad226b41042a75e782220f885242f` without code conflict. The charter adopted the new preamble prospectively, explicitly preserving the fact that this lane opened before the rule existed. All acceptance and TypeScript evidence stated below must be regenerated on the new exact head before publication.

### Concurrent-drift containment

During a documentary amend in the previously shared worktree after that second freshness event, an unrelated concurrent edit set entered three authority-layer files: `governedKnowledgeRegistry.ts`, `GovernedRetrievalService.ts`, and `RetrievalService.ts`. It introduced a new source-applicability mechanism (positive/confusable semantic descriptors, similarity/margin thresholds, an embedding contract, and query-vector reuse). Those semantics were absent from the previously reviewed J8-R1 head and were not authorized by this repair charter.

The exact unreviewed state is preserved locally at commit `12beaf9b681682d6d4ef742fd97ed245e493f1bd` under a quarantine ref. J8-R1 finalization moved to an isolated worktree rooted at clean pre-drift candidate `bbac6bbaa801c3869083d606ccc1203f0ebfc755`. No judgment is made here about whether the applicability idea is good; the finding is only that it may not acquire Class A authority by concurrency.

## 2 · Candidate architecture

New/extended seams:

- `lib/corpus/governedKnowledgeRegistry.ts` — runtime-safe source identity/provenance registry;
- `lib/ain/knowledge/GovernedRetrievalService.ts` — exact-source read-only retrieval and bounded prompt formatting;
- `lib/ain/knowledge/RetrievalService.ts` — optional exact `sourceFiles` SQL boundary;
- `/api/sovereign/app/maia/list` — live route retrieval before generation, outside Sanctuary;
- canonical-turn producer `retrieved.governed_knowledge`;
- FAST / CORE / DEEP propagation through the existing serving architecture.

No new DB table, migration, corpus row, Library row, or external provider was introduced.

## 3 · Hardening added during reconciliation

The older candidate treated `sourceFiles: []` the same as no source filter. That shape is inappropriate for an authority boundary.

Reconciled behavior:

```text
sourceFiles === undefined  → ordinary legacy retrieval, no source filter
sourceFiles === []         → [] immediately; no embedding; no DB query
sourceFiles === [exact...] → parameterized source_file allowlist
```

A new test falsifies the empty-list widening case.

A second new test binds the runtime registry to J6's admission-derived authority primitive:

```text
runtime registry sourcePath/sourceSha256
          ==
getGlobalLibraryAuthorityKeys(canonical repository)
```

A third test directly inspects the live `/maia/list` retrieval block and requires the Sanctuary guard to precede the retrieval call. The route comment now states explicitly that `AIN_KNOWLEDGE_GATE_ENABLED` is an operational rollout kill-switch only; source authority comes from the governed registry/equivalence chain.

A fourth source review found multiplicative-weighting risk in DEEP: the older candidate placed the same governed block into recursive/meta prompts as well as the orchestrator knowledge stream, and into every temporal layer before adding it again at synthesis. The reconciled candidate removes that duplication:

- recursive/meta: one orchestrator knowledge-stream participation; direct prompt fallback gets the block only if native orchestration yields no message;
- temporal: parallel layers do not receive the source; synthesis receives it once;
- optional Claude consultation: raw source is included only when the local DEEP stage did not successfully consume it.

The static wiring falsifier now requires this one-participation shape.

## 4 · Targeted falsification result

Final local targeted population:

- `lib/ain/knowledge/__tests__/GovernedRetrievalService.test.ts`
- `lib/ain/knowledge/__tests__/RetrievalService.sourceAllowlist.test.ts`
- `lib/ain/knowledge/__tests__/governedKnowledgeWiring.test.ts`
- `lib/corpus/__tests__/governedKnowledgeRegistry.test.ts`
- `lib/maia/canonical-turn/__tests__/governedKnowledgeParticipation.test.ts`
- `lib/library/__tests__/globalRetrievalAuthority.test.ts`
- `lib/corpus/__tests__/eaIngestContract.test.ts`
- `lib/corpus/__tests__/eaIngestTransaction.test.ts`
- `lib/corpus/__tests__/admission.test.ts`

Result:

```text
9 suites PASS
58 / 58 tests PASS
0 failed
```

The set jointly proves J8's new route/read boundaries, one-participation DEEP evidence geometry, and retention of J6 admission/Library authority plus J7 ingestion-contract behavior.

## 5 · TypeScript standing

Current reconciled tree:

```text
ship TypeScript: 229 diagnostics
baseline:        239
regressions:       0
```

Repository scripts remain at their existing red baseline:

```text
scripts diagnostic lines: 40
J8-related diagnostics:    0
```

The lane adds no TypeScript regression.

## 6 · Fresh production pre-repair witness

Read-only witness during reconciliation:

```text
maia-sovereign GIT_COMMIT = 97c7d9463
health                    = healthy
ain_knowledge_chunks      = 1,238 rows / 1 source / 1,238 embedded
chunk index range         = 0–1237
library_sources           = 2,228 rows / 1,752 completed
```

No production mutation was made by this repair lane.

The running SHA is expectedly behind the current documentation-only canonical head; no manual/designation deployment is required. This repair has not been deployed.

## 7 · J6 / Law-7 reconciliation

The old candidate documents treated Living Library as unresolved Law-7 debt. That statement is stale and is not carried forward.

Canonical J6 now enforces global Library retrieval authority. Legacy Library storage remains present, but global MAIA Library retrieval requires the exact admission-derived source path + checksum and excludes scoped material. Live J6 witness previously returned zero legacy global results.

J8-R1 therefore repairs the AIN canonical-turn seam without reopening or substituting the Library boundary.

## 8 · Metadata finding disposition

The production rows' heuristic `domain/categories` remain unchanged. The candidate does not claim those labels are correct.

Instead, governed retrieval does not consult those fields for source eligibility. It uses exact governed source identity, so legacy `talk`/`somatic` mode metadata cannot widen or suppress the governed path.

This removes the prior metadata-attestation field from the J8 authority decision without rewriting historical rows.

## 9 · Remaining limitation

`ain_knowledge_chunks` persists `source_file` but no source SHA-256. The new runtime registry knows the exact authorized SHA, and J6/J7 evidence binds the current row set, but the DB row itself cannot independently prove source revision from its filename.

Therefore J8-R2 must begin with an independent production corpus re-witness. This repair does not upgrade filename-only persistence into digest custody by assertion.

## 10 · Build verdict

**J8-R1 local repair candidate: PASS for bounded build evidence.**

What that means:

- the forward-port is mechanically and semantically reconciled with current J6;
- targeted falsifiers pass;
- typehealth adds no regression;
- the candidate is suitable for Class A review after canonical-drift reconciliation.

What it does **not** mean:

- not merged;
- not deployed;
- not production-witnessed;
- J8 not closed;
- J9 not open.

Next act: publish the freshness-reconciled Class A candidate, require all protected-branch checks to pass on its exact SHA, then obtain explicit Founder-Steward authorization bound to that exact SHA before merge/deploy consideration.
