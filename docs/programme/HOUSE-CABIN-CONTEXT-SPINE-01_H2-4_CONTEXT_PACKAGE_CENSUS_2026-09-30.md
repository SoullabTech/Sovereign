# HOUSE-CABIN-CONTEXT-SPINE-01 · H2.4 — Local Cabin Context Package Census

## Gate question

Can the Work, Relationship, and Memory projections travel together as one
portable package without creating a universal context object or a second
authority?

## Ruling

Yes, but only as a **composition envelope**.

H2.4 does not create:

- a new database object;
- a context provider;
- a member profile;
- currentWork/currentQuestion/currentRelationship state;
- a universal graph;
- a new permission system.

It composes the three already-governed projection types.

## Package shape

```ts
CabinContextPackage {
  schema
  scope: "member"
  works: CabinWorkProjection[]
  relationships: CabinRelationshipProjection[]
  memories: CabinMemoryProjection[]
}
```

Question and Transition are intentionally absent because their canonical
cross-product contracts are not yet open.

Their absence is not an empty placeholder to be populated by inference.

## Composition law

The package MUST:

1. accept only already-governed projection objects;
2. preserve each projection's source identity;
3. preserve each projection's permission basis;
4. preserve each memory's recall standing;
5. contain no member id;
6. contain no navigation state;
7. contain no generated timestamp;
8. contain no question or transition inference;
9. remain ordinary JSON;
10. remain deterministic;
11. avoid changing any source projection;
12. allow an empty package.

An empty package is valid. It means there is currently nothing eligible to
carry, not that the member has no life or work.

## Falsifiers

### F1 — second authority

**Defeat candidate:** package creates its own Work/Relationship/Memory identity.

**Death:** package fields diverge from the supplied projections.

### F2 — identity leakage

**Defeat candidate:** package includes member id, session id, browser state.

**Death:** serialized package contains them.

### F3 — permission collapse

**Defeat candidate:** package strips item-level permission or recall standing.

**Death:** any item loses its permission basis or memory recall standing.

### F4 — question invention

**Defeat candidate:** package invents a QuestionContext from titles, memory,
or relationships.

**Death:** question fields appear without a governed Question projection.

### F5 — transition invention

**Defeat candidate:** package infers a life/work transition from timestamps or
status.

**Death:** transition fields appear without a governed Transition projection.

### F6 — universal graph collapse

**Defeat candidate:** package creates cross-object edges or semantic
relationships.

**Death:** package introduces generated edges or inferred relationships.

### F7 — nondeterminism

**Defeat candidate:** generated timestamp, random package id, or unstable
serialization.

**Death:** identical projections produce different package JSON.

### F8 — source mutation

**Defeat candidate:** package normalizes or mutates a supplied projection.

**Death:** any source projection changes.

## Acceptance

H2.4 passes when all eight falsifiers are defeated and the package can be
serialized/restored without the online runtime.

## Implementation witness

Implemented as:

- `lib/cabin/contextPackage.ts`
- `lib/cabin/__tests__/contextPackage.test.ts`
- `docs/design/contracts/cabin-context-package.md`

Focused H2.4 suite: **12/12 PASS**.

The package composes the already-governed Work, Relationship, and Memory
references without introducing a new identity layer.

It remains valid when empty, and it does not invent Question or Transition
objects.

The full Cabin Desktop witness population remains **38/38 PASS** and the
combined H2.1/H2.2/H2.3 focused suites remain **32/32 PASS**.

Project typehealth remains at **223 errors against a 239-error baseline** with
the same unrelated Stripe diagnostic at `lib/stripe/config.ts:23`. No H2.4
diagnostic is reported.

**H2.4 IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE.**

**Boundary:** no database, migration, sync protocol, MAIA cognition, Grokker
ingestion, UI, Question object, or Transition object.
