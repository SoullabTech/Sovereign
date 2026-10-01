# HOUSE-CABIN-CONTEXT-SPINE-01 · H3.4 — Connected Export Assembly Census

## Gate question

Can the connected Soullab platform assemble a Cabin Context Package from
canonical member-owned sources without turning export into ambient capture,
inference, or synchronization?

## Current state

H3.3 can write a package, but it intentionally accepts only already-governed
projections.

That is correct.

The missing bridge is therefore not another writer. It is an **explicit source
assembly act**.

The connected platform must answer:

> Which Work, Relationship, and Memory references is the member deliberately
> carrying into the Cabin?

It must not answer:

> What does the system think the member should carry?

## Source census

### Work

Canonical source:

- living_works;
- living_work_expressions.

Existing House display is not sufficient because it intentionally lists only
the most recently updated Works.

H3.4 therefore requires explicit workIds.

For each supplied Work id:

1. authenticate the member;
2. verify the Work belongs to that member;
3. read its declared expressions;
4. project through H2.1;
5. never choose a manuscript.

### Relationship

Canonical source:

- the existing Relational Context Bridge.

H2.2 already requires an explicit relationship handoff.

H3.4 therefore requires explicit relationshipIds.

For each supplied relationship id:

1. authenticate the member;
2. load the canonical relationship;
3. establish member_explicit handoff;
4. project only bounded relationship identity;
5. never carry inferred mode/themes/tensions/continuity signals.

No ambient "recent relationship" discovery is permitted.

### Memory

Canonical source:

- member_memory_atoms.

This is the difficult source because storage and recall are different.

H3.4 must not reuse the prompt loader as the export source. The prompt loader
is intentionally narrower: it selects only recall-eligible material.

Export needs the H2.3 package-eligibility distinction.

For each supplied memory id:

1. authenticate the member;
2. read the member-owned atom;
3. require personal scope;
4. require member-kept or member-confirmed observation standing;
5. reject member-rejected observations;
6. preserve return preference and recall standing;
7. project through H2.3.

No relevance ranking is performed.

No "top memories" are chosen.

No ambient memory discovery is performed.

## Explicit selection contract

H3.4 input is deliberately declarative:

    ConnectedCabinExportSelection {
      workIds: string[]
      relationshipIds: string[]
      memoryIds: string[]
    }

An empty array means:

> I explicitly chose none of this type.

It does not mean:

> The system should discover something else.

## Falsifiers

### F1 — ambient discovery

**Defeat candidate:** exporter silently selects recent/current Works,
relationships, or memories.

**Death:** output contains an object whose id was not explicitly supplied.

### F2 — ownership confusion

**Defeat candidate:** a supplied id belonging to another member is projected.

**Death:** any foreign object crosses.

### F3 — Work ambiguity collapse

**Defeat candidate:** exporter resolves a manuscript for the member.

**Death:** a manuscript is selected or written into the Work projection.

### F4 — relationship interpretation leakage

**Defeat candidate:** exporter copies bridge interpretation.

**Death:** mode/themes/tensions/continuity signals cross.

### F5 — memory consent collapse

**Defeat candidate:** exporter uses recall eligibility as storage eligibility.

**Death:** member_pulled material is silently omitted, or rejected material
crosses.

### F6 — synthesis

**Defeat candidate:** exporter creates relationships between selected
objects or generates a meaning summary.

**Death:** edges, relevance, synthesis, or inferred questions appear.

### F7 — source mutation

**Defeat candidate:** assembly changes canonical source state.

**Death:** any database write occurs during export assembly.

### F8 — identity leakage

**Defeat candidate:** member id/session identity is copied into the package.

**Death:** portable package contains identity fields.

### F9 — partial selection

**Defeat candidate:** invalid one-item input causes valid selected items to be
silently exported.

**Death:** package is written unless the entire selection validates.

### F10 — writer bypass

**Defeat candidate:** assembly writes JSON directly rather than handing its
projections to H3.3.

**Death:** a second export/write path exists.

## Acceptance

H3.4 passes only when:

- every exported object was explicitly selected;
- every selected object is member-owned and source-authorized;
- Work, Relationship, and Memory laws remain intact;
- the assembly performs no inference or synthesis;
- no canonical source is mutated;
- H3.3 remains the only artifact writer;
- invalid selections fail as a whole;
- an empty selection produces an empty valid package.

## Stop boundary

Do not add:

- ambient export;
- automatic "current" selection;
- relationship discovery;
- memory ranking;
- sync;
- scheduling;
- filesystem watching;
- MAIA cognition;
- Grokker ingestion;
- UI;
- production deployment.

## Implementation witness

Implemented as:

- `lib/cabin/connectedExportAssembly.ts`
- `lib/cabin/__tests__/connectedExportAssembly.test.ts`
- `docs/design/contracts/cabin-connected-export-assembly.md`

The connected assembly:

- accepts only explicit Work, Relationship, and Memory ids;
- validates ids before source access;
- reads canonical connected Work rows member-scoped;
- preserves every declared Work expression;
- loads relationships only through the explicit Relational Context Bridge path;
- never enables the bridge's recent-relationship fallback;
- reads memory atoms directly rather than reusing the narrower prompt loader;
- requires personal scope and H2.3 projection eligibility;
- preserves `member_pulled` as non-ambient recall standing;
- rejects member-rejected observations;
- returns no partial package when any selected item is invalid;
- composes the result through H2.4;
- does not write the artifact — H3.3 remains the sole writer;
- performs no source mutation, network access, synchronization, ranking, or synthesis.

Focused H3.4 suite: **11/11 PASS**.

Combined `lib/cabin/__tests__` suite: **94/94 PASS**.

The suite directly defeats F1–F10, including explicit-selection-only behavior,
multi-manuscript preservation, relationship interpretation stripping, memory
standing preservation, whole-selection failure, identity exclusion, source
immutability, and H3.3 writer singleton.

## Standing

**H3.4 IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE.**

No artifact write path, synchronization, MAIA cognition, Grokker ingestion, UI,
or production deployment is opened by this slice.