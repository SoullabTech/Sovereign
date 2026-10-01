---
room: JARVIS Cabin Explicit Export Request
human_activity: explicitly preparing a chosen Cabin continuity export without yet granting JARVIS the ability to perform the write

surfaces:
  - jarvis-desktop/src/cabin-export-request.js
  - jarvis-desktop/test/cabin-export-request.test.mjs

change_class: architecture

principles:
  - EXPLICIT_ACT — the export request is created only from explicit member/operator selection
  - PREPARE_NOT_EXECUTE — this boundary creates an immutable request envelope; it does not write
  - CONTENT_FREE — JARVIS carries ids, target custody, actor identity, and a digest, never source content
  - H3_5_REMAINS_WRITER — execution must ultimately delegate to H3.5 rather than duplicate export logic
  - NO_NEW_AUTHORITY — preparing a request does not grant filesystem, source, sync, or cognition authority
  - EXACT_REPLAY — confirmation must refer to the exact prepared selection and target

reference_surfaces:
  - docs/design/contracts/jarvis-cabin-context-awareness.md
  - docs/design/contracts/cabin-explicit-connected-export.md
  - docs/programme/JARVIS-ORCHESTRATION-OPERATOR-01_O0_OPERATOR_CONSTITUTION_2026-09-21.md

shared_with_house: explicit choice, provenance, bounded custody, and refusal to infer hidden continuity
distinct_to_room: JARVIS prepares a consequential Cabin export request but does not yet execute the artifact write

experience_verification: >-
  The request envelope contains only explicit ids, an absolute target path,
  a host-derived operator actor, and a deterministic request digest. No source
  content, package contents, network access, or filesystem mutation crosses this boundary.
---

# JARVIS Cabin Explicit Export Request — Architecture Contract

## Gate question

Can JARVIS capture the operator's explicit decision to export selected Cabin
continuity without silently turning that decision into execution authority?

Yes.

The request boundary is:

```
explicit selection
      +
absolute target
      +
host-derived actor
      ↓
immutable export request
      ↓
(separate future execution act)
```

## Request contents

Only these fields are admitted:

- request version;
- actor id;
- absolute target path;
- Work ids;
- Relationship ids;
- Memory ids;
- deterministic request digest.

No Work title, manuscript name, relationship label, memory title/body, member id,
session id, package content, or interpretation is admitted.

## Authority distinction

Creating the request means:

> the operator has explicitly specified what should be exported.

It does **not** mean:

> the export has happened.

No file is written.

No H3.3 writer is called.

No H3.4 source assembly is called.

No synchronization or remount occurs.

## Replay law

A future execution act must receive the exact request digest and revalidate the
request before invoking H3.5.

Changing:

- target path;
- any selected id;
- actor;
- request version

changes the digest and invalidates the prior prepared request.

## Stop boundary

H3.7 does not add:

- IPC;
- UI;
- filesystem writes;
- H3.3 invocation;
- H3.4 invocation;
- sync;
- import;
- automatic export;
- MAIA cognition;
- Grokker ingestion;
- Question/Transition;
- production deployment.

The next boundary is the **explicit execution act**, which must separately establish
the runtime bridge from JARVIS to the canonical H3.5 implementation.
