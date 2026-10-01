# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R17 — Canonical Local-Candidate Packet Projection

**Date:** 2026-10-01  
**Parent:** EC1-R16 structured local-native runtime `1f92ba71cd01`  
**Class:** pure authority/packet projection  
**Runtime execution:** NONE

## Purpose

Remove the remaining dual-authority problem between canonical W0/W2 and the legacy Path A packet.

The new `local-candidate-packet-v1.mjs` projects one already-AUTHORIZED W0.v2/W2 envelope into the structured local-native packet shape consumed by Path A.

The packet no longer authors its own permissions.

## Preconditions

Projection requires:

- W0.v2;
- lifecycle state `AUTHORIZED`;
- non-empty W2 authorized-core snapshot;
- non-empty canonical authorizing act;
- exact local-candidate authority:
  - repository read;
  - worktree write;
  - bounded shell;
  - explicit test execution;
  - no network/spend/production/merge/deploy/external disclosure;
- a validated inspection-executable `EC1-VERIFY.v1` plan.

Project-execution verifier plans remain held.

## Projected invariants

The packet preserves exactly:

- Work identity;
- objective;
- canonical/base SHA;
- bounded allowed paths;
- W2 authorizing act;
- authority projection;
- structured verifier plan.

`authorized_acts` / `not_authorized_acts` are derived from W0 authority. `integration_actor` is fixed to JARVIS. Legacy `verification_commands` are empty by construction.

The projector returns a digest of the W2 authorized-core snapshot for later host-decision binding.

## Proof

`local-candidate-packet-v1-proof.mjs`: **9/9 PASS**.

Proves:

- projected packet passes existing Path A packet and authority gates;
- exact identity/objective/base/path/authorizing-act preservation;
- exact permission-envelope equivalence;
- pre-AUTHORIZED projection refusal;
- weaker/read-only authority refusal;
- external/consequential authority refusal;
- project-execution verifier refusal;
- stable authorized-core digest with drift sensitivity;
- no legacy verification command projection.

## Standing

```text
canonical W0/W2 authority source:    ESTABLISHED
structured Path A packet projection: IMPLEMENTED
independent packet authority:        ELIMINATED FOR NEW PATH
legacy packet constructor:           UNCHANGED
runtime dispatch:                     NOT WIRED BY THIS ACT
host decision:                        AVAILABLE / NOT YET CONNECTED
```

The next act may build one canonical-first preparation coordinator: create the local-candidate W0 twin, transition it to BOUNDED/AUTHORIZED, project the structured Path A packet from that same authority, then persist the packet. No execution should occur in that preparation act.
