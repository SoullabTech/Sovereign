# AIN-AETHER-01R16 — Witness

Date: 2026-09-28

## Result

R16 establishes explicit temporal precision for Aether lineage.

The witness includes five distinct time standings:

- exact timestamp;
- calendar date;
- coarse period;
- sequence only;
- unknown.

All validate without forcing them into one precision standard.

> **MIXED TEMPORAL PRECISION — PASS**

## Exact timestamp witness

For `machine:v0`, the record preserves:

> 2026-09-28T14:00:00-04:00

R16 may state that exact recorded timestamp.

> **EXACT TIME ONLY FROM EXACT RECORD — PASS**
## Calendar-date witness

For `repair:v1`, only the date is preserved:

> 2026-09-28

R16 answers:

> This reflection was recorded on 2026-09-28; no more precise time is preserved.

and records:

> `clock_time_not_recorded`

> **FALSE CLOCK PRECISION — REFUSED**

## Coarse-period witness

For `repair:v2`, the only time standing is:

> late September 2026

R16 preserves that phrase and records that exact date and time are unknown.

## Sequence-only witness

For `repair:v3`, R16 knows the lineage position but no calendar time.

It can say:

> sequence position 3

and:

> repair:v1 is recorded before repair:v3.

It cannot produce a date or clock time from sequence alone.
## Unknown-time witness

For `repair:v4`, the record explicitly preserves no usable time.

R16 answers:

> The record preserves the reflection but does not preserve when it occurred.

## Missing-metadata negative control

When even the temporal sidecar is absent, R16 says:

> temporal metadata was not recorded

rather than estimating from surrounding nodes.

> **TEMPORAL RECONSTRUCTION — REFUSED**

## Stronger finding

R16 separates two questions that systems often blur:

> **What happened first?**

and:

> **At what time did it happen?**

Ordering evidence can answer the first without answering the second.

That distinction is now executable.

## Verification

R16 temporal-metadata tests: **7 / 7 PASS**

No witness introduced false precision: **PASS**

## Exact next boundary

> **AIN-AETHER-01R17 — TEMPORAL RANGE + UNCERTAINTY INTERVALS · “AROUND WHEN?” WITHOUT COLLAPSING APPROXIMATION INTO EXACT TIME ONLY**

R17 should support approximate start/end ranges while keeping uncertainty visible rather than substituting a midpoint as if it were the recorded time.