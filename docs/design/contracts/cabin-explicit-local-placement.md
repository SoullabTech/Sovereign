---
room: Cabin Explicit Local Placement
human_activity: explicitly placing a previously delivered Context Package onto the member's own Cabin device

surfaces:
  - app/api/cabin/context/import/route.ts
  - app/api/cabin/context/import/__tests__/route.test.ts

change_class: architecture

principles:
  - LOCAL_ONLY — this act exists only in offline Cabin mode
  - MEMBER_LOCAL_AUTHORITY — the local Cabin session governs who may place the artifact
  - EXPLICIT_FILE — the member supplies the package file; no server discovery is performed
  - H2_5_CUSTODY — the incoming bytes must parse as the governed Context Package before replacement
  - H3_3_WRITER_SINGLETON — placement uses the existing governed artifact writer
  - TARGET_CUSTODY — the destination is resolved from the local Cabin configuration, never from request input
  - NO_AUTO_REMOUNT — placement does not mutate the running ephemeral mount
  - ATOMIC_REPLACEMENT — existing artifact remains protected if validation or write fails

reference_surfaces:
  - docs/design/contracts/cabin-context-mount.md
  - docs/design/contracts/cabin-context-export.md
  - docs/programme/HOUSE-CABIN-CONTEXT-SPINE-01_H3-7_CONNECTED_CABIN_PACKAGE_DELIVERY_CENSUS_2026-09-30.md

shared_with_house: explicit placement, local identity, bounded package custody, and truthful lifecycle state
distinct_to_room: this is the connected-delivery-to-local-device membrane; it places an artifact but deliberately does not activate the runtime mount

experience_verification: >-
  The route accepts one context-package.json file, validates it before write,
  writes only to the configured local Cabin package path, and reports that a
  fresh runtime/remount is required. It never accepts a destination path.

implementation_witness:
  route_suite: 12/12
  combined_cabin_delivery_suite: 127/127
  design_canon: PASS
---

# Cabin Explicit Local Placement — Architecture Contract

## Pipeline

    member's downloaded package
            ↓
      local Cabin session
            ↓
       H2.5 parse
            ↓
       H3.3 writer
            ↓
   configured local artifact
            ↓
      future runtime mount

## Request law

The request contains exactly one file field:

    context-package

The filename must be `context-package.json`.

The request does not contain:

- member id;
- destination path;
- package contents as JSON fields;
- runtime state;
- remount instruction.

## Target law

The destination comes only from:

`MAIA_CABIN_DATA_PATH` plus the existing `resolveCabinContextPackagePath()` rule.

A client cannot choose an arbitrary filesystem path.

## Lifecycle law

After successful placement:

`artifact = present`

but:

`runtime mount = unchanged`

The route does not call `clearCabinContextMount()` or `initializeCabinContextMount()`.

The member must perform the next explicit runtime lifecycle act.

## Falsifiers

1. offline route accepts connected request → death;
2. unauthenticated local request writes → death;
3. arbitrary destination path is accepted → death;
4. malformed package reaches writer → death;
5. wrong filename or extra form field is accepted → death;
6. writer is bypassed → death;
7. package content/member identity is logged → death;
8. runtime is automatically remounted → death;
9. oversized upload reaches package parser → death;
10. existing artifact is changed after invalid input → death.

## Stop boundary

H3.8 does not add:

- automatic download;
- automatic placement;
- automatic remount;
- synchronization;
- JARVIS authority;
- MAIA cognition;
- Grokker ingestion;
- UI;
- production deployment.