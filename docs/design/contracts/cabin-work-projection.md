---
room: Cabin Work Projection
human_activity: carrying a member-owned Work into the local Cabin without creating a second Work authority

surfaces:
  - lib/cabin/workProjection.ts
  - lib/cabin/__tests__/workProjection.test.ts

change_class: architecture

principles:
  - MEMBER_AUTHORITY — the member's owned Work remains the source of identity
  - PROVENANCE — a projection says where the reference came from
  - NO_STEALTH_MEMORY — navigation state is not persisted as current/last Work
  - EXPLICIT_CHOICE — multiple manuscripts remain multiple references
  - PROJECTION_NOT_COLLAPSE — the Cabin reference is not a new canonical object

reference_surfaces:
  - docs/programme/HOUSE-CABIN-CONTEXT-SPINE-01_H2-CABIN_BOUNDARY_CENSUS_2026-09-30.md
  - docs/design/contracts/AIN-CABIN-RUNTIME-01.md
  - docs/design/contracts/house-continuity-thresholds.md

shared_with_house: member ownership, explicit authority, provenance, readable source identity, and refusal to infer hidden meaning
distinct_to_room: this contract governs only the read-only Work reference emitted for Cabin portability; it does not govern House navigation, Writer's Studio manuscript resolution, MAIA cognition, or Cabin memory

experience_verification: >-
  H2.1 is a pure projection boundary. No member-facing UI changed and no
  network or database mutation is required to exercise it. Ten focused tests
  cover ownership, multi-expression preservation, identity leakage, meaning
  inflation, hidden current selection, provenance, determinism, source
  immutability, and JSON portability.
---

# Cabin Work Projection — Architecture Contract

## What this surface is for

A Cabin Work projection lets the local Cabin carry the smallest sufficient
reference to a member-owned Living Work.

The source remains `living_works` plus `living_work_expressions`.
The projection is a portable read model.

## It carries

- canonical Work id;
- bounded Work metadata already present in the source;
- every declared expression as a reference;
- source provenance;
- member-ownership permission basis.

## It does not carry

- member id;
- session/browser identity;
- manuscript body or sections;
- a selected manuscript;
- current/last Work state;
- memory;
- questions;
- relationships;
- MAIA interpretation.

## Multiple expressions

A Work with manuscripts A and B carries both references.

The projection never applies first/last/newest/current selection.

## Ownership

The projection requires the caller's member scope and refuses a Work whose
canonical `memberId` does not match that scope.

The portable reference itself does not repeat the member id.

## Portability

The result is ordinary JSON with a versioned schema. No runtime class,
database handle, browser state, or network connection is required.

## Stop boundary

H2.1 introduces no route, migration, persistence table, MAIA input, memory
projection, relationship projection, Grokker ingestion, or UI surface.
