# JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 — J5/J6 pre-flight finding

**Date:** 2026-09-17
**Class:** Repository-truth finding. Read-only. ⛔ No repair authorized.
**Pinned tree:** `78a85f652` (canonical head, merge of PR #1337)
**Status:** OPEN — founder ruling owed before the J5 deploy is spent.

---

## 1 · The finding

**The authorized Elemental Alchemy source is not present in the production image, so the production witness (J6) and the ingestion act (J7) cannot be run inside the deployed container as currently built.**

Two independent mechanisms exclude it, either one sufficient:

1. `.dockerignore:116` — `data/ain/` is excluded from the build context, so the builder stage's `COPY . .` (`Dockerfile:70`) never receives it.
2. The runner stage copies `scripts`, `lib`, `database`, `prisma`, `public`, `.next` — and **no `data/` path at all** (`Dockerfile:114-138`). Even were the `.dockerignore` line removed, the source would not reach the runtime image.

`scripts/ingest-elemental-alchemy-governed.ts` resolves its corpus from `process.cwd()` via `witnessEaBuild()`. In the container that directory holds no candidates, so the run fails at `assertExactAdmission` — **a fail-closed refusal, not a silent wrong answer.** The mechanism behaves correctly; the location is wrong.

## 2 · Why the narrow fix does not work

Admitting only the one authorized file into the image does **not** satisfy the witness. `EA_INGEST_CONTRACT` pins `candidateCount: 736` and the verdict `1 admitted / 735 excluded / 0 refused`. The witness proves admission against the **whole candidate population**; a container seeing one file cannot prove that 735 others were excluded.

So an in-container J6 requires shipping all **736** source files — including 735 unclassified files — into the production runtime image. That is a material widening of what production holds, undertaken to satisfy a witness rather than to serve a member.

## 3 · The structural question this exposes

> Is the corpus source **build-and-authority material**, or **runtime material**?

The flow's own logic answers it: at runtime MAIA reads governed rows from the database. She never reads `data/ain/source`. The source folder is the input to a governed crossing, not a thing production serves.

On that reading, **J7 is a host-side governed act — the same class as a migration — not an in-container one**, and J5's actual job is narrower than it looked: put the *retrieval-side* machinery live, not make the ingest runnable in the container.

⛔ This is stated as the reading the evidence supports. It is not taken. One/the-other is a founder ruling.

## 4 · Candidate dispositions (⛔ none chosen)

- **(A) Host-side act.** Run the witness and the ingestion from minisforum's checkout (`~/MAIA-SOVEREIGN`) against the production database. Keeps 735 unclassified files out of the runtime image. The checkout's drift risk is already answered by the contract: a wrong tree fails on `sourceSha256` / `chunkSetSha256` before any write — **the contract is the pin, not the checkout.**
- **(B) Ship the corpus.** Un-ignore `data/ain/source` and copy it into the runner. Satisfies an in-container witness; puts 735 unclassified files into production and grows the image.
- **(C) Separate ingest image.** A build target carrying the source, run once. Highest ceremony; strongest isolation; most machinery to govern.

## 5 · Pre-flight items owed before J5 is spent, under any disposition

1. Disk floor cleared on the build host (the current J5 blocker).
2. The ruling in §3 — it decides *where* J6 and J7 run, and therefore what the deploy must contain.
3. Ollama reachability **from wherever J7 will run**: `OLLAMA_BASE_URL` (default `http://localhost:11434`), model `nomic-embed-text`, 768 dimensions. 1,238 embeddings are generated *before* any transaction opens, so an unreachable Ollama costs a long run and no write — safe, but worth proving first.
4. `DATABASE_URL` available to that same location.

## 6 · What this finding does not claim

⛔ No defect in `EA_INGEST_CONTRACT`, the admission suite, the transaction path, or the refusal law — all reviewed and unchanged.
⛔ No production state read. This is repository truth at `78a85f652` only.
⛔ No claim about the Living Library or any other pathway.

## 7 · Environment note

This finding was produced in a remote container with **no `ssh` binary, no route to minisforum, and no `DATABASE_URL`**. No production read was performed and none was attempted. A statement about the environment — not a deferral, and not a partial result.
