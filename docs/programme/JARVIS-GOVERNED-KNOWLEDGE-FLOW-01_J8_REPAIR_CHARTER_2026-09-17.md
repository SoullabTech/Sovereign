# JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 — J8-R1 governed retrieval repair charter

**Date:** 2026-09-17
**Class:** Class A candidate — canonical cognition / knowledge-retrieval boundary.
**Current canonical base after freshness reconciliation:** `2e82ca9f10128c034956c974f4c6501f811035e7`.
**Current standing:** **J8 remains STOP.** This charter authorizes no deploy and makes no J8 PASS claim.

## 1 · Gate being repaired

J8 asks whether the canonical member-serving MAIA turn can retrieve the intended governed knowledge — and only governed knowledge — through the route that actually produces member responses.

Earlier read-only evidence established two separate facts:

1. the EA vectors in `ain_knowledge_chunks` are semantically searchable;
2. canonical `POST /api/sovereign/app/maia/list` does not presently produce or pass retrieved AIN evidence into its normal turn.

Therefore persisted + searchable did not establish canonical retrieval.

## 2 · Current inherited truth

The repair begins after canonical J6, not from the older J8 candidate branch's world-state.

- J6 Production Knowledge Boundary is canonical and deployed at runtime SHA `97c7d9463`.
- global Living Library retrieval is authority-filtered; legacy `completed + embedded` storage no longer confers global MAIA knowledge authority.
- production Library rows remain stored: 2,228 total / 1,752 completed.
- production AIN corpus exists as exactly 1,238 rows / 1 source / 1,238 embeddings / chunk indexes 0–1237.
- the source is Elemental Alchemy and the independently re-witnessed corpus text set matches frozen chunk-set SHA-256 `87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852`.
- the exact authorized source SHA-256 remains `f57f17e6ab82f911a4932c1f2d5fa0149e8fe499c7461f60bd87f86d0f657af0`.

No J8 repair may reopen J6, widen Library authority, re-ingest EA, or directly rewrite those 1,238 rows.

## 3 · Reconciliation provenance

A substantial J8 repair candidate existed on `origin/feature/jarvis-gkf-j8-repair-20260917` at commit `145d2c13c`.

That branch as a whole is **not** adopted. It forks at `78a85f652` and carries a historical J5–J8 documentary lineage whose assumptions predate canonical J6. In particular, its records still describe Living Library as an unresolved Law-7 crossing.

This lane forward-ports **only the single repair commit's implementation idea** onto current canonical. Historical ancestors and stale conclusions are excluded. The forward-port applies with zero Git conflicts; semantic reconciliation remains required.

### Canonical freshness event

While the first PR-head CI was running, canonical advanced from `83fce8edbdae32770849cdf71b6b6350543d5885` to `2e82ca9f10128c034956c974f4c6501f811035e7` through PR #1342 (JARVIS manual canonical designation). The first candidate head was therefore invalidated before merge or deployment. This lane was rebased onto the new canonical head with zero conflicts, and no prior founder authorization is presumed to carry across candidate identity.

## 4 · Repair question A — canonical seam

The repair introduces one route-owned retrieval act in `/api/sovereign/app/maia/list`:

```text
member message
  ↓
Sanctuary / rollout enablement
  ↓
retrieveGovernedKnowledge(message)
  ↓
exact governed source-file allowlist
  ↓
bounded retrieved-source block
  ↓
server-authored meta after client meta
  ↓
FAST / CORE / DEEP native cognition seam
```

It does not reactivate `maiaOrchestrator` as a second serving route and does not create a second renderer.

The retrieval act is registered as canonical-turn producer `retrieved.governed_knowledge`, distinct from `collective.knowledge_gate` source-well weighting.

### J8-R1 evidence-participation constraint — candidate repair contract

The candidate is constrained so a retrieved source does not gain more influence merely because a cognition tier contains more internal readers. **One governed evidence block gets one raw participation per response-production path.**

- FAST injects the block once at its prompt seam.
- CORE carries it once as a typed addendum.
- DEEP recursive/meta processing supplies it once through the orchestrator knowledge stream; direct prompt fallback receives it only when native orchestration yields no response.
- DEEP temporal processing keeps parallel temporal layers source-blind and introduces governed evidence once at their synthesis step.
- If optional DEEP Claude consultation is enabled, it receives raw governed evidence only when the local DEEP stage failed to consume it. A successfully source-grounded local draft is not followed by a second raw copy.

Internal architecture therefore cannot multiply source weight simply by fan-out or recursion.

## 5 · Repair question B — retrieval metadata authority

J8 previously found all EA rows heuristically classified `domain=somatic`, with categories including `somatic`, and `talk` mode therefore returned zero.

**Candidate repair disposition:** domain/category heuristics do not carry authority for governed-source participation. This is an implementation contract for J8-R1, not a new programme-wide founder ruling about metadata ontology.

The governed path does not repair those values and does not filter on them. It filters on the exact governed source identity. Legacy mode-specific retrieval remains unchanged for its existing callers.

Therefore the stale heuristic metadata remains historical row metadata but no longer decides whether an authorized source may enter the governed canonical path.

## 6 · Repair question C — attestation

Runtime retrieval uses a small static registry for prompt-safe identity/provenance, but that registry is not allowed to become a second authority source.

A build-time equivalence test requires its `(sourcePath, sourceSha256)` pair to equal J6's mechanically derived global authority key, which itself comes from corpus admission plus the governed source bytes.

The repair therefore carries this authority chain:

```text
rights-holder authorization + admission declaration
  ↓
J6 admission-derived path + source SHA
  ↓
build-time equivalence
  ↓
runtime governed registry
  ↓
exact source_file query boundary
```

`ain_knowledge_chunks` still has no durable source-SHA column. That remains a known limitation. Before any production J8 PASS witness, the current 1,238-row corpus must be independently re-witnessed against the frozen source/chunk identity; a filename alone is not sufficient evidence.

## 7 · Fail-closed boundaries

- Sanctuary refuses before the governed retrieval call.
- the existing `AIN_KNOWLEDGE_GATE_ENABLED` flag is used only as a rollout kill-switch; it does not confer source authority.
- an explicitly empty `sourceFiles` allowlist returns zero results before embedding or database access; empty can never mean “all sources.”
- governed retrieval supplies no `userId`, so the existing retrieval analytics writer is not invoked.
- lower-layer foreign rows are dropped again against the closed governed registry before formatting.
- retrieval failure yields no governed prompt block; normal MAIA response generation may continue without it.
- client-carried meta cannot override the server-built governed block because the server value is assigned after `...meta`.
- DEEP fan-out/recursion cannot multiply raw source participation; parallel readers remain source-blind until convergence, and fallback/optional consultation receive raw evidence only when the preceding native source seam did not complete.

## 8 · Provenance and representation

The prompt block identifies retrieved text as published source material, not member memory, not member instruction, and not evidence about the member.

Source authorship and rights remain Kelly Nezat's. `authoredBy: system` in the canonical-turn producer registry describes the **retrieval act**, not authorship of Elemental Alchemy.

Technical digests are retained in the provenance block but MAIA is instructed not to volunteer them unless provenance is requested.

## 9 · Scope

In scope:

- exact-source retrieval boundary;
- canonical `/maia/list` wiring;
- FAST / CORE / DEEP carriage;
- canonical-turn producer registration and observability;
- J6 authority equivalence;
- tests/falsifiers needed to prove those boundaries.

Out of scope:

- corpus ingestion or replacement;
- direct metadata UPDATE;
- reclassification of the 735 excluded sources;
- Living Library row mutation;
- J9 representation/provenance closure;
- public/member claim that J8 works before production witness;
- changes to Sanctuary behavior.

## 10 · Exit gate

J8-R1 BUILD may close only when the candidate proves on the current canonical base:

1. exact-source authority cannot widen on an empty allowlist;
2. runtime registry identity equals J6 admission-derived authority;
3. Sanctuary blocks the live route retrieval call;
4. governed retrieval is distinct from source-well weighting in canonical-turn provenance;
5. server-authored context outranks client meta;
6. FAST, CORE, and DEEP each receive the same governed block through their native cognition seam;
7. J6 admission/custody and J7 ingestion-contract tests remain green;
8. ship TypeScript has zero regressions and scripts add zero lane diagnostics;
9. no production write occurs.

A green build opens review/deploy consideration only. It does **not** close J8.

## 11 · Production witness owed after deploy

A later J8-R2 witness must prove on the deployed reviewed SHA:

- running SHA exact;
- production corpus still matches frozen EA identity before the retrieval trial;
- Sanctuary produces zero governed retrieval participation;
- a controlled relevant member-path query reaches `/api/sovereign/app/maia/list` and returns EA governed evidence;
- zero foreign sources participate;
- canonical-turn manifest/shadow identifies `retrieved.governed_knowledge` separately from source weighting;
- the final member response is produced by the canonical serving path;
- provenance is available without falsely treating source material as member memory.

Until that witness exists: **J8 STOP remains in force.**
