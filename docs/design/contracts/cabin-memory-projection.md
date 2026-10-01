---
room: Cabin Memory Projection
human_activity: carrying member-owned memory into the local Cabin while preserving the difference between keeping, storage, and recall

surfaces:
  - lib/cabin/memoryProjection.ts
  - lib/cabin/__tests__/memoryProjection.test.ts

change_class: architecture

principles:
  - MEMORY_CONSENT — storage and recall are distinct permissions
  - RIGHT_TO_REMAIN_UNPOSSESSED — a member rejection releases a third-party observation
  - PROVENANCE — source identity and permission basis travel with the reference
  - NO_STEALTH_MEMORY — no generated relevance or synthesis becomes durable context
  - PROJECTION_NOT_COLLAPSE — the Cabin reference does not become a second memory authority

reference_surfaces:
  - lib/maia/memoryAtomsLoader.ts
  - lib/psyche/types.ts
  - docs/design/contracts/memory-consent.md
  - docs/canon/MAIA_MEMORY_CANON_v1.0.md

shared_with_house: member ownership, provenance, explicit authority, consent distinctions, and truthful standing
distinct_to_room: this contract governs only the portable memory reference; it does not localize memory storage, change MAIA prompt assembly, or define a new memory ontology

experience_verification: >-
  H2.3 is a pure projection boundary. Twelve focused tests cover scope
  containment, rejected/unconfirmed practitioner observations, explicit
  confirmation, recall standing, protected memory, identity leakage,
  non-synthesis, provenance, source immutability, determinism, and JSON
  portability.
---

# Cabin Memory Projection — Architecture Contract

## What this surface is for

The Cabin may carry the member's own memory field without pretending that every
stored memory is automatically available to MAIA.

The central distinction is:

> **A memory can remain in the member's Cabin while its recall standing remains
> restricted.**

## Package eligibility

The projection admits:

- personal-scope memory;
- member-kept material;
- practitioner observations only after an explicit member confirmation or
  modification;
- non-rejected material;
- source records whose reverberation guard still forbids crossing.

## Recall standing

The projection carries, rather than infers, the existing return preference:

- member_pulled;
- contextual_doorway;
- ritual_review_opt_in.

Status can further block recall for:

- set_aside;
- protected;
- archived.

A sacred-protected register also blocks recall.

## It carries

- atom id;
- source type/id;
- member-given title;
- spontaneous member-authored body;
- member-assigned registers;
- member-selected lenses;
- status;
- return preference;
- kept-at provenance;
- permission basis;
- recall standing.

## It does not carry

- member id;
- session/browser identity;
- facilitator identity;
- practitioner claim text;
- generated relevance;
- ranking;
- inferred meaning;
- cross-atom synthesis.

## Why storage and recall are separate

The existing memory contract explicitly distinguishes keeping material from allowing
it to return. H2.3 preserves that distinction inside the Cabin rather than
turning the Cabin into an automatic MAIA prompt.

## Stop boundary

H2.3 adds no migration, no local memory write path, no MAIA prompt change, no
UI, no relationship projection, and no Grokker ingestion.
