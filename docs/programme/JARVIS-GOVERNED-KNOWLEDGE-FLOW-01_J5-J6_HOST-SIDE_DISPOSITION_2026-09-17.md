# JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 — J5/J6 host-side disposition

**Date:** 2026-09-17
**Class:** Founder-directed execution disposition + direct live preflight.
**Flow branch:** `claude/loving-volta-k4gd1c`
**Predecessor finding:** `JARVIS-GOVERNED-KNOWLEDGE-FLOW-01_J5-J6_PREFLIGHT_FINDING_2026-09-17.md`

## 1 · Founder-direction boundary

After disposition (A), host-side execution, and the executable-authority amendment were presented, Kelly asked: **“can we run this here?”**

That opens this chat as the control lane through Kelly's authorized Mac Studio to `minisforum` and authorizes the non-writing preflight and J6 production witness. It does **not** by itself authorize the J7 production write; J7 remains a separate explicit execute act after J6 PASS.

## 2 · §3 ruling — source material is not runtime material

`data/ain/source` is **build-and-authority material**. It is not production serving material.

Therefore:

- J5 deploys the runtime/retrieval mechanism, not the 736-file source population.
- J6 runs host-side on `minisforum` from a clean governed execution tree.
- J7, when separately authorized, runs from that same class of governed host-side execution locus against the production database.
- The 735 excluded/unclassified candidates are not copied into the runtime image merely to prove that they were excluded.

## 3 · J5 direct production witness — PASS

Direct live checks from the control lane proved:

- `maia-sovereign` is **healthy**.
- Container `GIT_COMMIT` is **`78a85f652`**, the canonical reviewed mechanism (merge of PR #1337).
- `minisforum` root filesystem: **937 GB total / 137 GB available / 85% used** at witness time.
- The earlier ~23–24 GB disk reading was from the Mac Studio, not the production build host, and is not a J5 blocker.

**J5: PASS.**

## 4 · Law 8 execution bind

The corpus contract pins the governed material. It does not alone pin the executable that interprets and writes it.

The reviewed crossing implementation is bound to `78a85f652` by these SHA-256 values:

| File | SHA-256 |
|---|---|
| `scripts/ingest-elemental-alchemy-governed.ts` | `634e0c9b152a6ba819eca0c73a10607431e9e987f215de9cee42328527157470` |
| `lib/corpus/eaIngestContract.ts` | `44100704540e9da5996373768206daa3854cd6e8a83d455b111fcb2de20015b9` |
| `lib/corpus/eaIngestTransaction.ts` | `ae76eb01eec0098c6f714530e4853426b1819f6381bcd1c98411cac59a4930d1` |
| `lib/ai/localEmbeddingClient.ts` | `4bd0e2365e13d341515fd022ce8620ae6e599139e87dee008178f82d2bde0964` |

The clean execution worktree was created at docs head `11116eab5e7d5c8613195011c41fb5ca2c655511`. `78a85f652` is an ancestor of that head, and an exact path-restricted diff showed **zero changes** between the two revisions for the four bound executable files and `data/ain`.

Therefore the docs-only descendant does not constitute executable drift. J6/J7 may use it only while the tree is clean and the bound hashes remain exact.

## 5 · Host-side preflight — PASS for J6

Direct checks proved:

- control path: authorized Mac Studio → SSH → `minisforum`;
- dedicated worktree: `/home/soullab/worktrees/jarvis-gkf-01`;
- worktree head before this record: `11116eab5e7d5c8613195011c41fb5ca2c655511`;
- worktree state before this record: **clean**;
- governed candidate population present: **736 files** under `data/ain/source`;
- `DATABASE_URL` is present in host configuration (value not printed);
- Ollama binary is available at `/usr/local/bin/ollama`;
- `nomic-embed-text:latest` is installed;
- live embedding probe returned **768 dimensions**.

## 6 · Gate standing

```text
J0 ✅  J1 ✅  J2 ✅  J3 ✅  J4 ✅  J5 ✅  ▶ J6  ·  J7  ·  J8  ·  J9  ·  J10
```

**Authorized next act:** J6 witness-only invocation of `scripts/ingest-elemental-alchemy-governed.ts` from the clean governed host-side worktree.

**Not authorized by this record:** `--execute=CORPUS-INGEST-EA-01`, `CORPUS_INGEST_EA_01_AUTHORIZED=YES`, any production corpus write, any Living Library change, or J10 closure.
