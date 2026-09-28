# AIN-AETHER-01R16 — Lineage Temporal Metadata Contract

Date: 2026-09-28

Parent: `34094c8f78dffab768126eddd7c6cc2588f0dcb9`

## Purpose

R16 gives Aether lineage explicit temporal metadata without conflating sequence with clock time.

> **Recorded order may answer “before/after”; only recorded time may answer “when.”**

## Temporal precision classes

A lineage event may carry one of five temporal standings:

- `exact_timestamp`;
- `calendar_date`;
- `coarse_period`;
- `sequence_only`;
- `unknown`.

The system must preserve the original precision rather than silently upgrading it.
## Exact-time law

An exact timestamp may be spoken only when an exact timestamp is actually preserved.

If recorded, MAIA may say:

> This reflection was recorded at 2026-09-28T14:00:00-04:00.

## Date-only law

If only a calendar date is preserved, MAIA may state the date and must explicitly avoid implying a clock time.

Example:

> This reflection was recorded on 2026-09-28; no more precise time is preserved.

## Coarse-period law

A coarse period such as `late September 2026` remains coarse.

The system must not derive a specific day or hour from it.

## Sequence-only law

Sequence order may establish:

> A happened before B.

It may not establish:

> A happened at 2:00 PM.

unless an independent time record supports that precision.
## Unknown-time law

If the lineage contains the node but no temporal metadata, MAIA must say so.

If the temporal record explicitly has `unknown` precision, MAIA may say:

> The record preserves the reflection but does not preserve when it occurred.

Unknown time is not a defect to fill with inference.

## Temporal-source law

Every temporal record carries a `sourceRef`.

Examples may include:

- runtime clock;
- review date;
- human period note;
- lineage order;
- legacy import.

The source of time is part of temporal provenance.

## Validation law

Temporal metadata validates:

- unique temporal refs;
- unique sequence indexes;
- valid node references;
- exact timestamps are valid timestamps;
- date records have a date;
- coarse records have a period;
- sequence-only records do not smuggle calendar time;
- unknown records do not smuggle precision.

## Soul-Service law

> **Time should orient the story, not counterfeit certainty about it.**
## No-build boundary

R16 remains benchmark-only.

No runtime timestamp migration.
No production lineage persistence.
No retroactive timestamp synthesis.
No timezone inference beyond preserved source data.

## Next boundary

> **AIN-AETHER-01R17 — TEMPORAL RANGE + UNCERTAINTY INTERVALS · “AROUND WHEN?” WITHOUT COLLAPSING APPROXIMATION INTO EXACT TIME ONLY**

R17 should support bounded temporal ranges and approximate intervals while preserving explicit uncertainty and refusing false midpoint precision.