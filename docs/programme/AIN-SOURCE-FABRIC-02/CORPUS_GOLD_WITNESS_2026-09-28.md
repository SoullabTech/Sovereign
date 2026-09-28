# AIN-SOURCE-FABRIC-02R1 — Representative Corpus + Gold Query Witness

**Date:** 28 September 2026
**Parent:** AIN-SOURCE-FABRIC-02
**Class:** benchmark data construction only

## Standing

A fixed representative non-member corpus and gold-query family set now exist for retrieval benchmarking.

No retrieval tournament has been run yet.

No MAIA runtime behavior, Obsidian index, vector store, graph store, or production retrieval path was changed.
## Corpus

The benchmark corpus contains **26 sources**.

Source-class distribution:

- 4 canon documents;
- 6 design / experience contracts;
- 6 programme constitutions;
- 5 programme / technical witnesses;
- 2 implementation architecture documents;
- 1 research hypothesis note;
- 1 author-source manuscript;
- 1 benchmark contract.

The corpus spans authority, memory, House relations, Dream, Astrology, Divination, writing, Relational Geometry, teaching, Elemental Alchemy, retrieval architecture, Source Fabric, and Indra's Web.
## Sibling-lane Indra snapshots

Five Indra's Web documents were copied into the benchmark fixture directory as **checksum-bound snapshots**.

They remain test evidence, not duplicated canon.

The snapshot set includes:

- Source / Relation Grammar;
- Facet↔Center Permeability + Context Disclosure;
- Pure Center Composer Contract;
- Technical Relational Validation;
- Live Topology-Aware Render Witness.

Each snapshot retains its sibling-lane origin and exact SHA-256.
## Gold query set

The benchmark contains **72 gold inquiries** across **12 families**, six per family:

1. exact lexical;
2. semantic paraphrase;
3. cross-source synthesis;
4. graph bridge;
5. temporal supersession;
6. contradiction;
7. analogy;
8. global / whole-corpus;
9. negative control;
10. permission control;
11. source diversity;
12. ablation.

Lane expectations:

- **21 analytic**
- **12 associative**
- **39 bilateral**

This balance is deliberate: bilateral coordination dominates, while the associative lane still has a sufficient set of primary challenges.
## Evidence labels

Across the 72 inquiries the gold set includes:

- 103 **must_retrieve** assignments;
- 43 **helpful** assignments;
- 16 **bridge** assignments;
- 5 **counterevidence** assignments;
- 3 **stale_or_superseded** assignments;
- 8 **forbidden** assignments.

Negative controls contain no expected source.

Permission-control cases include relevant-but-forbidden sources so a retrieval system cannot score well merely by finding semantically relevant material.
## Hard examples

The gold set includes tests such as:

- exact recovery of **“selection begins after authority”**;
- semantic recovery of Interface Humility without naming the doctrine;
- Lambspring → Edinger → Elemental Alchemy lineage;
- typed relations → Indra source/relation grammar;
- current hybrid-retrieval standing versus architecture language;
- machine-proposed Dream similarity versus authority law;
- Aether-style synthesis versus Pure Center composition;
- whole-corpus agency and provenance questions;
- deliberate source apertures that forbid highly relevant neighboring material;
- ablation cases where removing one jewel must weaken the later synthesis.
## Corpus-callosum relevance

The dataset is intentionally not a standard question-answer benchmark.

Some inquiries are easiest for exact / analytic retrieval.

Some require distant semantic or relational discovery.

Most of the difficult inquiries require both.

The benchmark therefore tests whether the coordinated field provides:

> **analytic precision + associative reach + preserved contradiction + governed provenance**

rather than merely maximizing top-k similarity.
## Reproducibility

Durable artifacts:

- `lib/ain/source-fabric/benchmark/corpus.ts`
- `lib/ain/source-fabric/benchmark/goldQueries.ts`
- `docs/programme/AIN-SOURCE-FABRIC-02/corpus-manifest.json`
- `docs/programme/AIN-SOURCE-FABRIC-02/gold-query-receipt.json`

Integrity checks verify:

- 26 unique sources;
- all paths resolve;
- five sibling snapshots match their exact hashes;
- 72 unique query IDs;
- six queries in each family;
- every gold source exists;
- source-class labels match the corpus manifest;
- negative controls are empty;
- permission controls contain real forbidden sources;
- ablation targets identify real critical jewels.
## Test result

Full Source Fabric / benchmark contract population:

> **24 / 24 PASS**

This includes:

- 8 Source Fabric disagreement tests;
- 6 corpus-callosum / scoring tests;
- 10 corpus / gold-set integrity tests.

## No-member-data boundary

The benchmark corpus is restricted to project canon, research, design contracts, programme records, author-owned manuscript material, retrieval architecture, and checksum-bound sibling-lane programme snapshots.

No member Journal, Dream, Relationship, clinical, client, or personal-memory records are used.

## Next boundary

> **AIN-SOURCE-FABRIC-02R2 — CORPUS CHUNKING + BASELINE RETRIEVAL RUNS ONLY**

That act may chunk this fixed corpus and measure the current lexical / semantic baseline.

It must not yet change MAIA runtime behavior.
