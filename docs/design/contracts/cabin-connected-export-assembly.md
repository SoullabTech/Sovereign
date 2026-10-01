---
room: Cabin Connected Export Assembly
human_activity: deliberately choosing which existing Work, relationship, and memory references to carry into the local Cabin

surfaces:
  - lib/cabin/connectedExportAssembly.ts
  - lib/cabin/__tests__/connectedExportAssembly.test.ts

change_class: architecture

principles:
  - EXPLICIT_SELECTION — only ids supplied by the member can cross
  - SOURCE_AUTHORITY — connected assembly reads canonical sources; it does not use the local Cabin as a proxy
  - PROJECTION_REUSE — H2.1/H2.2/H2.3 remain the only projection laws
  - WHOLE_SELECTION — one invalid selected item invalidates the entire export
  - NO_INFERENCE — no current/recent/top/relevant selection is invented
  - WRITER_SINGLETON — H3.3 remains the only artifact-writing seam

reference_surfaces:
  - docs/programme/HOUSE-CABIN-CONTEXT-SPINE-01_H2-1_WORK_PROJECTION_CENSUS_2026-09-30.md
  - docs/programme/HOUSE-CABIN-CONTEXT-SPINE-01_H2-2_RELATIONSHIP_PROJECTION_CENSUS_2026-09-30.md
  - docs/programme/HOUSE-CABIN-CONTEXT-SPINE-01_H2-3_MEMORY_ELIGIBILITY_CENSUS_2026-09-30.md
  - docs/design/contracts/cabin-context-export.md

shared_with_house: explicit member choice, local authority, provenance, and refusal to infer a destination from navigation
distinct_to_room: connected-to-Cabin source assembly; this room gathers only what the member explicitly names and returns an in-memory package for H3.3

experience_verification: >-
  The assembly is a read-only connected adapter. It requires explicit Work,
  Relationship, and Memory ids, validates every selected source against the
  authenticated member, reuses the existing projection laws, and returns an
  H2.4 package object without writing an artifact.
---

# Cabin Connected Export Assembly — Architecture Contract

## Selection

The only input is:

    {
      workIds: string[];
      relationshipIds: string[];
      memoryIds: string[];
    }

The arrays are declarative member choices.

An empty array means explicitly none of that source type.

It does not authorize discovery.

## Work

Each selected Work is loaded from the canonical connected living_works /
living_work_expressions source and member-scoped before H2.1 projection.

No manuscript is selected.

## Relationship

Each selected relationship is loaded through the existing Relational Context
Bridge using the explicit relationshipId path.

H2.2 strips the bridge's derived mode, themes, tensions, and continuity signals.

The recent-relationship fallback is never enabled.

## Memory

Each selected atom is read directly from the canonical member_memory_atoms
source rather than the prompt loader.

That distinction is intentional:

- export eligibility is governed by H2.3;
- prompt recall is governed by the narrower ambient-memory policy.

The assembly requires:

- member ownership;
- memory_scope = personal;
- crossing_allowed = false;
- accepted member standing;
- H2.3 projection success.

member_pulled remains representable as non-ambient recall standing.

## Failure law

The assembly validates the complete selection before returning a package.

If any requested id is absent, foreign, invalid, or otherwise ineligible:

**the entire assembly fails.**

No partial package is returned.

## Stop boundary

H3.4 does not add:

- ambient discovery;
- current/recent/top selection;
- relevance ranking;
- memory search;
- relationship fallback;
- synthesis;
- source mutation;
- artifact writing;
- synchronization;
- scheduling;
- UI;
- MAIA cognition;
- Grokker ingestion;
- production deployment.