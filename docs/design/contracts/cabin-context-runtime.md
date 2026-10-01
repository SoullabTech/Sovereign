---
room: Cabin Context Runtime
human_activity: bringing an explicitly carried continuity package into the local Cabin so the member's existing worlds can be encountered without creating a second authority

surfaces:
  - maia-desktop/src/main.js
  - maia-desktop/src/cabin-runtime-policy.js
  - lib/cabin/contextRuntime.ts
  - app/api/cabin/context/route.ts
  - app/api/cabin/health/route.ts

change_class: architecture

principles:
  - EXPLICIT_CARRY — Desktop supplies only an explicit package artifact path
  - CUSTODY_FIRST — the Cabin runtime admits only H2.5-validated packages
  - LOCAL_IDENTITY — Cabin identity remains local; Desktop does not inject connected member identity
  - EPHEMERAL_MOUNT — runtime access is a process-local defensive mount, not a second store
  - OFFLINE_ONLY — context is available only in Cabin mode
  - READ_ONLY — the runtime context surface never writes the package artifact or CabinLocalStore

reference_surfaces:
  - docs/design/contracts/cabin-context-package.md
  - docs/design/contracts/cabin-context-mount.md
  - docs/design/contracts/AIN-CABIN-RUNTIME-01.md
  - config/accessMatrix.ts

shared_with_house: explicit member authority, provenance, local identity, and refusal to turn navigation into hidden state
distinct_to_room: this is the Desktop-to-local-runtime transport boundary; it does not define source-domain identity, MAIA cognition, or synchronization

experience_verification: >-
  Authenticated local development witness on 2026-09-30/2026-10-01: offline
  Cabin health returned ready with context empty when no package existed; a
  valid portable package returned context mounted and the exact governed Work
  reference through /api/cabin/context; an invalid package made the health
  witness return HTTP 503. No production runtime was used.
---

# Cabin Context Runtime — Architecture Contract

## The runtime crossing

The Desktop does not construct meaning.

It supplies one explicit package artifact path:

```
Desktop
  ↓
MAIA_CABIN_CONTEXT_PACKAGE_PATH
  ↓
Cabin runtime
  ↓
H2.5 strict parser
  ↓
H3.1 defensive mount
  ↓
read-only context surface
```

## Identity

The portable package contains no member id.

The local Cabin session remains the identity authority for the local runtime.
The context endpoint requires an existing `maia_cabin_session`; it never
mints one merely to expose context.

## Readiness

Cabin health includes context custody in readiness:

- no package artifact → `ready / empty`;
- valid package → `ready / mounted`;
- invalid package → `503 / cabin_context_unavailable`.

This prevents an invalid portable context from silently becoming an apparently
healthy Cabin.

## Access membrane

The two exact API paths are explicitly declared in the access matrix:

- health is public because it contains no member context and is offline-only;
- context is publicly routable through the outer matrix because the matrix
  cannot resolve the local Cabin identity, but the route itself requires an
  existing local Cabin session before returning the package.

This is a deliberate two-stage boundary, not an auth bypass.

## Stop boundary

H3.2 does not add:

- synchronization;
- package writing;
- network retrieval;
- PostgreSQL fallback;
- MAIA prompt conditioning;
- Grokker ingestion;
- Question or Transition;
- current-work state;
- graph synthesis;
- production deployment.
