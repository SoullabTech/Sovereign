# HOUSE-CABIN-CONTEXT-SPINE-01 · H2 — Cabin Boundary Census
## 2026-09-30

## Purpose

Determine whether the proposed Local Cabin Context Package can be built as a
new context layer now, or whether canonical Soullab already contains the
lawful sources that a Cabin should project.

## Finding

**Do not create `lib/context/`, a new ContextEnvelope store, a TransitionContext
table, or a generic QuestionContext table at this boundary.**

The repository already contains canonical sources for several parts of the
proposed spine, but they do not share one vocabulary or one persistence law.
The Cabin should therefore be a **portable projection of existing governed
objects**, not a second canonical memory/context system.

The smallest sufficient architecture is:

```
canonical member-owned sources
        ↓
bounded, permission-checked projection
        ↓
Local Cabin package
        ↓
offline Cabin experience
```

The package is downstream. It is not the source of truth.

---

## 1. Work — canonical source exists

The Work is already represented by `living_works` plus
`living_work_expressions`.

The House and Writer's Studio already establish the governing rule:

- a Work is member-owned;
- a Work may declare multiple manuscripts;
- a member's explicit Work choice may travel across a threshold;
- manuscript identity is resolved from the Work's own declarations;
- movement does not persist a navigation event.

**Cabin consequence:** export a Work reference/projection, not a duplicate
Work object.

The projection may include:
- Work id;
- title/form/stage/status where canonically exposed;
- declared expression references;
- explicit manuscript selections only when the member has made them.

It must not manufacture a `currentWork` field.

---

## 2. Relationship — canonical source exists, but its context is bounded

Canonical relationship state lives in `member_relationships`,
`relationship_field_state`, and `relationship_entries`.

The existing relational context service already establishes an important law:

> explicit relationship handoff is the primary path.

Ambient recent-thread fallback is separately gated and disabled by default in
the V1 bridge.

The relationship loader returns bounded relational context rather than the
entire relationship record.

**Cabin consequence:** a Cabin package may contain an explicitly authorized
relationship reference and bounded context, but must not become a mirror of
the member's entire relationship database.

No participant dump. No ambient relationship discovery.

---

## 3. Memory — canonical source exists and already has a permission membrane

The principal member memory source is `member_memory_atoms`.

The loader is structurally constrained by:
- member ownership;
- `memory_scope`;
- team/client/encounter scope;
- status;
- `return_preference`;
- sacred-protected exclusion;
- member rejection;
- practitioner attribution.

The existing memory contract system and return-preference vocabulary already
distinguish memory that may remain private from memory that may return through
a contextual doorway.

**Cabin consequence:** the Cabin package should carry **references plus
permission metadata**, not indiscriminately copy all memory.

A memory item becomes Cabin-eligible because an existing canonical permission
says it may travel, not because the Cabin exporter thinks it is relevant.

---

## 4. Question — no single canonical durable object yet

The repository contains many question-shaped surfaces:

- editorial questions;
- change questions;
- field/open questions;
- inquiry protocols;
- manuscript questions;
- MAIA questions.

But there is no single canonical member-owned `QuestionContext` source that
can lawfully be treated as the universal "living question."

The existing field pulse can surface member-authored open questions, but that
does not establish a cross-product durable Question object.

**Cabin consequence:** do not invent a generic Question table merely to make
the five-object diagram symmetrical.

A future Question spine needs its own census and authority decision.

Until then, questions may be carried only through their existing governed
source.

---

## 5. Transition — explicitly not canonical yet

The repository contains `memory_transition_records`, but those records
describe **memory selection/accountability transitions**, not the member's
life transition from one state to another.

They must not be repurposed as:

```
TransitionContext {
  from_state
  to_state
  catalyst
  meaning
  current_status
}
```

The repository's own accounting currently states that no temporal assertion
or transition schema/runtime exists yet.

**Cabin consequence:** TransitionContext remains a conceptual future slot, not
a persistence primitive.

This is precisely where a new store would otherwise create stealth memory.

---

# Permission Membrane

The proposed five-level membrane remains a useful design intuition, but the
implementation should not create a parallel permission vocabulary.

Existing authority must be composed:

```
Facet crossing authority
        +
memory scope
        +
memory return preference
        +
relationship explicit handoff
        +
member-owned Work declaration
        ↓
Cabin eligibility
```

No object becomes Cabin-eligible merely because it is technically readable.

---

# Cabin Package Shape — candidate, not implementation

The smallest lawful package is therefore closer to:

```ts
CabinPackage {
  packageVersion
  memberScope
  generatedAt
  works: WorkReference[]
  relationships: RelationshipReference[]
  memories: MemoryReference[]
  questions: GovernedQuestionReference[]
  transitions: GovernedTransitionReference[]
}
```

But the last two collections must remain empty/unsupported until their
canonical source contracts exist.

The package must also carry provenance and permission basis for every included
reference.

It must be possible to answer:

> Why is this item in my Cabin?

without answering:

> Because the system thought it was relevant.

---

# Critical non-authorizations

Do not build:

- `lib/context/` as a parallel canonical layer;
- `currentWork` browser/session state;
- automatic question extraction into a durable object;
- inferred life transitions;
- ambient relationship harvesting;
- indiscriminate memory export;
- MAIA cognition changes;
- Grokker ingestion;
- a database migration;
- a cloud sync service;
- a second permission system.

---

# H2 next boundary

The smallest lawful implementation act is **not yet the Cabin exporter**.

It is:

## H2.1 — Cabin Eligibility Projection

Build a pure, read-only projection over **one already-governed source at a
time**, beginning with Work.

Acceptance:

1. A Work can be projected into a portable reference.
2. Its declared manuscripts remain references, not copied identity.
3. No navigation state is persisted.
4. No question or transition is invented.
5. Every projected item has a provenance/permission basis.
6. The projection is deterministic.
7. The projection can be serialized without requiring the online app to
   remain running.

Then add Relationship and Memory as separately governed projection acts.

Question and Transition remain closed until their own canonical contracts are
opened.

**Status:** H2 archaeology complete · H2.1 BUILD not yet opened.
