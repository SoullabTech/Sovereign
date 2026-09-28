# AIN-AETHER-CONNECTOR-01R6 — Execution Rehearsal Sink Contract

Date: 2026-09-28

Parent connector R5: `8e7826314e2d21f96561f5e388693c26b7ba5f48`

## Purpose

R6 consumes a valid one-shot execution token into an inert sink before any connector executor exists.

> **A one-shot execution token may be consumed and audited before any connector executor exists; consuming authorization is still not execution.**

## Rehearsal prerequisite

The token must:

- match the exact query reference;
- match the current exact query-plan fingerprint;
- be one-shot;
- remain unconsumed;
- remain execution-eligible;
- be unexpired;
- still carry no connector execution implementation.

## Inert-sink law

A valid token is consumed by:

> `zero_io_rehearsal`

The sink performs no connector operation.

It emits only an audit receipt.

## Receipt custody

The receipt preserves:

- exact token reference;
- exact query reference;
- exact reviewed fingerprint;
- token-consumed standing;
- explicit zero-effect flags.

## Zero-I/O law

Every successful rehearsal records:

- connector I/O attempted: false;
- external network call: false;
- execution occurred: false;
- record read executed: false;
- record count read: 0.

## Zero-side-effect law

The receipt also records:

- persisted: false;
- member-facing delivery: false;
- MAIA prompt mutated: false;
- production authority: false.

## Expiry and drift law

An expired token is refused before rehearsal.

A token whose plan fingerprint no longer matches the current plan is refused before rehearsal.

Neither refusal consumes the token or emits a rehearsal receipt.

## No-executor boundary

R6 still contains no connector executor.

No external source is contacted.
No member record is read.

## Next boundary

> **AIN-AETHER-CONNECTOR-01R7 — CONNECTOR PROGRAMME PRE-EXECUTION CLOSURE · R1–R6 CAPABILITY / MANIFEST / QUERY / REVIEW / TOKEN / REHEARSAL INVARIANTS + ZERO-IO ONLY**

R7 should stop adding connector features and review the complete pre-execution lane as one system before any record-read executor is considered.
