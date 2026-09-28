# AIN-AETHER-01R18 — Temporal Evidence Reconciliation Contract

Date: 2026-09-28

Parent: `cd4faae325db6abeadfe5edd9851459bcd4c7a34`

## Purpose

R18 governs disagreement among multiple temporal sources for the same lineage event.

> **Conflicting temporal evidence is a field state, not a defect to hide.**

## Temporal evidence standings

R18 currently distinguishes:

- `instrument_record`;
- `document_record`;
- `human_memory`;
- `coarse_import`;
- `sequence_constraint`.

Standing describes the kind of evidence. It does not automatically determine universal authority.
## Conflict law

When two temporal witnesses materially disagree, R18 creates an explicit conflict record.

The conflict may remain:

> `held_open`

rather than forcing one source to disappear.

## Precision is not authority

A machine clock can be more precise than human memory while still describing a different event, capture moment, or reference frame.

Therefore:

> **greater temporal precision does not by itself erase other legitimate temporal evidence.**

Human memory remains visible even when an instrument timestamp exists.

## Default non-collapse law

Without an explicit reconciliation rule:

- conflicting evidence remains present;
- no temporal winner is selected;
- the explanation names the disagreement;
- false consensus remains false.

## Explicit-rule law

A policy may select one source only when the selection rule is itself explicit and inspectable.

For example:

> prefer an instrument-record exact timestamp for system-recorded event time.

When that rule is used, the selected evidence becomes active for that question, but the conflict history remains preserved.
## Uncontested-evidence law

If exactly one relevant temporal witness exists and no conflict is present, R18 may select it as uncontested evidence.

That is not reconciliation; it is simply use of the only recorded source.

## Conflict-history law

Applying a selection rule does not delete prior disagreement.

Conflict records remain available with:

- evidence refs;
- conflict kind;
- resolution standing;
- selected source;
- explicit rule.

## Explanation law

If conflict remains open, MAIA should say:

> The temporal sources disagree, so the record keeps the conflict open rather than selecting one time as definitive.

If an explicit rule selected one source, MAIA should say that selection occurred because of the rule, not because the other sources vanished.

## Soul-Service law

> **Memory can remain plural where the record is plural.**

The system should not counterfeit coherence merely to produce a cleaner timeline.

## No-build boundary

R18 remains benchmark-only.

No production source ranking.
No runtime timestamp overwrite.
No automatic human-memory demotion.
No hidden conflict collapse.

## Next boundary

> **AIN-AETHER-01R19 — TEMPORAL SOURCE AUTHORITY · QUESTION-SPECIFIC STANDING + “WHICH TIME DO YOU MEAN?” WITHOUT UNIVERSAL WINNER ONLY**

R19 should distinguish event time, system-record time, remembered time, document date, and interpretive period so different temporal questions can legitimately privilege different sources without inventing one globally authoritative timestamp.