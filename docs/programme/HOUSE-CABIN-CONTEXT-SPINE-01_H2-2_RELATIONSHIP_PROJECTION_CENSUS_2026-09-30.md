# HOUSE-CABIN-CONTEXT-SPINE-01 · H2.2 — Relationship Projection Census

## Gate question

Can an explicitly handed-off relationship become a portable Cabin reference
without carrying inferred relational meaning or private relationship content?

## Existing authority

The canonical Relational Context Bridge is already bounded:

- explicit `relationshipId` handoff is the V1 primary path;
- the recent-thread fallback is disabled unless explicitly enabled;
- the service validates the relationship against the authenticated member;
- returned context is compact and signal-shaped rather than a payload.

The Cabin projection must preserve that boundary rather than exporting the
entire relationship record or the bridge's derived interpretation.

## Projection law

The relationship projection MUST:

1. require an explicit handoff matching the relationship being projected;
2. preserve relationship identity and bounded source facts;
3. attach provenance to `member_relationships`;
4. attach an explicit-handoff permission basis;
5. omit member id from the portable reference;
6. omit participants and relationship notes;
7. omit inferred mode;
8. omit salient themes, tensions, and continuity signals;
9. omit MAIA interpretation;
10. be deterministic and JSON-serializable.

## Why the inferred bridge fields do not cross

`ActiveRelationalContext.mode`, `salientThemes`,
`currentTensions`, and `continuitySignals` are useful for the online MAIA
bridge, but they are not the relationship itself.

They are interpretation/selection signals. Carrying them into a portable
Cabin reference would silently turn an online cognition aperture into durable
context.

The Cabin receives the relationship reference. A later, separately governed
local relational context layer may decide what bounded signals are available.

## Falsifiers

### F1 — implicit relationship authority

**Defeat candidate:** project a relationship without an explicit handoff.

**Death:** any reference is emitted.

### F2 — inferred-context leakage

**Defeat candidate:** copy `mode`, `salientThemes`, `currentTensions`,
or `continuitySignals`.

**Death:** any of those fields appear in the portable reference.

### F3 — private relationship payload

**Defeat candidate:** include participants, notes, entries, or field-state
content.

**Death:** private relational content crosses the projection boundary.

### F4 — identity leakage

**Defeat candidate:** include member id, session id, or browser state.

**Death:** portable JSON contains identity outside the relationship reference.

### F5 — provenance/permission loss

**Defeat candidate:** emit only an id and label.

**Death:** the reference cannot say where it came from or why it is eligible.

### F6 — nondeterminism

**Defeat candidate:** generated timestamp, random projection id, or unordered
serialization.

**Death:** identical source and handoff inputs produce different output.

## Acceptance

H2.2 passes only when all six falsifiers are defeated and the projection can
round-trip through ordinary JSON.

## Implementation witness

Implemented as:

- `lib/cabin/relationshipProjection.ts`
- `lib/cabin/__tests__/relationshipProjection.test.ts`
- `docs/design/contracts/cabin-relationship-projection.md`

Focused projection suite: **8/8 PASS**.

The projection consumes the existing `ActiveRelationalContext` only as a
source of bounded relationship identity. It deliberately discards the bridge's
derived mode, themes, tensions, and continuity signals.

**H2.2 IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE.**

**Boundary:** no local relationship table, no relationship migration, no MAIA
cognition change, no ambient relationship discovery, no UI.
