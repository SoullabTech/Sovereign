---
room: Cabin Context Export
human_activity: explicitly carrying a governed continuity field out of Soullab as a portable Cabin artifact

surfaces:
  - lib/cabin/contextPackageWriter.ts
  - lib/cabin/__tests__/contextPackageWriter.test.ts

change_class: architecture

principles:
  - EXPLICIT_EXPORT — export occurs only because a caller invokes it
  - PROJECTION_ONLY — the writer accepts already-governed projections and creates no new meaning
  - ATOMIC_CUSTODY — readers never observe a partially written package
  - OWNER_ONLY — the portable artifact is readable only by the local owner
  - NO_SYNC — export is not a watcher, scheduler, network bridge, or runtime refresh
  - AUTHORITY_PRESERVATION — the package remains subordinate to its canonical source domains

reference_surfaces:
  - docs/design/contracts/cabin-context-package.md
  - docs/design/contracts/cabin-context-mount.md
  - docs/design/contracts/cabin-context-runtime.md

shared_with_house: explicit member authorship, provenance, bounded context, and refusal to infer continuity from movement
distinct_to_room: this is the outbound artifact seam from governed projections to a portable file; it does not decide when export should happen or what source projections mean

experience_verification: >-
  Twelve focused tests verify absolute-path discipline, H2.4 validation,
  H3.2 remount compatibility, identity exclusion, determinism, atomic failure
  behavior, authority neutrality, no persistence/network/watcher seams, owner
  permissions, and truthful empty export.
---

# Cabin Context Export — Architecture Contract

## The export crossing

```
governed Work / Relationship / Memory
              ↓
          H2.4 package
              ↓
       explicit export call
              ↓
    context-package.json
```

The writer never discovers source material.

It never asks:

> What else should be carried?

It receives the member's already-authorized projections.

## Atomic custody

The artifact is staged in the same directory and then atomically renamed into
place.

If validation or staging fails, the previous artifact remains untouched.

## Permissions

The package is written with owner-readable permissions (`0600`).

The portable artifact therefore remains local to the machine unless the member
explicitly moves or shares it.

## Empty export

An empty package is valid.

Exporting an empty package means:

> The member explicitly exported the current continuity envelope, and nothing
> was eligible to carry at that moment.

It does not mean the member has no Work, memory, or relationships.

## What this does not do

The writer does not:

- synchronize;
- watch the filesystem;
- schedule exports;
- call the network;
- write CabinLocalStore;
- transfer member identity;
- alter MAIA cognition;
- ingest into Grokker;
- invent Questions or Transitions;
- remount the runtime automatically.
