---
room: Cabin Context Mount
human_activity: holding a validated continuity package inside the local Cabin runtime without turning it into persistent source state

surfaces:
  - lib/cabin/contextMount.ts
  - lib/cabin/__tests__/contextMount.test.ts

change_class: architecture

principles:
  - EPHEMERAL_CONTEXT — the mounted package is runtime state, not a source of truth
  - PROJECTION_NOT_COLLAPSE — source authorities remain outside the mount
  - NO_STEALTH_MEMORY — the mount does not persist, infer, or create memory
  - OFFLINE_CUSTODY — only the strict H2.5 parser can admit the package
  - DEFENSIVE_COPY — callers cannot mutate the mounted package by reference

reference_surfaces:
  - docs/design/contracts/cabin-context-package.md
  - docs/design/contracts/AIN-CABIN-RUNTIME-01.md
  - lib/cabin/contextPackage.ts

shared_with_house: provenance, member scope, explicit authority, and refusal to turn movement into hidden state
distinct_to_room: this is the local runtime holding seam for a validated package; it is not a database, provider, or cognition context

experience_verification: >-
  H3.1 is a pure runtime seam. Ten focused tests cover custody admission,
  source-read-only behavior, browser/network exclusion, absence of current
  state, defensive copies, lifecycle isolation, clear, and empty-package
  mounting.
---

# Cabin Context Mount — Architecture Contract

## What this surface is for

The mount holds one validated Context Package during a Cabin runtime.

It lets the runtime see continuity without turning that continuity into a new
canonical store.

## Lifecycle

```
serialized package
      ↓
H2.5 strict custody parser
      ↓
defensive runtime copy
      ↓
Cabin Context Mount
      ↓
runtime reads
      ↓
clear / runtime end
```

There is no automatic persistence step.

## It cannot

- write CabinLocalStore;
- write browser storage;
- call the network;
- infer current Work;
- create questions or transitions;
- create graph edges;
- reinterpret memory;
- alter source projections.

## Empty is valid

An empty package can be mounted. This is a truthful state, not an error.

## Stop boundary

H3.1 adds no Desktop wiring, API route, MAIA cognition, UI, sync, or
persistence.
