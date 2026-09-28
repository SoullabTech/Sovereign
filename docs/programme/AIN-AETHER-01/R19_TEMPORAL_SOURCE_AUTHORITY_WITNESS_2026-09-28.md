# AIN-AETHER-01R19 — Witness

Date: 2026-09-28

## Result

R19 establishes question-specific temporal authority across the same plural evidence field.

The witness contains:

- runtime clock;
- journal date;
- member memory;
- coarse historical period;
- sequence constraint.

Different questions correctly select different sources.

## System-record witness

Question:

> When did the system record it?

Selected source:

> `clock:1`

> **SYSTEM-RECORD AUTHORITY — PASS**

## Remembered-time witness

Question:

> When do I remember it happening?

Selected source:

> `memory:1`

even though an exact machine clock is present.

> **HUMAN MEMORY AUTHORITY FOR REMEMBERED-TIME QUESTION — PASS**
## Document and period witnesses

Document-date question selects:

> `journal:1`

Interpretive-period question selects:

> `period:1`

Relative-sequence question selects:

> `sequence:1`

Each source is authoritative only for its question.

## Ambiguous question witness

Question:

> When did this happen?

Because multiple temporal standings are present, R19 selects:

> **NONE**

and requires clarification.

> **AMBIGUOUS TEMPORAL QUESTION — CLARIFICATION REQUIRED**

## No universal winner

Across every question-specific decision:

> `universalWinner: false`

The exact machine timestamp never becomes globally authoritative merely because it is the most precise.

## Missing-authority control

A node with human-memory evidence but no instrument record is asked for system-record time.

R19 returns no selected source.

> **WRONG-SOURCE SUBSTITUTION — REFUSED**
## Stronger finding

R19 gives Aether a temporal equivalent of perspective.

The same event can legitimately have:

> a system time

> a document date

> a remembered time

> an interpretive period

> a sequence position

without requiring those to collapse into one supposedly final timestamp.

## Verification

R19 temporal-source-authority tests: **7 / 7 PASS**

Question-specific selection: **PASS**

Ambiguity clarification: **PASS**

Universal temporal winner: **NONE**

## Exact next boundary

> **AIN-AETHER-01R20 — TEMPORAL QUESTION DIALOGUE · MEMBER-FACING CLARIFICATION + SOURCE-SCOPED ANSWER WITHOUT TECHNICAL JARGON ONLY**

R20 should make this usable conversationally: MAIA should say things like “Do you mean when the system recorded it, or when you remember it happening?” rather than exposing internal evidence-standing labels.