# AIN-AETHER-01R19 — Temporal Source Authority Contract

Date: 2026-09-28

Parent: `05ae99fcc6578f51cc9430bb8a548947804c7215`

## Purpose

R19 makes temporal authority question-specific.

> **Temporal authority is scoped to the question, not granted globally to the most precise source.**

## Temporal question kinds

R19 distinguishes:

- `system_record_time`;
- `document_date`;
- `remembered_time`;
- `interpretive_period`;
- `relative_sequence`;
- `unspecified_when`.

Each question may legitimately resolve to a different source for the same lineage event.
## System-record law

“When did the system record it?” privileges instrument-record evidence for that question.

This does not make the instrument record globally authoritative about remembered experience or document date.

## Document-date law

“What date is attached to the journal/document?” privileges document-record evidence.

## Remembered-time law

“When do I remember this happening?” privileges human-memory evidence, even when a more precise instrument clock exists.

## Interpretive-period law

“What period did this belong to?” may privilege coarse historical or interpretive standing rather than exact system time.

## Relative-sequence law

“What happened before or after this?” privileges sequence constraints.

Calendar precision is not required for a sequence answer.
## Ambiguity law

If the user asks only:

> When did this happen?

and multiple temporal standings are present, R19 does not silently choose the most precise source.

It asks:

> Which time do you mean: system-record time, document date, remembered time, interpretive period, or relative sequence?

## No-universal-winner law

Every authority decision carries:

> `universalWinner: false`

A source can be authoritative for one temporal question and secondary or irrelevant for another.

## Missing-authority law

If the requested temporal question has no suitable source, the answer remains unavailable.

For example, a remembered date does not answer:

> When did the server record it?

unless instrument evidence exists.

## Soul-Service law

> **A person's lived time, documented time, and system time may coexist without one being allowed to colonize the others.**

## No-build boundary

R19 remains benchmark-only.

No live clarification UI.
No production temporal router.
No global temporal source ranking.

## Next boundary

> **AIN-AETHER-01R20 — TEMPORAL QUESTION DIALOGUE · MEMBER-FACING CLARIFICATION + SOURCE-SCOPED ANSWER WITHOUT TECHNICAL JARGON ONLY**

R20 should translate question-specific temporal authority into natural MAIA dialogue: clarify ambiguity conversationally, answer from the right source, and disclose conflicting alternatives without exposing internal type names.