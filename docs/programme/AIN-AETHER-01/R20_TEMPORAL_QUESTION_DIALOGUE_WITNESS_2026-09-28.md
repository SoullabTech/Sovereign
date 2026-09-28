# AIN-AETHER-01R20 — Witness

Date: 2026-09-28

## Result

R20 establishes natural-language temporal clarification and source-scoped answers.

## Ambiguous-question witness

Question:

> When did this happen?

Because multiple temporal sources exist, MAIA responds:

> Do you mean when the system recorded it, the date attached to a document or journal entry, when you remember it happening, the broader period it belonged to, or where it falls in the sequence?

No source is selected before clarification.

> **NATURAL TEMPORAL CLARIFICATION — PASS**

## System-record witness

For system-record time, MAIA selects the runtime clock and says:

> The system record puts it at 2026-09-28T14:17:00-04:00.

Because other sources differ, the dialogue also preserves scope rather than calling this the definitive event time.
## Remembered-time witness

For remembered time, MAIA selects the member-memory source even though a more precise system timestamp exists.

The response says:

> Your remembered time is 2026-09-27.

and keeps that distinct from system or document time.

> **MEMBER MEMORY PRESERVED IN DIALOGUE — PASS**

## Document and period witnesses

Document-date dialogue selects the journal date and names it as the document or journal date.

Interpretive-period dialogue returns:

> late September 2026

without converting it into a date.

Relative-sequence dialogue returns:

> after repair:v0 and before repair:v2

without pretending to know calendar time.

## Missing-source control

When only remembered time exists and the member asks for system-record time, MAIA says:

> I don't have a recorded source for when the system recorded it.

It does not substitute the remembered date.

> **SOURCE SUBSTITUTION — REFUSED**
## Jargon witness

Every generated response carries:

> `exposesInternalTaxonomy: false`

and validation rejects internal terms appearing in member-facing speech.

> **INTERNAL TEMPORAL TAXONOMY HIDDEN — PASS**

## Stronger finding

R20 proves that internal epistemic sophistication does not require conversational complexity.

The system can keep a detailed temporal ontology while MAIA simply asks:

> Which kind of time do you mean?

That is the correct membrane between architecture and relationship.

## Verification

R20 temporal-question-dialogue tests: **6 / 6 PASS**

Ambiguous clarification: **PASS**

Question-scoped answers: **PASS**

Jargon leakage: **NONE**

Universal winner: **NONE**

## Exact next boundary

> **AIN-AETHER-01R21 — TEMPORAL DIALOGUE FALSIFICATION · NATURAL-LANGUAGE BLIND SETS + MISLEADING CERTAINTY / TECHNICAL JARGON / OVER-CLARIFICATION ONLY**

R21 should test the conversation itself for subtle failures: authoritative phrasing, unnecessary clarification when only one source exists, accidental taxonomy exposure, and answers that quietly substitute the wrong temporal source.