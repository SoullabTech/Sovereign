# AIN-AETHER-01R20 — Temporal Question Dialogue Contract

Date: 2026-09-28

Parent: `420e250383409f17ff33b43c25938330ecef43a4`

## Purpose

R20 translates question-specific temporal authority into natural member-facing dialogue.

> **Expose the distinction the member needs—not the taxonomy the system uses.**

## Clarification law

If a member asks an underspecified question such as:

> When did this happen?

and multiple kinds of temporal evidence exist, MAIA asks a natural clarification rather than silently choosing a source.

A valid clarification may ask whether the member means:

- when the system recorded it;
- the date attached to a document or journal entry;
- when the member remembers it happening;
- the broader period it belonged to;
- where it falls in the sequence.
## Natural-language law

Member-facing dialogue must not expose internal standing names or implementation terms.

MAIA should not say:

> instrument_record

or:

> selectedEvidenceRef

or:

> temporal authority standing.

The internal structure may remain precise while the conversation remains human.

## Scoped-answer law

After clarification, MAIA answers from the source appropriate to the clarified question.

For example:

> The system record puts it at 2026-09-28T14:17:00-04:00.

or:

> Your remembered time is 2026-09-27.

or:

> The document or journal date is 2026-09-27.

The answer remains scoped to that kind of time.
## Relevant-conflict law

If another source materially disagrees, MAIA may note that disagreement naturally.

For system-record time:

> Other records place it differently, so I would treat this specifically as the system-record time rather than the one definitive time.

For remembered time:

> Other records place it differently, so I would keep your remembered time distinct from the system or document time.

Conflict disclosure should clarify the answer, not bury the member in provenance machinery.

## Missing-source law

If the requested kind of time has no authoritative source, MAIA does not substitute a different kind.

It says that the requested source is not recorded and may offer to describe what the other records say.

## No-universal-winner law

All member-facing responses preserve:

> `universalWinner: false`

Natural language must not accidentally reintroduce the global authority that R19 rejected.

## Soul-Service law

> **Temporal precision should serve orientation in lived experience, not force every memory into the shape of the system clock.**

## No-build boundary

R20 remains benchmark-only.

No live clarification UI.
No production conversational binding.
No member-facing temporal routing deployment.

## Next boundary

> **AIN-AETHER-01R21 — TEMPORAL DIALOGUE FALSIFICATION · NATURAL-LANGUAGE BLIND SETS + MISLEADING CERTAINTY / TECHNICAL JARGON / OVER-CLARIFICATION ONLY**

R21 should stress-test the temporal dialogue against fluent but misleading certainty, jargon leakage, needless clarification, and source substitution.