# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R25 — Runtime W4 Completion

**Date:** 2026-10-01  
**Parent:** EC1-R24 writer admission `7265f9af844c`  
**Class:** bounded runtime completion wire  
**Lifecycle advance:** NONE

## Change

The host-decided local-candidate execution path now persists a successful `VERIFIED` Path A run into canonical W4 through the already-admitted R23 persistence seam.

The completion wire:

1. waits for `MECH.runWorkUnit(...)` to return;
2. proceeds only when `submitted=true`, top-level outcome is `VERIFIED`, and the authoritative run state is `VERIFIED`;
3. reads the exact durable-result bytes Path A wrote;
4. hashes those exact bytes for the result artifact digest;
5. re-reads the current canonical envelope and derives the R23 stale-base digest;
6. calls `persistHostDecidedLocalCandidateV1(...)` with the authoritative run, immutable durable result, result ref, and byte digest;
7. surfaces persistence success or refusal separately from the Path A run truth.

## Truth preservation

A W4 persistence refusal does **not** rewrite a VERIFIED Path A run as failed.

The response preserves:

- `outcome: VERIFIED`;
- the original `run.state: VERIFIED`;
- the exact execution decision;
- a separate `completion_status: W4_PERSISTENCE_REFUSED` and reason.

Missing/unreadable durable-result evidence is a completion refusal. No result is reconstructed or fabricated from top-level run fields.

Non-VERIFIED runs do not invoke W4 persistence.

## Proof

`local-candidate-runtime-w4-r25-proof.mjs`: **5/5 PASS**.

Proves:

- a VERIFIED host-decided run persists exact Path A evidence into W4;
- canonical lifecycle remains `EXECUTING` after persistence;
- non-VERIFIED runs do not invoke W4 persistence;
- persistence refusal preserves VERIFIED Path A truth while surfacing completion failure;
- missing durable result never becomes fabricated W4 evidence;
- the completion wire contains no lifecycle advance.

Regression wall:

- R19/R21 host flow: **9/9 PASS**;
- R23 persistence: **6/6 PASS**;
- R24 writer admission: **5/5 PASS**;
- R4/R22 combined projection: **14/14 PASS**.

## Standing

```text
host-decided structured execution:   WIRED
Path A VERIFIED truth:                PRESERVED
W4 runtime projection/persistence:    WIRED
stale/conflict refusal:               PRESERVED
canonical lifecycle after W4 write:   EXECUTING
EVIDENCE_READY transition:            NOT YET ADMITTED
```

The next act is a lifecycle admission census: determine whether the W4 records produced by this path satisfy the existing W5/W2 requirements for `EVIDENCE_READY`, without creating a local-candidate-specific completion shortcut.
