# ENTRY-05-HARNESS-CLEAR-01 — execution record

Date: 2026-09-16
Base frontier: `e810d0f5a1be12018c110229e4114d4e45e9a249`
Device: `A0736AC8-793B-516F-AC72-C076DB6CEE38`
Evidence stamp: `20260916T040924Z`

## Correction of the 04:03Z read

The Mac-side `ps` read at `2026-09-16T04:03:17Z` was outside the jurisdiction of the bound iPhone harness subjects. It cannot establish `VoiceKernelHarness = 0`, disappearance, or process-set drift. The resulting STOP statement is superseded on that factual point.

The first corrected device-side `devicectl` read found the exact bound three-subject set still alive:

- VPIO-02 — PID `4025` — container `E3B88028-A10F-46B1-AB27-CF0A1F83FB78`
- VPIO-01 — PID `4118` — container `6A2E406B-D1B8-43A4-92F3-29D50333AF19`
- K00 — PID `4119` — container `0B07D423-97E7-4196-BC1C-C69C96F994BE`

## Executed act

`ENTRY-05-HARNESS-CLEAR-01` used subject-specific native device termination only. The full device harness set was re-read and matched immediately before each termination. Any mismatch would have stopped the act before the next termination. No SIGKILL escalation was used.

Sequence and observed totals:

1. PRE: `3` — exact `4025 / 4118 / 4119` set.
2. JUST-BEFORE VPIO-02: `3`; terminate PID `4025` by SIGTERM.
3. MID: `2` — exact `4118 / 4119` set.
4. JUST-BEFORE VPIO-01: `2`; terminate PID `4118` by SIGTERM.
5. MID: `1` — exact `4119` set.
6. JUST-BEFORE K00: `1`; terminate PID `4119` by SIGTERM.
7. POST: `0` VoiceKernelHarness processes.

No SID launch, install, sample, ENTRY batch, source population, KERNEL-00 acceptance, BRIDGE-01, migration, or replacement harness act was executed.

## Evidence integrity

The first seal was self-inclusive because `SHA256SUMS` existed before `find` enumerated the directory. It is preserved as `SHA256SUMS.self-inclusive.invalid`; all substantive files verified against it, while its self-entry necessarily failed. A corrected seal was generated outside the evidence directory and moved into place. Corrected `SHA256SUMS` SHA-256:

`156586bfa364da1086d5355a44ba4a2f52a861bbd7bf51d94cc62a3f07e35bda`

The corrected seal verifies every preserved evidence file, including the invalid first-seal artifact.

## Standing

`ENTRY-05-HARNESS-CLEAR-01`: **PASS · SPENT**.

The zero-harness precondition has been proved for this act's POST boundary only. This record grants no ENTRY-05 preflight or batch authority. Any later act requiring zero must perform its own required read under its own pin.
