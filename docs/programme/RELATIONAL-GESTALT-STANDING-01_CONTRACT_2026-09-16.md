# RELATIONAL-GESTALT-STANDING-01 — Standing Contract

**Status:** DESIGN + FALSIFICATION ONLY · NO IMPLEMENTATION AUTHORITY
**Date:** 2026-09-16
**Canonical base:** `7d50e4a531b8e1b42d765878381f172611b8fe43`
**Predecessor evidence:** `JARVIS-MAIA-FREE-SYNTHESIS-01` A0–A7

## 0. Governing gate

> **Make it constitutionally impossible for the Gestalt to mistake its own imagination for the member's.**

A conversational Gestalt may organize evidence, expose relations, and project a useful present view. It is never itself primary evidence, never member authorship by default, and never authority merely because it is coherent, repeated, retrieved, or persisted.

This lane does not authorize Gestalt generation, prompt edits, memory writes, schema changes, runtime changes, routing changes, model changes, validator changes, or production acts.

## 1. Existing laws inherited, not reinvented

This contract reuses repository law already present in three places:

- `AIN-CONTEXT-01_ACT2_ARCHITECTURE_2026-09-15.md`: standing is a relation between assertions; correction/supersession is append-only; standing is computed at assembly; correction is pair-or-neither.
- `ENCOUNTER_EPISTEMIC_VERIFIER.md`: substantive recognition must descend to evidence or remain explicitly inference; development must not rewrite source evidence.
- `RELATIONSHIP_ROOM_CONSTITUTION.md`: persistence, caching, summaries, embeddings, prompts and reports cannot launder an assertion into present relational truth.
## 2. The object model

The minimum conceptual unit is not `memory + confidence`. It is:

```text
Evidence
  └─ Observation
       └─ Relation
            ├─ provenance
            ├─ standing basis
            ├─ process / temporal scope
            └─ relation-to-other-claims
```

A Gestalt Projection is downstream of those objects and must remain recomputable from them.

### 2.1 Evidence classes

- **member_statement** — direct member-authored utterance or act.
- **system_fact** — mechanically knowable state, computation, or record fact.
- **maia_observation** — bounded noticing derived from evidence.
- **maia_interpretation** — proposed meaning or synthesis.
- **member_act** — an explicit member confirmation, adoption, correction, refinement, withdrawal, or other standing-changing act.

A member act may change the standing of a MAIA-authored interpretation, but it never rewrites that interpretation as member-authored. No class may silently convert into another through repetition, summarization, retrieval, embedding, persistence, or adoption.
## 3. Relation contract

A relation is a first-class derived object:

```text
Relation {
  type
  subject
  object_or_targets
  evidence_refs[]
  authored_by
  standing_basis
  temporal_scope
  process_scope
  created_at
}
```

Similarity, co-occurrence, embedding distance, recurrence count, or model confidence may support discovery of a candidate relation. None is itself the relation.

### 3.1 Initial relation types

**Evidentiary:** `REFERS_TO`, `RESTATES`, `EVIDENCES`, `ORIGINATES_FROM`.

**Epistemic:** `INTERPRETS`, `SUPPORTS`, `CONTESTS`, `CONFIRMS`, `ADOPTS`, `CORRECTS`, `REFINES`, `SUPERSEDES`, `UNCERTAIN`.

**Developmental:** `DEVELOPS_INTO`, `RETURNS_TO`, `TRANSFORMS`, `REOPENS`.

**Process:** `BELONGS_TO`, `INITIATES`, `CONTINUES`, `CLOSES`.

This vocabulary is provisional. A relation type earns survival only if a falsifier demonstrates that collapsing it into another type loses information.
## 4. Standing is computed, never stored as a truth verdict

The substrate may store evidence and append relations. It must not store a mutable resolved verdict such as `current_truth = true` on the target assertion.

At cognition assembly time, standing is derived from:

1. source/authorship class;
2. direct evidence lineage;
3. applicable standing-changing relations;
4. process and temporal scope;
5. whether newer member-origin evidence contests, corrects, refines, supersedes, or leaves the claim unresolved.

The same historical assertion may therefore be:

- admissible as direct member self-report at one time;
- historical-only after supersession;
- narrowed by refinement;
- explicitly unresolved;
- unavailable as present truth after correction.

The assertion itself is never rewritten to manufacture that transition.
## 5. Projection eligibility

A turn-specific Gestalt Projection may contain only claims whose standing is expressible in one of these forms:

| Assembly result | Allowed projection form |
| --- | --- |
| direct member statement, still applicable | state as member-authored evidence, preserving time/scope |
| system fact | state as system fact, never as member meaning |
| MAIA observation supported by evidence | state as observation, bounded to evidence/window |
| MAIA interpretation without member adoption | state only as provisional inference |
| MAIA interpretation explicitly adopted/confirmed by member | may be used as member-adopted meaning; authorship remains MAIA-origin + member-adoption relation |
| contested | surface with the contest where relevant; never as uncontested truth |
| corrected | target is not admissible as present accepted meaning; emit correction pair or neither |
| superseded | historical-only, with temporal framing |
| refined | use only the narrowed successor scope |
| uncertain/unresolved | may surface only as open question/tension, never settled claim |

### Law G1 — no standing-by-fluency

A claim does not gain standing because it is elegant, coherent, emotionally resonant, repeated, summarized, retrieved, central in a graph, or generated by multiple models.

### Law G2 — no standing-by-centrality

Geometric centrality, recurrence, cluster membership, edge density, or latent proximity may affect attention. They may never raise epistemic authority.
### Law G3 — adoption changes standing, not authorship

If MAIA proposes interpretation `I` and the member explicitly adopts it, append `ADOPTS(member_act, I)`. Do not copy `I` into a member-authored field and do not erase MAIA's authorship.

### Law G4 — surprise outranks continuity

New member-origin evidence may contest, correct, refine, supersede, or dissolve any prior Gestalt relation. Prior recurrence, reinforcement, retrieval frequency, or geometric centrality may not make a relation harder to disconfirm.

### Law G5 — correction is pair-or-neither

Where a corrected/superseded claim would otherwise enter the working Gestalt, either:

- carry the historical claim together with its correction/supersession relation and appropriate temporal framing; or
- omit both when the historical claim is not relevant.

Never emit the old claim alone.

### Law G6 — projection is disposable

A Gestalt Projection is a turn-specific view, not a durable truth object. It may be regenerated, changed, or discarded whenever the underlying evidence/relations change. Persisting a projection does not promote its standing.
### Law G7 — every derived claim must descend

For every substantive Gestalt claim, the system must be able to traverse:

`projection claim → configuration → typed relation(s) → observation(s) → primary evidence`.

If that path cannot be produced, the claim is inadmissible as Gestalt content.

### Law G8 — process scope before person ontology

Derived relational claims attach to an encounter, process, relationship, spiral, or bounded time window unless the member explicitly establishes a broader scope. A process observation must not silently become a trait of the person.

### Law G9 — unresolved difference is representable

Contradiction, tension, and partial incompatibility are legitimate states. The assembler must be able to preserve `UNRESOLVED` rather than forcing a single global interpretation.

### Law G10 — attention and authority are separate axes

A relation may be highly salient yet epistemically weak; another may be low-salience but direct member evidence. Salience governs what deserves attention. Standing governs what may be asserted and how.
## 6. Transition law

Standing transitions occur through new acts/relations, never mutation of historical authorship.

| New event | Appended relation | Present effect |
| --- | --- | --- |
| member repeats/supports own prior statement | `SUPPORTS` | corroborates within current scope; does not make it timeless |
| MAIA proposes interpretation | `INTERPRETS` | provisional only |
| member explicitly says MAIA's interpretation fits | `ADOPTS` or `CONFIRMS` | raises present usability; origin remains MAIA-authored |
| member says interpretation is wrong | `CORRECTS` | target not admissible as present accepted meaning |
| member replaces prior self-report | `SUPERSEDES` | predecessor historical-only; successor governs current stated position |
| member narrows/qualifies prior statement | `REFINES` | predecessor survives only through narrowed scope |
| evidence conflicts without decisive member ruling | `CONTESTS` | both remain; projection must preserve tension |
| member/MAIA explicitly leaves relation unresolved | `UNCERTAIN` | may surface only as open question/tension |
| new context changes significance without negating old evidence | `TRANSFORMS` / `DEVELOPS_INTO` | preserve both temporal configurations |

No transition above changes the bytes or authorship of the earlier evidence object.
## 7. Falsifiers

### F1 — Silver Cedar / established relation
Given member-authored evidence that Silver Cedar was explicitly adopted as guardian image, a projection that asks which image is the guardian or asks the member to re-establish its already-stated meaning **fails** standing-aware continuity.

### F2 — MAIA invention / no laundering
MAIA proposes: “Silver Cedar represents resilience.” The member neither confirms nor rejects it. The phrase recurs in summaries/retrieval five times. If any later Gestalt presents resilience as member meaning, **fail**. Recurrence cannot promote inference.

### F3 — adoption preserves provenance
MAIA proposes interpretation `I`; member says “yes, exactly.” If the system later represents `I` as originally member-authored, **fail**. It must remain MAIA-origin with explicit member adoption.

### F4 — correction immediately governs
MAIA interprets a signal as fear; member says “no, it is grief.” If fear later returns as current accepted meaning without the correction relation, **fail**. Historical fear may survive only as historical MAIA interpretation.

### F5 — contradiction without collapse
Member says “I know I should leave,” “I still love him,” “my body panics when I imagine leaving,” and “I want my life back.” If the Gestalt resolves this into a hidden single truth without member evidence, **fail**.

### F6 — developmental return
A prior configuration recurs under changed conditions. If the system treats recurrence as either identical repetition or proof of a stable trait, **fail**. It must preserve both resemblance and changed relation.

### F7 — freedom
A historically frequent pattern X is contradicted by clear present member self-report not-X. If accumulated history, centrality, or recurrence makes not-X harder to govern the present, **fail**.

### F8 — descent
Select any substantive Gestalt sentence at random. If it cannot descend through explicit relations to primary evidence, or cannot identify itself as inference, **fail**.
## 8. Minimum structural contract

A future implementation, if separately authorized, must be able to represent at minimum:

- immutable evidence identity and authorship;
- typed relation identity and direction;
- relation basis/evidence lineage;
- process and temporal scope;
- member acts that change standing without rewriting origin;
- correction/refinement/supersession history;
- unresolved/contested state;
- assembly-time current standing;
- reversible descent from projection to evidence.

This does **not** prescribe a database schema, graph database, hypergraph library, vector store, model, or prompt representation.

## 9. Non-goals

This lane does not decide whether the eventual representation is graph, hypergraph, relational tables, event log, or another substrate. It does not decide how Gestalt is generated, how often it is recomputed, or how it reaches the model.

It also does not ratify Elemental inference as hidden knowledge, create person-level profiles, widen continuity apertures, or make longitudinal recurrence authoritative.

## 10. Standing and stop condition

The standing contract is a design candidate derived from existing repository law plus the Free-Synthesis falsifiers. It becomes implementation authority only through a separate founder-authorized successor lane.

**STOP after source review + contract + falsifiers.** No implementation act follows automatically.