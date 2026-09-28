# AIN-SOURCE-FABRIC-01 — Obsidian / Wisdom Index + Governed Retrieval Broker Contract

**Date:** 28 September 2026
**Class:** contract only · no runtime retrieval implementation
**Base:** `956ed92ac36121e0df4cfa64e40cb2d9d1642ebb`

## Purpose

The Source Fabric is the governance and orchestration layer between Soullab's indexed knowledge substrate and Indra's Web / MAIA center.

It is **not** a third retrieval engine.

ADR 004 remains authoritative:

> one knowledge-ingestion / retrieval engine, many scopes.

The canonical substrate remains the `library_*` path. Source Fabric defines how retrieval candidates are admitted, compared, explained, constrained, and handed to a relational center.
## System position

```text
Obsidian / Wisdom / House sources
            ↓
      library_* retrieval substrate
            ↓
       candidate discovery
            ↓
        SOURCE FABRIC
 authority · permission · ranking · temporality · diversity
            ↓
      permeability membrane
            ↓
     authorized source packets
            ↓
        Indra's Web
            ↓
         MAIA center
```

The source engine may discover that something is relevant.

Discovery alone never grants permission to use it.
## Constitutional ordering

The Source Fabric adopts the following precedence:

1. **Permission** — may the source enter this inquiry at all?
2. **Epistemic standing** — what kind of claim may this source legitimately support?
3. **Retrieval relevance** — lexical, semantic, graph, temporal, directness, inquiry fit.
4. **Temporal validity** — is the source current, historical, prospective, superseded, or unknown?
5. **Diversity / counterevidence** — what important difference would top-k similarity erase?
6. **Relational usefulness** — does the source materially alter the configuration?
7. **Center synthesis** — what can be held together without collapse of provenance?
8. **Member correction** — can the member reject, narrow, or revoke the resulting relation?

This ordering is constitutional.

The exact numeric weighting among descriptive retrieval signals is **not** canonized here.
## Permission is a gate, never a score

A source with semantic relevance `.99` and no current authority does not receive a lower score.

It is **not in the candidate competition**.

Formally:

```text
permission != admitted
    → exclude from the active inquiry
```

Graph proximity, embedding similarity, lexical exactness, recency, and model confidence cannot cross this boundary.

This directly inherits the Representation Authority Law:

> selection begins after authority.
## Signal vectors remain differentiated

A candidate carries a vector rather than a single truth score:

- lexical relevance;
- semantic relevance;
- graph relevance;
- temporal relevance;
- source directness;
- inquiry-specific fit;
- member selection standing;
- epistemic kind;
- authority class;
- uncertainty.

The broker may later use a replaceable scoring or reranking function **within admitted comparable candidates**.

The center must retain why a jewel was retrieved.

“Exact wording match,” “conceptual similarity,” and “graph bridge” are not epistemically identical reasons.
## Epistemic standing is claim-relative

Source strength depends on the claim being made.

Examples:

- exact Journal entry → strong evidence for **what the member wrote or reported**;
- member relationship report → evidence for **the member's lived experience**, not another person's interiority;
- Astrology → may support **symbolic parallel or traditional interpretation**, not causal explanation of the person's life;
- Divination → may support **symbolic correspondence**, not prediction or directive;
- system summary → may orient retrieval, but does not become member-authored meaning;
- MAIA hypothesis → may support a provisional relational possibility, never a fact about the member.

A retrieval score cannot widen what a source is permitted to support.
## Temporal adjudication

The Source Fabric distinguishes:

- **event time** — when the represented event occurred;
- **record time** — when it was recorded;
- **validity time** — when a claim is considered applicable;
- **supersession** — whether a later source corrects or replaces a current-state claim.

“Newest wins” is forbidden as a universal rule.

An older Journal entry may remain authoritative historical evidence while being invalid for a current-state claim.

A superseded source therefore remains part of **has been** even when it no longer describes **is being**.
## Graph relevance is discovery, not authority

Graph structure may identify:

- bridges;
- neighborhoods;
- communities;
- lineage;
- dependencies;
- candidate relations.

A graph edge means **related under some declared relation type**.

It does not independently establish:

- causation;
- truth;
- current validity;
- consent;
- member meaning;
- psychological explanation.

Graph centrality may help decide where to look next. It may not decide what is true.
## Contradiction is preserved deliberately

Top-k retrieval often over-selects agreement.

Source Fabric must preserve materially relevant counterevidence.

If several sources suggest public expansion and one current member-authored source says that solitude is urgently needed, the current source is not treated as an outlier to be averaged away.

The field may legitimately contain:

> both expansion and withdrawal of demand
> both desire for collaboration and desire for solitude
> both continuity and discontinuity

Contradiction may be the important configuration.
## Member selection and correction

Explicit member selection receives special standing among already-admitted sources.

This does **not** make the selected source more factually true.

It makes its intentional relevance to the current inquiry clearer.

Member correction has a stronger consequence:

```text
member rejects a MAIA hypothesis
    ↓
the hypothesis loses support for this inquiry
    ↓
the field recomputes without treating disagreement as confirmation
```

The underlying sources remain. The rejected synthesis does not acquire durability merely because MAIA produced it.
## Source-use receipt

Every source packet entering a center-capable inquiry must be conceptually able to answer:

```text
source_ref
source_class
object identity / revision
content hash where applicable
admission_basis
retrieved = yes/no
relied_upon = yes/no
speakable = yes/no
disclosed = yes/no
authority class
epistemic kind
temporal standing
retrieval reasons
support scope
prohibited support
return path
```

This receipt may remain ephemeral.

Its purpose is accountability, not surveillance or mandatory persistence.
## Conceptual broker interface

```ts
retrieveCandidates({
  inquiry,
  eligibleSourceClasses,
  admittedSourceRefs,
  excludedSourceRefs
}) -> {
  candidates,
  receipts,
  excluded
}
```

The broker returns **source candidates and reasons**, not conclusions.

It does not author a gestalt.

It does not decide member identity.

It does not persist an interpretation.

Those are different acts.
## Relation to Obsidian / Wisdom

The Obsidian / Wisdom lane may provide:

- parsed note or document identity;
- links / backlinks;
- headings and block identity;
- lexical index;
- embeddings;
- graph relations;
- temporal metadata;
- canon / source classification;
- checksums and provenance.

Source Fabric should consume those as retrieval substrate signals.

It should **not** require MAIA to re-read the entire vault on every request.

Indexing should be incremental: changed source bytes update only the affected representations and relations.
## Relation to Indra's Web

Indra's Web receives an already-authorized source constellation.

Indra's Web is responsible for relational perception across that admitted set.

The center may ask:

- what converges?
- what contradicts?
- what is merely symbolic?
- which relation depends on one jewel?
- what disappears if that jewel is removed?
- what remains unresolved?

Source Fabric ranks and prepares.

The Crystal Center reconciles.

These are intentionally different cognitive acts.
## Technology evaluation boundary

Future implementation may benchmark combinations such as:

- dense + sparse hybrid retrieval;
- multi-vector / late-interaction reranking;
- property-graph retrieval;
- temporal graph validity / supersession;
- hierarchical community retrieval;
- incremental indexing.

Candidate technologies may include BGE-M3, ColBERT-style reranking, Graphiti-like temporal graph designs, GraphRAG-style community retrieval, LightRAG-like lightweight graph retrieval, or equivalent sovereign components.

No product dependency is chosen by this contract.

The existing `library_*` engine remains the canonical substrate unless a separately governed replacement act supersedes ADR 004.
## No-build boundary

This act authorizes no:

- embedding model change;
- vector-store migration;
- graph database;
- Obsidian ingestion mutation;
- automatic vault indexing job;
- automatic House retrieval;
- MAIA prompt injection;
- Indra's Web source opening;
- permission database change;
- production deployment.

It defines the interface these later implementations must satisfy.

## Central law

> **Permission determines what may enter.**
> **Retrieval determines what may matter.**
> **Epistemic standing determines what each source may support.**
> **Time determines what still holds.**
> **The Center determines what can be held together without collapsing difference.**

And one final corollary:

> **The member remains able to correct the whole thing.**
