# HOUSE-CABIN-CONTEXT-SPINE-01 · H2.1 — Work Projection Census

## Gate question

Can an already-governed Living Work cross into a portable Cabin package as a
reference without creating a second Work authority?

## Existing authority

The Cabin local authority already stores the canonical Work shape:

- `living_works`
- `living_work_expressions`
- member ownership on the Work
- member ownership validation on manuscript declarations.

The local store therefore remains the source. H2.1 adds only a read-only
projection.

## Projection law

The Work projection MUST:

1. verify that the supplied Work belongs to the requested member scope;
2. preserve the Work's canonical id;
3. preserve only bounded Work metadata needed for orientation;
4. preserve every declared expression as a reference;
5. preserve multiple manuscript declarations without selecting one;
6. attach source provenance;
7. attach the member-ownership permission basis;
8. contain no member id in the portable reference;
9. contain no `currentWork`, `lastWork`, or navigation state;
10. be deterministic and JSON-serializable;
11. never mutate the source Work.

## Deliberately excluded

The projection does not contain:

- manuscript body or section text;
- inferred current manuscript;
- question extraction;
- relationship state;
- memory;
- MAIA interpretation;
- generated timestamps;
- browser/session state.

A manuscript remains a reference through its expression id. The Cabin resolves
the manuscript through its own local authority when it needs the manuscript.

## Falsifiers

### F1 — Ownership confusion

**Defeat candidate:** accept a Work whose `memberId` differs from the
requested member scope.

**Death:** the projection returns a reference.

### F2 — First-expression collapse

**Defeat candidate:** project only the first expression.

**Death:** a Work declaring manuscripts A and B produces only A.

### F3 — Identity leakage

**Defeat candidate:** include `memberId`, session id, or browser state.

**Death:** the portable JSON contains any of those fields.

### F4 — Meaning inflation

**Defeat candidate:** include manuscript body, section content, memory,
question, relationship, or MAIA interpretation.

**Death:** any such material appears in the projection.

### F5 — Hidden current Work

**Defeat candidate:** emit `currentWork`, `lastWork`, or an inferred
selection.

**Death:** any navigation-state field appears.

### F6 — Nondeterminism

**Defeat candidate:** add `generatedAt`, random ids, or unordered source
serialization.

**Death:** identical source inputs produce different projections.

### F7 — Source mutation

**Defeat candidate:** normalize or rewrite the supplied Work object.

**Death:** the input object changes after projection.

## Acceptance

H2.1 passes only when all seven falsifiers are defeated by tests and the
projection can be serialized as ordinary JSON without the online runtime.

## Implementation witness

Implemented as:

- `lib/cabin/workProjection.ts`
- `lib/cabin/__tests__/workProjection.test.ts`
- `docs/design/contracts/cabin-work-projection.md`

The projection is pure and read-only. It accepts a canonical `CabinWork`
plus an expected member scope and returns either the portable reference or
`null` when ownership does not match.

### Falsifier result

- F1 ownership confusion — **DEFEATED**
- F2 first-expression collapse — **DEFEATED**
- F3 identity leakage — **DEFEATED**
- F4 meaning inflation — **DEFEATED**
- F5 hidden current Work/manuscript — **DEFEATED**
- F6 missing provenance/permission basis — **DEFEATED**
- F7 nondeterminism/source mutation — **DEFEATED**

Focused projection suite: **10/10 PASS**.

Real local-authority witness:
- `maia-desktop/test/cabin-work-projection.test.mjs` — **1/1 PASS**.
- The witness creates one real local Work, two member-owned manuscripts, two
  declarations, reads the Work back through `CabinLocalStore`, projects it,
  and verifies both manuscript references survive with no current-manuscript
  selection.

The broader Cabin suite, run from `maia-desktop/`, is **37/37 PASS** before
the added one-test H2.1 witness; the added witness is separately **1/1 PASS**.
This includes the local Work ownership, multi-Work manuscript declaration,
restart durability, Cabin runtime, packaging, and offline-boundary witnesses.

Project typecheck remains at **223 errors against a 239-error baseline** and
fails only on the pre-existing unrelated new diagnostic
`lib/stripe/config.ts:23`. No H2.1 diagnostic is reported.

## Standing

**H2.1 IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE.**

No migration, API route, MAIA cognition change, relationship/memory projection,
Grokker ingestion, or Cabin UI change was introduced.
