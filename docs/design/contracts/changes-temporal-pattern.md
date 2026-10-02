---
room: Changes — Temporal Pattern View
human_activity: Looking across the moments a member has already kept in one Change to notice recurrence without turning recurrence into interpretation.
surfaces:
  - components/maia/changes/ChangeRoom.tsx
  - components/maia/changes/change-room.module.css
change_class: experiential
principles:
  - CHANGES-UX-01 — every abstraction returns to lived experience; time is constitutive
  - CHANGES-UX-02 — existing Change moments remain the source of truth
  - RELATIONSHIPS-UX-01 — distinguish member evidence from observed structure and MAIA hypothesis
  - MAIA_OATH — no hidden interpretation or authority
reference_surfaces:
  - docs/design/contracts/changes-living-room.md
  - docs/design/contracts/changes-room-live-shell.md
  - docs/architecture/RELATIONSHIPS-UX-01.md
shared_with_house: provenance, explicit epistemic boundaries, member-grounded evidence, quiet field composition, and no automatic meaning-making.
distinct_to_room: Changes can widen from a single moment into a longitudinal field. The view shows exact kept moments and simple observable recurrence while withholding interpretation.
screenshot_desktop: docs/design/contracts/screenshots/changes-ux-06-pattern-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/changes-ux-06-pattern-mobile.png
experience_verification: 2026-09-27 authenticated local witness on isolated port 3697 using a temporary member-owned Change with five authored moments. Opening See what has been recurring caused zero POST requests and did not change studio_changes.updated_at or the change_experiences row count. The view rendered the exact authored moments in time and surfaced exact recurring member-authored words such as honesty and silence only when those words appeared in at least two distinct kept moments. Repeated experience kinds were counted directly from existing experience_type values. Desktop and mobile captures passed; temporary records were removed with residue zero.
---

# CHANGES-UX-06 — Temporal Pattern View as Member-Grounded Evidence Only

## Purpose

Allow a member to widen attention across time without allowing Soullab or MAIA to decide what the pattern means.

The opening gesture is:

> **See what has been recurring →**

The view is a way of seeing the member's own material again.

It is not analysis in the strong sense, and it is not yet MAIA synthesis.

## Epistemic layers

UX-06 binds only the first two layers:

1. **Member evidence** — exact moments the member kept.
2. **Observed structure** — simple recurrence that can be mechanically demonstrated from those moments.

It does not open:

3. MAIA hypothesis;
4. member-ratified meaning;
5. gestalt interpretation.

Those remain separate acts.

## Temporal field

The primary field shows:

- each kept moment;
- its existing date;
- its existing experience kind;
- the member's exact authored content.

The points are arranged longitudinally.

The field does not show:

- progress;
- completion;
- improvement;
- decline;
- predicted direction;
- developmental stage;
- sentiment score.

The final moment may be marked as the current edge of the recorded sequence, not as a destination.

## Observable recurrence

The evidence rail may show only recurrence that can be traced directly to existing data.

### Words that reappear

A word may be shown only when:

- it appears in at least two distinct kept moments;
- it survives a small neutral stop-word filter;
- it is displayed as the member's own lexical recurrence;
- only the number of distinct moments in which it appeared is shown.

Example:

> **honesty ×3**

This means exactly:

> the word “honesty” appeared in three different moments the member kept.

It does not mean honesty is the central issue, an archetype, a diagnosis, or the true pattern.

### Kinds of moments that recur

Existing `experience_type` values may be counted directly.

Example:

> **Reflection 2**

means only that two kept moments were explicitly stored as reflections.

No significance is assigned to the count.

## Meaning remains open

The view carries an explicit boundary:

> **A recurrence is evidence that something appeared more than once. It is not yet an explanation of why.**

This distinction is load-bearing.

Observed recurrence must never quietly become MAIA interpretation merely because it has been rendered visually.

## No mutation

Opening the Pattern view performs no write.

The witness verified:

- zero POST requests on open;
- unchanged `studio_changes.updated_at`;
- unchanged `change_experiences` count.

The view is derived entirely from the existing authenticated Change read.

## No MAIA invocation

MAIA does not run when Pattern opens.

No model call is required to:

- order existing moments;
- count existing types;
- identify exact repeated words.

This keeps evidence distinct from hypothesis.

## Mobile

On mobile the longitudinal field becomes one vertical path.

Evidence sections stack beneath it.

The same epistemic distinction remains visible; mobile does not collapse recurrence into badges or a dashboard summary.

## Explicitly unbound

CHANGES-UX-06 does not bind:

- semantic similarity;
- embeddings;
- thematic clustering;
- sentiment analysis;
- “important moment” ranking;
- causal inference;
- developmental stage inference;
- MAIA pattern interpretation;
- generated summaries;
- member ratification workflow;
- automatic memory promotion.

## Exact stop

CHANGES-UX-06 stops with a real temporal evidence view and no interpretation.

The next clean act is:

> **CHANGES-UX-07 — MEMBER-RATIFIED MEANING + MAIA HYPOTHESIS SEPARATION ONLY**

That act should permit MAIA to offer a clearly marked hypothesis about one observed recurrence, then require the member to recognize, amend, reject, or leave it unresolved before any meaning can become part of the Change.
