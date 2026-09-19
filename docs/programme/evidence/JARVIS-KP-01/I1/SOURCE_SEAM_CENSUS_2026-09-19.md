# JARVIS-KP-01 · I1 — SOURCE-SEAM CENSUS

**Date:** 2026-09-19  
**Canonical base:** `17851fbdaeddd649e6a05c180c94ff3fdd335332`  
**Purpose:** identify existing source/runtime seams that I1 must preserve.

## Verified canonical seams

| Surface | Canonical path | Blob SHA | I1 ruling |
|---|---|---|---|
| Relational Practice Ledger | `database/migrations/20260120000001_relational_ledger.sql` | `14e0d7cf52c8b2d93f938bb3d83eb2dae62493d2` | Practice stewardship only; do not overload with epistemic joins. |
| Wisdom Graph foundation | `database/migrations/20260214100001_wisdom_graph_foundation.sql` | `a60190bc12560b2d294bee9873ef62105d18cecd` | Endpoint/event substrate only; graph structure is not warrant authority. |
| Member Memory Atoms | `database/migrations/20260521000001_member_memory_atoms.sql` | `4c15e3a08f3125b22f88416046e26db92ab0acc6` | `crossing_allowed = FALSE` remains closed. |
| Living Constellation types | `lib/maia/living-constellation/types.ts` | `8d5142428c617afdcf39ebd923c89531d4b5d69e` | Display projection types; no persistence authority. |
| Living Constellation projection | `lib/maia/living-constellation/projection.ts` | `dec478bf3d89ce38bebd027419eb9b46570adecb` | Read-only projection; no semantic-edge authority. |
| Append-only standing pattern | `scripts/research/structural-standing/claim-standing.ts` | `f7b3e9e652f18bec3f65ff4b468da369671da4ea` | Pattern donor for immutable evidence + succession acts. |
| JARVIS epistemic CI ledger | `.ain/epistemic-ledger.jsonl` | `e06fa7c7eac852563126c5b87a883228199a3e0e` | Build/claim CI only; not runtime member semantic memory. |

## Findings

### S1 — No current canonical surface should be repurposed wholesale

The repository already separates:

- practitioner stewardship;
- wisdom retrieval/graph events;
- member-kept memory;
- read-only constellation projection;
- CI epistemic claim admission.

Conflating any of these with semantic-join standing would erase existing authority boundaries.

### S2 — The write boundary belongs before downstream representation

Living Constellation explicitly refuses semantic-line meaning.

Member Memory Atoms explicitly refuse cross-layer higher-order claims without member ratification.

Therefore a semantic relation must be admitted before either downstream surface can lawfully consume it as standing-bearing knowledge.

### S3 — Append-only standing already has a repository precedent

`claim-standing.ts` derives present state from immutable evidence and append-only acts.

That pattern is compatible with ACT 11 corrigibility:

- weaken;
- revise;
- supersede;
- discharge;

without erasing history.

### S4 — Wisdom Graph is not enough

Wisdom Graph nodes/events can supply endpoints or relied-upon support, but:

- retrieval frequency;
- node co-presence;
- clustering;
- waiting score;
- topology;
- member labels

do not by themselves establish a semantic relation between arbitrary objects.

### S5 — Relational Practice Ledger is the wrong ontology

Its "relationship" is a bounded human/practice container, not a semantic proposition.

Using it for semantic joins would overload person/container stewardship with epistemic inference.

## Architectural conclusion

Create a dedicated **Epistemic Join admission layer** whose job is only to:

1. receive a proposed semantic relation;
2. preserve endpoint/join authorship and provenance;
3. evaluate warrant/jurisdiction/boundaries;
4. cap standing;
5. preserve append-only standing/adoption acts;
6. expose a read model to separately authorized downstream consumers.

The layer is constitutional middleware, not a new global graph and not a new source of human meaning.
