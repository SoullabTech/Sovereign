---
room: Personal Decision — What I Chose
human_activity: Recording the member's actual choice in their own words, seeing that choice as the resolution of the Decision, and reopening later without erasing what was previously chosen.
surfaces:
  - app/decisions/[id]/page.tsx
  - app/decisions/decision-house.module.css
change_class: experiential
principles:
  - DECISIONS-UX-07 — a Personal Decision is resolved only by an explicit member-authored choice
  - DECISIONS-UX-08 — append-only choice/reopen history is the resolution authority
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — Council recommendation cannot populate or stand in for the member's choice
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — resolution remains member-owned and reversible without rewriting history
reference_surfaces:
  - docs/architecture/PERSONAL_DECISION_CHOICE_RESOLUTION_SUBSTRATE_2026-09-27.md
  - docs/architecture/PERSONAL_DECISION_CHOICE_RESOLUTION_IMPLEMENTATION_2026-09-27.md
  - docs/design/contracts/personal-decision-live-room.md
shared_with_house: explicit member authorship, quiet thresholds, durable history, reversible depth, and no automatic interpretation.
distinct_to_room: once a member records a choice, What I chose becomes the most materially stable object in the Decision room. Reopening preserves that earlier choice and returns the room to discernment without treating the past choice as an error.
screenshot_desktop: docs/design/contracts/screenshots/decisions-ux-09-resolved-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/decisions-ux-09-resolved-mobile.png
experience_verification: 2026-09-27 authenticated local witness on isolated localhost:3699 using temporary Personal Decisions. An open Decision with an existing Council recommendation opened with zero consultation or choice POSTs. The member explicitly chose I have chosen; the What did you choose field was blank and did not contain Council recommendation text. Keep what I chose returned HTTP 200 and rendered the exact member-authored choice as the primary What I chose object. Reopen this Decision returned HTTP 200, restored open discernment, and preserved the earlier choice in history. A second choice later produced choice_recorded > reopened > choice_recorded with both exact choices preserved. Legacy complete Decisions rendered a truthful older-resolution state: one was given an exact member-authored choice; another was explicitly reopened. Council recommendation remained unchanged; consultation POSTs remained zero; Threshold Event and memory atom deltas remained zero. Desktop and mobile captures passed; temporary Decisions, choice events, session and member were deleted with residue zero.
---

# DECISIONS-UX-09 — Member-Facing What I Chose + Reopen

## Purpose

Bind the proven member-choice substrate into the Personal Decision room without adding any new Council, memory or crossing behavior.

The human resolution loop is now:

> **Have you chosen?**
>
> **What did you choose?**
>
> member-authored words
>
> **Keep what I chose**

## Open Decision

An open Personal Decision may quietly offer:

> **Have you chosen?**

The room explains that a choice can be kept without consulting Council or accepting an earlier suggestion.

The resolution field starts blank.

It is never prefilled from:

- Council recommendation;
- Council insights;
- prior notes;
- follow-up intention;
- MAIA memory;
- Decision experiences.

## Recording the choice

The member explicitly enters:

> **What did you choose?**

and chooses:

> **Keep what I chose**

The existing UX-08 choice endpoint stores those exact words as a `choice_recorded` event.

After persistence, the room re-reads the Decision rather than inventing a local success state.

## What I chose becomes primary

Once resolved, the material hierarchy changes.

The paper surface now leads with:

> **What I chose**

followed by:

- the exact member-authored choice;
- the factual Soullab recorded date;
- the original Decision question/context as a quieter historical frame.

This avoids the contradiction of visually centering the old question after the member has already chosen.

## Council remains separate

Council material remains available below as perspective already gathered.

The member's choice is not compared against the recommendation.

The room does not say:

- accepted recommendation;
- rejected recommendation;
- aligned / misaligned;
- wise / unwise;
- high-confidence choice.

## Reopen

A resolved Personal Decision offers:

> **Reopen this Decision**

The room tells the member before the act:

> Reopening does not erase this choice.

The governed UX-08 API appends `reopened` and mirrors the Decision back to active.

The earlier choice remains visible under:

> **Choices previously recorded**

with the label:

> Earlier choice · preserved

## Choosing again

After reopening, the member may later author another choice.

The newest choice becomes the current **What I chose** object.

Earlier choices remain historical evidence.

The witness proved:

`choice_recorded > reopened > choice_recorded`

without overwriting the first choice.

## Legacy complete Decisions

A Personal Decision that was marked complete before UX-08, with no choice event, does not pretend Soullab knows the choice.

The room says:

> **Soullab knows this was marked resolved, but not what you chose.**

and explicitly:

> No choice will be inferred from Council, notes, or memory.

The member can then choose either:

- **Record what I chose →**
- **Reopen this Decision**

### Record legacy choice

The What did you choose field is blank.

The member authors the missing resolution themselves.

### Reopen legacy resolution

The Decision returns to active discernment without fabricating a past choice.

## Perspective availability

Current recorded choices and legacy-complete-without-choice states do not offer new Council perspective rounds.

Perspective gathering becomes available again only after the Decision is truthfully open.

This prevents a consultation call from silently changing a legacy `complete` status into `active` and bypassing the governed resolution lifecycle.

## Existing crossings

`Hold this choice today →` remains the existing Decisions → Daily Anchor provenance crossing.

UX-09 does not add the recorded choice text to the crossing payload and does not prefill Daily Anchor.

## No ambient side effects

The full UX-09 witness produced:

- consultation POSTs: 0;
- Threshold Event delta: 0;
- memory atom delta: 0.

Recording or reopening a choice is therefore still a Personal Decision act only.

## Explicitly unchanged

UX-09 does not add:

- new Council behavior;
- recommendation acceptance;
- automatic re-consultation;
- outcome scoring;
- MAIA commentary;
- Threshold Event generation;
- memory promotion;
- Daily Anchor prefill;
- production promotion.

## Exact stop

> **DECISIONS-UX-09 — PASS · MEMBER-AUTHORED WHAT-I-CHOSE + REOPEN EXPERIENCE PROVEN · STOP**

The next clean boundary is:

> **FOUNDER INTEGRATED WITNESS — DECISIONS-UX-02 THROUGH UX-09**

That witness should walk one Personal Decision from threshold through naming, optional perspective, Notice, explicit revisit, member-authored resolution, reopen, and re-resolution as one continuous experience before any promotion toward 3597.