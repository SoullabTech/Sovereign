---
room: Cabin Context Export
human_activity: explicitly carrying an earned continuity field into a portable artifact without turning export into synchronization or a second source of truth

surfaces:
  - lib/cabin/contextPackageWriter.ts
  - lib/cabin/__tests__/contextPackageWriter.test.ts

change_class: architecture

principles:
  - EXPLICIT_EXPORT — writing occurs only because an explicit caller requests it
  - PROJECTION_NOT_COLLAPSE — the writer composes governed projections and owns none of their identities
  - CUSTODY_CONTINUITY — output remains a valid H2.5 package
  - ATOMIC_ARTIFACT — replacement is staged and renamed within the target directory
  - NO_STEALTH_SYNC — no watcher, timer, network pull, or runtime remount exists

reference_surfaces:
  - docs/design/contracts/cabin-context-package.md
  - docs/design/contracts/cabin-context-mount.md
  - docs/design/contracts/cabin-context-runtime.md

shared_with_house: explicit choice, provenance, member authority, and refusal to turn passage into hidden state
distinct_to_room: this is an explicit artifact-export seam; it is not synchronization, cognition, or source-domain storage

experience_verification: >-
  H3.3 is a pure export boundary. The focused suite verifies absolute-path
  custody, H2.4 validation, deterministic bytes, identity exclusion, atomic
  failure behavior, owner-only artifact permissions, empty-package truthfulness,
  and the H3.2 runtime round trip.
---

# Cabin Context Export — Architecture Contract

## What this surface is for

H3.3 turns already-governed projections into the portable Context Package
artifact consumed by H3.2.

It does not decide what belongs in the package.

The caller supplies the projections. H2.4 decides whether they form a valid
package. H3.3 only persists that already-governed result as an explicit artifact.

## Write lifecycle

```
governed projections
      ↓
H2.4 package composition
      ↓
explicit export invocation
      ↓
same-directory staging file
      ↓
atomic rename
      ↓
portable Context Package
```

The runtime does not automatically remount the result. A later runtime start,
or another explicitly governed mount operation, is required to consume a new
artifact.

## Security and authority

The artifact contains no:

- member id;
- session id;
- browser state;
- package id;
- generated timestamp;
- question;
- transition;
- graph edge;
- relevance score;
- MAIA interpretation.

The writer has no database dependency and does not discover source records.

## Failure law

Validation occurs before staging.

Staging occurs before replacement.

Replacement occurs only after the complete serialized package has been written.

A failed validation or failed rename therefore cannot intentionally replace the
existing artifact.

## Stop boundary

H3.3 does not add:

- automatic synchronization;
- filesystem watching;
- scheduled export;
- network retrieval;
- identity transfer;
- MAIA cognition;
- Grokker ingestion;
- Question or Transition;
- graph synthesis;
- automatic runtime remount;
- production deployment.
