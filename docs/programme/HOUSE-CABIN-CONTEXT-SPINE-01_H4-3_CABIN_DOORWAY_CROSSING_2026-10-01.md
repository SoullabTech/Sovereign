# HOUSE-CABIN-CONTEXT-SPINE-01 · H4.3 — Cabin Doorway Crossing

## Ruling

H4.2 established the real Cabin arrival field. H4.3 establishes the narrow
crossing seam between that field and its receiving rooms.

The crossing carries **origin orientation only**:

`from=cabin`

It does not carry semantic content.

## Implementation

Implemented as:

- `lib/cabin/doorway.ts`
- `lib/cabin/__tests__/doorway.test.ts`
- `app/cabin/CabinArrival.tsx` now delegates all four doorway paths to the helper
- `docs/design/contracts/cabin-doorway-crossing.md`

## Canonical doorways

- Work → `/writers-studio?from=cabin`
- Relationships → `/relationships?from=cabin`
- Memory → `/maia/anchor/history?from=cabin`
- MAIA → `/maia/anchor?from=cabin`

No Work, manuscript, relationship, memory, member, session, prompt, or
interpretive id can be emitted by the crossing helper.

## Why this is a separate seam

The destination remains authoritative for:

- its own identity;
- authorization;
- object resolution;
- ambiguity;
- persistence;
- interpretation.

Cabin does not become a parent data authority merely because it opens a room.

The explicit origin marker also avoids `router.back()` as a semantic return
mechanism. A receiving room can later decide, under its own Experience
Contract, whether and how to render **Return to Cabin**.

## Falsifier suite

H4.3 focused tests prove:

- exactly four governed doorways;
- explicit `from=cabin` construction;
- no semantic query payload;
- forbidden object ids are detectable at the receiving seam;
- non-Cabin origins are not treated as Cabin;
- external route construction is rejected.

## Evidence

**25/25 PASS** across:

- H4.3 doorway suite;
- H4.2 Cabin arrival suite;
- mounted experience context suite.

Design Canon: the H4.2 experiential contract continues to govern
`app/cabin/CabinArrival.tsx`; H4.3 is a structural contract for the crossing
helper and its tests.

The destination census is recorded in the H4.3 contract, but no destination
membrane is claimed complete by this act.

## Stop boundary

H4.3 does not implement destination UI.

It does not add:

- Return to Cabin controls inside Writer's Studio;
- Return to Cabin inside Relationships;
- Return to Cabin inside Memory;
- MAIA cognition;
- memory recall;
- relationship interpretation;
- Work selection;
- synchronization;
- persistence;
- JARVIS authority.

## Next act

**H4.4 — destination membrane census and implementation**, one receiving room
at a time.

The receiving room must explicitly recognize `from=cabin`, preserve its own
identity, and provide a quiet exact return to Cabin without importing Cabin
data or becoming a Cabin sub-room.
