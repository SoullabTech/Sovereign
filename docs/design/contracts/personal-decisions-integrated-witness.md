---
room: Personal Decisions — Integrated Journey
human_activity: Bringing a real choice into view, gathering perspective when wanted, noticing what changes, revisiting perspective from new evidence, choosing in the member's own words, and reopening later without losing history.
surfaces:
  - app/decisions/page.tsx
  - app/decisions/new/page.tsx
  - app/decisions/[id]/page.tsx
  - app/decisions/decision-house.module.css
change_class: experiential
principles:
  - DECISIONS-UX-01 — the Decision belongs to the member and perspective remains provisional
  - DECISIONS-UX-03 — phenomenon and member-authored context precede apparatus
  - DECISIONS-UX-04 — perspective is explicitly invited and never a verdict
  - DECISIONS-UX-05 — lived evidence can accumulate without automatic interpretation
  - DECISIONS-UX-06 — another perspective round begins only from explicit new evidence
  - DECISIONS-UX-08 — resolution is an append-only member-authored choice lifecycle
  - DECISIONS-UX-09 — What I chose becomes primary after resolution and reopen preserves history
reference_surfaces:
  - docs/design/contracts/personal-decisions-room.md
  - docs/design/contracts/personal-decisions-threshold.md
  - docs/design/contracts/personal-decisions-naming.md
  - docs/design/contracts/personal-decision-live-room.md
  - docs/design/contracts/personal-decision-notice.md
  - docs/design/contracts/personal-decision-revisit.md
  - docs/design/contracts/personal-decision-resolution.md
shared_with_house: member-owned authorship, explicit thresholds, reversible depth, exact provenance, material hierarchy, and no automatic meaning-making.
distinct_to_room: Personal Decisions holds one choice through time. Perspective, lived evidence, reconsideration and resolution orbit the member-authored Decision while the actual choice remains the member's act.
screenshot_desktop: docs/design/contracts/screenshots/decisions-integrated-resolved-desktop.png
screenshot_mobile: docs/design/contracts/screenshots/decisions-integrated-final-mobile.png
experience_verification: 2026-09-27 end-to-end authenticated local witness on isolated localhost:3699. One temporary member walked the canonical Personal Decisions threshold, phenomenon-first naming, exact Decision room, first explicit Council perspective, phenomenon-first Notice, explicit perspective revisit from new evidence, member-authored resolution, reopen, second member-authored resolution, and resolved-list return. The old Decision Council dashboard title was absent; secondary context stayed hidden until member words existed; creation returned HTTP 200; opening the Decision caused zero consultation POSTs; first Gather perspectives produced exactly one consultation POST and HTTP 200; Notice persisted exactly one member-authored experience via HTTP 200; Revisit showed the kept evidence and produced one additional consultation POST only after the member authored what was different; resolution field was blank; first choice persisted HTTP 200; reopen persisted HTTP 200 and preserved the earlier choice; second choice persisted HTTP 200. Final durable state: status=complete, iteration_count=2, one member experience, choice history choice_recorded > reopened > choice_recorded with both exact choices preserved. Threshold Event delta 0; memory atom delta 0; temporary Decision, iterations, experience, choice events, session and member were removed with residue zero. localhost:3597 was not modified.
---

# DECISIONS — Integrated Founder-Witness Candidate

## Purpose

This witness asks whether Personal Decisions now behaves as one coherent human act rather than a collection of council features.

The walk was deliberately end-to-end.

## Integrated walk

### 1. Enter Personal Decisions

The room opens with:

> **What choice is asking something of you?**

not with Decision Council machinery.

The legacy Council-dashboard title was absent.

### 2. Bring a decision into view

The member first authored:

- the choice;
- what makes it real now.

Only after those words existed did stakes, time and present state appear.

Creation persisted one Personal Decision and routed directly to its exact room.

### 3. Gather perspectives

Opening the Decision itself generated zero Council POSTs.

The member explicitly chose:

> **Gather perspectives**

That gesture produced one consultation POST and returned the perspective field to the same Decision.

### 4. Notice what changed

The member recorded one lived event after the first perspective round.

Classification appeared only after words existed.

The event persisted through the existing Decision experience substrate.

No Council call was caused by Notice.

### 5. Revisit from new evidence

The kept event appeared as recent evidence.

The member then authored:

> **What is different now?**

and optionally updated their present state.

Only **Gather perspective again** triggered the second Council POST.

The new round became Decision iteration 2; the earlier perspective remained historical.

### 6. Record what I chose

The resolution field was blank.

No Council recommendation or system text appeared in it.

The member authored:

> I chose to leave at the end of the year and prepare the transition with care.

and explicitly kept it.

The room then reorganized around **What I chose**.

### 7. Reopen

The member explicitly reopened the Decision.

The earlier choice remained visible and durable.

The room returned to open discernment instead of erasing the prior resolution.

### 8. Choose again

The member later authored:

> I chose to leave at the end of February instead, because the timing changed after the later conversation.

The new choice became current.

The earlier choice remained preserved.

### 9. Return to Decisions

The resolved Decision appeared under:

> **Choices already made**

rather than among choices still in view.

## Durable final state

Before cleanup, the temporary Decision held:

- personal ownership;
- exact member-authored title and context;
- two Council perspective rounds;
- one member-authored lived moment;
- status `complete`;
- choice history:

`choice_recorded > reopened > choice_recorded`

with both exact choice texts preserved.

## Request discipline

Across the complete walk:

- Council POSTs: **2** — exactly the two explicit perspective gestures;
- Decision-experience POSTs: **1** — exactly the explicit Notice keep;
- choice lifecycle POSTs: **3** — record, reopen, record.

No other foreground state silently invoked those acts.

## Authority chain

The candidate now has a clean direction of authority:

```text
MEMBER'S CHOICE QUESTION
        ↓
MEMBER-AUTHORED CONTEXT
        ↓
OPTIONAL PERSPECTIVE
        ↓
LIVED EVIDENCE
        ↓
OPTIONAL NEW PERSPECTIVE
        ↓
MEMBER-AUTHORED CHOICE
        ↓
RESOLUTION
        ↓
REOPEN IF LIFE CHANGES
```

Perspective can become more intelligent without becoming the chooser.

## Personal / Practice separation remains intact

The integrated candidate modifies only the Personal Decisions route family:

- `/decisions`
- `/decisions/new`
- `/decisions/[id]`
- personal-scope Decision reads/actions.

The practitioner Studio Decisions experience remains a separate product surface.

UX-08 separately witnessed that Practice Decision status behavior remains unchanged.

## No ambient memory side effects

Across the integrated walk:

- Threshold Event delta: **0**;
- memory atom delta: **0**.

No Decision resolution was silently promoted into broader memory.

## 3597 standing

`localhost:3597` remains the accepted House + Changes line.

The Personal Decisions candidate remains isolated on:

`localhost:3699`

## Exact stop

> **DECISIONS INTEGRATED CANDIDATE — BEHAVIORAL / CONSTITUTIONAL WITNESS PASS · AWAITING FOUNDER VISUAL ADJUDICATION**

No additional Personal Decision capability should be added before visual founder witness.

If the integrated room is accepted, the next engineering boundary should be:

> **DECISIONS-PROMOTION-01 — RECONCILE EXACT ACCEPTED DECISIONS CANDIDATE ONTO CURRENT 3597 LINEAGE + LIVE LOCAL WITNESS ONLY**

That promotion must first rebase/reconcile against whatever the House line has gained since the Decisions branch was cut, especially the later House readability, Journal anchoring, and symbolic-continuity commits. It must not replace those with the older branch base.