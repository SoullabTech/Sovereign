# HOUSE-CABIN-CONTEXT-SPINE-01 · H3.9 — Explicit Cabin Runtime Refresh

## Gate question

Can a member deliberately activate a newly placed Cabin Context Package without making placement itself an activation, without automatic remount, and without exposing package contents to the browser?

## Ruling

Yes. Runtime refresh is a separate local Cabin act.

The explicit sequence is:

    H3.8 placement
          ↓
      artifact present
          ↓
      member chooses Refresh Cabin Context
          ↓
      clear ephemeral mount
          ↓
      H2.5 parse from artifact
          ↓
      new ephemeral mount

The package remains the artifact authority. The runtime mount remains ephemeral.

## Request law

POST `/api/cabin/context/refresh`

The request contains:

- no body;
- no query parameters;
- no destination path;
- no package contents;
- no member id.

Identity comes from the existing local Cabin session boundary.

## Runtime law

The route may call:

1. `clearCabinContextMount()`;
2. `initializeCabinContextMount(dataPath)`.

It may not call the package writer or alter the artifact.

A missing artifact truthfully produces `empty` context.

A valid artifact produces `mounted` context.

An invalid artifact fails closed and returns no package content.

## Falsifiers

F1. connected mode refreshes → death.

F2. cross-origin request refreshes → death.

F3. request body or query changes refresh semantics → death.

F4. refresh writes or deletes the package artifact → death.

F5. refresh returns Work / Relationship / Memory content → death.

F6. refresh silently happens during placement → death.

F7. invalid artifact is mounted → death.

F8. JARVIS receives a privileged refresh IPC channel → death.

## Acceptance

H3.9 passes when an explicit local member act refreshes the ephemeral mount from
the already placed artifact and returns only truthful runtime state.

## Evidence

Focused H3.9 route suite: **12/12 PASS**.

Combined Cabin + H3.7 delivery + H3.8 placement + H3.9 refresh suite:
**139/139 PASS**.

Design canon: **PASS**.

No automatic refresh, UI, JARVIS IPC, sync, watcher, MAIA cognition, Grokker
ingestion, or production deployment is introduced.

**H3.9 IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE.**

## Stop boundary

Runtime refresh is the end of the initial transport/custody spine. The next
boundary is how the mounted context becomes available to a Cabin experience,
not another persistence mechanism.
