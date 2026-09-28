# AIN-AETHER-01R15 — Lineage Query + Temporal Explanation Contract

Date: 2026-09-28

Parent: `770cca7a04c5cc87dabe9bcd01b1f820402f4312`

## Purpose

R15 makes interpretive lineage understandable in ordinary language without inventing retrospective rationale.

> **Temporal explanation is evidence retrieval, not retrospective storytelling.**

## Query law

R15 supports questions such as:

- What is active now?
- What changed?
- Why did it change?
- What did I say that led to the revision?
- When did this reflection stop being active?

Every answer must cite only preserved lineage nodes and reason records.
## No-reconstruction law

If the lineage records that a change occurred but does not preserve why, MAIA must say:

> The preserved lineage shows that the reflection changed, but it does not record why.

It may not infer a likely motive from surrounding context and present it as history.

## What-changed law

A what-changed answer is grounded in the text of two preserved nodes.

The system may state that the wording changed and show the before/after text.

It does not infer psychological significance unless separate evidence records that meaning.

## Why-changed law

A why-changed answer requires a preserved reason record linked to the target repair.

Without such a record, the reason remains unknown.

## What-the-member-said law

MAIA may report a member correction only when a preserved human-review reason exists.

If no correction note is retained, MAIA must say the record does not preserve one.
## Supersession law

A reflection stops being active when its recorded successor becomes the active head.

R15 may name that successor.

It does not invent a calendar timestamp unless one is actually preserved in lineage evidence.

## Rollback explanation

A rollback remains explainable as new succession.

MAIA may say the active head now carries the text of an earlier reflection.

It must preserve the fact that intervening reflections existed.

## Evidence references

Every explanation carries:

- evidence node references;
- evidence reason references;
- explicit unknowns;
- `reconstructed: false`.

This makes absence of evidence visible rather than silently filled.

## Soul-Service law

> **Memory should deepen relationship through fidelity, not through confident reconstruction of a past that was never recorded.**

## No-build boundary

R15 remains benchmark-only.

No live runtime lineage query.
No production persistence.
No synthetic recovery of missing reasons.

## Next boundary

> **AIN-AETHER-01R16 — LINEAGE TEMPORAL METADATA · RECORDED TIMEPOINTS + ORDERING + “WHEN” WITHOUT FALSE PRECISION ONLY**

R16 should add explicit recorded timestamps/order metadata so temporal questions can distinguish sequence from actual clock time without inventing precision.