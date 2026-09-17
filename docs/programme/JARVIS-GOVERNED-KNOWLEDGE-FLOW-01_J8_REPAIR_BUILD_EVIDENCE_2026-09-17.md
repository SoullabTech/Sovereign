# JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 — J8 repair build evidence

**Date:** 2026-09-17
**Class:** Contained build evidence. No deploy. No production corpus mutation.
**Repair branch:** `feature/jarvis-gkf-j8-repair-20260917`
**Frozen STOP base:** `27f9408e33ca05eaf0c73b306dfa016f48948a3e`
**Production runtime during build witness:** `78a85f652` / image `sha256:23e94c94c1a4c9c76979a62d4aef677c6507c93eb49459ada6947e3e2100188b`

## 1 · What this repair changes

The repair does not alter the J7 corpus. It repairs the canonical retrieval seam that J8 proved absent.

It introduces:

- a runtime-safe governed-source registry containing the exact authorized Elemental Alchemy source identity;
- an exact `source_file` allowlist in `RetrievalService`, independent of the legacy `domain` / `categories` classifier;
- a read-only governed retrieval service that deliberately passes no `userId`, so retrieval analytics are not written;
- a provenance-bearing retrieved-source block that preserves Kelly Nezat as author / rights holder and names the authorized source revision;
- a distinct canonical producer, `retrieved.governed_knowledge`, separate from `collective.knowledge_gate`;
- canonical `/api/sovereign/app/maia/list` retrieval at `limit=3`, `minSimilarity=0.55`, suppressed in Sanctuary Mode and when no governed hit clears the threshold;
- explicit runtime inventory of the governed block;
- the same governed evidence carried through FAST, CORE, and DEEP by each tier's native context seam.

The Knowledge Gate continues to weight intelligence wells. It is not used as a hard admission gate for Elemental Alchemy, because its `AIN_OBSIDIAN` weight vocabulary is not a semantic classifier for the book.

## 2 · Authority boundary

Canonical governed retrieval does **not** trust ambient membership in `ain_knowledge_chunks` and does **not** depend on `domain=somatic`.

The runtime registry currently binds:

- subject: `elemental-alchemy`;
- source file: `Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md`;
- author / rights holder: `Kelly Nezat`;
- authority: `rights_holder_authorized`;
- authority record: `docs/corpus-authority/elemental-alchemy.md`;
- source SHA-256: `f57f17e6ab82f911a4932c1f2d5fa0149e8fe499c7461f60bd87f86d0f657af0`;
- crossing act: `CORPUS-INGEST-EA-01`.

Important limitation retained from the J8 STOP: the production table itself does not persist the source revision digest. The `source_file` allowlist is therefore a runtime admission boundary over the **currently independently attested J7 row-set**, not a substitute for durable row-level revision provenance. The legacy same-table writer remains a Law 7 debt and can invalidate that attestation if allowed to write later.

## 3 · Focused test evidence

Executed against the exact production image dependency/toolchain with the repair files mounted read-only.

```text
Test Suites: 8 passed, 8 total
Tests:       57 passed, 57 total
Snapshots:   0 total
```

Covered:

- J7 ingest contract and transaction behavior;
- exact governed source allowlisting;
- no `userId` / no retrieval analytics write from governed retrieval;
- refusal of a foreign source even if a lower layer were to return it;
- provenance formatting and output bound;
- Knowledge Gate / governed retrieval producer separation;
- Sanctuary restriction and canonical participation shape;
- canonical route server-binding after client metadata;
- FAST / CORE / DEEP reachability.

## 4 · TypeScript regression evidence

A clean worktree at the exact J8 STOP base and the repair worktree were each copied into fresh writable tmpfs sandboxes and compiled with the same TypeScript compiler and the same project config from the production image.

Both used `tsconfig.json` SHA-256:

`08b2686d48b516b94d97072d0a4b74833f2ea74e3c41195158ac2e778d2ff0ef`

Normalized diagnostics (file + TS code + message; line/column removed):

```text
BASE_ERROR_LINES=830
REPAIR_ERROR_LINES=830
BASE_UNIQUE_SIGNATURES=616
REPAIR_UNIQUE_SIGNATURES=616
NEW_SIGNATURES=0
RESOLVED_SIGNATURES=0
```

The repository remains globally type-red. This repair introduces **zero new TypeScript diagnostic signatures** against its exact frozen base.

## 5 · Read-only production smoke

The repair retrieval modules were mounted over the exact deployed image and exercised against the live production database and host Ollama **without deployment**.

The PostgreSQL session was forced read-only with `default_transaction_read_only=on`.

Query:

> What is the crystal of self-knowledge and how do its elemental facets relate to awareness?

Observed:

```text
DB_DEFAULT_READ_ONLY=on
HITS=3
0.693212  elemental-alchemy
0.668039  elemental-alchemy
0.646392  elemental-alchemy
RETRIEVAL_LOG_BEFORE=0
RETRIEVAL_LOG_AFTER=0
LOG_DELTA=0
```

All three rows came from the exact governed source file. The rendered provenance line was:

```text
Elemental Alchemy — Kelly Nezat; revision sha256:f57f17e6ab82f911a4932c1f2d5fa0149e8fe499c7461f60bd87f86d0f657af0; authority: rights_holder_authorized; ingest: CORPUS-INGEST-EA-01
```

The first smoke attempt failed before retrieval on a quoting error in the optional analytics-table existence query. The corrected smoke used the same retrieval code and completed the evidence above. No production write occurred in either attempt.

## 6 · Repair implementation hashes

These hashes describe this repair build. They do **not** replace the historical J7 executable bind.

| File | SHA-256 |
|---|---|
| `lib/corpus/governedKnowledgeRegistry.ts` | `932fa26e9bb0ec76c5d0cf4f788ec2fde00b50976397b26638b75261b5d6ea7c` |
| `lib/corpus/eaIngestContract.ts` | `18f87acaf79b22d09cd83552d895cf175350134c86fb9b3754aad9de45d93b6e` |
| `lib/ain/knowledge/RetrievalService.ts` | `88924e2812120516327588861f85fab02ad3277e5cb791a55ab5cc564829bb82` |
| `lib/ain/knowledge/GovernedRetrievalService.ts` | `845142d3ac3200c6d8dad473306b7beb7fb85e3b944efb3c6aaf33a654549b2c` |
| `lib/maia/canonical-turn/producerRegistry.ts` | `7ef1f53276f272b42970a9dd45cb9dc868a7e446c94b7e0027925dda4954dfce` |
| `lib/maia/canonical-turn/shadow.ts` | `3b6a7bfd1e548029e5483f0e59c781a81b13d6bcac576e115e4733bd91285308` |
| `lib/maia/maiaRuntimeContext.ts` | `28ea0f507ac40b67ed4a05462df32385495fede3e481ab5d4566ff77cfd476cd` |
| `lib/sovereign/maiaVoice.ts` | `24478cbf115848f350302de97e8b68fe56c400301f014288b51e89c44adcc84a` |
| `lib/sovereign/maiaService.ts` | `14d23fb4875f0fbe398d424fbb4d31d3e60249d1eb47e8806e1b9136081aec2e` |
| `lib/consciousness/consciousness-layer-wrapper.ts` | `511f0443429dc64abeb59c8ac7b8ac806eda84da8b2debf328445659544003b8` |
| `lib/orchestration/consciousness-orchestrator.ts` | `88836c1096c716aac112f1d759880a80fffaf53f86717b0da38e7887a92ab010` |
| `app/api/sovereign/app/maia/list/route.ts` | `ab8c3207a461e78d32ca68a1850bf90023f1c15aa2d395f9fc1c578b7b3fcd51` |

## 7 · Historical J7 bind remains historical

J7 crossed production with `lib/corpus/eaIngestContract.ts` SHA-256:

`44100704540e9da5996373768206daa3854cd6e8a83d455b111fcb2de20015b9`

This repair deliberately changes that file so ingestion and runtime retrieval share one source-identity registry. The new repair hash is not retroactively substituted into J7's evidence. No re-ingestion is authorized or required by this contained build.

## 8 · Remaining debts / standing

This build does not resolve:

- the absence of durable source-revision provenance on `ain_knowledge_chunks` rows;
- the legacy `scripts/embed-ain-knowledge.ts` same-table write path;
- the alternate Living Library crossing;
- the broader J3/J4 question of which retrieval-relevant metadata belongs in a frozen future corpus digest.

Those are preserved, not hidden.

**No deploy occurred. No production corpus row changed.**

```text
J0 ✅  J1 ✅  J2 ✅  J3 ✅*  J4 ✅*  J5 ✅  J6 ✅  J7 ✅  J8 ⛔ STOP  ·  J9  ·  J10
```

The next lawful act is a deploy of this bounded repair followed by a canonical `/maia/list` J8 witness. Until that witness passes, J8 remains STOP and J9 remains closed.
