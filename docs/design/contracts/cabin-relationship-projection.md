---
room: Cabin Relationship Projection
human_activity: carrying an explicitly chosen relationship doorway into the local Cabin without exporting relational interpretation

surfaces:
  - lib/cabin/relationshipProjection.ts
  - lib/cabin/__tests__/relationshipProjection.test.ts

change_class: architecture

principles:
  - EXPLICIT_AUTHORITY — a relationship crosses only through a member-explicit handoff
  - SIGNAL_NOT_PAYLOAD — relational interpretation does not become portable identity
  - PROVENANCE — the reference retains its canonical source and permission basis
  - NO_STEALTH_MEMORY — no ambient relationship becomes durable Cabin context

reference_surfaces:
  - lib/relationships/relationshipContextService.ts
  - lib/relationships/types.ts
  - docs/design/contracts/memory-consent.md

shared_with_house: explicit member authority, provenance, bounded relational language, and refusal to infer hidden meaning
distinct_to_room: this contract governs only the portable relationship reference; it does not localize relationship storage or alter the online Relational Context Bridge

experience_verification: >-
  H2.2 is a pure projection boundary. No member-facing UI changed and no
  relationship database was copied. Seven focused tests cover explicit
  handoff, inferred-context exclusion, private payload exclusion, identity
  exclusion, provenance/permission, determinism, and refusal to manufacture
  unavailable participants.
---

# Cabin Relationship Projection — Architecture Contract

## What this surface is for

The Cabin may carry the fact that a member explicitly chose a relationship
doorway. It may not silently carry the online bridge's interpretation of that
relationship.

## It carries

- relationship id;
- bounded relationship label;
- realm;
- bond type;
- source provenance;
- explicit-handoff permission basis.

## It does not carry

- member id;
- participants;
- relationship notes or entries;
- field-state prose;
- inferred mode;
- salient themes;
- current tensions;
- continuity signals;
- MAIA interpretation.

## Authority

The online Relational Context Bridge already makes explicit handoff primary and
ambient recent-thread fallback opt-in. H2.2 preserves that boundary.

The projection refuses a missing or mismatched handoff.

## Stop boundary

H2.2 does not add a local relationship table, migration, ambient relationship
discovery, MAIA cognition, UI, or memory projection.
