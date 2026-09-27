# WRITERS-STUDIO-FLAGSHIP-ROADMAP-01 / D5C3 — THEME OCCURRENCE CONTRACT

**Standing:** GOVERNING IMPLEMENTATION CONTRACT · EVIDENCE ADDRESSES ONLY · NO PRESENCE/IMPORTANCE INFERENCE

## Purpose

D5C3 gives an accepted/governed MAIA Themes candidate durable places in the Work.
It does not calculate importance, strength, significance, a presence bar, or a future trajectory.

## Source law

An occurrence may be created only from a frozen developmental reading commissioned under `themes` and an observation admitted under the D5C1 repeated-evidence law.

A Work Theme is not silently created from a reading. Occurrences materialize only when the member performs a governance act on that MAIA candidate.

## Address law

An occurrence stores only:

- opaque Work Theme identity;
- member + manuscript identity;
- frozen draft-section identity;
- optional Unicode code-point range relative to that frozen section;
- source reading identity;
- source observation identity;
- source revision number;
- `maia-observation` provenance;
- creation timestamp.

It stores no manuscript prose.

## Precision law

Where one observation cites both a whole section and one or more passages in that section, the exact passage occurrence supersedes the coarse whole-section occurrence.

Exact duplicate evidence addresses collapse. Semantic similarity never deduplicates occurrences.

## Recoverability law

Occurrence addresses are historical. Their recovery authority is the immutable source reading/revision, not the current mutable manuscript section.

A direct evidence ref absent from the frozen read state is refused. A passage outside the frozen section's code-point range is refused.

## Governance law

Repeated Accept/Rename/Reject/Restore acts over the same MAIA source reuse the same Work Theme and the same occurrence rows.

Rename and Reject never rewrite occurrence coordinates or the source developmental reading.

## Member boundary

Occurrence reads are member + manuscript scoped. Another member receives no occurrence address for the Work.

## Mutation law

Occurrence coordinates are never updated in place. A new reading may derive a new occurrence; historical evidence is not corrected by mutation.

## Explicit non-authority

D5C3 does **not** authorize:

- presence bars;
- recurrence percentages;
- importance/strength scores;
- trajectory language;
- live Themes UI;
- automated merge of two Theme identities;
- textual-entity inference;
- predictions about unwritten sections.

Those remain successor acts.

## Acceptance

D5C3 is accepted only when:

1. pure evidence-to-occurrence tests pass;
2. the disposable DB migration applies forward-only;
3. live DB witness proves exact addresses, idempotence, member scoping and source-reading immutability;
4. D5C2 governance remains green;
5. the frozen V10 controlled presentation remains byte-identical.
