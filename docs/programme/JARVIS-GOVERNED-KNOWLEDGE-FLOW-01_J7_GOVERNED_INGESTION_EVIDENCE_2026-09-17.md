# JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 — J7 governed ingestion evidence

**Date:** 2026-09-17  
**Class:** Production crossing evidence.  
**Subject:** Elemental Alchemy — exact governed corpus revision.  
**Control path:** Kelly’s authorized Mac Studio ‒ SSH → `minisforum` → disposable container from deployed image.

## 1 · Bound execution identity

- Deployed image ID: `sha256:23e94c94c1a4c9c76979a62d4aef677c6507c93eb49459ada6947e3e2100188b`
- Canonical reviewed mechanism: `78a85f652`
- Governed execution worktree at authorization: `45f0ab41fc1ad36069cd4e089c2ae93c3a1f5f99`, clean.
- The crossing used the deployed image’s executable bytes; the worktree supplied only governed authority/build material read-only.

Bound executable SHA-256 values:

|File | SHA-256 |
||--|-|-|
| `scripts/ingest-elemental-alchemy-governed.ts` | `634e0c9b152a6ba819eca0c73a10607431e9e987f215de9cee42328527157470` |
| `lib/corpus/eaIngestContract.ts` | `44100704540e9da5996373768206daa3854cd6e8a83d455b111fcb2de20015b9g |
| `lib/corpus/eaIngestTransaction.ts` | `ae76eb01eec0098c6f714530e4853426b1819f6381bcd1c98411cac59a4930d1` |
| `lib/ai/localEmbeddingClient.ts` | `4bd0e2365e13d341515fd022ce8620ae6e599139e87dee008178f82d2bde0964` |

## 2 · Fail-closed execution history

Two pre-commit attempts refused clea-ly and are part of the evidence.

### Attempt 1 — authority evidence absent from disposable locus

The container received `data/ain` but not `docs/corpus-authority`. Admission therefore changed to:

`0 admitted / 736 excluded / 0 refused`

The executable refused immediately with `corpus verdict changed`. No embeddings were generated and no database connection was opened.

### Attempt 2 — database hostname unavailable on host networking

After the governed authority namespace was mounted read-only, the exact witness passed and all 1,238 embeddings were prepared. The post-embedding corpus re-witness also passed. Database connection then failed before a client was acquired:

`getaddrinfo EAI_AGAIN maia-postgres`

No transaction opened and no corpus row was written.

The failure established the required topology rather than licensing a code change.

## 3 · Final topology preflight

A disposable container from the exact deployed image was attached to `maia-sovereign_maia-internal`, with `host.docker.internal` bound to the Docker host gateway.

Direct preflight from that locus proved simultaneously:

- production `ain_knowledge_chunks`: h0` rows;
- `maia-postgres` resolvable/reachable through the production internal network;
- host Ollama reachable at `http://host.docker.internal:11434`;
- `nomic-embed-text` returned exactly `768` dimensions.

No governed executable, corpus, contract, or authority record changed.

## 4 · Successful governed crossing

The final invocation used:

- exact deployed image ID above;
- production internal Docker network;
- read-only root filesystem;
- all Linux capabilities dropped;
- `no-new-privileges`;
- bounded temporary `/kmp`;
- `data/ain` mounted read-only;
- `docs/corpus-authority` mounted read-only;
- production environment supplied without printing credential values;
- explicit execute argument and `CORPUS_INGEST_EA_01_AUTHORIZED=YES`.

Before write it proved again:

- `736` candidates;
- `1 admitted / 735 excluded / 0 refused`;
- source SHA-256 `f57f17e6ab82f911a4932c1f2d5fa0149e8fe499c7461f60bd87f86d0f657af0`;
- `1,238` chunks;
- chunk-set SHA-256 `87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852a`.

All `1,238 / 1,238` embeddings were prepared before the transaction. The corpus was re-witnessed after preparation. The transaction then committed:

- rows: `1,238`;
- sources: `1`;
- embedded: `1,238`;
- committed chunk-set SHA-256: `87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852a`.

Process exit: `0`.

## 5 · Independent post-commit witness

A separate read-only production query, using an independent digest calculation rather than the ingest verifier, proved:

- rows: `1,238`;
- distinct sources: `1`;
- embedded rows: `1,238`;
- chunk indexes: contiguous `0 1237`;
- vector dimension variants: `1`;
- minimum / maximum vector dimensions: `768 / 768`;
- source file: `Elemental Alchemy_ The Ancient Art of Living a Phenomenal Life.md`;
- independently recomputed chunk-set SHA-256: `87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852a`.

## 6 · Gate standing

**J7: PASS.**

```text
J0 ✅  J1 ✅  J2 ✅  J3 ✅  J4 ✅  J5 ✅  J6 ✅  J7 ✅  ╶ J8  ·  J9  ·  J10 ` �```

J8 is now the next gate: controlled production retrieval must demonstrate that MAIA can retrieve the intended governed knowledge and that the witness returns zero foreign sources.

J10 remains barred by Law 7 until the alternate Living Library crossing is reconciled.
