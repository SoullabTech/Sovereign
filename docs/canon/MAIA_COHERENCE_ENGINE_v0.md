---
declared_status: candidate
standing: draft
last_review: 2026-06-20
---

# MAIA Coherence Engine — v0

> Status: **v0 (capture only)** · Route: `/maia/calendar` · Doctrine doc, not a product spec.
> Governed by [MAIA Canon v1.1](./MAIA_CANON_v1.1.md) and the [MAIA Oath](./MAIA_OATH.md).

## The orienting question

The first question is **not** "how do we manage tasks?"

The first question is: **"How does MAIA help someone become present because the loose ends have been safely held?"**

This document exists so that, as calendar and executive-function capability grows, it grows *downward from coherence* rather than *outward into productivity*.

## Doctrine

1. **MAIA is not a productivity app.** It does not optimize throughput, measure output, or compete for the user's attention with streaks, badges, or nudges. A coherence surface that made a day feel *busier* would be a failure, not a feature.

2. **Productivity is allowed only when it supports coherence.** Calendar, capture, and task-like structure are permitted strictly to the extent they help a person stay present, responsible, and whole. The moment a capability serves engagement or completeness-for-its-own-sake instead of the person's coherence, it is out of scope.

3. **Calendar and tasks serve presence, responsibility, and executive function** — not the reverse. The aim is to relieve the low-grade cognitive load of *holding* things in mind, so attention can return to what is actually in front of the person. (Holding the loose end is the relief; "getting it all done" is not the metric.)

4. **Natural-language capture precedes structured action.** A person should be able to set something down in their own words *before* any system decides what it "is." Structure (dates, events, reminders) is earned later, by the member's choice — never imposed by inference at the moment of capture.

5. **The Marran Doctrine — don't rush from idea to build.** Clarify purpose, reduce scope, test lightly. Each increment must justify its *presence*, not merely its usefulness (see [Attention Doctrine](./MAIA_ATTENTION_DOCTRINE.md)). We do not build the productivity app we can imagine; we build the smallest coherence surface that earns its next step from real use.

6. **Capture is not commitment.** Nothing becomes an obligation merely because it was captured. Capture is permission to *let go*, not a promise to act. A held item may carry no classification at all; classification is optional — and when it happens, it is a later, *consented* act, never inferred at the moment of capture. Commitment (a calendar event, a reminder, a task) is a separate, deliberate act taken by the member. This is what keeps the surface from quietly becoming another to-do list.

## "Held" — the primitive

Most software assumes `thought → task`. People don't work that way. The real progression is **thought → held → understood → (maybe) action**. Some held things become calendar events; some become reminders, conversations, or journal entries; some are never anything — speaking them aloud reveals they didn't matter. *Held* is the missing primitive: a trusted place to set something down that does **not** convert it into work.

So this is an **attentional threshold**, not a calendar feature. The functional sequence is:

> Arrival → Unload → Held → Orient → Prioritize → Act → Reflect → Integrate

Capture (Arrival / Unload / Held) comes first and stays sacred; routing comes later, and only by invitation. The calendar is therefore **one possible destination, not the center** — alongside reminder, task, journal, conversation, waiting-for, someday, reference.

This pattern — *attention becomes available once unresolved concerns are externalized into a trusted container before deeper work begins* — recurs across contemplative practice, psychotherapy, coaching, and even aviation checklists. MAIA arrives at it independently rather than borrowing it; that convergence is the warrant for naming it.

**The success metric follows.** A coherence engine optimizes not commitments-completed but *cognitive availability* — "how present is this person to what actually matters?" Only the second objective is ours.

**The guardrail (what must never happen at capture):** the first act of the system is **custody, not inference**. MAIA may later help classify, route, or reflect — but only as an invited, consented crossing, never automatically on intake. Interpretation at step one is exactly what this surface forbids.

## What v0 actually is (earned, not aspirational)

A single direct surface a member can open without navigating through Studio — usable as a mobile home-screen entry point.

- **One field:** *"What are you still carrying?"* — freeform natural-language capture, arrival-framed (not today-bound).
- **Stored verbatim.** No AI parsing, no entity extraction, no calendar-event creation, no reminders. The text is held exactly as written.
- **Optional, member-chosen classification:** `today` · `later` · `time_sensitive` · `ongoing` ("keep an eye on") — or none at all (held, unsorted). A *disposition*, never required, never a priority/status, never AI-inferred (Doctrine 6); capture works with nothing selected.
- **Reversible release.** Marking a capture handled sets `released_at`; it can be restored. Nothing is destroyed by a tap.
- **Member-scoped, consent-aligned.** Captures belong to the member; every read and write is scoped to their ID. No cross-member aggregation, no pattern-formation, no synthesis in v0.

### Data model

`coherence_captures` (migrations `database/migrations/20260619000001_coherence_captures.sql` + `…20260625000001_coherence_captures_optional_classification.sql`):
`id`, `member_id` → `members(id)`, `capture_text`, `classification` (**nullable** CHECK enum; NULL = held/unsorted), `released_at` (NULL = held), `created_at`, `updated_at`.

### API

`/api/maia/coherence/captures` — `GET` (held captures; `?include=released` for all), `POST` (create), `PATCH?id=` (release / restore). Member resolved via `getMemberIdFromRequest` (header on iOS, cookies on web).

## Explicitly out of scope for v0

No AI parsing of captures · no calendar-event creation · no reminders/alarms · no Google/Apple sync · no native deep-links · no notifications · no cross-member or pattern intelligence. These are **next-step placeholders only** (below) — named so the boundary is legible, not because they are planned-imminent.

## Next steps (placeholders — each requires its own scoped, lightly-tested increment)

- Natural language → calendar event (member-confirmed, propose-only)
- Reminders / alarms
- Google / Apple calendar sync
- Travel-time-aware alerting
- Meeting synthesis
- Marran Doctrine innovation assistant

Each of these crosses from *holding* into *acting*. None ships without passing the Attention Doctrine and Sovereignty Invariant checks, and none collapses the v0 boundary above (capture precedes structure; structure is the member's choice).
