# AIN-AETHER-01R17 — Witness

Date: 2026-09-28

## Result

R17 establishes explicit temporal intervals and uncertainty windows for Aether lineage.

The witness covers:

- exact timestamp ranges;
- date ranges;
- coarse human periods;
- sequence-bounded ranges;
- unknown ranges.

All pass without midpoint promotion.

> **TEMPORAL RANGE INTEGRITY — PASS**

## Exact-range witness

The event is bounded between:

> 2026-09-28T14:00:00-04:00

and:

> 2026-09-28T16:00:00-04:00

R17 reports the interval and explicitly preserves:

> `exact_event_time_within_range_unknown`

It does not report 15:00 as the event time.
## Date-range witness

A second event is known only between:

> 2026-09-24

and:

> 2026-09-28

The system preserves:

> `clock_time_within_date_range_unknown`

No synthetic clock time is introduced.

## Coarse-range witness

A third event is recorded only as:

> late September 2026

R17 preserves that phrase and records that exact bounds remain unknown.

## Sequence-bounded witness

A fourth event is known only as:

> after repair:v2 and before repair:v5

R17 states exactly that and adds:

> No calendar time is preserved.

> **SEQUENCE RANGE WITHOUT FALSE CALENDAR TIME — PASS**
## Unknown and missing controls

An explicitly unknown range remains unknown.

A node with no range metadata returns:

> `temporal_range_not_recorded`

rather than being reconstructed from surrounding history.

## Reversed-range negative control

A range whose start occurs after its end is rejected.

> **INVALID TEMPORAL RANGE — REFUSED**

## Stronger finding

R17 gives Aether another useful distinction:

> **around when**

is a legitimate question with an approximate answer.

Approximation becomes unsafe only when it is presented as exact memory.

## Verification

R17 temporal-range tests: **8 / 8 PASS**

Combined Aether + Source Fabric tests at seal: **347 / 347 PASS**

Midpoint promotion: **NONE**

## Exact next boundary

> **AIN-AETHER-01R18 — TEMPORAL EVIDENCE RECONCILIATION · MULTIPLE TIME SOURCES + CONFLICT WITHOUT FORCED COLLAPSE ONLY**

R18 should preserve contradictory temporal witnesses—for example, a runtime clock saying one time while a human memory says another—without silently choosing a winner unless standing rules justify it.