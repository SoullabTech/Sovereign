# AIN-AETHER-01R17 — Temporal Range + Uncertainty Contract

Date: 2026-09-28

Parent: `adf888699013bfbe73825a10503d049ec20ea60b`

## Purpose

R17 extends lineage time from point precision into explicit intervals and uncertainty windows.

> **Approximation may narrow uncertainty; it may not masquerade as precision.**

## Range precision classes

R17 supports:

- `exact_range`;
- `date_range`;
- `coarse_range`;
- `sequence_bounded`;
- `unknown`.

Each class preserves its own uncertainty instead of being collapsed into a representative timestamp.
## Exact-range law

A bounded clock interval may establish that an event occurred sometime between two timestamps.

It does not establish that the event occurred at the midpoint.

Example:

> between 14:00 and 16:00

must not become:

> at 15:00

unless a separate exact-time record exists.

## Date-range law

A date interval may preserve a bounded calendar window while leaving clock time unknown.

The system must not convert a four-day window into a specific date merely for convenience.

## Coarse-range law

Human expressions such as:

> late September 2026

remain valid coarse temporal evidence.

They are not converted into exact dates unless additional evidence supports the conversion.

## Sequence-bounded law

A range may be known only relationally:

> after repair:v2 and before repair:v5

This is a valid temporal constraint.

It does not imply any calendar date or duration.
## Unknown-range law

If no usable range exists, Aether preserves that uncertainty.

Unknown is not replaced by an inferred interval from nearby events.

## Midpoint prohibition

No temporal range may be summarized as its midpoint and then presented as the event time.

Every explanation carries:

> `midpointPromoted: false`

## Validation law

R17 rejects:

- reversed bounds;
- missing required range bounds;
- sequence-only ranges with hidden calendar precision;
- unknown ranges carrying concealed temporal detail;
- duplicate range references.

## Soul-Service law

> **The field may remember roughly without pretending it remembers exactly.**

Approximate memory is still meaningful memory when its uncertainty remains visible.

## No-build boundary

R17 remains benchmark-only.

No production range persistence.
No automatic midpoint selection.
No inferred timestamp backfill.

## Next boundary

> **AIN-AETHER-01R18 — TEMPORAL EVIDENCE RECONCILIATION · MULTIPLE TIME SOURCES + CONFLICT WITHOUT FORCED COLLAPSE ONLY**

R18 should test what happens when two legitimate sources disagree about when a reflection occurred, preserving conflict rather than silently choosing one.