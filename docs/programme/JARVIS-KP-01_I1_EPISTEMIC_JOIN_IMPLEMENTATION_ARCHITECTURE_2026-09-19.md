# JARVIS-KP-01 · I1 — EPISTEMIC JOIN IMPLEMENTATION ARCHITECTURE

**Programme:** JARVIS-KP-01 — Shared Operational Knowledge Plane  
**Act:** I1 — Epistemic Join Implementation Architecture  
**Date:** 2026-09-19  
**Canonical base:** `17851fbdaeddd649e6a05c180c94ff3fdd335332`  
**Status:** ARCHITECTURE CANDIDATE · NO RUNTIME AUTHORITY  
**Upstream law:** canonical ACT 10, ACT 11, ACT 12, ACT 11A, ACT 12A

> **NO SEMANTIC JOIN WITHOUT A WARRANT.**

---

## 0. Purpose

I1 translates the now-canonical epistemic-join constitution into a bounded implementation architecture without yet implementing persistence, runtime enforcement, prompt behavior, MAIA behavior, graph edges, memory crossing, or deployment.

The design goal is not to create a new "knowledge graph."

It is to introduce one narrow constitutional seam:

> **Any persistent semantic relation must pass through an inspectable epistemic join envelope before any downstream surface may treat that relation as standing-bearing knowledge.**

---

## 1. Existing canonical seams

I1 preserves and reuses existing architecture rather than replacing it.

### 1.1 Relational Practice Ledger — NOT the semantic join store

`database/migrations/20260120000001_relational_ledger.sql`

The Relational Ledger models practitioner containers, people, agreements, sessions, notes, billing, and care tasks.

It is a practice-stewardship ledger.

**Ruling:** do not overload `rl_*` tables with epistemic relation claims.

### 1.2 Wisdom Graph — source/event substrate, not warrant authority

`database/migrations/20260214100001_wisdom_graph_foundation.sql`

The Wisdom Graph is member-scoped, event-first, and preserves member-authored labels.

Its nodes and events may later be referenced by an epistemic join, but graph co-presence, repeated retrieval, computed clustering, source count, waiting score, proximity, or label similarity do not create relation standing.

**Ruling:** do not treat a Wisdom Graph edge or cluster as a warrant merely because it exists.

### 1.3 Member Memory Atoms — crossing remains closed

`database/migrations/20260521000001_member_memory_atoms.sql`

Canonical law currently enforces:

`crossing_allowed = FALSE`

Material may not be crossed into higher-order claims without explicit member ratification.

**Ruling:** I1 does not lift, bypass, mutate, or reinterpret this constraint.

### 1.4 Living Constellation — read-only projection remains read-only

`lib/maia/living-constellation/projection.ts` and `types.ts`

The current projection explicitly states that its lines/location are not semantic or psychological relationships and that the projection has no write authority.

**Ruling:** Living Constellation receives no semantic-edge creation authority in I1.

### 1.5 Existing append-only standing pattern

`scripts/research/structural-standing/claim-standing.ts`

The repository already uses append-only succession acts to derive present standing without allowing mutable fields to mint authority.

**Ruling:** semantic join standing should follow this pattern: immutable evidence + append-only standing acts + derived current state.

### 1.6 JARVIS epistemic CI ledger is CI authority only

`.ain/epistemic-ledger.jsonl`

This ledger governs JARVIS build/claim admission.

**Ruling:** do not repurpose it as member/runtime semantic memory.

---

## 2. Proposed bounded runtime architecture

### 2.1 Package boundary

Future implementation should live under one dedicated module boundary:

`lib/ain/epistemic-join/`

No runtime implementation is authorized in I1.

Candidate internal seams:

- `types.ts` — closed constitutional types;
- `evaluate.ts` — pure admission evaluator;
- `standing.ts` — append-only standing resolution;
- `composite.ts` — composite-warrant validation;
- `adoption.ts` — component-scoped adoption;
- `projection.ts` — read model only after standing admission;
- `store.ts` — later persistence adapter, initially absent/closed.

This module is a constitutional boundary, not a second ontology.

---

## 3. Epistemic Join Envelope

A persistent join candidate must be a first-class object.

Minimum conceptual fields:

### 3.1 Identity

- join id;
- member scope;
- exact endpoint refs;
- exact relation proposition;
- relation predicate;
- directionality;
- semantic components where mixed jurisdiction exists.

### 3.2 Authorship

- proposer/author;
- authority role used for the act;
- member/practitioner/MAIA/JARVIS distinction;
- adoption history kept separate from original authorship.

### 3.3 Provenance

- endpoint provenance refs;
- join creation provenance;
- warrant provenance;
- relied-upon support refs;
- reference-only refs kept separate from reliance refs.

### 3.4 Warrant

- warrant class;
- warrant proposition;
- warrant author/authority;
- support set;
- composition method when composite;
- dependence/independence assumptions;
- licensed relation semantics;
- jurisdiction;
- uncertainty;
- operative boundaries;
- invalidity conditions.

### 3.5 Standing

Closed standing vocabulary remains compatible with ACT 11:

- NONE / UNASSERTED;
- CANDIDATE / UNESTABLISHED;
- PROVISIONAL;
- WARRANTED;
- PROMOTED;
- DISCHARGED;
- SUPERSEDED.

A join record does not mint its own standing.

Current standing is derived from append-only standing acts.

---

## 4. Authority separation

### 4.1 Proposal authority

MAIA/JARVIS may create a proposal only at a standing permitted by the available warrant.

Fluency, confidence, repeated retrieval, co-occurrence, source prestige, embedding similarity, graph proximity, or user desire for synthesis may not raise standing.

### 4.2 Member authority

The member remains authoritative over lived experience, personal meaning, values, preferences, personal interpretations, and their own intentions.

Member adoption may raise standing only for semantic components inside that authority.

Adoption does not establish another person's motive, external causation, diagnosis, science, history, metaphysics, or universal law.

### 4.3 Practitioner authority

Practitioner interpretation remains practitioner-authored and jurisdiction-bounded.

Member resonance does not retroactively rewrite the original practitioner authorship.

### 4.4 Evidence authority

Evidence can license standing but cannot automatically force representation or downstream use.

This mirrors the canonical Claim State Authority distinction:

> evidence determines what standing is warranted; separate authorized acts decide what may be represented.

---

## 5. Admission pipeline

Future implementation must preserve this order:

`PROPOSE`
→ `NORMALIZE ENVELOPE`
→ `VALIDATE AUTHORSHIP + PROVENANCE`
→ `VALIDATE JURISDICTION`
→ `VALIDATE WARRANT`
→ `CAP RELATION SEMANTICS`
→ `CAP STANDING`
→ `RECORD IMMUTABLE JOIN CANDIDATE`
→ `RECORD APPEND-ONLY STANDING ACT`
→ `DERIVE READ MODEL`

No downstream surface may skip from endpoints directly to a promoted relation.

---

## 6. Composite-warrant architecture

A support set is not itself a warrant.

Future composite validation must require:

- declared composite proposition;
- composite author/authority;
- explicit relied-upon support set;
- composition method;
- dependence assumptions;
- jurisdiction;
- uncertainty;
- invalidity conditions;
- relation semantics licensed;
- standing ceiling.

A composite may be valid while still remaining provisional.

Nested composite warrants must carry upstream standing and boundaries.

Circular support, pseudo-independence, prestige aggregation, and relabeling a bundle as "composite" are refusals.

---

## 7. Mixed propositions and adoption

Implementation may not depend on an LLM silently "understanding" scope.

The architecture must represent component scope explicitly when standing or jurisdiction differs.

A candidate may contain multiple semantic components, each with:

- component id;
- proposition;
- authorship;
- jurisdiction;
- standing;
- warrant reference.

An adoption act identifies the exact component ids adopted.

Whole-sentence confirmation cannot automatically promote all components.

This is a data/authority requirement; the method used to identify components requires separate evidence.

---

## 8. Persistence model — design only

A later migration may introduce dedicated member-scoped epistemic tables.

Conceptually:

- immutable join records;
- immutable warrant records;
- typed support/reliance records;
- append-only standing acts;
- append-only adoption acts;
- derived current-standing view.

I1 does **not** authorize exact SQL, table names, migration, or database writes.

Required properties for any later schema:

- member scoped;
- append-only evidence and acts;
- no mutable current-standing authority field;
- no cascade from endpoint trust to edge standing;
- no cross-member joins;
- no Sanctuary/protected-memory crossing;
- source objects remain source objects;
- relation discharge does not delete endpoints or history;
- provenance remains recoverable;
- hard separation of reference and reliance;
- role/jurisdiction preserved even when the same human occupies multiple roles.

---

## 9. Downstream projections

### Living Constellation

May later display a relation only after a separately authorized projection act.

I1 grants no write or display authority.

### Wisdom Graph

May supply endpoint refs and support refs.

It may not infer warranted relations from co-occurrence or topology alone.

### Member Memory

No automatic creation of memory atoms from joins.

No lifting of `crossing_allowed = FALSE`.

### MAIA prompt/context

No join may enter model context as established fact merely because it was generated.

Any future context adapter must carry standing, authorship, jurisdiction, and boundary metadata.

### Practitioner surfaces

Practitioner-authored interpretation must remain visibly practitioner-authored.

Private practitioner material must never silently become member memory or member-authored truth.

---

## 10. Failure posture

The runtime evaluator must fail closed for standing elevation.

If required join metadata is missing:

- do not create WARRANTED or PROMOTED standing;
- do not infer missing authorship;
- do not infer missing jurisdiction;
- do not infer source independence;
- do not treat lack of evidence as a negative relation fact.

A lower-standing hypothesis may remain useful if its provenance and standing are explicit.

---

## 11. Observability

Future observability may record structural outcomes only, for example:

- candidate count;
- admitted/refused counts by reason;
- standing transition counts;
- composite-warrant refusal classes;
- adoption-scope refusal classes.

No production observability is authorized in I1.

Observability must not log protected content or private member/practitioner proposition text by default.

---

## 12. Deployment path

The programme proceeds only through separately evidenced gates.

### I1 — Implementation Architecture
Document and falsify the architecture. **Current act.**

### I2 — Pure Constitutional Evaluator
Implement closed TypeScript types and pure in-memory evaluator/standing resolution.
No DB, no MAIA behavior, no member data, no production.

### I3 — Persistence Candidate
Add dedicated append-only persistence behind a default-OFF feature flag.
Migrations must be reversible/constructible on empty DB.
No projection/behavioral use.

### I4 — Integration Shadow
Wire real proposal paths to evaluate in shadow only.
No join affects response, memory, routing, or projection.
Structural telemetry only.

### I5 — Founder Production Shadow
Founder-only production evidence.
Compare evaluator decisions to manually adjudicated cases.
No behavioral authority.

### I6 — Bounded Runtime Admission
Permit only explicitly authorized low-risk join classes.
No automatic PROMOTED standing.
No Living Constellation semantic edges unless separately authorized.

### I7 — Production Deployment
Activate the proven admission boundary after exact production witness.
Deployment must retain kill switch, rollback path, auditability, and standing/provenance readback.

Every gate may fail.

---

## 13. I1 prohibited actions

I1 does not authorize:

- code implementation;
- schema/migration;
- DB writes;
- graph edges;
- member-memory mutation;
- lifting `crossing_allowed`;
- prompt changes;
- MAIA behavior changes;
- automatic claim synthesis;
- automatic member adoption;
- runtime routing changes;
- provider/model changes;
- Living Constellation semantic lines;
- production shadow;
- deployment.

---

## 14. I1 disposition criterion

I1 may be accepted only if the architecture:

1. has one clear semantic-join admission seam;
2. does not overload Relational Practice Ledger;
3. does not convert Wisdom Graph structure into warrant;
4. preserves memory crossing closure;
5. preserves Living Constellation read-only authority;
6. derives standing from evidence/acts rather than mutable assertion;
7. represents composite warrant requirements;
8. represents component-scoped adoption;
9. preserves reference/reliance;
10. permits lower-standing hypotheses without hidden promotion;
11. exposes a bounded path through shadow evidence to deployment;
12. requires no mechanism-specific assumption to satisfy ACT 10–12A.

If any requirement fails, implementation must not begin.
