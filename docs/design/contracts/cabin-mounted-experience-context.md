---
room: Cabin Mounted Experience Context
human_activity: making an already mounted Cabin continuity field available to an experience without adding interpretation or another source

surfaces:
  - lib/cabin/experienceContext.ts
  - lib/cabin/__tests__/experienceContext.test.ts

change_class: architecture

principles:
  - MOUNTED_ONLY — experiences read the already mounted Cabin context
  - NO_SECOND_SOURCE — the context package/runtime remains the sole source
  - NO_INTERPRETATION — the bridge does not rank, summarize, infer, or synthesize
  - NO_IDENTITY — member/session identity is resolved by the Cabin experience separately
  - NO_PERSISTENCE — the bridge does not write or mutate the artifact or local store
  - TRUTHFUL_EMPTY — empty mounted context remains empty rather than becoming degraded or inferred
  - SERVER_BOUNDARY — this first bridge is server-side; UI/cognition consumers are separate acts

reference_surfaces:
  - docs/design/contracts/cabin-context-package.md
  - docs/design/contracts/cabin-explicit-runtime-refresh.md
  - docs/programme/HOUSE-CABIN-CONTEXT-SPINE-01_H3-9_EXPLICIT_RUNTIME_REFRESH_2026-10-01.md

shared_with_house: explicit continuity, source authority, and separation of transport from interpretation
distinct_to_room: a stable read-only interface for future Cabin experiences to consume the mounted field

experience_verification: >-
  The bridge returns only the currently mounted package plus explicit availability
  state. It performs no database, network, filesystem, ranking, synthesis, or
  cognition work.
---

# Cabin Mounted Experience Context — Architecture Contract

## Boundary

    mounted Cabin package
           ↓
    experience-context bridge
           ↓
      Cabin experience

The bridge does not call the HTTP context route. It reads the mounted runtime
directly on the server, avoiding an unnecessary loopback request.

## Availability

Each package domain is represented as:

- `present` when one or more governed references exist;
- `empty` when that domain is present in the mounted package but contains no references.

No `relevant`, `current`, `important`, `degraded`, or inferred state is created.

## Stop boundary

H3.10 does not add:

- UI;
- MAIA cognition;
- prompt conditioning;
- memory ranking;
- relationship interpretation;
- Work selection;
- graph synthesis;
- synchronization;
- persistence;
- JARVIS authority;
- production deployment.