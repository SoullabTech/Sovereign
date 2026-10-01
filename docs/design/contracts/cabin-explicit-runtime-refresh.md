---
room: Explicit Cabin Runtime Refresh
human_activity: deliberately activating a previously placed Cabin continuity artifact for the current local runtime

surfaces:
  - app/api/cabin/context/refresh/route.ts
  - app/api/cabin/context/refresh/__tests__/route.test.ts

change_class: architecture

principles:
  - EXPLICIT_ACTIVATION — refresh occurs only because the member invokes it
  - LOCAL_ONLY — connected Soullab cannot trigger this route
  - EPHEMERAL_MOUNT — refresh changes process-local runtime state, not source state
  - ARTIFACT_AUTHORITY — H2.5 validates the already placed artifact
  - NO_WRITER — refresh never writes the package
  - NO_CONTENT_RETURN — browser receives runtime state, not package contents
  - NO_JARVIS_AUTHORITY — JARVIS remains outside the activation act

reference_surfaces:
  - docs/design/contracts/cabin-context-mount.md
  - docs/design/contracts/cabin-context-export.md
  - docs/design/contracts/cabin-explicit-local-placement.md
  - docs/design/contracts/jarvis-cabin-context-awareness.md

shared_with_house: explicit threshold crossing, truthful state, and separation of artifact custody from experience activation
distinct_to_room: this is the local runtime activation seam; it does not create source state, persistence, or cognitive context
---

# Explicit Cabin Runtime Refresh — Architecture Contract

## Activation membrane

    placed artifact
          ↓
    explicit refresh act
          ↓
    H2.5 strict custody
          ↓
    ephemeral Cabin mount

## What crosses the HTTP boundary

Only:

- refreshed: boolean;
- context state: `empty` or `mounted`;
- package path metadata if already exposed by the runtime state.

No Work, Relationship, Memory, member identity, or package body crosses.

## Failure

If H2.5 rejects the artifact, the route returns a generic 503 and leaves no
mounted context. The artifact remains untouched.

## No automatic behavior

H3.8 placement does not call this route.

There is no watcher, timer, startup hook, JARVIS trigger, or background refresh.
